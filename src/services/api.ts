import type {
  LoginRequest,
  LoginResponse,
  CreateContratoACLRequest,
  ContratoACLDTO,
  CreateContratoCUSDRequest,
  ContratoCUSDDTO,
  CreateFornecedorRequest,
  FornecedorDTO,
  DocumentoDTO,
  UploadDocumentoRequest,
  AlertaDTO,
  PaginatedResponse,
  ApiError,
} from "@/types/synapse";
import axios, { AxiosError } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
export const API_ERROR_EVENT = "synapse:api-error";

function getToken(): string | null {
  return localStorage.getItem("synapse_token");
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const payload = error.response?.data;
    const fallbackMessage = error.message || "Erro desconhecido";
    const message = payload?.details || payload?.message || fallbackMessage;

    if (status === 401 || status === 403) {
      localStorage.removeItem("synapse_token");
      localStorage.removeItem("synapse_user");
      window.location.href = "/login";
    }

    if (status === 400) {
      window.dispatchEvent(
        new CustomEvent(API_ERROR_EVENT, {
          detail: {
            status,
            message,
            code: payload?.error_code,
          },
        })
      );
    }

    return Promise.reject({
      status: status ?? 500,
      message,
      error_code: payload?.error_code || "UNKNOWN",
      details: payload?.details,
    } as ApiError);
  }
);

async function request<T>(endpoint: string, config?: object): Promise<T> {
  const response = await api.request<T>({
    url: endpoint,
    ...config,
  });
  return response.data;
}

export const apiClient = {
  // Auth
  login: (data: LoginRequest) =>
    request<LoginResponse>("/usuarios/login", {
      method: "POST",
      data,
    }),

  // RF1.1 - ACL
  createContratoACL: (data: CreateContratoACLRequest) =>
    request<ContratoACLDTO>("/contratos-acl", {
      method: "POST",
      data,
    }),
  listContratosACL: (params?: { skip?: number; limit?: number; status?: string }) => {
    const search = new URLSearchParams();
    if (params?.skip) search.set("skip", String(params.skip));
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.status) search.set("status", params.status);
    return request<PaginatedResponse<ContratoACLDTO>>(`/contratos-acl?${search}`);
  },
  deleteContratoACL: (id: number) =>
    request(`/contratos-acl/${id}`, { method: "DELETE" }),

  // RF1.2 - CUSD
  createContratoCUSD: (data: CreateContratoCUSDRequest) =>
    request<ContratoCUSDDTO>("/contratos-cusd", {
      method: "POST",
      data: {
        ...data,
        demanda_ponta_kw: data.demanda_ponta_kw,
        demanda_fora_ponta_kw: data.demanda_fora_ponta_kw,
      },
    }),
  listContratosCUSD: (params?: { skip?: number; limit?: number }) => {
    const search = new URLSearchParams();
    if (params?.skip) search.set("skip", String(params.skip));
    if (params?.limit) search.set("limit", String(params.limit));
    return request<PaginatedResponse<ContratoCUSDDTO>>(`/contratos-cusd?${search}`);
  },

  // RF1.4 - Fornecedores
  createFornecedor: (data: CreateFornecedorRequest) =>
    request<FornecedorDTO>("/fornecedores", {
      method: "POST",
      data,
    }),
  listFornecedores: (params?: { skip?: number; limit?: number; status?: string }) => {
    const search = new URLSearchParams();
    if (params?.skip) search.set("skip", String(params.skip));
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.status) search.set("status", params.status);
    return request<PaginatedResponse<FornecedorDTO>>(`/fornecedores?${search}`);
  },
  homologarFornecedor: (id: number, observacoes?: string) =>
    request<FornecedorDTO>(`/fornecedores/${id}/homologar`, {
      method: "POST",
      data: { observacoes },
    }),
  rejeitarFornecedor: (id: number, motivo: string) =>
    request<FornecedorDTO>(`/fornecedores/${id}/rejeitar`, {
      method: "POST",
      data: { motivo },
    }),

  // RF1.3 - Documentos
  uploadDocumento: ({ arquivo, contrato_id, tipo_documento, descricao }: UploadDocumentoRequest) => {
    const formData = new FormData();
    formData.append("arquivo", arquivo);
    formData.append("contrato_id", String(contrato_id));
    formData.append("tipo_documento", tipo_documento);
    if (descricao) {
      formData.append("descricao", descricao);
    }

    return request<DocumentoDTO>("/documentos/upload", {
      method: "POST",
      data: formData,
    });
  },

  // RF1.5 - Alertas
  listAlertas: (params?: { status?: string }) => {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    return request<PaginatedResponse<AlertaDTO>>(`/alertas?${search}`);
  },
};
