import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Badge from '../../components/ui/Badge'
import SlideOver from '../../components/ui/SlideOver'
import { useDashboardStore } from '../../store/dashboardStore'
import { formatCurrency, formatDate } from '../../utils/formatters'

const timelineSteps = [
  'Disruption detected',
  'Workers identified',
  'Fraud check completed',
  'Payment processed',
  'Amount credited'
]

const statusBannerMap = {
  paid: {
    text: 'No disruption - you are safe to work',
    className: 'bg-emerald-50 text-gs-success border-emerald-200'
  },
  pending: {
    text: 'Disruption detected - claim processing started',
    className: 'bg-red-50 text-gs-danger border-red-200 animate-pulse'
  },
  fraud_review: {
    text: 'Processing payout - fraud review in progress',
    className: 'bg-orange-50 text-gs-warning border-orange-200'
  }
}

const getActiveIndex = (status) => {
  if (status === 'paid') return timelineSteps.length
  if (status === 'pending') return 3
  if (status === 'fraud_review') return 2
  return 1
}

const buildTimeline = (status) => {
  const activeIndex = getActiveIndex(status)
  return timelineSteps.map((label, index) => {
    const state = index < activeIndex ? 'complete' : index === activeIndex ? 'active' : 'pending'
    return { label, state }
  })
}

function Claims() {
  const { claims, policy, totalPayouts, loading, error } = useDashboardStore()
  const [selected, setSelected] = useState(null)
  const latestClaim = claims[0]
  const banner = statusBannerMap[latestClaim?.status] || statusBannerMap.paid

  const totals = useMemo(() => {
    const totalClaims = claims.length
    const totalPaid = claims.filter((claim) => claim.status === 'paid').length
    const totalPayout = claims.reduce((sum, claim) => sum + (claim.payout || 0), 0)
    return { totalClaims, totalPaid, totalPayout }
  }, [claims])

  const impact = useMemo(() => {
    const disruptionsCovered = totals.totalClaims
    const coverage = policy ? `Rs ${policy.coverage}/day` : '--'
    return {
      protected: totalPayouts,
      coverage,
      disruptionsCovered
    }
  }, [totals.totalClaims, policy, totalPayouts])

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-20 w-full animate-pulse rounded-2xl bg-gs-surface-2" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-24 animate-pulse rounded-2xl bg-gs-surface-2" />
          ))}
        </div>
        <div className="h-64 w-full animate-pulse rounded-2xl bg-gs-surface-2" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="gs-card px-6 py-5 text-sm text-gs-danger">{error}</div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col gap-8"
    >
      <div>
        <h1 className="font-display text-2xl font-semibold text-gs-text">Claims history</h1>
        <p className="text-sm text-gs-muted">Track automated disruption payouts.</p>
      </div>

      <div className={`rounded-xl border px-5 py-3 text-sm ${banner.className}`}>
        {banner.text}
      </div>

      {latestClaim ? (
        <div className="gs-card px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.08em] text-gs-muted">
                Auto claim status
              </div>
              <div className="mt-2 text-lg font-semibold text-gs-text">
                {latestClaim.disruption} detected - {formatCurrency(latestClaim.calculated)} payout initiated
              </div>
              <div className="mt-2 text-xs text-gs-muted">
                Duration: {latestClaim.duration}h | Estimated income loss: {formatCurrency(latestClaim.calculated)}
              </div>
            </div>
            <Badge
              status={latestClaim.status === 'paid' ? 'paid' : latestClaim.status === 'pending' ? 'pending' : 'fraud'}
              label={latestClaim.status.replace('_', ' ')}
            />
          </div>
          <div className="mt-4 text-xs text-gs-muted">
            <span
              className="inline-flex cursor-help items-center gap-1 rounded-full border border-gs-border bg-gs-surface-2 px-3 py-1"
              title="This payout was triggered automatically because disruption thresholds were exceeded in your zone."
            >
              Why this payout triggered
            </span>
          </div>
        </div>
      ) : null}

      {latestClaim ? (
        <div className="gs-card px-6 py-5">
          <div className="text-sm font-semibold text-gs-text">Claim processing timeline</div>
          <div className="mt-4 space-y-3">
            {buildTimeline(latestClaim.status).map((step, index) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12 }}
                className="flex items-start gap-3"
              >
                <div
                  className={`mt-1 h-3 w-3 rounded-full ${
                    step.state === 'complete'
                      ? 'bg-gs-success'
                      : step.state === 'active'
                      ? 'bg-gs-warning'
                      : 'bg-gs-border'
                  }`}
                />
                <div>
                  <div className="text-sm font-semibold text-gs-text">{step.label}</div>
                  <div className="text-xs text-gs-muted">
                    {formatDate(latestClaim.date)} | Step {index + 1}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="gs-card px-5 py-4">
          <div className="text-xs text-gs-muted">Total claims</div>
          <div className="font-mono text-2xl text-gs-text">{totals.totalClaims}</div>
        </div>
        <div className="gs-card px-5 py-4">
          <div className="text-xs text-gs-muted">Total paid out</div>
          <div className="font-mono text-2xl text-gs-success">{formatCurrency(totals.totalPayout)}</div>
        </div>
        <div className="gs-card px-5 py-4">
          <div className="text-xs text-gs-muted">Last payout</div>
          <div className="font-mono text-2xl text-gs-text">{formatDate(claims[0]?.date)}</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="gs-card px-5 py-4">
          <div className="text-xs text-gs-muted">Your protection</div>
          <div className="mt-2 font-mono text-2xl text-gs-electric">{formatCurrency(impact.protected)}</div>
          <div className="mt-2 text-xs text-gs-muted">Total earnings protected</div>
        </div>
        <div className="gs-card px-5 py-4">
          <div className="text-xs text-gs-muted">This week's coverage</div>
          <div className="mt-2 font-mono text-2xl text-gs-success">{impact.coverage}</div>
          <div className="mt-2 text-xs text-gs-muted">Coverage tier</div>
        </div>
        <div className="gs-card px-5 py-4">
          <div className="text-xs text-gs-muted">Disruptions covered</div>
          <div className="mt-2 font-mono text-2xl text-gs-text">{impact.disruptionsCovered}</div>
          <div className="mt-2 text-xs text-gs-muted">Auto-processed events</div>
        </div>
      </div>

      {latestClaim?.status === 'paid' ? (
        <div className="gs-card px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-gs-text">Payout confirmation</div>
              <div className="mt-2 text-lg font-semibold text-gs-success">
                {formatCurrency(latestClaim.payout || latestClaim.calculated)} credited to your account
              </div>
              <div className="mt-2 text-xs text-gs-muted">
                {formatDate(latestClaim.date)} | Transaction ID: TXN-{latestClaim.id}
              </div>
              <div className="mt-1 text-xs text-gs-muted">Payment method: UPI</div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
              <span className="text-gs-success">OK</span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="gs-card px-6 py-5">
        <div className="mb-4 text-sm font-semibold text-gs-text">Claims</div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-gs-muted">
              <tr>
                <th className="py-2">Claim ID</th>
                <th className="py-2">Date</th>
                <th className="py-2">Disruption</th>
                <th className="py-2">Duration</th>
                <th className="py-2">Calculated loss</th>
                <th className="py-2">Fraud score</th>
                <th className="py-2">Status</th>
                <th className="py-2">Payout</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr
                  key={claim.id}
                  className="border-t border-gs-border hover:bg-gs-surface-2 cursor-pointer"
                  onClick={() => setSelected(claim)}
                >
                  <td className="py-3 font-mono text-xs text-gs-muted">{claim.id}</td>
                  <td className="py-3">{formatDate(claim.date)}</td>
                  <td className="py-3">{claim.disruption}</td>
                  <td className="py-3">{claim.duration}h</td>
                  <td className="py-3 font-mono">{formatCurrency(claim.calculated)}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                        claim.fraudScore <= 20
                          ? 'bg-emerald-50 text-gs-success'
                          : claim.fraudScore <= 50
                          ? 'bg-orange-50 text-gs-warning'
                          : 'bg-red-50 text-gs-danger'
                      }`}
                    >
                      Score: {claim.fraudScore}
                    </span>
                  </td>
                  <td className="py-3">
                    <Badge
                      status={claim.status === 'paid' ? 'paid' : claim.status === 'pending' ? 'pending' : 'fraud'}
                      label={claim.status.replace('_', ' ')}
                    />
                  </td>
                  <td className="py-3 font-mono">{formatCurrency(claim.payout)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SlideOver isOpen={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="flex h-full flex-col gap-6 px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gs-muted">Claim ID</div>
                <div className="font-mono text-sm text-gs-text">{selected.id}</div>
              </div>
              <Badge
                status={selected.status === 'paid' ? 'paid' : selected.status === 'pending' ? 'pending' : 'fraud'}
                label={selected.status.replace('_', ' ')}
              />
            </div>
            <div className="space-y-4">
              {buildTimeline(selected.status).map((step, index) => (
                <div key={step.label} className="relative flex gap-3">
                  <div
                    className={`mt-1 h-3 w-3 rounded-full ${
                      step.state === 'complete'
                        ? 'bg-gs-success'
                        : step.state === 'active'
                        ? 'bg-gs-warning'
                        : 'bg-gs-border'
                    }`}
                  />
                  <div>
                    <div className="text-sm font-semibold text-gs-text">{step.label}</div>
                    <div className="text-xs text-gs-muted">
                      {formatDate(selected.date)} | Step {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto text-xs text-gs-muted">
              Payout method: UPI | {formatCurrency(selected.payout || selected.calculated)}
            </div>
          </div>
        ) : null}
      </SlideOver>
    </motion.div>
  )
}

export default Claims
