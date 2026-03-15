import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/services/api";
import { Plus, Check, X } from "lucide-react";
import type { FornecedorDTO, StatusHomologacao } from "@/types/synapse";
import { formatCNPJ } from "@/utils/validators";

const statusColors: Record<StatusHomologacao, "default" | "destructive" | "secondary"> = {
  Aprovado: "default",
  Pendente: "secondary",
  Reprovado: "destructive",
};

export default function FornecedoresList() {
  const { hasPermission } = useAuth();
  const { toast } = useToast();
  const [fornecedores, setFornecedores] = useState<FornecedorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadFornecedores = async () => {
    try {
      const response = await apiClient.listFornecedores({ skip: 0, limit: 50 });
      setFornecedores(response.data);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Falha ao carregar fornecedores",
        description: err?.message || "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadFornecedores();
  }, []);

  const aprovarFornecedor = async (id: number) => {
    setProcessingId(id);
    try {
      await apiClient.homologarFornecedor(id);
      toast({ title: "Fornecedor homologado com sucesso" });
      await loadFornecedores();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Falha ao homologar fornecedor",
        description: err?.message || "Erro desconhecido",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const rejeitarFornecedor = async (id: number) => {
    const motivo = window.prompt("Informe o motivo da rejeição:");
    if (!motivo) return;

    setProcessingId(id);
    try {
      await apiClient.rejeitarFornecedor(id, motivo);
      toast({ title: "Fornecedor rejeitado com sucesso" });
      await loadFornecedores();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Falha ao rejeitar fornecedor",
        description: err?.message || "Erro desconhecido",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Fornecedores</h1>
          <p className="text-sm text-muted-foreground">
            Gestão e Homologação — RF1.4
          </p>
        </div>
        {hasPermission("fornecedores.criar") && (
          <Button>
            <Plus className="h-4 w-4 mr-1.5" />
            Novo Fornecedor
          </Button>
        )}
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Carregando fornecedores...</div>
        ) : fornecedores.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">Nenhum fornecedor encontrado.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Razão Social</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">CNPJ</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Tipo</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Contato</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                {hasPermission("fornecedores.homologar") && (
                  <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Ações</th>
                )}
              </tr>
            </thead>
            <tbody>
              {fornecedores.map((f) => (
                <tr key={f.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{f.razao_social}</td>
                  <td className="px-4 py-3 tabular-nums text-xs">{formatCNPJ(f.cnpj)}</td>
                  <td className="px-4 py-3">{f.tipo}</td>
                  <td className="px-4 py-3 text-xs">
                    {f.contato_nome}
                    {f.contato_email && <span className="text-muted-foreground ml-1">({f.contato_email})</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusColors[f.status_homologacao]}>
                      {f.status_homologacao}
                    </Badge>
                  </td>
                  {hasPermission("fornecedores.homologar") && (
                    <td className="px-4 py-3 text-right">
                      {f.status_homologacao === "Pendente" && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            disabled={processingId === f.id}
                            onClick={() => aprovarFornecedor(f.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-destructive"
                            disabled={processingId === f.id}
                            onClick={() => rejeitarFornecedor(f.id)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
