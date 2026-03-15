// ============ ENUMS ============
export type FonteEnergia = "Convencional" | "Incentivada" | "Renovável";
export type IndexadorReajuste = "IPCA" | "IGPM";
export type StatusContrato = "Ativo" | "Vencido" | "Cancelado";
export type SubgrupoTarifario = "A1" | "A2" | "A3" | "A4";
export type Modalidade = "Faturamento por Demanda" | "Faturamento por Medição";
export type TipoFornecedor = "Distribuidora" | "Comercializadora";
export type StatusHomologacao = "Pendente" | "Aprovado" | "Reprovado";
export type PerfilUsuario = "Admin" | "Analista" | "Gestor" | "Fornecedor";

// ============ AUTH ============
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token?: string;
  access_token?: string;
  token_type?: string;
  perfil?: PerfilUsuario;
  nome?: string;
  id?: number;
  email?: string;
  usuario?: Usuario;
  user?: Usuario;
}

export interface Usuario {
  id: number;
  email: string;
  nome: string;
  perfil: PerfilUsuario;
}

// ============ RF1.1 - ACL ============
export interface CreateContratoACLRequest {
  unidade_id: number;
  fornecedor_id: number;
  data_inicio: string;
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

export interface ContratoACLDTO {
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

// ============ RF1.2 - CUSD ============
export interface CreateContratoCUSDRequest {
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

export interface ContratoCUSDDTO {
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

// ============ RF1.3 - DOCUMENTOS ============
export interface UploadDocumentoRequest {
  arquivo: File;
  contrato_id: number;
  tipo_documento: string;
  descricao?: string;
}

export interface DocumentoDTO {
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

// ============ RF1.5 - ALERTAS ============
export interface AlertaDTO {
  id: number;
  titulo: string;
  descricao: string;
  status: "Ativo" | "Acionado" | "Resolvido" | "Arquivado";
  data_criacao: string;
}

// ============ RF1.4 - FORNECEDORES ============
export interface CreateFornecedorRequest {
  razao_social: string;
  cnpj: string;
  tipo: TipoFornecedor;
  contato_nome?: string;
  contato_email?: string;
  contato_telefone?: string;
}

export interface FornecedorDTO {
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
  motivo_reprovacao?: string;
}

// ============ API ============
export interface ApiError {
  status: number;
  message: string;
  error_code: string;
  details?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// ============ RBAC ============
export const RBAC_PERMISSIONS: Record<string, PerfilUsuario[]> = {
  "contratos.criar": ["Admin", "Analista"],
  "contratos.editar": ["Admin", "Analista"],
  "contratos.deletar": ["Admin", "Analista"],
  "contratos.ver": ["Admin", "Analista", "Gestor"],
  "fornecedores.criar": ["Admin", "Analista"],
  "fornecedores.ver": ["Admin", "Analista", "Gestor"],
  "fornecedores.homologar": ["Admin", "Analista"],
};
