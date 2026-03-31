import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useDashboardStore } from '../../store/dashboardStore'
import { useAuthStore } from '../../store/authStore'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import ActivityBarChart from '../../components/charts/ActivityBarChart'
import PlansSection from '../../components/ui/PlansSection'
import NoPlanBanner from '../../components/ui/NoPlanBanner'
import ActivePolicyCard from '../../components/ui/ActivePolicyCard'
import { formatCurrency } from '../../utils/formatters'

function Overview() {
  const { user } = useAuthStore()
  const {
    policy,
    claims = [],
    gigScore = 0,
    weeklyActivity = [],
    risk = {},
    totalPayouts = 0,
    detectLocationAndGeneratePlans,
    selectPlan,
    availablePlans,
    activePlan,
    city,
    areaType,
    riskScore,
    locationLoading,
    planActivating
  } = useDashboardStore()

  const [showPlansSection, setShowPlansSection] = useState(false)
  const [selectedLoadingPlanId, setSelectedLoadingPlanId] = useState(null)

  // Initialize location detection on mount
  useEffect(() => {
    const initializeLocation = async () => {
      const result = await detectLocationAndGeneratePlans()
      if (!activePlan && result.success) {
        // Check if user has a plan, if not show plans section
        setShowPlansSection(!activePlan)
      }
    }
    initializeLocation()
  }, [])

  const handlePlanSelection = async (plan) => {
    setSelectedLoadingPlanId(plan.id)
    try {
      const result = await selectPlan(plan)
      if (result.success) {
        // Plan activated successfully
        setShowPlansSection(false)
        setTimeout(() => setSelectedLoadingPlanId(null), 1000)
      } else {
        console.error('Failed to activate plan:', result.message)
        setSelectedLoadingPlanId(null)
      }
    } catch (error) {
      console.error('Error in plan selection:', error)
      setSelectedLoadingPlanId(null)
    }
  }

  const recentClaims = (claims || []).slice(0, 3)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col gap-8"
    >
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-gs-text">Dashboard</h1>
        <p className="text-sm text-gs-muted">
          {activePlan
            ? `${activePlan.name} Plan Active • Protected in ${city}`
            : `Welcome back, ${user?.name || 'Worker'}!`}
        </p>
      </div>

      {/* No Plan Banner - Show if no active plan */}
      {!activePlan && !locationLoading && (
        <NoPlanBanner onSelectPlan={() => setShowPlansSection(true)} />
      )}

      {/* Active Policy Card - Show if plan is active */}
      {activePlan && (
        <ActivePolicyCard
          plan={activePlan}
          city={city}
          activatedAt={activePlan.activatedAt}
          nextRenewal={activePlan.nextRenewal}
          riskScore={riskScore}
        />
      )}

      {/* Plans Section - Show when user clicks "Choose Plan" or loads with no plan */}
      {showPlansSection && availablePlans.length > 0 && (
        <PlansSection
          plans={availablePlans}
          areaType={areaType}
          city={city}
          state={city}
          riskScore={riskScore}
          onPlanSelected={handlePlanSelection}
          loadingPlanId={selectedLoadingPlanId}
        />
      )}

      {/* Stats Grid - Only show if have active plan */}
      {activePlan && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Gig Score"
              value={gigScore.toFixed(1)}
              icon="📊"
              subtext="Your consistency score"
            />
            <StatCard
              title="Total Payouts"
              value={`₹${totalPayouts}`}
              icon="💰"
              subtext="Claimed this month"
            />
            <StatCard
              title="Active Coverage"
              value={`₹${activePlan.dailyCoverage}/day`}
              icon="🛡️"
              subtext={activePlan.name} plan
            />
          </div>

          {/* Activity Chart */}
          {weeklyActivity && weeklyActivity.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gs-text mb-4">Weekly Activity</h3>
              <ActivityBarChart data={weeklyActivity} />
            </Card>
          )}

          {/* Recent Claims */}
          {recentClaims.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gs-text mb-4">Recent Payouts</h3>
              <div className="space-y-3">
                {recentClaims.map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-3 bg-gs-surface rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gs-text">{claim.disruption}</div>
                      <div className="text-xs text-gs-muted">
                        {new Date(claim.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gs-electric">₹{claim.payout}</div>
                      <Badge
                        status={claim.status === 'paid' ? 'paid' : 'pending'}
                        label={claim.status.toUpperCase()}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Risk Status */}
          {risk && Object.keys(risk).length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gs-text mb-4">Zone Risk Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(risk).map(([key, value]) => (
                  <div key={key} className="p-4 bg-gs-surface rounded-lg">
                    <div className="text-sm text-gs-muted capitalize mb-2">{key}</div>
                    <div className="text-lg font-semibold text-gs-text">{value}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Loading State */}
      {locationLoading && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-center py-12"
        >
          <div className="text-4xl mb-4">🌍</div>
          <div className="text-sm font-semibold text-gs-text">Detecting your location...</div>
          <div className="text-xs text-gs-muted mt-2">Generating personalized plans for your area</div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default Overview
