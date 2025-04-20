import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { describe, it, expect, beforeEach } from 'vitest';

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('logs in and stores user in localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    act(() => result.current.login({ id: 'test', name: 'Test User' }));
    expect(result.current.user).toMatchObject({ id: 'test', name: 'Test User' });
    expect(localStorage.getItem('user')).not.toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('logs out and clears localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    act(() => result.current.login({ id: 'x', name: 'X' }));
    act(() => result.current.logout());
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
