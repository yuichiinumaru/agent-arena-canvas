
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAgent } from '@/contexts/AgentContext';
import MessageItem from './MessageItem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizontal } from 'lucide-react';
import { Message } from '@/types';
import ActiveAgentsBar from './ActiveAgentsBar';
import ConversationSidebar from './ConversationSidebar';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const { user } = useAuth();
  const {
    agents,
    conversations,
    currentConversationId,
    addMessageToConversation,
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
    return <div className="p-4 text-foreground">Please log in to start chatting.</div>;
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

  return (
    <div className="flex h-full">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Conversation Sidebar */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <ConversationSidebar />
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Chat Area */}
        <ResizablePanel defaultSize={80}>
          <div className="flex flex-col h-full">
            {/* Active Agents Bar */}
            <ActiveAgentsBar />
            
            {/* Message List */}
            <ResizablePanelGroup direction="vertical" className="flex-1">
              <ResizablePanel defaultSize={80} className="overflow-hidden">
                <div className="h-full overflow-y-auto p-4 bg-background">
                  {currentConversation ? (
                    currentConversation.messages.length > 0 ? (
                      currentConversation.messages.map(message => (
                        <MessageItem 
                          key={message.id} 
                          message={message} 
                        />
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <p>No messages yet. Start a conversation!</p>
                      </div>
                    )
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      <p>Select or create a conversation to start chatting.</p>
                    </div>
                  )}
                  <div ref={chatBottomRef} /> {/* Scroll anchor */}
                </div>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              {/* Chat Input */}
              <ResizablePanel defaultSize={20} minSize={10} maxSize={40}>
                <div className="p-4 h-full bg-background">
                  <div className="flex items-center h-full space-x-2">
                    <Input
                      type="text"
                      placeholder="Type your message here..."
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1"
                      disabled={!currentConversationId}
                    />
                    <Button onClick={handleSendMessage} disabled={!currentConversationId}>
                      <SendHorizontal size={16} className="mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ChatInterface;
