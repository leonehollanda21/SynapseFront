# 📱 Sumário Executivo - API Synapse Energy para Front-end

**Para**: Lovable/IA Front-end  
**De**: Synapse Energy Engineering  
**Data**: 14 de Março de 2026  
**Prioridade**: ⭐⭐⭐⭐⭐

---

## TL;DR - O Essencial

Esta API fornece 5 módulos principais para gerenciamento de energia no Mercado Livre:

| Módulo | Função | Status | Docs |
|--------|--------|--------|------|
| **RF1.1** | Contratos ACL | ✅ Pronto | [Ir](#rf11) |
| **RF1.2** | Contratos CUSD | ✅ Pronto | [Ir](#rf12) |
| **RF1.3** | Upload Documentos | ✅ Pronto | [Ir](#rf13) |
| **RF1.4** | Gerenciar Fornecedores | ✅ Pronto | [Ir](#rf14) |
| **RF1.5** | Alertas Automáticos | ✅ Pronto | [Ir](#rf15) |

---

## 🎯 Fluxo Principal de Uso

```
1. Usuário faz Login
   └─ Recebe JWT Token (24h de validade)

2. CRUD de Contratos
   ├─ POST /contratos-acl (Criar)
   ├─ GET /contratos-acl (Listar)
   ├─ PUT /contratos-acl/{id} (Editar)
   └─ DELETE /contratos-acl/{id} (Cancelar)

3. CRUD de Fornecedores
   ├─ POST /fornecedores (Criar)
   ├─ GET /fornecedores (Listar)
   ├─ POST /fornecedores/{id}/homologar (Aprovar)
   └─ POST /fornecedores/{id}/rejeitar (Rejeitar)

4. Upload de Documentos
   └─ POST /documentos/upload (Form-data)

5. Alertas Automáticos
   ├─ GET /alertas (Listar)
   ├─ POST /alertas/{id}/acionar (Disparar)
   └─ POST /alertas/{id}/resolver (Resolver)
```

---

## 🔑 Pontos Críticos (LEIA ISTO!)

### 1. Sazonalização DEVE ser 100% (RF1.1)

**ERRADO:**
```json
{
  "sazonalizacao_q1": 0.25,
  "sazonalizacao_q2": 0.25,
  "sazonalizacao_q3": 0.25,
  "sazonalizacao_q4": 0.24  // ❌ Total: 99%
}
```

**CERTO:**
```json
{
  "sazonalizacao_q1": 0.25,
  "sazonalizacao_q2": 0.25,
  "sazonalizacao_q3": 0.25,
  "sazonalizacao_q4": 0.25  // ✅ Total: 100%
}
```

**Frontend deve:**
- Validar em tempo real
- Mostrar indicador visual (progressbar até 100%)
- Bloquear submit se não for exatamente 100%

---

### 2. JWT Token (24h de validade)

**Token está expirando?** Implemente refresh:

```typescript
// Quando receber 401
if (error.status === 401 && error.error_code === "TOKEN_EXPIRED") {
  // Chamar POST /usuarios/login novamente
  // Guardar novo token
  // Retry requisição anterior
}
```

---

### 3. RBAC - Nem todo perfil pode fazer tudo

| Operação | Admin | Analista | Gestor | Fornecedor |
|----------|-------|----------|--------|------------|
| Criar Contrato | ✅ | ✅ | ❌ | ❌ |
| Ver Contratos | ✅ | ✅ | ✅ | ❌ |
| Criar Fornecedor | ✅ | ✅ | ❌ | ❌ |
| Homologar Fornecedor | ✅ | ✅ | ❌ | ❌ |
| Ver Documentos | ✅ | ✅ | ✅ | ❌ |

**Frontend deve:**
- Ocultar botões de ações não permitidas
- Mostrar mensagem 403 amigável
- Logar tentativas de acesso não autorizado

---

### 4. Isolamento de Dados (Segurança LGPD)

**Fornecedores NÃO podem ver:**
- Unidades Consumidoras da empresa
- Contratos vigentes
- Documentos internos
- Dados de outras empresas

**API bloqueará com 403** se tentar acessar dados de outro escopo.

---

### 5. Auditoria Imutável (RF5.2)

**CADA operação de escrita (POST/PUT/DELETE) é registrada:**
- Timestamp exato
- Usuário responsável
- Valores anterior e novo
- IP do cliente
- Status (sucesso/falha)

**Não preocupe:** Isso é automático no backend. Frontend apenas precisa avisar ao usuário que a ação foi registrada.

---

## 📊 Rate Limiting

```
Por IP: 1000 req/hora
Por Usuário: 10000 req/dia

Endpoints específicos:
- POST: 10 req/minuto
- PUT: 20 req/minuto
- GET: 100 req/minuto
- DELETE: 5 req/minuto
```

**Se receber 429 (Too Many Requests):**
```typescript
// Implementar backoff exponencial
let delay = 1000; // 1 segundo
while (shouldRetry && delay < 60000) {
  await sleep(delay);
  delay *= 2; // Dobra a cada tentativa
}
```

---

## 🚨 Erros Comuns e Soluções

| Erro | Causa | Solução |
|------|-------|---------|
| `INVALID_TOKEN` | Token expirado/inválido | Fazer login novamente |
| `UNAUTHORIZED` | Sem token no header | Adicionar: `Authorization: Bearer {token}` |
| `FORBIDDEN` | Perfil sem permissão | Ocultar UI da operação para este perfil |
| `SEASONALIZATION_INVALID_SUM` | Soma ≠ 100% | Validar UI em tempo real |
| `CNPJ_ALREADY_EXISTS` | Fornecedor duplicado | Mostrar opção "Recuperar?" |
| `FILE_TOO_LARGE` | Arquivo > 10 MB | Validar tamanho antes de upload |
| `INVALID_FILE_TYPE` | Extensão não permitida | Aceitar apenas: .pdf, .docx, .xlsx, .txt |

---

## 📋 Checklist de Implementação

### Fase 1: Autenticação
- [ ] Implementar login com email/senha
- [ ] Guardar JWT token em localStorage/sessionStorage
- [ ] Adicionar token a TODOS os requests
- [ ] Implementar logout

### Fase 2: Contratos ACL
- [ ] Form para criar contrato
- [ ] Validador de sazonalização em tempo real
- [ ] Listagem com filtros
- [ ] Editar contrato
- [ ] Cancelar contrato

### Fase 3: Contratos CUSD
- [ ] Form para criar CUSD
- [ ] Mostrar cálculo automático de encargos
- [ ] Listagem

### Fase 4: Fornecedores
- [ ] Form para criar fornecedor
- [ ] Validador de CNPJ (pode usar https://www.cnpj.dev/)
- [ ] Listagem com status
- [ ] Botão para homologar
- [ ] Botão para rejeitar com campo "motivo"

### Fase 5: Documentos
- [ ] Drag-and-drop para upload
- [ ] Validar tipo e tamanho
- [ ] Mostrar progresso de upload
- [ ] Listar documentos do contrato
- [ ] Link para download

### Fase 6: Alertas
- [ ] Dashboard com alertas ativos
- [ ] Botão para acioná-los
- [ ] Botão para resolver
- [ ] Visual diferenciado por prioridade

---

## 🎨 Recomendações de UX

### Sazonalização
```
Q1 (Jan-Mar):   [████████░░░░] 25%
Q2 (Abr-Jun):   [████████░░░░] 25%
Q3 (Jul-Set):   [████████░░░░] 25%
Q4 (Out-Dez):   [████████░░░░] 25%
                ─────────────────
Total:          [████████████] 100% ✅
```

### Status Visual
- **Ativo**: 🟢 Verde
- **Vencido**: 🔴 Vermelho
- **Cancelado**: ⚫ Cinza
- **Pendente**: 🟡 Amarelo
- **Aprovado**: 🟢 Verde
- **Reprovado**: 🔴 Vermelho

### Alertas por Prioridade
- **Crítica**: 🔴 Vermelho - Som + notificação
- **Alta**: 🟠 Laranja - Notificação visível
- **Média**: 🟡 Amarelo - Badge
- **Baixa**: 🔵 Azul - Lista

---

## 🔗 Recursos Principais

| Recurso | Link | Formato |
|---------|------|---------|
| **API Blueprint Completo** | `API_BLUEPRINT_V1.md` | Markdown |
| **Exemplos TypeScript** | `EXEMPLOS_TYPESCRIPT_API.md` | Código |
| **CNPJ Validator** | https://www.cnpj.dev/ | API Pública |
| **JWT Parser** | https://jwt.io/ | Debug online |

---

## 📞 Suporte e Debugging

### Headers Úteis para Debug
```
X-Request-ID: {uuid}          // Rastrear requisição
X-Rate-Limit-Remaining: 87    // Quantas requisições restam
```

### Ferramentas Recomendadas
- **Postman** ou **Insomnia**: Testar endpoints
- **Chrome DevTools**: Inspecionar requests
- **jwt.io**: Decodificar tokens

### Logs Esperados no Backend
```
✅ Token criado para usuário ID: 1
📝 Usuário admin@test.com solicitando criação de contrato ACL
✅ Contrato criado com ID: 42
📋 Auditoria registrada: Contrato 42 criado por usuário 1
```

---

## 🎯 Fluxo Detalhado de Exemplo: Criar Contrato ACL

```
1. Usuário faz login
   POST /usuarios/login
   {email, senha}
   ← Recebe JWT token

2. Frontend guarda token
   localStorage.setItem('token', jwt_token)

3. Usuário preenche form de contrato
   - Seleciona unidade (GET /unidades)
   - Seleciona fornecedor (GET /fornecedores?status=Aprovado)
   - Preenche datas
   - Preenche volume
   - Preenche sazonalização (validar em tempo real)
   - Confirma

4. Frontend valida localmente
   ✓ Sazonalização = 100%
   ✓ Volume entre 0 e 500
   ✓ Flexibilidade min <= max
   ✓ Data fim > data inicio

5. Frontend envia request
   POST /api/contratos-acl
   Headers: {Authorization: Bearer {token}}
   Body: {...dados...}

6. Backend valida tudo novamente (nunca confie no frontend!)
   ✓ Mesmas validações
   ✓ Verifica RBAC
   ✓ Verifica acesso à unidade
   ✓ Registra auditoria

7. Backend retorna 201 Created
   {id: 42, ...dados...}

8. Frontend mostra sucesso
   "Contrato criado com sucesso!"
   Redireciona para listagem

9. Auditoria no backend
   Timestamp: 2026-03-14T10:30:45.123Z
   Usuário: 1
   Ação: Criação
   Contrato: 42
   Status: Sucesso
```

---

## ✅ Conclusão

**Você tem TUDO que precisa:**

✅ API Blueprint completo (RF1.1 a RF1.5)  
✅ Exemplos TypeScript prontos para copiar/colar  
✅ Validadores lado do cliente  
✅ HTTP Client reutilizável  
✅ Tratamento de erros robusto  
✅ RBAC implementado  
✅ Auditoria imutável  

**Próximo passo:**
1. Implementar autenticação (login/logout)
2. Implementar RF1.1 (Contratos ACL)
3. Estender para outros módulos

**Time Backend:**  
Qualquer dúvida, consulte `API_BLUEPRINT_V1.md` ou `EXEMPLOS_TYPESCRIPT_API.md`

---

**Boa sorte! 🚀**

*Desenvolvido por: Synapse Energy Engineering*  
*Conformidade: RF1.1-RF1.5, RNF02, RF5.2, LGPD*

