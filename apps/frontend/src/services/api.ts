import { HealthResponse } from "../types/api";
import { httpClient } from "./httpClient";

export async function fetchHealthCheck(): Promise<HealthResponse> {
  return httpClient.get<HealthResponse>("/api/health");
}
