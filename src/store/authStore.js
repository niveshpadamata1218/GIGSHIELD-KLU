import { create } from 'zustand'
import API from '../api/client'

const storedUser = localStorage.getItem('user')
const storedRole = localStorage.getItem('role')
const storedToken = localStorage.getItem('token')

const initialUser = storedUser ? JSON.parse(storedUser) : null
const initialRole = storedRole || null
const initialToken = storedToken || null

const persistAuth = ({ token, user, role }) => {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('role', role)
}

const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('role')
}

export const useAuthStore = create((set) => ({
  user: initialUser,
  role: initialRole,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  requestWorkerLogin: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials)
      return { success: true, ...response.data }
    } catch (error) {
      return { success: false, message: 'Invalid credentials' }
    }
  },
  verifyWorkerOtp: async ({ phone, tempToken, otp }) => {
    try {
      const response = await API.post('/auth/verify-otp', { phone, tempToken, otp })
      const { token, user, role } = response.data
      persistAuth({ token, user, role })
      set({ user, role, token, isAuthenticated: true })
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Invalid OTP' }
    }
  },
  loginAdmin: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials)
      const { token, user, role } = response.data
      persistAuth({ token, user, role })
      set({ user, role, token, isAuthenticated: true })
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Invalid credentials' }
    }
  },
  registerWorker: async (payload) => {
    try {
      const response = await API.post('/auth/register', payload)
      const { token, user, role } = response.data
      persistAuth({ token, user, role })
      set({ user, role, token, isAuthenticated: true })
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Registration failed' }
    }
  },
  logout: () => {
    clearAuth()
    set({ user: null, role: null, token: null, isAuthenticated: false })
  }
}))
