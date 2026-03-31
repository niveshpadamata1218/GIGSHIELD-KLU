import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useDashboardStore } from '../../store/dashboardStore'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ActivityBarChart from '../../components/charts/ActivityBarChart'
import { formatCurrency, formatDate } from '../../utils/formatters'

function Overview() {
  const { user, updateUserPlan, activateUserPlan } = useAuthStore()
  const { policy, claims = [], gigScore = 0, weeklyActivity = [], risk = {}, totalPayouts = 0 } = useDashboardStore()
  const [showChangePlanModal, setShowChangePlanModal] = useState(false)
  const [showActivatePlanModal, setShowActivatePlanModal] = useState(false)
  const [paymentAgreed, setPaymentAgreed] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(user?.plan || 'Urban Plan')
  const [isLoading, setIsLoading] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(null)
  const [showPaymentStep, setShowPaymentStep] = useState(false)

  const recentClaims = (claims || []).slice(0, 3)

  // For newly registered users without policy history, show registration details
  const hasPolicy = policy && policy.plan
  const isNewUser = user && !hasPolicy

  const planAmount = user?.plan === 'Urban Plan' ? 200 : 300

  const handleChangePlanSubmit = async () => {
    if (selectedPlan === user?.plan) {
      setShowChangePlanModal(false)
      return
    }
    
    setIsLoading(true)
    const result = await updateUserPlan(selectedPlan)
    setIsLoading(false)
    
    if (result.success) {
      setShowChangePlanModal(false)
      console.log('Plan changed successfully')
    } else {
      console.error('Failed to change plan:', result.message)
    }
  }

  const handleActivatePlanSubmit = async () => {
    if (!paymentAgreed) return
    
    // Move to payment step
    setShowPaymentStep(true)
  }

  const handleProcessPayment = async (success) => {
    if (!paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) !== planAmount) {
      alert(`Please enter correct amount: ₹${planAmount}`)
      return
    }

    setIsLoading(true)
    
    // Simulate payment processing
    setTimeout(async () => {
      if (success) {
        setPaymentSuccess(true)
        
        // Record payment transaction
        const { recordTransaction } = useAuthStore.getState()
        recordTransaction({
          phone: user?.phone,
          type: 'plan_payment',
          amount: parseFloat(paymentAmount),
          plan: user?.plan,
          date: new Date().toISOString(),
          status: 'success',
          description: `${user?.plan} Premium Payment`
        })
        
        // Activate plan after successful payment
        const result = await activateUserPlan()
        if (result.success) {
          console.log('Payment successful & plan activated!')
          // Reset and close after 2 seconds
          setTimeout(() => {
            setShowActivatePlanModal(false)
            setShowPaymentStep(false)
            setPaymentAgreed(false)
            setPaymentAmount('')
            setPaymentSuccess(null)
          }, 2000)
        }
      } else {
        setPaymentSuccess(false)
        
        // Record failed transaction
        const { recordTransaction } = useAuthStore.getState()
        recordTransaction({
          phone: user?.phone,
          type: 'plan_payment',
          amount: parseFloat(paymentAmount),
          plan: user?.plan,
          date: new Date().toISOString(),
          status: 'failed',
          description: `${user?.plan} Payment Failed`
        })
        
        // Keep modal open for retry
      }
      
      setIsLoading(false)
    }, 1500)
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
        <h1 className="font-display text-2xl font-semibold text-gs-text">Overview</h1>
        <p className="text-sm text-gs-muted">
          {user?.name || 'Ravi Kumar'} | {user?.plan || 'Urban Plan'} | {user?.city || 'Hyderabad'}
        </p>
      </div>

      {/* User Profile Card */}
      {isNewUser && (
        <div className="gs-card px-6 py-5">
          <h2 className="text-sm font-semibold text-gs-text mb-4">Your Profile</h2>
          <div className="grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gs-muted">Full Name:</span>
              <span className="text-gs-text font-medium">{user?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-t border-gs-border pt-3">
              <span className="text-gs-muted">Phone:</span>
              <span className="text-gs-text font-medium">{user?.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-t border-gs-border pt-3">
              <span className="text-gs-muted">City:</span>
              <span className="text-gs-text font-medium">{user?.city || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-t border-gs-border pt-3">
              <span className="text-gs-muted">Delivery Platform:</span>
              <span className="text-gs-text font-medium">{user?.platform || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-t border-gs-border pt-3">
              <span className="text-gs-muted">Partner ID:</span>
              <span className="text-gs-text font-medium font-mono">{user?.partnerId || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-t border-gs-border pt-3">
              <span className="text-gs-muted">Experience:</span>
              <span className="text-gs-text font-medium">{user?.experience || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Plan Selection Card */}
      <div className="gs-card px-6 py-5 border-l-4 border-l-gs-electric">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-gs-text">Plan Selection</h2>
            <p className="text-xs text-gs-muted mt-1">Current selection status</p>
          </div>
          <Badge
            status={user?.planActivated ? 'paid' : 'pending'}
            label={user?.planActivated ? 'ACTIVATED' : 'SELECTED - Not Activated'}
          />
        </div>
        <div className="grid gap-3 text-sm">
          <div>
            <div className="text-gs-muted text-xs mb-1">Selected Plan</div>
            <div className="text-gs-text font-semibold">{user?.plan || 'Urban Plan'}</div>
          </div>
          {user?.planActivated && (
            <div className="border-t border-gs-border pt-3">
              <div className="text-gs-muted text-xs mb-1">Activated On</div>
              <div className="text-gs-text font-semibold">{user?.planActivationDate || 'N/A'}</div>
            </div>
          )}
          <div className="border-t border-gs-border pt-3 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowChangePlanModal(true)}
              className="flex-1"
            >
              Change Plan
            </Button>
            {!user?.planActivated && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowActivatePlanModal(true)}
                className="flex-1"
              >
                Activate Plan
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Activation Modal */}
      {showActivatePlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="gs-card p-6 max-w-md mx-4 max-h-[90vh] overflow-y-auto"
          >
            {!showPaymentStep ? (
              <>
                <h3 className="text-lg font-semibold text-gs-text mb-4">Activate Plan</h3>
                
                <div className="bg-gs-warning/10 border border-gs-warning rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <div className="text-gs-warning text-xl">⚠️</div>
                    <div>
                      <div className="text-sm font-semibold text-gs-text">Payment Authorization</div>
                      <div className="text-xs text-gs-muted mt-1">
                        Activation will process payment of ₹{planAmount}/week covering ₹{user?.plan === 'Urban Plan' ? '1000' : '1500'}/day
                      </div>
                    </div>
                  </div>
                </div>

                <label className="flex items-start gap-3 mb-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={paymentAgreed}
                    onChange={(e) => setPaymentAgreed(e.target.checked)}
                    className="mt-1 rounded border-gs-border"
                  />
                  <span className="text-sm text-gs-text">
                    I agree and understand that this will initiate payment of ₹{planAmount}/week
                  </span>
                </label>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowActivatePlanModal(false)
                      setPaymentAgreed(false)
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    disabled={!paymentAgreed}
                    onClick={handleActivatePlanSubmit}
                    className="flex-1"
                  >
                    Proceed to Payment
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gs-text mb-4">Payment Processing</h3>
                
                {paymentSuccess === null ? (
                  <>
                    <div className="bg-gs-surface-2 rounded-lg p-4 mb-6">
                      <div className="text-xs text-gs-muted mb-2">Plan Amount</div>
                      <div className="text-2xl font-bold text-gs-electric">₹{planAmount}</div>
                      <div className="text-xs text-gs-muted mt-1">{user?.plan} - Weekly Payment</div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gs-text mb-2">
                        Enter Amount to Pay
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gs-text font-semibold">₹</span>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          placeholder={planAmount.toString()}
                          className="w-full pl-8 pr-4 py-2 rounded-lg border border-gs-border bg-gs-surface text-gs-text placeholder-gs-muted focus:outline-none focus:border-gs-electric"
                        />
                      </div>
                      <div className="text-xs text-gs-muted mt-2">
                        Must match plan amount: ₹{planAmount}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="secondary"
                        disabled={isLoading}
                        onClick={() => handleProcessPayment(false)}
                        className="flex-1 bg-gs-danger text-white hover:opacity-90"
                      >
                        {isLoading ? 'Processing...' : 'Fail Payment'}
                      </Button>
                      <Button
                        variant="primary"
                        disabled={isLoading || !paymentAmount}
                        onClick={() => handleProcessPayment(true)}
                        className="flex-1"
                      >
                        {isLoading ? 'Processing...' : 'Complete Payment'}
                      </Button>
                    </div>
                  </>
                ) : paymentSuccess ? (
                  <>
                    <div className="text-center py-8">
                      <div className="text-5xl mb-4">✅</div>
                      <div className="text-lg font-semibold text-gs-success mb-2">Payment Successful!</div>
                      <div className="text-sm text-gs-muted mb-6">Your plan has been activated</div>
                      <div className="bg-gs-surface-2 rounded-lg p-4">
                        <div className="text-xs text-gs-muted mb-1">Transaction Amount</div>
                        <div className="text-xl font-bold text-gs-electric">₹{paymentAmount}</div>
                        <div className="text-xs text-gs-muted mt-2">Status: Completed</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center py-8">
                      <div className="text-5xl mb-4">❌</div>
                      <div className="text-lg font-semibold text-gs-danger mb-2">Payment Failed</div>
                      <div className="text-sm text-gs-muted mb-6">Your payment could not be processed</div>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setPaymentSuccess(null)
                          setPaymentAmount('')
                        }}
                        className="w-full"
                      >
                        Try Again
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Change Plan Modal */}
      {showChangePlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="gs-card p-6 max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gs-text mb-4">Select Plan</h3>
            
            <div className="space-y-3 mb-6">
              {[
                { name: 'Urban Plan', price: '₹200/week', coverage: '₹1000/day', current: selectedPlan === 'Urban Plan' },
                { name: 'Premium Plan', price: '₹300/week', coverage: '₹1500/day', current: selectedPlan === 'Premium Plan' },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                    plan.current
                      ? 'border-gs-electric bg-gs-surface-2'
                      : 'border-gs-border hover:border-gs-electric'
                  }`}
                  onClick={() => setSelectedPlan(plan.name)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gs-text">{plan.name}</div>
                      <div className="text-xs text-gs-muted mt-1">{plan.coverage}</div>
                    </div>
                    <div className="text-sm font-semibold text-gs-electric">{plan.price}</div>
                  </div>
                  {plan.current && <div className="text-xs text-gs-electric mt-2">✓ Current Selection</div>}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowChangePlanModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={isLoading || selectedPlan === user?.plan}
                onClick={handleChangePlanSubmit}
                className="flex-1"
              >
                {isLoading ? 'Updating...' : 'Update Plan'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stats Cards - Show only if user has a policy */}
      {hasPolicy && (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Active policy"
              value={policy?.plan || 'Urban Plan'}
              color="text-gs-electric"
              sublabel={`Valid until ${formatDate(policy?.validUntil)}`}
            />
            <StatCard label="Gig Score" value={gigScore} color="text-gs-gold" />
            <StatCard
              label="This week's coverage"
              value={policy ? `Rs ${policy.coverage}/day` : '--'}
              color="text-gs-success"
            />
            <StatCard
              label="Total payouts received"
              value={formatCurrency(totalPayouts)}
              color="text-gs-text"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="gs-card px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gs-text">Recent claims</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-[0.08em] text-gs-muted">
                    <tr>
                      <th className="py-2">Date</th>
                      <th className="py-2">Disruption</th>
                      <th className="py-2">Amount</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentClaims.map((claim) => (
                      <tr key={claim.id} className="border-t border-gs-border text-sm text-gs-text hover:bg-gs-surface-2">
                        <td className="py-3">{formatDate(claim.date)}</td>
                        <td className="py-3">{claim.disruption}</td>
                        <td className="py-3 font-mono">{formatCurrency(claim.payout || claim.calculated)}</td>
                        <td className="py-3">
                          <Badge
                            status={claim.status === 'paid' ? 'paid' : claim.status === 'pending' ? 'pending' : 'fraud'}
                            label={claim.status.replace('_', ' ')}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="gs-card px-6 py-5">
              <div className="text-sm font-semibold text-gs-text">Zone risk status</div>
              <div className="mt-2 text-xs text-gs-muted">Hyderabad | Hitech City</div>
              <div className="mt-4 space-y-4">
                {[
                  {
                    label: 'Weather risk',
                    value: risk?.weather || 'Low',
                    color: risk?.weather === 'High' ? 'bg-gs-danger' : 'bg-gs-success'
                  },
                  {
                    label: 'AQI level',
                    value: risk?.aqi || 'Moderate',
                    color: risk?.aqi === 'High' ? 'bg-gs-danger' : 'bg-gs-warning'
                  },
                  {
                    label: 'Alert status',
                    value: risk?.alerts || 'Clear',
                    color: risk?.alerts === 'Active' ? 'bg-gs-danger' : 'bg-gs-success'
                  }
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gs-muted">
                      <span>{item.label}</span>
                      <span className="text-gs-text">{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gs-surface-2">
                      <div className={`h-2 w-2/3 rounded-full ${item.color}`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-gs-success">
                No active disruption
              </div>
            </div>
          </div>

          <div className="gs-card px-6 py-5">
            <div className="mb-4 text-sm font-semibold text-gs-text">Work activity this week</div>
            <ActivityBarChart data={weeklyActivity} />
          </div>
        </>
      )}
    </motion.div>
  )
}

export default Overview

