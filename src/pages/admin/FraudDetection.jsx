import { motion } from 'framer-motion'
import { useAdminStore } from '../../store/adminStore'
import FraudPieChart from '../../components/charts/FraudPieChart'
import FraudScatterChart from '../../components/charts/FraudScatterChart'
import Button from '../../components/ui/Button'

const pieData = [
  { name: 'GPS mismatch', value: 35 },
  { name: 'Outside zone', value: 28 },
  { name: 'Duplicate claim', value: 18 },
  { name: 'Pattern anomaly', value: 12 },
  { name: 'Inactive', value: 7 }
]

const scatterData = [
  { gigScore: 90, fraudScore: 15 },
  { gigScore: 78, fraudScore: 22 },
  { gigScore: 62, fraudScore: 48 },
  { gigScore: 55, fraudScore: 60 },
  { gigScore: 40, fraudScore: 72 },
  { gigScore: 85, fraudScore: 18 }
]

function FraudDetection() {
  const { fraudAlerts } = useAdminStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col gap-8"
    >
      <div>
        <h1 className="font-display text-2xl font-semibold text-gs-text">Fraud detection</h1>
        <p className="text-sm text-gs-muted">Flagged claims and behavioral correlation insights.</p>
      </div>

      <div className="gs-card px-6 py-5">
        <div className="text-sm font-semibold text-gs-text">Fraud alerts</div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-gs-muted">
              <tr>
                <th className="py-2">Worker ID</th>
                <th className="py-2">Name</th>
                <th className="py-2">Claim ID</th>
                <th className="py-2">Fraud score</th>
                <th className="py-2">Flags</th>
                <th className="py-2">Action</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {fraudAlerts.map((alert) => (
                <tr key={alert.id || alert.claimId} className="border-t border-gs-border">
                  <td className="py-3 font-mono text-xs text-gs-muted">{alert.workerId}</td>
                  <td className="py-3">{alert.name || 'Unknown'}</td>
                  <td className="py-3 font-mono text-xs text-gs-muted">{alert.claimId}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-gs-danger">
                      {alert.fraudScore || 0}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-2">
                      {(alert.flags || []).map((flag) => (
                        <span
                          key={flag}
                          className="rounded-full bg-gs-surface-2 px-2 py-1 text-[11px] text-gs-text"
                        >
                          {flag}
                        </span>
                      ))}
                      {!alert.flags?.length && (
                        <span className="rounded-full bg-gs-surface-2 px-2 py-1 text-[11px] text-gs-text">
                          Under review
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Button variant="secondary" className="px-2 py-1 text-xs">Approve</Button>
                      <Button variant="danger" className="px-2 py-1 text-xs">Reject</Button>
                      <Button variant="warning" className="px-2 py-1 text-xs">Escalate</Button>
                    </div>
                  </td>
                  <td className="py-3">{alert.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="gs-card px-6 py-5">
          <div className="text-sm font-semibold text-gs-text">Fraud signal breakdown this week</div>
          <FraudPieChart data={pieData} />
        </div>
        <div className="gs-card px-6 py-5">
          <div className="text-sm font-semibold text-gs-text">Gig Score vs Fraud Score</div>
          <FraudScatterChart data={scatterData} />
          <div className="mt-2 text-xs text-gs-muted">
            Workers with Gig Score &gt; 75 account for less than 3% of fraud flags.
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default FraudDetection
