import { MUNICIPALITY_ID } from "./config";
import { request, requestAuth } from "./http";

export type TokenResponse = {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
};

export type RegisterResponse = {
  id: number;
};

export const login = (email: string, password: string) =>
  request<TokenResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const refresh = (token: string) =>
  requestAuth<TokenResponse>(token, "/api/auth/refresh", {
    method: "POST",
  });

export const registerUser = (
  fullName: string,
  email: string,
  password: string,
  role: "NEIGHBOR" | "OPERATOR" | "ADMIN" = "NEIGHBOR",
  municipalityId: number = MUNICIPALITY_ID
) =>
  request<RegisterResponse>("/api/users/register", {
    method: "POST",
    body: JSON.stringify({ municipalityId, fullName, email, password, role }),
  });
