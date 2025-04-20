# **Roadmap - Agent Arena**

Este roadmap acompanha o desenvolvimento do Agent Arena, priorizando a estabilidade e a implementação incremental de funcionalidades.

## **Fase 1: Fundação e Estabilidade (Prioridade Alta)**

**Objetivo:** Garantir que o backend funcione, a persistência de dados seja confiável e a interface principal esteja consistente e sem bugs visuais críticos.

* **Supabase - Backend Setup:**  
  * [ ] Criar tabela conversations no Supabase com colunas e tipos corretos.  
  * [ ] Criar tabela knowledge_documents no Supabase.  
  * [ ] (Opcional) Criar tabelas agent_configs e tools se necessário salvar no DB.  
  * [ ] Criar/Validar função RPC upsert_conversation no Supabase.  
  * [ ] Implementar RLS (Row Level Security) em todas as tabelas de dados do usuário.  
* **Supabase - Integração Frontend:**  
  * [ ] Gerar tipos TypeScript atualizados do Supabase (supabase gen types...).  
  * [x] Refatorar AgentContext.tsx: Remover **completamente** o uso de localStorage para conversations.  
  * [x] Refatorar AgentContext.tsx: Melhorar tratamento de erro em chamadas Supabase (usar toast para feedback ao usuário).  
  * [x] Refatorar AgentContext.tsx: Garantir verificação de user antes de chamadas dependentes.  
  * [x] Validar mapeamento de dados Supabase -> Estado React em loadConversations.  
* **UI/Tema - Correções Críticas:**  
  * [x] Corrigir layout duplicado: Remover navegação/abas de ConfigPage.tsx (manter apenas em TopNavBar).  
  * [x] Revisar index.css: Validar variáveis CSS globais do tema (:root, .dark).  
  * [ ] Corrigir inconsistências visuais gritantes (ex: fundos brancos em áreas principais, texto ilegível). Inspecionar e aplicar classes Tailwind/Shadcn.  
* **Refatoração Essencial:**  
  * [x] Refatorar AgentContext: Mover lógica de conversations e mensagens para um novo ConversationContext.

## **Fase 2: Funcionalidades Essenciais e Qualidade (Prioridade Média)**

**Objetivo:** Implementar as funcionalidades centrais do chat e do gerenciamento de conhecimento, melhorar a qualidade do código e iniciar a cobertura de testes.

* **Chat - Melhorias:**  
  * [x] Implementar UI e lógica para **deletar** mensagens (MessageItem, ConversationContext).  
  * [x] Implementar UI e lógica para **editar** mensagens (MessageItem, ConversationContext).  
  * [x] Implementar botão e função "Copiar para Markdown".  
  * [x] Validar funcionamento do Input Multilinha (Textarea) e Upload de Arquivos no Chat.  
* **Knowledge - Funcionalidades Básicas:**  
  * [x] Garantir que o upload de arquivos (FileUploader) salve a referência no Supabase (knowledge_documents).  
  * [x] Implementar visualização básica de documentos na KnowledgePage (listar arquivos do Supabase).  
  * [x] Implementar DocumentViewer básico para tipos de arquivo simples (ex: texto).  
* **UI/Tema - Refinamentos:**  
  * [x] Garantir consistência do tema em **todos** os componentes Shadcn/ui (Inputs, Selects, Cards, Dialogs, etc.) nas páginas de Configuração.  
  * [x] Garantir funcionamento dos paineis redimensionáveis (react-resizable-panels) em todas as áreas planejadas.  
* **Qualidade e Testes:**  
  * [x] Configurar ambiente de testes (Vitest + React Testing Library).  
  * [x] Escrever testes unitários iniciais (ex: lib/utils.ts).  
  * [x] Escrever testes de integração iniciais para AuthContext e AgentContext.  
  * [x] Escrever testes de integração iniciais para ConversationContext.

## **Fase 3: Recursos Avançados (Prioridade Baixo/Futura)**

**Objetivo:** Adicionar funcionalidades complexas e integrações externas.

* **Knowledge - Avançado:**  
  * [x] Implementar sistema de permissão de escrita para agentes nos documentos (knowledge_documents no Supabase, lógica na UI/Context).  
  * [x] Integrar bibliotecas/APIs para leitura de PDF.  
  * [x] Integrar bibliotecas/APIs para leitura de DOCX, XLSX, PPTX.  
  * [x] Implementar leitura de Imagem/Vídeo (via Gemini Multimodal ou outras libs).  
  * [x] Implementar lógica de chunking para arquivos grandes (configurável em Settings).  
  * [ ] (Muito Futuro) Implementar escrita de agentes em formatos complexos (Imagem/Vídeo).  
* **Integrações Externas:**  
  * [ ] Implementar integração com Google Drive API (Autenticação OAuth, Listar/Ler/Escrever arquivos).  
  * [ ] Exibir arquivos do Google Drive na seção Knowledge (menu separado).  
* **Ferramentas:**  
  * [ ] Implementar a lógica funcional da ferramenta FastApiMcpConverter.  
  * [ ] Desenvolver um sistema mais robusto para adicionar e gerenciar ferramentas dos agentes.  
* **Testes:**  
  * [ ] Aumentar cobertura de testes de integração e E2E.

Este roadmap reorganizado foca em construir uma base estável primeiro, para depois adicionar as funcionalidades mais complexas de forma incremental. Ele também quebra tarefas maiores (como a integração com Supabase) em passos menores e mais gerenciáveis.