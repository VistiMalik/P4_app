import pino from "pino";
import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET || "dms-dashboard-secret-key";


export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.destination("/tmp/logs.logs")
);



type AuthTokenPayload = {
  id: string;
  name?: string;
  cpf?: string;
  userType?: number;
};
export function getResponsible(request: Request) {
  const cookies = request.headers.get('cookie').split(';');
  let auth_token: string;

  for (const cookie of cookies) {
    if (cookie.trim().startsWith("auth_token=")) {
      auth_token = cookie.split('=')[1];
    }
  }
  
  const payload = jwt.verify(auth_token, JWT_SECRET) as AuthTokenPayload;
  return payload.id;
}