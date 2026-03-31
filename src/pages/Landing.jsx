import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/ui/Navbar'
import heroSlideNew1 from '../assets/hero-slide-new-1.jpg'
import heroSlideNew2 from '../assets/hero-slide-new-2.jpg'

const reveal = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05
    }
  }
}

const steps = [
  {
    title: 'Register',
    text: 'Create your worker profile and activate your weekly coverage.'
  },
  {
    title: 'Work normally',
    text: 'Keep delivering as usual while GigShield monitors risk events.'
  },
  {
    title: 'Disruption detected',
    text: 'Weather, AQI, and city alerts are validated in real time.'
  },
  {
    title: 'Get paid instantly',
    text: 'Payout is credited automatically with no claim form required.'
  }
]

const features = [
  {
    title: 'Zero-touch claims',
    text: 'No manual forms. The system verifies disruption and starts payout instantly.',
    iconBg: 'from-sky-400 to-cyan-300',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 12l4 4 8-8" />
      </svg>
    )
  },
  {
    title: 'AI pricing',
    text: 'Risk-aware pricing adapts to worker patterns and zone disruption trends.',
    iconBg: 'from-teal-400 to-emerald-300',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3v18M3 12h18" />
        <circle cx="12" cy="12" r="8" />
      </svg>
    )
  },
  {
    title: 'Fraud detection',
    text: 'Behavioral checks and anomaly scoring protect the pool from misuse.',
    iconBg: 'from-orange-400 to-amber-300',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4z" />
      </svg>
    )
  },
  {
    title: 'Gig Score',
    text: 'Consistency, movement quality, and delivery patterns improve your trust tier.',
    iconBg: 'from-indigo-400 to-sky-300',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19h16M7 16l3-4 3 2 4-6" />
      </svg>
    )
  },
  {
    title: 'Instant payout',
    text: 'Funds are sent to linked accounts as soon as disruption rules are matched.',
    iconBg: 'from-cyan-500 to-blue-300',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M3 10h18" />
      </svg>
    )
  }
]

const heroFallback = heroSlideNew1

const heroImages = [
  {
    src: heroSlideNew1,
    alt: 'Gig workers on duty'
  },
  {
    src: heroSlideNew2,
    alt: 'Family support scene'
  }
]

const climateFeed = [
  { city: 'Hyderabad', aqi: 148, weather: 'Heavy rain alert', risk: 'High' },
  { city: 'Bengaluru', aqi: 118, weather: 'Thunderstorm watch', risk: 'Medium' },
  { city: 'Delhi NCR', aqi: 204, weather: 'Severe AQI spike', risk: 'High' },
  { city: 'Pune', aqi: 96, weather: 'Wind advisory', risk: 'Low' }
]

const kineticPhrases = ['during disruptions.', 'during sudden weather shocks.', 'when cities pause work.']

function SectionReveal({ className = '', children, shouldReduceMotion = false, ...props }) {
  return (
    <motion.section
      variants={shouldReduceMotion ? undefined : reveal}
      initial={shouldReduceMotion ? false : 'hidden'}
      whileInView={shouldReduceMotion ? undefined : 'show'}
      viewport={{ once: true, amount: 0.2 }}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  )
}

function SectionDivider({ shouldReduceMotion = false }) {
  return (
    <div className="pointer-events-none px-6 py-2">
      <div className="relative mx-auto h-14 w-full max-w-6xl overflow-hidden rounded-2xl bg-gradient-to-r from-sky-100/60 via-white to-orange-100/60">
        <svg viewBox="0 0 1440 120" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <path
            d="M0,68 C180,108 340,8 520,48 C700,88 880,116 1080,72 C1240,36 1330,30 1440,56"
            fill="none"
            stroke="rgba(14,165,233,0.35)"
            strokeWidth="3"
          />
          <path
            d="M0,84 C220,50 420,118 620,78 C860,30 1060,104 1440,64"
            fill="none"
            stroke="rgba(20,184,166,0.25)"
            strokeWidth="2"
          />
        </svg>
        <motion.div
          animate={shouldReduceMotion ? undefined : { x: ['0%', '92%'] }}
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }
          }
          className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-gradient-to-br from-sky-500 to-teal-400 shadow-[0_0_0_8px_rgba(14,165,233,0.12)]"
        />
      </div>
    </div>
  )
}

function Landing() {
  const shouldReduceMotion = useReducedMotion()
  const [activeSlide, setActiveSlide] = useState(0)
  const [feedIndex, setFeedIndex] = useState(0)
  const [taglineIndex, setTaglineIndex] = useState(0)
  const [loadedSlides, setLoadedSlides] = useState({})
  const [failedSlides, setFailedSlides] = useState({})
  const heroRef = useRef(null)

  const { scrollY } = useScroll()
  const heroMediaY = useTransform(scrollY, [0, 700], shouldReduceMotion ? [0, 0] : [0, 38])

  const availableSlides = useMemo(
    () => heroImages.filter((slide) => !failedSlides[slide.src]),
    [failedSlides]
  )

  const currentSlide = useMemo(() => {
    if (!availableSlides.length) {
      return { src: heroFallback, alt: 'Fallback protection image' }
    }
    return availableSlides[activeSlide % availableSlides.length]
  }, [activeSlide, availableSlides])

  const activeFeed = climateFeed[feedIndex % climateFeed.length]

  useEffect(() => {
    heroImages.forEach((slide) => {
      const img = new Image()
      img.src = slide.src
      img.onload = () => {
        setLoadedSlides((prev) => ({ ...prev, [slide.src]: true }))
      }
      img.onerror = () => {
        setFailedSlides((prev) => ({ ...prev, [slide.src]: true }))
      }
    })
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setActiveSlide((prev) => prev + 1)
    }, 4000)

    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (shouldReduceMotion) {
      return undefined
    }
    const id = setInterval(() => {
      setFeedIndex((prev) => prev + 1)
    }, 3200)

    return () => clearInterval(id)
  }, [shouldReduceMotion])

  useEffect(() => {
    if (shouldReduceMotion) {
      return undefined
    }
    const id = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % kineticPhrases.length)
    }, 2500)

    return () => clearInterval(id)
  }, [shouldReduceMotion])

  const jumpToHowItWorks = () => {
    const section = document.getElementById('how-it-works')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,rgba(125,211,252,0.2),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.16),transparent_35%),linear-gradient(180deg,#f8fbff_0%,#f5f9ff_50%,#ffffff_100%)]">
      <Navbar />

      <section
        ref={heroRef}
        className="relative min-h-[92vh] w-full overflow-hidden px-6 pb-14 pt-16 md:pt-20"
      >
        <motion.div
          animate={shouldReduceMotion ? undefined : { y: [0, 14, 0], x: [0, -8, 0] }}
          transition={shouldReduceMotion ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl"
        />
        <motion.div
          animate={shouldReduceMotion ? undefined : { y: [0, -16, 0], x: [0, 8, 0] }}
          transition={shouldReduceMotion ? undefined : { duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -right-14 top-12 h-72 w-72 rounded-full bg-teal-200/35 blur-3xl"
        />

        <div className="pointer-events-none absolute inset-0 -z-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={currentSlide.src}
              src={currentSlide.src}
              alt={currentSlide.alt}
              className="absolute inset-0 h-full w-full object-cover blur-[2px]"
              loading="eager"
              decoding="async"
              onLoad={() => {
                setLoadedSlides((prev) => ({ ...prev, [currentSlide.src]: true }))
              }}
              onError={() => {
                setFailedSlides((prev) => ({ ...prev, [currentSlide.src]: true }))
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.26 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.9, ease: 'easeOut' }}
            />
          </AnimatePresence>
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0.4))'
            }}
          />
        </div>

        <motion.div
          variants={shouldReduceMotion ? undefined : staggerContainer}
          initial={shouldReduceMotion ? false : 'hidden'}
          animate={shouldReduceMotion ? undefined : 'show'}
          className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14"
        >
          <motion.div variants={shouldReduceMotion ? undefined : reveal} className="flex flex-col gap-6"
          >
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live monitoring active
            </span>

            <div className="space-y-4">
              <h1 className="font-display text-4xl font-extrabold leading-[1.02] text-slate-900 sm:text-5xl md:text-7xl">
                <span className="block">Protect your income.</span>
                <span className="block bg-gradient-to-r from-sky-700 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  Secure your future.
                </span>
              </h1>
              <div className="max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
                <span>
                  AI-powered insurance that automatically protects gig workers from income loss
                </span>{' '}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={kineticPhrases[taglineIndex]}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
                    className="inline-block font-semibold text-cyan-700"
                  >
                    {kineticPhrases[taglineIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 px-7 py-3 text-sm font-semibold text-white shadow-[0_14px_32px_rgba(14,165,233,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(14,165,233,0.34)]"
              >
                Get Started
              </Link>
              <button
                type="button"
                onClick={jumpToHowItWorks}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-700"
              >
                See How It Works
              </button>
            </div>

            <motion.div
              key={`${activeFeed.city}-${activeFeed.aqi}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
              className="grid max-w-xl grid-cols-1 gap-3 rounded-2xl border border-white/70 bg-white/75 p-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur md:grid-cols-3"
            >
              <div className="rounded-xl bg-slate-50 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                  City
                </div>
                <div className="mt-1 text-sm font-bold text-slate-800">{activeFeed.city}</div>
              </div>
              <div className="rounded-xl bg-sky-50 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
                  AQI Update
                </div>
                <div className="mt-1 text-sm font-bold text-sky-900">{activeFeed.aqi}</div>
              </div>
              <div className="rounded-xl bg-orange-50 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-orange-700">
                  Weather
                </div>
                <div className="mt-1 text-sm font-bold text-orange-900">{activeFeed.weather}</div>
              </div>
              <div className="md:col-span-3 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-emerald-700">
                Risk Level: {activeFeed.risk}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={reveal}
            whileHover={shouldReduceMotion ? undefined : { y: -2 }}
            transition={shouldReduceMotion ? undefined : { type: 'spring', stiffness: 120, damping: 18 }}
            style={{ y: heroMediaY }}
            className="relative h-[360px] overflow-hidden rounded-[28px] border border-white/60 bg-white/60 shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur md:h-[520px]"
          >
            {!loadedSlides[currentSlide.src] ? (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-sky-100 via-cyan-50 to-orange-100" />
            ) : null}

            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={currentSlide.src}
                src={currentSlide.src}
                alt={currentSlide.alt}
                className="absolute inset-0 h-full w-full object-cover"
                  loading="eager"
                decoding="async"
                onLoad={() => {
                  setLoadedSlides((prev) => ({ ...prev, [currentSlide.src]: true }))
                }}
                onError={() => {
                  setFailedSlides((prev) => ({ ...prev, [currentSlide.src]: true }))
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: 'easeOut' }}
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.86),rgba(255,255,255,0.16))]" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/80 bg-white/82 p-4 shadow-md backdrop-blur">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                This week protected earnings
              </div>
              <div className="mt-2 text-2xl font-extrabold text-slate-900">Rs 4,280</div>
              <div className="mt-1 text-sm text-slate-600">
                Auto payout pipeline running across disruption events.
              </div>
            </div>

            <div className="absolute bottom-4 right-4 flex gap-2">
              {heroImages.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  aria-label={`Show slide ${index + 1}`}
                  onClick={() => setActiveSlide(index)}
                  className={`h-2.5 w-2.5 rounded-full transition-all ${
                    index === activeSlide % heroImages.length
                      ? 'bg-sky-600 shadow-[0_0_0_3px_rgba(14,165,233,0.18)]'
                      : 'bg-white/90'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      <SectionDivider shouldReduceMotion={shouldReduceMotion} />

      <SectionReveal shouldReduceMotion={shouldReduceMotion} id="how-it-works" className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
              How it works
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-slate-900 md:text-4xl">
              Protection in four automated steps
            </h2>
            <p className="mt-3 text-slate-600">
              Built for speed, clarity, and trust so workers never chase claims again.
            </p>
          </div>

          <motion.div
            variants={shouldReduceMotion ? undefined : staggerContainer}
            initial={shouldReduceMotion ? false : 'hidden'}
            whileInView={shouldReduceMotion ? undefined : 'show'}
            viewport={{ once: true, amount: 0.2 }}
            className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4"
          >
            {steps.map((step, index) => (
              <motion.div
                variants={shouldReduceMotion ? undefined : reveal}
                key={step.title}
                whileHover={shouldReduceMotion ? undefined : { y: -8, scale: 1.01 }}
                transition={shouldReduceMotion ? undefined : { type: 'spring', stiffness: 280, damping: 20 }}
                className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 text-sm font-bold text-white shadow-sm">
                    {index + 1}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">
                    Step {index + 1}
                  </span>
                </div>
                <div className="mt-5 text-lg font-semibold text-slate-900">{step.title}</div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.text}</p>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className="h-full bg-gradient-to-r from-sky-500 to-teal-400"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(index + 1) * 25}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index, duration: shouldReduceMotion ? 0 : 0.6 }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      <SectionDivider shouldReduceMotion={shouldReduceMotion} />

      <SectionReveal shouldReduceMotion={shouldReduceMotion} className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-700">
              Key features
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-slate-900 md:text-4xl">
              Built like a modern insurance product
            </h2>
            <p className="mt-3 text-slate-600">
              Premium user experience, automated intelligence, and operational trust by default.
            </p>
          </div>

          <motion.div
            variants={shouldReduceMotion ? undefined : staggerContainer}
            initial={shouldReduceMotion ? false : 'hidden'}
            whileInView={shouldReduceMotion ? undefined : 'show'}
            viewport={{ once: true, amount: 0.2 }}
            className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.article
                variants={shouldReduceMotion ? undefined : reveal}
                key={feature.title}
                whileHover={shouldReduceMotion ? undefined : { y: -8 }}
                transition={shouldReduceMotion ? undefined : { type: 'spring', stiffness: 260, damping: 20 }}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
              >
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ${feature.iconBg}`}
                >
                  {feature.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.text}</p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </SectionReveal>

      <section className="px-6 pb-20 pt-4">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 rounded-3xl border border-sky-100 bg-[linear-gradient(120deg,#e0f2fe_0%,#ccfbf1_50%,#ffedd5_100%)] px-8 py-10 shadow-[0_18px_40px_rgba(14,165,233,0.14)] md:flex-row">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sky-700">
              Ready to start
            </div>
            <h3 className="mt-2 font-display text-3xl font-bold text-slate-900">
              The safety net gig workers deserve
            </h3>
            <p className="mt-2 text-slate-600">
              Join GigShield and let automation protect your weekly income.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Get Started
            </Link>
            <button
              type="button"
              onClick={jumpToHowItWorks}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-sky-300 hover:text-sky-700"
            >
              See How It Works
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white/70 px-6 py-10 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 font-display text-lg font-bold text-slate-900">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-sky-500 to-teal-400" />
            GigShield
          </div>
          <div className="text-sm text-slate-500">AI-powered protection for every shift.</div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
