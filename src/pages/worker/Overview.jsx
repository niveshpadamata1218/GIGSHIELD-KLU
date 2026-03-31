import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useDashboardStore } from '../../store/dashboardStore'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import ActivityBarChart from '../../components/charts/ActivityBarChart'
import { formatCurrency, formatDate } from '../../utils/formatters'

function Overview() {
  const { user } = useAuthStore()
  const { policy, claims, gigScore, weeklyActivity, risk, totalPayouts } = useDashboardStore()
  const recentClaims = claims.slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col gap-8"
    >
      <div>
        <h1 className="font-display text-2xl font-semibold text-gs-text">Overview</h1>
        <p className="text-sm text-gs-muted">
          {user?.name || 'Ravi Kumar'} | {policy?.plan || 'Urban Plan'} | {user?.city || 'Hyderabad'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active policy"
          value={policy?.plan || 'Urban Plan'}
          color="text-gs-electric"
          sublabel={`Valid until ${formatDate(policy?.validUntil)}`}
        />
        <StatCard label="Gig Score" value={gigScore} color="text-gs-gold" />
        <StatCard
          label="This week's coverage"
          value={policy ? `Rs ${policy.coverage}/day` : '--'}
          color="text-gs-success"
        />
        <StatCard
          label="Total payouts received"
          value={formatCurrency(totalPayouts)}
          color="text-gs-text"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="gs-card px-6 py-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gs-text">Recent claims</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.08em] text-gs-muted">
                <tr>
                  <th className="py-2">Date</th>
                  <th className="py-2">Disruption</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentClaims.map((claim) => (
                  <tr key={claim.id} className="border-t border-gs-border text-sm text-gs-text hover:bg-gs-surface-2">
                    <td className="py-3">{formatDate(claim.date)}</td>
                    <td className="py-3">{claim.disruption}</td>
                    <td className="py-3 font-mono">{formatCurrency(claim.payout || claim.calculated)}</td>
                    <td className="py-3">
                      <Badge
                        status={claim.status === 'paid' ? 'paid' : claim.status === 'pending' ? 'pending' : 'fraud'}
                        label={claim.status.replace('_', ' ')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="gs-card px-6 py-5">
          <div className="text-sm font-semibold text-gs-text">Zone risk status</div>
          <div className="mt-2 text-xs text-gs-muted">Hyderabad | Hitech City</div>
          <div className="mt-4 space-y-4">
            {[
              {
                label: 'Weather risk',
                value: risk?.weather || 'Low',
                color: risk?.weather === 'High' ? 'bg-gs-danger' : 'bg-gs-success'
              },
              {
                label: 'AQI level',
                value: risk?.aqi || 'Moderate',
                color: risk?.aqi === 'High' ? 'bg-gs-danger' : 'bg-gs-warning'
              },
              {
                label: 'Alert status',
                value: risk?.alerts || 'Clear',
                color: risk?.alerts === 'Active' ? 'bg-gs-danger' : 'bg-gs-success'
              }
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gs-muted">
                  <span>{item.label}</span>
                  <span className="text-gs-text">{item.value}</span>
                </div>
                <div className="h-2 rounded-full bg-gs-surface-2">
                  <div className={`h-2 w-2/3 rounded-full ${item.color}`} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-gs-success">
            No active disruption
          </div>
        </div>
      </div>

      <div className="gs-card px-6 py-5">
        <div className="mb-4 text-sm font-semibold text-gs-text">Work activity this week</div>
        <ActivityBarChart data={weeklyActivity} />
      </div>
    </motion.div>
  )
}

export default Overview
