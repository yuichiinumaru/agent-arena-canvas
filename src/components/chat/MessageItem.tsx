
import React from 'react';
import { Message, Agent } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MessageItemProps {
  message: Message;
  agents: Agent[];
}

const MessageItem: React.FC<MessageItemProps> = ({ message, agents }) => {
  const isUser = message.sender.type === 'user';
  const agent = message.sender.type === 'agent' 
    ? agents.find(a => a.id === message.sender.id) 
    : null;
  
  // Extract and format any @mentions in the message
  const formatMessageContent = (content: string) => {
    // Replace @mentions with styled spans
    const formattedContent = content.replace(/@(\w+)/g, (match, name) => {
      const mentionedAgent = agents.find(a => a.name.toLowerCase() === name.toLowerCase());
      if (mentionedAgent) {
        return `<span class="inline-block px-1 bg-blue-100 text-blue-800 rounded">${match}</span>`;
      }
      return match;
    });
    
    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
  };

  return (
    <div className={cn(
      "flex gap-3 max-w-[80%]",
      isUser ? "ml-auto" : "mr-auto"
    )}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={agent?.avatar || message.sender.avatar} alt={message.sender.name} />
          <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      
      <Card className={cn(
        "px-4 py-2 rounded-xl",
        isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        message.isTask && "border-l-4 border-yellow-500"
      )}>
        <CardContent className="p-0">
          <div className="mb-1 flex items-center gap-2">
            <span className="font-semibold text-sm">
              {message.sender.name}
            </span>
            {message.isTask && (
              <span className="bg-yellow-200 text-yellow-800 text-xs px-1 rounded">
                Task
              </span>
            )}
          </div>
          
          <div className="whitespace-pre-wrap text-sm">
            {formatMessageContent(message.content)}
          </div>
          
          {/* If this message is a reply to another message */}
          {message.inReplyTo && (
            <div className="mt-2 text-xs text-gray-500">
              Replying to a message
            </div>
          )}
        </CardContent>
      </Card>
      
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
          <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageItem;
