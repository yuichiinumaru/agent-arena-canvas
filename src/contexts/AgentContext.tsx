import React, { createContext, useContext, useEffect, useState } from 'react';
import { Agent, Conversation, Message, Tool, KnowledgeItem, DatabaseConfig, ModelConfig } from '@/types';
import { useAuth } from './AuthContext';

interface AgentContextType {
  agents: Agent[];
  conversations: Conversation[];
  appConfig: {
    models: ModelConfig[];
    databases: DatabaseConfig[];
  };
  currentConversationId: string | null;
  isProcessing: boolean;
  // Agents
  addAgent: (agent: Omit<Agent, 'id'>) => Agent;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  removeAgent: (id: string) => void;
  // Knowledge Base
  addKnowledgeItem: (agentId: string, item: Omit<KnowledgeItem, 'id'>) => void;
  removeKnowledgeItem: (agentId: string, itemId: string) => void;
  // Tools
  addTool: (agentId: string, tool: Omit<Tool, 'id'>) => void;
  updateTool: (agentId: string, toolId: string, updates: Partial<Tool>) => void;
  removeTool: (agentId: string, toolId: string) => void;
  // Conversations
  createConversation: (agentIds: string[]) => Conversation;
  sendMessage: (content: string, mentions: string[], isTask: boolean) => Promise<void>;
  setCurrentConversation: (id: string) => void;
  // Config
  updateModelConfig: (models: ModelConfig[]) => void;
  updateDatabaseConfig: (databases: DatabaseConfig[]) => void;
}

const defaultGeminiModel: ModelConfig = {
  id: 'gemini-pro',
  name: 'Gemini 2.5 Pro Preview',
  provider: 'google',
  apiKey: '',
  isDefault: true
};

const predefinedAgents: Agent[] = [
  {
    id: 'agent-comm-mobilization',
    name: 'Agente de Comunicação e Mobilização Cidadã',
    description: 'Centraliza as ações de comunicação externa, interação com o público e gestão das demandas cidadãs, visando fortalecer a imagem do mandato e o engajamento popular.',
    instructions: `Você é um Agente de Comunicação e Mobilização Cidadã. Suas funções principais incluem:
- Gerar rascunhos de conteúdo para redes sociais (posts, vídeos), press releases e newsletters.
- Analisar métricas de engajamento e performance de canais digitais.
- Sugerir pautas e calendário editorial com base em eventos e prioridades.
- Classificar, responder e encaminhar demandas recebidas de cidadãos.
- Mapear geograficamente e tematicamente as demandas recorrentes.
- Auxiliar na organização e divulgação de eventos (audiências, reuniões).
- Analisar o sentimento e feedback dos cidadãos nos diversos canais.
- Monitorar menções ao mandato na mídia.`,
    avatar: 'https://ui-avatars.com/api/?name=Comunicação&background=e63946&color=fff',
    model: 'gemini-pro',
    instructionTokenCount: 0,
    isActive: true,
    knowledgeBase: [],
    tools: [],
  },
  {
    id: 'agent-redacao-preparacao',
    name: 'Agente de Redação e Preparação Estratégica',
    description: 'Focado na produção de textos estratégicos e na preparação do vereador para interações importantes, garantindo consistência e alinhamento com os objetivos do mandato.',
    instructions: `Você é um Agente de Redação e Preparação Estratégica. Suas funções principais incluem:
- Redigir minutas de discursos para sessões plenárias, eventos e entrevistas.
- Elaborar comunicados oficiais, notas públicas e ofícios para outras instituições.
- Criar talking points (pontos-chave) para entrevistas e debates.
- Preparar briefings informativos sobre interlocutores e temas antes de reuniões externas.
- Desenvolver roteiros e pontos de atenção para visitas a bairros ou instituições.`,
    avatar: 'https://ui-avatars.com/api/?name=Redação&background=457b9d&color=fff',
    model: 'gemini-pro',
    instructionTokenCount: 0,
    isActive: true,
    knowledgeBase: [],
    tools: [],
  },
  {
    id: 'agent-monitor-atos',
    name: 'Agente Monitor de Atos Públicos e Orçamento',
    description: 'Responsável pelo acompanhamento sistemático das publicações oficiais e da execução orçamentária do município, identificando informações relevantes e potenciais alertas para a equipe de fiscalização.',
    instructions: `Você é um Agente Monitor de Atos Públicos e Orçamento. Suas funções principais incluem:
- Monitorar diariamente os Diários Oficiais da Câmara e da Prefeitura.
- Alertar sobre publicações contendo palavras-chave pré-definidas (contratos, licitações, nomeações, exonerações, etc.).
- Rastrear e resumir as principais ações, decretos e projetos publicados pelo Poder Executivo.
- Analisar peças orçamentárias (PPA, LDO, LOA) e suas alterações.
- Acompanhar a execução orçamentária e financeira, comparando previsto vs. realizado.
- Identificar padrões incomuns ou discrepâncias nos gastos públicos (anomalias).
- Explorar portais de transparência em busca de dados relevantes.`,
    avatar: 'https://ui-avatars.com/api/?name=Monitor&background=1d3557&color=fff',
    model: 'gemini-pro',
    instructionTokenCount: 0,
    isActive: true,
    knowledgeBase: [],
    tools: [],
  },
  {
    id: 'agent-fiscalizacao',
    name: 'Agente Analista de Fiscalização e Conformidade',
    description: 'Atua na análise aprofundada de informações levantadas pelo monitoramento ou por denúncias, verificando a legalidade, identificando irregularidades e organizando os achados para subsidiar a atuação do vereador.',
    instructions: `Você é um Agente Analista de Fiscalização e Conformidade. Suas funções principais incluem:
- Analisar detalhadamente contratos, licitações e processos administrativos sinalizados.
- Verificar a conformidade dos atos com a legislação aplicável (leis de licitações, LRF, etc.).
- Sumarizar documentos técnicos ou jurídicos complexos.
- Organizar e indexar documentos e evidências em dossiês de investigação.
- Avaliar riscos potenciais em processos e contratos públicos.
- Sugerir questionamentos técnicos e legais para audiências públicas ou pedidos de informação.
- Identificar possíveis redes de relacionamento entre agentes públicos e privados.`,
    avatar: 'https://ui-avatars.com/api/?name=Fiscalização&background=a8dadc&color=000',
    model: 'gemini-pro',
    instructionTokenCount: 0,
    isActive: true,
    knowledgeBase: [],
    tools: [],
  },
  {
    id: 'agent-pesquisador',
    name: 'Agente Pesquisador e Analista de Políticas Públicas',
    description: 'Dedicado à pesquisa, análise e produção de conhecimento sobre temas relevantes para a atuação legislativa e para a formulação de propostas consistentes.',
    instructions: `Você é um Agente Pesquisador e Analista de Políticas Públicas. Suas funções principais incluem:
- Pesquisar legislação (municipal, estadual, federal e comparada) sobre temas específicos.
- Buscar estudos acadêmicos, relatórios técnicos e artigos sobre políticas públicas.
- Identificar e analisar melhores práticas implementadas em outras cidades ou países.
- Realizar análises preliminares de viabilidade (técnica, orçamentária, política) e impacto potencial de propostas.
- Analisar dados demográficos, sociais e econômicos para contextualizar problemas e soluções.
- Identificar especialistas, acadêmicos e instituições de referência em áreas temáticas.
- Monitorar tendências legislativas e debates emergentes em políticas públicas.`,
    avatar: 'https://ui-avatars.com/api/?name=Pesquisador&background=f1faee&color=000',
    model: 'gemini-pro',
    instructionTokenCount: 0,
    isActive: true,
    knowledgeBase: [],
    tools: [],
  },
  {
    id: 'agent-gerador-propostas',
    name: 'Agente Gerador de Propostas e Soluções Legislativas',
    description: 'Transforma o conhecimento gerado pela pesquisa em subsídios concretos para a ação parlamentar, como propostas de políticas, argumentos e identificação de oportunidades.',
    instructions: `Você é um Agente Gerador de Propostas e Soluções Legislativas. Suas funções principais incluem:
- Elaborar policy briefs (resumos de políticas) com diagnósticos, alternativas e recomendações.
- Gerar listas de argumentos (pró e contra) sobre determinadas propostas ou temas.
- Pesquisar e identificar fontes de financiamento externas (editais, grants, fundos) para projetos municipais.
- Buscar e apresentar soluções inovadoras (tecnológicas, de gestão) aplicadas à administração pública (conceitos de smart cities, PPPs, etc.).
- Sugerir temas e ideias para novos projetos de lei com base em dados (demandas, indicadores) e tendências identificadas.`,
    avatar: 'https://ui-avatars.com/api/?name=Propostas&background=e63946&color=fff',
    model: 'gemini-pro',
    instructionTokenCount: 0,
    isActive: true,
    knowledgeBase: [],
    tools: [],
  },
  {
    id: 'agent-redacao-legislativa',
    name: 'Agente Assistente de Redação Legislativa e Documental',
    description: 'Especializado na técnica legislativa e na redação de documentos formais, garantindo a qualidade, a clareza e a adequação dos textos produzidos pelo gabinete.',
    instructions: `Você é um Agente Assistente de Redação Legislativa e Documental. Suas funções principais incluem:
- Auxiliar na redação de minutas de Projetos de Lei, Decretos Legislativos, Resoluções.
- Elaborar minutas de Requerimentos (de informação, de urgência), Indicações, Moções.
- Redigir Emendas (aditivas, modificativas, supressivas) a projetos em tramitação.
- Construir Justificativas consistentes e bem fundamentadas para as proposições.
- "Traduzir" textos técnicos ou jurídicos para uma linguagem clara e acessível ao cidadão comum.
- Revisar textos garantindo a correção ortográfica, gramatical e a adequação à norma culta e à linguagem legislativa.`,
    avatar: 'https://ui-avatars.com/api/?name=Redação&background=457b9d&color=fff',
    model: 'gemini-pro',
    instructionTokenCount: 0,
    isActive: true,
    knowledgeBase: [],
    tools: [],
  },
  {
    id: 'agent-processo-legislativo',
    name: 'Agente Consultor de Processo Legislativo e Regimental',
    description: 'O "guardião" das regras do jogo legislativo. Oferece suporte sobre o Regimento Interno, a Lei Orgânica e os trâmites processuais, além de analisar o cenário político da Câmara.',
    instructions: `Você é um Agente Consultor de Processo Legislativo e Regimental. Suas funções principais incluem:
- Realizar verificações preliminares de constitucionalidade e legalidade das propostas.
- Checar a conformidade das propostas com a Lei Orgânica Municipal e o Regimento Interno da Câmara.
- Responder a dúvidas sobre prazos, quóruns, tipos de votação e outras regras regimentais.
- Pesquisar jurisprudência (decisões judiciais) relevante para temas em debate.
- Acompanhar a tramitação dos projetos de interesse (status, comissões, relatores).
- Analisar padrões de votação nominais para entender o posicionamento dos vereadores.
- Sugerir potenciais coautores ou apoiadores para projetos com base em afinidades temáticas ou histórico de votação.
- Destacar alterações entre diferentes versões de um projeto (substitutivos, emendas aprovadas).`,
    avatar: 'https://ui-avatars.com/api/?name=Legislativo&background=1d3557&color=fff',
    model: 'gemini-pro',
    instructionTokenCount: 0,
    isActive: true,
    knowledgeBase: [],
    tools: [],
  },
  {
    id: 'agent-organizador',
    name: 'Agente Organizador do Gabinete e Gestor de Tarefas',
    description: 'Facilita a gestão interna, a organização das tarefas e a comunicação entre a equipe, buscando otimizar o fluxo de trabalho e a produtividade.',
    instructions: `Você é um Agente Organizador do Gabinete e Gestor de Tarefas. Suas funções principais incluem:
- Auxiliar na priorização de tarefas com base em critérios de urgência e impacto.
- Gerar resumos e listas de ações (action items) a partir de atas ou transcrições de reuniões.
- Compilar informações das diversas áreas para gerar relatórios internos de atividades (semanais, mensais).
- Analisar dados de fluxo de trabalho (se disponíveis) para identificar gargalos e sugerir melhorias.
- Auxiliar no agendamento de reuniões internas e externas, considerando a disponibilidade da equipe e do vereador.
- Sugerir alocação de recursos (tempo, pessoal) com base nas prioridades e carga de trabalho.
- Preparar pautas e compilar documentos necessários antes das reuniões.`,
    avatar: 'https://ui-avatars.com/api/?name=Organizador&background=a8dadc&color=000',
    model: 'gemini-pro',
    instructionTokenCount: 0,
    isActive: true,
    knowledgeBase: [],
    tools: [],
  },
  {
    id: 'agent-conhecimento',
    name: 'Agente Guardião do Conhecimento Interno e Onboarding',
    description: 'Centraliza e organiza o conhecimento produzido e utilizado pelo gabinete, facilitando o acesso à informação e a integração de novos membros da equipe.',
    instructions: `Você é um Agente Guardião do Conhecimento Interno e Onboarding. Suas funções principais incluem:
- Organizar e indexar a base de conhecimento interna (documentos, guias, manuais, pesquisas).
- Facilitar a busca por informações e documentos específicos dentro do acervo do gabinete.
- Fornecer um guia interativo para novos assessores sobre processos, ferramentas e cultura do gabinete (onboarding).
- Disponibilizar acesso rápido a normas éticas, Código de Decoro e regras de conduta.
- Manter atualizado um FAQ interno sobre procedimentos e dúvidas comuns da equipe.`,
    avatar: 'https://ui-avatars.com/api/?name=Conhecimento&background=f1faee&color=000',
    model: 'gemini-pro',
    instructionTokenCount: 0,
    isActive: true,
    knowledgeBase: [],
    tools: [],
  },
  {
    id: 'agent-cenarios',
    name: 'Agente Analista de Cenários e Stakeholders',
    description: 'Focado na inteligência política e estratégica, mapeando o ambiente externo, identificando atores relevantes e analisando tendências para subsidiar a tomada de decisão do vereador.',
    instructions: `Você é um Agente Analista de Cenários e Stakeholders. Suas funções principais incluem:
- Mapear e categorizar stakeholders (lideranças, entidades, empresários, etc.) por tema ou influência.
- Analisar o posicionamento e as ações de outros atores políticos relevantes (aliados, opositores, prefeito).
- Monitorar e analisar tendências na opinião pública sobre temas chave ou sobre a imagem do mandato.
- Esboçar possíveis cenários políticos futuros e seus potenciais impactos.
- Identificar riscos e oportunidades no ambiente político e social.
- Consolidar informações de diferentes fontes para gerar análises de conjuntura.`,
    avatar: 'https://ui-avatars.com/api/?name=Cenários&background=e63946&color=fff',
    model: 'gemini-pro',
    instructionTokenCount: 0,
    isActive: true,
    knowledgeBase: [],
    tools: [],
  },
  {
    id: 'agent-dados',
    name: 'Agente Analista de Dados Municipais e Desempenho',
    description: 'Utiliza dados quantitativos para realizar diagnósticos sobre o município, comparar seu desempenho com outras cidades e avaliar o impacto de políticas públicas.',
    instructions: `Você é um Agente Analista de Dados Municipais e Desempenho. Suas funções principais incluem:
- Realizar benchmarking (comparação) de indicadores socioeconômicos, de saúde, educação, segurança, etc., com outros municípios.
- Analisar dados demográficos (Censo, estimativas) para entender o perfil da população e suas necessidades.
- Explorar portais de dados abertos do município e de outras esferas em busca de informações relevantes.
- Cruzar dados de diferentes fontes (orçamento, demandas cidadãs, indicadores sociais) para gerar insights.
- Avaliar o desempenho e o impacto de políticas e programas municipais específicos (requer disponibilidade de dados e metodologia).
- Criar visualizações de dados (gráficos, mapas) para facilitar a compreensão dos diagnósticos.`,
    avatar: 'https://ui-avatars.com/api/?name=Dados&background=457b9d&color=fff',
    model: 'gemini-pro',
    instructionTokenCount: 0,
    isActive: true,
    knowledgeBase: [],
    tools: [],
  }
];

const AgentContext = createContext<AgentContextType>({
  agents: [],
  conversations: [],
  appConfig: {
    models: [defaultGeminiModel],
    databases: [],
  },
  currentConversationId: null,
  isProcessing: false,
  addAgent: () => ({ id: '', name: '', avatar: '', model: '', description: '', instructions: '', instructionTokenCount: 0, isActive: true, knowledgeBase: [], tools: [] }),
  updateAgent: () => {},
  removeAgent: () => {},
  addKnowledgeItem: () => {},
  removeKnowledgeItem: () => {},
  addTool: () => {},
  updateTool: () => {},
  removeTool: () => {},
  createConversation: () => ({ id: '', title: '', participants: { agentIds: [] }, createdAt: 0, updatedAt: 0, messages: [] }),
  sendMessage: async () => {},
  setCurrentConversation: () => {},
  updateModelConfig: () => {},
  updateDatabaseConfig: () => {},
});

export const useAgents = () => useContext(AgentContext);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [appConfig, setAppConfig] = useState<{ models: ModelConfig[], databases: DatabaseConfig[] }>({
    models: [defaultGeminiModel],
    databases: [],
  });

  // Load stored agents and conversations from localStorage
  useEffect(() => {
    if (user) {
      const storedAgents = localStorage.getItem('agents');
      const storedConversations = localStorage.getItem('conversations');
      const storedConfig = localStorage.getItem('appConfig');

      // If there are no stored agents, use the predefined ones
      if (!storedAgents || JSON.parse(storedAgents).length === 0) {
        setAgents(predefinedAgents);
      } else {
        try {
          setAgents(JSON.parse(storedAgents));
        } catch (e) {
          console.error('Failed to parse stored agents', e);
          setAgents(predefinedAgents);
        }
      }

      if (storedConversations) {
        try {
          const parsedConversations = JSON.parse(storedConversations);
          setConversations(parsedConversations);
          
          // Set the most recent conversation as current
          if (parsedConversations.length > 0) {
            const mostRecent = parsedConversations.sort((a: Conversation, b: Conversation) => b.updatedAt - a.updatedAt)[0];
            setCurrentConversationId(mostRecent.id);
          }
        } catch (e) {
          console.error('Failed to parse stored conversations', e);
        }
      }

      if (storedConfig) {
        try {
          setAppConfig(JSON.parse(storedConfig));
        } catch (e) {
          console.error('Failed to parse stored config', e);
        }
      }
    }
  }, [user]);

  // Save to localStorage when state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('agents', JSON.stringify(agents));
      localStorage.setItem('conversations', JSON.stringify(conversations));
      localStorage.setItem('appConfig', JSON.stringify(appConfig));
    }
  }, [agents, conversations, appConfig, user]);

  const addAgent = (agentData: Omit<Agent, 'id'>) => {
    const newAgent: Agent = {
      id: `agent-${Date.now()}`,
      ...agentData,
    };
    setAgents((prev) => [...prev, newAgent]);
    return newAgent;
  };

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    setAgents((prev) => 
      prev.map((agent) => (agent.id === id ? { ...agent, ...updates } : agent))
    );
  };

  const removeAgent = (id: string) => {
    setAgents((prev) => prev.filter((agent) => agent.id !== id));
  };

  const addKnowledgeItem = (agentId: string, item: Omit<KnowledgeItem, 'id'>) => {
    const newItem: KnowledgeItem = {
      id: `knowledge-${Date.now()}`,
      ...item,
    };
    
    setAgents((prev) => 
      prev.map((agent) => 
        agent.id === agentId 
          ? { ...agent, knowledgeBase: [...agent.knowledgeBase, newItem] } 
          : agent
      )
    );
  };

  const removeKnowledgeItem = (agentId: string, itemId: string) => {
    setAgents((prev) => 
      prev.map((agent) => 
        agent.id === agentId 
          ? { ...agent, knowledgeBase: agent.knowledgeBase.filter((item) => item.id !== itemId) } 
          : agent
      )
    );
  };

  const addTool = (agentId: string, tool: Omit<Tool, 'id'>) => {
    const newTool: Tool = {
      id: `tool-${Date.now()}`,
      ...tool,
    };
    
    setAgents((prev) => 
      prev.map((agent) => 
        agent.id === agentId 
          ? { ...agent, tools: [...agent.tools, newTool] } 
          : agent
      )
    );
  };

  const updateTool = (agentId: string, toolId: string, updates: Partial<Tool>) => {
    setAgents((prev) => 
      prev.map((agent) => 
        agent.id === agentId 
          ? { 
              ...agent, 
              tools: agent.tools.map((tool) => 
                tool.id === toolId ? { ...tool, ...updates } : tool
              )
            } 
          : agent
      )
    );
  };

  const removeTool = (agentId: string, toolId: string) => {
    setAgents((prev) => 
      prev.map((agent) => 
        agent.id === agentId 
          ? { ...agent, tools: agent.tools.filter((tool) => tool.id !== toolId) } 
          : agent
      )
    );
  };

  const createConversation = (agentIds: string[]) => {
    const selectedAgents = agents.filter(agent => agentIds.includes(agent.id));
    const agentNames = selectedAgents.map(agent => agent.name).join(', ');
    
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: `Chat with ${agentNames}`,
      participants: {
        userId: user?.id,
        agentIds,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    
    setConversations((prev) => [...prev, newConversation]);
    setCurrentConversationId(newConversation.id);
    return newConversation;
  };

  const sendMessage = async (content: string, mentions: string[], isTask: boolean) => {
    if (!currentConversationId || !user) return;

    setIsProcessing(true);
    
    try {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: currentConversationId,
        content,
        sender: {
          id: user.id,
          name: user.name,
          type: 'user',
          avatar: user.avatar,
        },
        mentions,
        timestamp: Date.now(),
        isTask,
        assignedTo: isTask 
          ? mentions.length > 0 ? mentions : conversations.find(c => c.id === currentConversationId)?.participants.agentIds || []
          : mentions,
      };

      // Update the conversation with the new message
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [...conv.messages, newMessage],
                updatedAt: Date.now(),
              }
            : conv
        )
      );

      // Process agent responses
      // In a real implementation, this would call the Gemini API for each agent
      // For now, we'll just simulate a response after a delay
      const currentConversation = conversations.find(c => c.id === currentConversationId);
      const respondingAgents = currentConversation?.participants.agentIds.filter(
        id => newMessage.assignedTo.includes(id) || newMessage.assignedTo.length === 0
      ) || [];

      // Generate responses from the agents (simulated)
      for (const agentId of respondingAgents) {
        const agent = agents.find(a => a.id === agentId);
        if (!agent) continue;

        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

        const agentResponse: Message = {
          id: `msg-${Date.now()}-${agentId}`,
          conversationId: currentConversationId,
          content: `[${agent.name}] - This is a simulated response. In the real implementation, this would be a response from the Gemini API using the agent's instructions and knowledge base.`,
          sender: {
            id: agentId,
            name: agent.name,
            type: 'agent',
            avatar: agent.avatar,
          },
          mentions: [],
          timestamp: Date.now(),
          isTask: false,
          assignedTo: [],
          inReplyTo: newMessage.id,
        };

        // Add agent response to conversation
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, agentResponse],
                  updatedAt: Date.now(),
                }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateModelConfig = (models: ModelConfig[]) => {
    setAppConfig(prev => ({ ...prev, models }));
  };

  const updateDatabaseConfig = (databases: DatabaseConfig[]) => {
    setAppConfig(prev => ({ ...prev, databases }));
  };

  return (
    <AgentContext.Provider
      value={{
        agents,
        conversations,
        appConfig,
        currentConversationId,
        isProcessing,
        addAgent,
        updateAgent,
        removeAgent,
        addKnowledgeItem,
        removeKnowledgeItem,
        addTool,
        updateTool,
        removeTool,
        createConversation,
        sendMessage,
        setCurrentConversation: setCurrentConversationId,
        updateModelConfig,
        updateDatabaseConfig,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};
