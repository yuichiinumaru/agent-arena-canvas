
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Agent, KnowledgeItem, Tool } from '@/types';

// This service will handle interactions with Google's Generative AI models
export class GeminiService {
  private api: GoogleGenerativeAI | null = null;
  private _apiKey: string = '';

  constructor(apiKey?: string) {
    if (apiKey) {
      this.setApiKey(apiKey);
    }
  }

  setApiKey(apiKey: string) {
    this._apiKey = apiKey;
    this.api = new GoogleGenerativeAI(apiKey);
  }
  
  getApiKey(): string {
    return this._apiKey;
  }
  
  // Test connection with a provided API key without changing the current one
  async testConnection(apiKey: string): Promise<boolean> {
    try {
      const tempApi = new GoogleGenerativeAI(apiKey);
      const model = tempApi.getGenerativeModel({ model: "gemini-1.0-pro" });
      const result = await model.countTokens("This is a test message");
      return true;
    } catch (error) {
      console.error('Test connection failed:', error);
      throw error;
    }
  }

  // Create a system prompt for the agent based on its instructions and knowledge base
  private createAgentSystemPrompt(agent: Agent): string {
    const toolsDescription = agent.tools.length > 0 
      ? `\n\nYou have access to the following tools:\n${agent.tools.map(tool => 
          `- ${tool.name}: ${tool.description}\n  Parameters: ${tool.parameters.map(p => 
            `${p.name} (${p.type}${p.required ? ', required' : ''}): ${p.description}`
          ).join(', ')}`
        ).join('\n')}`
      : '';

    const knowledgeBaseDescription = agent.knowledgeBase.length > 0
      ? `\n\nYou have access to the following knowledge base:\n${agent.knowledgeBase.map(item => 
          `- ${item.name}`
        ).join('\n')}`
      : '';

    return `You are ${agent.name}. ${agent.description}
    
Instructions: ${agent.instructions}
${toolsDescription}
${knowledgeBaseDescription}

Respond in a conversational and helpful manner. If you're asked about something that's not in your knowledge, be honest about it. When answering, use markdown formatting where appropriate.`;
  }

  // Format the conversation history for the API
  private formatConversationHistory(messages: Array<{role: 'user' | 'agent' | 'system', name?: string, content: string}>) {
    return messages.map(message => ({
      role: message.role === 'agent' ? 'model' : message.role,
      parts: [{ text: message.content }],
    }));
  }

  // Get knowledge context from the agent's knowledge base
  private getKnowledgeContext(relevantItems: KnowledgeItem[]): string {
    return relevantItems.map(item => 
      `--- ${item.name} ---\n${item.content}\n---\n`
    ).join('\n');
  }

  // Main method to generate a response
  async generateResponse(
    agent: Agent, 
    messageContent: string, 
    conversationHistory: Array<{role: 'user' | 'agent' | 'system', name?: string, content: string}>,
    relevantKnowledge: KnowledgeItem[] = []
  ) {
    if (!this.api || !this._apiKey) {
      throw new Error('API key not set. Please set a valid Google Generative AI API key.');
    }

    try {
      const model = this.api.getGenerativeModel({ model: "gemini-2.5-pro-preview" });
      
      // Create the system prompt
      const systemPrompt = this.createAgentSystemPrompt(agent);
      
      // Add knowledge context if relevant
      const knowledgeContext = relevantKnowledge.length > 0 
        ? this.getKnowledgeContext(relevantKnowledge)
        : '';

      const finalMessageContent = knowledgeContext 
        ? `${messageContent}\n\nHere is some relevant information to help with your response:\n${knowledgeContext}`
        : messageContent;
      
      // Prepare the chat
      const chat = model.startChat({
        history: this.formatConversationHistory([
          { role: 'system', content: systemPrompt },
          ...conversationHistory
        ]),
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 64,
        },
      });

      // Get the response
      const result = await chat.sendMessage(finalMessageContent);
      const response = result.response;
      const text = response.text();
      
      return text;
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  // Method to count tokens in the instructions
  async countTokens(text: string): Promise<number> {
    if (!this.api || !this._apiKey) {
      return Math.round(text.length / 4); // Rough estimate if API not available
    }

    try {
      const model = this.api.getGenerativeModel({ model: "gemini-2.5-pro-preview" });
      const result = await model.countTokens(text);
      return result.totalTokens;
    } catch (error) {
      console.error('Error counting tokens:', error);
      return Math.round(text.length / 4); // Fallback to rough estimate
    }
  }
}

// Singleton instance
const geminiService = new GeminiService();
export default geminiService;
