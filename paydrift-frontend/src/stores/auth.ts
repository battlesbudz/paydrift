import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
  plan: 'free' | 'pro' | 'agency';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('paydrift_token', token);
        localStorage.setItem('paydrift_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('paydrift_token');
        localStorage.removeItem('paydrift_user');
        set({ user: null, token: null, isAuthenticated: false });
        window.location.href = '/';
      },
      updateUser: (data) =>
        set((state) => {
          const user = state.user ? { ...state.user, ...data } : null;
          if (user) localStorage.setItem('paydrift_user', JSON.stringify(user));
          return { user };
        }),
    }),
    {
      name: 'paydrift-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);