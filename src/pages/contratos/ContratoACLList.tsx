import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";
import type { ContratoACLDTO, StatusContrato } from "@/types/synapse";

// Demo data
const DEMO_CONTRATOS: ContratoACLDTO[] = [
  {
    id: 1, unidade_id: 1, fornecedor_id: 2,
    data_inicio: "2024-01-01", data_fim: "2024-12-31",
    volume_mensal_mwh: 150.5, preco_mwh: 250.75, preco_mensal_total: 37737.88,
    flexibilidade_min: 0.85, flexibilidade_max: 1.1,
    fonte_energia: "Renovável", indexador_reajuste: "IPCA",
    sazonalizacao_q1: 0.25, sazonalizacao_q2: 0.25, sazonalizacao_q3: 0.25, sazonalizacao_q4: 0.25,
    status: "Ativo", data_criacao: "2024-01-01T10:00:00Z", usuario_criador_id: 1,
  },
  {
    id: 2, unidade_id: 3, fornecedor_id: 5,
    data_inicio: "2023-06-01", data_fim: "2024-05-31",
    volume_mensal_mwh: 80, preco_mwh: 210, preco_mensal_total: 16800,
    flexibilidade_min: 0.9, flexibilidade_max: 1.1,
    fonte_energia: "Incentivada", indexador_reajuste: "IGPM",
    sazonalizacao_q1: 0.3, sazonalizacao_q2: 0.2, sazonalizacao_q3: 0.2, sazonalizacao_q4: 0.3,
    status: "Vencido", data_criacao: "2023-06-01T10:00:00Z", usuario_criador_id: 1,
  },
  {
    id: 3, unidade_id: 2, fornecedor_id: 3,
    data_inicio: "2025-01-01", data_fim: "2026-12-31",
    volume_mensal_mwh: 200, preco_mwh: 280, preco_mensal_total: 56000,
    flexibilidade_min: 0.85, flexibilidade_max: 1.15,
    fonte_energia: "Convencional", indexador_reajuste: "IPCA",
    sazonalizacao_q1: 0.25, sazonalizacao_q2: 0.25, sazonalizacao_q3: 0.25, sazonalizacao_q4: 0.25,
    status: "Ativo", data_criacao: "2024-12-15T10:00:00Z", usuario_criador_id: 2,
  },
];

const statusVariant: Record<StatusContrato, "default" | "destructive" | "secondary"> = {
  Ativo: "default",
  Vencido: "destructive",
  Cancelado: "secondary",
};

export default function ContratoACLList() {
  const { hasPermission } = useAuth();
  const [contratos] = useState(DEMO_CONTRATOS);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Contratos ACL</h1>
          <p className="text-sm text-muted-foreground">
            Ambiente de Contratação Livre
          </p>
        </div>
        {hasPermission("contratos.criar") && (
          <Button asChild>
            <Link to="/contratos/acl/novo">
              <Plus className="h-4 w-4 mr-1.5" />
              Novo Contrato
            </Link>
          </Button>
        )}
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">ID</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">UC</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Período</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Volume (MWh)</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">R$/MWh</th>
              <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Total Mensal</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Fonte</th>
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {contratos.map((c) => (
              <tr key={c.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 tabular-nums font-medium">#{c.id}</td>
                <td className="px-4 py-3 tabular-nums">{c.unidade_id}</td>
                <td className="px-4 py-3 text-xs tabular-nums">
                  {new Date(c.data_inicio).toLocaleDateString("pt-BR")} —{" "}
                  {new Date(c.data_fim).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{c.volume_mensal_mwh.toFixed(1)}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {c.preco_mwh.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium">
                  R$ {c.preco_mensal_total?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">{c.fonte_energia}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
