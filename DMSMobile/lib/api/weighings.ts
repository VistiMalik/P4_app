import { apiClient } from "./client";
import {
  CollectorRanking,
  CreateWeighingPayload,
  Weighing
} from "./types";

export async function fetchMyWeighings(): Promise<Weighing[]> {
  const response = await apiClient.get<Weighing[]>("/weighings/me");
  return response.data;
}

export async function createWeighing(
  payload: CreateWeighingPayload
): Promise<Weighing> {
  const response = await apiClient.post<Weighing>("/weighings", payload);
  return response.data;
}

export async function fetchCooperativeLeaderboard(): Promise<
  CollectorRanking[]
> {
  const response = await apiClient.get<CollectorRanking[]>(
    "/leaderboard/top-collectors"
  );
  return response.data;
}

export async function startWeighingSession(): Promise<void> {
  await apiClient.post("/weighings/requests");
}
