/**
 * The signed-in state shared by every screen: `status` (loading while the saved token is read), and
 * `signIn` / `signUp` / `signOut`. The token is kept in storage so a reload stays signed in, and handed to the
 * API client once; a 401 on a request that carried it (expired session) signs the user out.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken, setUnauthorizedHandler } from '../../api/client';
import * as authApi from './api';
import type { AuthStatus } from './guard';
import type { Credentials, Session } from './types';

const TOKEN_KEY = 'auth.token';

type Auth = {
  status: AuthStatus;
  signIn: (credentials: Credentials) => Promise<void>;
  signUp: (credentials: Credentials) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');

  const signOut = useCallback(() => {
    setAuthToken(null);
    setStatus('signedOut');
    AsyncStorage.removeItem(TOKEN_KEY).catch(() => undefined);
  }, []);

  const start = useCallback((session: Session) => {
    setAuthToken(session.access);
    setStatus('signedIn');
    AsyncStorage.setItem(TOKEN_KEY, session.access).catch(() => undefined);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(signOut);
    AsyncStorage.getItem(TOKEN_KEY)
      .then((saved) => {
        setAuthToken(saved);
        setStatus(saved ? 'signedIn' : 'signedOut');
      })
      .catch(() => setStatus('signedOut'));
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  const signIn = useCallback(async (credentials: Credentials) => start(await authApi.login(credentials)), [start]);
  const signUp = useCallback(async (credentials: Credentials) => start(await authApi.register(credentials)), [start]);

  const value = useMemo(() => ({ status, signIn, signUp, signOut }), [status, signIn, signUp, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
