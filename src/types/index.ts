
// Main type definitions for the application

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  model: string;
  description: string;
  instructions: string;
  instructionTokenCount: number;
  isActive: boolean;
  knowledgeBase: KnowledgeItem[];
  tools: Tool[];
}

export interface KnowledgeItem {
  id: string;
  name: string;
  content: string;
  type: 'text' | 'file';
  size?: number;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  parameters: ToolParameter[];
  isActive: boolean;
  script?: string;
}

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  default?: any;
}

export interface FileAttachment {
  name: string;
  path: string;
  type: string;
  size: number;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  sender: {
    id: string;
    name: string;
    type: 'user' | 'agent' | 'system';
    avatar?: string;
  };
  mentions: string[]; // Agent IDs mentioned with @
  assignedTo: string[]; // Agent IDs assigned to respond
  timestamp: number;
  isTask: boolean;
  parentMessageId?: string;
  inReplyTo?: string;
  fileAttachment?: FileAttachment;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  items: KnowledgeItem[];
}

export interface DatabaseConfig {
  id: string;
  name: string;
  provider: 'supabase' | 'postgres' | 'mysql';
  connectionString?: string;
  apiKey?: string;
  tables?: string[];
  isDefault?: boolean;
  apiUrl?: string;
  isActive?: boolean;
  type?: string;
  connection?: {
    host?: string;
    port?: string;
    database?: string;
    username?: string;
    password?: string;
    url?: string;
    apiKey?: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  participants: {
    userId?: string;
    agentIds: string[];
  };
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'google';
  apiKey: string;
  isDefault: boolean;
}

export interface AppConfig {
  models: ModelConfig[];
  databases: DatabaseConfig[];
}

// Google Authentication Types
export interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

export interface DecodedCredential {
  iss: string;
  nbf: number;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  azp: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
  jti: string;
}
