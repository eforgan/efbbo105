'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  loginAsGuest: () => {},
  logout: () => {}
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loginAsGuest = () => {
    const guestUser = { 
      uid: 'guest-123', 
      email: 'piloto@test.com', 
      displayName: 'Piloto Invitado' 
    } as User;
    setUser(guestUser);
    localStorage.setItem('demoUser', 'true');
  };

  const logout = () => {
    if (auth && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
      auth.signOut().catch(console.error);
    }
    setUser(null);
    localStorage.removeItem('demoUser');
  };

  useEffect(() => {
    // Check for demo user first
    if (typeof window !== 'undefined' && localStorage.getItem('demoUser')) {
      loginAsGuest();
      setLoading(false);
      return;
    }

    // If Firebase isn't configured, just stop loading
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !auth || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('DummyKey')) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
