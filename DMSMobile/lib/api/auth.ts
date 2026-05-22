import { apiClient } from "./client";
import { LoginPayload, LoginResponse, User, UpdateProfilePayload, UpdateProfileResponse } from "./types";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
  const response = await apiClient.put<UpdateProfileResponse>("/auth/me", payload);
  return response.data;
}
