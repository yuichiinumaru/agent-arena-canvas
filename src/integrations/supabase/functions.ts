// This file handles Supabase RPC functions and common database operations
import { supabase } from './client';
import { Conversation } from '@/types';

/**
 * Creates or updates a conversation in Supabase.
 */
export async function upsertConversation(
  conversation: Conversation,
  userId: string
): Promise<Conversation> {
  const { data, error } = await supabase
    .from<any>('conversations')
    .upsert(
      {
        id: conversation.id,
        user_id: userId,
        title: conversation.title,
        agent_ids: conversation.participants.agentIds,
        messages: conversation.messages,
        created_at: new Date(conversation.createdAt).toISOString(),
        updated_at: new Date(conversation.updatedAt).toISOString(),
      },
      { onConflict: 'id' }
    )
    .select('*');
  if (error) throw error;
  return conversation;
}

/**
 * Loads all conversations for a specific user.
 */
export async function loadUserConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from<any>('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    participants: { userId: row.user_id, agentIds: row.agent_ids },
    createdAt: new Date(row.created_at).getTime(),
    updatedAt: new Date(row.updated_at).getTime(),
    messages: row.messages,
  } as Conversation));
}

/**
 * Deletes a conversation by ID for a user.
 */
export async function deleteConversation(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from<any>('conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', userId);
  if (error) throw error;
  return true;
}
