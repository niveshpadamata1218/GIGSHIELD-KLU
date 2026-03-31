import { forwardRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const Input = forwardRef(function Input(
  { label, error, helper, className = '', ...props },
  ref
) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm text-gs-text">
      {label ? <span className="text-xs font-medium text-gs-muted">{label}</span> : null}
      <input
        ref={ref}
        className={`w-full rounded-[10px] border border-gs-border bg-gs-bg px-4 py-3 text-sm text-gs-text placeholder:text-gs-dim focus:border-gs-electric focus:outline-none focus:ring-2 focus:ring-gs-electric/20 ${
          error ? 'border-gs-danger focus:border-gs-danger focus:ring-gs-danger/20' : ''
        } ${className}`}
        {...props}
      />
      {helper ? <span className="text-xs text-gs-dim">{helper}</span> : null}
      <AnimatePresence mode="wait">
        {error ? (
          <motion.span
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="text-xs text-gs-danger"
          >
            {error}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </label>
  )
})

export default Input
