
import React, { useState } from 'react';
import { useAgents } from '@/contexts/AgentContext';
import { ModelConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Trash2, Save, Sparkles } from 'lucide-react';
import geminiService from '@/services/geminiService';

const ModelConfigComponent: React.FC = () => {
  const { appConfig, updateModelConfig } = useAgents();
  const [models, setModels] = useState<ModelConfig[]>(appConfig.models);
  const [testApiKey, setTestApiKey] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  // Add a new model configuration
  const handleAddModel = () => {
    // New models are always Google models as specified in the requirements
    const newModel: ModelConfig = {
      id: `model-${Date.now()}`,
      name: `New Google Model`,
      provider: 'google',
      apiKey: '',
      isDefault: models.length === 0, // Make default if it's the first one
    };
    
    setModels([...models, newModel]);
  };
  
  // Update a model configuration
  const handleUpdateModel = (index: number, updates: Partial<ModelConfig>) => {
    const updatedModels = [...models];
    updatedModels[index] = { ...updatedModels[index], ...updates };
    
    // If this model is set as default, make sure no other model is default
    if (updates.isDefault) {
      updatedModels.forEach((model, i) => {
        if (i !== index) {
          model.isDefault = false;
        }
      });
    }
    
    // Ensure at least one model is default
    if (!updatedModels.some(model => model.isDefault)) {
      updatedModels[0].isDefault = true;
    }
    
    setModels(updatedModels);
  };
  
  // Remove a model configuration
  const handleRemoveModel = (index: number) => {
    const updatedModels = [...models];
    const removedModel = updatedModels[index];
    updatedModels.splice(index, 1);
    
    // If the removed model was default, make another one default
    if (removedModel.isDefault && updatedModels.length > 0) {
      updatedModels[0].isDefault = true;
    }
    
    setModels(updatedModels);
  };
  
  // Save all model configurations
  const handleSaveAll = () => {
    updateModelConfig(models);
  };
  
  // Test connection to Google Gemini API
  const handleTestConnection = async (apiKey: string) => {
    setIsTestingConnection(true);
    setTestResult(null);
    
    try {
      // Test the connection with the provided API key
      await geminiService.testConnection(apiKey);
      
      setTestResult({
        success: true,
        message: "Connection successful! The API key is valid.",
      });
    } catch (error) {
      console.error('API test error:', error);
      setTestResult({
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Model Configuration</h2>
        <Button onClick={handleSaveAll} className="flex items-center">
          <Save size={16} className="mr-2" />
          Save All
        </Button>
      </div>
      
      <p className="text-gray-500">
        Configure Google Gemini AI models for your agents. All agents use Google's models.
      </p>
      
      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center text-indigo-700">
            <Sparkles size={20} className="mr-2" />
            Test Google API Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <p className="text-sm">
              Verify your Google API key is working before adding it to your models
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="test-api-key">Google API Key</Label>
              <div className="flex space-x-2">
                <Input
                  id="test-api-key"
                  value={testApiKey}
                  onChange={(e) => setTestApiKey(e.target.value)}
                  placeholder="Enter your Google API key to test"
                  type="password"
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleTestConnection(testApiKey)}
                  disabled={!testApiKey || isTestingConnection}
                >
                  {isTestingConnection ? 'Testing...' : 'Test Connection'}
                </Button>
              </div>
            </div>
            
            {testResult && (
              <div className={`p-3 rounded-md ${
                testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {testResult.message}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Configured Models</h3>
        <Button onClick={handleAddModel} className="flex items-center">
          <PlusCircle size={16} className="mr-2" />
          Add Model
        </Button>
      </div>
      
      {models.length === 0 ? (
        <div className="text-center p-8 text-gray-500 border rounded-md">
          No models configured yet. Add a model using the button above.
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          {models.map((model, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{model.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={model.isDefault}
                      onCheckedChange={(checked) => 
                        handleUpdateModel(index, { isDefault: checked })
                      }
                      id={`model-default-${index}`}
                      disabled={model.isDefault && models.length > 1}
                    />
                    <Label htmlFor={`model-default-${index}`} className="text-sm">
                      Default Model
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`model-name-${index}`}>Model Name</Label>
                  <Input
                    id={`model-name-${index}`}
                    value={model.name}
                    onChange={(e) => handleUpdateModel(index, { name: e.target.value })}
                    placeholder="e.g., Gemini 2.5 Pro Preview"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`model-id-${index}`}>Model ID</Label>
                  <select
                    id={`model-id-${index}`}
                    value={model.id}
                    onChange={(e) => handleUpdateModel(index, { id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="gemini-2.5-pro-preview">gemini-2.5-pro-preview (Latest)</option>
                    <option value="gemini-2.0-pro">gemini-2.0-pro</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                    <option value="gemini-1.0-pro">gemini-1.0-pro</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose from available Google Gemini models
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`model-apiKey-${index}`}>API Key</Label>
                  <Input
                    id={`model-apiKey-${index}`}
                    value={model.apiKey}
                    onChange={(e) => handleUpdateModel(index, { apiKey: e.target.value })}
                    placeholder="Enter your Google API key"
                    type="password"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleRemoveModel(index)}
                    className="flex items-center"
                    disabled={models.length <= 1} // Prevent removing the last model
                  >
                    <Trash2 size={14} className="mr-1" />
                    Remove Model
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-6 p-4 bg-slate-50 rounded-md">
        <h3 className="text-md font-medium mb-2">About Google's API</h3>
        <p className="text-sm text-gray-600">
          To use Google's Gemini models, you need an API key from Google AI Studio. 
          Visit <a href="https://ai.google.dev/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            ai.google.dev
          </a> to sign up and get your API key.
        </p>
      </div>
    </div>
  );
};

export default ModelConfigComponent;
