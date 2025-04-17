
// This file handles Supabase RPC functions and common database operations
import { supabase } from './client';
import { Conversation } from '@/types';

/**
 * Creates a new conversation or updates an existing one.
 */
export async function upsertConversation(conversation: Conversation, userId: string) {
  try {
    // Since we don't have an RPC function yet, we'll use the CRUD operations
    const { data, error } = await supabase
      .from('conversations') // Note: This table doesn't exist yet, we need to create it
      .upsert({
        id: conversation.id,
        title: conversation.title,
        user_id: userId,
        agent_ids: conversation.participants.agentIds,
        messages: conversation.messages,
        created_at: new Date(conversation.createdAt).toISOString(),
        updated_at: new Date(conversation.updatedAt).toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error upserting conversation:', error);
    throw error;
  }
}

/**
 * Loads conversations for a specific user.
 */
export async function loadUserConversations(userId: string) {
  try {
    // This will need to be updated once we create the conversations table
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error loading user conversations:', error);
    throw error;
  }
}

/**
 * Deletes a conversation by ID.
 */
export async function deleteConversation(conversationId: string, userId: string) {
  try {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}
