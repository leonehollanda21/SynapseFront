import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/services/api";
import {
  validateSazonalizacao,
  validateFlexibilidade,
  validateVolume,
  validateDatas,
  getSazonalizacaoTotal,
} from "@/utils/validators";
import type { FonteEnergia, IndexadorReajuste } from "@/types/synapse";

export default function ContratoACLForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState("Contrato PDF");
  const [descricaoDocumento, setDescricaoDocumento] = useState("");

  const [form, setForm] = useState({
    unidade_id: 1,
    fornecedor_id: 1,
    data_inicio: "",
    data_fim: "",
    volume_mensal_mwh: 0,
    preco_mwh: 0,
    flexibilidade_min: 0.85,
    flexibilidade_max: 1.1,
    fonte_energia: "Renovável" as FonteEnergia,
    indexador_reajuste: "IPCA" as IndexadorReajuste,
    sazonalizacao_q1: 0.25,
    sazonalizacao_q2: 0.25,
    sazonalizacao_q3: 0.25,
    sazonalizacao_q4: 0.25,
  });

  const sazonTotal = getSazonalizacaoTotal(
    form.sazonalizacao_q1,
    form.sazonalizacao_q2,
    form.sazonalizacao_q3,
    form.sazonalizacao_q4
  );
  const sazonPercent = Math.min(sazonTotal * 100, 110);
  const sazonValid = validateSazonalizacao(
    form.sazonalizacao_q1,
    form.sazonalizacao_q2,
    form.sazonalizacao_q3,
    form.sazonalizacao_q4
  );

  const update = (field: string, value: number | string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDatas(form.data_inicio, form.data_fim)) {
      toast({ variant: "destructive", title: "Data de fim deve ser posterior à de início" });
      return;
    }
    if (!validateVolume(form.volume_mensal_mwh)) {
      toast({ variant: "destructive", title: "Volume deve estar entre 0 e 500 MWh" });
      return;
    }
    if (!sazonValid) {
      toast({ variant: "destructive", title: "Sazonalização deve somar exatamente 100%" });
      return;
    }
    if (!validateFlexibilidade(form.flexibilidade_min, form.flexibilidade_max)) {
      toast({ variant: "destructive", title: "Flexibilidade mínima deve ser ≤ máxima" });
      return;
    }

    setLoading(true);
    try {
      const contrato = await apiClient.createContratoACL(form);

      if (documentoFile) {
        const isPdf =
          documentoFile.type === "application/pdf" ||
          documentoFile.name.toLowerCase().endsWith(".pdf");

        if (!isPdf) {
          toast({
            variant: "destructive",
            title: "Apenas PDF é permitido para upload",
          });
          setLoading(false);
          return;
        }

        await apiClient.uploadDocumento({
          arquivo: documentoFile,
          contrato_id: contrato.id,
          tipo_documento: tipoDocumento,
          descricao: descricaoDocumento || undefined,
        });
      }

      toast({ title: "Contrato ACL criado com sucesso!" });
      navigate("/contratos/acl");
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao criar contrato",
        description: err?.message || err?.details || "Erro desconhecido",
      });
    } finally {
      setLoading(false);
    }
  };

  const precoTotal = form.volume_mensal_mwh * form.preco_mwh;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold">Novo Contrato ACL</h1>
        <p className="text-sm text-muted-foreground">
          Ambiente de Contratação Livre — RF1.1
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vínculo */}
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Vínculo</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Unidade Consumidora (ID)</Label>
              <Input
                type="number"
                min={1}
                value={form.unidade_id}
                onChange={(e) => update("unidade_id", Number(e.target.value))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Fornecedor (ID)</Label>
              <Input
                type="number"
                min={1}
                value={form.fornecedor_id}
                onChange={(e) => update("fornecedor_id", Number(e.target.value))}
                required
              />
            </div>
          </div>
        </div>

        {/* Período */}
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Período Contratual</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={form.data_inicio}
                onChange={(e) => update("data_inicio", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={form.data_fim}
                onChange={(e) => update("data_fim", e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Volume e Preço */}
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Volume e Preço</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Volume Mensal (MWh)</Label>
              <Input
                type="number"
                step="0.01"
                min={0.1}
                max={500}
                value={form.volume_mensal_mwh || ""}
                onChange={(e) => update("volume_mensal_mwh", Number(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">Máx: 500 MWh (CCEE/ANEEL)</p>
            </div>
            <div className="space-y-1.5">
              <Label>Preço (R$/MWh)</Label>
              <Input
                type="number"
                step="0.01"
                min={0.01}
                value={form.preco_mwh || ""}
                onChange={(e) => update("preco_mwh", Number(e.target.value))}
                required
              />
            </div>
          </div>
          {precoTotal > 0 && (
            <p className="text-sm font-medium tabular-nums">
              Preço mensal total: R$ {precoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {/* Fonte e Indexador */}
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Fonte e Reajuste</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Fonte de Energia</Label>
              <Select
                value={form.fonte_energia}
                onValueChange={(v) => update("fonte_energia", v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Convencional">Convencional</SelectItem>
                  <SelectItem value="Incentivada">Incentivada</SelectItem>
                  <SelectItem value="Renovável">Renovável</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Indexador de Reajuste</Label>
              <Select
                value={form.indexador_reajuste}
                onValueChange={(v) => update("indexador_reajuste", v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="IPCA">IPCA</SelectItem>
                  <SelectItem value="IGPM">IGPM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Flexibilidade */}
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Limites de Flexibilidade</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Mínima (%)</Label>
              <Input
                type="number"
                step="0.01"
                min={0.8}
                max={1}
                value={form.flexibilidade_min}
                onChange={(e) => update("flexibilidade_min", Number(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">80% a 100%</p>
            </div>
            <div className="space-y-1.5">
              <Label>Máxima (%)</Label>
              <Input
                type="number"
                step="0.01"
                min={1}
                max={1.2}
                value={form.flexibilidade_max}
                onChange={(e) => update("flexibilidade_max", Number(e.target.value))}
                required
              />
              <p className="text-xs text-muted-foreground">100% a 120%</p>
            </div>
          </div>
        </div>

        {/* Sazonalização */}
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Sazonalização Trimestral
            </h2>
            <span
              className={`text-sm font-bold tabular-nums ${sazonValid ? "text-emerald" : "text-destructive"
                }`}
            >
              {(sazonTotal * 100).toFixed(1)}%
            </span>
          </div>

          <Progress
            value={sazonPercent}
            className="h-2"
          />

          <div className="grid grid-cols-4 gap-3">
            {(["q1", "q2", "q3", "q4"] as const).map((q, i) => {
              const labels = ["Q1 (Jan-Mar)", "Q2 (Abr-Jun)", "Q3 (Jul-Set)", "Q4 (Out-Dez)"];
              const key = `sazonalizacao_${q}` as keyof typeof form;
              return (
                <div key={q} className="space-y-1.5">
                  <Label className="text-xs">{labels[i]}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    max={1}
                    value={form[key] as number}
                    onChange={(e) => update(key, Number(e.target.value))}
                    className="tabular-nums"
                    required
                  />
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {((form[key] as number) * 100).toFixed(0)}%
                  </p>
                </div>
              );
            })}
          </div>

          {!sazonValid && sazonTotal > 0 && (
            <p className="text-xs text-destructive">
              A soma deve ser exatamente 100%. Atual: {(sazonTotal * 100).toFixed(1)}%
            </p>
          )}
        </div>

        {/* Documento */}
        <div className="bg-card border rounded-lg p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Documento do Contrato (opcional)</h2>
          <p className="text-xs text-muted-foreground">
            O arquivo PDF será enviado após a criação do contrato e vinculado com metadados (RF1.3).
          </p>

          <div className="space-y-1.5">
            <Label>Arquivo PDF</Label>
            <Input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setDocumentoFile(e.target.files?.[0] || null)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo do Documento</Label>
              <Input
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                placeholder="Ex: Contrato PDF"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Input
                value={descricaoDocumento}
                onChange={(e) => setDescricaoDocumento(e.target.value)}
                placeholder="Descrição opcional"
                maxLength={500}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading || !sazonValid}>
            {loading ? "Salvando..." : "Criar Contrato"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/contratos/acl")}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
