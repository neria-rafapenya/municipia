import { useCallback } from "react";
import { useAuth } from "../context/AuthContext";

export const useApi = () => {
  const { authFetch } = useAuth();

  const apiFetch = useCallback(
    async <T,>(path: string, options: RequestInit = {}) => {
      return await authFetch<T>(path, options);
    },
    [authFetch]
  );

  return { apiFetch };
};
