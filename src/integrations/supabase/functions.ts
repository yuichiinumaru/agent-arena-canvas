
import { supabase } from './client';

/**
 * Creates the conversations table in Supabase if it doesn't exist
 */
export const createConversationsTable = async () => {
  try {
    // Since we can't directly query the information schema safely, 
    // we'll try an operation that would fail if the table doesn't exist
    const { data, error } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);
    
    if (error) {
      // Table likely doesn't exist, so create it via SQL
      const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        user_id UUID NOT NULL,
        agent_ids TEXT[] DEFAULT '{}',
        messages JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
      
      -- Add RLS policies
      ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
      
      -- Create policy for select
      CREATE POLICY "Users can view their own conversations" ON public.conversations
        FOR SELECT USING (auth.uid() = user_id);
        
      -- Create policy for insert
      CREATE POLICY "Users can insert their own conversations" ON public.conversations
        FOR INSERT WITH CHECK (auth.uid() = user_id);
        
      -- Create policy for update
      CREATE POLICY "Users can update their own conversations" ON public.conversations
        FOR UPDATE USING (auth.uid() = user_id);
        
      -- Create policy for delete
      CREATE POLICY "Users can delete their own conversations" ON public.conversations
        FOR DELETE USING (auth.uid() = user_id);
      `;
      
      // Execute the raw SQL directly
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (sqlError) {
        console.error('Error creating conversations table:', sqlError);
      }
    }
  } catch (error) {
    console.error('Error in createConversationsTable:', error);
  }
};

/**
 * Utility function to check if a table exists in the database
 * Note: This is a simplified version that doesn't rely on information_schema
 */
export const tableExists = async (tableName: string) => {
  try {
    // Try to select a single row from the table
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    // If there's no error, the table exists
    return !error;
  } catch (error) {
    console.error(`Error in tableExists for ${tableName}:`, error);
    return false;
  }
};
