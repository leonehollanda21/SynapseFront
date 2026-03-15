import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Users,
  LayoutDashboard,
  LogOut,
  Zap,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, action: undefined },
  { label: "Contratos ACL", path: "/contratos/acl", icon: FileText, action: "contratos.ver" },
  { label: "Contratos CUSD", path: "/contratos/cusd", icon: FileText, action: "contratos.ver" },
  { label: "Fornecedores", path: "/fornecedores", icon: Users, action: "fornecedores.ver" },
];

const breadcrumbMap: Record<string, string> = {
  "/": "Dashboard",
  "/contratos/acl": "Contratos ACL",
  "/contratos/acl/novo": "Novo Contrato ACL",
  "/contratos/cusd": "Contratos CUSD",
  "/contratos/cusd/novo": "Novo Contrato CUSD",
  "/fornecedores": "Fornecedores",
};

export function AppLayout() {
  const { usuario, logout, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const breadcrumbParts = location.pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; path: string }[] = [{ label: "Home", path: "/" }];
  let currentPath = "";
  for (const part of breadcrumbParts) {
    currentPath += `/${part}`;
    const label = breadcrumbMap[currentPath];
    if (label) breadcrumbs.push({ label, path: currentPath });
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-navy text-navy-foreground flex flex-col">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
          <Zap className="h-6 w-6 text-emerald" />
          <span className="font-bold text-lg tracking-tight">Synapse Energy</span>
        </div>

        <nav className="flex-1 py-4 space-y-0.5 px-3">
          {navItems.map((item) => {
            if (item.action && !hasPermission(item.action)) return null;
            const isActive =
              item.path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{usuario?.nome}</p>
              <p className="text-xs text-sidebar-foreground/50">{usuario?.perfil}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded hover:bg-sidebar-accent text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb header */}
        <header className="flex-shrink-0 border-b bg-card px-6 py-3">
          <nav className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((bc, i) => (
              <span key={bc.path} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
                {i === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-foreground">{bc.label}</span>
                ) : (
                  <Link to={bc.path} className="text-muted-foreground hover:text-foreground">
                    {bc.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </header>

        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
