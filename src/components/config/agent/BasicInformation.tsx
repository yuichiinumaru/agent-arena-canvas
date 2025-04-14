
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ModelConfig } from '@/types';

interface BasicInformationProps {
  name: string;
  description: string;
  instructions: string;
  avatar: string;
  model: string;
  tokenCount: number;
  isActive?: boolean;
  models: ModelConfig[];
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onInstructionsChange: (value: string) => void;
  onAvatarChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onActiveChange?: (value: boolean) => void;
}

export const BasicInformation: React.FC<BasicInformationProps> = ({
  name,
  description,
  instructions,
  avatar,
  model,
  tokenCount,
  isActive,
  models,
  onNameChange,
  onDescriptionChange,
  onInstructionsChange,
  onAvatarChange,
  onModelChange,
  onActiveChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Agent name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="avatar">Avatar URL</Label>
            <Input
              id="avatar"
              value={avatar}
              onChange={(e) => onAvatarChange(e.target.value)}
              placeholder="https://example.com/avatar.png"
            />
          </div>
          
          <div className="space-y-2 col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Brief description of this agent's role"
              rows={2}
            />
          </div>
          
          <div className="space-y-2 col-span-2">
            <div className="flex justify-between">
              <Label htmlFor="instructions">Instructions</Label>
              <span className="text-xs text-gray-500">
                {tokenCount} tokens
              </span>
            </div>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => onInstructionsChange(e.target.value)}
              placeholder="Detailed instructions for the agent's behavior"
              rows={8}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <select
              id="model"
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              {models.map((modelConfig) => (
                <option key={modelConfig.id} value={modelConfig.id}>
                  {modelConfig.name}
                </option>
              ))}
            </select>
          </div>
          
          {onActiveChange && (
            <div className="space-y-2 flex items-center">
              <div className="flex-1">
                <Label htmlFor="isActive">Status</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={onActiveChange}
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    {isActive ? 'Active' : 'Inactive'}
                  </Label>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
