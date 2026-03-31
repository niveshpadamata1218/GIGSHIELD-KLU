import { motion } from 'framer-motion'
import { useDashboardStore } from '../../store/dashboardStore'
import Badge from '../../components/ui/Badge'
import { formatCurrency, formatDate } from '../../utils/formatters'

const triggers = [
  { name: 'Heavy rainfall', threshold: '>20 mm/hr', reading: '3.2 mm/hr', status: 'Clear' },
  { name: 'Extreme heat', threshold: '>42C', reading: '38C', status: 'Clear' },
  { name: 'Severe AQI', threshold: '>300', reading: 'AQI 187', status: 'Moderate' },
  { name: 'Curfew / Section 144', threshold: 'Active order', reading: 'No active orders', status: 'Clear' },
  { name: 'Flash flood alert', threshold: 'Active alert', reading: 'No active alert', status: 'Clear' }
]

function Policy() {
  const { policy } = useDashboardStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col gap-8"
    >
      <div>
        <h1 className="font-display text-2xl font-semibold text-gs-text">Policy & Coverage</h1>
        <p className="text-sm text-gs-muted">Your active coverage and automated triggers.</p>
      </div>

      <div className="gs-card border-l-4 border-l-gs-electric px-6 py-6">
        <div className="text-xs font-mono text-gs-dim">GS-2026-HYD-001</div>
        <div className="mt-2 flex items-center gap-3">
          <div className="font-display text-2xl font-semibold text-gs-text">{policy.plan} Plan</div>
          <Badge status="active" label="Active" />
        </div>
        <div className="mt-3 font-mono text-4xl text-gs-electric">{formatCurrency(policy.coverage)}/day</div>
        <div className="mt-2 text-sm text-gs-muted">Premium: {formatCurrency(policy.premium)}/week</div>
        <div className="mt-2 text-sm text-gs-muted">
          Valid Jan 27 - {formatDate(policy.validUntil)}
        </div>
        <div className="mt-3 text-xs font-semibold text-gs-warning">Auto-renews in 4 days</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="gs-card px-5 py-4 text-sm text-gs-text">
          Covered disruptions
          <div className="mt-2 text-xs text-gs-muted">Weather, AQI, Curfews</div>
        </div>
        <div className="gs-card px-5 py-4 text-sm text-gs-text">
          Max payout per week
          <div className="mt-2 font-mono text-gs-electric">{formatCurrency(4200)}</div>
        </div>
        <div className="gs-card px-5 py-4 text-sm text-gs-text">
          Waiting period
          <div className="mt-2 text-xs text-gs-success">None</div>
        </div>
        <div className="gs-card px-5 py-4 text-sm text-gs-text">
          Processing
          <div className="mt-2 text-xs text-gs-success">Automated | 0 touch</div>
        </div>
      </div>

      <div className="gs-card px-6 py-5">
        <h2 className="text-sm font-semibold text-gs-text">What triggers your coverage</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {triggers.map((trigger) => (
            <div key={trigger.name} className="rounded-xl border border-gs-border bg-white px-4 py-4">
              <div className="text-sm font-semibold text-gs-text">{trigger.name}</div>
              <div className="mt-2 text-xs text-gs-muted">Threshold: {trigger.threshold}</div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="font-mono text-gs-text">{trigger.reading}</span>
                <Badge
                  status={trigger.status === 'Moderate' ? 'pending' : 'active'}
                  label={trigger.status}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="gs-card px-6 py-5">
        <h2 className="text-sm font-semibold text-gs-text">Payment history</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-gs-muted">
              <tr>
                <th className="py-2">Week</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Payment date</th>
                <th className="py-2">Method</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {['2026-01-21', '2026-01-14', '2026-01-07'].map((week) => (
                <tr key={week} className="border-t border-gs-border">
                  <td className="py-3">Week of {formatDate(week)}</td>
                  <td className="py-3 font-mono">{formatCurrency(40)}</td>
                  <td className="py-3">{formatDate(week)}</td>
                  <td className="py-3">UPI</td>
                  <td className="py-3">
                    <Badge status="paid" label="Paid" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

export default Policy
