
import React, { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MessageItemProps } from '@/types/message';
import { PencilIcon, Trash2, Download, Check, X, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAgent } from '@/contexts/AgentContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { sender, content, timestamp } = message;
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isDeleting, setIsDeleting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateMessageInConversation, deleteMessageInConversation } = useAgent();
  const { toast } = useToast();
  
  const isUser = sender.type === 'user';
  const isSystem = sender.type === 'system';
  
  // Adjust textarea height when editing
  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, editedContent]);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSaveEdit = () => {
    if (editedContent.trim()) {
      updateMessageInConversation(message.conversationId, message.id, { content: editedContent });
      setIsEditing(false);
      toast({
        title: 'Message updated',
        description: 'The message was updated successfully.',
      });
    }
  };
  
  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    setIsDeleting(true);
  };
  
  const confirmDelete = () => {
    deleteMessageInConversation(message.conversationId, message.id);
    setIsDeleting(false);
    toast({
      title: 'Message deleted',
      description: 'The message was deleted successfully.',
    });
  };
  
  const cancelDelete = () => {
    setIsDeleting(false);
  };
  
  const handleDownloadFile = async () => {
    if (!message.fileAttachment) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('agent-files')
        .download(message.fileAttachment.path);
        
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = message.fileAttachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        title: 'Download Error',
        description: error.message || 'Failed to download file',
        variant: 'destructive',
      });
    }
  };

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
        
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full resize-none min-h-[80px]"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                <X size={14} className="mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                <Check size={14} className="mr-1" /> Save
              </Button>
            </div>
          </div>
        ) : isDeleting ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-destructive">Are you sure you want to delete this message?</p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={cancelDelete}>
                <X size={14} className="mr-1" /> Cancel
              </Button>
              <Button size="sm" variant="destructive" onClick={confirmDelete}>
                <Trash2 size={14} className="mr-1" /> Delete
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm whitespace-pre-wrap">{content}</p>
            
            {/* File attachment UI */}
            {message.fileAttachment && (
              <div className="mt-2 bg-background/30 rounded-md p-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileIcon size={16} />
                  <span className="text-sm truncate max-w-[180px]">{message.fileAttachment.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={handleDownloadFile}
                >
                  <Download size={14} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Message action buttons for user messages */}
      {isUser && !isEditing && !isDeleting && (
        <div className="flex flex-col gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full bg-background/50 hover:bg-background/80"
            onClick={handleEdit}
          >
            <PencilIcon size={12} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-full bg-background/50 hover:bg-background/80 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 size={12} />
          </Button>
        </div>
      )}
      
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
