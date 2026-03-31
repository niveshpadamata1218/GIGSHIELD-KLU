import { motion } from 'framer-motion'

function NoPlanBanner({ onSelectPlan }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6 relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200"
    >
      {/* Animated Background Elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-orange-100/30"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-red-100/20"
      />

      {/* Content */}
      <div className="relative z-10 p-6 flex items-center justify-between gap-4">
        <div className="flex-1">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-bold text-gs-danger mb-2"
          >
            🛡️ You're not protected yet
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm text-orange-900 max-w-lg"
          >
            Choose an insurance plan below to activate coverage instantly. Get protected against disruptions, accidents, and income loss.
          </motion.p>
        </div>

        {/* Action Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSelectPlan}
          className="px-6 py-2 rounded-lg bg-gradient-to-r from-gs-danger to-orange-500 text-white font-semibold text-sm whitespace-nowrap hover:shadow-lg transition-shadow"
        >
          Choose Plan
        </motion.button>
      </div>

      {/* Pulsing Border Animation */}
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-xl border-2 border-orange-300 pointer-events-none"
      />
    </motion.div>
  )
}

export default NoPlanBanner
