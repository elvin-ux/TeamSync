import { createContext, PropsWithChildren, useMemo, useState } from "react";
import type { UserRole } from "../types/common";

interface AuthState {
  token: string | null;
  role: UserRole | null;
  userName: string | null;
  userEmail: string | null;
  userAvatarUrl: string | null;
  setSession: (token: string, role: UserRole, name: string, email: string) => void;
  updateProfileInfo: (name: string, avatarUrl: string | null) => void;
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
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(() =>
    window.localStorage.getItem("teamsync.userAvatarUrl"),
  );

  const value = useMemo<AuthState>(
    () => ({
      token,
      role,
      userName,
      userEmail,
      userAvatarUrl,
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
      updateProfileInfo: (name, avatarUrl) => {
        window.localStorage.setItem("teamsync.userName", name);
        if (avatarUrl) {
          window.localStorage.setItem("teamsync.userAvatarUrl", avatarUrl);
        } else {
          window.localStorage.removeItem("teamsync.userAvatarUrl");
        }
        setUserName(name);
        setUserAvatarUrl(avatarUrl);
      },
      clearSession: () => {
        window.localStorage.removeItem("teamsync.accessToken");
        window.localStorage.removeItem("teamsync.role");
        window.localStorage.removeItem("teamsync.userName");
        window.localStorage.removeItem("teamsync.userEmail");
        window.localStorage.removeItem("teamsync.userAvatarUrl");
        setToken(null);
        setRole(null);
        setUserName(null);
        setUserEmail(null);
        setUserAvatarUrl(null);
      },
    }),
    [role, token, userName, userEmail, userAvatarUrl],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
