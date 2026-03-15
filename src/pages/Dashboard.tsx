import { useAuth } from "@/contexts/AuthContext";
import { FileText, Users, AlertTriangle, TrendingUp } from "lucide-react";

const stats = [
  { label: "Contratos ACL", value: "24", icon: FileText, change: "+3 este mês" },
  { label: "Contratos CUSD", value: "12", icon: FileText, change: "+1 este mês" },
  { label: "Fornecedores", value: "8", icon: Users, change: "5 aprovados" },
  { label: "Alertas Ativos", value: "3", icon: AlertTriangle, change: "1 crítico" },
];

export default function Dashboard() {
  const { usuario } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Bem-vindo, {usuario?.nome}. Perfil: {usuario?.perfil}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </span>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{stat.value}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-emerald" />
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
