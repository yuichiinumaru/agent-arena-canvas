import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAgent } from '@/contexts/AgentContext';
import { useConversation } from '@/contexts/ConversationContext';
import MessageItem from './MessageItem';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Upload, FileUp, Copy } from 'lucide-react';
import { Message } from '@/types';
import ActiveAgentsBar from './ActiveAgentsBar';
import ConversationSidebar from './ConversationSidebar';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { FileDropZone } from '@/components/shared/FileDropZone';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadFile } = useFileUpload();
  const { agents } = useAgent();
  const {
    conversations,
    currentConversationId,
    addMessageToConversation,
  } = useConversation();
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Adjust textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

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
        name: user.name || 'User',
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
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    scrollToBottom();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!files.length || !currentConversationId || !user) return;
    
    try {
      setIsUploading(true);
      const file = files[0];
      
      // Upload file to storage
      const uploadedFile = await uploadFile(file, 'chat-uploads');
      
      if (uploadedFile) {
        // Create a message with the file
        const fileMessage: Omit<Message, 'id'> = {
          conversationId: currentConversationId,
          content: `Uploaded file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
          sender: {
            id: user.id,
            name: user.name || 'User',
            type: 'user',
            avatar: user.avatar,
          },
          mentions: [],
          assignedTo: [],
          timestamp: Date.now(),
          isTask: false,
          fileAttachment: {
            name: file.name,
            path: uploadedFile.path,
            type: file.type,
            size: file.size
          }
        };
        
        addMessageToConversation(currentConversationId, fileMessage);
        scrollToBottom();
        
        toast({
          title: 'File uploaded',
          description: 'The file was successfully uploaded and added to the conversation.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Upload Error',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const exportChatToMarkdown = () => {
    if (!currentConversation) return;
    
    try {
      // Generate markdown content
      let markdownContent = `# Conversation: ${currentConversation.title}\n`;
      markdownContent += `Date: ${new Date().toISOString().split('T')[0]}\n\n`;
      
      // Add messages
      currentConversation.messages.forEach(message => {
        const senderName = message.sender.name;
        const timestamp = new Date(message.timestamp).toLocaleString();
        
        markdownContent += `## ${senderName} (${timestamp})\n\n`;
        
        // Check if message has a file attachment
        if ('fileAttachment' in message && message.fileAttachment) {
          markdownContent += `*Attached file: ${message.fileAttachment.name}*\n\n`;
        }
        
        markdownContent += `${message.content}\n\n`;
      });
      
      // Create and download the file
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      const filename = `${date}-${currentConversation.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`;
      
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Conversation exported',
        description: `Successfully exported conversation to ${filename}`,
      });
    } catch (error: any) {
      toast({
        title: 'Export Error',
        description: error.message || 'Failed to export conversation',
        variant: 'destructive',
      });
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
            {/* Active Agents Bar with Export Button */}
            <div className="border-b border-border">
              <div className="flex justify-between items-center p-2">
                <ActiveAgentsBar />
                {currentConversationId && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={exportChatToMarkdown}
                    className="ml-2 flex items-center"
                  >
                    <Copy size={16} className="mr-2" />
                    Copy to Markdown
                  </Button>
                )}
              </div>
            </div>
            
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
                  <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-hidden">
                      <Textarea
                        ref={textareaRef}
                        placeholder="Type your message here..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full h-full min-h-[80px] resize-none"
                        disabled={!currentConversationId}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <FileDropZone
                        onDrop={handleFileUpload}
                        maxFiles={1}
                        isLoading={isUploading}
                      >
                        <Button 
                          variant="outline" 
                          type="button"
                          disabled={!currentConversationId || isUploading}
                        >
                          <FileUp size={16} className="mr-2" />
                          {isUploading ? 'Uploading...' : 'Upload File'}
                        </Button>
                      </FileDropZone>
                      
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={!currentConversationId || !input.trim()}
                      >
                        <SendHorizontal size={16} className="mr-2" />
                        Send
                      </Button>
                    </div>
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
