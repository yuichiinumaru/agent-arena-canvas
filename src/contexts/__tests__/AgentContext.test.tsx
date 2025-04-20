import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AgentProvider, useAgent } from '../AgentContext';
import { describe, it, expect, beforeEach } from 'vitest';

describe('AgentContext Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should manage agents correctly', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AgentProvider>{children}</AgentProvider>
    );
    const { result } = renderHook(() => useAgent(), { wrapper });

    // initial state
    expect(result.current.agents).toEqual([]);
    expect(result.current.activeAgent).toBeNull();

    const dummyAgent = {
      name: 'Agent1',
      avatar: 'avatar.png',
      model: 'gpt-4',
      description: 'desc',
      instructions: 'instr',
      instructionTokenCount: 0,
      isActive: true,
      knowledgeBase: [],
      tools: [],
    };

    // create agent
    act(() => result.current.createAgent(dummyAgent));
    expect(result.current.agents).toHaveLength(1);
    const created = result.current.agents[0];
    expect(created).toMatchObject({
      name: dummyAgent.name,
      avatar: dummyAgent.avatar,
      model: dummyAgent.model,
    });

    // update agent
    act(() => result.current.updateAgent(created.id, { name: 'UpdatedName' }));
    expect(result.current.agents[0].name).toBe('UpdatedName');

    // delete agent
    act(() => result.current.deleteAgent(created.id));
    expect(result.current.agents).toEqual([]);
  });
});
