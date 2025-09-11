import api from "./api";

export interface SessionPayload {
  // Define the expected properties, for example:
  userId: string;
  score: number;
  duration: number;
  // Add other fields as needed
}

export async function saveSessionApi(payload: SessionPayload) {
  return api.post("/sessions", payload);
}

export async function fetchSessionsApi() {
  const { data } = await api.get("/sessions");
  return data.sessions;
}
