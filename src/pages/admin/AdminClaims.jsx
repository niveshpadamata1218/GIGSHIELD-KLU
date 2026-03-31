import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import { useAdminStore } from '../../store/adminStore'

function AdminClaims() {
  const { claims } = useAdminStore()
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col gap-8"
    >
      <div>
        <h1 className="font-display text-2xl font-semibold text-gs-text">Claims management</h1>
        <p className="text-sm text-gs-muted">Filter, approve, and monitor automated claims.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[['Total value', 'Rs 68,450'], ['Paid', 'Rs 52,800'], ['Pending', 'Rs 12,100'], ['Disputed', 'Rs 3,550']].map(
          (stat) => (
            <div key={stat[0]} className="gs-card px-5 py-4">
              <div className="text-xs text-gs-muted">{stat[0]}</div>
              <div className="font-mono text-2xl text-gs-text">{stat[1]}</div>
            </div>
          )
        )}
      </div>

      <div className="gs-card px-6 py-5">
        <div className="flex flex-wrap gap-3">
          <select className="rounded-[10px] border border-gs-border bg-gs-bg px-3 py-2 text-sm">
            <option>Status</option>
          </select>
          <input
            type="date"
            className="rounded-[10px] border border-gs-border bg-gs-bg px-3 py-2 text-sm"
          />
          <select className="rounded-[10px] border border-gs-border bg-gs-bg px-3 py-2 text-sm">
            <option>Disruption type</option>
          </select>
          <select className="rounded-[10px] border border-gs-border bg-gs-bg px-3 py-2 text-sm">
            <option>City</option>
          </select>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-gs-muted">
              <tr>
                <th className="py-2">Claim ID</th>
                <th className="py-2">Worker</th>
                <th className="py-2">Disruption</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">City</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id} className="border-t border-gs-border">
                  <td className="py-3 font-mono text-xs text-gs-muted">{claim.id}</td>
                  <td className="py-3">{claim.workerId || 'GS-WRK-001'}</td>
                  <td className="py-3">{claim.disruption}</td>
                  <td className="py-3">{`Rs ${claim.payout || claim.calculated}`}</td>
                  <td className="py-3">{claim.status}</td>
                  <td className="py-3">{claim.zone || 'Hyderabad'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex gap-3">
          <Button variant="secondary" className="px-4 py-2 text-sm">
            Approve selected
          </Button>
          <Button variant="danger" className="px-4 py-2 text-sm">
            Flag for review
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default AdminClaims
