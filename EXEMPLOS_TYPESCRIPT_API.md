# 🔧 Exemplos de Integração - API Synapse Energy

## TypeScript Interfaces (Para Copiar e Colar)

### RF1.1 - Contratos ACL

```typescript
// ============ TIPOS SYNAPSE ENERGY ============

// Enums
type FonteEnergia = "Convencional" | "Incentivada" | "Renovável";
type IndexadorReajuste = "IPCA" | "IGPM";
type StatusContrato = "Ativo" | "Vencido" | "Cancelado";

// Request DTOs
interface CreateContratoACLRequest {
  unidade_id: number;
  fornecedor_id: number;
  data_inicio: string; // ISO 8601
  data_fim: string;
  volume_mensal_mwh: number;
  preco_mwh: number;
  flexibilidade_min: number;
  flexibilidade_max: number;
  fonte_energia: FonteEnergia;
  indexador_reajuste: IndexadorReajuste;
  sazonalizacao_q1: number;
  sazonalizacao_q2: number;
  sazonalizacao_q3: number;
  sazonalizacao_q4: number;
}

// Response DTOs
interface ContratoACLDTO {
  id: number;
  unidade_id: number;
  fornecedor_id: number;
  data_inicio: string;
  data_fim: string;
  volume_mensal_mwh: number;
  preco_mwh: number;
  preco_mensal_total?: number;
  flexibilidade_min: number;
  flexibilidade_max: number;
  fonte_energia: FonteEnergia;
  indexador_reajuste: IndexadorReajuste;
  sazonalizacao_q1: number;
  sazonalizacao_q2: number;
  sazonalizacao_q3: number;
  sazonalizacao_q4: number;
  status: StatusContrato;
  data_criacao: string;
  usuario_criador_id: number;
  data_ultima_edicao?: string;
}

interface ContratoACLDetailDTO extends ContratoACLDTO {
  unidade: {
    id: number;
    nome: string;
    cnpj: string;
  };
  fornecedor: {
    id: number;
    razao_social: string;
    cnpj: string;
    tipo: string;
  };
}

// ============ VALIDADORES ============

class ContratoACLValidator {
  static validateSazonalizacao(q1: number, q2: number, q3: number, q4: number): boolean {
    const soma = q1 + q2 + q3 + q4;
    // Tolerar pequenas variações de ponto flutuante
    return Math.abs(soma - 1.0) < 0.001;
  }

  static validateFlexibilidade(min: number, max: number): boolean {
    return min > 0 && max > 0 && min <= max;
  }

  static validateVolume(volume: number): boolean {
    return volume > 0 && volume <= 500;
  }

  static validateDatas(inicio: Date, fim: Date): boolean {
    return inicio < fim;
  }
}

// ============ EXEMPLOS DE USO ============

// Exemplo 1: Criar contrato com validações
async function criarContratoACL(
  token: string,
  dados: CreateContratoACLRequest
): Promise<ContratoACLDTO> {
  // Validar sazonalização
  if (!ContratoACLValidator.validateSazonalizacao(
    dados.sazonalizacao_q1,
    dados.sazonalizacao_q2,
    dados.sazonalizacao_q3,
    dados.sazonalizacao_q4
  )) {
    throw new Error("Sazonalização deve somar 100%");
  }

  // Validar flexibilidade
  if (!ContratoACLValidator.validateFlexibilidade(
    dados.flexibilidade_min,
    dados.flexibilidade_max
  )) {
    throw new Error("Flexibilidade inválida");
  }

  // Validar volume
  if (!ContratoACLValidator.validateVolume(dados.volume_mensal_mwh)) {
    throw new Error("Volume deve estar entre 0 e 500 MWh");
  }

  // Validar datas
  const inicio = new Date(dados.data_inicio);
  const fim = new Date(dados.data_fim);
  if (!ContratoACLValidator.validateDatas(inicio, fim)) {
    throw new Error("Data de início deve ser antes da data de fim");
  }

  const response = await fetch(
    "https://api.synapse-energy.com/api/contratos-acl",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Erro ${response.status}: ${error.message}`);
  }

  return response.json();
}

// Exemplo 2: Listar contratos com filtros
async function listarContratosACL(
  token: string,
  filtros?: {
    skip?: number;
    limit?: number;
    status?: StatusContrato;
    unidade_id?: number;
  }
): Promise<{ data: ContratoACLDTO[]; pagination: any }> {
  const params = new URLSearchParams();
  if (filtros?.skip) params.append("skip", filtros.skip.toString());
  if (filtros?.limit) params.append("limit", filtros.limit.toString());
  if (filtros?.status) params.append("status", filtros.status);
  if (filtros?.unidade_id) params.append("unidade_id", filtros.unidade_id.toString());

  const response = await fetch(
    `https://api.synapse-energy.com/api/contratos-acl?${params}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error(`Erro ${response.status}`);
  return response.json();
}
```

---

### RF1.2 - Contratos CUSD

```typescript
// ============ TIPOS ============

type SubgrupoTarifario = "A1" | "A2" | "A3" | "A4";
type Modalidade = "Faturamento por Demanda" | "Faturamento por Medição";

interface CreateContratoCUSDRequest {
  unidade_id: number;
  data_inicio: string;
  data_fim: string;
  subgrupo_tarifario: SubgrupoTarifario;
  demanda_ponta_kw: number;
  demanda_fora_ponta_kw: number;
  tensao_fornecimento: number;
  modalidade: Modalidade;
  observacoes?: string;
}

interface ContratoCUSDDTO {
  id: number;
  unidade_id: number;
  data_inicio: string;
  data_fim: string;
  subgrupo_tarifario: SubgrupoTarifario;
  demanda_ponta_kw: number;
  demanda_fora_ponta_kw: number;
  tensao_fornecimento: number;
  modalidade: Modalidade;
  encargos: {
    cde_ponta_mensalizado: number;
    cde_fora_ponta_mensalizado: number;
    ess_mensalizado: number;
    total_encargos_mensalizados: number;
  };
  status: StatusContrato;
  data_criacao: string;
  usuario_criador_id: number;
}

// ============ VALIDADORES ============

class ContratoCUSDValidator {
  static readonly TENSOES_VALIDAS = [110, 220, 380, 440, 11000, 13800, 34500, 138000];

  static validateTensao(tensao: number): boolean {
    return this.TENSOES_VALIDAS.includes(tensao);
  }

  static validateDemanda(demanda: number): boolean {
    return demanda > 0;
  }
}

// ============ EXEMPLO DE USO ============

async function criarContratoCUSD(
  token: string,
  dados: CreateContratoCUSDRequest
): Promise<ContratoCUSDDTO> {
  // Validar tensão
  if (!ContratoCUSDValidator.validateTensao(dados.tensao_fornecimento)) {
    throw new Error(
      `Tensão inválida. Válidas: ${ContratoCUSDValidator.TENSOES_VALIDAS.join(", ")}`
    );
  }

  // Validar demandas
  if (!ContratoCUSDValidator.validateDemanda(dados.demanda_ponta_kw)) {
    throw new Error("Demanda ponta deve ser > 0");
  }
  if (!ContratoCUSDValidator.validateDemanda(dados.demanda_fora_ponta_kw)) {
    throw new Error("Demanda fora de ponta deve ser > 0");
  }

  const response = await fetch(
    "https://api.synapse-energy.com/api/contratos-cusd",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Erro ${response.status}: ${error.message}`);
  }

  return response.json();
}
```

---

### RF1.3 - Upload de Documentos

```typescript
// ============ TIPOS ============

interface DocumentoDTO {
  id: number;
  arquivo_nome_original: string;
  arquivo_nome_armazenado: string;
  arquivo_tamanho_bytes: number;
  arquivo_mime_type: string;
  contrato_id: number;
  tipo_documento: string;
  descricao?: string;
  url_download?: string;
  metadados: {
    enviado_por_usuario_id: number;
    data_envio: string;
    endereco_ip: string;
    checksum_sha256: string;
  };
  alerta_expiracao: {
    data_vencimento_contrato: string;
    data_alerta_1_ano: string;
    ativo: boolean;
  };
}

// ============ VALIDADORES ============

class DocumentoValidator {
  static readonly EXTENSOES_PERMITIDAS = [".pdf", ".docx", ".xlsx", ".txt"];
  static readonly TAMANHO_MAXIMO_MB = 10;

  static validateExtensao(nomeArquivo: string): boolean {
    const extensao = nomeArquivo.toLowerCase().substring(nomeArquivo.lastIndexOf("."));
    return this.EXTENSOES_PERMITIDAS.includes(extensao);
  }

  static validateTamanho(tamanhoBytes: number): boolean {
    const tamanhoMB = tamanhoBytes / (1024 * 1024);
    return tamanhoMB <= this.TAMANHO_MAXIMO_MB;
  }

  static getMimeType(extensao: string): string {
    const mimeTypes: Record<string, string> = {
      ".pdf": "application/pdf",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".txt": "text/plain",
    };
    return mimeTypes[extensao.toLowerCase()] || "application/octet-stream";
  }
}

// ============ EXEMPLO DE USO ============

async function uploadDocumento(
  token: string,
  arquivo: File,
  contratoId: number,
  tipoDocumento: string,
  descricao?: string
): Promise<DocumentoDTO> {
  // Validar extensão
  if (!DocumentoValidator.validateExtensao(arquivo.name)) {
    throw new Error(
      `Tipo de arquivo não permitido. Permitidos: ${DocumentoValidator.EXTENSOES_PERMITIDAS.join(", ")}`
    );
  }

  // Validar tamanho
  if (!DocumentoValidator.validateTamanho(arquivo.size)) {
    const tamanhoMB = arquivo.size / (1024 * 1024);
    throw new Error(
      `Arquivo muito grande (${tamanhoMB.toFixed(2)} MB). Máximo: ${DocumentoValidator.TAMANHO_MAXIMO_MB} MB`
    );
  }

  // Preparar FormData
  const formData = new FormData();
  formData.append("arquivo", arquivo);
  formData.append("contrato_id", contratoId.toString());
  formData.append("tipo_documento", tipoDocumento);
  if (descricao) {
    formData.append("descricao", descricao);
  }

  const response = await fetch(
    "https://api.synapse-energy.com/api/documentos/upload",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Erro ${response.status}: ${error.message}`);
  }

  return response.json();
}

// ============ DOWNLOAD COM VERIFICAÇÃO ============

async function downloadDocumento(
  token: string,
  documentoId: number
): Promise<Blob> {
  const response = await fetch(
    `https://api.synapse-energy.com/api/documentos/${documentoId}/download`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Erro ${response.status}: ${error.message}`);
  }

  // Extrair nome do arquivo do header
  const contentDisposition = response.headers.get("x-filename");
  const nomeArquivo = contentDisposition || "download";

  const blob = await response.blob();

  // Disparar download no navegador
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);

  return blob;
}
```

---

### RF1.4 - Fornecedores

```typescript
// ============ TIPOS ============

type TipoFornecedor = "Distribuidora" | "Comercializadora";
type StatusHomologacao = "Pendente" | "Aprovado" | "Reprovado";

interface CreateFornecedorRequest {
  razao_social: string;
  cnpj: string;
  tipo: TipoFornecedor;
  contato_nome?: string;
  contato_email?: string;
  contato_telefone?: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_cep?: string;
}

interface FornecedorDTO {
  id: number;
  razao_social: string;
  cnpj: string;
  tipo: TipoFornecedor;
  contato_nome?: string;
  contato_email?: string;
  contato_telefone?: string;
  status_homologacao: StatusHomologacao;
  data_criacao: string;
  usuario_criador_id: number;
  data_homologacao?: string;
  usuario_homologador_id?: number;
  motivo_reprovacao?: string;
}

// ============ VALIDADORES ============

class FornecedorValidator {
  /**
   * Valida CNPJ (dígitos verificadores)
   * Implementa algoritmo CNPJ padrão
   */
  static validateCNPJ(cnpj: string): boolean {
    // Remover formatação
    const cnpjLimpo = cnpj.replace(/\D/g, "");

    // Verificar tamanho
    if (cnpjLimpo.length !== 14) return false;

    // Verificar se não é sequência repetida
    if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;

    // Calcular dígitos verificadores
    const [a, b, c, d, e, f, g, h, i, j, k, l, v1, v2] = cnpjLimpo
      .split("")
      .map(Number);

    // Primeiro dígito
    let soma = a * 5 + b * 4 + c * 3 + d * 2 + e * 9 + f * 8 + g * 7 + h * 6 + i * 5 + j * 4 + k * 3 + l * 2;
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;

    if (digito1 !== v1) return false;

    // Segundo dígito
    soma = a * 6 + b * 5 + c * 4 + d * 3 + e * 2 + f * 9 + g * 8 + h * 7 + i * 6 + j * 5 + k * 4 + l * 3 + digito1 * 2;
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;

    return digito2 === v2;
  }

  static validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  static validateTelefone(telefone: string): boolean {
    const telefoneLimpo = telefone.replace(/\D/g, "");
    return telefoneLimpo.length >= 10;
  }
}

// ============ EXEMPLO DE USO ============

async function criarFornecedor(
  token: string,
  dados: CreateFornecedorRequest
): Promise<FornecedorDTO> {
  // Validar CNPJ
  if (!FornecedorValidator.validateCNPJ(dados.cnpj)) {
    throw new Error("CNPJ inválido");
  }

  // Validar email se fornecido
  if (dados.contato_email && !FornecedorValidator.validateEmail(dados.contato_email)) {
    throw new Error("Email inválido");
  }

  // Validar telefone se fornecido
  if (dados.contato_telefone && !FornecedorValidator.validateTelefone(dados.contato_telefone)) {
    throw new Error("Telefone inválido (mínimo 10 dígitos)");
  }

  const response = await fetch(
    "https://api.synapse-energy.com/api/fornecedores",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Erro ${response.status}: ${error.error_code} - ${error.details}`);
  }

  return response.json();
}

// ============ HOMOLOGAÇÃO ============

async function homologarFornecedor(
  token: string,
  fornecedorId: number,
  observacoes?: string
): Promise<FornecedorDTO> {
  const response = await fetch(
    `https://api.synapse-energy.com/api/fornecedores/${fornecedorId}/homologar`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ observacoes }),
    }
  );

  if (!response.ok) throw new Error("Erro ao homologar");
  return response.json();
}

// ============ REJEIÇÃO ============

async function rejeitarFornecedor(
  token: string,
  fornecedorId: number,
  motivo: string
): Promise<FornecedorDTO> {
  const response = await fetch(
    `https://api.synapse-energy.com/api/fornecedores/${fornecedorId}/rejeitar`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ motivo }),
    }
  );

  if (!response.ok) throw new Error("Erro ao rejeitar");
  return response.json();
}
```

---

### RF1.5 - Alertas

```typescript
// ============ TIPOS ============

type TipoAlerta = "Vencimento" | "Desvio" | "Regulatorio";
type PrioridadeAlerta = "Baixa" | "Média" | "Alta" | "Crítica";
type StatusAlerta = "Ativo" | "Acionado" | "Resolvido" | "Arquivado";

interface CreateAlertaRequest {
  tipo: TipoAlerta;
  contrato_id?: number;
  unidade_id?: number;
  dias_antecipacao: number;
  descricao: string;
  prioridade?: PrioridadeAlerta;
}

interface AlertaDTO {
  id: number;
  tipo: TipoAlerta;
  contrato_id?: number;
  unidade_id?: number;
  dias_antecipacao: number;
  descricao: string;
  prioridade: PrioridadeAlerta;
  status: StatusAlerta;
  data_criacao: string;
  data_acionamento?: string;
  data_resolucao?: string;
  usuario_criador_id: number;
  usuario_responsavel_id?: number;
  notificacoes_enviadas: number;
  usuarios_notificados: number[];
}

// ============ LÓGICA DE ALERTAS AUTOMÁTICOS ============

class AlertaAutomatico {
  /**
   * Calcula se um alerta deve ser disparado
   * 
   * Regra: Se dias_para_evento <= dias_antecipacao, dispara
   */
  static shouldTrigger(
    dataEvento: Date,
    diasAntecipacao: number
  ): boolean {
    const agora = new Date();
    const diasParaEvento = Math.floor(
      (dataEvento.getTime() - agora.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diasParaEvento <= diasAntecipacao && diasParaEvento > 0;
  }

  /**
   * Gera alertas automáticos para um contrato
   */
  static generateAlertsForContrato(
    contratoId: number,
    dataVencimento: Date
  ): CreateAlertaRequest[] {
    const alertas: CreateAlertaRequest[] = [];

    // 180 dias antes
    if (this.shouldTrigger(dataVencimento, 180)) {
      alertas.push({
        tipo: "Vencimento",
        contrato_id: contratoId,
        dias_antecipacao: 180,
        descricao: "Contrato vencerá em 6 meses",
        prioridade: "Média",
      });
    }

    // 90 dias antes
    if (this.shouldTrigger(dataVencimento, 90)) {
      alertas.push({
        tipo: "Vencimento",
        contrato_id: contratoId,
        dias_antecipacao: 90,
        descricao: "Contrato vencerá em 3 meses",
        prioridade: "Alta",
      });
    }

    // 60 dias antes
    if (this.shouldTrigger(dataVencimento, 60)) {
      alertas.push({
        tipo: "Vencimento",
        contrato_id: contratoId,
        dias_antecipacao: 60,
        descricao: "Contrato vencerá em 2 meses",
        prioridade: "Alta",
      });
    }

    return alertas;
  }

  /**
   * Verifica desvio de consumo
   */
  static checkConsumoDesvio(
    consumoReal: number,
    consumoContratado: number
  ): boolean {
    const percentual = (consumoReal / consumoContratado) * 100;
    return percentual >= 95; // 95% = alerta
  }
}

// ============ EXEMPLO DE USO ============

async function criarAlerta(
  token: string,
  dados: CreateAlertaRequest
): Promise<AlertaDTO> {
  const response = await fetch(
    "https://api.synapse-energy.com/api/alertas",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
    }
  );

  if (!response.ok) throw new Error("Erro ao criar alerta");
  return response.json();
}

// ============ DISPARAR ALERTA ============

async function acionarAlerta(
  token: string,
  alertaId: number,
  usuariosNotificar: number[],
  canalNotificacao: string = "Email"
): Promise<AlertaDTO> {
  const response = await fetch(
    `https://api.synapse-energy.com/api/alertas/${alertaId}/acionar`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuarios_notificar: usuariosNotificar,
        canal_notificacao: canalNotificacao,
      }),
    }
  );

  if (!response.ok) throw new Error("Erro ao acionar alerta");
  return response.json();
}

// ============ RESOLVER ALERTA ============

async function resolverAlerta(
  token: string,
  alertaId: number,
  descricaoResolucao: string
): Promise<AlertaDTO> {
  const response = await fetch(
    `https://api.synapse-energy.com/api/alertas/${alertaId}/resolver`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        descricao_resolucao: descricaoResolucao,
      }),
    }
  );

  if (!response.ok) throw new Error("Erro ao resolver alerta");
  return response.json();
}
```

---

## Padrão HTTP Client Recomendado

```typescript
// ============ HTTP CLIENT REUTILIZÁVEL ============

class SynapseAPIClient {
  private baseURL: string;
  private token: string;

  constructor(baseURL: string = "https://api.synapse-energy.com/api") {
    this.baseURL = baseURL;
    this.token = "";
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders(contentType: string = "application/json") {
    return {
      "Authorization": `Bearer ${this.token}`,
      "Content-Type": contentType,
      "X-Request-ID": this.generateRequestId(),
    };
  }

  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async get<T>(path: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async post<T>(path: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async put<T>(path: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async uploadFile<T>(
    path: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<T> {
    const formData = new FormData();
    formData.append("arquivo", file);
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await fetch(`${this.baseURL}${path}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.token}`,
      },
      body: formData,
    });

    return this.handleResponse(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json();
      throw new SynapseAPIError(
        error.status || response.status,
        error.message || response.statusText,
        error.error_code,
        error.details
      );
    }

    try {
      return await response.json();
    } catch {
      return {} as T;
    }
  }
}

// ============ CLASSE DE ERRO CUSTOMIZADA ============

class SynapseAPIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public error_code?: string,
    public details?: string
  ) {
    super(message);
    this.name = "SynapseAPIError";
  }
}

// ============ USO ============

const client = new SynapseAPIClient();
client.setToken(jwtToken);

// Listar contratos
const contratos = await client.get<ContratoACLDTO[]>("/contratos-acl", {
  skip: 0,
  limit: 10,
});

// Criar contrato
const novoContrato = await client.post<ContratoACLDTO>(
  "/contratos-acl",
  contratoData
);
```

---

**Documento de Exemplos v1.0**  
**Pronto para copiar e colar no seu frontend!**

