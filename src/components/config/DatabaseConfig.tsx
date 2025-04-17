
import React from 'react';
import { useAgent } from '@/contexts/AgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Database } from 'lucide-react';

const DatabaseConfig: React.FC = () => {
  // For now, since we don't have appConfig in AgentContext, we'll just create dummy data
  const dummyConfig = {
    databases: [
      {
        id: '1',
        provider: 'postgres',
        type: 'SQL',
        name: 'Main Database',
        connection: {
          url: 'postgresql://username:password@localhost:5432/database',
          apiKey: '',
          username: 'username',
          password: 'password',
          database: 'mydb'
        },
        isActive: true
      }
    ]
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Database Configuration</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2" />
              Database Connection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure your database connections. These settings will be used by your agents to access data.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="db-active" checked={dummyConfig.databases[0].isActive} />
                <Label htmlFor="db-active">Active</Label>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="db-name">Database Name</Label>
                <Input id="db-name" value={dummyConfig.databases[0].name} />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="db-provider">Provider</Label>
                <Input id="db-provider" value={dummyConfig.databases[0].provider} />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="db-url">Connection URL</Label>
                <Input id="db-url" type="password" value={dummyConfig.databases[0].connection.url} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseConfig;
