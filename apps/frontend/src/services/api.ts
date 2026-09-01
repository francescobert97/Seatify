import { HealthResponse } from "../types/api";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:8080";

export async function fetchHealthCheck(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Errore di rete: ${response.status} ${response.statusText}`);
  }

  const data: HealthResponse = await response.json();
  return data;
}
