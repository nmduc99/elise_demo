"use client";
import { AUTH_CONFIG, isCacheFresh, isTokenValid } from "@/lib/authConfig";
import { isDemoUser } from "@/lib/demo/roles";
import { fetchWithLocale } from "@/lib/fetchWithLocale";
import { clearAuthStorage, refreshAccessToken } from "@/lib/tokenService";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type AuthUser = {
  id: string;
  account?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
  roles?: string[];
  storeId?: string;
  createdAt?: string | null;
} | null;

type Ctx = {
  user: AuthUser;
  setUser: (u: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthCtx = createContext<Ctx | null>(null);

function persistUser(user: AuthUser) {
  if (!user) return;
  localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
  localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.CACHED_AT, String(Date.now()));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);

  const logout = () => {
    setUser(null);
    clearAuthStorage();

    if (typeof window !== "undefined") {
      void fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      }).catch((error) => {
        console.error("[AuthProvider] Failed to call logout API:", error);
      });
    }
  };

  const clearLocalSession = () => {
    setUser(null);
    clearAuthStorage();
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const initialize = async () => {
      try {
        const cached = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.USER);
        let cachedUser: AuthUser = null;
        if (cached) {
          try {
            cachedUser = JSON.parse(cached) as AuthUser;
          } catch {
            cachedUser = null;
          }
        }

        const cachedAt = parseInt(
          localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.CACHED_AT) || "0",
        );
        const fresh = isCacheFresh(cachedAt);

        if (isDemoUser(cachedUser)) {
          const demoExpiry = Date.now() + 365 * 24 * 60 * 60 * 1000;
          localStorage.setItem(
            AUTH_CONFIG.STORAGE_KEYS.TOKEN_EXPIRES_AT,
            String(demoExpiry),
          );

          if (cachedUser?.id && cachedUser.fullName && fresh) {
            setUser(cachedUser);
            setIsLoading(false);

            void fetchWithLocale("/api/auth/me")
              .then(async (response) => {
                if (!response.ok) {
                  clearLocalSession();
                  return;
                }
                const data = await response.json();
                if (data?.user) {
                  setUser(data.user);
                  persistUser(data.user);
                } else {
                  clearLocalSession();
                }
              })
              .catch(() => {
                /* keep optimistic demo session */
              });
            return;
          }
        } else {
          let tokenExpiresAt = parseInt(
            localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.TOKEN_EXPIRES_AT) ||
              "0",
          );

          if (
            tokenExpiresAt &&
            !isTokenValid(tokenExpiresAt, AUTH_CONFIG.TOKEN_REFRESH_BUFFER)
          ) {
            await refreshAccessToken();
          }

          if (cachedUser?.id && cachedUser.fullName && fresh) {
            setUser(cachedUser);
          }
        }

        const response = await fetchWithLocale("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data?.user) {
            setUser(data.user);
            persistUser(data.user);
          } else {
            clearLocalSession();
          }
        } else {
          clearLocalSession();
        }
      } catch (error) {
        console.error("[AuthProvider] Initialization error:", error);
        clearLocalSession();
      } finally {
        setIsLoading(false);
      }
    };

    void initialize();
  }, []);

  const value = useMemo(
    () => ({ user, setUser, logout, isLoading }),
    [user, isLoading],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
