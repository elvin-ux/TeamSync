import { createContext, PropsWithChildren, useMemo, useState } from "react";
import type { UserRole } from "../types/common";

interface AuthState {
  token: string | null;
  role: UserRole | null;
  userName: string | null;
  userEmail: string | null;
  setSession: (token: string, role: UserRole, name: string, email: string) => void;
  clearSession: () => void;
}

export const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() =>
    window.localStorage.getItem("teamsync.accessToken"),
  );
  const [role, setRole] = useState<UserRole | null>(
    () => window.localStorage.getItem("teamsync.role") as UserRole | null,
  );
  const [userName, setUserName] = useState<string | null>(() =>
    window.localStorage.getItem("teamsync.userName"),
  );
  const [userEmail, setUserEmail] = useState<string | null>(() =>
    window.localStorage.getItem("teamsync.userEmail"),
  );

  const value = useMemo<AuthState>(
    () => ({
      token,
      role,
      userName,
      userEmail,
      setSession: (nextToken, nextRole, name, email) => {
        window.localStorage.setItem("teamsync.accessToken", nextToken);
        window.localStorage.setItem("teamsync.role", nextRole);
        window.localStorage.setItem("teamsync.userName", name);
        window.localStorage.setItem("teamsync.userEmail", email);
        setToken(nextToken);
        setRole(nextRole);
        setUserName(name);
        setUserEmail(email);
      },
      clearSession: () => {
        window.localStorage.removeItem("teamsync.accessToken");
        window.localStorage.removeItem("teamsync.role");
        window.localStorage.removeItem("teamsync.userName");
        window.localStorage.removeItem("teamsync.userEmail");
        setToken(null);
        setRole(null);
        setUserName(null);
        setUserEmail(null);
      },
    }),
    [role, token, userName, userEmail],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
