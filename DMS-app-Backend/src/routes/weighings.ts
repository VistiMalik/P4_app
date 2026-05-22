import { FastifyPluginAsync } from "fastify";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { z } from "zod";

const createWeighingBodySchema = z.object({
  materialId: z
    .string()
    .min(1, "Informe o material coletado."),
  weightGrams: z
    .union([z.number(), z.string()])
    .transform((value) => Number(value))
    .pipe(
      z
        .number({
          invalid_type_error: "Peso inválido."
        })
        .positive("O peso precisa ser maior que zero.")
    ),
  deviceExternalId: z
    .string()
    .trim()
    .min(1)
    .optional(),
  bagFilled: z.boolean().optional()
});

type MeasurementWithMaterial = Prisma.MeasurmentsGetPayload<{
  include: { materialRef: true };
}>;

async function resolveMaterial(identifier: string) {
  const trimmed = identifier.trim();

  const numericId = (() => {
    try {
      return BigInt(trimmed);
    } catch {
      return null;
    }
  })();

  if (numericId !== null) {
    const byId = await prisma.materials.findUnique({
      where: { materialId: numericId }
    });
    if (byId) {
      return byId;
    }
  }

  return prisma.materials.findFirst({
    where: {
      materialName: {
        equals: trimmed,
        mode: "insensitive"
      }
    }
  });
}

function gramsToKilogramsDecimal(grams: number) {
  return new Prisma.Decimal(grams).div(1000);
}

function measurementToDto(measurement: MeasurementWithMaterial) {
  const weightKg = new Prisma.Decimal(measurement.weightKg);
  const weightGrams = weightKg.mul(1000).toNumber();

  return {
    id: measurement.weightingId.toString(),
    userId: measurement.wastepicker.toString(),
    materialId: measurement.material.toString(),
    materialName: measurement.materialRef?.materialName ?? "Material",
    weightGrams: Math.round(weightGrams),
    createdAt: measurement.timeStamp.toISOString()
  };
}

export const weighingsRoutes: FastifyPluginAsync = async (server) => {
  server.get(
    "/me",
    {
      preHandler: [server.authenticate]
    },
    async (request) => {
      const workerId = BigInt(request.user.userId);

      const measurements = await prisma.measurments.findMany({
        where: {
          wastepicker: workerId
        },
        include: {
          materialRef: true
        },
        orderBy: {
          timeStamp: "desc"
        },
        take: 100
      });

      return measurements.map(measurementToDto);
    }
  );

  server.post(
    "/",
    {
      preHandler: [server.authenticate]
    },
    async (request) => {
      const workerId = BigInt(request.user.userId);
      const body = createWeighingBodySchema.parse(request.body);

      const worker = await prisma.workers.findUnique({
        where: { workerId },
        select: {
          workerId: true,
          cooperative: true
        }
      });

      if (!worker?.cooperative) {
        throw server.httpErrors.badRequest(
          "Cooperativa não encontrada para o trabalhador autenticado."
        );
      }

      const material = await resolveMaterial(body.materialId);

      if (!material) {
        throw server.httpErrors.notFound("Material não encontrado.");
      }

      let device = await prisma.devices.findFirst({
        where: { cooperativeId: worker.cooperative }
      });

      if (!device) {
        device = await prisma.devices.create({
          data: {
            cooperativeId: worker.cooperative
          }
        });
      }

      const rows = await prisma.$queryRawUnsafe<InsertedMeasurementRow[]>(`
      INSERT INTO "Measurments"
        ("Weight_KG", "Time_stamp", "Bag_filled", "Wastepicker", "Material", "Device")
      VALUES
        (
          ${gramsToKilogramsDecimal(body.weightGrams)},
          NOW(),
          ${body.bagFilled ?? false},
          ${workerId},
          ${material.materialId},
          ${device.deviceId}
        )
      RETURNING
        "Weighting_id" AS "id",
        "Wastepicker" AS "userId",
        "Material" AS "materialId",
        '${material.materialName}' AS "materialName",
        "Weight_KG" AS "weightKg",
        "Time_stamp" AS "createdAt";
      `);

      const measurement = rows[0];
      


      return {
        id: measurement.id.toString(),
        userId: measurement.userId.toString(),
        materialId: measurement.materialId.toString(),
        materialName: measurement.materialName,
        weightGrams: Math.round(new Prisma.Decimal(measurement.weightKg).mul(1000).toNumber()),
        createdAt: measurement.createdAt.toISOString()
      };
    }
  );

  server.post(
    "/requests",
    {
      preHandler: [server.authenticate]
    },
    async (request, reply) => {
      request.log.info(
        { workerId: request.user.userId },
        "Nova solicitação de pesagem registrada."
      );

      reply.code(202);
      return {
        status: "queued"
      };
    }
  );
};

