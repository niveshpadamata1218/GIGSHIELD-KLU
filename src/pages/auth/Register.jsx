import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import StepIndicator from '../../components/ui/StepIndicator'
import OTPInput from '../../components/ui/OTPInput'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import {
  getPartnerIdHint,
  passwordSchema,
  stepOneSchema,
  stepTwoSchema
} from '../../utils/validation'
import { useAuthStore } from '../../store/authStore'

/* ─── city → tier mapping ─── */
const cityTierMap = {
  // Metro / Urban cities
  mumbai: 'Urban', delhi: 'Urban', bangalore: 'Urban', bengaluru: 'Urban',
  hyderabad: 'Urban', chennai: 'Urban', kolkata: 'Urban', pune: 'Urban',
  ahmedabad: 'Urban', jaipur: 'Urban', lucknow: 'Urban', surat: 'Urban',
  noida: 'Urban', gurgaon: 'Urban', gurugram: 'Urban', chandigarh: 'Urban',
  kochi: 'Urban', indore: 'Urban', bhopal: 'Urban', nagpur: 'Urban',
  visakhapatnam: 'Urban', coimbatore: 'Urban', thiruvananthapuram: 'Urban',
  // Semi-Urban cities
  mysuru: 'Semi-Urban', mysore: 'Semi-Urban', mangalore: 'Semi-Urban',
  mangaluru: 'Semi-Urban', hubli: 'Semi-Urban', belgaum: 'Semi-Urban',
  belagavi: 'Semi-Urban', vijayawada: 'Semi-Urban', guntur: 'Semi-Urban',
  warangal: 'Semi-Urban', nashik: 'Semi-Urban', aurangabad: 'Semi-Urban',
  rajkot: 'Semi-Urban', vadodara: 'Semi-Urban', jodhpur: 'Semi-Urban',
  udaipur: 'Semi-Urban', agra: 'Semi-Urban', varanasi: 'Semi-Urban',
  dehradun: 'Semi-Urban', ranchi: 'Semi-Urban', raipur: 'Semi-Urban',
  bhubaneswar: 'Semi-Urban', madurai: 'Semi-Urban', tiruchirappalli: 'Semi-Urban',
  salem: 'Semi-Urban', kozhikode: 'Semi-Urban', thrissur: 'Semi-Urban'
}

const getCityTier = (city) => {
  if (!city) return 'Rural'
  const key = city.trim().toLowerCase()
  return cityTierMap[key] || 'Rural'
}

const experienceOptions = ['Less than 1 year', '1-2 years', '2-5 years', '5+ years']

/* ─── Default fallback location (Hyderabad) ─── */
const DEFAULT_LOCATION = { lat: 17.385044, lng: 78.486671, label: 'Hyderabad (default)' }

/* ─── AI verification checklist items ─── */
const verifyChecklist = [
  'Validating partner ID format…',
  'Cross-referencing platform records…',
  'Analyzing uploaded proof document…',
  'Verifying geolocation data…',
  'Checking fraud indicators…',
  'Calculating trust score…'
]

function Register() {
  const navigate = useNavigate()
  const { registerWorker } = useAuthStore()

  /* steps: 1-Personal  2-Partner  3-Location&ID  4-AIVerify  5-OTP  6-Password */
  const [step, setStep] = useState(1)
  const [otpError, setOtpError] = useState(false)
  const [resend, setResend] = useState(30)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  /* Location state */
  const [location, setLocation] = useState(null)
  const [locLoading, setLocLoading] = useState(false)
  const [locError, setLocError] = useState('')

  /* Proof upload */
  const [proofFile, setProofFile] = useState(null)
  const [proofPreview, setProofPreview] = useState(null)
  const [proofError, setProofError] = useState('')
  const proofRef = useRef(null)

  /* AI verification state */
  const [verifyIndex, setVerifyIndex] = useState(0)
  const [trustScore, setTrustScore] = useState(null)

  const form = useForm({
    defaultValues: {
      fullName: '',
      phone: '',
      dob: '',
      city: '',
      platform: 'Zomato',
      partnerId: '',
      experience: '',
      password: '',
      confirmPassword: ''
    }
  })

  const platform = form.watch('platform')
  const password = form.watch('password')
  const city = form.watch('city')
  const cityTier = useMemo(() => getCityTier(city), [city])

  /* ── OTP countdown ── */
  useEffect(() => {
    if (step !== 5 || resend <= 0) return
    const id = setInterval(() => setResend((p) => (p > 0 ? p - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [step, resend])

  /* ── AI verification animation ── */
  useEffect(() => {
    if (step !== 4) return
    setVerifyIndex(0)
    setTrustScore(null)

    let i = 0
    const interval = setInterval(() => {
      i += 1
      if (i < verifyChecklist.length) {
        setVerifyIndex(i)
      } else {
        clearInterval(interval)
        // simulate score between 72-98
        const score = Math.floor(Math.random() * 27) + 72
        setTrustScore(score)
      }
    }, 900)

    return () => clearInterval(interval)
  }, [step])

  /* ── helpers ── */
  const validateStep = (schema) => {
    form.clearErrors()
    const values = form.getValues()
    const result = schema.safeParse(values)
    if (result.success) return true
    result.error.errors.forEach((err) => {
      const field = err.path[0]
      if (field) form.setError(field, { message: err.message })
    })
    return false
  }

  const handleEnableLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(DEFAULT_LOCATION)
      setLocError('Geolocation not supported — using default location.')
      return
    }
    setLocLoading(true)
    setLocError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
        })
        setLocLoading(false)
      },
      () => {
        setLocation(DEFAULT_LOCATION)
        setLocError('Location access denied — using default location.')
        setLocLoading(false)
      },
      { timeout: 8000 }
    )
  }, [])

  const handleProofChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setProofError('File must be under 5 MB.')
      return
    }
    setProofFile(file)
    setProofError('')
    const reader = new FileReader()
    reader.onload = (ev) => setProofPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleNext = () => {
    if (step === 1) {
      if (validateStep(stepOneSchema)) setStep(2)
    } else if (step === 2) {
      if (validateStep(stepTwoSchema(form.getValues('platform')))) setStep(3)
    } else if (step === 3) {
      // validate location + proof
      if (!location) {
        setLocError('Please enable your location to continue.')
        return
      }
      if (!proofFile) {
        setProofError('Please upload proof of your delivery/e-commerce authorization.')
        return
      }
      setStep(4) // go to AI verify
    } else if (step === 4) {
      // After AI verification, go directly to OTP (skip plan)
      setStep(5)
      setResend(30)
      setOtpError(false)
    }
  }

  const handleOtpComplete = async (value) => {
    try {
      // Test OTPs for client-side validation
      const VALID_OTPS = ['123456', '000000', '111111']
      
      if (VALID_OTPS.includes(value)) {
        setOtpError(false)
        setStep(6)
      } else {
        setOtpError(true)
      }
    } catch {
      setOtpError(true)
    }
  }

  const passwordStrength = useMemo(() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8) s += 1
    if (/[A-Z]/.test(password)) s += 1
    if (/[0-9]/.test(password)) s += 1
    if (/[^a-zA-Z0-9]/.test(password)) s += 1
    return s
  }, [password])

  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'][Math.max(passwordStrength - 1, 0)]

  const handleSubmit = async () => {
    console.log('Submit button clicked')
    
    // Validate password
    if (!validateStep(passwordSchema)) {
      console.log('Password validation failed:', form.formState.errors)
      return
    }
    
    console.log('Password validation passed, registering...')
    setLoading(true)
    setError('')
    
    try {
      const payload = {
        fullName: form.getValues('fullName'),
        phone: form.getValues('phone'),
        dob: form.getValues('dob'),
        city: form.getValues('city'),
        cityTier,
        platform: form.getValues('platform'),
        partnerId: form.getValues('partnerId'),
        experience: form.getValues('experience'),
        password: form.getValues('password'),
        location,
        trustScore
      }
      
      console.log('Registration payload:', payload)
      const result = await registerWorker(payload)
      console.log('Registration result:', result)
      
      setLoading(false)
      
      if (!result.success) {
        console.log('Registration failed:', result.message)
        setError(result.message || 'Registration failed')
        return
      }
      
      console.log('Registration successful!')
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    } catch (error) {
      console.error('Registration error:', error)
      setError(error.message || 'An error occurred')
      setLoading(false)
    }
  }

  /* ─── Success screen ─── */
  if (success) {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-6">
        <Link to="/" className="absolute left-6 top-6 flex items-center gap-2 font-display text-xl font-bold text-gs-text transition-opacity hover:opacity-80">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gs-electric to-gs-violet text-xs font-semibold text-white">GS</span>
          GigShield
        </Link>
        <div className="gs-card flex w-full max-w-md flex-col items-center gap-3 px-8 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-200 bg-emerald-50">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <div className="text-xl font-bold text-gs-text">🎉 Registration Successful!</div>
          <div className="text-sm text-gs-muted">Your account has been created successfully.</div>
          <div className="mt-2 text-xs font-semibold text-gs-electric">Redirecting to login page...</div>
        </div>
      </div>
    )
  }

  /* ─── step labels for the indicator ─── */
  const stepLabels = ['Personal', 'Partner', 'Location & ID', 'AI Verify', 'OTP', 'Password']

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <Link to="/" className="absolute left-6 top-6 flex items-center gap-2 font-display text-xl font-bold text-gs-text transition-opacity hover:opacity-80">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gs-electric to-gs-violet text-xs font-semibold text-white">GS</span>
        GigShield
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="gs-card w-full max-w-xl px-8 py-10"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gs-electric to-gs-violet text-sm font-semibold text-white">GS</div>
        </div>
        <StepIndicator currentStep={step} steps={stepLabels} />

        {/* ───────── Step 1 – Personal Info ───────── */}
        {step === 1 && (
          <div className="mt-8 flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gs-text">Tell us about yourself</h2>
              <p className="text-sm text-gs-muted">We keep this private and secure.</p>
            </div>
            <Input label="Full Name" placeholder="Akshith" {...form.register('fullName')} error={form.formState.errors.fullName?.message} />
            <Input label="Phone Number" placeholder="9876543210" {...form.register('phone')} error={form.formState.errors.phone?.message} />
            <Input label="Date of Birth" type="date" {...form.register('dob')} error={form.formState.errors.dob?.message} />
            <Input label="City" placeholder="hyderabad" {...form.register('city')} error={form.formState.errors.city?.message} />
            <Button onClick={handleNext} className="mt-2 w-full">Continue</Button>
          </div>
        )}

        {/* ───────── Step 2 – Partner Verification ───────── */}
        {step === 2 && (
          <div className="mt-8 flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gs-text">Verify your delivery account</h2>
              <p className="text-sm text-gs-muted">Pick your platform and partner ID.</p>
            </div>
            <label className="text-xs font-medium text-gs-muted">Delivery Platform</label>
            <select {...form.register('platform')} className="w-full rounded-[10px] border border-gs-border bg-gs-bg px-4 py-3 text-sm">
              {['Zomato', 'Swiggy', 'Amazon', 'Flipkart', 'Zepto', 'Blinkit', 'Dunzo'].map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
            {form.formState.errors.platform?.message && <div className="text-xs text-gs-danger">{form.formState.errors.platform?.message}</div>}
            <Input label="Partner ID" {...form.register('partnerId')} helper={getPartnerIdHint(platform)} error={form.formState.errors.partnerId?.message} />
            <label className="text-xs font-medium text-gs-muted">Years of Experience</label>
            <select {...form.register('experience')} className="w-full rounded-[10px] border border-gs-border bg-gs-bg px-4 py-3 text-sm">
              <option value="">Select experience</option>
              {experienceOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            {form.formState.errors.experience?.message && <div className="text-xs text-gs-danger">{form.formState.errors.experience?.message}</div>}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button onClick={handleNext} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {/* ───────── Step 3 – Location & ID Proof ───────── */}
        {step === 3 && (
          <div className="mt-8 flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-semibold text-gs-text">Location & ID verification</h2>
              <p className="text-sm text-gs-muted">Enable your location and upload proof of your authorized delivery/e-commerce partnership.</p>
            </div>

            {/* Location */}
            <div className="rounded-xl border border-gs-border bg-gs-surface-2 p-4">
              <div className="mb-2 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gs-electric">
                  <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 1118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-sm font-semibold text-gs-text">Your Location</span>
              </div>
              {location ? (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                  <span className="text-xs font-medium text-emerald-700">{location.label}</span>
                </div>
              ) : (
                <Button onClick={handleEnableLocation} className="w-full" variant={locError ? 'warning' : 'primary'}>
                  {locLoading ? <LoadingSpinner /> : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4m10-10h-4M6 12H2" /><circle cx="12" cy="12" r="3" /></svg>
                      Enable Location
                    </>
                  )}
                </Button>
              )}
              {locError && <div className="mt-2 text-xs text-gs-warning">{locError}</div>}
            </div>

            {/* Proof Upload */}
            <div className="rounded-xl border border-gs-border bg-gs-surface-2 p-4">
              <div className="mb-2 flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gs-violet">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span className="text-sm font-semibold text-gs-text">Proof of Authorization</span>
              </div>
              <p className="mb-3 text-xs text-gs-muted">
                Upload a screenshot or photo of your delivery partner app dashboard, partner ID card, or onboarding email.
              </p>

              <input ref={proofRef} type="file" accept="image/*,.pdf" onChange={handleProofChange} className="hidden" />

              {proofPreview ? (
                <div className="relative">
                  <img src={proofPreview} alt="Proof preview" className="h-36 w-full rounded-lg border border-gs-border object-cover" />
                  <button
                    type="button"
                    onClick={() => { setProofFile(null); setProofPreview(null) }}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow-md hover:bg-red-600"
                  >✕</button>
                  <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 font-medium">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5" /></svg>
                    {proofFile.name}
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => proofRef.current?.click()}
                  className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gs-border bg-white px-4 py-6 text-center transition hover:border-gs-electric hover:bg-blue-50/40"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gs-electric">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span className="text-xs font-semibold text-gs-text">Click to upload</span>
                  <span className="text-[11px] text-gs-muted">JPG, PNG or PDF — max 5 MB</span>
                </button>
              )}
              {proofError && <div className="mt-2 text-xs text-gs-danger">{proofError}</div>}
            </div>

            {/* City tier badge */}
            <div className="flex items-center gap-2 rounded-lg border border-gs-border bg-white px-3 py-2">
              <span className="text-xs text-gs-muted">Detected zone:</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                cityTier === 'Urban' ? 'bg-blue-100 text-blue-700' :
                cityTier === 'Semi-Urban' ? 'bg-amber-100 text-amber-700' :
                'bg-green-100 text-green-700'
              }`}>{cityTier}</span>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button onClick={handleNext} className="flex-1">Verify with AI</Button>
            </div>
          </div>
        )}

        {/* ───────── Step 4 – AI Verification ───────── */}
        {step === 4 && (
          <div className="mt-8 flex flex-col items-center gap-5">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gs-text">AI Verification</h2>
              <p className="text-sm text-gs-muted">Our AI model is analyzing your credentials…</p>
            </div>

            {/* Animated checklist */}
            <div className="w-full max-w-sm space-y-3">
              {verifyChecklist.map((item, idx) => {
                const done = trustScore !== null || idx < verifyIndex
                const active = !trustScore && idx === verifyIndex
                return (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: done || active ? 1 : 0.35, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                      done
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : active
                        ? 'border-gs-electric/40 bg-blue-50 text-gs-electric'
                        : 'border-gs-border bg-white text-gs-dim'
                    }`}
                  >
                    {done ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    ) : active ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gs-electric border-t-transparent" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border-2 border-gs-border" />
                    )}
                    {item}
                  </motion.div>
                )
              })}
            </div>

            {/* Trust Score result */}
            <AnimatePresence>
              {trustScore !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                  className="flex w-full max-w-sm flex-col items-center gap-3 rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-white px-6 py-5"
                >
                  <div className="text-xs font-semibold uppercase tracking-widest text-emerald-600">Trust Score</div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-5xl font-black text-emerald-600">{trustScore}</span>
                    <span className="text-lg font-bold text-emerald-400">/100</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${trustScore}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                    />
                  </div>
                  <div className="text-xs text-emerald-600">
                    {trustScore >= 80 ? '✅ Excellent — Verified successfully' : trustScore >= 60 ? '⚡ Good — Verified with minor flags' : '⚠️ Review pending — Manual check required'}
                  </div>
                  <Button onClick={() => setStep(5)} className="mt-2 w-full">Continue to phone verification</Button>
                </motion.div>
              )}
            </AnimatePresence>

            {!trustScore && (
              <Button variant="secondary" onClick={() => setStep(3)} className="w-full max-w-sm">
                Cancel
              </Button>
            )}
          </div>
        )}

        {/* ───────── Step 5 – OTP ───────── */}
        {step === 5 && (
          <div className="mt-8 flex flex-col items-center gap-4 text-center">
            <div>
              <h2 className="text-xl font-semibold text-gs-text">Verify your phone</h2>
              <p className="text-sm text-gs-muted">Enter the 6-digit code sent to your phone.</p>
            </div>
            <OTPInput onComplete={handleOtpComplete} hasError={otpError} />
            {otpError && <div className="text-xs text-gs-danger">Incorrect OTP. Please try again.</div>}
            <div className="text-xs text-gs-dim">
              {resend > 0 ? (
                `Resend in ${resend}s`
              ) : (
                <button type="button" onClick={() => setResend(30)} className="font-semibold text-gs-electric">Resend OTP</button>
              )}
            </div>
            <Button variant="secondary" onClick={() => setStep(4)} className="mt-2 w-full">Back</Button>
          </div>
        )}

        {/* ───────── Step 6 – Password ───────── */}
        {step === 6 && (
          <div className="mt-8 flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gs-text">Set a password</h2>
              <p className="text-sm text-gs-muted">Secure your account with a strong password.</p>
            </div>
            
            {error && (
              <div className="rounded-lg border-l-4 border-gs-danger bg-red-50 px-3 py-2 text-xs text-gs-danger">
                {error}
              </div>
            )}
            
            <Input 
              label="Password" 
              type="password" 
              placeholder="At least 6 characters"
              {...form.register('password')} 
              error={form.formState.errors.password?.message} 
            />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((seg) => (
                <div
                  key={seg}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    passwordStrength >= seg
                      ? seg === 1 ? 'bg-gs-danger' : seg === 2 ? 'bg-gs-warning' : seg === 3 ? 'bg-gs-gold' : 'bg-emerald-500'
                      : 'bg-gs-border'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-gs-muted">Password strength: {strengthLabel}</div>
            <Input 
              label="Confirm Password" 
              type="password" 
              placeholder="Re-enter your password"
              {...form.register('confirmPassword')} 
              error={form.formState.errors.confirmPassword?.message} 
            />
            {form.formState.errors.root?.message && (
              <div className="rounded-lg border-l-4 border-gs-danger bg-red-50 px-3 py-2 text-xs text-gs-danger">
                {form.formState.errors.root.message}
              </div>
            )}
            <div className="mt-2 flex gap-3">
              <Button 
                type="button"
                variant="secondary" 
                onClick={() => setStep(5)} 
                className="flex-1"
                disabled={loading}
              >
                Back
              </Button>
              <Button 
                type="button"
                onClick={handleSubmit} 
                className="flex-1"
                disabled={loading}
              >
                {loading ? <LoadingSpinner /> : 'Create my account'}
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Register
