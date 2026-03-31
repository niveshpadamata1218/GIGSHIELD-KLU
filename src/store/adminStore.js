import { create } from 'zustand'
import { eventBus, EVENT_NAMES } from '../utils/eventBus'

const ADMIN_CREDENTIALS = {
  phone: '9999999999',
  email: 'admin@gigshield.in',
  password: 'admin@shield2026',
  name: 'Admin',
  role: 'admin'
}

const DEFAULT_STATS = {
  totalWorkers: 0,
  activePolicies: 0,
  claimsThisWeek: 0,
  payoutsThisWeek: 0,
  fraudFlags: 0,
  systemStatus: 'operational'
}

const readJson = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const normalizePlan = (worker) => {
  if (worker?.plan && typeof worker.plan === 'object') {
    return worker.plan
  }

  if (worker?.activePlan && typeof worker.activePlan === 'object') {
    return {
      name: worker.activePlan.name,
      weeklyPremium: worker.activePlan.price,
      coverage: worker.activePlan.dailyCoverage,
      status: worker.activePlan.status || 'active'
    }
  }

  if (typeof worker?.plan === 'string' && worker.plan.trim()) {
    return {
      name: worker.plan,
      weeklyPremium: 0,
      coverage: 0,
      status: worker.planActivated ? 'active' : 'pending'
    }
  }

  return null
}

const toWorkerRecord = (account, existing = {}) => {
  const normalizedPlan = normalizePlan({ ...existing, ...account })
  const hasPlan = Boolean(normalizedPlan && normalizedPlan.name)

  return {
    id: account.phone || existing.id || `GS-WRK-${Date.now()}`,
    name: account.name || existing.name || 'Unknown Worker',
    phone: account.phone || existing.phone || '',
    city: account.city || existing.city || 'Unknown',
    state: account.state || existing.state || '',
    areaType: account.areaType || existing.areaType || 'urban',
    platform: account.platform || existing.platform || 'Unknown',
    partnerId: account.partnerId || existing.partnerId || '',
    plan: normalizedPlan,
    planActivated: account.planActivated ?? existing.planActivated ?? hasPlan,
    status: hasPlan || account.planActivated || existing.planActivated ? 'insured' : (existing.status || 'active'),
    gigScore: Number(existing.gigScore ?? account.gigScore ?? 0),
    riskScore: Number(existing.riskScore ?? account.fraudRiskScore ?? 0),
    totalEarningsProtected: Number(existing.totalEarningsProtected ?? 0),
    totalPayouts: Number(existing.totalPayouts ?? 0),
    claims: Array.isArray(existing.claims) ? existing.claims : [],
    sessions: Array.isArray(existing.sessions) ? existing.sessions : [],
    fraudFlags: Number(existing.fraudFlags ?? 0),
    joinDate: account.registeredOn || existing.joinDate || new Date().toISOString()
  }
}

const buildStats = (workers, claims, fraudAlerts) => {
  const now = Date.now()
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000

  const claimsThisWeek = claims.filter((claim) => {
    const ts = new Date(claim.timestamp || claim.date || 0).getTime()
    return ts >= weekAgo
  })

  const payoutsThisWeek = claimsThisWeek.reduce((sum, claim) => {
    const amount = Number(claim.amount ?? claim.payout ?? claim.calculated ?? 0)
    return sum + amount
  }, 0)

  const workerFraudFlags = workers.reduce((sum, worker) => sum + Number(worker.fraudFlags || 0), 0)

  return {
    totalWorkers: workers.length,
    activePolicies: workers.filter((worker) => Boolean(worker.plan && worker.plan.name)).length,
    claimsThisWeek: claimsThisWeek.length,
    payoutsThisWeek,
    fraudFlags: workerFraudFlags + fraudAlerts.length,
    systemStatus: 'operational'
  }
}

const buildSnapshotFromStorage = () => {
  const registeredAccounts = readJson('registered_accounts', [])
  const persistedWorkers = readJson('gig_workers', [])
  const claims = readJson('gig_claims', [])
  const disruptions = readJson('gig_disruptions', [])
  const fraudAlerts = readJson('gig_fraud_alerts', [])

  const workerByKey = new Map()

  persistedWorkers.forEach((worker) => {
    const key = worker.phone || worker.id
    if (!key) return
    workerByKey.set(key, {
      ...worker,
      claims: Array.isArray(worker.claims) ? worker.claims : [],
      sessions: Array.isArray(worker.sessions) ? worker.sessions : []
    })
  })

  registeredAccounts.forEach((account) => {
    const key = account.phone || account.id
    if (!key) return
    const existing = workerByKey.get(key) || {}
    workerByKey.set(key, toWorkerRecord(account, existing))
  })

  const workers = Array.from(workerByKey.values())

  writeJson('gig_workers', workers)

  const allUsers = workers.map((worker) => ({
    id: worker.id,
    phone: worker.phone,
    name: worker.name,
    city: worker.city,
    state: worker.state,
    areaType: worker.areaType,
    platform: worker.platform,
    partnerId: worker.partnerId,
    plan: worker.plan?.name || null,
    planActivated: Boolean(worker.planActivated),
    registeredOn: worker.joinDate,
    status: worker.status,
    fraudRiskScore: worker.riskScore
  }))

  const stats = buildStats(workers, claims, fraudAlerts)

  return {
    workers,
    allUsers,
    claims,
    disruptions,
    fraudAlerts,
    stats
  }
}

export const useAdminStore = create((set, get) => ({
  adminUser: null,
  isAdminLoggedIn: false,
  loading: false,
  stats: DEFAULT_STATS,
  allUsers: [],
  workers: [],
  claims: [],
  disruptions: [],
  fraudAlerts: [],
  syncListenersActive: false,
  simulationActive: false,
  simulationStep: 0,
  simulationData: null,

  hydrate: () => {
    set({ loading: true })
    try {
      const snapshot = buildSnapshotFromStorage()
      set({
        ...snapshot,
        loading: false
      })

      get().initializeSyncListeners()
      return snapshot
    } catch (error) {
      console.error('Error hydrating admin store:', error)
      set({ loading: false })
      return {
        workers: [],
        allUsers: [],
        claims: [],
        disruptions: [],
        fraudAlerts: [],
        stats: DEFAULT_STATS
      }
    }
  },

  adminLogin: async (credentials) => {
    try {
      const { phone, email, password } = credentials
      const isPhoneMatch = phone && phone === ADMIN_CREDENTIALS.phone
      const isEmailMatch = email && email === ADMIN_CREDENTIALS.email
      const isPasswordMatch = password === ADMIN_CREDENTIALS.password

      if (!(isPhoneMatch || isEmailMatch) || !isPasswordMatch) {
        return { success: false, message: 'Invalid admin credentials' }
      }

      const adminToken = `admin_${Date.now()}`
      const adminUser = {
        id: 'admin',
        phone: ADMIN_CREDENTIALS.phone,
        email: ADMIN_CREDENTIALS.email,
        name: ADMIN_CREDENTIALS.name,
        role: 'admin',
        token: adminToken
      }

      localStorage.setItem('admin_token', adminToken)
      localStorage.setItem('admin_user', JSON.stringify(adminUser))

      // Keep parity with protected route auth storage.
      localStorage.setItem('token', adminToken)
      localStorage.setItem('user', JSON.stringify(adminUser))
      localStorage.setItem('role', 'admin')

      set({ adminUser, isAdminLoggedIn: true })
      get().hydrate()
      return { success: true, message: 'Admin login successful' }
    } catch (error) {
      console.error('Admin login error:', error)
      return { success: false, message: 'Login failed' }
    }
  },

  adminLogout: () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')

    if (localStorage.getItem('role') === 'admin') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
    }

    set({ adminUser: null, isAdminLoggedIn: false })
  },

  getAllUsers: () => {
    const snapshot = get().hydrate()
    return snapshot.allUsers || []
  },

  getUserByPhone: (phone) => {
    return get().allUsers.find((user) => user.phone === phone) || null
  },

  addUser: (userData) => {
    try {
      const registeredAccounts = readJson('registered_accounts', [])
      if (registeredAccounts.some((account) => account.phone === userData.phone)) {
        return { success: false, message: 'User already exists' }
      }

      const newAccount = {
        ...userData,
        registeredOn: new Date().toISOString(),
        plan: null,
        planActivated: false,
        fraudRiskScore: 0
      }

      registeredAccounts.push(newAccount)
      writeJson('registered_accounts', registeredAccounts)
      get().addWorkerFromEvent({
        id: newAccount.phone,
        phone: newAccount.phone,
        name: newAccount.name,
        city: newAccount.city,
        areaType: newAccount.areaType || 'urban',
        platform: newAccount.platform,
        partnerId: newAccount.partnerId,
        status: 'active',
        riskScore: 0,
        gigScore: 0
      })

      return { success: true, message: 'User added successfully' }
    } catch (error) {
      console.error('Error adding user:', error)
      return { success: false, message: 'Failed to add user' }
    }
  },

  updateUser: (phone, userData) => {
    try {
      const registeredAccounts = readJson('registered_accounts', [])
      const index = registeredAccounts.findIndex((account) => account.phone === phone)
      if (index === -1) {
        return { success: false, message: 'User not found' }
      }

      registeredAccounts[index] = { ...registeredAccounts[index], ...userData }
      writeJson('registered_accounts', registeredAccounts)
      get().syncWorkerProfile(phone, userData)

      return { success: true, message: 'User updated successfully' }
    } catch (error) {
      console.error('Error updating user:', error)
      return { success: false, message: 'Failed to update user' }
    }
  },

  deleteUser: (phone) => {
    try {
      const registeredAccounts = readJson('registered_accounts', [])
      const workers = readJson('gig_workers', [])

      writeJson(
        'registered_accounts',
        registeredAccounts.filter((account) => account.phone !== phone)
      )
      writeJson(
        'gig_workers',
        workers.filter((worker) => worker.phone !== phone && worker.id !== phone)
      )

      get().hydrate()
      return { success: true, message: 'User deleted successfully' }
    } catch (error) {
      console.error('Error deleting user:', error)
      return { success: false, message: 'Failed to delete user' }
    }
  },

  toggleUserStatus: (phone) => {
    try {
      const registeredAccounts = readJson('registered_accounts', [])
      const index = registeredAccounts.findIndex((account) => account.phone === phone)
      if (index === -1) {
        return { success: false, message: 'User not found' }
      }

      registeredAccounts[index].isBlocked = !registeredAccounts[index].isBlocked
      writeJson('registered_accounts', registeredAccounts)
      get().syncWorkerProfile(phone, {
        status: registeredAccounts[index].isBlocked ? 'inactive' : 'active'
      })

      return { success: true, message: 'User status updated' }
    } catch (error) {
      console.error('Error updating user status:', error)
      return { success: false, message: 'Failed to update user status' }
    }
  },

  getAnalytics: () => {
    const { allUsers } = get().hydrate()
    const transactions = readJson('transactions', [])

    const totalUsers = allUsers.length
    const activeUsers = allUsers.filter((user) => user.planActivated).length
    const totalRevenue = transactions
      .filter((transaction) => transaction.type === 'plan_payment' && transaction.status === 'success')
      .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0)
    const fraudFlags = allUsers.filter((user) => Number(user.fraudRiskScore || 0) > 30).length

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      totalRevenue,
      fraudFlags,
      totalTransactions: transactions.length,
      successfulPayments: transactions.filter((transaction) => transaction.type === 'plan_payment' && transaction.status === 'success').length,
      failedPayments: transactions.filter((transaction) => transaction.type === 'plan_payment' && transaction.status === 'failed').length
    }
  },

  updateFraudScore: (phone, score) => {
    if (score < 0 || score > 100) {
      return { success: false, message: 'Fraud score must be between 0 and 100' }
    }

    try {
      const registeredAccounts = readJson('registered_accounts', [])
      const index = registeredAccounts.findIndex((account) => account.phone === phone)
      if (index === -1) {
        return { success: false, message: 'User not found' }
      }

      registeredAccounts[index].fraudRiskScore = score
      writeJson('registered_accounts', registeredAccounts)
      get().syncWorkerProfile(phone, { riskScore: score })

      return { success: true, message: 'Fraud score updated' }
    } catch (error) {
      console.error('Error updating fraud score:', error)
      return { success: false, message: 'Failed to update fraud score' }
    }
  },

  getAllTransactions: () => {
    return readJson('transactions', [])
  },

  initializeSyncListeners: () => {
    if (get().syncListenersActive) {
      return
    }

    eventBus.on(EVENT_NAMES.WORKER_REGISTERED, (worker) => {
      get().addWorkerFromEvent(worker)
    })

    eventBus.on(EVENT_NAMES.WORKER_UPDATED, (data) => {
      if (data?.workerId) {
        get().syncWorkerProfile(data.workerId, data.workerData || {})
      }
    })

    eventBus.on(EVENT_NAMES.WORKER_DATA_SYNC, (data) => {
      if (data?.workerId) {
        get().syncWorkerProfile(data.workerId, data.workerData || {})
      }
    })

    eventBus.on(EVENT_NAMES.PLAN_SELECTED, (data) => {
      if (data?.workerId) {
        get().updateWorkerPlan(data.workerId, data.plan || null)
      }
    })

    eventBus.on(EVENT_NAMES.SESSION_STARTED, (data) => {
      if (data?.workerId) {
        get().addSessionToWorker(data.workerId, data.session || {})
      }
    })

    eventBus.on(EVENT_NAMES.SESSION_ENDED, (data) => {
      if (data?.workerId) {
        get().updateWorkerGigScore(data.workerId, data.gigScore || 0)
      }
    })

    eventBus.on(EVENT_NAMES.CLAIM_TRIGGERED, (claim) => {
      get().handleClaimTrigger(claim || {})
    })

    eventBus.on(EVENT_NAMES.DISRUPTION_TRIGGERED, (disruption) => {
      get().addDisruption(disruption || {})
    })

    eventBus.on(EVENT_NAMES.FRAUD_ALERT, (alert) => {
      get().addFraudAlert(alert || {})
    })

    set({ syncListenersActive: true })
  },

  addWorkerFromEvent: (workerData) => {
    try {
      const workers = readJson('gig_workers', [])
      const key = workerData.phone || workerData.id
      const index = workers.findIndex((worker) => worker.phone === key || worker.id === key)

      if (index !== -1) {
        workers[index] = {
          ...workers[index],
          ...workerData,
          id: workers[index].id || key,
          phone: workers[index].phone || workerData.phone || key,
          status: workers[index].status || workerData.status || 'active'
        }
      } else {
        workers.push({
          id: key || `GS-WRK-${Date.now()}`,
          phone: workerData.phone || key || '',
          name: workerData.name || 'Unknown Worker',
          city: workerData.city || 'Unknown',
          state: workerData.state || '',
          areaType: workerData.areaType || 'urban',
          platform: workerData.platform || 'Unknown',
          partnerId: workerData.partnerId || '',
          plan: workerData.plan || null,
          gigScore: Number(workerData.gigScore || 0),
          riskScore: Number(workerData.riskScore || 0),
          totalEarningsProtected: 0,
          totalPayouts: 0,
          claims: [],
          sessions: [],
          fraudFlags: 0,
          status: workerData.status || 'active',
          joinDate: new Date().toISOString()
        })
      }

      writeJson('gig_workers', workers)

      if (workerData.phone) {
        const registeredAccounts = readJson('registered_accounts', [])
        const accountIndex = registeredAccounts.findIndex((account) => account.phone === workerData.phone)
        if (accountIndex === -1) {
          registeredAccounts.push({
            phone: workerData.phone,
            name: workerData.name || 'Unknown Worker',
            city: workerData.city || 'Unknown',
            state: workerData.state || '',
            areaType: workerData.areaType || 'urban',
            platform: workerData.platform || 'Unknown',
            partnerId: workerData.partnerId || '',
            plan: null,
            planActivated: false,
            registeredOn: new Date().toISOString()
          })
          writeJson('registered_accounts', registeredAccounts)
        }
      }

      get().hydrate()
    } catch (error) {
      console.error('Error adding worker from event:', error)
    }
  },

  syncWorkerProfile: (workerId, workerData) => {
    try {
      const workers = readJson('gig_workers', [])
      const index = workers.findIndex((worker) => worker.id === workerId || worker.phone === workerId)

      if (index !== -1) {
        workers[index] = {
          ...workers[index],
          ...workerData
        }
        writeJson('gig_workers', workers)
      }

      const registeredAccounts = readJson('registered_accounts', [])
      const accountIndex = registeredAccounts.findIndex((account) => account.phone === workerId)
      if (accountIndex !== -1) {
        registeredAccounts[accountIndex] = {
          ...registeredAccounts[accountIndex],
          ...workerData
        }
        writeJson('registered_accounts', registeredAccounts)
      }

      get().hydrate()
    } catch (error) {
      console.error('Error syncing worker profile:', error)
    }
  },

  updateWorkerPlan: (workerId, plan) => {
    try {
      const workers = readJson('gig_workers', [])
      const index = workers.findIndex((worker) => worker.id === workerId || worker.phone === workerId)

      if (index !== -1) {
        workers[index].plan = plan
        workers[index].status = 'insured'
        workers[index].planActivated = true
        writeJson('gig_workers', workers)
      }

      const targetPhone = workers[index]?.phone || workerId
      const registeredAccounts = readJson('registered_accounts', [])
      const accountIndex = registeredAccounts.findIndex((account) => account.phone === targetPhone)
      if (accountIndex !== -1) {
        registeredAccounts[accountIndex].plan = plan?.name || registeredAccounts[accountIndex].plan
        registeredAccounts[accountIndex].activePlan = plan || registeredAccounts[accountIndex].activePlan
        registeredAccounts[accountIndex].planActivated = true
        writeJson('registered_accounts', registeredAccounts)
      }

      get().hydrate()
    } catch (error) {
      console.error('Error updating worker plan:', error)
    }
  },

  addSessionToWorker: (workerId, session) => {
    try {
      const workers = readJson('gig_workers', [])
      const index = workers.findIndex((worker) => worker.id === workerId || worker.phone === workerId)
      if (index === -1) return

      if (!Array.isArray(workers[index].sessions)) {
        workers[index].sessions = []
      }
      workers[index].sessions.push(session)
      writeJson('gig_workers', workers)
      get().hydrate()
    } catch (error) {
      console.error('Error adding session:', error)
    }
  },

  updateWorkerGigScore: (workerId, gigScore) => {
    try {
      const workers = readJson('gig_workers', [])
      const index = workers.findIndex((worker) => worker.id === workerId || worker.phone === workerId)
      if (index === -1) return

      workers[index].gigScore = Number(gigScore || 0)
      writeJson('gig_workers', workers)
      get().hydrate()
    } catch (error) {
      console.error('Error updating gig score:', error)
    }
  },

  handleClaimTrigger: (claimData) => {
    try {
      const claims = readJson('gig_claims', [])
      const workers = readJson('gig_workers', [])

      const newClaim = {
        id: claimData.id || `CLM-${Date.now()}`,
        timestamp: claimData.timestamp || new Date().toISOString(),
        ...claimData
      }
      claims.push(newClaim)
      writeJson('gig_claims', claims)

      const workerIndex = workers.findIndex((worker) => worker.id === claimData.workerId || worker.phone === claimData.workerId)
      if (workerIndex !== -1) {
        workers[workerIndex].totalPayouts = Number(workers[workerIndex].totalPayouts || 0) + Number(claimData.amount || 0)
        if (!Array.isArray(workers[workerIndex].claims)) {
          workers[workerIndex].claims = []
        }
        workers[workerIndex].claims.push(newClaim)

        if (claimData.fraudRiskScore !== undefined) {
          workers[workerIndex].riskScore = Number(claimData.fraudRiskScore)
          if (Number(claimData.fraudRiskScore) > 60) {
            workers[workerIndex].fraudFlags = Number(workers[workerIndex].fraudFlags || 0) + 1
          }
        }

        writeJson('gig_workers', workers)
      }

      get().hydrate()
    } catch (error) {
      console.error('Error handling claim trigger:', error)
    }
  },

  addDisruption: (disruption) => {
    try {
      const disruptions = readJson('gig_disruptions', [])
      disruptions.push({
        id: disruption.id || `DISR-${Date.now()}`,
        timestamp: disruption.timestamp || new Date().toISOString(),
        ...disruption
      })
      writeJson('gig_disruptions', disruptions)
      get().hydrate()
    } catch (error) {
      console.error('Error adding disruption:', error)
    }
  },

  triggerDisruption: (type, zone, severity) => {
    const affectedWorkers = Math.max(12, Math.round((severity || 1) * 23 + Math.random() * 90))

    const disruption = {
      id: `DISR-${Date.now()}`,
      zone,
      type,
      severity,
      affectedWorkers,
      claimStatus: severity >= 7 ? 'High Priority' : 'In Progress',
      timestamp: new Date().toISOString()
    }

    get().addDisruption(disruption)
    set({
      simulationActive: true,
      simulationStep: 1,
      simulationData: disruption
    })

    return disruption
  },

  setSimulationStep: (step) => {
    set({ simulationStep: step })
  },

  resetSimulation: () => {
    set({
      simulationActive: false,
      simulationStep: 0,
      simulationData: null
    })
  },

  addFraudAlert: (alert) => {
    try {
      const fraudAlerts = readJson('gig_fraud_alerts', [])
      fraudAlerts.push({
        id: alert.id || `FRAUD-${Date.now()}`,
        timestamp: alert.timestamp || new Date().toISOString(),
        ...alert
      })
      writeJson('gig_fraud_alerts', fraudAlerts)
      get().hydrate()
    } catch (error) {
      console.error('Error adding fraud alert:', error)
    }
  },

  loadWorkers: () => {
    const snapshot = get().hydrate()
    return snapshot.workers || []
  },

  getWorkerMetrics: () => {
    const workers = get().workers
    const claims = get().claims
    const fraudAlerts = get().fraudAlerts

    return {
      totalWorkers: workers.length,
      activePolicies: workers.filter((worker) => Boolean(worker.plan && worker.plan.name)).length,
      claimsToday: claims.filter((claim) => {
        const claimDate = new Date(claim.timestamp || claim.date || 0)
        const today = new Date()
        return claimDate.toDateString() === today.toDateString()
      }).length,
      totalPayouts: workers.reduce((sum, worker) => sum + Number(worker.totalPayouts || 0), 0),
      fraudAlerts: fraudAlerts.length,
      highRiskWorkers: workers.filter((worker) => Number(worker.riskScore || 0) > 60).length
    }
  }
}))

export const ADMIN_DEFAULT_CREDENTIALS = ADMIN_CREDENTIALS
