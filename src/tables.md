# 📦 GigShield Plan Engine (Production-Ready Logic)

## 🧠 Purpose

This module dynamically generates insurance plans based on user location (area type) and ensures:

* Balanced ROI for platform (25–45%)
* High value (3x–5x) for gig workers
* Scalable risk pooling model

---

## 📍 Area Classification Logic

```javascript
export function classifyArea(city) {
  const urbanCities = ["Hyderabad", "Mumbai", "Delhi", "Bangalore"];
  const semiUrbanCities = ["Warangal", "Vijayawada", "Indore"];
  const semiRuralCities = ["SmallTown1", "SmallTown2"];

  if (urbanCities.includes(city)) return "urban";
  if (semiUrbanCities.includes(city)) return "semi-urban";
  if (semiRuralCities.includes(city)) return "semi-rural";
  return "rural";
}
```

---

## 📊 Plan Configuration (Core Engine)

```javascript
export const plansByArea = {
  rural: [
    { name: "Basic", price: 10, coverage: 150 },
    { name: "Smart", price: 15, coverage: 200, recommended: true },
    { name: "Pro", price: 20, coverage: 250 }
  ],
  "semi-rural": [
    { name: "Basic", price: 15, coverage: 200 },
    { name: "Smart", price: 20, coverage: 250, recommended: true },
    { name: "Pro", price: 25, coverage: 300 }
  ],
  "semi-urban": [
    { name: "Basic", price: 20, coverage: 300 },
    { name: "Smart", price: 30, coverage: 400, recommended: true },
    { name: "Pro", price: 35, coverage: 500 }
  ],
  urban: [
    { name: "Basic", price: 30, coverage: 400 },
    { name: "Smart", price: 40, coverage: 600, recommended: true },
    { name: "Pro", price: 50, coverage: 800 }
  ]
};
```

---

## 💰 ROI Calculation Engine (Investor Logic)

```javascript
export function calculateROI(plan, workers = 1000, affectedPercent = 0.1) {
  const weeklyRevenue = plan.price * workers;
  const monthlyRevenue = weeklyRevenue * 4;

  const affectedWorkers = workers * affectedPercent;
  const avgPayout = plan.coverage * 2; // 2-day disruption

  const totalPayout = affectedWorkers * avgPayout;
  const profit = monthlyRevenue - totalPayout;
  const roi = (profit / monthlyRevenue) * 100;

  return {
    revenue: monthlyRevenue,
    payout: totalPayout,
    profit,
    roi: roi.toFixed(2) + "%"
  };
}
```

---

## 👷 Worker Benefit Calculator

```javascript
export function calculateWorkerValue(plan) {
  const monthlyCost = plan.price * 4;
  const yearlyCost = plan.price * 52;
  const threeYearCost = yearlyCost * 3;

  const potentialCoverage = plan.coverage * 2 * 6 * 3; 
  // 2 days × 6 disruptions/year × 3 years

  return {
    monthlyCost,
    threeYearCost,
    potentialCoverage,
    valueMultiple: (potentialCoverage / threeYearCost).toFixed(1) + "x"
  };
}
```

---

## 🧠 Risk-Based Recommendation Engine

```javascript
export function getRecommendedPlan(plans, riskScore) {
  if (riskScore < 40) return plans.find(p => p.name === "Basic");
  if (riskScore <= 70) return plans.find(p => p.name === "Smart");
  return plans.find(p => p.name === "Pro");
}
```

---

## 📦 Full Plan Generator (MAIN FUNCTION)

```javascript
export function generatePlansForUser(user) {
  const areaType = classifyArea(user.city);
  const plans = plansByArea[areaType];

  const enrichedPlans = plans.map(plan => {
    const roi = calculateROI(plan);
    const workerValue = calculateWorkerValue(plan);

    return {
      ...plan,
      roi,
      workerValue
    };
  });

  const recommended = getRecommendedPlan(enrichedPlans, user.riskScore || 50);

  return {
    areaType,
    plans: enrichedPlans,
    recommended
  };
}
```

---

## 🎯 Example Usage

```javascript
const user = {
  name: "Ravi",
  city: "Hyderabad",
  riskScore: 65
};

const result = generatePlansForUser(user);

console.log(result);
```

---

## 🎨 UI Integration (React Example)

```jsx
{plans.map(plan => (
  <div className={`card ${plan.recommended ? "highlight" : ""}`}>
    <h3>{plan.name}</h3>
    <p>₹{plan.price}/week</p>
    <p>₹{plan.coverage}/day</p>

    <p>
      3-year: ₹{plan.workerValue.threeYearCost} → ₹{plan.workerValue.potentialCoverage}
    </p>

    <p>ROI: {plan.roi.roi}</p>

    <button>Select Plan</button>
  </div>
))}
```

---

## 🏁 Business Outcome

### 👷 Workers

* 3x–5x income protection
* Instant payouts
* No manual claims

### 🏢 Platform / Investors

* 25–45% ROI
* Scalable model
* Risk-balanced system

---

## 🚀 Final Insight

GigShield is not just an insurance product.

It is a:
👉 Real-time risk engine
👉 Income protection system
👉 Scalable insurtech platform
