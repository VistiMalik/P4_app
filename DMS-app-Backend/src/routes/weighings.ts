import { FastifyPluginAsync } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { z } from "zod";

const createWeighingBodySchema = z.object({
  materialId: z
    .string()
    .min(1, "Informe o material coletado."),
  weightGrams: z
    .string()
    .min(1, "Informe o material coletado."),
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

      // Verify scale weighing
      try {
        body.weightGrams = await server.jwt.verify(body.weightGrams).weightGrams;
      } catch {
        return "Weight not originating from authorized scale";
      }

      const worker = await prisma.workers.findUnique({
        where: { workerId },
        select: {
          workerId: true,
          cooperative: true
        }
      });

      if (!worker?.cooperative) {
        // Log cooperative not found for authenticated worker for debugging
        server.log.warn(`Cooperative not found for authenticated worker: ${workerId.toString()}`);
        throw server.httpErrors.badRequest(
          "Cooperativa não encontrada para o trabalhador autenticado."
        );
      }

      const material = await resolveMaterial(body.materialId);

      if (!material) {
        // Log material not found with provided identifier for debugging
        server.log.warn(`Material not found for identifier: ${body.materialId}`);
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

      const measurement = await prisma.measurments.create({
        data: {
          weightKg: gramsToKilogramsDecimal(body.weightGrams),
          timeStamp: new Date(),
          bagFilled: body.bagFilled ?? false,
          wastepicker: workerId,
          material: material.materialId,
          device: device.deviceId
        },
        include: {
          materialRef: true
        }
      });

      return measurementToDto(measurement);
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

