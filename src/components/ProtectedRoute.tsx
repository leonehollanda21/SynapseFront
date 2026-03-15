import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { PerfilUsuario } from "@/types/synapse";

interface Props {
  children: React.ReactNode;
  allowedRoles?: PerfilUsuario[];
  requiredAction?: string;
}

export function ProtectedRoute({ children, allowedRoles, requiredAction }: Props) {
  const { isAuthenticated, usuario, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && usuario && !allowedRoles.includes(usuario.perfil)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold text-destructive">Acesso Negado</h2>
          <p className="text-sm text-muted-foreground">
            Seu perfil ({usuario.perfil}) não tem permissão para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  if (requiredAction && !hasPermission(requiredAction)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold text-destructive">Acesso Negado</h2>
          <p className="text-sm text-muted-foreground">
            Você não tem permissão para esta ação.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
