import { useState } from 'react'
import { motion } from 'framer-motion'

function PlanCard({ plan, isRecommended, isSelected, onSelect, isLoading }) {
  const [isHovered, setIsHovered] = useState(false)
  const threeYearCost = plan.workerValue?.threeYearCost ?? Math.round(plan.price * 52 * 3)
  const potentialCoverage = plan.workerValue?.potentialCoverage ?? plan.dailyCoverage * 2 * 6 * 3
  const valueMultiple = plan.workerValue?.valueMultiple ?? 'N/A'

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    },
    hover: isRecommended ? { scale: 1.03, y: -8 } : { scale: 1.02, y: -4 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover={!isLoading && !isSelected ? 'hover' : ''}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-2xl transition-all duration-300 ${
        isRecommended
          ? 'border-2 border-gs-cyan bg-gradient-to-br from-cyan-50 to-white'
          : 'border-2 border-gs-border bg-white'
      } ${isSelected ? 'ring-2 ring-gs-cyan ring-offset-2' : ''} p-6 cursor-pointer`}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="px-3 py-1 rounded-full bg-gradient-to-r from-gs-cyan to-gs-electric text-white text-xs font-bold shadow-lg"
          >
            ⭐ Recommended
          </motion.div>
        </div>
      )}

      {/* Selected Checkmark */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gs-cyan text-white flex items-center justify-center"
        >
          ✓
        </motion.div>
      )}

      {/* Plan Name */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gs-text">{plan.name} Plan</h3>
        <p className="text-xs text-gs-muted mt-1">{plan.description}</p>
      </div>

      {/* Price Section */}
      <div className="mb-6 space-y-2">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gs-text">₹{plan.price}</span>
          <span className="text-sm text-gs-muted">/week</span>
        </div>
        <div className="text-sm text-gs-muted">
          Daily coverage up to <span className="font-semibold text-gs-text">₹{plan.dailyCoverage}</span>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="mb-6 space-y-2 p-3 rounded-lg bg-gs-surface">
        <div className="flex justify-between text-sm">
          <span className="text-gs-muted">Monthly:</span>
          <span className="font-semibold text-gs-text">₹{Math.round(plan.price * 4.33)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gs-muted">Yearly:</span>
          <span className="font-semibold text-gs-text">₹{plan.price * 52}</span>
        </div>
      </div>

      {/* 3-Year Projection */}
      <div className="mb-6 p-3 rounded-lg bg-blue-50 border border-blue-200">
        <div className="text-xs text-blue-900 font-semibold mb-1">Over 3 years:</div>
        <div className="text-sm text-blue-800">
          You pay <span className="font-bold">₹{threeYearCost}</span> {'->'}{' '}
          <span className="font-bold">protected up to ₹{potentialCoverage.toLocaleString()}</span>
        </div>
        <div className="mt-1 text-xs font-semibold text-blue-900">Worker Value: {valueMultiple}</div>
      </div>

      {/* Plan economics */}
      <div className="mb-6 flex items-center justify-between rounded-lg border border-gs-border bg-gs-surface px-3 py-2 text-xs">
        <span className="text-gs-muted">Model ROI</span>
        <span className="font-bold text-gs-text">{plan.roi?.roi || 'N/A'}</span>
      </div>

      {/* Select Button */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onSelect}
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
          isSelected
            ? 'bg-gs-cyan text-white shadow-lg'
            : isRecommended
              ? 'bg-gradient-to-r from-gs-cyan to-gs-electric text-white hover:shadow-lg'
              : 'bg-gs-surface text-gs-text hover:bg-gs-border'
        } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            />
            Activating...
          </span>
        ) : isSelected ? (
          '✓ Selected'
        ) : (
          'Proceed to Payment'
        )}
      </motion.button>

      {/* Hover Indicator */}
      {isHovered && !isSelected && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gs-cyan/5 to-gs-electric/5 pointer-events-none"
        />
      )}
    </motion.div>
  )
}

export default PlanCard
