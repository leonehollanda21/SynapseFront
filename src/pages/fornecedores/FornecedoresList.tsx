import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Check, X } from "lucide-react";
import type { FornecedorDTO, StatusHomologacao } from "@/types/synapse";
import { formatCNPJ } from "@/utils/validators";

const DEMO: FornecedorDTO[] = [
  {
    id: 1, razao_social: "Comercializadora Alpha LTDA", cnpj: "12345678000190",
    tipo: "Comercializadora", contato_nome: "João Silva", contato_email: "joao@alpha.com.br",
    status_homologacao: "Aprovado", data_criacao: "2024-01-10T10:00:00Z", usuario_criador_id: 1,
  },
  {
    id: 2, razao_social: "Distribuidora Beta S.A.", cnpj: "98765432000111",
    tipo: "Distribuidora", contato_nome: "Maria Souza", contato_email: "maria@beta.com.br",
    status_homologacao: "Pendente", data_criacao: "2024-02-15T10:00:00Z", usuario_criador_id: 1,
  },
  {
    id: 3, razao_social: "Comercializadora Gamma LTDA", cnpj: "11222333000144",
    tipo: "Comercializadora", contato_nome: "Carlos Lima",
    status_homologacao: "Reprovado", data_criacao: "2024-03-01T10:00:00Z", usuario_criador_id: 2,
    motivo_reprovacao: "Documentação insuficiente",
  },
];

const statusColors: Record<StatusHomologacao, "default" | "destructive" | "secondary"> = {
  Aprovado: "default",
  Pendente: "secondary",
  Reprovado: "destructive",
};

export default function FornecedoresList() {
  const { hasPermission } = useAuth();
  const [fornecedores] = useState(DEMO);

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
                        <Button size="sm" variant="outline" className="h-7 text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Aprovar
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs text-destructive">
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
      </div>
    </div>
  );
}
