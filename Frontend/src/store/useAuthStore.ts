import { create } from 'zustand'
import { useFinanceStore } from './useFinanceStore'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: "user-1",
    name: "Alex Designer",
    email: "alex@example.com",
  }, 
  token: "mock-jwt-token",
  isAuthenticated: true,
  login: (token, user) => set({ token, user, isAuthenticated: true }),
  logout: () => {
    useFinanceStore.getState().clearData()
    set({ token: null, user: null, isAuthenticated: false })
  },
  updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null }))
}))
