import { create } from 'zustand'
import API from '../api/client'
import { demoAdminStats, demoFraudAlerts, demoWorkers } from '../data/demoData'

const initialSimulation = {
  type: 'Heavy rainfall',
  zone: 'Hyderabad Central',
  severity: 8
}

export const useAdminStore = create((set, get) => ({
  workers: demoWorkers,
  disruptions: [],
  claims: [],
  fraudAlerts: demoFraudAlerts,
  stats: demoAdminStats,
  simulationActive: false,
  simulationStep: 0,
  simulationData: initialSimulation,
  loading: false,
  hydrate: async () => {
    set({ loading: true })
    try {
      const [disruptionsRes, claimsRes] = await Promise.all([
        API.get('/admin/disruptions'),
        API.get('/admin/claims')
      ])
      set({
        disruptions: disruptionsRes.data.disruptions,
        claims: claimsRes.data.claims,
        loading: false
      })
    } catch (error) {
      set({ loading: false })
    }
  },
  triggerDisruption: async (type, zone, severity) => {
    set({
      simulationActive: true,
      simulationStep: 1,
      simulationData: { type, zone, severity }
    })

    try {
      const response = await API.post('/admin/trigger-disruption', {
        type,
        zone,
        severity
      })
      set((state) => ({ disruptions: [response.data.disruption, ...state.disruptions] }))
    } catch (error) {
      set({ simulationActive: false, simulationStep: 0 })
    }
  },
  setSimulationStep: (step) => set({ simulationStep: step }),
  resetSimulation: () =>
    set({ simulationActive: false, simulationStep: 0, simulationData: null }),
  approveClaim: (claimId) => claimId,
  rejectClaim: (claimId) => claimId
}))
