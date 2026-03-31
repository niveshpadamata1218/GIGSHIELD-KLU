import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useAuthStore } from '../../store/authStore'
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
  const { user } = useAuthStore()
  const { policy } = useDashboardStore()
  const { getTransactions } = useAuthStore()

  const transactions = useMemo(() => {
    if (user?.phone) {
      return getTransactions(user.phone).sort((a, b) => new Date(b.date) - new Date(a.date))
    }
    return []
  }, [user?.phone, getTransactions])

  const totalPayments = useMemo(() => {
    return transactions
      .filter(t => t.type === 'plan_payment' && t.status === 'success')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions])

  const totalPayouts = useMemo(() => {
    return transactions
      .filter(t => t.type === 'payout')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [transactions])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col gap-8"
    >
      <div>
        <h1 className="font-display text-2xl font-semibold text-gs-text">Policy & Transactions</h1>
        <p className="text-sm text-gs-muted">Your policy details and complete transaction history.</p>
      </div>

      {/* Policy Info - Show if active */}
      {user?.planActivated && (
        <div className="gs-card border-l-4 border-l-gs-electric px-6 py-6">
          <div className="text-xs font-mono text-gs-dim">GS-2026-{user?.city?.substring(0, 3).toUpperCase()}-001</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="font-display text-2xl font-semibold text-gs-text">{user?.plan} Plan</div>
            <Badge status="paid" label="Active" />
          </div>
          <div className="mt-3 font-mono text-4xl text-gs-electric">₹{user?.plan === 'Urban Plan' ? '1000' : '1500'}/day</div>
          <div className="mt-2 text-sm text-gs-muted">Premium: ₹{user?.plan === 'Urban Plan' ? '200' : '300'}/week</div>
          <div className="mt-2 text-sm text-gs-muted">
            Activated: {user?.planActivationDate}
          </div>
          <div className="mt-3 text-xs font-semibold text-gs-success">✓ Coverage Active</div>
        </div>
      )}

      {/* Transaction Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="gs-card px-5 py-4">
          <div className="text-xs text-gs-muted font-semibold mb-2">Total Paid to Plan</div>
          <div className="text-2xl font-bold text-gs-electric">₹{totalPayments}</div>
          <div className="text-xs text-gs-muted mt-1">{transactions.filter(t => t.type === 'plan_payment' && t.status === 'success').length} payments</div>
        </div>
        <div className="gs-card px-5 py-4">
          <div className="text-xs text-gs-muted font-semibold mb-2">Total Payouts Received</div>
          <div className="text-2xl font-bold text-gs-success">₹{totalPayouts}</div>
          <div className="text-xs text-gs-muted mt-1">{transactions.filter(t => t.type === 'payout').length} payouts</div>
        </div>
        <div className="gs-card px-5 py-4">
          <div className="text-xs text-gs-muted font-semibold mb-2">Failed Transactions</div>
          <div className="text-2xl font-bold text-gs-danger">{transactions.filter(t => t.status === 'failed').length}</div>
          <div className="text-xs text-gs-muted mt-1">Pending retry</div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="gs-card px-6 py-5">
        <h2 className="text-sm font-semibold text-gs-text mb-4">Transaction History</h2>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.08em] text-gs-muted">
                <tr>
                  <th className="py-2">Date</th>
                  <th className="py-2">Type</th>
                  <th className="py-2">Description</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="border-t border-gs-border hover:bg-gs-surface-2">
                    <td className="py-3">{formatDate(new Date(txn.date).toISOString())}</td>
                    <td className="py-3">
                      <Badge
                        status={txn.type === 'plan_payment' ? 'pending' : 'paid'}
                        label={txn.type === 'plan_payment' ? 'Payment' : 'Payout'}
                      />
                    </td>
                    <td className="py-3 text-xs text-gs-muted">{txn.description}</td>
                    <td className="py-3 font-mono font-semibold">{formatCurrency(txn.amount)}</td>
                    <td className="py-3">
                      <Badge
                        status={txn.status === 'success' ? 'paid' : txn.status === 'failed' ? 'fraud' : 'pending'}
                        label={txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-sm text-gs-muted">No transactions yet</div>
            <div className="text-xs text-gs-muted mt-1">Activate your plan to start</div>
          </div>
        )}
      </div>

      {/* Coverage Details */}
      {user?.planActivated && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="gs-card px-5 py-4 text-sm text-gs-text">
              Covered disruptions
              <div className="mt-2 text-xs text-gs-muted">Weather, AQI, Curfews</div>
            </div>
            <div className="gs-card px-5 py-4 text-sm text-gs-text">
              Max payout per week
              <div className="mt-2 font-mono text-gs-electric">{user?.plan === 'Urban Plan' ? '₹7000' : '₹10500'}</div>
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
            <h2 className="text-sm font-semibold text-gs-text">Coverage triggers</h2>
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
        </>
      )}
    </motion.div>
  )
}

export default Policy
