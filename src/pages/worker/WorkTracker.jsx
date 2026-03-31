import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDashboardStore } from '../../store/dashboardStore'
import { useSessionTimer } from '../../hooks/useSessionTimer'
import Button from '../../components/ui/Button'
import ConfirmModal from '../../components/ui/ConfirmModal'

const getCellColor = (hours) => {
  if (hours === 0) return 'bg-gs-surface-2'
  if (hours < 4) return 'bg-sky-200'
  if (hours < 8) return 'bg-sky-400'
  return 'bg-gs-electric'
}

function WorkTracker() {
  const {
    sessionActive,
    sessionStart,
    currentSession,
    weeklyActivity = [],
    sessions = [],
    startSession,
    endSession
  } = useDashboardStore()
  const { elapsed, formatted } = useSessionTimer(sessionActive, sessionStart)
  const [warning, setWarning] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [hovered, setHovered] = useState(null)

  const handleStart = async () => {
    const result = await startSession()
    if (!result.success) {
      setWarning(result.message)
    } else {
      setWarning('')
    }
  }

  const handleEnd = () => {
    if (elapsed < 300) {
      setWarning('Session must be at least 5 minutes to count toward your Gig Score')
      return
    }
    setWarning('')
    setShowModal(true)
  }

  const confirmEnd = async () => {
    await endSession()
    setShowModal(false)
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
        <h1 className="font-display text-2xl font-semibold text-gs-text">Work Tracker</h1>
        <p className="text-sm text-gs-muted">Track sessions that contribute to your Gig Score.</p>
      </div>

      <div className="rounded-xl border-l-4 border-l-gs-warning bg-orange-50 px-5 py-3 text-sm text-gs-text">
        Work tracking feeds your Gig Score only. Disruption claims are triggered automatically by external events, regardless of your login status.
      </div>

      <div className={`gs-card px-6 py-6 ${sessionActive ? 'border-l-4 border-l-gs-success' : ''}`}>
        {!sessionActive ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="text-lg font-semibold text-gs-text">No active session</div>
            <p className="text-sm text-gs-muted">
              Starting a session records your GPS zone and timestamps for Gig Score calculation.
            </p>
            <Button onClick={handleStart} className="w-full max-w-xs">
              Start work session
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-gs-text">
                <span>Session active</span>
                <span className="h-2 w-2 rounded-full bg-gs-success animate-pulse-dot" />
              </div>
              <div className="text-xs text-gs-muted">
                Started at {sessionStart?.toLocaleTimeString()}
              </div>
            </div>
            <div className="font-mono text-5xl text-gs-success">{formatted}</div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-gs-border bg-gs-surface-2 px-3 py-1">
                Zone: {currentSession?.zone || 'Hyderabad - Hitech City'}
              </span>
              <span className="rounded-full border border-gs-border bg-gs-surface-2 px-3 py-1">
                Distance: {currentSession?.distance || 12.4} km
              </span>
            </div>
            <div className="flex justify-end">
              <Button variant="danger" onClick={handleEnd} className="px-6">
                End session
              </Button>
            </div>
          </div>
        )}
        {warning ? <div className="mt-4 text-xs text-gs-warning">{warning}</div> : null}
      </div>

      <div className="gs-card px-6 py-5">
        <div className="text-sm font-semibold text-gs-text">Weekly activity</div>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
          {weeklyActivity.map((day) => (
            <div
              key={day.day}
              className="relative"
              onMouseEnter={() => setHovered(day)}
              onMouseLeave={() => setHovered(null)}
            >
              <div
                className={`flex h-24 flex-col items-center justify-center rounded-xl text-xs text-gs-text ${getCellColor(
                  day.hours
                )}`}
              >
                <div className="text-xs text-gs-muted">{day.day}</div>
                <div className="font-mono text-sm">{day.hours}h</div>
              </div>
              <AnimatePresence>
                {hovered?.day === day.day ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute left-1/2 top-[-8px] z-10 -translate-x-1/2 rounded-lg border border-gs-border bg-white px-3 py-2 text-[11px] text-gs-muted shadow-lg"
                  >
                    {day.hours} hours worked
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <div className="gs-card px-6 py-5">
        <div className="text-sm font-semibold text-gs-text">Session history</div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-gs-muted">
              <tr>
                <th className="py-2">Date</th>
                <th className="py-2">Start</th>
                <th className="py-2">End</th>
                <th className="py-2">Duration</th>
                <th className="py-2">Distance</th>
                <th className="py-2">Score impact</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.date} className="border-t border-gs-border hover:bg-gs-surface-2">
                  <td className="py-3">{session.date}</td>
                  <td className="py-3">{session.start || '--'}</td>
                  <td className="py-3">{session.end || '--'}</td>
                  <td className="py-3">{session.duration}</td>
                  <td className="py-3">{session.distance} km</td>
                  <td className={`py-3 font-semibold ${session.scoreImpact >= 0 ? 'text-gs-success' : 'text-gs-danger'}`}>
                    {session.scoreImpact >= 0 ? `+${session.scoreImpact}` : session.scoreImpact}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={confirmEnd}
        title="End your work session?"
        description="Duration will be recorded for your Gig Score."
      />
    </motion.div>
  )
}

export default WorkTracker
