export const demoWorkers = [
  {
    id: 'GS-WRK-001',
    name: 'Ravi Kumar',
    phone: '9876543210',
    platform: 'Zomato',
    partnerId: 'ZMT98765432',
    plan: 'Urban',
    gigScore: 78,
    city: 'Hyderabad',
    zone: 'Hitech City',
    status: 'active',
    joinDate: '2025-11-01',
    scoreComponents: { consistency: 82, movement: 74, patterns: 79 }
  },
  {
    id: 'GS-WRK-002',
    name: 'Priya Singh',
    phone: '9123456789',
    platform: 'Swiggy',
    partnerId: 'SWG91234567',
    plan: 'Semi-Urban',
    gigScore: 65,
    city: 'Pune',
    zone: 'Kothrud',
    status: 'active',
    joinDate: '2025-12-15',
    scoreComponents: { consistency: 70, movement: 58, patterns: 67 }
  },
  {
    id: 'GS-WRK-003',
    name: 'Mohammed Imran',
    phone: '9988776655',
    platform: 'Amazon',
    partnerId: 'AMZ998877665',
    plan: 'Urban',
    gigScore: 91,
    city: 'Hyderabad',
    zone: 'Gachibowli',
    status: 'active',
    joinDate: '2025-10-20',
    scoreComponents: { consistency: 94, movement: 89, patterns: 90 }
  }
]

export const demoClaims = [
  {
    id: 'GS-CLM-0012',
    workerId: 'GS-WRK-001',
    date: '2026-01-15',
    disruption: 'Heavy rainfall',
    duration: 6,
    calculated: 375,
    fraudScore: 8,
    status: 'paid',
    payout: 375,
    zone: 'Hyderabad'
  },
  {
    id: 'GS-CLM-0011',
    workerId: 'GS-WRK-001',
    date: '2026-01-08',
    disruption: 'Extreme AQI',
    duration: 4,
    calculated: 250,
    fraudScore: 12,
    status: 'paid',
    payout: 250,
    zone: 'Hyderabad'
  },
  {
    id: 'GS-CLM-0009',
    workerId: 'GS-WRK-001',
    date: '2025-12-28',
    disruption: 'Curfew',
    duration: 8,
    calculated: 600,
    fraudScore: 6,
    status: 'paid',
    payout: 600,
    zone: 'Hyderabad'
  },
  {
    id: 'GS-CLM-0015',
    workerId: 'GS-WRK-002',
    date: '2026-01-20',
    disruption: 'Heavy rainfall',
    duration: 3,
    calculated: 188,
    fraudScore: 45,
    status: 'pending',
    payout: null,
    zone: 'Pune'
  },
  {
    id: 'GS-CLM-0016',
    workerId: 'GS-WRK-002',
    date: '2026-01-21',
    disruption: 'AQI Alert',
    duration: 2,
    calculated: 125,
    fraudScore: 71,
    status: 'fraud_review',
    payout: null,
    zone: 'Pune'
  }
]

export const demoSessions = [
  {
    date: '2026-01-27',
    start: '09:00',
    end: '17:30',
    duration: '8h 30m',
    distance: 64.2,
    scoreImpact: 2.1
  },
  {
    date: '2026-01-26',
    start: '10:00',
    end: '15:00',
    duration: '5h',
    distance: 38.7,
    scoreImpact: 0.8
  },
  {
    date: '2026-01-25',
    start: '08:30',
    end: '18:00',
    duration: '9h 30m',
    distance: 72.1,
    scoreImpact: 2.8
  },
  {
    date: '2026-01-24',
    start: null,
    end: null,
    duration: '0h',
    distance: 0,
    scoreImpact: -1.2
  },
  {
    date: '2026-01-23',
    start: '11:00',
    end: '16:30',
    duration: '5h 30m',
    distance: 41.3,
    scoreImpact: 0.9
  }
]

export const demoDisruptions = [
  {
    id: 'DIS-001',
    type: 'Heavy rainfall',
    zone: 'Hyderabad Central',
    severity: 8,
    affectedWorkers: 234,
    claimStatus: 'processing',
    triggeredAt: '2026-01-25T14:30:00',
    reading: '28.4 mm/hr'
  },
  {
    id: 'DIS-002',
    type: 'Extreme AQI',
    zone: 'Delhi NCR',
    severity: 6,
    affectedWorkers: 891,
    claimStatus: 'paid',
    triggeredAt: '2026-01-24T09:00:00',
    reading: 'AQI 342'
  }
]

export const demoScoreHistory = [
  { week: 'Wk 1', score: 65 },
  { week: 'Wk 2', score: 68 },
  { week: 'Wk 3', score: 72 },
  { week: 'Wk 4', score: 70 },
  { week: 'Wk 5', score: 74 },
  { week: 'Wk 6', score: 76 },
  { week: 'Wk 7', score: 78 },
  { week: 'Wk 8', score: 78 }
]

export const demoWeeklyActivity = [
  { day: 'Mon', hours: 8.5 },
  { day: 'Tue', hours: 5 },
  { day: 'Wed', hours: 9.5 },
  { day: 'Thu', hours: 0 },
  { day: 'Fri', hours: 5.5 },
  { day: 'Sat', hours: 8 },
  { day: 'Sun', hours: 3 }
]

export const demoFraudAlerts = [
  {
    workerId: 'GS-WRK-002',
    name: 'Priya Singh',
    claimId: 'GS-CLM-0016',
    fraudScore: 71,
    flags: ['Outside zone', 'Pattern anomaly'],
    action: 'review',
    status: 'pending'
  },
  {
    workerId: 'GS-WRK-004',
    name: 'Arjun Mehta',
    claimId: 'GS-CLM-0018',
    fraudScore: 55,
    flags: ['GPS mismatch'],
    action: 'review',
    status: 'pending'
  }
]

export const demoAdminStats = {
  totalWorkers: 2847,
  activePolicies: 2631,
  claimsThisWeek: 156,
  payoutsThisWeek: 42800,
  fraudFlags: 12,
  systemStatus: 'operational'
}
