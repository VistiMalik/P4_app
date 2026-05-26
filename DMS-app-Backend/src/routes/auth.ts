import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { prisma } from "../prisma";
import { compare, hash } from "bcryptjs";

const loginBodySchema = z.object({
  cpf: z
    .string()
    .min(11, "Informe o CPF.")
    .transform((value) => value.replace(/\D/g, ""))
    .refine((value) => value.length === 11, "Informe um CPF válido."),
  password: z.string().min(1, "Informe a senha.")
});

export const authRoutes: FastifyPluginAsync = async (server) => {
  server.post("/login", async (request, reply) => {
  let parsedBody;
  try {
    parsedBody = loginBodySchema.parse(request.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Log input validation errors for security monitoring)
      server.log.warn(`Validation error during login attempt: ${JSON.stringify(error.issues)}`);
      throw server.httpErrors.badRequest("Invalid data format.");
    }
    throw error;
  }
      const { cpf, password } = parsedBody;
      const worker = await prisma.workers.findFirst({
        where: { cpf: Buffer.from(cpf, "utf-8") },
        select: {
          workerId: true,
          workerName: true,
          email: true,
          cpf: true,
          bankNumber: true,
          password: true,
          cooperative: true,
          cooperativeRef: {
            select: {
              cooperativeId: true,
              cooperativeName: true
            }
          }
        }
      });

      if (!worker || !worker.password) {
        // Log failed login attempt with worker ID (without password) for security monitoring
        server.log.warn(`Failed login attempt for user: ${worker?.workerId?.toString() ?? "unknown"}`);
        throw server.httpErrors.unauthorized("Credenciais inválidas."); 
      }

      const passwordHash = Buffer.from(worker.password).toString("utf-8");
      const isValidPassword = await compare(password, passwordHash);

      if (!isValidPassword) {
        // Log failed login attempt with worker ID (without password) for security monitoring
        server.log.warn(`Failed login attempt for user: ${worker.workerId ? worker.workerId.toString() : "unknown"}`);
        throw server.httpErrors.unauthorized("Credenciais inválidas.");
      }

      const token = await server.jwt.sign({
        userId: worker.workerId.toString()
      });

      // Log successful login with worker ID for security monitoring
      server.log.info(`Successful login for user: ${worker.workerId.toString()}`);

      const workerCpf =
        worker.cpf && worker.cpf.length > 0
          ? Buffer.from(worker.cpf).toString("utf-8")
          : null;

      return {
        accessToken: token,
        user: {
          id: worker.workerId.toString(),
          name: worker.workerName,
          email: worker.email,
          cpf: workerCpf,
          bank_number: worker.bankNumber,
          cooperativeId: worker.cooperative
            ? worker.cooperative.toString()
            : null,
          cooperativeName: worker.cooperativeRef?.cooperativeName ?? null
        }
      };
    }
  );

  server.get(
    "/me",
    {
      preHandler: [server.authenticate]
    },
    async (request) => {
      const workerId = BigInt(request.user.userId);

      const worker = await prisma.workers.findUnique({
        where: {
          workerId
        },
        select: {
          workerId: true,
          workerName: true,
          email: true,
          cpf: true,
          bankNumber: true,
          cooperative: true,
          cooperativeRef: {
            select: {
              cooperativeId: true,
              cooperativeName: true
            }
          }
        }
      });

      if (!worker) {
        // Log failed access attempt with worker ID for security monitoring
        server.log.warn(`Failed access attempt to /me for user: ${workerId.toString()}`);
        throw server.httpErrors.notFound("Trabalhador não encontrado.");
      }

      // Log successful access to /me with worker ID for security monitoring
      server.log.info(`Successful access to /me for user: ${workerId.toString()}`);

      const workerCpf =
        worker.cpf && worker.cpf.length > 0
          ? Buffer.from(worker.cpf).toString("utf-8")
          : null;

      return {
        id: worker.workerId.toString(),
        name: worker.workerName,
        email: worker.email,
        cpf: workerCpf,
        bank_number: worker.bankNumber,
        cooperativeId: worker.cooperative
          ? worker.cooperative.toString()
          : null,
        cooperativeName: worker.cooperativeRef?.cooperativeName ?? null
      };
    }
  );

  const updateProfileBodySchema = z
    .object({
      name: z.string().min(1, "Nome é obrigatório").optional(),
      email: z.string().email("Email inválido").optional(),
      bank_number: z.string().optional(),
      currentPassword: z
        .string()
        .min(1, "Senha atual é obrigatória")
        .optional(),
      newPassword: z
        .string()
        .min(6, "Nova senha deve ter no mínimo 6 caracteres")
        .optional()
    })
    .refine(
      (data) => {
        if (data.newPassword && !data.currentPassword) {
          return false;
        }
        return true;
      },
      {
        message: "Senha atual é necessária para definir uma nova senha",
        path: ["currentPassword"]
      }
    );

  server.put(
    "/me",
    {
      preHandler: [server.authenticate]
    },
    async (request) => {
      const workerId = BigInt(request.user.userId);
      let parsedBody;
      try {
        parsedBody = updateProfileBodySchema.parse(request.body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Log input validation errors for security monitoring)
          server.log.warn(`Validation error during update profile attempt: ${JSON.stringify(error.issues)}`);
          throw server.httpErrors.badRequest("Invalid data format.");
        }
        throw error;
      }
      const { name, email, bank_number, currentPassword, newPassword } = parsedBody;

      const worker = await prisma.workers.findUnique({
        where: { workerId }
      });

      if (!worker) {
        // Log failed access attempt with worker ID for security monitoring
        server.log.warn(`Failed access attempt to update profile for user: ${workerId.toString()}`);
        throw server.httpErrors.notFound("Trabalhador não encontrado.");
      }

      const updateData: any = {};
      if (name) {
        updateData.workerName = name;
        // Log profile update with worker ID for security monitoring
        server.log.info(`Profile name changed for user: ${workerId.toString()}`);
      }
      if (email) {
        updateData.email = email;
        // Log profile update with worker ID for security monitoring
        server.log.info(`Profile email changed for user: ${workerId.toString()}`);
      }
      if (bank_number !== undefined) {
        updateData.bankNumber = bank_number.trim() || null;
        // Log profile update with worker ID for security monitoring
        server.log.info(`Profile bank number changed for user: ${workerId.toString()}`);
      }

      if (newPassword && currentPassword) {
        if (!worker.password) {
          // Log failed password change attempt with worker ID for security monitoring
          server.log.warn(`Failed password change attempt for user: ${workerId.toString()} - no existing password set`);
          throw server.httpErrors.badRequest(
            "Usuário não possui senha definida para alteração."
          );
        }
        const currentPasswordHash = Buffer.from(worker.password).toString(
          "utf-8"
        );
        const isValid = await compare(currentPassword, currentPasswordHash);
        if (!isValid) {
          // log failed password change attempt with worker ID for security monitoring
          server.log.warn(`Failed password change attempt for user: ${workerId.toString()}`);
          throw server.httpErrors.unauthorized("Senha atual incorreta.");
        }
        const newPasswordHash = await hash(newPassword, 10);
        updateData.password = Buffer.from(newPasswordHash, "utf-8");
        // Log password change with worker ID for security monitoring
        server.log.info(`Password changed for user: ${workerId.toString()}`);
      }

      if (Object.keys(updateData).length === 0) {
        const workerCpf =
          worker.cpf && worker.cpf.length > 0
            ? Buffer.from(worker.cpf).toString("utf-8")
            : null;

            // Log profile access without changes with worker ID for security monitoring
            server.log.info(`Profile accessed without changes for user: ${workerId.toString()}`);
        return {
          message: "Nenhuma alteração realizada.",
          user: {
            id: worker.workerId.toString(),
            name: worker.workerName,
            email: worker.email,
            cpf: workerCpf,
            bank_number: worker.bankNumber,
            cooperativeId: worker.cooperative
              ? worker.cooperative.toString()
              : null,
            cooperativeName: null // We didn't fetch the cooperative name if no update
          }
        };
      }

      updateData.lastUpdate = new Date();

      const updatedWorker = await prisma.workers.update({
        where: { workerId },
        data: updateData,
        select: {
          workerId: true,
          workerName: true,
          email: true,
          cpf: true,
          bankNumber: true,
          cooperative: true,
          cooperativeRef: {
            select: {
              cooperativeId: true,
              cooperativeName: true
            }
          }
        }
      });

      const workerCpf =
        updatedWorker.cpf && updatedWorker.cpf.length > 0
          ? Buffer.from(updatedWorker.cpf).toString("utf-8")
          : null;

      return {
        message: "Perfil atualizado com sucesso.",
        user: {
          id: updatedWorker.workerId.toString(),
          name: updatedWorker.workerName,
          email: updatedWorker.email,
          cpf: workerCpf,
          bank_number: updatedWorker.bankNumber,
          cooperativeId: updatedWorker.cooperative
            ? updatedWorker.cooperative.toString()
            : null,
          cooperativeName:
            updatedWorker.cooperativeRef?.cooperativeName ?? null
        }
      };
    }
  );

};
