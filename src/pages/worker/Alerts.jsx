import { motion } from 'framer-motion'
import Badge from '../../components/ui/Badge'
import { useDashboardStore } from '../../store/dashboardStore'

function Alerts() {
  const { alerts, risk } = useDashboardStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col gap-8"
    >
      <div>
        <h1 className="font-display text-2xl font-semibold text-gs-text">Risk alerts</h1>
        <p className="text-sm text-gs-muted">Live zone monitoring and recent disruptions.</p>
      </div>

      <div className="gs-card px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-gs-text">Hyderabad | Hitech City</div>
            <div className="text-xs text-gs-muted">Updated just now</div>
          </div>
          <Badge status="active" label="Clear" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { label: 'Weather', value: risk?.weather || 'Light rain', badge: risk?.weather || 'Clear' },
            { label: 'AQI', value: risk?.aqi || '187', badge: risk?.aqi || 'Moderate' },
            { label: 'Alerts', value: risk?.alerts || 'None', badge: risk?.alerts || 'Clear' }
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-gs-border bg-gs-surface-2 px-4 py-4">
              <div className="text-xs text-gs-muted">{item.label}</div>
              <div className="mt-2 font-mono text-xl text-gs-text">{item.value}</div>
              <div className="mt-2">
                <Badge status={item.badge === 'Moderate' ? 'pending' : 'active'} label={item.badge} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-gs-success">
          No active disruption
        </div>
      </div>

      <div className="gs-card px-6 py-5">
        <div className="text-sm font-semibold text-gs-text">Alert history</div>
        <div className="mt-4 space-y-3">
          {alerts.map((alert) => (
            <div key={alert.date} className="flex items-center justify-between border-b border-gs-border pb-3 text-sm">
              <div>
                <div className="text-gs-text">{alert.type}</div>
                <div className="text-xs text-gs-muted">{alert.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={alert.severity === 'High' ? 'fraud' : 'pending'} label={alert.severity} />
                <span className="text-xs text-gs-muted">{alert.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default Alerts
