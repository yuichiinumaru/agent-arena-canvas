
import React, { useState } from 'react';
import { useAgents } from '@/contexts/AgentContext';
import { DatabaseConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Trash2, Save, Database } from 'lucide-react';

const DatabaseConfigComponent: React.FC = () => {
  const { appConfig, updateDatabaseConfig } = useAgents();
  const [databases, setDatabases] = useState<DatabaseConfig[]>(appConfig.databases);
  
  // Add a new database configuration
  const handleAddDatabase = (type: DatabaseConfig['type']) => {
    const newDb: DatabaseConfig = {
      type,
      name: `New ${type} Database`,
      connection: {
        url: '',
        apiKey: '',
        username: '',
        password: '',
        database: '',
      },
      isActive: false,
    };
    
    setDatabases([...databases, newDb]);
  };
  
  // Update a database configuration
  const handleUpdateDatabase = (index: number, updates: Partial<DatabaseConfig>) => {
    const updatedDatabases = [...databases];
    updatedDatabases[index] = { ...updatedDatabases[index], ...updates };
    setDatabases(updatedDatabases);
  };
  
  // Update a database connection property
  const handleUpdateConnection = (
    index: number, 
    field: keyof DatabaseConfig['connection'], 
    value: string
  ) => {
    const updatedDatabases = [...databases];
    updatedDatabases[index] = { 
      ...updatedDatabases[index], 
      connection: {
        ...updatedDatabases[index].connection,
        [field]: value
      }
    };
    setDatabases(updatedDatabases);
  };
  
  // Remove a database configuration
  const handleRemoveDatabase = (index: number) => {
    const updatedDatabases = [...databases];
    updatedDatabases.splice(index, 1);
    setDatabases(updatedDatabases);
  };
  
  // Save all database configurations
  const handleSaveAll = () => {
    updateDatabaseConfig(databases);
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Database Configuration</h2>
        <Button onClick={handleSaveAll} className="flex items-center">
          <Save size={16} className="mr-2" />
          Save All
        </Button>
      </div>
      
      <p className="text-gray-500">
        Configure database connections for the agent's RAG capabilities. 
        The agents can store and retrieve information from these databases.
      </p>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Databases</TabsTrigger>
          <TabsTrigger value="arangodb">ArangoDB</TabsTrigger>
          <TabsTrigger value="postgresql">PostgreSQL</TabsTrigger>
          <TabsTrigger value="chromadb">ChromaDB</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center text-blue-700">
                  <Database size={18} className="mr-2" />
                  ArangoDB
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <p className="text-sm">Graph and document database for complex data relationships</p>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => handleAddDatabase('arangodb-graph')}
                      className="text-xs"
                    >
                      <PlusCircle size={14} className="mr-1" />
                      Add Graph DB
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleAddDatabase('arangodb-document')}
                      className="text-xs"
                    >
                      <PlusCircle size={14} className="mr-1" />
                      Add Document DB
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center text-green-700">
                  <Database size={18} className="mr-2" />
                  PostgreSQL
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <p className="text-sm">Relational database for structured data and relationships</p>
                  <Button 
                    variant="outline"
                    onClick={() => handleAddDatabase('postgresql')}
                  >
                    <PlusCircle size={14} className="mr-1" />
                    Add PostgreSQL DB
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-2">
              <CardHeader className="bg-purple-50">
                <CardTitle className="flex items-center text-purple-700">
                  <Database size={18} className="mr-2" />
                  ChromaDB
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <p className="text-sm">Vector database for semantic search and similarity matching</p>
                  <Button 
                    variant="outline"
                    onClick={() => handleAddDatabase('chromadb')}
                  >
                    <PlusCircle size={14} className="mr-1" />
                    Add ChromaDB
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <h3 className="text-lg font-medium mt-6">Configured Databases</h3>
          {databases.length === 0 ? (
            <div className="text-center p-8 text-gray-500 border rounded-md">
              No databases configured yet. Add a database using the options above.
            </div>
          ) : (
            <div className="space-y-4">
              {databases.map((db, index) => (
                <Card key={index}>
                  <CardHeader className={`
                    ${db.type.includes('arangodb') ? 'bg-blue-50' : ''}
                    ${db.type === 'postgresql' ? 'bg-green-50' : ''}
                    ${db.type === 'chromadb' ? 'bg-purple-50' : ''}
                  `}>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        <Database size={16} className="mr-2" />
                        {db.name}
                        <span className="ml-2 text-xs font-normal bg-gray-200 px-2 py-1 rounded">
                          {db.type}
                        </span>
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={db.isActive}
                          onCheckedChange={(checked) => 
                            handleUpdateDatabase(index, { isActive: checked })
                          }
                          id={`db-active-${index}`}
                        />
                        <Label htmlFor={`db-active-${index}`} className="text-sm">
                          {db.isActive ? 'Active' : 'Inactive'}
                        </Label>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`db-name-${index}`}>Database Name</Label>
                      <Input
                        id={`db-name-${index}`}
                        value={db.name}
                        onChange={(e) => handleUpdateDatabase(index, { name: e.target.value })}
                        placeholder="Database name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`db-url-${index}`}>Connection URL</Label>
                      <Input
                        id={`db-url-${index}`}
                        value={db.connection.url}
                        onChange={(e) => handleUpdateConnection(index, 'url', e.target.value)}
                        placeholder="https://example.com:8529"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {(db.type === 'chromadb' || db.type.includes('arangodb')) && (
                        <div className="space-y-2">
                          <Label htmlFor={`db-apiKey-${index}`}>API Key</Label>
                          <Input
                            id={`db-apiKey-${index}`}
                            value={db.connection.apiKey || ''}
                            onChange={(e) => handleUpdateConnection(index, 'apiKey', e.target.value)}
                            placeholder="API Key"
                            type="password"
                          />
                        </div>
                      )}
                      
                      {(db.type === 'postgresql' || db.type.includes('arangodb')) && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor={`db-username-${index}`}>Username</Label>
                            <Input
                              id={`db-username-${index}`}
                              value={db.connection.username || ''}
                              onChange={(e) => handleUpdateConnection(index, 'username', e.target.value)}
                              placeholder="Username"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`db-password-${index}`}>Password</Label>
                            <Input
                              id={`db-password-${index}`}
                              value={db.connection.password || ''}
                              onChange={(e) => handleUpdateConnection(index, 'password', e.target.value)}
                              placeholder="Password"
                              type="password"
                            />
                          </div>
                        </>
                      )}
                      
                      <div className="space-y-2">
                        <Label htmlFor={`db-database-${index}`}>Database Name</Label>
                        <Input
                          id={`db-database-${index}`}
                          value={db.connection.database || ''}
                          onChange={(e) => handleUpdateConnection(index, 'database', e.target.value)}
                          placeholder="Database name"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleRemoveDatabase(index)}
                        className="flex items-center"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Remove Database
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="arangodb" className="space-y-4 mt-4">
          <h3 className="text-lg font-medium">ArangoDB Databases</h3>
          <div className="flex space-x-2 mb-4">
            <Button 
              variant="outline"
              onClick={() => handleAddDatabase('arangodb-graph')}
            >
              <PlusCircle size={16} className="mr-2" />
              Add Graph DB
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleAddDatabase('arangodb-document')}
            >
              <PlusCircle size={16} className="mr-2" />
              Add Document DB
            </Button>
          </div>
          
          {databases.filter(db => db.type.includes('arangodb')).length === 0 ? (
            <div className="text-center p-8 text-gray-500 border rounded-md">
              No ArangoDB databases configured yet.
            </div>
          ) : (
            <div className="space-y-4">
              {databases
                .filter(db => db.type.includes('arangodb'))
                .map((db, idx) => {
                  const index = databases.findIndex(d => d === db);
                  return (
                    <Card key={index}>
                      <CardHeader className="bg-blue-50">
                        <div className="flex justify-between items-center">
                          <CardTitle className="flex items-center">
                            <Database size={16} className="mr-2" />
                            {db.name}
                            <span className="ml-2 text-xs font-normal bg-gray-200 px-2 py-1 rounded">
                              {db.type}
                            </span>
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={db.isActive}
                              onCheckedChange={(checked) => 
                                handleUpdateDatabase(index, { isActive: checked })
                              }
                              id={`db-active-${index}`}
                            />
                            <Label htmlFor={`db-active-${index}`} className="text-sm">
                              {db.isActive ? 'Active' : 'Inactive'}
                            </Label>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        {/* Same fields as above, repeated for this tab */}
                        <div className="space-y-2">
                          <Label htmlFor={`db-name-${index}`}>Database Name</Label>
                          <Input
                            id={`db-name-${index}`}
                            value={db.name}
                            onChange={(e) => handleUpdateDatabase(index, { name: e.target.value })}
                            placeholder="Database name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`db-url-${index}`}>Connection URL</Label>
                          <Input
                            id={`db-url-${index}`}
                            value={db.connection.url}
                            onChange={(e) => handleUpdateConnection(index, 'url', e.target.value)}
                            placeholder="https://example.com:8529"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`db-apiKey-${index}`}>API Key</Label>
                            <Input
                              id={`db-apiKey-${index}`}
                              value={db.connection.apiKey || ''}
                              onChange={(e) => handleUpdateConnection(index, 'apiKey', e.target.value)}
                              placeholder="API Key"
                              type="password"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`db-username-${index}`}>Username</Label>
                            <Input
                              id={`db-username-${index}`}
                              value={db.connection.username || ''}
                              onChange={(e) => handleUpdateConnection(index, 'username', e.target.value)}
                              placeholder="Username"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`db-password-${index}`}>Password</Label>
                            <Input
                              id={`db-password-${index}`}
                              value={db.connection.password || ''}
                              onChange={(e) => handleUpdateConnection(index, 'password', e.target.value)}
                              placeholder="Password"
                              type="password"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`db-database-${index}`}>Database Name</Label>
                            <Input
                              id={`db-database-${index}`}
                              value={db.connection.database || ''}
                              onChange={(e) => handleUpdateConnection(index, 'database', e.target.value)}
                              placeholder="Database name"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleRemoveDatabase(index)}
                            className="flex items-center"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Remove Database
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="postgresql" className="space-y-4 mt-4">
          <h3 className="text-lg font-medium">PostgreSQL Databases</h3>
          <Button 
            variant="outline"
            onClick={() => handleAddDatabase('postgresql')}
            className="mb-4"
          >
            <PlusCircle size={16} className="mr-2" />
            Add PostgreSQL Database
          </Button>
          
          {databases.filter(db => db.type === 'postgresql').length === 0 ? (
            <div className="text-center p-8 text-gray-500 border rounded-md">
              No PostgreSQL databases configured yet.
            </div>
          ) : (
            <div className="space-y-4">
              {databases
                .filter(db => db.type === 'postgresql')
                .map((db, idx) => {
                  const index = databases.findIndex(d => d === db);
                  return (
                    <Card key={index}>
                      <CardHeader className="bg-green-50">
                        {/* Similar content as above for PostgreSQL */}
                        <div className="flex justify-between items-center">
                          <CardTitle className="flex items-center">
                            <Database size={16} className="mr-2" />
                            {db.name}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={db.isActive}
                              onCheckedChange={(checked) => 
                                handleUpdateDatabase(index, { isActive: checked })
                              }
                              id={`db-active-${index}`}
                            />
                            <Label htmlFor={`db-active-${index}`} className="text-sm">
                              {db.isActive ? 'Active' : 'Inactive'}
                            </Label>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        {/* Same PostgreSQL specific fields */}
                        <div className="space-y-2">
                          <Label htmlFor={`db-name-${index}`}>Database Name</Label>
                          <Input
                            id={`db-name-${index}`}
                            value={db.name}
                            onChange={(e) => handleUpdateDatabase(index, { name: e.target.value })}
                            placeholder="Database name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`db-url-${index}`}>Connection URL</Label>
                          <Input
                            id={`db-url-${index}`}
                            value={db.connection.url}
                            onChange={(e) => handleUpdateConnection(index, 'url', e.target.value)}
                            placeholder="postgresql://username:password@localhost:5432/dbname"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`db-username-${index}`}>Username</Label>
                            <Input
                              id={`db-username-${index}`}
                              value={db.connection.username || ''}
                              onChange={(e) => handleUpdateConnection(index, 'username', e.target.value)}
                              placeholder="Username"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`db-password-${index}`}>Password</Label>
                            <Input
                              id={`db-password-${index}`}
                              value={db.connection.password || ''}
                              onChange={(e) => handleUpdateConnection(index, 'password', e.target.value)}
                              placeholder="Password"
                              type="password"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`db-database-${index}`}>Database Name</Label>
                            <Input
                              id={`db-database-${index}`}
                              value={db.connection.database || ''}
                              onChange={(e) => handleUpdateConnection(index, 'database', e.target.value)}
                              placeholder="Database name"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleRemoveDatabase(index)}
                            className="flex items-center"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Remove Database
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="chromadb" className="space-y-4 mt-4">
          <h3 className="text-lg font-medium">ChromaDB Vector Databases</h3>
          <Button 
            variant="outline"
            onClick={() => handleAddDatabase('chromadb')}
            className="mb-4"
          >
            <PlusCircle size={16} className="mr-2" />
            Add ChromaDB Database
          </Button>
          
          {databases.filter(db => db.type === 'chromadb').length === 0 ? (
            <div className="text-center p-8 text-gray-500 border rounded-md">
              No ChromaDB databases configured yet.
            </div>
          ) : (
            <div className="space-y-4">
              {databases
                .filter(db => db.type === 'chromadb')
                .map((db, idx) => {
                  const index = databases.findIndex(d => d === db);
                  return (
                    <Card key={index}>
                      <CardHeader className="bg-purple-50">
                        {/* Similar content as above for ChromaDB */}
                        <div className="flex justify-between items-center">
                          <CardTitle className="flex items-center">
                            <Database size={16} className="mr-2" />
                            {db.name}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={db.isActive}
                              onCheckedChange={(checked) => 
                                handleUpdateDatabase(index, { isActive: checked })
                              }
                              id={`db-active-${index}`}
                            />
                            <Label htmlFor={`db-active-${index}`} className="text-sm">
                              {db.isActive ? 'Active' : 'Inactive'}
                            </Label>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-4">
                        {/* ChromaDB specific fields */}
                        <div className="space-y-2">
                          <Label htmlFor={`db-name-${index}`}>Database Name</Label>
                          <Input
                            id={`db-name-${index}`}
                            value={db.name}
                            onChange={(e) => handleUpdateDatabase(index, { name: e.target.value })}
                            placeholder="Database name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`db-url-${index}`}>Connection URL</Label>
                          <Input
                            id={`db-url-${index}`}
                            value={db.connection.url}
                            onChange={(e) => handleUpdateConnection(index, 'url', e.target.value)}
                            placeholder="http://localhost:8000"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`db-apiKey-${index}`}>API Key</Label>
                            <Input
                              id={`db-apiKey-${index}`}
                              value={db.connection.apiKey || ''}
                              onChange={(e) => handleUpdateConnection(index, 'apiKey', e.target.value)}
                              placeholder="API Key"
                              type="password"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`db-database-${index}`}>Collection Name</Label>
                            <Input
                              id={`db-database-${index}`}
                              value={db.connection.database || ''}
                              onChange={(e) => handleUpdateConnection(index, 'database', e.target.value)}
                              placeholder="Collection name"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleRemoveDatabase(index)}
                            className="flex items-center"
                          >
                            <Trash2 size={14} className="mr-1" />
                            Remove Database
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseConfigComponent;
