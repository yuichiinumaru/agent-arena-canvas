
import { supabase } from './client';

/**
 * Creates the conversations table in Supabase if it doesn't exist
 */
export const createConversationsTable = async () => {
  try {
    // Check if table exists
    const { data, error } = await supabase
      .rpc('create_conversations_table')
      .select();
    
    if (error) {
      // Create the function if it doesn't exist
      const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION create_conversations_table()
      RETURNS void AS $$
      BEGIN
        -- Check if the table already exists
        IF NOT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'conversations'
        ) THEN
          -- Create the conversations table
          CREATE TABLE public.conversations (
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
        END IF;
      END;
      $$ LANGUAGE plpgsql;
      `;
      
      // Execute the SQL to create the function
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: createFunctionSQL
      });
      
      if (createError) {
        console.error('Error creating function:', createError);
        return;
      }
      
      // Now call the function to create the table
      const { error: callError } = await supabase.rpc('create_conversations_table');
      
      if (callError) {
        console.error('Error creating conversations table:', callError);
      }
    }
  } catch (error) {
    console.error('Error in createConversationsTable:', error);
  }
};

/**
 * Utility function to check if a table exists in the database
 */
export const tableExists = async (tableName: string) => {
  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .single();
    
    if (error) {
      console.error(`Error checking if table ${tableName} exists:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Error in tableExists for ${tableName}:`, error);
    return false;
  }
};
