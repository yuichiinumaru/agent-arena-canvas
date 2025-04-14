
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

      if (storedAgents) {
        try {
          setAgents(JSON.parse(storedAgents));
        } catch (e) {
          console.error('Failed to parse stored agents', e);
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

  // Agent management
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

  // Knowledge base management
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

  // Tool management
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

  // Conversation management
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

  // Config management
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
