import axios from 'axios'
import {
  demoAdminStats,
  demoClaims,
  demoDisruptions,
  demoScoreHistory,
  demoSessions,
  demoWeeklyActivity,
  demoWorkers
} from '../data/demoData'

const API = axios.create({ baseURL: '/api' })

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('role')
      const path = window.location.hash || ''
      const nextHash = path.startsWith('#/admin') ? '#/admin/login' : '#/login'
      if (window.location.hash !== nextHash) {
        window.location.hash = nextHash
      }
    }
    return Promise.reject(error)
  }
)

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const parseBody = (data) => {
  if (!data) return {}
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch {
      return {}
    }
  }
  return data
}

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatTime = (date) => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const createToken = (role, id) => `${role}-token-${id}`
const getRoleFromToken = (token) => {
  if (!token) return null
  if (token.startsWith('admin-token')) return 'admin'
  if (token.startsWith('worker-token')) return 'worker'
  return null
}

const mockState = {
  workerAccounts: [
    {
      id: 'GS-WRK-001',
      phone: '9876543210',
      password: 'demo@123',
      name: 'Ravi Kumar',
      plan: 'Urban',
      city: 'Hyderabad'
    },
    {
      id: 'GS-WRK-002',
      phone: '9123456789',
      password: 'demo@123',
      name: 'Priya Singh',
      plan: 'Semi-Urban',
      city: 'Pune'
    }
  ],
  adminAccount: {
    id: 'GS-ADM-001',
    email: 'admin@gigshield.in',
    password: 'admin@shield2026',
    name: 'Admin'
  },
  policy: {
    plan: 'Urban',
    coverage: 600,
    premium: 40,
    validUntil: '2026-02-02'
  },
  gigScore: 78,
  scoreComponents: { consistency: 82, movement: 74, patterns: 79 },
  scoreHistory: demoScoreHistory,
  claims: demoClaims,
  disruptions: demoDisruptions,
  weeklyActivity: demoWeeklyActivity,
  sessions: demoSessions,
  alerts: [
    { date: '2026-01-21', type: 'AQI spike', severity: 'Medium', action: 'Claim triggered' },
    { date: '2026-01-18', type: 'Curfew', severity: 'High', action: 'Cleared' },
    { date: '2026-01-15', type: 'Heavy rainfall', severity: 'High', action: 'Claim triggered' }
  ],
  risk: {
    weather: 'Low',
    aqi: 'Moderate',
    alerts: 'Clear'
  },
  adminStats: demoAdminStats,
  activeSession: null
}

const respond = (config, status, data) =>
  Promise.resolve({ data, status, statusText: 'OK', headers: {}, config })

const unauthorized = (config) => respond(config, 401, { message: 'Unauthorized' })

const requireAuth = (config, role) => {
  const auth = config.headers?.Authorization
  if (!auth) return null
  const token = auth.replace('Bearer ', '')
  const tokenRole = getRoleFromToken(token)
  if (!tokenRole) return null
  if (role && tokenRole !== role) return null
  return tokenRole
}

const mockAdapter = async (config) => {
  await delay(350)
  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()
  const payload = parseBody(config.data)

  if (url === '/auth/login' && method === 'post') {
    if (payload.email) {
      const isValid =
        payload.email === mockState.adminAccount.email &&
        payload.password === mockState.adminAccount.password
      if (!isValid) {
        return respond(config, 401, { message: 'Invalid credentials' })
      }
      return respond(config, 200, {
        token: createToken('admin', mockState.adminAccount.id),
        user: { id: mockState.adminAccount.id, name: mockState.adminAccount.name },
        role: 'admin'
      })
    }

    const account = mockState.workerAccounts.find(
      (worker) => worker.phone === payload.phone && worker.password === payload.password
    )

    if (!account) {
      return respond(config, 401, { message: 'Invalid credentials' })
    }

    return respond(config, 200, {
      requiresOtp: true,
      tempToken: `temp-${account.phone}`,
      user: {
        id: account.id,
        name: account.name,
        phone: account.phone,
        city: account.city,
        plan: account.plan
      },
      role: 'worker'
    })
  }

  if (url === '/auth/verify-otp' && method === 'post') {
    const otp = payload.otp
    const phone = payload.phone || payload.tempToken?.replace('temp-', '')
    if (otp !== '123456' || !phone) {
      return respond(config, 400, { message: 'Invalid OTP' })
    }
    const account = mockState.workerAccounts.find((worker) => worker.phone === phone)
    if (!account) {
      return respond(config, 200, { verified: true })
    }
    return respond(config, 200, {
      token: createToken('worker', account.id),
      user: {
        id: account.id,
        name: account.name,
        phone: account.phone,
        city: account.city,
        plan: account.plan
      },
      role: 'worker'
    })
  }

  if (url === '/auth/register' && method === 'post') {
    const newId = `GS-WRK-${String(mockState.workerAccounts.length + 1).padStart(3, '0')}`
    const account = {
      id: newId,
      phone: payload.phone,
      password: payload.password,
      name: payload.fullName || payload.name,
      plan: payload.plan || 'Urban',
      city: payload.city || 'Hyderabad'
    }
    mockState.workerAccounts.push(account)
    return respond(config, 200, {
      token: createToken('worker', newId),
      user: {
        id: account.id,
        name: account.name,
        phone: account.phone,
        city: account.city,
        plan: account.plan
      },
      role: 'worker'
    })
  }

  if (url === '/worker/dashboard' && method === 'get') {
    if (!requireAuth(config, 'worker')) {
      return unauthorized(config)
    }
    const totalPayouts = mockState.claims.reduce(
      (sum, claim) => sum + (claim.payout || 0),
      0
    )
    return respond(config, 200, {
      policy: mockState.policy,
      gigScore: mockState.gigScore,
      scoreComponents: mockState.scoreComponents,
      scoreHistory: mockState.scoreHistory,
      weeklyActivity: mockState.weeklyActivity,
      claims: mockState.claims,
      alerts: mockState.alerts,
      sessions: mockState.sessions,
      risk: mockState.risk,
      totalPayouts,
      activeSession: mockState.activeSession
    })
  }

  if (url === '/worker/gig-score' && method === 'get') {
    if (!requireAuth(config, 'worker')) {
      return unauthorized(config)
    }
    return respond(config, 200, {
      gigScore: mockState.gigScore,
      scoreComponents: mockState.scoreComponents,
      scoreHistory: mockState.scoreHistory
    })
  }

  if (url === '/worker/claims' && method === 'get') {
    if (!requireAuth(config, 'worker')) {
      return unauthorized(config)
    }
    return respond(config, 200, { claims: mockState.claims })
  }

  if (url === '/worker/policy' && method === 'get') {
    if (!requireAuth(config, 'worker')) {
      return unauthorized(config)
    }
    return respond(config, 200, { policy: mockState.policy })
  }

  if (url === '/worker/sessions' && method === 'get') {
    if (!requireAuth(config, 'worker')) {
      return unauthorized(config)
    }
    return respond(config, 200, { sessions: mockState.sessions })
  }

  if (url === '/worker/session/start' && method === 'post') {
    if (!requireAuth(config, 'worker')) {
      return unauthorized(config)
    }
    if (mockState.activeSession) {
      return respond(config, 400, { message: 'Session already active' })
    }
    const now = new Date()
    mockState.activeSession = {
      start: now.toISOString(),
      zone: 'Hyderabad - Hitech City',
      distance: 12.4
    }
    return respond(config, 200, { session: mockState.activeSession })
  }

  if (url === '/worker/session/end' && method === 'post') {
    if (!requireAuth(config, 'worker')) {
      return unauthorized(config)
    }
    if (!mockState.activeSession) {
      return respond(config, 400, { message: 'No active session' })
    }
    const start = new Date(mockState.activeSession.start)
    const end = new Date()
    const durationSeconds = Math.max(0, Math.floor((end - start) / 1000))
    const durationHours = Math.max(0.1, durationSeconds / 3600)
    const session = {
      date: formatDate(end),
      start: formatTime(start),
      end: formatTime(end),
      duration: `${Math.floor(durationHours)}h ${Math.round((durationHours % 1) * 60)}m`,
      distance: mockState.activeSession.distance,
      scoreImpact: Number((durationHours / 3).toFixed(1))
    }
    mockState.sessions = [session, ...mockState.sessions]
    mockState.activeSession = null
    return respond(config, 200, { session })
  }

  if (url === '/admin/disruptions' && method === 'get') {
    if (!requireAuth(config, 'admin')) {
      return unauthorized(config)
    }
    return respond(config, 200, { disruptions: mockState.disruptions })
  }

  if (url === '/admin/claims' && method === 'get') {
    if (!requireAuth(config, 'admin')) {
      return unauthorized(config)
    }
    return respond(config, 200, { claims: mockState.claims })
  }

  if (url === '/admin/trigger-disruption' && method === 'post') {
    if (!requireAuth(config, 'admin')) {
      return unauthorized(config)
    }
    const disruption = {
      id: `DIS-${String(mockState.disruptions.length + 1).padStart(3, '0')}`,
      type: payload.type,
      zone: payload.zone,
      severity: payload.severity,
      affectedWorkers: 234,
      claimStatus: 'processing',
      triggeredAt: new Date().toISOString(),
      reading: payload.reading || '28.4 mm/hr'
    }
    mockState.disruptions = [disruption, ...mockState.disruptions]
    return respond(config, 200, { disruption })
  }

  return respond(config, 404, { message: 'Not found' })
}

API.defaults.adapter = mockAdapter

export default API
