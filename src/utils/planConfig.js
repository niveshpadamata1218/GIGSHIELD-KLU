import { classifyArea } from './areaClassification'

/**
 * Core plan table used for location-driven plan generation.
 */
export const plansByArea = {
  rural: [
    { name: 'Basic', price: 10, coverage: 150 },
    { name: 'Smart', price: 15, coverage: 200, recommended: true },
    { name: 'Pro', price: 20, coverage: 250 }
  ],
  'semi-rural': [
    { name: 'Basic', price: 15, coverage: 200 },
    { name: 'Smart', price: 20, coverage: 250, recommended: true },
    { name: 'Pro', price: 25, coverage: 300 }
  ],
  'semi-urban': [
    { name: 'Basic', price: 20, coverage: 300 },
    { name: 'Smart', price: 30, coverage: 400, recommended: true },
    { name: 'Pro', price: 35, coverage: 500 }
  ],
  urban: [
    { name: 'Basic', price: 30, coverage: 400 },
    { name: 'Smart', price: 40, coverage: 600, recommended: true },
    { name: 'Pro', price: 50, coverage: 800 }
  ]
}

const getPlanDescription = (name) => {
  if (name === 'Basic') return 'Essential protection for steady work days.'
  if (name === 'Smart') return 'Balanced premium and strong disruption support.'
  return 'Maximum payout depth for high-risk work zones.'
}

const normalizePlan = (areaType, plan) => ({
  id: `${areaType}-${plan.name.toLowerCase()}`,
  name: plan.name,
  price: plan.price,
  coverage: plan.coverage,
  dailyCoverage: plan.coverage,
  description: getPlanDescription(plan.name),
  recommended: Boolean(plan.recommended)
})

/**
 * Compatibility export retained for existing usage.
 */
export const PLAN_CONFIG = Object.entries(plansByArea).reduce((acc, [areaType, plans]) => {
  acc[areaType] = {
    areaType,
    plans: plans.map((plan) => normalizePlan(areaType, plan))
  }
  return acc
}, {})

/**
 * Get base plans for an area type.
 */
export const getPlansByAreaType = (areaType) => {
  const selectedArea = plansByArea[areaType] ? areaType : 'urban'
  return plansByArea[selectedArea].map((plan) => normalizePlan(selectedArea, plan))
}

/**
 * Investor ROI model.
 */
export const calculateROI = (plan, workers = 1000, affectedPercent = 0.1) => {
  const coverage = plan.coverage ?? plan.dailyCoverage
  const weeklyRevenue = plan.price * workers
  const monthlyRevenue = weeklyRevenue * 4
  const affectedWorkers = workers * affectedPercent
  const avgPayout = coverage * 2
  const totalPayout = affectedWorkers * avgPayout
  const profit = monthlyRevenue - totalPayout
  const roi = monthlyRevenue > 0 ? (profit / monthlyRevenue) * 100 : 0

  return {
    revenue: Math.round(monthlyRevenue),
    payout: Math.round(totalPayout),
    profit: Math.round(profit),
    roi: `${roi.toFixed(2)}%`
  }
}

/**
 * Worker value model.
 */
export const calculateWorkerValue = (plan) => {
  const coverage = plan.coverage ?? plan.dailyCoverage
  const monthlyCost = plan.price * 4
  const yearlyCost = plan.price * 52
  const threeYearCost = yearlyCost * 3
  const potentialCoverage = coverage * 2 * 6 * 3
  const valueMultiple = threeYearCost > 0 ? potentialCoverage / threeYearCost : 0

  return {
    monthlyCost,
    threeYearCost,
    potentialCoverage,
    valueMultiple: `${valueMultiple.toFixed(1)}x`
  }
}

/**
 * Get recommended plan by risk. Supports either array input or area type.
 */
export const getRecommendedPlan = (plansOrAreaType, riskScore = 50) => {
  const plans = Array.isArray(plansOrAreaType)
    ? plansOrAreaType
    : getPlansByAreaType(plansOrAreaType)

  if (!plans || plans.length === 0) return null

  if (riskScore < 40) return plans.find((plan) => plan.name === 'Basic') || plans[0]
  if (riskScore <= 70) return plans.find((plan) => plan.name === 'Smart') || plans[1] || plans[0]
  return plans.find((plan) => plan.name === 'Pro') || plans[plans.length - 1]
}

/**
 * Calculate periodic plan costs.
 */
export const calculatePlanCosts = (weeklyPrice) => {
  const monthly = weeklyPrice * 4.33
  const yearly = weeklyPrice * 52
  const threeYearly = yearly * 3

  return {
    weekly: weeklyPrice,
    monthly: Math.round(monthly),
    yearly: Math.round(yearly),
    threeYearly: Math.round(threeYearly)
  }
}

/**
 * Enrich plans with display and business-calculation fields.
 */
export const formatPlanDetails = (plan) => {
  const costs = calculatePlanCosts(plan.price)
  const roi = calculateROI(plan)
  const workerValue = calculateWorkerValue(plan)

  return {
    ...plan,
    costs,
    roi,
    workerValue,
    displayPrice: `₹${plan.price}`,
    displayCoverage: `₹${plan.dailyCoverage}/day`,
    displayMonthly: `₹${costs.monthly}`,
    threeyearSummary: `3-year cost ₹${workerValue.threeYearCost} -> potential protection ₹${workerValue.potentialCoverage}`
  }
}

/**
 * Full location + risk based plan generator.
 */
export const generatePlansForUser = (user) => {
  const areaType = classifyArea(user?.city)
  const basePlans = getPlansByAreaType(areaType)
  const enrichedPlans = basePlans.map((plan) => formatPlanDetails(plan))
  const recommended = getRecommendedPlan(enrichedPlans, user?.riskScore ?? 50)

  return {
    areaType,
    plans: enrichedPlans.map((plan) => ({
      ...plan,
      recommended: recommended ? plan.id === recommended.id : Boolean(plan.recommended)
    })),
    recommended
  }
}

/**
 * Plan selection state template.
 */
export const createPlanSelectionState = () => ({
  selectedPlan: null,
  areaType: 'urban',
  city: '',
  state: '',
  riskScore: 0,
  isLoading: false,
  isActivating: false,
  activatedAt: null,
  nextRenewal: null
})

/**
 * Validate plan object.
 */
export const isValidPlan = (plan) => {
  return (
    plan &&
    typeof plan === 'object' &&
    plan.id &&
    plan.name &&
    typeof plan.price === 'number' &&
    typeof plan.dailyCoverage === 'number'
  )
}
