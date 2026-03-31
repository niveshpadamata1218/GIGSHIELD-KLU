const defaultSteps = ['Identity', 'Platform', 'OTP', 'Plan']

function StepIndicator({ currentStep, steps = defaultSteps }) {
  return (
    <div className="flex items-center justify-between gap-2">
      {steps.map((label, index) => {
        const step = index + 1
        const isActive = step === currentStep
        const isComplete = step < currentStep

        return (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${
                isActive
                  ? 'bg-gradient-to-br from-gs-electric to-gs-violet text-white shadow-[0_6px_16px_rgba(14,165,233,0.35)]'
                  : isComplete
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gs-surface-2 text-gs-dim'
              }`}
            >
              {isComplete ? 'OK' : step}
            </div>
            <span className="hidden text-[11px] font-semibold text-gs-muted md:block">
              {label}
            </span>
            {step < steps.length ? (
              <div
                className={`h-[2px] flex-1 rounded-full ${
                  isComplete ? 'bg-gradient-to-r from-gs-electric to-gs-violet' : 'bg-gs-border'
                }`}
              />
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export default StepIndicator
