
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Loader2, Copy, Check, FileJson, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FastApiParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: string;
}

interface FastApiEndpoint {
  path: string;
  method: string;
  summary: string;
  description: string;
  parameters: FastApiParameter[];
}

interface McpTool {
  name: string;
  description: string;
  parameters: {
    name: string;
    type: string; 
    description: string;
    required: boolean;
    default?: any;
  }[];
}

const FastApiMcpConverter: React.FC = () => {
  const [apiUrl, setApiUrl] = useState('');
  const [apiSpec, setApiSpec] = useState('');
  const [endpoints, setEndpoints] = useState<FastApiEndpoint[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<FastApiEndpoint | null>(null);
  const [mcpTool, setMcpTool] = useState<McpTool | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('url');
  const [includeDefaults, setIncludeDefaults] = useState(true);

  const { toast } = useToast();

  const fetchOpenApiSpec = async () => {
    if (!apiUrl) {
      toast({
        title: 'Error',
        description: 'Please enter a FastAPI URL',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Try to fetch the OpenAPI spec from the provided URL
      const url = apiUrl.endsWith('/openapi.json') ? apiUrl : `${apiUrl}/openapi.json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch OpenAPI spec: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract endpoints from the OpenAPI spec
      const extractedEndpoints: FastApiEndpoint[] = [];
      
      // Process the paths and operations in the OpenAPI spec
      Object.entries(data.paths || {}).forEach(([path, pathItem]: [string, any]) => {
        Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
          const parameters: FastApiParameter[] = [];
          
          // Process parameters
          [...(operation.parameters || []), ...(pathItem.parameters || [])].forEach((param: any) => {
            if (param.in === 'path' || param.in === 'query') {
              parameters.push({
                name: param.name,
                type: mapOpenApiTypeToMcp(param.schema?.type || 'string'),
                description: param.description || '',
                required: param.required || false,
                default: param.schema?.default !== undefined ? String(param.schema.default) : undefined,
              });
            }
          });
          
          // Process request body if it exists
          if (operation.requestBody?.content?.['application/json']?.schema?.properties) {
            const properties = operation.requestBody.content['application/json'].schema.properties;
            const required = operation.requestBody.content['application/json'].schema.required || [];
            
            Object.entries(properties).forEach(([propName, propSchema]: [string, any]) => {
              parameters.push({
                name: propName,
                type: mapOpenApiTypeToMcp(propSchema.type || 'string'),
                description: propSchema.description || '',
                required: required.includes(propName),
                default: propSchema.default !== undefined ? String(propSchema.default) : undefined,
              });
            });
          }
          
          extractedEndpoints.push({
            path,
            method: method.toUpperCase(),
            summary: operation.summary || '',
            description: operation.description || '',
            parameters,
          });
        });
      });
      
      setEndpoints(extractedEndpoints);
      setApiSpec(JSON.stringify(data, null, 2));
      
      toast({
        title: 'Success',
        description: `Found ${extractedEndpoints.length} endpoints`,
      });
    } catch (error) {
      console.error('Error fetching OpenAPI spec:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch OpenAPI spec',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parseManualSpec = () => {
    if (!apiSpec) {
      toast({
        title: 'Error',
        description: 'Please enter an OpenAPI specification',
        variant: 'destructive',
      });
      return;
    }

    try {
      const data = JSON.parse(apiSpec);
      
      // Extract endpoints from the OpenAPI spec (same logic as fetchOpenApiSpec)
      const extractedEndpoints: FastApiEndpoint[] = [];
      
      Object.entries(data.paths || {}).forEach(([path, pathItem]: [string, any]) => {
        Object.entries(pathItem).forEach(([method, operation]: [string, any]) => {
          const parameters: FastApiParameter[] = [];
          
          [...(operation.parameters || []), ...(pathItem.parameters || [])].forEach((param: any) => {
            if (param.in === 'path' || param.in === 'query') {
              parameters.push({
                name: param.name,
                type: mapOpenApiTypeToMcp(param.schema?.type || 'string'),
                description: param.description || '',
                required: param.required || false,
                default: param.schema?.default !== undefined ? String(param.schema.default) : undefined,
              });
            }
          });
          
          if (operation.requestBody?.content?.['application/json']?.schema?.properties) {
            const properties = operation.requestBody.content['application/json'].schema.properties;
            const required = operation.requestBody.content['application/json'].schema.required || [];
            
            Object.entries(properties).forEach(([propName, propSchema]: [string, any]) => {
              parameters.push({
                name: propName,
                type: mapOpenApiTypeToMcp(propSchema.type || 'string'),
                description: propSchema.description || '',
                required: required.includes(propName),
                default: propSchema.default !== undefined ? String(propSchema.default) : undefined,
              });
            });
          }
          
          extractedEndpoints.push({
            path,
            method: method.toUpperCase(),
            summary: operation.summary || '',
            description: operation.description || '',
            parameters,
          });
        });
      });
      
      setEndpoints(extractedEndpoints);
      
      toast({
        title: 'Success',
        description: `Found ${extractedEndpoints.length} endpoints`,
      });
    } catch (error) {
      console.error('Error parsing OpenAPI spec:', error);
      toast({
        title: 'Error',
        description: 'Invalid OpenAPI specification JSON',
        variant: 'destructive',
      });
    }
  };

  const convertToMcp = (endpoint: FastApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    
    // Create MCP tool from the selected endpoint
    const tool: McpTool = {
      name: endpoint.summary || `${endpoint.method} ${endpoint.path}`,
      description: endpoint.description || `API endpoint: ${endpoint.method} ${endpoint.path}`,
      parameters: endpoint.parameters.map(param => ({
        name: param.name,
        type: param.type as 'string' | 'number' | 'boolean' | 'array' | 'object',
        description: param.description,
        required: param.required,
        default: includeDefaults && param.default ? param.default : undefined,
      })),
    };
    
    setMcpTool(tool);
  };

  const copyToClipboard = () => {
    if (mcpTool) {
      navigator.clipboard.writeText(JSON.stringify(mcpTool, null, 2));
      setCopied(true);
      
      toast({
        title: 'Copied',
        description: 'MCP tool configuration copied to clipboard',
      });
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const mapOpenApiTypeToMcp = (openApiType: string): string => {
    switch (openApiType) {
      case 'integer':
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'array':
        return 'array';
      case 'object':
        return 'object';
      case 'string':
      default:
        return 'string';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>FastAPI to MCP Converter</CardTitle>
        <CardDescription>
          Convert FastAPI endpoints to Model Context Protocol (MCP) tools for agent integration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="url">URL</TabsTrigger>
            <TabsTrigger value="json">JSON Spec</TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-url">FastAPI URL</Label>
              <div className="flex space-x-2">
                <Input
                  id="api-url"
                  placeholder="https://api.example.com"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                />
                <Button onClick={fetchOpenApiSpec} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Fetch
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the base URL of a FastAPI application. We'll automatically fetch the OpenAPI spec.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="json" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-spec">OpenAPI Specification</Label>
              <Textarea
                id="api-spec"
                placeholder="Paste OpenAPI JSON specification here"
                rows={10}
                value={apiSpec}
                onChange={(e) => setApiSpec(e.target.value)}
                className="font-mono text-xs"
              />
              <Button onClick={parseManualSpec}>Parse</Button>
            </div>
          </TabsContent>
        </Tabs>

        {endpoints.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Available Endpoints</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="include-defaults"
                  checked={includeDefaults}
                  onCheckedChange={setIncludeDefaults}
                />
                <Label htmlFor="include-defaults">Include defaults</Label>
              </div>
            </div>
            
            <div className="border rounded-md">
              {endpoints.map((endpoint, index) => (
                <div 
                  key={`${endpoint.method}-${endpoint.path}-${index}`}
                  className="p-4 border-b last:border-b-0 hover:bg-accent cursor-pointer flex justify-between items-center"
                  onClick={() => convertToMcp(endpoint)}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-mono px-2 py-1 rounded ${
                        endpoint.method === 'GET' ? 'bg-blue-100 text-blue-800' :
                        endpoint.method === 'POST' ? 'bg-green-100 text-green-800' :
                        endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                        endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {endpoint.method}
                      </span>
                      <span className="font-mono text-sm">{endpoint.path}</span>
                    </div>
                    {endpoint.summary && (
                      <p className="text-sm text-muted-foreground mt-1">{endpoint.summary}</p>
                    )}
                  </div>
                  <ArrowRight size={16} className="text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
        )}

        {mcpTool && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">MCP Tool Configuration</h3>
            <div className="relative">
              <div className="absolute top-2 right-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={copyToClipboard}
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </Button>
              </div>
              <pre className="p-4 bg-muted rounded-md overflow-auto max-h-80 font-mono text-xs">
                {JSON.stringify(mcpTool, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-2">
          <FileJson size={16} />
          <span>Based on <a href="https://github.com/tadata-org/fastapi_mcp" target="_blank" rel="noopener noreferrer" className="underline">FastAPI MCP</a></span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FastApiMcpConverter;
