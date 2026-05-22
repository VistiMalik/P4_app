export interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string | null;
  bank_number?: string | null;
  cooperativeId?: string | null;
  cooperativeName?: string | null;
}

export interface LoginPayload {
  cpf: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface Weighing {
  id: string;
  userId: string;
  materialId: string;
  materialName: string;
  weightGrams: number;
  createdAt: string;
}

export interface CreateWeighingPayload {
  materialId: string;
  weightGrams: number;
  deviceExternalId?: string | null;
  bagFilled?: boolean;
}

export interface Material {
  id: string;
  name: string;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  bank_number?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

export interface CollectorRanking {
  workerId: string;
  workerName: string;
  totalWeightKg: number;
  totalWeighings: number;
  cooperativeId?: string;
  avatarUrl?: string | null;
}
