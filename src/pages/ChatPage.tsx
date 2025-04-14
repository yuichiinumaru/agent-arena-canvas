
import React from 'react';
import ChatInterface from '@/components/chat/ChatInterface';

const ChatPage: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b">
        <div className="container py-4">
          <h1 className="text-2xl font-bold">Multi-Agent Chat</h1>
          <p className="text-gray-500">Chat with multiple AI agents and assign them tasks</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatPage;
