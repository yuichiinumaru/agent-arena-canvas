import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAgent } from '@/contexts/AgentContext';
import MessageItem from './MessageItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AgentSelector from './AgentSelector';
import { SendHorizontal } from 'lucide-react';
import { Message } from '@/types';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isAgentSelectorOpen, setIsAgentSelectorOpen] = useState(false);
  const { user } = useAuth();
  const {
    agents,
    activeAgent,
    setActiveAgent,
    conversations,
    currentConversationId,
    addMessageToConversation,
    updateMessageInConversation,
    deleteMessageInConversation,
  } = useAgent();
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [conversations, currentConversationId]);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!user) {
    return <div className="p-4">Please log in to start chatting.</div>;
  }

  const currentConversation = conversations.find(c => c.id === currentConversationId);

  const handleSendMessage = () => {
    if (!input.trim() || !currentConversationId) return;

    const newMessage: Omit<Message, 'id'> = {
      conversationId: currentConversationId,
      content: input,
      sender: {
        id: user.id,
        name: user.name,
        type: 'user',
        avatar: user.avatar,
      },
      mentions: [],
      assignedTo: [],
      timestamp: Date.now(),
      isTask: false,
    };

    addMessageToConversation(currentConversationId, newMessage);
    setInput('');
    scrollToBottom();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const toggleAgentSelector = () => {
    setIsAgentSelectorOpen(!isAgentSelectorOpen);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">
          {activeAgent ? `Chatting with ${activeAgent.name}` : 'Chat'}
        </h2>
        <AgentSelector
          isOpen={isAgentSelectorOpen}
          onClose={() => setIsAgentSelectorOpen(false)}
          agents={agents}
          activeAgent={activeAgent}
          onAgentSelect={setActiveAgent}
        />
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4">
        {currentConversation ? (
          currentConversation.messages.map(message => (
            <MessageItem key={message.id} message={message} />
          ))
        ) : (
          <div className="text-center text-gray-500">No messages in this conversation.</div>
        )}
        <div ref={chatBottomRef} /> {/* Scroll anchor */}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Type your message here..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button onClick={handleSendMessage}>
            <SendHorizontal size={16} className="mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
