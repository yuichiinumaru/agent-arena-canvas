
import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Agent, Conversation, Message } from '@/types';
import { loadUserConversations, upsertConversation } from '@/integrations/supabase/functions';

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
      
      // Try to load conversations from localStorage first as a fallback
      const storedConversations = localStorage.getItem('conversations');
      let localConversations: Conversation[] = [];
      
      if (storedConversations) {
        localConversations = JSON.parse(storedConversations);
      }
      
      // Then try to get from Supabase
      try {
        // Using our updated function that will return an empty array until table is created
        const data = await loadUserConversations(user.id);
        
        if (data && data.length > 0) {
          // Transform data to match Conversation type
          const transformedConversations: Conversation[] = data;
          
          setConversations(transformedConversations);
          
          // If there are conversations, set the current one
          if (transformedConversations.length > 0) {
            setCurrentConversationId(transformedConversations[0].id);
          }
          
          // Update localStorage as a backup
          localStorage.setItem('conversations', JSON.stringify(transformedConversations));
        } else if (localConversations.length > 0) {
          // If no Supabase data but we have local data, use that
          setConversations(localConversations);
          setCurrentConversationId(localConversations[0].id);
        } else {
          // Create a new conversation if none exist
          createNewConversation();
        }
      } catch (supabaseError) {
        console.error('Supabase error in loadConversations:', supabaseError);
        
        // Fallback to localStorage conversations
        if (localConversations.length > 0) {
          setConversations(localConversations);
          setCurrentConversationId(localConversations[0].id);
        } else {
          createNewConversation();
        }
      }
    } catch (error) {
      console.error('Error in loadConversations:', error);
      createNewConversation();
    }
  };
  
  // Save conversation to database and localStorage
  const saveConversation = async (conversation: Conversation) => {
    try {
      if (!user) return;
      
      // Update localStorage as a backup
      const updatedConversations = conversations.map(c => 
        c.id === conversation.id ? conversation : c
      );
      localStorage.setItem('conversations', JSON.stringify(updatedConversations));
      setConversations(updatedConversations);
      
      // Try to save to Supabase if available
      try {
        await upsertConversation(conversation, user.id);
      } catch (supabaseError) {
        console.error('Supabase error in saveConversation:', supabaseError);
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
    const convo = updatedConversations.find(c => c.id === conversationId);
    if (convo) {
      saveConversation(convo);
    }
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
    const convo = updatedConversations.find(c => c.id === conversationId);
    if (convo) {
      saveConversation(convo);
    }
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
    const convo = updatedConversations.find(c => c.id === conversationId);
    if (convo) {
      saveConversation(convo);
    }
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
