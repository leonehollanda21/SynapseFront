import type {
  LoginRequest,
  LoginResponse,
  CreateContratoACLRequest,
  ContratoACLDTO,
  CreateContratoCUSDRequest,
  ContratoCUSDDTO,
  CreateFornecedorRequest,
  FornecedorDTO,
  PaginatedResponse,
} from "@/types/synapse";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function getToken(): string | null {
  return localStorage.getItem("synapse_token");
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("synapse_token");
    localStorage.removeItem("synapse_user");
    window.location.href = "/login";
    throw new Error("Token expirado");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: "Erro desconhecido",
      error_code: "UNKNOWN",
    }));
    throw error;
  }

  return response.json();
}

export const apiClient = {
  // Auth
  login: (data: LoginRequest) =>
    request<LoginResponse>("/usuarios/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // RF1.1 - ACL
  createContratoACL: (data: CreateContratoACLRequest) =>
    request<ContratoACLDTO>("/contratos-acl", {
      method: "POST",
      body: JSON.stringify(data),
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
      body: JSON.stringify(data),
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
      body: JSON.stringify(data),
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
      body: JSON.stringify({ observacoes }),
    }),
  rejeitarFornecedor: (id: number, motivo: string) =>
    request<FornecedorDTO>(`/fornecedores/${id}/rejeitar`, {
      method: "POST",
      body: JSON.stringify({ motivo }),
    }),
};
