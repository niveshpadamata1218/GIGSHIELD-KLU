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
      set({ loading: false, error: 'Unable to load dashboard data.' })
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
