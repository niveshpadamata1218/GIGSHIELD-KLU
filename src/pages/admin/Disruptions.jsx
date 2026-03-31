import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAdminStore } from '../../store/adminStore'
import TriggerSimulator from '../../components/ui/TriggerSimulator'
import Button from '../../components/ui/Button'

function Disruptions() {
  const { disruptions, triggerDisruption } = useAdminStore()
  const [type, setType] = useState('Heavy rainfall')
  const [zone, setZone] = useState('Hyderabad Central')
  const [severity, setSeverity] = useState(6)

  const handleTrigger = () => {
    triggerDisruption(type, zone, severity)
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
        <h1 className="font-display text-2xl font-semibold text-gs-text">Live disruptions</h1>
        <p className="text-sm text-gs-muted">Monitor and simulate parametric triggers.</p>
      </div>

      <div className="gs-card px-6 py-5">
        <div className="text-sm font-semibold text-gs-text">Active disruptions</div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-gs-muted">
              <tr>
                <th className="py-2">Zone</th>
                <th className="py-2">Type</th>
                <th className="py-2">Severity</th>
                <th className="py-2">Affected workers</th>
                <th className="py-2">Claim status</th>
                <th className="py-2">Elapsed</th>
              </tr>
            </thead>
            <tbody>
              {disruptions.map((disruption) => (
                <tr key={disruption.id} className="border-t border-gs-border">
                  <td className="py-3">{disruption.zone}</td>
                  <td className="py-3">{disruption.type}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                        disruption.severity >= 7
                          ? 'bg-red-50 text-gs-danger'
                          : disruption.severity >= 4
                          ? 'bg-orange-50 text-gs-warning'
                          : 'bg-emerald-50 text-gs-success'
                      }`}
                    >
                      {disruption.severity}
                    </span>
                  </td>
                  <td className="py-3">{disruption.affectedWorkers}</td>
                  <td className="py-3">{disruption.claimStatus}</td>
                  <td className="py-3">15m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="gs-card border-l-4 border-l-gs-warning px-6 py-6">
        <div className="text-lg font-semibold text-gs-text">Simulate disruption event</div>
        <div className="mt-1 text-sm text-gs-muted">Demo mode - triggers the automated claim processing flow.</div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gs-muted">Disruption type</label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="rounded-[10px] border border-gs-border bg-gs-bg px-3 py-2 text-sm"
            >
              {['Heavy rainfall', 'Extreme heat', 'AQI spike', 'Curfew', 'Flash flood'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gs-muted">City zone</label>
            <select
              value={zone}
              onChange={(event) => setZone(event.target.value)}
              className="rounded-[10px] border border-gs-border bg-gs-bg px-3 py-2 text-sm"
            >
              {['Hyderabad Central', 'Delhi NCR', 'Mumbai West', 'Bangalore South'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gs-muted">Severity: {severity}</label>
            <input
              type="range"
              min={1}
              max={10}
              value={severity}
              onChange={(event) => setSeverity(Number(event.target.value))}
              className="accent-gs-warning"
            />
          </div>
        </div>
        <Button onClick={handleTrigger} variant="warning" className="mt-5 w-full">
          Trigger event
        </Button>
        <TriggerSimulator />
      </div>
    </motion.div>
  )
}

export default Disruptions
