
import { GoogleGenerativeAI, GenerativeModel, CountTokensRequest } from '@google/generative-ai';

class GeminiService {
  private modelInstance: GenerativeModel | null = null;
  private apiKey: string = '';

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.modelInstance = null; // Reset the model instance when the API key changes
  }

  private getModel(modelName: string = 'gemini-pro'): GenerativeModel {
    if (!this.apiKey) {
      throw new Error('API key not set. Please configure your Google API key in Settings.');
    }

    if (!this.modelInstance) {
      const genAI = new GoogleGenerativeAI(this.apiKey);
      this.modelInstance = genAI.getGenerativeModel({ model: modelName });
    }

    return this.modelInstance;
  }

  async generateResponse(
    prompt: string, 
    systemInstruction: string = '',
    modelName: string = 'gemini-pro'
  ): Promise<string> {
    try {
      const model = this.getModel(modelName);
      
      const result = await model.generateContent({
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ],
      });

      return result.response.text();
    } catch (error) {
      console.error('Error generating response:', error);
      throw error;
    }
  }

  async countTokens(text: string): Promise<number> {
    try {
      if (!this.apiKey) {
        // If no API key is set, use a rough estimate
        return Math.ceil(text.length / 4);
      }

      const genAI = new GoogleGenerativeAI(this.apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const request: CountTokensRequest = {
        contents: [{ role: 'user', parts: [{ text }] }]
      };
      
      const result = await model.countTokens(request);
      return result.totalTokens;
    } catch (error) {
      console.error('Error counting tokens:', error);
      // Fallback to a rough estimate
      return Math.ceil(text.length / 4);
    }
  }
}

const geminiService = new GeminiService();
export default geminiService;
