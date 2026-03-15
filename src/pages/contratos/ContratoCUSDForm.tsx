import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/services/api";
import { validateDatas, validateDemanda, validateTensao, TENSOES_VALIDAS } from "@/utils/validators";
import type { SubgrupoTarifario, Modalidade } from "@/types/synapse";

export default function ContratoCUSDForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    unidade_id: 1,
    data_inicio: "",
    data_fim: "",
    subgrupo_tarifario: "A4" as SubgrupoTarifario,
    demanda_ponta_kw: 0,
    demanda_fora_ponta_kw: 0,
    tensao_fornecimento: 13800,
    modalidade: "Faturamento por Demanda" as Modalidade,
    observacoes: "",
  });

  const update = (field: string, value: number | string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDatas(form.data_inicio, form.data_fim)) {
      toast({ variant: "destructive", title: "Data de fim deve ser posterior à de início" });
      return;
    }
    if (!validateDemanda(form.demanda_ponta_kw)) {
      toast({ variant: "destructive", title: "Demanda de ponta deve ser > 0" });
      return;
    }
    if (!validateDemanda(form.demanda_fora_ponta_kw)) {
      toast({ variant: "destructive", title: "Demanda fora de ponta deve ser > 0" });
      return;
    }
    if (!validateTensao(form.tensao_fornecimento)) {
      toast({ variant: "destructive", title: `Tensão inválida. Válidas: ${TENSOES_VALIDAS.join(", ")}V` });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        demanda_ponta_kw: form.demanda_ponta_kw,
        demanda_fora_ponta_kw: form.demanda_fora_ponta_kw,
      };
      await apiClient.createContratoCUSD(payload);
      toast({ title: "Contrato CUSD criado com sucesso!" });
      navigate("/contratos/cusd");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar contrato",
        description: err?.message || "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Novo Contrato CUSD</h1>
        <p className="text-sm text-muted-foreground">
          Uso do Sistema de Distribuição — RF1.2
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vínculo */}
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold">Unidade Consumidora</h2>
          <div className="w-1/2 space-y-1.5">
            <Label>UC (ID)</Label>
            <Input
              type="number"
              min={1}
              value={form.unidade_id}
              onChange={(e) => update("unidade_id", Number(e.target.value))}
              required
            />
          </div>
        </div>

        {/* Período */}
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold">Período Contratual</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Data Início</Label>
              <Input type="date" value={form.data_inicio} onChange={(e) => update("data_inicio", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Data Fim</Label>
              <Input type="date" value={form.data_fim} onChange={(e) => update("data_fim", e.target.value)} required />
            </div>
          </div>
        </div>

        {/* Tarifário */}
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold">Dados Tarifários</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Subgrupo Tarifário</Label>
              <Select value={form.subgrupo_tarifario} onValueChange={(v) => update("subgrupo_tarifario", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">A1</SelectItem>
                  <SelectItem value="A2">A2</SelectItem>
                  <SelectItem value="A3">A3</SelectItem>
                  <SelectItem value="A4">A4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tensão de Fornecimento (V)</Label>
              <Select value={String(form.tensao_fornecimento)} onValueChange={(v) => update("tensao_fornecimento", Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TENSOES_VALIDAS.map((t) => (
                    <SelectItem key={t} value={String(t)}>{t.toLocaleString()} V</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Demanda Ponta (kW)</Label>
              <Input
                type="number"
                step="0.01"
                min={0.01}
                value={form.demanda_ponta_kw || ""}
                onChange={(e) => update("demanda_ponta_kw", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Demanda Fora de Ponta (kW)</Label>
              <Input
                type="number"
                step="0.01"
                min={0.01}
                value={form.demanda_fora_ponta_kw || ""}
                onChange={(e) => update("demanda_fora_ponta_kw", Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Modalidade</Label>
            <Select value={form.modalidade} onValueChange={(v) => update("modalidade", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Faturamento por Demanda">Faturamento por Demanda</SelectItem>
                <SelectItem value="Faturamento por Medição">Faturamento por Medição</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Observações */}
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold">Observações</h2>
          <Textarea
            value={form.observacoes}
            onChange={(e) => update("observacoes", e.target.value)}
            placeholder="Observações opcionais (máx. 500 caracteres)"
            maxLength={500}
            rows={3}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Criar Contrato"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/contratos/cusd")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
