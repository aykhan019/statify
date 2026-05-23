'use client';

import type { AuthUser } from '@statify/shared';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

interface CurrentUserContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

interface CurrentUserProviderProps {
  children: ReactNode;
  initialUser: AuthUser | null;
}

const CurrentUserContext = createContext<CurrentUserContextValue | undefined>(undefined);

export function CurrentUserProvider({ children, initialUser }: CurrentUserProviderProps) {
  const value = useMemo<CurrentUserContextValue>(
    () => ({
      user: initialUser,
      isAuthenticated: initialUser !== null,
    }),
    [initialUser],
  );

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser(): CurrentUserContextValue {
  const value = useContext(CurrentUserContext);

  if (value === undefined) {
    throw new Error('useCurrentUser must be used within CurrentUserProvider');
  }

  return value;
}
