import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Usuario, PerfilUsuario } from "@/types/synapse";
import { RBAC_PERMISSIONS } from "@/types/synapse";

interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
  hasPermission: (action: string) => boolean;
  hasRole: (role: PerfilUsuario) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("synapse_token")
  );
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const stored = localStorage.getItem("synapse_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((newToken: string, newUser: Usuario) => {
    localStorage.setItem("synapse_token", newToken);
    localStorage.setItem("synapse_user", JSON.stringify(newUser));
    setToken(newToken);
    setUsuario(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("synapse_token");
    localStorage.removeItem("synapse_user");
    setToken(null);
    setUsuario(null);
  }, []);

  const hasPermission = useCallback(
    (action: string) => {
      if (!usuario) return false;
      const allowed = RBAC_PERMISSIONS[action];
      return allowed ? allowed.includes(usuario.perfil) : false;
    },
    [usuario]
  );

  const hasRole = useCallback(
    (role: PerfilUsuario) => usuario?.perfil === role,
    [usuario]
  );

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        isAuthenticated: !!token && !!usuario,
        login,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
