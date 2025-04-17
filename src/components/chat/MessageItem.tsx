
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageItemProps } from '@/types/message';

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { sender, content, timestamp } = message;
  const isUser = sender.type === 'user';
  const isSystem = sender.type === 'system';

  return (
    <div className={`flex gap-4 mb-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={sender.avatar} alt={sender.name} />
          <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[70%] ${isUser ? 'bg-primary/10' : isSystem ? 'bg-secondary/20' : 'bg-secondary'} p-3 rounded-lg`}>
        <div className="flex justify-between items-start mb-1">
          <span className="font-medium text-sm">{sender.name}</span>
          <span className="text-xs text-muted-foreground ml-2">
            {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm">{content}</p>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={sender.avatar} alt={sender.name} />
          <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageItem;
