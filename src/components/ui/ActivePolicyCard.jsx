import { motion } from 'framer-motion'

function ActivePolicyCard({ plan, city, activatedAt, nextRenewal, riskScore }) {
  const calculateDaysRemaining = () => {
    if (!nextRenewal) return null
    const today = new Date()
    const renewal = new Date(nextRenewal)
    const diffTime = renewal - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const daysRemaining = calculateDaysRemaining()
  const activatedDate = new Date(activatedAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 p-6 md:p-8 mb-8"
    >
      {/* Animated Background Pattern */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-green-200/20 to-cyan-200/20"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mb-2"
            >
              <span className="text-3xl">✓</span>
              <h2 className="text-2xl md:text-3xl font-bold text-green-900">Coverage Active</h2>
            </motion.div>
            <p className="text-sm text-green-800">Your protection is now active in {city}</p>
          </div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-2xl flex-shrink-0"
          >
            🛡️
          </motion.div>
        </div>

        {/* Plan Details Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          {/* Plan Name */}
          <div className="bg-white/60 backdrop-blur rounded-xl p-4 border border-green-100">
            <div className="text-xs font-semibold text-green-700 uppercase mb-1">Plan</div>
            <div className="text-2xl font-bold text-green-900">{plan.name}</div>
          </div>

          {/* Weekly Price */}
          <div className="bg-white/60 backdrop-blur rounded-xl p-4 border border-green-100">
            <div className="text-xs font-semibold text-green-700 uppercase mb-1">Weekly Premium</div>
            <div className="text-2xl font-bold text-green-900">₹{plan.price}</div>
          </div>

          {/* Daily Coverage */}
          <div className="bg-white/60 backdrop-blur rounded-xl p-4 border border-green-100">
            <div className="text-xs font-semibold text-green-700 uppercase mb-1">Daily Coverage</div>
            <div className="text-2xl font-bold text-green-900">₹{plan.dailyCoverage}</div>
          </div>

          {/* Risk Status */}
          <div className="bg-white/60 backdrop-blur rounded-xl p-4 border border-green-100">
            <div className="text-xs font-semibold text-green-700 uppercase mb-1">Zone Risk</div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-orange-600">{riskScore}%</span>
              <span className="text-xs text-gray-600">
                {riskScore < 40 ? 'Low' : riskScore < 70 ? 'Medium' : 'High'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Timeline Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/40 backdrop-blur rounded-xl p-4 border border-green-100 mb-6"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-semibold text-green-700 uppercase mb-1">Activated</div>
              <div className="text-base font-semibold text-green-900">{activatedDate}</div>
              <div className="text-xs text-green-700 mt-1">Active since today</div>
            </div>
            {daysRemaining !== null && (
              <div>
                <div className="text-xs font-semibold text-green-700 uppercase mb-1">Renewal In</div>
                <div className="text-base font-semibold text-green-900">{daysRemaining} days</div>
                <div className="text-xs text-green-700 mt-1">Next renewal coming up</div>
              </div>
            )}
          </div>
        </motion.div>

        {/* 3-Year Value Proposition */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <h4 className="font-bold text-cyan-900 mb-1">Your 3-Year Protection Value</h4>
              <p className="text-sm text-cyan-800">
                You pay <span className="font-bold">₹{Math.round(plan.price * 52 * 3)}</span> for{' '}
                <span className="font-bold">₹{(plan.dailyCoverage * 365 * 3).toLocaleString()}+</span> in total coverage days
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Animated Status Indicator */}
      <motion.div
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-4 right-4 w-3 h-3 rounded-full bg-green-500"
      />
    </motion.div>
  )
}

export default ActivePolicyCard
