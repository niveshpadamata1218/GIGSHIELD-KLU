const defaultSteps = ['Identity', 'Platform', 'OTP', 'Plan']

function StepIndicator({ currentStep, steps = defaultSteps }) {
  return (
    <div className="w-full">
      {/* Mobile: Show current step + progress bar */}
      <div className="md:hidden mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            {steps.map((_, index) => {
              const step = index + 1
              const isComplete = step < currentStep
              const isActive = step === currentStep
              return (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    isComplete
                      ? 'bg-gradient-to-r from-gs-electric to-gs-violet'
                      : isActive
                      ? 'bg-gs-electric'
                      : 'bg-gs-surface-2'
                  }`}
                />
              )
            })}
          </div>
        </div>
        <div className="text-xs font-semibold text-gs-text">
          Step {currentStep} of {steps.length}: <span className="text-gs-electric">{steps[currentStep - 1]}</span>
        </div>
      </div>

      {/* Desktop: Show all steps with icons */}
      <div className="hidden md:flex items-center justify-between gap-1.5">
        {steps.map((label, index) => {
          const step = index + 1
          const isActive = step === currentStep
          const isComplete = step < currentStep

          return (
            <div key={label} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full gap-1.5 mb-2">
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-br from-gs-electric to-gs-violet text-white shadow-[0_4px_12px_rgba(14,165,233,0.35)] scale-110'
                      : isComplete
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gs-surface-2 text-gs-dim'
                  }`}
                >
                  {isComplete ? '✓' : step}
                </div>
                {step < steps.length && (
                  <div
                    className={`h-1 flex-1 rounded-full transition-all ${
                      isComplete ? 'bg-gradient-to-r from-gs-electric to-gs-violet' : 'bg-gs-border'
                    }`}
                  />
                )}
              </div>
              <span className="text-[10px] font-semibold text-gs-muted text-center leading-tight px-1 line-clamp-2">
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StepIndicator
