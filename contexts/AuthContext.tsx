import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { updateUserProfile } from '@/lib/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (phone: string, password: string) => Promise<void>;
  signUp: (phone: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const userEmail = session?.user?.email;
        console.log('Auth event:', event, userEmail ? userEmail : '(no user)');
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (phone: string, password: string) => {
    setIsLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      console.log('Attempting sign in with phone:', cleanPhone);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${cleanPhone}@bravonest.com`,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }
      
      console.log('Sign in successful:', data.user?.email);
    } catch (error) {
      console.error('Sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (phone: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      console.log('Attempting sign up with phone:', cleanPhone);
      
      const { data, error } = await supabase.auth.signUp({
        email: `${cleanPhone}@bravonest.com`,
        password,
        options: {
          data: {
            name,
            phone: cleanPhone,
          },
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }
      
      console.log('Sign up successful:', data.user?.email);
      
      // If user is created and confirmed, ensure profile exists
      if (data.user && data.user.email_confirmed_at) {
        try {
          await updateUserProfile({
            name,
            phone: cleanPhone,
          });
          console.log('User profile created successfully');
        } catch (profileError) {
          console.warn('Profile creation failed, but user was created:', profileError);
          // Don't throw here as the user was successfully created
        }
      }
      
      // If email confirmation is disabled, the user should be signed in immediately
      if (data.user && !data.user.email_confirmed_at) {
        console.log('User created but email not confirmed. Check Supabase settings.');
      }
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // The auth state will be updated by the onAuthStateChange listener
      // Navigation will be handled by individual components
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}