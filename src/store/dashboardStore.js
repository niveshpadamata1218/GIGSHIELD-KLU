import { create } from 'zustand'
import API from '../api/client'
import { getUserLocation, classifyArea, calculateRiskScore } from '../utils/areaClassification'
import { generatePlansForUser } from '../utils/planConfig'
import { eventBus, EVENT_NAMES } from '../utils/eventBus'

export const useDashboardStore = create((set, get) => ({
  gigScore: 0,
  scoreComponents: { consistency: 0, movement: 0, patterns: 0 },
  scoreHistory: [],
  weeklyActivity: [],
  sessions: [],
  claims: [],
  policy: null,
  alerts: [],
  risk: null,
  totalPayouts: 0,
  currentSession: null,
  sessionActive: false,
  sessionStart: null,
  loading: false,
  error: null,
  
  // Plan management state
  activePlan: null,
  availablePlans: [],
  city: '',
  state: '',
  areaType: 'urban',
  riskScore: 0,
  locationLoading: false,
  planActivating: false,
  hydrate: async () => {
    set({ loading: true, error: null })
    try {
      const response = await API.get('/worker/dashboard')
      const data = response.data
      set({
        gigScore: data.gigScore,
        scoreComponents: data.scoreComponents,
        scoreHistory: data.scoreHistory,
        weeklyActivity: data.weeklyActivity,
        claims: data.claims,
        policy: data.policy,
        alerts: data.alerts,
        risk: data.risk,
        sessions: data.sessions,
        totalPayouts: data.totalPayouts,
        currentSession: data.activeSession,
        sessionActive: Boolean(data.activeSession),
        sessionStart: data.activeSession?.start ? new Date(data.activeSession.start) : null,
        loading: false,
        error: null
      })
    } catch (error) {
      // Load demo data when API fails (no backend)
      console.log('Loading demo dashboard data...')
      set({
        gigScore: 8.5,
        scoreComponents: { consistency: 85, movement: 80, patterns: 90 },
        scoreHistory: [
          { date: '2024-03-24', score: 8.2 },
          { date: '2024-03-25', score: 8.3 },
          { date: '2024-03-26', score: 8.4 },
          { date: '2024-03-27', score: 8.5 }
        ],
        weeklyActivity: [
          { day: 'Mon', hours: 6 },
          { day: 'Tue', hours: 7 },
          { day: 'Wed', hours: 5 },
          { day: 'Thu', hours: 8 },
          { day: 'Fri', hours: 9 },
          { day: 'Sat', hours: 7 },
          { day: 'Sun', hours: 4 }
        ],
        claims: [
          {
            id: 1,
            date: new Date('2024-03-27'),
            disruption: 'Heavy Rain',
            payout: 500,
            calculated: 500,
            status: 'paid'
          },
          {
            id: 2,
            date: new Date('2024-03-26'),
            disruption: 'High Traffic',
            payout: 250,
            calculated: 250,
            status: 'paid'
          },
          {
            id: 3,
            date: new Date('2024-03-25'),
            disruption: 'Network Issue',
            payout: 0,
            calculated: 300,
            status: 'pending'
          }
        ],
        policy: null,
        alerts: [
          { id: 1, type: 'warning', message: 'Weather alert: Heavy rain expected tomorrow' },
          { id: 2, type: 'info', message: 'New plan available in your area' }
        ],
        risk: { weather: 'Low', aqi: 'Moderate', alerts: 'Clear' },
        sessions: [
          {
            date: '2024-03-27',
            start: '09:00 AM',
            end: '01:30 PM',
            duration: '4h 30m',
            distance: 12.4,
            scoreImpact: 8
          },
          {
            date: '2024-03-26',
            start: '08:30 AM',
            end: '12:45 PM',
            duration: '4h 15m',
            distance: 11.2,
            scoreImpact: 7
          },
          {
            date: '2024-03-25',
            start: '10:00 AM',
            end: '03:00 PM',
            duration: '5h',
            distance: 15.6,
            scoreImpact: 9
          }
        ],
        totalPayouts: 750,
        currentSession: null,
        sessionActive: false,
        sessionStart: null,
        loading: false,
        error: null
      })
    }
  },
  fetchGigScore: async () => {
    const response = await API.get('/worker/gig-score')
    set({
      gigScore: response.data.gigScore,
      scoreComponents: response.data.scoreComponents,
      scoreHistory: response.data.scoreHistory
    })
  },
  startSession: async () => {
    if (get().sessionActive) {
      return { success: false, message: 'Session already active' }
    }
    try {
      const response = await API.post('/worker/session/start')
      const session = response.data.session
      set({
        sessionActive: true,
        sessionStart: new Date(session.start),
        currentSession: session
      })
      
      // Emit session start event
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      eventBus.emit(EVENT_NAMES.SESSION_STARTED, {
        workerId: user.phone || user.id,
        session: {
          id: `SEL-${Date.now()}`,
          startTime: session.start,
          status: 'active'
        }
      })
      
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Unable to start session' }
    }
  },
  endSession: async () => {
    if (!get().sessionActive) {
      return { success: false, message: 'No active session' }
    }
    try {
      const response = await API.post('/worker/session/end')
      const session = response.data.session
      set((state) => ({
        sessionActive: false,
        sessionStart: null,
        currentSession: null,
        sessions: [session, ...state.sessions]
      }))
      
      // Emit session end event with updated gig score
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      eventBus.emit(EVENT_NAMES.SESSION_ENDED, {
        workerId: user.phone || user.id,
        session: {
          id: `SEL-${Date.now()}`,
          endTime: new Date().toISOString(),
          status: 'completed'
        },
        gigScore: get().gigScore
      })
      
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Unable to end session' }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // PLAN MANAGEMENT METHODS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Detect user location and generate area-based plans
   */
  detectLocationAndGeneratePlans: async () => {
    set({ locationLoading: true })
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const preferredCity = user.city || ''
      const preferredState = user.state || ''

      // Prefer live geolocation, but resolve deterministically to user city if unavailable.
      const location = await getUserLocation({ preferredCity, preferredState })
      const detectedAreaType = classifyArea(location.city)

      const rawRiskScore = calculateRiskScore({
        weatherSeverity: Math.random() * 100,
        aqi: Math.random() * 500,
        zoneDensity: Math.random() * 100,
        gigActivity: Math.random() * 100
      })

      const areaRiskBias = {
        urban: 68,
        'semi-urban': 58,
        'semi-rural': 48,
        rural: 38
      }

      const riskScore = Math.round(
        (rawRiskScore + (areaRiskBias[detectedAreaType] || 55)) / 2
      )

      const generated = generatePlansForUser({
        city: location.city,
        riskScore
      })
      
      // Check localStorage for active plan
      const storedPlan = localStorage.getItem('activePlan')
      const activePlan = storedPlan ? JSON.parse(storedPlan) : null
      
      set({
        city: location.city,
        state: location.state,
        areaType: generated.areaType,
        riskScore,
        availablePlans: generated.plans,
        activePlan,
        locationLoading: false
      })
      
      return {
        success: true,
        city: location.city,
        areaType: generated.areaType,
        riskScore
      }
    } catch (error) {
      console.error('Error detecting location:', error)
      set({ locationLoading: false })
      return { success: false, message: 'Unable to detect location' }
    }
  },

  /**
   * Select and activate insurance plan
   */
  selectPlan: async (plan, paymentDetails = {}) => {
    set({ planActivating: true })
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const activePlan = {
        ...plan,
        activatedAt: new Date().toISOString(),
        nextRenewal: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
        status: 'active',
        payment: {
          amount: Number(paymentDetails.amount || plan.price),
          currency: paymentDetails.currency || 'INR',
          method: paymentDetails.method || 'upi',
          status: 'success',
          paidAt: paymentDetails.paidAt || new Date().toISOString()
        }
      }
      
      // Save to localStorage
      localStorage.setItem('activePlan', JSON.stringify(activePlan))
      
      // Get current user info
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const workerId = user.phone || user.id

      // Persist selected plan in user session and registered account record.
      if (user && (user.phone || user.id)) {
        const updatedUser = {
          ...user,
          plan: plan.name,
          activePlan,
          planActivated: true,
          city: user.city || get().city,
          areaType: get().areaType
        }
        localStorage.setItem('user', JSON.stringify(updatedUser))

        const accounts = JSON.parse(localStorage.getItem('registered_accounts') || '[]')
        const accountIndex = accounts.findIndex((acc) => acc.phone === updatedUser.phone)
        if (accountIndex !== -1) {
          accounts[accountIndex] = {
            ...accounts[accountIndex],
            plan: plan.name,
            activePlan,
            planActivated: true,
            city: updatedUser.city,
            areaType: get().areaType
          }
          localStorage.setItem('registered_accounts', JSON.stringify(accounts))
        }
      }
      
      set({
        activePlan,
        planActivating: false
      })
      
      // ═════════════════════════════════════════════════════════════
      // EMIT PLAN SELECTION EVENT FOR ADMIN SYNC
      // ═════════════════════════════════════════════════════════════
      eventBus.emit(EVENT_NAMES.PLAN_SELECTED, {
        workerId,
        plan: {
          name: plan.name,
          weeklyPremium: plan.price,
          coverage: plan.dailyCoverage,
          status: 'active',
          selectedAt: new Date().toISOString()
        },
        workerData: {
          name: user.name,
          phone: user.phone,
          city: get().city,
          areaType: get().areaType,
          riskScore: get().riskScore
        }
      })
      eventBus.emit(EVENT_NAMES.WORKER_UPDATED, {
        workerId,
        workerData: {
          name: user.name,
          phone: user.phone,
          city: get().city,
          areaType: get().areaType,
          plan: plan.name,
          planActivated: true,
          riskScore: get().riskScore
        }
      })
      
      return { success: true, activePlan }
    } catch (error) {
      console.error('Error selecting plan:', error)
      set({ planActivating: false })
      return { success: false, message: 'Failed to activate plan' }
    }
  },

  /**
   * Get formatted active plan for display
   */
  getActivePlanDisplay: () => {
    const activePlan = get().activePlan
    if (!activePlan) return null
    
    return {
      ...activePlan,
      displayPrice: `₹${activePlan.price}`,
      displayCoverage: `₹${activePlan.dailyCoverage}/day`,
      displayMonthly: `₹${Math.round(activePlan.price * 4.33)}`
    }
  },

  /**
   * Check if user has active plan
   */
  hasActivePlan: () => {
    return Boolean(get().activePlan)
  },

  /**
   * Reset plan selection
   */
  resetPlan: () => {
    localStorage.removeItem('activePlan')
    set({ activePlan: null })
  }
}))
