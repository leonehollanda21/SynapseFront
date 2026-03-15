import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/services/api";
import { Plus } from "lucide-react";
import type { ContratoCUSDDTO, StatusContrato } from "@/types/synapse";

const statusVariant: Record<StatusContrato, "default" | "destructive" | "secondary"> = {
  Ativo: "default",
  Vencido: "destructive",
  Cancelado: "secondary",
};

export default function ContratoCUSDList() {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [contratos, setContratos] = useState<ContratoCUSDDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const response = await apiClient.listContratosCUSD({ skip: 0, limit: 20 });
        if (mounted) {
          setContratos(response.data);
        }
      } catch (err: any) {
        if (mounted) {
          toast({
            variant: "destructive",
            title: "Falha ao carregar contratos CUSD",
            description: err?.message || "Erro desconhecido",
          });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [toast]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Contratos CUSD</h1>
          <p className="text-sm text-muted-foreground">Uso do Sistema de Distribuição</p>
        </div>
        {hasPermission("contratos.criar") && (
          <Button asChild>
            <Link to="/contratos/cusd/novo">
              <Plus className="h-4 w-4 mr-1.5" />
              Novo Contrato
            </Link>
          </Button>
        )}
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Carregando contratos CUSD...</div>
        ) : contratos.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">Nenhum contrato CUSD encontrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">ID</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">UC</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Subgrupo</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Período</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Ponta (kW)</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">F. Ponta (kW)</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Encargos (R$/mês)</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((c) => (
                <tr key={c.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 tabular-nums font-medium">#{c.id}</td>
                  <td className="px-4 py-3 tabular-nums">{c.unidade_id}</td>
                  <td className="px-4 py-3">{c.subgrupo_tarifario}</td>
                  <td className="px-4 py-3 text-xs tabular-nums">
                    {new Date(c.data_inicio).toLocaleDateString("pt-BR")} — {new Date(c.data_fim).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.demanda_ponta_kw.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.demanda_fora_ponta_kw.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">
                    R$ {c.encargos.total_encargos_mensalizados.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[c.status]}>{c.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
