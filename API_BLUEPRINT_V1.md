# 📋 API Blueprint - Synapse Energy v1.0

**Data**: 14 de Março de 2026  
**Status**: Production Ready  
**Versão**: 1.0.0  
**Base URL**: `https://api.synapse-energy.com/api`  
**Autenticação**: JWT Bearer Token

---

## 📑 Sumário

1. [RF1.1 - Contratos ACL](#rf11---contratos-acl)
2. [RF1.2 - Contratos CUSD](#rf12---contratos-cusd)
3. [RF1.3 - Documentos](#rf13---documentos)
4. [RF1.4 - Fornecedores](#rf14---fornecedores)
5. [RF1.5 - Alertas](#rf15---alertas)
6. [Tratamento Global de Erros](#tratamento-global-de-erros)
7. [Headers Padrão](#headers-padrão)
8. [Autenticação e RBAC](#autenticação-e-rbac)

---

## 🔐 Autenticação e RBAC

### Headers Padrão Obrigatórios

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
X-Request-ID: {UUID}  (opcional, para rastreamento)
```

### Matriz de Perfis e Permissões

| Método | Endpoint | Admin | Analista | Gestor | Fornecedor |
|--------|----------|-------|----------|--------|------------|
| POST   | /contratos-acl | ✅ | ✅ | ❌ | ❌ |
| GET    | /contratos-acl | ✅ | ✅ | ✅ | ❌ |
| PUT    | /contratos-acl/{id} | ✅ | ✅ | ❌ | ❌ |
| DELETE | /contratos-acl/{id} | ✅ | ✅ | ❌ | ❌ |
| POST   | /fornecedores | ✅ | ✅ | ❌ | ❌ |
| GET    | /fornecedores | ✅ | ✅ | ✅ | ❌ |

---

# RF1.1 - Contratos ACL

> **Objetivo**: Gerenciar contratos no Ambiente de Contratação Livre com validações de sazonalização, volume CCEE e flexibilidade.
> 
> **Conformidade ANEEL**: Atende disposições de registro de contratos bilaterais em ambiente livre.

## 1. Criar Contrato ACL

### POST `/api/contratos-acl`

Cria um novo contrato ACL com todas as validações de sazonalização e volume.

#### 🔒 Segurança

- **Perfis Permitidos**: Analista, Admin
- **Autenticação**: Bearer Token (obrigatório)
- **Rate Limit**: 10 requisições/minuto
- **Auditoria**: Registrada em logs imutáveis (RF5.2)

#### 📤 Request

```typescript
interface ContratoACLCreate {
  // Vínculo com Unidade Consumidora
  unidade_id: number;                    // ID da UC (obrigatório)
  
  // Vínculo com Fornecedor
  fornecedor_id: number;                 // ID do fornecedor (obrigatório)
  
  // Período Contratual
  data_inicio: string;                   // ISO 8601: 2024-01-01 (obrigatório)
  data_fim: string;                      // ISO 8601: 2024-12-31 (obrigatório)
  
  // Volume e Preço
  volume_mensal_mwh: number;             // 0.1 a 500 MWh (obrigatório)
                                          // Validação: deve ser > 0 e <= 500
  preco_mwh: number;                     // R$/MWh em reais (obrigatório)
                                          // Validação: deve ser > 0
  
  // Flexibilidade Contratual (RF1.1)
  flexibilidade_min: number;             // % mínima: 0.80 a 1.00 (obrigatório)
  flexibilidade_max: number;             // % máxima: 1.00 a 1.20 (obrigatório)
                                          // Validação: min <= max e ambos > 0
  
  // Fonte de Energia
  fonte_energia: "Convencional"           // Tipo de fonte (obrigatório)
               | "Incentivada"            // Valores fixos
               | "Renovável";
  
  // Indexador de Reajuste
  indexador_reajuste: "IPCA"              // Índice para reajuste (obrigatório)
                    | "IGPM";              // Valores fixos
  
  // ⭐ Sazonalização Mensal (RF1.1 - CRÍTICO)
  sazonalizacao_q1: number;              // Q1 (Jan-Mar) em % (obrigatório)
                                          // Validação: >= 0 e <= 1.0
  sazonalizacao_q2: number;              // Q2 (Abr-Jun) em % (obrigatório)
  sazonalizacao_q3: number;              // Q3 (Jul-Set) em % (obrigatório)
  sazonalizacao_q4: number;              // Q4 (Out-Dez) em % (obrigatório)
                                          // ⭐ Soma DEVE ser exatamente 1.0 (100%)
}
```

#### 📥 Response (201 Created)

```typescript
interface ContratoACLResponse {
  id: number;                             // ID único do contrato
  unidade_id: number;
  fornecedor_id: number;
  data_inicio: string;                    // ISO 8601
  data_fim: string;                       // ISO 8601
  volume_mensal_mwh: number;
  preco_mensal_total?: number;            // volume_mensal_mwh * preco_mwh
  preco_mwh: number;
  flexibilidade_min: number;
  flexibilidade_max: number;
  fonte_energia: string;
  indexador_reajuste: string;
  sazonalizacao_q1: number;
  sazonalizacao_q2: number;
  sazonalizacao_q3: number;
  sazonalizacao_q4: number;
  status: "Ativo" | "Vencido" | "Cancelado";
  data_criacao: string;                   // ISO 8601 com timezone
  usuario_criador_id: number;
  data_ultima_edicao?: string;
}
```

#### ❌ Erros Esperados

```typescript
interface ErrorResponse {
  status: number;
  message: string;
  error_code: string;
  details?: string;
}

// Exemplos de Erro:
{
  "status": 400,
  "message": "Validação falhou",
  "error_code": "SEASONALIZATION_INVALID_SUM",
  "details": "Soma de sazonalização deve ser exatamente 100% (recebido: 99%)"
}

{
  "status": 400,
  "message": "Volume inválido",
  "error_code": "VOLUME_EXCEEDS_CCEE_LIMIT",
  "details": "Volume máximo é 500 MWh (recebido: 550 MWh)"
}

{
  "status": 400,
  "message": "Flexibilidade inválida",
  "error_code": "FLEXIBILITY_INVALID",
  "details": "Flexibilidade mínima deve ser <= máxima"
}

{
  "status": 401,
  "message": "Não autorizado",
  "error_code": "UNAUTHORIZED",
  "details": "Token inválido ou expirado"
}

{
  "status": 403,
  "message": "Permissão negada",
  "error_code": "FORBIDDEN",
  "details": "Apenas Analista e Admin podem criar contratos"
}

{
  "status": 404,
  "message": "Unidade não encontrada",
  "error_code": "UNIDADE_NOT_FOUND",
  "details": "Unidade consumidora com ID 999 não existe"
}

{
  "status": 422,
  "message": "Validação de dados falhou",
  "error_code": "VALIDATION_ERROR",
  "details": "Campo 'volume_mensal_mwh' deve ser número > 0"
}
```

#### 📝 Regra de Negócio

- **Sazonalização 100%** (RF1.1): Soma dos 4 trimestres DEVE ser exatamente 100% (1.0)
- **Volume CCEE**: Máximo de 500 MWh/mês conforme limite regulatório ANEEL/CCEE
- **Flexibilidade**: Min 80% a 100%, Max 100% a 120% do volume contratado
- **Período**: data_fim DEVE ser maior que data_inicio
- **Auditoria**: Ação registrada com timestamp e ID do usuário (RF5.2)

#### 🔍 Exemplo Completo

**Request:**
```json
{
  "unidade_id": 1,
  "fornecedor_id": 5,
  "data_inicio": "2024-01-01",
  "data_fim": "2024-12-31",
  "volume_mensal_mwh": 100.0,
  "preco_mwh": 250.50,
  "flexibilidade_min": 0.90,
  "flexibilidade_max": 1.10,
  "fonte_energia": "Renovável",
  "indexador_reajuste": "IPCA",
  "sazonalizacao_q1": 0.25,
  "sazonalizacao_q2": 0.25,
  "sazonalizacao_q3": 0.25,
  "sazonalizacao_q4": 0.25
}
```

**Response (201):**
```json
{
  "id": 42,
  "unidade_id": 1,
  "fornecedor_id": 5,
  "data_inicio": "2024-01-01T00:00:00Z",
  "data_fim": "2024-12-31T23:59:59Z",
  "volume_mensal_mwh": 100.0,
  "preco_mensal_total": 25050.00,
  "preco_mwh": 250.50,
  "flexibilidade_min": 0.90,
  "flexibilidade_max": 1.10,
  "fonte_energia": "Renovável",
  "indexador_reajuste": "IPCA",
  "sazonalizacao_q1": 0.25,
  "sazonalizacao_q2": 0.25,
  "sazonalizacao_q3": 0.25,
  "sazonalizacao_q4": 0.25,
  "status": "Ativo",
  "data_criacao": "2026-03-14T10:30:45.123Z",
  "usuario_criador_id": 1
}
```

---

## 2. Listar Contratos ACL

### GET `/api/contratos-acl`

Lista contratos ACL com filtros opcionais e paginação.

#### 🔒 Segurança

- **Perfis Permitidos**: Admin, Analista, Gestor
- **Autenticação**: Bearer Token
- **Isolamento de Dados**: Gestor/Analista veem apenas contratos da sua empresa

#### 📤 Query Parameters

```typescript
interface ContratoACLListParams {
  skip?: number;                          // Padrão: 0
  limit?: number;                         // Padrão: 20, Máximo: 100
  status?: "Ativo" | "Vencido" | "Cancelado";  // Filtro opcional
  unidade_id?: number;                    // Filtro por UC
  fornecedor_id?: number;                 // Filtro por fornecedor
  source_energia?: string;                // Filtro por fonte
  data_inicio_desde?: string;             // ISO 8601
  data_fim_ate?: string;                  // ISO 8601
}
```

#### 📥 Response (200 OK)

```typescript
interface ContratoACLListResponse {
  data: ContratoACLResponse[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  meta: {
    timestamp: string;                    // ISO 8601
    version: string;
  };
}
```

---

## 3. Obter Contrato ACL por ID

### GET `/api/contratos-acl/{id}`

Retorna detalhes completos de um contrato específico.

#### 🔒 Segurança

- **Perfis Permitidos**: Admin, Analista, Gestor
- **Isolamento**: Verifica se UC pertence à empresa do usuário

#### 📥 Response (200 OK)

```typescript
interface ContratoACLDetailResponse extends ContratoACLResponse {
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
  histórico_edições?: {
    data: string;
    usuario_id: number;
    mudanças: string[];
  }[];
}
```

---

## 4. Editar Contrato ACL

### PUT `/api/contratos-acl/{id}`

Atualiza campos de um contrato existente.

#### 🔒 Segurança

- **Perfis Permitidos**: Analista, Admin
- **Restrição**: Não pode editar contratos vencidos ou cancelados
- **Auditoria**: Registra valores anterior e novo (RF5.2)

#### 📤 Request

```typescript
interface ContratoACLUpdate {
  // Permitido editar:
  volume_mensal_mwh?: number;
  preco_mwh?: number;
  flexibilidade_min?: number;
  flexibilidade_max?: number;
  sazonalizacao_q1?: number;
  sazonalizacao_q2?: number;
  sazonalizacao_q3?: number;
  sazonalizacao_q4?: number;
  
  // NÃO pode editar:
  // - id, unidade_id, fornecedor_id
  // - data_inicio, data_fim
  // - status, data_criacao
}
```

#### ❌ Erros Específicos

```json
{
  "status": 409,
  "message": "Contrato vencido",
  "error_code": "CONTRACT_EXPIRED",
  "details": "Não é permitido editar contratos vencidos"
}

{
  "status": 400,
  "message": "Sazonalização após edição inválida",
  "error_code": "SEASONALIZATION_INVALID",
  "details": "Soma após edição: 98% (deve ser 100%)"
}
```

---

## 5. Deletar Contrato ACL

### DELETE `/api/contratos-acl/{id}`

Cancela um contrato (soft delete com auditoria).

#### 🔒 Segurança

- **Perfis Permitidos**: Admin, Analista
- **Soft Delete**: Marca como "Cancelado", não deleta dados

#### 📥 Response (200 OK)

```typescript
{
  "success": true,
  "message": "Contrato cancelado com sucesso",
  "id": 42,
  "novo_status": "Cancelado",
  "data_cancelamento": "2026-03-14T10:45:00Z"
}
```

---

# RF1.2 - Contratos CUSD

> **Objetivo**: Gerenciar contratos de conexão e uso do sistema de distribuição com cálculo automático de encargos ANEEL (CDE/ESS).
>
> **Conformidade ANEEL**: Atende disposições de registro de contatos CUSD para Grupo A.

## 1. Criar Contrato CUSD

### POST `/api/contratos-cusd`

Cria contrato CUSD com cálculo automático de encargos.

#### 🔒 Segurança

- **Perfis Permitidos**: Analista, Admin
- **Autenticação**: Bearer Token

#### 📤 Request

```typescript
interface ContratoCUSDCreate {
  // Vínculo
  unidade_id: number;                     // ID da UC (obrigatório)
  
  // Período
  data_inicio: string;                    // ISO 8601 (obrigatório)
  data_fim: string;                       // ISO 8601 (obrigatório)
  
  // Subgrupo Tarifário (RF1.2)
  subgrupo_tarifario: "A1"                // Grupo A apenas (obrigatório)
                    | "A2"
                    | "A3"
                    | "A4";
  
  // Demanda de Potência
  demanda_ponta_kw: number;               // kW (obrigatório, > 0)
  demanda_fora_ponta_kw: number;          // kW (obrigatório, > 0)
  
  // Tensão
  tensao_fornecimento: number;            // Volts (obrigatório)
                                           // Valores válidos: 110, 220, 380, 440, 
                                           // 11000, 13800, 34500, 138000
  
  // Modalidade
  modalidade: "Faturamento por Demanda"    // (obrigatório)
            | "Faturamento por Medição";
  
  // Observações opcionais
  observacoes?: string;                   // Max 500 caracteres
}
```

#### 📥 Response (201 Created)

```typescript
interface ContratoCUSDResponse {
  id: number;
  unidade_id: number;
  data_inicio: string;
  data_fim: string;
  subgrupo_tarifario: string;
  demanda_ponta_kw: number;
  demanda_fora_ponta_kw: number;
  tensao_fornecimento: number;
  modalidade: string;
  
  // ⭐ Encargos Calculados Automaticamente (RF1.2)
  encargos: {
    cde_ponta_mensalizado: number;        // R$/mês = demanda_ponta * taxa_CDE
    cde_fora_ponta_mensalizado: number;   // R$/mês = demanda_fora_ponta * taxa_CDE
    ess_mensalizado: number;              // R$/mês = (demanda_ponta + demanda_fora_ponta) * taxa_ESS
    total_encargos_mensalizados: number;  // Soma total em R$/mês
  };
  
  status: "Ativo" | "Vencido";
  data_criacao: string;
  usuario_criador_id: number;
}
```

#### ❌ Erros Esperados

```json
{
  "status": 400,
  "message": "Subgrupo tarifário inválido",
  "error_code": "INVALID_TARIFF_GROUP",
  "details": "Apenas subgrupos A1-A4 são permitidos para CUSD"
}

{
  "status": 400,
  "message": "Demanda inválida",
  "error_code": "INVALID_DEMAND",
  "details": "Demanda deve ser > 0 kW"
}

{
  "status": 400,
  "message": "Tensão não suportada",
  "error_code": "INVALID_VOLTAGE",
  "details": "Tensão 500V não é suportada. Use: 110, 220, 380, 440, 11000, 13800, 34500, 138000"
}
```

#### 📝 Regra de Negócio

- **Cálculo CDE/ESS**: Automático baseado em tarifas ANEEL vigentes
- **Atualização de Tarifas**: Sistema sincroniza com ANEEL mensalmente
- **Encargos Mensalizados**: Incluem todos os encargos regulatórios CCEE

#### 🔍 Exemplo

**Request:**
```json
{
  "unidade_id": 1,
  "data_inicio": "2024-01-01",
  "data_fim": "2024-12-31",
  "subgrupo_tarifario": "A4",
  "demanda_ponta_kw": 100.0,
  "demanda_fora_ponta_kw": 80.0,
  "tensao_fornecimento": 13800,
  "modalidade": "Faturamento por Demanda"
}
```

**Response (201):**
```json
{
  "id": 15,
  "unidade_id": 1,
  "data_inicio": "2024-01-01T00:00:00Z",
  "data_fim": "2024-12-31T23:59:59Z",
  "subgrupo_tarifario": "A4",
  "demanda_ponta_kw": 100.0,
  "demanda_fora_ponta_kw": 80.0,
  "tensao_fornecimento": 13800,
  "modalidade": "Faturamento por Demanda",
  "encargos": {
    "cde_ponta_mensalizado": 500.00,
    "cde_fora_ponta_mensalizado": 300.00,
    "ess_mensalizado": 360.00,
    "total_encargos_mensalizados": 1160.00
  },
  "status": "Ativo",
  "data_criacao": "2026-03-14T10:30:00Z",
  "usuario_criador_id": 1
}
```

---

## 2. Listar Contratos CUSD

### GET `/api/contratos-cusd`

Lista contratos CUSD com paginação.

#### 📤 Query Parameters

```typescript
interface ContratoCUSDListParams {
  skip?: number;
  limit?: number;
  subgrupo_tarifario?: string;
  unidade_id?: number;
  status?: "Ativo" | "Vencido";
}
```

---

## 3. Obter Contrato CUSD

### GET `/api/contratos-cusd/{id}`

Retorna detalhes completos com histórico de ajustes tarifários.

#### 📥 Response (200 OK)

```typescript
interface ContratoCUSDDetailResponse extends ContratoCUSDResponse {
  historico_tarifas?: {
    data: string;
    taxa_cde_anterior: number;
    taxa_cde_nova: number;
    taxa_ess_anterior: number;
    taxa_ess_nova: number;
  }[];
}
```

---

# RF1.3 - Documentos

> **Objetivo**: Gerenciar upload seguro de documentos vinculados a contratos com alerta de expiração 1 ano após vencimento.
>
> **Conformidade LGPD**: Conformidade com retenção e proteção de dados pessoais.

## 1. Upload de Documento

### POST `/api/documentos/upload`

Realiza upload seguro de documento vinculado a contrato.

#### 🔒 Segurança

- **Perfis Permitidos**: Analista, Admin
- **Tipos Permitidos**: PDF, DOCX, XLSX, TXT (extensão validada)
- **Tamanho Máximo**: 10 MB
- **Scan de Vírus**: Integrado (estrutura pronta)
- **Auditoria**: Registra upload com usuário e IP

#### 📤 Request (multipart/form-data)

```typescript
interface DocumentoUpload {
  arquivo: File;                           // Arquivo binário (obrigatório)
                                           // Max 10 MB
                                           // Tipos: .pdf, .docx, .xlsx, .txt
  
  contrato_id: number;                     // ID do contrato (obrigatório)
  tipo_documento: string;                  // ex: "Contrato PDF", "Proposta", 
                                           // "Termo de Aceite" (obrigatório)
  
  descricao?: string;                      // Descrição opcional (max 500 chars)
}
```

#### 📥 Response (201 Created)

```typescript
interface DocumentoResponse {
  id: number;
  arquivo_nome_original: string;           // Nome original do arquivo
  arquivo_nome_armazenado: string;         // Nome criptografado no servidor
  arquivo_tamanho_bytes: number;
  arquivo_mime_type: string;
  
  contrato_id: number;
  tipo_documento: string;
  descricao?: string;
  
  url_download?: string;                   // URL com token de segurança
  
  metadados: {
    enviado_por_usuario_id: number;
    data_envio: string;                    // ISO 8601
    endereco_ip: string;
    checksum_sha256: string;               // Para verificar integridade
  };
  
  // ⭐ Alerta de Expiração (RF1.3)
  alerta_expiracao: {
    data_vencimento_contrato: string;      // ISO 8601
    data_alerta_1_ano: string;             // 1 ano após vencimento
    ativo: boolean;
  };
}
```

#### ❌ Erros Esperados

```json
{
  "status": 400,
  "message": "Tipo de arquivo não permitido",
  "error_code": "INVALID_FILE_TYPE",
  "details": "Apenas PDF, DOCX, XLSX e TXT são permitidos (recebido: .exe)"
}

{
  "status": 413,
  "message": "Arquivo muito grande",
  "error_code": "FILE_TOO_LARGE",
  "details": "Tamanho máximo: 10 MB (recebido: 15 MB)"
}

{
  "status": 400,
  "message": "Arquivo suspeito",
  "error_code": "MALWARE_DETECTED",
  "details": "Arquivo flagged como suspeito pelo antivírus"
}

{
  "status": 404,
  "message": "Contrato não encontrado",
  "error_code": "CONTRACT_NOT_FOUND",
  "details": "Contrato ID 999 não existe"
}
```

#### 📝 Regra de Negócio

- **Vinculação Automática**: Documento vinculado ao contrato fornecido
- **Alerta 1 Ano** (RF1.3): Sistema cria alerta de expiração 1 ano após data_fim do contrato
- **Imutabilidade**: Documentos não podem ser editados, apenas excluídos com auditoria
- **Criptografia**: Arquivos armazenados criptografados em servidor seguro

---

## 2. Listar Documentos de um Contrato

### GET `/api/documentos`

Lista documentos com filtros por contrato.

#### 📤 Query Parameters

```typescript
interface DocumentoListParams {
  contrato_id: number;                    // Filtro por contrato (obrigatório)
  skip?: number;
  limit?: number;
  tipo_documento?: string;                // Filtro por tipo
}
```

---

## 3. Download de Documento

### GET `/api/documentos/{id}/download`

Download seguro com token temporário.

#### 📥 Response

- **Content-Type**: Mime-type do arquivo original
- **Content-Length**: Tamanho do arquivo
- **X-Filename**: Nome original do arquivo (para download)

#### ❌ Erros

```json
{
  "status": 403,
  "message": "Acesso negado",
  "error_code": "ACCESS_DENIED",
  "details": "Documento pertence a UC de outra empresa"
}

{
  "status": 410,
  "message": "Arquivo expirado",
  "error_code": "FILE_EXPIRED",
  "details": "Arquivo foi deletado (retenção 1 ano + 30 dias)"
}
```

---

## 4. Deletar Documento

### DELETE `/api/documentos/{id}`

Soft delete com registro em auditoria.

#### 🔒 Segurança

- **Perfis Permitidos**: Admin, ou Analista que fez upload
- **Auditoria**: Registra motivo da exclusão

---

# RF1.4 - Fornecedores

> **Objetivo**: Cadastro e homologação de fornecedores com validação CNPJ via Receita Federal.
>
> **Conformidade**: Conformidade com disposições CCEE para comercializadoras e distribuidoras.

## 1. Criar Fornecedor

### POST `/api/fornecedores`

Cadastra novo fornecedor com validação de CNPJ.

#### 🔒 Segurança

- **Perfis Permitidos**: Analista, Admin
- **Validação CNPJ**: Integrado com API Receita Federal (mock em dev)
- **Auditoria**: Registra tentativa de criação

#### 📤 Request

```typescript
interface FornecedorCreate {
  // Dados Básicos (RF1.4)
  razao_social: string;                   // Nome da empresa (obrigatório, max 255)
  cnpj: string;                           // 14 dígitos (obrigatório)
                                           // Formato: XX.XXX.XXX/XXXX-XX ou XXXXXXXXXXXXXX
                                           // Validação: dígitos verificadores + Receita Federal
  
  tipo: "Distribuidora"                    // Tipo de fornecedor (obrigatório)
      | "Comercializadora";
  
  // Contato (RF1.4)
  contato_nome: string;                   // Nome do responsável (opcional)
  contato_email: string;                  // Email válido (opcional)
                                           // Validação: RFC 5322
  contato_telefone: string;               // Telefone (opcional)
                                           // Validação: min 10 dígitos
  
  // Endereço (opcional)
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_estado?: string;
  endereco_cep?: string;
}
```

#### 📥 Response (201 Created)

```typescript
interface FornecedorResponse {
  id: number;
  razao_social: string;
  cnpj: string;
  tipo: string;
  
  contato_nome?: string;
  contato_email?: string;
  contato_telefone?: string;
  
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  
  // ⭐ Status de Homologação (RF1.4)
  status_homologacao: "Pendente"           // Estados do fluxo de homologação
                    | "Aprovado"
                    | "Reprovado";
  
  data_criacao: string;                    // ISO 8601
  usuario_criador_id: number;
  data_homologacao?: string;
  usuario_homologador_id?: number;
  
  motivo_reprovacao?: string;              // Se status = Reprovado
}
```

#### ❌ Erros Esperados

```json
{
  "status": 400,
  "message": "CNPJ inválido",
  "error_code": "INVALID_CNPJ",
  "details": "Dígitos verificadores não correspondem ao algoritmo CNPJ"
}

{
  "status": 400,
  "message": "CNPJ duplicado",
  "error_code": "CNPJ_ALREADY_EXISTS",
  "details": "Fornecedor com CNPJ 12.345.678/0001-90 já cadastrado"
}

{
  "status": 400,
  "message": "Validação Receita Federal falhou",
  "error_code": "RECEITA_FEDERAL_VALIDATION_FAILED",
  "details": "CNPJ não encontrado ou inativo na Receita Federal"
}

{
  "status": 400,
  "message": "Email inválido",
  "error_code": "INVALID_EMAIL",
  "details": "Email 'contato@' não é válido"
}

{
  "status": 400,
  "message": "Telefone inválido",
  "error_code": "INVALID_PHONE",
  "details": "Telefone deve ter mínimo 10 dígitos"
}
```

#### 📝 Regra de Negócio

- **Validação CNPJ** (RF1.4): 
  - Valida dígitos verificadores
  - Consulta API Receita Federal em produção
  - Rejeita CNPJ inativo/cancelado
  
- **Status Pendente**: Novo fornecedor inicia como "Pendente" (não pode enviar propostas)
- **Homologação**: Admin/Analista aprova ou rejeita
- **CNPJ Único**: Não permite duplicatas

---

## 2. Listar Fornecedores

### GET `/api/fornecedores`

Lista fornecedores com filtros.

#### 📤 Query Parameters

```typescript
interface FornecedorListParams {
  skip?: number;
  limit?: number;
  status_homologacao?: "Pendente" | "Aprovado" | "Reprovado";
  tipo?: "Distribuidora" | "Comercializadora";
  cnpj?: string;                          // Busca exata
}
```

---

## 3. Obter Fornecedor

### GET `/api/fornecedores/{id}`

Retorna detalhes completos com histórico de propostas.

#### 📥 Response (200 OK)

```typescript
interface FornecedorDetailResponse extends FornecedorResponse {
  propostas_enviadas_count: number;       // Quantidade de propostas
  
  historico_propostas?: {
    id: number;
    data: string;
    status: string;
    valor_proposto: number;
  }[];
}
```

---

## 4. Homologar Fornecedor

### POST `/api/fornecedores/{id}/homologar`

Aprova fornecedor para envio de propostas.

#### 🔒 Segurança

- **Perfis Permitidos**: Admin, Analista
- **Auditoria**: Registra aprovação com usuário

#### 📤 Request

```typescript
interface FornecedorHomologar {
  observacoes?: string;                   // Observações da aprovação (opcional)
}
```

#### 📥 Response (200 OK)

```json
{
  "id": 5,
  "status_homologacao": "Aprovado",
  "data_homologacao": "2026-03-14T10:30:00Z",
  "usuario_homologador_id": 1,
  "observacoes": "Fornecedor validado - CNPJ ativo"
}
```

#### ❌ Erros

```json
{
  "status": 409,
  "message": "Status não permite homologação",
  "error_code": "INVALID_STATUS_TRANSITION",
  "details": "Fornecedor já aprovado não pode ser homologado novamente"
}
```

---

## 5. Rejeitar Fornecedor

### POST `/api/fornecedores/{id}/rejeitar`

Rejeita fornecedor (bloqueia de enviar propostas).

#### 📤 Request

```typescript
interface FornecedorRejeitar {
  motivo: string;                         // Motivo da rejeição (obrigatório, max 500)
}
```

#### 📥 Response (200 OK)

```json
{
  "id": 5,
  "status_homologacao": "Reprovado",
  "data_rejeicao": "2026-03-14T10:30:00Z",
  "motivo_reprovacao": "CNPJ em situação de suspensão na Receita Federal"
}
```

#### ❌ Erros - Bloqueio de Operações

```json
{
  "status": 403,
  "message": "Fornecedor não homologado",
  "error_code": "FORNECEDOR_NOT_APPROVED",
  "details": "Apenas fornecedores com status 'Aprovado' podem enviar propostas"
}

{
  "status": 403,
  "message": "Fornecedor reprovado",
  "error_code": "FORNECEDOR_REJECTED",
  "details": "Fornecedor foi reprovado e não pode mais enviar propostas"
}
```

---

# RF1.5 - Alertas

> **Objetivo**: Gerar alertas automáticos e proativos para vencimentos e desvios de consumo.
>
> **Conformidade**: Atende disposições de comunicação proativa e rastreamento de conformidade.

## 1. Criar Alerta Manual

### POST `/api/alertas`

Cria alerta manual ou automático.

#### 🔒 Segurança

- **Perfis Permitidos**: Analista, Admin, Gestor (apenas leitura)
- **Auditoria**: Registra criação de alerta

#### 📤 Request

```typescript
interface AlertaCreate {
  // Tipo de Alerta (RF1.5)
  tipo: "Vencimento"                      // Categoria do alerta (obrigatório)
      | "Desvio"
      | "Regulatorio";
  
  // Vínculo
  contrato_id?: number;                   // Se tipo = Vencimento ou Desvio
  unidade_id?: number;                    // Se tipo = Desvio
  
  // Temporalidade (RF1.5)
  dias_antecipacao: number;               // Dias antes do evento (obrigatório)
                                           // Valores recomendados: 180, 90, 60
  
  // Descrição
  descricao: string;                      // Texto do alerta (obrigatório, max 500)
  
  // Prioridade
  prioridade: "Baixa"                     // Nível de urgência (padrão: Média)
            | "Média"
            | "Alta"
            | "Crítica";
}
```

#### 📥 Response (201 Created)

```typescript
interface AlertaResponse {
  id: number;
  tipo: string;
  contrato_id?: number;
  unidade_id?: number;
  
  dias_antecipacao: number;
  descricao: string;
  prioridade: string;
  
  // Status do Alerta
  status: "Ativo"                         // Estados possíveis
        | "Acionado"
        | "Resolvido"
        | "Arquivado";
  
  data_criacao: string;                   // ISO 8601
  data_acionamento?: string;              // Quando o alerta foi disparado
  data_resolucao?: string;                // Quando foi resolvido
  
  usuario_criador_id: number;
  usuario_responsavel_id?: number;        // Responsável por resolver
  
  // Notificações
  notificacoes_enviadas: number;
  usuarios_notificados: number[];
}
```

---

## 2. Listar Alertas Ativos

### GET `/api/alertas`

Lista alertas com filtros e paginação.

#### 📤 Query Parameters

```typescript
interface AlertaListParams {
  skip?: number;
  limit?: number;
  status?: "Ativo" | "Acionado" | "Resolvido" | "Arquivado";
  tipo?: "Vencimento" | "Desvio" | "Regulatorio";
  prioridade?: "Baixa" | "Média" | "Alta" | "Crítica";
  contrato_id?: number;
  unidade_id?: number;
  somente_ativos?: boolean;               // Padrão: true
}
```

---

## 3. Alertas Automáticos Temporais (RF1.5)

### GET `/api/alertas/automaticos/pendentes`

Retorna alertas que devem ser disparados NOW (chamado por scheduler).

#### 📋 Alertas Automáticos Gerados pelo Sistema

O sistema gera automaticamente:

```typescript
interface AlertaAutomatico {
  // Vencimento (RF1.5)
  vencimento_180_dias: {
    tipo: "Vencimento",
    dias_antecipacao: 180,
    descricao: "Contrato vencerá em 6 meses",
    prioridade: "Média"
  },
  
  vencimento_90_dias: {
    tipo: "Vencimento",
    dias_antecipacao: 90,
    descricao: "Contrato vencerá em 3 meses",
    prioridade: "Alta"
  },
  
  vencimento_60_dias: {
    tipo: "Vencimento",
    dias_antecipacao: 60,
    descricao: "Contrato vencerá em 2 meses",
    prioridade: "Alta"
  },
  
  // Desvio de Consumo (RF1.5)
  desvio_95_porcento: {
    tipo: "Desvio",
    descricao: "Consumo atingiu 95% do contratado",
    prioridade: "Alta"
  },
  
  // Regulatório (RF1.5)
  revisao_regulatoria_30_dias: {
    tipo: "Regulatorio",
    dias_antecipacao: 30,
    descricao: "Revisão regulatória ANEEL em 1 mês",
    prioridade: "Média"
  }
}
```

#### 📥 Response (200 OK)

```typescript
interface AlertaAutomaticosPendentes {
  alertas_a_disparar: AlertaResponse[];
  total: number;
  timestamp_execucao_recomendada: string; // ISO 8601
}
```

---

## 4. Acionar Alerta

### POST `/api/alertas/{id}/acionar`

Marca alerta como acionado e envia notificações.

#### 🔒 Segurança

- **Automático**: Sistema aciona automaticamente quando condição atingida
- **Manual**: Admin pode acionar manualmente

#### 📤 Request

```typescript
interface AlertaAcionar {
  usuarios_notificar: number[];           // IDs dos usuários a notificar
  canal_notificacao: "Email"              // Canal de entrega
                   | "SMS"
                   | "Sistema"
                   | "Todos";
  
  observacoes?: string;
}
```

#### 📥 Response (200 OK)

```json
{
  "id": 42,
  "status": "Acionado",
  "data_acionamento": "2026-03-14T10:45:00Z",
  "notificacoes_enviadas": 3,
  "usuarios_notificados": [1, 2, 3],
  "mensagem": "Alerta acionado - 3 notificações enviadas"
}
```

---

## 5. Resolver Alerta

### POST `/api/alertas/{id}/resolver`

Marca alerta como resolvido.

#### 📤 Request

```typescript
interface AlertaResolver {
  descricao_resolucao: string;            // Como foi resolvido (obrigatório)
  usuario_responsavel_id?: number;        // Responsável (padrão: current_user)
}
```

#### 📥 Response (200 OK)

```json
{
  "id": 42,
  "status": "Resolvido",
  "data_resolucao": "2026-03-14T11:30:00Z",
  "usuario_responsavel_id": 1,
  "descricao_resolucao": "Contrato renovado - novo período de 1 ano"
}
```

---

## 6. Arquivar Alerta

### POST `/api/alertas/{id}/arquivar`

Move alerta para histórico (soft archive).

#### 📥 Response (200 OK)

```json
{
  "id": 42,
  "status": "Arquivado",
  "data_arquivo": "2026-03-14T11:45:00Z"
}
```

---

# Tratamento Global de Erros

## Status HTTP Padrão

| Status | Significado | Exemplo |
|--------|-------------|---------|
| **200** | OK | GET bem-sucedido |
| **201** | Created | POST bem-sucedido |
| **204** | No Content | DELETE bem-sucedido |
| **400** | Bad Request | Dados inválidos |
| **401** | Unauthorized | Token ausente/inválido |
| **403** | Forbidden | Permissão insuficiente |
| **404** | Not Found | Recurso não existe |
| **409** | Conflict | Estado inválido (ex: editar contrato vencido) |
| **413** | Payload Too Large | Arquivo > 10 MB |
| **422** | Unprocessable Entity | Validação de schema falhou |
| **429** | Too Many Requests | Rate limit excedido |
| **500** | Internal Server Error | Erro no servidor |
| **503** | Service Unavailable | Manutenção ou sobrecarga |

---

## Estrutura Padrão de Erro

```typescript
interface StandardError {
  status: number;
  timestamp: string;                      // ISO 8601
  path: string;                           // Ex: /api/contratos-acl
  method: string;                         // GET, POST, PUT, DELETE
  
  error: {
    message: string;                      // Mensagem legível
    error_code: string;                   // Código único (ex: INVALID_CNPJ)
    details?: string;                     // Detalhes técnicos
  };
  
  // Para validação de schema (422)
  validation_errors?: {
    field: string;
    message: string;
  }[];
  
  // Para rastreamento
  request_id?: string;                    // UUID para suporte
  trace_id?: string;                      // Para correlação de logs
}
```

---

## Erros de Autenticação e RBAC

```json
{
  "status": 401,
  "message": "Autenticação falhou",
  "error_code": "AUTHENTICATION_FAILED",
  "errors": [
    "Token não fornecido no header Authorization",
    "Formato esperado: Authorization: Bearer {token}"
  ]
}

{
  "status": 401,
  "message": "Token inválido",
  "error_code": "INVALID_TOKEN",
  "details": "Token expirou em 2026-03-14T10:00:00Z"
}

{
  "status": 403,
  "message": "Permissão negada",
  "error_code": "INSUFFICIENT_PERMISSIONS",
  "details": "Perfil 'Fornecedor' não tem permissão para criar contratos. Permissões requeridas: [Analista, Admin]"
}
```

---

# Headers Padrão

## Request Headers (Obrigatórios)

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

## Request Headers (Recomendados)

```
X-Request-ID: {UUID}                    # Para rastreamento
User-Agent: {Cliente}                   # Ex: Lovable/1.0
Accept: application/json
Accept-Language: pt-BR
```

## Response Headers

```
Content-Type: application/json
Content-Length: {bytes}
X-Request-ID: {UUID}                    # Mesmo do request
X-Response-Time: {ms}                   # Tempo de processamento
X-Rate-Limit-Limit: 100
X-Rate-Limit-Remaining: 87
X-Rate-Limit-Reset: {timestamp}
```

---

# Paginação Padrão

```typescript
interface PaginationResponse {
  data: T[];
  pagination: {
    skip: number;                        // Offset
    limit: number;                       // Quantidade retornada
    total: number;                       // Total de registros
    hasMore: boolean;                    // Há mais registros?
    page: number;                        // Número da página (calculado)
    pages: number;                       // Total de páginas
  };
}
```

---

# Rate Limiting

```
Por IP:
- 1000 requisições / hora
- 100 requisições / minuto

Por Token:
- 10000 requisições / dia
- 1000 requisições / hora

Endpoints específicos:
- POST (Create): 10 req/min
- PUT (Update): 20 req/min
- GET (Read): 100 req/min
- DELETE: 5 req/min
```

---

# Webhooks (Opcional para Futuro)

```typescript
interface WebhookEvent {
  id: string;
  timestamp: string;
  event_type: "contrato.criado" 
            | "alerta.acionado"
            | "fornecedor.aprovado";
  data: any;
  retry_count: number;
}
```

---

# Changelog de Versões

## v1.0.0 (2026-03-14)
- ✅ RF1.1: Contratos ACL com sazonalização
- ✅ RF1.2: Contratos CUSD com cálculo de encargos
- ✅ RF1.3: Upload de documentos com alerta 1 ano
- ✅ RF1.4: Fornecedores com CNPJ
- ✅ RF1.5: Alertas automáticos temporais
- ✅ RBAC: 4 perfis (Admin, Analista, Gestor, Fornecedor)
- ✅ Auditoria: Logs imutáveis (RF5.2)

---

# Notas para Front-end (Lovable/IA)

## Pontos Críticos

1. **Sazonalização (RF1.1)**: DEVE somar exatamente 100% - sem exceções
2. **Token JWT**: Validade de 24h - implementar refresh logic
3. **Isolamento de Dados**: Fornecedores nunca veem dados internos
4. **Auditoria**: Cada POST/PUT/DELETE é registrado imutavelmente
5. **Rate Limiting**: Implementar backoff exponencial em 429

## Recomendações de UX

- Mostrar preview de arquivo antes de upload
- Validar CNPJ em tempo real (frontend pode usar https://www.cnpj.dev/)
- Avisar antes de deletar (soft delete, mas ainda assim criar confirmação)
- Mostrar status de homologação de fornecedor com badge visual
- Alerta visual para contratos próximos ao vencimento (60 dias)

## Tratamento de Erros Amigável

```
SEASONALIZATION_INVALID_SUM →
"A soma dos trimestres deve ser 100%. Atualmente: 99%"

CNPJ_ALREADY_EXISTS →
"Este CNPJ já está cadastrado. Deseja recuperar?"

TOKEN_EXPIRED →
"Sessão expirada. Por favor, faça login novamente"
```

---

**Documento versão 1.0**  
**Data**: 14 de Março de 2026  
**Mantido por**: Synapse Energy Engineering  
**Próxima revisão**: 30 de Junho de 2026

