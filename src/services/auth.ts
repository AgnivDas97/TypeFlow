import api from "./api";
import { User } from "../types";

export async function signup(name: string, email: string, password: string): Promise<User> {
  const { data } = await api.post("/auth/signup", { name, email, password });
  localStorage.setItem("typing_app_token", data.token);
  return data.user;
}

export async function login(email: string, password: string): Promise<User> {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem("typing_app_token", data.token);
  return data.user;
}

export async function me(): Promise<User | null> {
  try {
    const { data } = await api.get("/auth/me");
    return data.user;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem("typing_app_token");
}
