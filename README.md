# GigShield Frontend

GigShield is a React + Vite single-page application that demonstrates an AI-powered parametric insurance product for gig workers. The experience focuses on automated protection, zero-touch claims, and real-time disruption monitoring for both workers and admins.

## Highlights

- Premium, story-driven landing page with animated hero slideshow
- Fully automated claims flow with transparency timelines and impact cards
- Worker and admin dashboards with protected routes
- Parametric risk triggers (weather, AQI, curfew) simulated in UI
- Reusable UI system with motion, charts, and validation
- Hash-based routing for stable refresh and deep links

## Pages

- Landing
- Worker: Login, Register (multi-step), Overview, Policy, Work Tracker, Gig Score, Claims, Alerts
- Admin: Login, Overview, Disruptions, Claims, Fraud Detection, Worker Registry

## Tech Stack

- React 18 + Vite
- React Router (HashRouter)
- Tailwind CSS + PostCSS
- Framer Motion
- Zustand
- React Hook Form + Zod
- Recharts
- Axios + mock API adapter
- React Hot Toast

## Getting Started

1) Install dependencies

```bash
npm install
```

2) Start the dev server

```bash
npm run dev
```

3) Build for production

```bash
npm run build
```

4) Preview the production build

```bash
npm run preview
```

## Project Structure

```
src/
  api/             # Axios client + mock endpoints
  assets/          # Hero images and UI assets
  components/      # Reusable UI components
  data/            # Demo data fixtures
  hooks/           # Custom hooks
  layouts/         # Worker/Admin layout shells
  pages/           # App screens (landing, worker, admin)
  store/           # Zustand stores
  utils/           # Validation, formatters, calculators
```

## Demo Behavior

- Auth is simulated with a mocked API layer and local persistence.
- Claims are auto-triggered and do not require manual submission.
- The app uses HashRouter to avoid blank screens on refresh.

## Image Assets

The landing slideshow uses two local assets:

- src/assets/hero-slide-new-1.jpg
- src/assets/hero-slide-new-2.jpg

If you replace them, keep the same filenames or update imports in src/pages/Landing.jsx.

## Notes

- The admin overview contains a data-driven presence map built from static zone data.
- Reduced-motion preferences are respected across landing animations.
