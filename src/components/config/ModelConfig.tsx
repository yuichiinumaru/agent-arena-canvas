
import React, { useState } from 'react';
import { useAgents } from '@/contexts/AgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Save, Trash2 } from 'lucide-react';
import { ModelConfig } from '@/types';

const ModelConfigPage: React.FC = () => {
  const { appConfig, updateModelConfig } = useAgents();
  const { toast } = useToast();
  const [models, setModels] = useState<ModelConfig[]>(appConfig.models);
  
  const handleAddModel = () => {
    setModels([
      ...models,
      {
        id: `model-${Date.now()}`,
        name: 'New Model',
        provider: 'google',
        apiKey: '',
        isDefault: models.length === 0,
      },
    ]);
  };
  
  const handleUpdateModel = (index: number, updates: Partial<ModelConfig>) => {
    const updatedModels = [...models];
    updatedModels[index] = { ...updatedModels[index], ...updates };
    
    // If this model is being set as default, unset all others
    if (updates.isDefault) {
      updatedModels.forEach((model, i) => {
        if (i !== index) {
          model.isDefault = false;
        }
      });
    }
    
    setModels(updatedModels);
  };
  
  const handleSaveModels = () => {
    // Ensure at least one model is set as default
    if (!models.some(model => model.isDefault)) {
      if (models.length > 0) {
        models[0].isDefault = true;
      }
    }
    
    updateModelConfig(models);
    
    toast({
      title: 'Models configuration saved',
      description: 'Your models configuration has been updated.',
    });
  };
  
  const handleRemoveModel = (index: number) => {
    const newModels = models.filter((_, i) => i !== index);
    
    // If we removed the default model, set the first one as default
    if (models[index].isDefault && newModels.length > 0) {
      newModels[0].isDefault = true;
    }
    
    setModels(newModels);
  };
  
  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Model Configuration</h2>
        <div className="flex space-x-2">
          <Button onClick={handleAddModel} className="bg-primary hover:bg-primary/90">
            <PlusCircle size={16} className="mr-2" />
            Add Model
          </Button>
          <Button onClick={handleSaveModels} className="bg-primary hover:bg-primary/90">
            <Save size={16} className="mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
      
      <div className="space-y-4">
        {models.map((model, index) => (
          <Card key={model.id} className="bg-card text-card-foreground">
            <CardHeader className="pb-2">
              <CardTitle>
                <Input 
                  value={model.name} 
                  onChange={e => handleUpdateModel(index, { name: e.target.value })}
                  className="bg-input text-foreground font-bold"
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`provider-${model.id}`}>Provider</Label>
                  <select
                    id={`provider-${model.id}`}
                    value={model.provider}
                    onChange={e => handleUpdateModel(index, { provider: e.target.value as 'google' })}
                    className="w-full p-2 border rounded text-foreground bg-input"
                  >
                    <option value="google">Google (Gemini)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`api-key-${model.id}`}>API Key</Label>
                  <Input
                    id={`api-key-${model.id}`}
                    type="password"
                    value={model.apiKey}
                    onChange={e => handleUpdateModel(index, { apiKey: e.target.value })}
                    placeholder="Enter your API key"
                    className="bg-input text-foreground"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={model.isDefault}
                    onCheckedChange={checked => handleUpdateModel(index, { isDefault: checked })}
                    id={`default-${model.id}`}
                  />
                  <Label htmlFor={`default-${model.id}`}>Default Model</Label>
                </div>
                
                <Button variant="destructive" onClick={() => handleRemoveModel(index)}>
                  <Trash2 size={16} className="mr-2" />
                  Remove
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {models.length === 0 && (
          <div className="text-center p-8 border rounded-lg">
            <p className="text-muted-foreground mb-4">No models configured. Add a model to get started.</p>
            <Button onClick={handleAddModel} className="bg-primary hover:bg-primary/90">
              <PlusCircle size={16} className="mr-2" />
              Add Model
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelConfigPage;
