import React, { createContext, useState, useEffect, useContext } from 'react';
import { Agent, Conversation, Message } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AgentContextProps {
  agents: Agent[];
  activeAgent: Agent | null;
  setActiveAgent: (agent: Agent | null) => void;
  createAgent: (agent: Omit<Agent, 'id'>) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
  addMessageToConversation: (conversationId: string, message: Omit<Message, 'id'>) => void;
  updateMessageInConversation: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessageInConversation: (conversationId: string, messageId: string) => void;
  createNewConversation: () => void;
  saveConversation: (conversation: Conversation) => void;
}

const AgentContext = createContext<AgentContextProps | undefined>(undefined);

interface AgentProviderProps {
  children: React.ReactNode;
}

export const AgentProvider: React.FC<AgentProviderProps> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Load agents from local storage on mount
    const storedAgents = localStorage.getItem('agents');
    if (storedAgents) {
      setAgents(JSON.parse(storedAgents));
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    // Save agents to local storage whenever agents change
    localStorage.setItem('agents', JSON.stringify(agents));
  }, [agents]);

  const createAgent = (agent: Omit<Agent, 'id'>) => {
    const newAgent: Agent = { id: uuidv4(), ...agent };
    setAgents([...agents, newAgent]);
  };

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    const updatedAgents = agents.map(agent =>
      agent.id === id ? { ...agent, ...updates } : agent
    );
    setAgents(updatedAgents);
  };

  const deleteAgent = (id: string) => {
    setAgents(agents.filter(agent => agent.id !== id));
  };

  // Load conversations
  const loadConversations = async () => {
    try {
      if (!user) return;
      
      // Check if the conversations table exists
      const { error: tableError } = await supabase
        .from('conversations')
        .select('id')
        .limit(1)
        .single();

      // If the table doesn't exist, create it
      if (tableError && tableError.code === 'PGRST116') {
        // Table doesn't exist, create it
        const { error: createError } = await supabase.rpc('create_conversations_table');
        
        if (createError) {
          console.error('Error creating conversations table:', createError);
          return;
        }
      }
      
      // Now try to load conversations
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error loading conversations:', error);
        return;
      }
      
      // Transform data to match Conversation type
      const transformedConversations: Conversation[] = data.map(item => ({
        id: item.id,
        title: item.title || 'New Conversation',
        participants: {
          userId: user.id,
          agentIds: item.agent_ids || [],
        },
        createdAt: new Date(item.created_at).getTime(),
        updatedAt: new Date(item.updated_at).getTime(),
        messages: item.messages || [],
      }));
      
      setConversations(transformedConversations);
      
      // If there are conversations, set the current one
      if (transformedConversations.length > 0) {
        setCurrentConversationId(transformedConversations[0].id);
      } else {
        // Create a new conversation if none exist
        createNewConversation();
      }
    } catch (error) {
      console.error('Error in loadConversations:', error);
    }
  };
  
  // Save conversation to database
  const saveConversation = async (conversation: Conversation) => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('supabase_tables')
        .select('*')
        .eq('tablename', 'conversations')
        .single();
      
      // If the table doesn't exist, don't try to save
      if (error && error.code === 'PGRST116') {
        console.error('Conversations table does not exist');
        return;
      }
      
      const { error: saveError } = await supabase
        .from('conversations')
        .upsert({
          id: conversation.id,
          title: conversation.title,
          user_id: user.id,
          agent_ids: conversation.participants.agentIds,
          messages: conversation.messages,
          created_at: new Date(conversation.createdAt).toISOString(),
          updated_at: new Date(conversation.updatedAt).toISOString(),
        });
      
      if (saveError) {
        console.error('Error saving conversation:', saveError);
      }
    } catch (error) {
      console.error('Error in saveConversation:', error);
    }
  };

  const addMessageToConversation = (conversationId: string, message: Omit<Message, 'id'>) => {
    const newMessage: Message = { id: uuidv4(), ...message };
    const updatedConversations = conversations.map(conversation =>
      conversation.id === conversationId
        ? { ...conversation, messages: [...conversation.messages, newMessage], updatedAt: Date.now() }
        : conversation
    );
    setConversations(updatedConversations);
    saveConversation(updatedConversations.find(c => c.id === conversationId) as Conversation);
  };

  const updateMessageInConversation = (conversationId: string, messageId: string, updates: Partial<Message>) => {
    const updatedConversations = conversations.map(conversation => {
      if (conversation.id === conversationId) {
        const updatedMessages = conversation.messages.map(message =>
          message.id === messageId ? { ...message, ...updates } : message
        );
        return { ...conversation, messages: updatedMessages, updatedAt: Date.now() };
      }
      return conversation;
    });
    setConversations(updatedConversations);
    saveConversation(updatedConversations.find(c => c.id === conversationId) as Conversation);
  };

  const deleteMessageInConversation = (conversationId: string, messageId: string) => {
    const updatedConversations = conversations.map(conversation => {
      if (conversation.id === conversationId) {
        const updatedMessages = conversation.messages.filter(message => message.id !== messageId);
        return { ...conversation, messages: updatedMessages, updatedAt: Date.now() };
      }
      return conversation;
    });
    setConversations(updatedConversations);
    saveConversation(updatedConversations.find(c => c.id === conversationId) as Conversation);
  };

  const createNewConversation = () => {
    if (!user) return;

    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'New Conversation',
      participants: {
        userId: user.id,
        agentIds: [],
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations([newConversation, ...conversations]);
    setCurrentConversationId(newConversation.id);
    saveConversation(newConversation);
  };

  const contextValue: AgentContextProps = {
    agents,
    activeAgent,
    setActiveAgent,
    createAgent,
    updateAgent,
    deleteAgent,
    conversations,
    currentConversationId,
    setCurrentConversationId,
    addMessageToConversation,
    updateMessageInConversation,
    deleteMessageInConversation,
    createNewConversation,
    saveConversation,
  };

  return (
    <AgentContext.Provider value={contextValue}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
