import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

// Mock authentication functions - replace with actual Firebase implementation
const mockAuth = {
  signIn: async (email: string, password: string): Promise<User> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === 'test@example.com' && password === 'password') {
      return {
        id: '1',
        email: 'test@example.com',
        displayName: 'Test User',
        photoURL: null,
      };
    }

    throw new Error('Invalid email or password');
  },

  signUp: async (email: string, password: string, displayName: string): Promise<User> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if email already exists (mock check)
    if (email === 'test@example.com') {
      throw new Error('Email already in use');
    }

    return {
      id: Date.now().toString(),
      email,
      displayName,
      photoURL: null,
    };
  },

  signOut: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      signIn: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const user = await mockAuth.signIn(email, password);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to sign in',
          });
          throw error;
        }
      },

      signUp: async (email: string, password: string, displayName: string) => {
        set({ isLoading: true, error: null });

        try {
          const user = await mockAuth.signUp(email, password, displayName);
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to sign up',
          });
          throw error;
        }
      },

      signOut: async () => {
        set({ isLoading: true });

        try {
          await mockAuth.signOut();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to sign out',
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
