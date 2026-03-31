import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import GigScoreRing from '../../components/ui/GigScoreRing'
import ScoreLineChart from '../../components/charts/ScoreLineChart'
import { useDashboardStore } from '../../store/dashboardStore'
import { getScoreMessage } from '../../utils/gigScoreCalculator'

function GigScorePage() {
  const { gigScore, scoreComponents, scoreHistory } = useDashboardStore()
  const [open, setOpen] = useState(false)

  const componentCards = [
    {
      label: 'Activity consistency',
      score: scoreComponents.consistency,
      description: 'Based on shift start/end regularity over the past 30 days.',
      color: 'border-t-emerald-400'
    },
    {
      label: 'Movement distance',
      score: scoreComponents.movement,
      description: 'GPS-validated distance covered during active work sessions.',
      color: 'border-t-gs-electric'
    },
    {
      label: 'Behavioral patterns',
      score: scoreComponents.patterns,
      description: 'Peak-hour alignment and delivery zone consistency.',
      color: 'border-t-gs-gold'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col gap-8"
    >
      <div>
        <h1 className="font-display text-2xl font-semibold text-gs-text">Gig Score</h1>
        <p className="text-sm text-gs-muted">Your behavioral consistency and premium impact.</p>
      </div>

      <div className="sticky top-[72px] z-30 rounded-xl border-l-4 border-l-gs-electric bg-blue-50 px-5 py-3 text-sm text-gs-text">
        Your Gig Score reflects work patterns and helps set your premium and claim priority. All verified disruption claims are paid regardless of score.
      </div>

      <div className="gs-card border-l-4 border-l-gs-electric px-6 py-6">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <GigScoreRing score={gigScore} size={200} />
          <div className="space-y-4">
            <div className="text-xs font-semibold uppercase tracking-[0.08em] text-gs-muted">Current score</div>
            <div className="text-sm text-gs-text">{getScoreMessage(gigScore)}</div>
            <div className="text-xs font-semibold text-gs-success">+4 from last week</div>

            <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-lg border border-gs-border bg-gs-surface-2 px-4 py-3 text-sm font-semibold text-gs-text"
            >
              What affects my score?
              <span className={`transition ${open ? 'rotate-180' : ''}`}>v</span>
            </button>
            <AnimatePresence>
              {open ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 overflow-hidden border-l-4 border-l-gs-electric bg-white px-4 py-3 text-sm text-gs-muted"
                >
                  <div>Shift consistency: how regularly you log work sessions each week.</div>
                  <div>Movement distance: GPS-validated delivery distance per session.</div>
                  <div>Behavioral patterns: peak-hour alignment and zone consistency.</div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {componentCards.map((card) => (
          <div key={card.label} className={`gs-card px-5 py-5 border-t-4 ${card.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gs-text">{card.label}</div>
                <div className="mt-1 font-mono text-xl text-gs-text">{card.score}</div>
              </div>
              <GigScoreRing score={card.score} size={90} />
            </div>
            <p className="mt-3 text-xs text-gs-muted">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="gs-card px-6 py-5">
        <div className="text-sm font-semibold text-gs-text">Score history</div>
        <ScoreLineChart data={scoreHistory} />
      </div>

      <div className="gs-card px-6 py-5">
        <div className="text-sm font-semibold text-gs-text">How your score affects your plan</div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-gs-muted">
              <tr>
                <th className="py-2">Score range</th>
                <th className="py-2">Premium adjustment</th>
                <th className="py-2">Claim priority</th>
                <th className="py-2">Fraud check</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['75-100', '-10% discount', 'Instant', 'Standard'],
                ['60-74', 'Base rate', '< 2 min', 'Standard'],
                ['40-59', '+5% surcharge', '< 5 min', 'Elevated'],
                ['0-39', '+15% surcharge', '< 10 min', 'High frequency']
              ].map((row) => (
                <tr
                  key={row[0]}
                  className={`border-t border-gs-border ${row[0] === '75-100' ? 'bg-blue-50' : ''}`}
                >
                  <td className="py-3 font-mono">{row[0]}</td>
                  <td className="py-3">{row[1]}</td>
                  <td className="py-3">{row[2]}</td>
                  <td className="py-3">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border-l-4 border-l-gs-gold bg-amber-50 px-6 py-4 text-sm text-gs-text">
        Gig Score fraud shield: Genuine workers who log consistent shifts build a strong behavioral baseline. When a disruption claim is evaluated, your location, activity level, and historical patterns are compared against the event. High Gig Scores significantly reduce false-positive fraud flags.
      </div>
    </motion.div>
  )
}

export default GigScorePage
