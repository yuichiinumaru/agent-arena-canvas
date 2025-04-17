
import React from 'react';
import ChatInterface from '@/components/chat/ChatInterface';

const ChatPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col">      
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatPage;
