import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  ApiError,
  request,
  requestWithToken,
} from "../api/client";
import {
  AuthProfile,
  TokenResponse,
  UserResponse,
} from "../api/types";

type AuthContextValue = {
  loading: boolean;
  token: string | null;
  profile: AuthProfile | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<string | null>;
  apiFetch: <T,>(path: string, options?: RequestInit) => Promise<T>;
};

const TOKEN_KEY = "backoffice_auth_token";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const loadProfile = async (token: string) => {
  const me = await requestWithToken<UserResponse>(token, "/api/users/me");
  return {
    id: me.id,
    municipalityId: me.municipalityId,
    fullName: me.fullName,
    email: me.email,
    avatarUrl: me.avatarUrl || null,
    role: me.role,
  } satisfies AuthProfile;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);

  const persistToken = async (value: string | null) => {
    if (value) {
      localStorage.setItem(TOKEN_KEY, value);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  };

  const refreshSession = async (): Promise<string | null> => {
    if (!token) return null;
    const refreshed = await requestWithToken<TokenResponse>(token, "/api/auth/refresh", {
      method: "POST",
    });
    setToken(refreshed.accessToken);
    await persistToken(refreshed.accessToken);
    return refreshed.accessToken;
  };

  const bootstrap = async () => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }

    try {
      const me = await loadProfile(stored);
      setToken(stored);
      setProfile(me);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        try {
          const refreshed = await requestWithToken<TokenResponse>(stored, "/api/auth/refresh", {
            method: "POST",
          });
          const me = await loadProfile(refreshed.accessToken);
          setToken(refreshed.accessToken);
          setProfile(me);
          await persistToken(refreshed.accessToken);
          setLoading(false);
          return;
        } catch {
          await persistToken(null);
          setToken(null);
          setProfile(null);
        }
      } else {
        await persistToken(null);
        setToken(null);
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const me = await loadProfile(result.accessToken);
    setToken(result.accessToken);
    setProfile(me);
    await persistToken(result.accessToken);
  };

  const logout = async () => {
    setToken(null);
    setProfile(null);
    await persistToken(null);
  };

  const apiFetch = async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
    if (!token) {
      throw new Error("Not authenticated");
    }

    try {
      return await requestWithToken<T>(token, path, options);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        const refreshed = await refreshSession();
        if (refreshed) {
          return await requestWithToken<T>(refreshed, path, options);
        }
        await logout();
      }
      throw error;
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      token,
      profile,
      isAdmin: profile?.role === "ADMIN",
      login,
      logout,
      refreshSession,
      apiFetch,
    }),
    [loading, token, profile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
