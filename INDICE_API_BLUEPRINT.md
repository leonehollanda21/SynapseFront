# 📚 ÍNDICE FINAL - API BLUEPRINT SYNAPSE ENERGY

**Data**: 14 de Março de 2026  
**Status**: ✅ COMPLETO E PRONTO PARA FRONT-END  
**Destinatário**: Lovable / IA Front-end / Desenvolvedores

---

## 🎯 DOCUMENTOS PRINCIPAIS (LEIA NA ORDEM)

### 1. **GUIA_LOVABLE_FRONTEND.md** ⭐ COMECE AQUI
- **Tempo de leitura**: 15 minutos
- **O que é**: Introdução rápida e clara para Lovable
- **Contém**:
  - TL;DR - O essencial em 2 minutos
  - Pontos críticos que DEVEM ser entendidos
  - Checklist de implementação passo-a-passo
  - Recomendações de UX/Design
  - Fluxo detalhado de exemplo
  - Tabelas de referência rápida

**→ Comece lendo este arquivo**

---

### 2. **API_BLUEPRINT_V1.md** 📋 REFERÊNCIA TÉCNICA
- **Tempo de leitura**: 60 minutos (completo)
- **O que é**: Documentação técnica profissional completa
- **Contém**:
  - Autenticação e RBAC com matriz de permissões
  - RF1.1: Contratos ACL (sazonalização 100%)
  - RF1.2: Contratos CUSD (cálculo de encargos)
  - RF1.3: Upload de Documentos (alerta 1 ano)
  - RF1.4: Fornecedores (validação CNPJ)
  - RF1.5: Alertas (temporal 180/90/60 dias)
  - Cada endpoint com: Request, Response, Erros, Exemplo
  - Tratamento global de erros
  - Headers padrão, Rate limiting, Paginação
  - Webhooks (futuro)
  - Changelog

**→ Use como referência enquanto desenvolve**

---

### 3. **EXEMPLOS_TYPESCRIPT_API.md** 💻 CÓDIGO PRONTO
- **Tempo de leitura**: 30 minutos (para entender)
- **O que é**: Código TypeScript 100% funcional
- **Contém**:
  - Interfaces TypeScript para cada RF
  - Validadores reutilizáveis:
    - ContratoACLValidator
    - ContratoCUSDValidator
    - DocumentoValidator
    - FornecedorValidator (CNPJ)
    - AlertaAutomatico
  - HTTP Client genérico (SynapseAPIClient)
  - Classe de erro customizada (SynapseAPIError)
  - Exemplo de uso para cada operação
  - Padrão de tratamento de erro

**→ Copie e cole no seu projeto**

---

### 4. **openapi.json** 🔧 ESPECIFICAÇÃO FORMAL
- **Tempo de leitura**: Não é para ler, é para importar
- **O que é**: Especificação OpenAPI 3.0 padrão
- **Contém**:
  - Todos os endpoints documentados
  - Schemas completos
  - Exemplos de request/response
  - Segurança (JWT Bearer)

**→ Importe em Swagger UI, Postman ou Insomnia**

---

## 📚 DOCUMENTOS SECUNDÁRIOS (REFERÊNCIA)

### Segurança
- **GUIA_IMPLEMENTACAO_SEGURANCA.py**: Passo-a-passo de implementação RBAC + Auditoria
- **EXEMPLOS_RBAC_AUDITORIA.py**: Exemplos de código com RBAC e auditoria
- **security_enhanced.py**: Módulo de segurança completo do backend

### Testes
- **tests_rf1_comprehensive.py**: 84 testes unitários (RF1.1 a RF1.5)
- **GUIA_TESTES_RF1.py**: Como executar os testes
- **CHECKLIST_SEGURANCA.py**: Verificar configuração de segurança

### Ambiente
- **.env**: Configurações de ambiente (com variáveis seguras)
- **.env.example**: Template para repositório
- **requirements.txt**: Dependências Python
- **docker-compose.yml**: Para rodar localmente

---

## 🚀 FLUXO DE IMPLEMENTAÇÃO RECOMENDADO

### Dia 1: Autenticação
1. Ler: `GUIA_LOVABLE_FRONTEND.md` (seção Autenticação)
2. Implementar: Login/Logout
3. Guardar JWT token (localStorage/sessionStorage)
4. Adicionar Bearer token a todos os requests

### Dia 2-3: RF1.1 (Contratos ACL)
1. Ler: `GUIA_LOVABLE_FRONTEND.md` (seção RF1.1)
2. Referência: `API_BLUEPRINT_V1.md` (seção RF1.1)
3. Código: `EXEMPLOS_TYPESCRIPT_API.md` (seção RF1.1)
4. Implementar:
   - Form de criação
   - Validador de sazonalização (mostrar % em tempo real)
   - Listagem com filtros
   - Editar contrato
   - Cancelar contrato

### Dia 4-5: RF1.2 (Contratos CUSD)
1. Mesmo padrão de RF1.1
2. Focar no cálculo automático de encargos

### Dia 6: RF1.3 (Documentos)
1. Implementar drag-and-drop
2. Validar tipo e tamanho
3. Upload com progresso
4. Download seguro

### Dia 7-8: RF1.4 (Fornecedores) + RF1.5 (Alertas)
1. RF1.4: CRUD de fornecedores + homologação
2. RF1.5: Dashboard de alertas com prioridades

---

## 🎯 PONTOS CRÍTICOS (RELEIA SE TIVER DÚVIDA)

### ⚠️ RF1.1 - Sazonalização
**DEVE ser exatamente 100%**
```
Q1: 0.25 (25%)
Q2: 0.25 (25%)
Q3: 0.25 (25%)
Q4: 0.25 (25%)
──────────────
TOTAL: 1.0 (100%) ✅
```

Qualquer outro valor será rejeitado com erro 400.

### ⚠️ RBAC - Nem todo perfil pode fazer tudo
| Operação | Admin | Analista | Gestor | Fornecedor |
|----------|-------|----------|--------|------------|
| Criar Contrato | ✅ | ✅ | ❌ | ❌ |
| Ver Contratos | ✅ | ✅ | ✅ | ❌ |

### ⚠️ Fornecedor isolado de dados internos
Fornecedores NUNCA conseguem:
- Ver unidades consumidoras da empresa
- Ver contratos internos
- Ver documentos confidenciais
- Ver dados de outras empresas

A API retorna 403 Forbidden se tentarem.

### ⚠️ Auditoria registra TUDO
Cada criação/edição/exclusão é registrada imutavelmente:
- Timestamp exato
- Usuário responsável
- Valores anterior/novo
- IP de origem
- Status (sucesso/falha)

---

## 📖 COMO CONSULTAR DOCUMENTAÇÃO

**Pergunta**: Como criar um contrato ACL?  
**Resposta**:
1. Ler: `API_BLUEPRINT_V1.md` → Seção "1. Criar Contrato ACL"
2. Código: `EXEMPLOS_TYPESCRIPT_API.md` → Function `criarContratoACL()`
3. Teste: `tests_rf1_comprehensive.py` → Class `TestContratoACL`

**Pergunta**: Qual é o erro esperado se sazonalização ≠ 100%?  
**Resposta**:
```json
{
  "status": 400,
  "message": "Sazonalização inválida",
  "error_code": "SEASONALIZATION_INVALID_SUM",
  "details": "Soma deve ser 100% (recebido: 99%)"
}
```

**Pergunta**: Como fazer upload de documento?  
**Resposta**:
1. Usar: `uploadDocumento()` em `EXEMPLOS_TYPESCRIPT_API.md`
2. Tipos permitidos: .pdf, .docx, .xlsx, .txt
3. Tamanho máximo: 10 MB
4. API retorna URL para download

---

## ✅ CHECKLIST PRÉ-DESENVOLVIMENTO

- [ ] Ler `GUIA_LOVABLE_FRONTEND.md` completo
- [ ] Entender RF1.1 (sazonalização 100%)
- [ ] Entender RBAC (quem pode fazer o quê)
- [ ] Entender auditoria (logs imutáveis)
- [ ] Importar `openapi.json` em ferramenta preferida
- [ ] Copiar validadores de `EXEMPLOS_TYPESCRIPT_API.md`
- [ ] Copiar HTTP Client de `EXEMPLOS_TYPESCRIPT_API.md`
- [ ] Estar pronto para começar

---

## 📞 SUPORTE DURANTE DESENVOLVIMENTO

### Erro: "Token inválido"
→ Consultar: `GUIA_LOVABLE_FRONTEND.md` → Seção "Autenticação"

### Erro: "Sazonalização inválida"
→ Consultar: `API_BLUEPRINT_V1.md` → Seção "Erros Esperados" (RF1.1)

### Erro: "Permissão negada (403)"
→ Consultar: `API_BLUEPRINT_V1.md` → Seção "Matriz de RBAC"

### Dúvida: "Como validar CNPJ?"
→ Consultar: `EXEMPLOS_TYPESCRIPT_API.md` → Class `FornecedorValidator`

### Dúvida: "Como fazer upload de arquivo?"
→ Consultar: `EXEMPLOS_TYPESCRIPT_API.md` → Function `uploadDocumento()`

---

## 🎓 RECURSOS EXTERNOS ÚTEIS

| Recurso | Link | Uso |
|---------|------|-----|
| JWT Parser | https://jwt.io/ | Debug de tokens |
| CNPJ Validator | https://www.cnpj.dev/ | Validação de CNPJ |
| Swagger UI | https://swagger.io/ | Visualizar openapi.json |
| Postman | https://www.postman.com/ | Testar endpoints |
| MDN Web Docs | https://developer.mozilla.org/ | JavaScript/TypeScript |

---

## 🎯 RESUMO FINAL

| Documento | Usar para | Tempo |
|-----------|-----------|-------|
| GUIA_LOVABLE_FRONTEND.md | Entender o projeto | 15 min |
| API_BLUEPRINT_V1.md | Referência técnica | 60 min |
| EXEMPLOS_TYPESCRIPT_API.md | Código pronto | 30 min |
| openapi.json | Ferramentas automáticas | - |

**Total**: ~2 horas para entender completamente  
**Resultado**: 100% preparado para implementar

---

## ✅ VOCÊ ESTÁ PRONTO!

✅ Documentação completa  
✅ Exemplos funcional  
✅ Validadores prontos  
✅ Especificação formal  
✅ Checklist de implementação  
✅ Exemplos reais  
✅ Suporte ao debug  

**Próximo passo**: Abra `GUIA_LOVABLE_FRONTEND.md` e comece!

🚀 **Boa sorte!**

---

**Documento versão 1.0**  
**Mantido por**: Synapse Energy Engineering  
**Data**: 14 de Março de 2026

