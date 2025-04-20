import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { loadUserConversations, upsertConversation } from '@/integrations/supabase/functions';
import { Conversation, Message } from '@/types';
import { toast } from '@/hooks/use-toast';

interface ConversationContextProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  setCurrentConversationId: (id: string | null) => void;
  addMessageToConversation: (conversationId: string, message: Omit<Message, 'id'>) => void;
  updateMessageInConversation: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  deleteMessageInConversation: (conversationId: string, messageId: string) => void;
  createNewConversation: () => void;
}

const ConversationContext = createContext<ConversationContextProps | undefined>(undefined);

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    try {
      const data = await loadUserConversations(user.id);
      if (data && data.length > 0) {
        setConversations(data);
        setCurrentConversationId(data[0].id);
      } else {
        createNewConversation();
      }
    } catch {
      toast({ title: 'Failed to load conversations.', variant: 'destructive' });
      createNewConversation();
    }
  };

  const saveConversation = async (conversation: Conversation) => {
    if (!user) return;
    const updated = conversations.map(c => (c.id === conversation.id ? conversation : c));
    setConversations(updated);
    try {
      await upsertConversation(conversation, user.id);
    } catch {
      toast({ title: 'Failed to save conversation.', variant: 'destructive' });
    }
  };

  const addMessageToConversation = (conversationId: string, message: Omit<Message, 'id'>) => {
    const newMessage: Message = { id: uuidv4(), ...message };
    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId
        ? { ...conv, messages: [...conv.messages, newMessage], updatedAt: Date.now() }
        : conv
    );
    setConversations(updatedConversations);
    const convo = updatedConversations.find(c => c.id === conversationId);
    if (convo) saveConversation(convo);
  };

  const updateMessageInConversation = (conversationId: string, messageId: string, updates: Partial<Message>) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        const msgs = conv.messages.map(msg => (msg.id === messageId ? { ...msg, ...updates } : msg));
        return { ...conv, messages: msgs, updatedAt: Date.now() };
      }
      return conv;
    });
    setConversations(updatedConversations);
    const convo = updatedConversations.find(c => c.id === conversationId);
    if (convo) saveConversation(convo);
  };

  const deleteMessageInConversation = (conversationId: string, messageId: string) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        const msgs = conv.messages.filter(msg => msg.id !== messageId);
        return { ...conv, messages: msgs, updatedAt: Date.now() };
      }
      return conv;
    });
    setConversations(updatedConversations);
    const convo = updatedConversations.find(c => c.id === conversationId);
    if (convo) saveConversation(convo);
  };

  const createNewConversation = () => {
    if (!user) return;
    const newConv: Conversation = {
      id: uuidv4(),
      title: 'New Conversation',
      participants: { userId: user.id, agentIds: [] },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations([newConv, ...conversations]);
    setCurrentConversationId(newConv.id);
    saveConversation(newConv);
  };

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        currentConversationId,
        setCurrentConversationId,
        addMessageToConversation,
        updateMessageInConversation,
        deleteMessageInConversation,
        createNewConversation,
      }}
    >
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) throw new Error('useConversation must be used within ConversationProvider');
  return context;
};
