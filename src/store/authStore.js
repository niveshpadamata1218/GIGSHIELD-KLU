import { create } from 'zustand'
import API from '../api/client'
import { eventBus, EVENT_NAMES } from '../utils/eventBus'

const storedUser = localStorage.getItem('user')
const storedRole = localStorage.getItem('role')
const storedToken = localStorage.getItem('token')

let initialUser = null
try {
  initialUser = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null
} catch (e) {
  console.error('Error parsing stored user:', e)
  initialUser = null
  localStorage.removeItem('user')
}

const initialRole = storedRole && storedRole !== 'undefined' ? storedRole : null
const initialToken = storedToken && storedToken !== 'undefined' ? storedToken : null

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

/* ─── Get registered accounts from localStorage ─── */
const getRegisteredAccounts = () => {
  try {
    const stored = localStorage.getItem('registered_accounts')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/* ─── Get account by phone ─── */
const getAccountByPhone = (phone) => {
  const accounts = getRegisteredAccounts()
  return accounts.find((acc) => acc.phone === phone)
}

/* ─── Save registered accounts to localStorage ─── */
const saveRegisteredAccount = (account) => {
  const accounts = getRegisteredAccounts()
  // Don't add duplicate phones
  if (!accounts.find((acc) => acc.phone === account.phone)) {
    accounts.push(account)
    localStorage.setItem('registered_accounts', JSON.stringify(accounts))
  }
}

/* ─── Update account (for plan activation) ─── */
const updateRegisteredAccount = (phone, updates) => {
  const accounts = getRegisteredAccounts()
  const idx = accounts.findIndex((acc) => acc.phone === phone)
  if (idx !== -1) {
    accounts[idx] = { ...accounts[idx], ...updates }
    localStorage.setItem('registered_accounts', JSON.stringify(accounts))
    return accounts[idx]
  }
  return null
}

const normalizeAreaType = (cityTier) => {
  const tier = (cityTier || '').toLowerCase()
  if (tier === 'urban') return 'urban'
  if (tier === 'semi-urban') return 'semi-urban'
  if (tier === 'semi-rural') return 'semi-rural'
  return 'rural'
}

/* ─── Test Credentials (for development) ─── */
const ADMIN_ACCOUNTS = [
  { email: 'admin@gigshield.in', password: 'admin@shield2026', name: 'Admin User' },
  { email: 'test@admin.com', password: 'test123', name: 'Test Admin' }
]

const WORKER_ACCOUNTS = [
  { phone: '9876543210', password: 'demo@123', name: 'Akshith Kumar' },
  { phone: '9123456789', password: 'test123', name: 'Test Worker' }
]

const VALID_OTPS = ['123456', '000000', '111111'] // Test OTPs

export const useAuthStore = create((set) => ({
  user: initialUser,
  role: initialRole,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),

  requestWorkerLogin: async (credentials) => {
    try {
      const { phone, password } = credentials
      
      if (!phone || !password) {
        return { success: false, message: 'Phone and password are required' }
      }

      // Check registered accounts first
      const registeredAccount = getAccountByPhone(phone)
      if (registeredAccount) {
        if (registeredAccount.password === password) {
          const tempToken = `temp_${Date.now()}`
          console.log('Registered account found, sending OTP...')
          return {
            success: true,
            tempToken,
            phone,
            message: 'OTP sent to your phone. Use: 123456, 000000, or 111111'
          }
        } else {
          // Phone exists but password is wrong
          return {
            success: false,
            message: 'Incorrect password. Please check and try again.'
          }
        }
      }

      // Test with mock data
      const account = WORKER_ACCOUNTS.find(
        (acc) => acc.phone === phone && acc.password === password
      )

      if (account) {
        const tempToken = `temp_${Date.now()}`
        return {
          success: true,
          tempToken,
          phone,
          message: 'OTP sent to your phone. Use: 123456, 000000, or 111111'
        }
      }

      // Check if phone exists in mock data but password is wrong
      const existingAccount = WORKER_ACCOUNTS.find((acc) => acc.phone === phone)
      if (existingAccount) {
        return {
          success: false,
          message: 'Incorrect password. Please check and try again.'
        }
      }

      // Try API if available
      try {
        const response = await API.post('/auth/login', credentials)
        return { success: true, ...response.data }
      } catch (apiError) {
        return {
          success: false,
          message: 'Phone number not registered. Please check or register first.'
        }
      }
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' }
    }
  },

  verifyWorkerOtp: async ({ phone, tempToken, otp }) => {
    try {
      if (!otp || otp.length !== 6) {
        return { success: false, message: 'Invalid OTP format' }
      }

      if (VALID_OTPS.includes(otp) && tempToken) {
        // Check registered accounts first
        let registeredAccount = getAccountByPhone(phone)
        
        // If not registered, check test accounts
        if (!registeredAccount) {
          registeredAccount = WORKER_ACCOUNTS.find((acc) => acc.phone === phone)
        }

        if (registeredAccount) {
          const user = {
            id: `worker_${Date.now()}`,
            name: registeredAccount.name,
            phone,
            email: registeredAccount.email || '',
            city: registeredAccount.city || '',
            dob: registeredAccount.dob || '',
            platform: registeredAccount.platform || 'Zomato',
            partnerId: registeredAccount.partnerId || '',
            experience: registeredAccount.experience || '',
            plan: registeredAccount.plan ?? null,
            activePlan: registeredAccount.activePlan ?? null,
            planActivated: registeredAccount.planActivated || false,
            role: 'worker'
          }
          const token = `bearer_${Date.now()}_${Math.random()}`
          persistAuth({ token, user, role: 'worker' })
          set({ user, role: 'worker', token, isAuthenticated: true })
          eventBus.emit(EVENT_NAMES.WORKER_LOGGED_IN, {
            workerId: user.phone || user.id,
            workerData: user
          })
          console.log('Logged in user:', user)
          return { success: true }
        }
      }

      // Try API if available
      try {
        const response = await API.post('/auth/verify-otp', { phone, tempToken, otp })
        const { token, user, role } = response.data
        persistAuth({ token, user, role })
        set({ user, role, token, isAuthenticated: true })
        return { success: true }
      } catch (apiError) {
        return { success: false, message: 'Invalid OTP. Try: 123456, 000000, or 111111' }
      }
    } catch (error) {
      return { success: false, message: 'OTP verification failed' }
    }
  },

  loginAdmin: async (credentials) => {
    try {
      const { email, password } = credentials

      if (!email || !password) {
        return { success: false, message: 'Email and password are required' }
      }

      // Check registered accounts first
      const registeredAccounts = getRegisteredAccounts()
      const registeredAccount = registeredAccounts.find(
        (acc) => acc.email === email && acc.password === password
      )

      if (registeredAccount) {
        const user = {
          id: `admin_${Date.now()}`,
          name: registeredAccount.name,
          email,
          role: 'admin'
        }
        const token = `bearer_${Date.now()}_${Math.random()}`
        persistAuth({ token, user, role: 'admin' })
        set({ user, role: 'admin', token, isAuthenticated: true })
        return { success: true }
      }

      // Test with mock data
      const account = ADMIN_ACCOUNTS.find(
        (acc) => acc.email === email && acc.password === password
      )

      if (account) {
        const user = {
          id: `admin_${Date.now()}`,
          name: account.name,
          email,
          role: 'admin'
        }
        const token = `bearer_${Date.now()}_${Math.random()}`
        persistAuth({ token, user, role: 'admin' })
        set({ user, role: 'admin', token, isAuthenticated: true })
        return { success: true }
      }

      // Try API if available
      try {
        const response = await API.post('/auth/login', credentials)
        const { token, user, role } = response.data
        persistAuth({ token, user, role })
        set({ user, role, token, isAuthenticated: true })
        return { success: true }
      } catch (apiError) {
        return {
          success: false,
          message: 'Invalid credentials. Test: admin@gigshield.in / admin@shield2026'
        }
      }
    } catch (error) {
      return { success: false, message: 'Admin login failed' }
    }
  },

  registerWorker: async (payload) => {
    try {
      console.log('registerWorker called with payload:', payload)
      
      // Basic client-side validation
      const { fullName, phone, password } = payload
      const normalizedName = String(fullName || '').trim()
      const normalizedPhone = String(phone || '').trim()

      if (!normalizedName || !normalizedPhone || !password) {
        console.log('Missing fields')
        return { success: false, message: 'All fields are required' }
      }

      if (normalizedName.length < 3) {
        return { success: false, message: 'Name must be at least 3 characters' }
      }

      if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
        return { success: false, message: 'Enter a valid 10-digit Indian mobile number' }
      }

      if (password.length < 6) {
        console.log('Password too short')
        return { success: false, message: 'Password must be at least 6 characters' }
      }

      // Check if phone already registered
      const registeredAccounts = getRegisteredAccounts()
      if (registeredAccounts.find((acc) => acc.phone === normalizedPhone)) {
        console.log('Phone already registered')
        return { success: false, message: 'Phone number already registered' }
      }

      // Try API if available
      try {
        console.log('Trying to register via API...')
        await API.post('/auth/register', payload)

        console.log('API registration successful')
      } catch (apiError) {
        console.log('API registration failed, using mock registration:', apiError.message)
      }

      const newAccount = {
        phone: normalizedPhone,
        password,
        name: normalizedName,
        city: payload.city || '',
        cityTier: payload.cityTier || '',
        areaType: normalizeAreaType(payload.cityTier),
        platform: payload.platform || 'Zomato',
        partnerId: payload.partnerId || '',
        experience: payload.experience || '',
        plan: null,
        activePlan: null,
        planActivated: false,
        registeredOn: new Date().toISOString()
      }

      saveRegisteredAccount(newAccount)

      const workerSyncData = {
        id: normalizedPhone,
        name: normalizedName,
        phone: normalizedPhone,
        city: newAccount.city,
        areaType: newAccount.areaType,
        platform: newAccount.platform,
        partnerId: newAccount.partnerId,
        plan: null,
        status: 'active',
        riskScore: 0,
        gigScore: 0
      }

      eventBus.emit(EVENT_NAMES.WORKER_REGISTERED, workerSyncData)
      eventBus.emit(EVENT_NAMES.WORKER_UPDATED, {
        workerId: workerSyncData.phone,
        workerData: workerSyncData
      })

      // Registration should not auto-login. User will login from /login.
      clearAuth()
      set({ user: null, role: null, token: null, isAuthenticated: false })

      return { success: true, message: 'Account created successfully. Please login to continue.' }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, message: error.message || 'Registration failed' }
    }
  },

  logout: () => {
    clearAuth()
    set({ user: null, role: null, token: null, isAuthenticated: false })
  },

  updateUserPlan: async (newPlan) => {
    try {
      // Get current user
      const user = localStorage.getItem('user')
      if (!user) {
        return { success: false, message: 'No user found' }
      }

      const currentUser = JSON.parse(user)
      
      // Update in registered accounts
      const updated = updateRegisteredAccount(currentUser.phone, { plan: newPlan })
      if (!updated) {
        return { success: false, message: 'Failed to update plan' }
      }

      // Update in current session
      const updatedUser = { ...currentUser, plan: newPlan }
      persistAuth({ 
        token: currentUser.token || localStorage.getItem('token'),
        user: updatedUser,
        role: currentUser.role || localStorage.getItem('role')
      })
      set({ user: updatedUser })
      
      return { success: true, message: 'Plan updated successfully' }
    } catch (error) {
      console.error('Plan update error:', error)
      return { success: false, message: 'Failed to update plan' }
    }
  },

  activateUserPlan: async () => {
    try {
      // Get current user
      const user = localStorage.getItem('user')
      if (!user) {
        return { success: false, message: 'No user found' }
      }

      const currentUser = JSON.parse(user)
      const activationDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
      
      // Update in registered accounts
      const updated = updateRegisteredAccount(currentUser.phone, { 
        planActivated: true,
        planActivationDate: activationDate
      })
      if (!updated) {
        return { success: false, message: 'Failed to activate plan' }
      }

      // Record transaction
      const amount = currentUser.plan === 'Urban Plan' ? 200 : 300
      useAuthStore.getState().recordTransaction({
        phone: currentUser.phone,
        type: 'plan_payment',
        amount: amount,
        plan: currentUser.plan,
        date: new Date().toISOString(),
        status: 'success',
        description: `${currentUser.plan} Activation Payment`
      })

      // Update in current session
      const updatedUser = { 
        ...currentUser, 
        planActivated: true,
        planActivationDate: activationDate 
      }
      persistAuth({ 
        token: currentUser.token || localStorage.getItem('token'),
        user: updatedUser,
        role: currentUser.role || localStorage.getItem('role')
      })
      set({ user: updatedUser })
      
      return { success: true, message: 'Plan activated successfully' }
    } catch (error) {
      console.error('Plan activation error:', error)
      return { success: false, message: 'Failed to activate plan' }
    }
  },

  updateUserProfile: async (profileData) => {
    try {
      const user = localStorage.getItem('user')
      if (!user) {
        return { success: false, message: 'No user found' }
      }

      const currentUser = JSON.parse(user)
      const updatedUser = {
        ...currentUser,
        name: profileData.name || currentUser.name,
        email: profileData.email || currentUser.email,
        city: profileData.city || currentUser.city,
        state: profileData.state || currentUser.state,
        profilePicture: profileData.profilePicture || currentUser.profilePicture
      }

      // Update in registered accounts
      updateRegisteredAccount(currentUser.phone, updatedUser)

      // Persist and update session
      persistAuth({
        token: currentUser.token || localStorage.getItem('token'),
        user: updatedUser,
        role: currentUser.role || localStorage.getItem('role')
      })
      set({ user: updatedUser })

      eventBus.emit(EVENT_NAMES.WORKER_DATA_SYNC, {
        workerId: updatedUser.phone || updatedUser.id,
        workerData: {
          name: updatedUser.name,
          phone: updatedUser.phone,
          city: updatedUser.city,
          state: updatedUser.state
        }
      })
      eventBus.emit(EVENT_NAMES.WORKER_UPDATED, {
        workerId: updatedUser.phone || updatedUser.id,
        workerData: updatedUser
      })

      return { success: true, message: 'Profile updated successfully' }
    } catch (error) {
      console.error('Profile update error:', error)
      return { success: false, message: 'Failed to update profile' }
    }
  },

  recordTransaction: (transaction) => {
    try {
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]')
      transactions.push({
        id: `txn_${Date.now()}`,
        ...transaction
      })
      localStorage.setItem('transactions', JSON.stringify(transactions))
    } catch (error) {
      console.error('Error recording transaction:', error)
    }
  },

  getTransactions: (phone) => {
    try {
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]')
      return transactions.filter(txn => txn.phone === phone)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
  }
}))


