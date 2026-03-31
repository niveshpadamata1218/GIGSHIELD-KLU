import { useState } from 'react'
import { motion } from 'framer-motion'
import PlanCard from './PlanCard'

function PlansSection({ plans, areaType, city, state, riskScore, onPlanSelected, loadingPlanId }) {
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [confirmChecked, setConfirmChecked] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [lastSuccessPlan, setLastSuccessPlan] = useState(null)
  const [lastSuccessAmount, setLastSuccessAmount] = useState(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  }

  const handleSelectPlan = (planId, plan) => {
    setSelectedPlanId(planId)
    setSelectedPlan(plan)
    setPaymentAmount(String(plan.price))
    setConfirmChecked(false)
    setPaymentError('')
  }

  const handleConfirmAndPay = async () => {
    if (!selectedPlan) {
      setPaymentError('Please select a plan first.')
      return
    }

    const parsedAmount = Number(paymentAmount)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setPaymentError('Please enter a valid payment amount.')
      return
    }

    if (parsedAmount !== Number(selectedPlan.price)) {
      setPaymentError(`Enter exact weekly premium amount: ₹${selectedPlan.price}.`)
      return
    }

    if (!confirmChecked) {
      setPaymentError('Please confirm the payment declaration checkbox to continue.')
      return
    }

    setPaymentError('')

    try {
      await onPlanSelected(selectedPlan, {
        amount: parsedAmount,
        currency: 'INR',
        method: 'manual-entry',
        paidAt: new Date().toISOString()
      })

      setLastSuccessPlan(selectedPlan.name)
      setLastSuccessAmount(parsedAmount)
      setShowSuccessMessage(true)
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 4000)
    } catch (error) {
      console.error('Error selecting plan:', error)
      setPaymentError('Payment could not be completed. Please try again.')
    }
  }

  if (!plans || plans.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-8"
    >
      {/* Section Header */}
      <div className="mb-8">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold text-gs-text mb-2"
        >
          Choose your protection
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm md:text-base text-gs-muted"
        >
          Plans tailored for your area: <span className="font-semibold text-gs-text">{city} ({areaType.replace('-', ' ').toUpperCase()})</span>
        </motion.p>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-gs-muted mt-2 space-y-1"
        >
          <div>Risk Score: <span className="font-bold text-orange-600">{riskScore}%</span></div>
          <div className="text-gray-500">Based on location, weather severity, and local disruption conditions</div>
        </motion.div>
      </div>

      {/* Plans Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isRecommended={plan.recommended}
            isSelected={selectedPlanId === plan.id}
            isLoading={loadingPlanId === plan.id}
            onSelect={() => handleSelectPlan(plan.id, plan)}
          />
        ))}
      </motion.div>

      {/* Payment and Confirmation Panel */}
      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border-2 border-gs-border bg-white p-6 md:p-7"
        >
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gs-text">Buy Plan Offer</h3>
            <p className="text-sm text-gs-muted">
              You selected <span className="font-semibold text-gs-text">{selectedPlan.name} Plan</span> for {city}{state ? `, ${state}` : ''}.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-gs-border bg-gs-surface p-3">
              <div className="text-xs text-gs-muted">Weekly Premium</div>
              <div className="text-lg font-bold text-gs-text">₹{selectedPlan.price}</div>
            </div>
            <div className="rounded-lg border border-gs-border bg-gs-surface p-3">
              <div className="text-xs text-gs-muted">Daily Coverage</div>
              <div className="text-lg font-bold text-gs-text">₹{selectedPlan.dailyCoverage}</div>
            </div>
            <div className="rounded-lg border border-gs-border bg-gs-surface p-3">
              <div className="text-xs text-gs-muted">ROI (model)</div>
              <div className="text-lg font-bold text-gs-text">{selectedPlan.roi?.roi || 'N/A'}</div>
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-gs-text">Enter Amount (INR)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
              className="w-full rounded-lg border border-gs-border bg-white px-3 py-2 text-sm text-gs-text outline-none transition focus:border-gs-electric focus:ring-2 focus:ring-gs-electric/20"
              placeholder={`Enter ₹${selectedPlan.price}`}
            />
            <p className="mt-2 text-xs text-gs-muted">For this demo flow, enter exact weekly premium amount to proceed.</p>
          </div>

          <label className="mt-4 flex items-start gap-3 rounded-lg border border-gs-border bg-gs-surface px-3 py-3">
            <input
              type="checkbox"
              checked={confirmChecked}
              onChange={(event) => setConfirmChecked(event.target.checked)}
              className="mt-1 h-4 w-4 accent-gs-electric"
            />
            <span className="text-xs text-gs-muted">
              I confirm that the selected plan, payment amount, and activation details are correct. I authorize this payment to activate my GigShield coverage.
            </span>
          </label>

          {paymentError && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              {paymentError}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-xs text-gs-muted">Plan activation happens instantly after successful payment.</div>
            <button
              onClick={handleConfirmAndPay}
              disabled={loadingPlanId === selectedPlan.id}
              className="rounded-lg bg-gradient-to-r from-gs-cyan to-gs-electric px-5 py-2 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingPlanId === selectedPlan.id ? 'Processing Payment...' : `Pay ₹${selectedPlan.price} & Activate`}
            </button>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50"
        >
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
                className="text-2xl"
              >
                ✓
              </motion.div>
              <div>
                <h4 className="font-bold text-green-900">Payment Successful!</h4>
                <p className="text-sm text-green-800">
                  ₹{lastSuccessAmount} received for {lastSuccessPlan} Plan. Coverage is now active for your zone.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gs-border"
      >
        <div className="p-4 rounded-lg bg-blue-50">
          <div className="text-2xl mb-2">🛡️</div>
          <h4 className="font-semibold text-gs-text mb-1">Full Coverage</h4>
          <p className="text-xs text-gs-muted">24/7 protection against disruptions and accidents</p>
        </div>
        <div className="p-4 rounded-lg bg-emerald-50">
          <div className="text-2xl mb-2">⚡</div>
          <h4 className="font-semibold text-gs-text mb-1">Instant Activation</h4>
          <p className="text-xs text-gs-muted">Your plan activates instantly after selection</p>
        </div>
        <div className="p-4 rounded-lg bg-purple-50">
          <div className="text-2xl mb-2">📊</div>
          <h4 className="font-semibold text-gs-text mb-1">Smart Monitoring</h4>
          <p className="text-xs text-gs-muted">Real-time zone monitoring and rapid claims processing</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default PlansSection
