
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Tool, ToolParameter } from '@/types';

interface ToolConfigProps {
  tools: Tool[];
  onAddTool: () => void;
  onUpdateTool: (id: string, updates: Partial<Tool>) => void;
  onRemoveTool: (id: string) => void;
  onAddParameter: (toolId: string) => void;
  onUpdateParameter: (toolId: string, paramIndex: number, updates: Partial<ToolParameter>) => void;
  onRemoveParameter: (toolId: string, paramIndex: number) => void;
}

export const ToolConfig: React.FC<ToolConfigProps> = ({
  tools,
  onAddTool,
  onUpdateTool,
  onRemoveTool,
  onAddParameter,
  onUpdateParameter,
  onRemoveParameter,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Tools</h3>
        <Button onClick={onAddTool}>
          <PlusCircle size={16} className="mr-2" />
          Add Tool
        </Button>
      </div>
      
      {tools.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          No tools configured. Add tools to extend the agent's capabilities.
        </div>
      ) : (
        <div className="space-y-4">
          {tools.map((tool) => (
            <Card key={tool.id}>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Input
                      value={tool.name}
                      onChange={(e) =>
                        onUpdateTool(tool.id, { name: e.target.value })
                      }
                      placeholder="Tool name"
                      className="w-2/3"
                    />
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`tool-${tool.id}-active`}
                        checked={tool.isActive}
                        onCheckedChange={(checked) =>
                          onUpdateTool(tool.id, { isActive: checked })
                        }
                      />
                      <Label htmlFor={`tool-${tool.id}-active`} className="cursor-pointer">
                        {tool.isActive ? 'Active' : 'Inactive'}
                      </Label>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveTool(tool.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  
                  <Textarea
                    value={tool.description}
                    onChange={(e) =>
                      onUpdateTool(tool.id, { description: e.target.value })
                    }
                    placeholder="Tool description"
                    rows={2}
                  />
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Parameters</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onAddParameter(tool.id)}
                      >
                        <PlusCircle size={14} className="mr-1" />
                        Add Parameter
                      </Button>
                    </div>
                    
                    {tool.parameters.length === 0 ? (
                      <div className="text-center p-4 text-gray-500 border rounded-md">
                        No parameters defined.
                      </div>
                    ) : (
                      tool.parameters.map((param, index) => (
                        <div key={index} className="border p-3 rounded-md mb-2">
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-3">
                              <Label className="text-xs">Name</Label>
                              <Input
                                value={param.name}
                                onChange={(e) =>
                                  onUpdateParameter(tool.id, index, {
                                    name: e.target.value,
                                  })
                                }
                                size={10}
                              />
                            </div>
                            
                            <div className="col-span-3">
                              <Label className="text-xs">Type</Label>
                              <select
                                value={param.type}
                                onChange={(e) =>
                                  onUpdateParameter(tool.id, index, {
                                    type: e.target.value as any,
                                  })
                                }
                                className="w-full px-3 py-2 border rounded-md"
                              >
                                <option value="string">String</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="array">Array</option>
                                <option value="object">Object</option>
                              </select>
                            </div>
                            
                            <div className="col-span-4">
                              <Label className="text-xs">Description</Label>
                              <Input
                                value={param.description}
                                onChange={(e) =>
                                  onUpdateParameter(tool.id, index, {
                                    description: e.target.value,
                                  })
                                }
                              />
                            </div>
                            
                            <div className="col-span-1 flex items-end justify-center">
                              <div className="flex items-center space-x-2 mb-2">
                                <Checkbox
                                  id={`param-${tool.id}-${index}-required`}
                                  checked={param.required}
                                  onCheckedChange={(checked) =>
                                    onUpdateParameter(tool.id, index, {
                                      required: !!checked,
                                    })
                                  }
                                />
                                <Label
                                  htmlFor={`param-${tool.id}-${index}-required`}
                                  className="text-xs cursor-pointer"
                                >
                                  Required
                                </Label>
                              </div>
                            </div>
                            
                            <div className="col-span-1 flex items-end justify-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemoveParameter(tool.id, index)}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
