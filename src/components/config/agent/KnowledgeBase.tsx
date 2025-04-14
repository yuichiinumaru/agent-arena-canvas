
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Upload } from 'lucide-react';
import { FileDropZone } from '@/components/shared/FileDropZone';
import { KnowledgeItem } from '@/types';

interface KnowledgeBaseProps {
  items: KnowledgeItem[];
  onAddItem: () => void;
  onUpdateItem: (id: string, updates: Partial<KnowledgeItem>) => void;
  onRemoveItem: (id: string) => void;
  onFileUpload?: (file: File, itemId: string) => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  onFileUpload,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Knowledge Items</h3>
        <Button onClick={onAddItem}>
          <PlusCircle size={16} className="mr-2" />
          Add Item
        </Button>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          No knowledge items. Add some to help the agent respond more effectively.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Input
                      value={item.name}
                      onChange={(e) =>
                        onUpdateItem(item.id, { name: e.target.value })
                      }
                      placeholder="Item name"
                      className="w-2/3"
                    />
                    
                    <select
                      value={item.type}
                      onChange={(e) =>
                        onUpdateItem(item.id, {
                          type: e.target.value as 'text' | 'file',
                        })
                      }
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="text">Text</option>
                      <option value="file">File</option>
                    </select>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  
                  {item.type === 'text' ? (
                    <Textarea
                      value={item.content}
                      onChange={(e) =>
                        onUpdateItem(item.id, { content: e.target.value })
                      }
                      placeholder="Enter knowledge content"
                      rows={5}
                    />
                  ) : (
                    <FileDropZone
                      onDrop={(files) => onFileUpload?.(files[0], item.id)}
                      maxFiles={1}
                      accept={{
                        'application/pdf': ['.pdf'],
                        'text/plain': ['.txt'],
                        'text/markdown': ['.md'],
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                      }}
                    >
                      <div className="text-center">
                        <Button variant="outline">
                          <Upload size={16} className="mr-2" />
                          Upload File
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">
                          {item.content
                            ? `File: ${item.content}`
                            : 'Supported formats: PDF, TXT, DOCX, MD'}
                        </p>
                      </div>
                    </FileDropZone>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
