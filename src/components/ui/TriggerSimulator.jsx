import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAdminStore } from '../../store/adminStore'

const steps = [
  { id: 1, title: 'Disruption event detected' },
  { id: 2, title: 'Identifying affected workers in zone...' },
  { id: 3, title: 'Running fraud detection...' },
  { id: 4, title: 'Processing automated claims...' },
  { id: 5, title: 'Payouts dispatched to affected workers' }
]

const stepDelay = 1500

function TriggerSimulator() {
  const {
    simulationActive,
    simulationStep,
    simulationData,
    setSimulationStep,
    resetSimulation
  } = useAdminStore()

  useEffect(() => {
    if (!simulationActive) {
      return
    }

    if (simulationStep >= steps.length) {
      return
    }

    const id = setTimeout(() => {
      setSimulationStep(simulationStep + 1)
    }, stepDelay)

    return () => clearTimeout(id)
  }, [simulationActive, simulationStep, setSimulationStep])

  useEffect(() => {
    if (simulationStep === steps.length) {
      const timeout = setTimeout(() => resetSimulation(), 5000)
      return () => clearTimeout(timeout)
    }
  }, [simulationStep, resetSimulation])

  if (!simulationActive) {
    return null
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {steps.map((step) => {
        const isActive = simulationStep >= step.id
        const isComplete = simulationStep > step.id
        const borderColor = isComplete
          ? 'border-gs-success'
          : isActive
          ? 'border-gs-warning'
          : 'border-gs-border'

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: step.id * 0.1 }}
            className={`gs-card border-l-4 ${borderColor} px-5 py-4`}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gs-text">{step.title}</div>
              <span className="text-[11px] font-mono text-gs-dim">{step.id * 1500}ms</span>
            </div>
            <div className="mt-2 text-xs text-gs-muted">
              {step.id === 1
                ? `${simulationData?.type || ''} - ${simulationData?.zone || ''} (Severity ${
                    simulationData?.severity || ''
                  })`
                : null}
              {step.id === 2 ? 'Scanning 2,847 active workers... 234 workers affected.' : null}
              {step.id === 3 ? '228 workers cleared, 6 flagged for review.' : null}
              {step.id === 4 ? 'Generating claim IDs GS-CLM-0191 to GS-CLM-0419.' : null}
              {step.id === 5 ? 'Rs 42,750 credited. Automation complete.' : null}
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gs-surface-2">
              <div
                className={`h-full rounded-full ${
                  isComplete
                    ? 'bg-gs-success'
                    : isActive
                    ? 'bg-gs-warning w-3/4'
                    : 'bg-gs-border'
                }`}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

export default TriggerSimulator
