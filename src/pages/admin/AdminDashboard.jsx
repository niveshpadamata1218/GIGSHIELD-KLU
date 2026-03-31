import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAdminStore } from '../../store/adminStore'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import StatCard from '../../components/ui/StatCard'

function AdminDashboard() {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const {
    initializeSyncListeners,
    loadWorkers,
    getWorkerMetrics,
    workers,
    claims,
    fraudAlerts
  } = useAdminStore()
  
  const [activeTab, setActiveTab] = useState('overview')
  const [metrics, setMetrics] = useState({
    totalWorkers: 0,
    activePolicies: 0,
    claimsToday: 0,
    totalPayouts: 0,
    fraudAlerts: 0,
    highRiskWorkers: 0
  })
  
  // Worker registry filters
  const [searchQuery, setSearchQuery] = useState('')
  const [filterArea, setFilterArea] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [selectedWorker, setSelectedWorker] = useState(null)
  const [showWorkerPanel, setShowWorkerPanel] = useState(false)
  
  // Initialize sync listeners and load data on mount
  useEffect(() => {
    loadWorkers()
    initializeSyncListeners()
  }, [initializeSyncListeners, loadWorkers])

  useEffect(() => {
    updateMetrics()
  }, [workers, claims, fraudAlerts])
  
  // Update metrics
  const updateMetrics = () => {
    const newMetrics = getWorkerMetrics()
    setMetrics(newMetrics)
  }
  
  // Filter and sort workers
  const getFilteredWorkers = () => {
    let filtered = [...workers]
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(w =>
        w.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.phone?.includes(searchQuery)
      )
    }
    
    // Area filter
    if (filterArea !== 'all') {
      filtered = filtered.filter(w => w.areaType === filterArea)
    }
    
    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(w => w.status === filterStatus)
    }
    
    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'gigScore':
          return (b.gigScore || 0) - (a.gigScore || 0)
        case 'riskScore':
          return (b.riskScore || 0) - (a.riskScore || 0)
        case 'name':
        default:
          return a.name?.localeCompare(b.name || '')
      }
    })
    
    return filtered
  }
  
  const filteredWorkers = getFilteredWorkers()
  
  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gs-surface">
      {/* Top Bar */}
      <div className="border-b border-gs-border bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gs-danger to-gs-electric text-xs font-semibold text-white">
            AD
          </span>
          <div>
            <div className="text-sm font-semibold text-gs-text">Admin Control Center</div>
            <div className="text-xs text-gs-muted">Real-time Worker Monitoring</div>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="secondary"
          size="sm"
        >
          Logout
        </Button>
      </div>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Real-time Metrics */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3"
            >
              <StatCard
                title="Total Workers"
                value={metrics.totalWorkers}
                icon="👥"
                variant="info"
              />
              <StatCard
                title="Active Policies"
                value={metrics.activePolicies}
                icon="🛡️"
                variant="success"
              />
              <StatCard
                title="Claims Today"
                value={metrics.claimsToday}
                icon="📋"
                variant="warning"
              />
              <StatCard
                title="Total Payouts"
                value={`₹${metrics.totalPayouts}`}
                icon="💰"
                variant="info"
              />
              <StatCard
                title="Fraud Alerts"
                value={metrics.fraudAlerts}
                icon="🚨"
                variant="danger"
              />
              <StatCard
                title="High Risk"
                value={metrics.highRiskWorkers}
                icon="⚠️"
                variant="danger"
              />
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gs-border mt-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'workers', label: 'Worker Registry' },
            { id: 'claims', label: 'Claims Monitoring' },
            { id: 'fraud', label: 'Fraud Detection' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-gs-electric text-gs-electric font-semibold'
                  : 'border-transparent text-gs-muted hover:text-gs-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Charts placeholder */}
            <Card>
              <h3 className="text-lg font-semibold text-gs-text mb-4">Worker Growth Trend</h3>
              <div className="h-48 flex items-center justify-center bg-gs-surface-2 rounded-lg">
                <p className="text-gs-muted">📊 Real-time analytics dashboard</p>
              </div>
            </Card>
          </div>
        )}

        {/* Worker Registry Tab */}
        {activeTab === 'workers' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border border-gs-border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="px-3 py-2 border border-gs-border rounded-lg bg-white text-sm"
                >
                  <option value="all">All Areas</option>
                  <option value="rural">Rural</option>
                  <option value="semi-rural">Semi-Rural</option>
                  <option value="semi-urban">Semi-Urban</option>
                  <option value="urban">Urban</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gs-border rounded-lg bg-white text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="insured">Insured</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gs-border rounded-lg bg-white text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="gigScore">Sort by Gig Score</option>
                  <option value="riskScore">Sort by Risk Score</option>
                </select>
              </div>
              <p className="text-xs text-gs-muted">{filteredWorkers.length} workers found</p>
            </div>

            {/* Worker Registry Table */}
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gs-border bg-gs-surface">
                      <th className="text-left p-3 font-semibold text-gs-text">Worker ID</th>
                      <th className="text-left p-3 font-semibold text-gs-text">Name</th>
                      <th className="text-left p-3 font-semibold text-gs-text">Phone</th>
                      <th className="text-left p-3 font-semibold text-gs-text">City</th>
                      <th className="text-left p-3 font-semibold text-gs-text">Plan</th>
                      <th className="text-left p-3 font-semibold text-gs-text">Gig Score</th>
                      <th className="text-left p-3 font-semibold text-gs-text">Risk Score</th>
                      <th className="text-left p-3 font-semibold text-gs-text">Status</th>
                      <th className="text-left p-3 font-semibold text-gs-text">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredWorkers.length > 0 ? (
                      filteredWorkers.map(worker => (
                        <tr
                          key={worker.id}
                          className="border-b border-gs-border hover:bg-gs-surface-2 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedWorker(worker)
                            setShowWorkerPanel(true)
                          }}
                        >
                          <td className="p-3 font-mono text-xs text-gs-muted">{worker.id}</td>
                          <td className="p-3 font-semibold text-gs-text">{worker.name}</td>
                          <td className="p-3 text-gs-muted">{worker.phone}</td>
                          <td className="p-3 text-gs-muted">{worker.city}</td>
                          <td className="p-3">
                            {worker.plan ? (
                              <Badge status="paid">{worker.plan.name}</Badge>
                            ) : (
                              <Badge status="pending">No Plan</Badge>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-gs-text">{(worker.gigScore || 0).toFixed(1)}</div>
                          </td>
                          <td className="p-3">
                            <div className={`font-semibold ${
                              worker.riskScore > 60 ? 'text-gs-danger' : 'text-gs-text'
                            }`}>
                              {worker.riskScore || 0}%
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge status={
                              worker.status === 'active' ? 'paid' :
                              worker.status === 'insured' ? 'success' :
                              'pending'
                            }>
                              {worker.status?.charAt(0).toUpperCase() + worker.status?.slice(1)}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedWorker(worker)
                                setShowWorkerPanel(true)
                              }}
                              className="text-xs text-gs-electric hover:underline font-semibold"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="p-6 text-center text-gs-muted">
                          No workers found matching your filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Claims Monitoring Tab */}
        {activeTab === 'claims' && (
          <Card>
            <h2 className="text-lg font-semibold text-gs-text mb-4">Claims Activity</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gs-border">
                    <th className="text-left p-3 font-semibold text-gs-text">Claim ID</th>
                    <th className="text-left p-3 font-semibold text-gs-text">Worker</th>
                    <th className="text-left p-3 font-semibold text-gs-text">Disruption</th>
                    <th className="text-left p-3 font-semibold text-gs-text">Amount</th>
                    <th className="text-left p-3 font-semibold text-gs-text">Risk Score</th>
                    <th className="text-left p-3 font-semibold text-gs-text">Date</th>
                    <th className="text-left p-3 font-semibold text-gs-text">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {claims && claims.length > 0 ? (
                    claims.slice(0, 10).map(claim => (
                      <tr key={claim.id} className="border-b border-gs-border hover:bg-gs-surface-2">
                        <td className="p-3 font-mono text-xs text-gs-muted">{claim.id}</td>
                        <td className="p-3 text-gs-text">{claim.workerName || 'N/A'}</td>
                        <td className="p-3 text-gs-muted">{claim.disruption || 'General'}</td>
                        <td className="p-3 font-semibold">₹{claim.amount || 0}</td>
                        <td className="p-3">
                          <span className={claim.fraudRiskScore > 60 ? 'text-gs-danger' : 'text-gs-text'}>
                            {claim.fraudRiskScore || 0}%
                          </span>
                        </td>
                        <td className="p-3 text-xs text-gs-muted">
                          {new Date(claim.timestamp).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <Badge status={
                            claim.status === 'paid' ? 'paid' :
                            claim.status === 'fraud' ? 'fraud' :
                            'pending'
                          }>
                            {claim.status?.toUpperCase()}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-gs-muted">
                        No claims recorded
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Fraud Detection Tab */}
        {activeTab === 'fraud' && (
          <div className="space-y-4">
            <Card>
              <h2 className="text-lg font-semibold text-gs-text mb-4">🚨 High Fraud Risk Workers</h2>
              <div className="space-y-3">
                {workers.filter(w => (w.riskScore || 0) > 60).length > 0 ? (
                  workers
                    .filter(w => (w.riskScore || 0) > 60)
                    .map(worker => (
                      <div
                        key={worker.id}
                        className="flex items-center justify-between bg-red-50 p-4 rounded-lg border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedWorker(worker)
                          setShowWorkerPanel(true)
                        }}
                      >
                        <div>
                          <div className="font-semibold text-gs-text">{worker.name}</div>
                          <div className="text-sm text-gs-muted">{worker.phone} • {worker.city}</div>
                          <div className="text-xs text-gs-muted mt-1">
                            Fraud Flags: {worker.fraudFlags || 0} | Claims: {(worker.claims || []).length}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge status="fraud" className="mb-2">
                            {worker.riskScore}% Risk
                          </Badge>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedWorker(worker)
                              setShowWorkerPanel(true)
                            }}
                            className="text-xs text-gs-danger hover:underline block mt-1 font-semibold"
                          >
                            Review Details
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-center text-gs-muted py-8">✅ No high-risk workers detected</p>
                )}
              </div>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gs-text mb-4">Recent Fraud Alerts</h2>
              <div className="space-y-2">
                {fraudAlerts && fraudAlerts.length > 0 ? (
                  fraudAlerts.slice(0, 5).map(alert => (
                    <div key={alert.id} className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="font-semibold text-red-700 text-sm">{alert.type || 'Fraud Alert'}</div>
                      <div className="text-sm text-gs-muted mt-1">{alert.reason || 'Suspicious activity detected'}</div>
                      <div className="text-xs text-gs-muted mt-2">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gs-muted py-6">No fraud alerts</p>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Worker Detail Slide Panel */}
      {showWorkerPanel && selectedWorker && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          className="fixed right-0 top-0 h-screen w-96 bg-white border-l border-gs-border shadow-2xl overflow-y-auto z-50"
        >
          <div className="sticky top-0 bg-white border-b border-gs-border p-4 flex items-center justify-between">
            <h3 className="font-semibold text-gs-text">Worker Profile</h3>
            <button
              onClick={() => setShowWorkerPanel(false)}
              className="text-gs-muted hover:text-gs-text text-xl"
            >
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Personal Info */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gs-text text-sm">Personal Information</h4>
              <div className="bg-gs-surface p-3 rounded-lg space-y-2">
                <div>
                  <div className="text-xs text-gs-muted">Worker ID</div>
                  <div className="font-mono text-sm">{selectedWorker.id}</div>
                </div>
                <div>
                  <div className="text-xs text-gs-muted">Name</div>
                  <div className="font-semibold">{selectedWorker.name}</div>
                </div>
                <div>
                  <div className="text-xs text-gs-muted">Phone</div>
                  <div>{selectedWorker.phone}</div>
                </div>
                <div>
                  <div className="text-xs text-gs-muted">City / Area</div>
                  <div>{selectedWorker.city} ({selectedWorker.areaType?.toUpperCase()})</div>
                </div>
                <div>
                  <div className="text-xs text-gs-muted">Platform</div>
                  <div>{selectedWorker.platform || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-xs text-gs-muted">Join Date</div>
                  <div>{new Date(selectedWorker.joinDate).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* Plan Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gs-text text-sm">Plan Information</h4>
              <div className="bg-gs-surface p-3 rounded-lg space-y-2">
                {selectedWorker.plan ? (
                  <>
                    <div>
                      <div className="text-xs text-gs-muted">Plan Name</div>
                      <div className="font-semibold">{selectedWorker.plan.name}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gs-muted">Weekly Premium</div>
                      <div>₹{selectedWorker.plan.weeklyPremium}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gs-muted">Daily Coverage</div>
                      <div>₹{selectedWorker.plan.coverage}/day</div>
                    </div>
                    <div>
                      <div className="text-xs text-gs-muted">Status</div>
                      <Badge status="paid">{selectedWorker.plan.status}</Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gs-muted">No active plan</p>
                )}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gs-text text-sm">Performance Metrics</h4>
              <div className="bg-gs-surface p-3 rounded-lg space-y-2">
                <div>
                  <div className="text-xs text-gs-muted">Gig Score</div>
                  <div className="font-semibold text-lg">{(selectedWorker.gigScore || 0).toFixed(1)}/10</div>
                </div>
                <div>
                  <div className="text-xs text-gs-muted">Risk Score</div>
                  <div className={`font-semibold text-lg ${
                    (selectedWorker.riskScore || 0) > 60 ? 'text-gs-danger' : 'text-gs-text'
                  }`}>
                    {selectedWorker.riskScore || 0}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gs-muted">Total Earnings Protected</div>
                  <div className="font-semibold">₹{selectedWorker.totalEarningsProtected || 0}</div>
                </div>
                <div>
                  <div className="text-xs text-gs-muted">Total Payouts</div>
                  <div className="font-semibold text-gs-electric">₹{selectedWorker.totalPayouts || 0}</div>
                </div>
              </div>
            </div>

            {/* Fraud Flags */}
            {(selectedWorker.fraudFlags || 0) > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gs-text text-sm">⚠️ Fraud Alerts</h4>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="text-sm font-semibold text-red-700">
                    {selectedWorker.fraudFlags} Flag{selectedWorker.fraudFlags > 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-red-600 mt-2">
                    This worker has suspicious activity patterns
                  </div>
                </div>
              </div>
            )}

            {/* Work Sessions */}
            {selectedWorker.sessions && selectedWorker.sessions.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gs-text text-sm">Recent Sessions ({selectedWorker.sessions.length})</h4>
                <div className="space-y-2">
                  {selectedWorker.sessions.slice(0, 3).map((session, idx) => (
                    <div key={idx} className="text-xs p-2 bg-gs-surface rounded">
                      <div className="text-gs-text">{new Date(session.startTime || session).toLocaleDateString()}</div>
                      <div className="text-gs-muted">Active session</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Claims History */}
            {selectedWorker.claims && selectedWorker.claims.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gs-text text-sm">Claims History ({selectedWorker.claims.length})</h4>
                <div className="space-y-2">
                  {selectedWorker.claims.slice(0, 3).map((claim, idx) => (
                    <div key={idx} className="text-xs p-2 bg-gs-surface rounded">
                      <div className="font-semibold text-gs-text">₹{claim.amount}</div>
                      <div className="text-gs-muted">{claim.disruption || 'General claim'}</div>
                      <div className="text-gs-muted">{new Date(claim.timestamp).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => setShowWorkerPanel(false)} className="w-full" variant="secondary">
              Close
            </Button>
          </div>
        </motion.div>
      )}

      {/* Overlay for slide panel */}
      {showWorkerPanel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowWorkerPanel(false)}
          className="fixed inset-0 bg-black/20 z-40"
        />
      )}
    </div>
  )
}

export default AdminDashboard
