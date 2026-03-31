import { create } from 'zustand'
import API from '../api/client'

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
        sessions: [],
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
      return { success: true }
    } catch (error) {
      return { success: false, message: 'Unable to end session' }
    }
  }
}))
