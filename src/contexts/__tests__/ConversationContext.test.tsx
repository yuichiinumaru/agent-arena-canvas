import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock supabase functions
vi.mock('@/integrations/supabase/functions', () => ({
  loadUserConversations: vi.fn(async () => []),
  upsertConversation: vi.fn(async () => {}),
}));
// Mock toast to suppress notifications
vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));
// Mock AuthContext to provide a user
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { id: 'user-1', name: 'Test', email: '', avatar: '' } }) }));

import { ConversationProvider, useConversation } from '../ConversationContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ConversationProvider>{children}</ConversationProvider>
);

describe('ConversationContext Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a new conversation', () => {
    const { result } = renderHook(() => useConversation(), { wrapper });
    act(() => result.current.createNewConversation());
    expect(result.current.conversations).toHaveLength(1);
    const conv = result.current.conversations[0];
    expect(conv.id).toBeDefined();
    expect(conv.messages).toEqual([]);
    expect(result.current.currentConversationId).toEqual(conv.id);
  });

  it('adds, updates, and deletes a message', () => {
    const { result } = renderHook(() => useConversation(), { wrapper });
    act(() => result.current.createNewConversation());
    const convId = result.current.currentConversationId!;

    act(() => {
      result.current.addMessageToConversation(convId, {
        conversationId: convId,
        content: 'hello',
        sender: { id: 'u1', name: 'User', type: 'user' },
        mentions: [],
        assignedTo: [],
        timestamp: Date.now(),
        isTask: false,
      });
    });
    expect(result.current.conversations[0].messages).toHaveLength(1);
    const msg = result.current.conversations[0].messages[0];
    expect(msg.content).toBe('hello');

    act(() => result.current.updateMessageInConversation(convId, msg.id, { content: 'world' }));
    expect(result.current.conversations[0].messages[0].content).toBe('world');

    act(() => result.current.deleteMessageInConversation(convId, msg.id));
    expect(result.current.conversations[0].messages).toHaveLength(0);
  });
});
