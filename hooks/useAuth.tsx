// hooks/useAuth.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { AuthService } from '../services/authService';
import { User, UserRole } from '../types/common';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole | null;
  isLoading: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const refreshUser = async () => {
    if (firebaseUser) {
      try {
        const userData = await AuthService.getCurrentUserData(firebaseUser.uid);
        setUser(userData);
      } catch (error) {
        console.error('Error refreshing user data:', error);
        throw error;
      }
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          setIsInitializing(true);
          const userData = await AuthService.getCurrentUserData(firebaseUser.uid);
          setUser(userData);
        } catch (error: any) {
          console.error('Error fetching user data:', error);
          setUser(null);
        } finally {
          setIsInitializing(false);
        }
      } else {
        setUser(null);
        setIsInitializing(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userData = await AuthService.login(email, password);
      setUser(userData);
    } catch (error) {
      console.error('Login error in useAuth:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setIsLoading(true);
      const userData = await AuthService.register(email, password, name, role);
      setUser(userData);
    } catch (error) {
      console.error('Registration error in useAuth:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Logout error in useAuth:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async () => {
    if (firebaseUser) {
      try {
        setIsLoading(true);
        const userData = await AuthService.getCurrentUserData(firebaseUser.uid);
        setUser(userData);
      } catch (error) {
        console.error('Error updating user data:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    }
  };

  const value = {
    user,
    firebaseUser,
    role: user?.role || null,
    isLoading,
    isInitializing,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};