import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, refresh as apiRefresh, registerUser } from '../api/auth';
import { ApiError, requestAuth } from '../api/http';

type AuthContextValue = {
  token: string | null;
  expiresAt: string | null;
  loading: boolean;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  registerAndLogin: (fullName: string, email: string, password: string) => Promise<void>;
  refreshToken: () => Promise<string | null>;
  authFetch: <T>(path: string, options?: RequestInit) => Promise<T>;
  logout: () => Promise<void>;
};

const TOKEN_KEY = 'municipia_auth_token';
const EXPIRES_KEY = 'municipia_auth_expires_at';
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const MIN_SPLASH_MS = 3000;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const startedAt = Date.now();

    const bootstrap = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedExpires = await AsyncStorage.getItem(EXPIRES_KEY);

        if (isMounted) {
          setToken(storedToken);
          setExpiresAt(storedExpires);
        }

        if (storedToken && storedExpires) {
          const expiresTime = Date.parse(storedExpires);
          const now = Date.now();
          if (!Number.isNaN(expiresTime)) {
            if (expiresTime <= now) {
              await AsyncStorage.multiRemove([TOKEN_KEY, EXPIRES_KEY]);
              if (isMounted) {
                setToken(null);
                setExpiresAt(null);
              }
            } else if (expiresTime - now < 60_000) {
              try {
                const refreshed = await apiRefresh(storedToken);
                await AsyncStorage.multiSet([
                  [TOKEN_KEY, refreshed.accessToken],
                  [EXPIRES_KEY, refreshed.expiresAt],
                ]);
                if (isMounted) {
                  setToken(refreshed.accessToken);
                  setExpiresAt(refreshed.expiresAt);
                }
              } catch {
                // keep existing token; it may still be valid
              }
            }
          }
        }
        if (__DEV__ && storedToken) {
          try {
            const result = await requestAuth<{ userId: number; email: string; role: string }>(
              storedToken,
              '/api/auth/check'
            );
            console.log('[auth-check] ok', result);
          } catch (err: any) {
            console.warn('[auth-check] failed', err?.status ?? err);
          }
        }
      } finally {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(MIN_SPLASH_MS - elapsed, 0);
        if (remaining > 0) {
          await new Promise((resolve) => setTimeout(resolve, remaining));
        }
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();
    return () => {
      isMounted = false;
    };
  }, []);

  const loginWithCredentials = async (email: string, password: string) => {
    const tokenResponse = await apiLogin(email, password);
    setToken(tokenResponse.accessToken);
    setExpiresAt(tokenResponse.expiresAt);
    await AsyncStorage.multiSet([
      [TOKEN_KEY, tokenResponse.accessToken],
      [EXPIRES_KEY, tokenResponse.expiresAt],
    ]);
  };

  const refreshToken = async (): Promise<string | null> => {
    if (!token) return null;
    const tokenResponse = await apiRefresh(token);
    setToken(tokenResponse.accessToken);
    setExpiresAt(tokenResponse.expiresAt);
    await AsyncStorage.multiSet([
      [TOKEN_KEY, tokenResponse.accessToken],
      [EXPIRES_KEY, tokenResponse.expiresAt],
    ]);
    return tokenResponse.accessToken;
  };

  const registerAndLogin = async (fullName: string, email: string, password: string) => {
    await registerUser(fullName, email, password, 'NEIGHBOR');
    await loginWithCredentials(email, password);
  };

  const authFetch = async <T,>(path: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('Not authenticated');
    }
    try {
      return await requestAuth<T>(token, path, options);
    } catch (err: any) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        try {
          const refreshedToken = await refreshToken();
          if (refreshedToken) {
            return await requestAuth<T>(refreshedToken, path, options);
          }
        } catch (refreshErr) {
          await logout();
          throw refreshErr;
        }
        await logout();
      }
      throw err;
    }
  };

  const logout = async () => {
    setToken(null);
    setExpiresAt(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, EXPIRES_KEY]);
  };

  const value = useMemo(
    () => ({
      token,
      expiresAt,
      loading,
      loginWithCredentials,
      registerAndLogin,
      refreshToken,
      authFetch,
      logout,
    }),
    [token, expiresAt, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
