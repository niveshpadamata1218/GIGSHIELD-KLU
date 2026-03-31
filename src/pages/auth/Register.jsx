import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import StepIndicator from '../../components/ui/StepIndicator'
import OTPInput from '../../components/ui/OTPInput'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import API from '../../api/client'
import {
  getPartnerIdHint,
  passwordSchema,
  planSchema,
  stepOneSchema,
  stepTwoSchema
} from '../../utils/validation'
import { useAuthStore } from '../../store/authStore'

const planOptions = [
  { id: 'Rural', price: 'Rs 20/week', coverage: 'Rs 250/day coverage' },
  { id: 'Semi-Urban', price: 'Rs 30/week', coverage: 'Rs 400/day coverage' },
  { id: 'Urban', price: 'Rs 40/week', coverage: 'Rs 600/day coverage' }
]

const experienceOptions = ['Less than 1 year', '1-2 years', '2-5 years', '5+ years']

function Register() {
  const navigate = useNavigate()
  const { registerWorker } = useAuthStore()
  const [step, setStep] = useState(1)
  const [otpError, setOtpError] = useState(false)
  const [resend, setResend] = useState(30)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const form = useForm({
    defaultValues: {
      fullName: '',
      phone: '',
      dob: '',
      city: '',
      platform: 'Zomato',
      partnerId: '',
      experience: '',
      plan: '',
      password: '',
      confirmPassword: ''
    }
  })

  const platform = form.watch('platform')
  const password = form.watch('password')

  useEffect(() => {
    if (step === 3 && resend > 0) {
      const id = setInterval(() => setResend((prev) => (prev > 0 ? prev - 1 : 0)), 1000)
      return () => clearInterval(id)
    }
  }, [step, resend])

  const validateStep = (schema) => {
    form.clearErrors()
    const values = form.getValues()
    const result = schema.safeParse(values)
    if (result.success) {
      return true
    }

    result.error.errors.forEach((err) => {
      const field = err.path[0]
      if (field) {
        form.setError(field, { message: err.message })
      }
    })
    return false
  }

  const handleNext = () => {
    if (step === 1) {
      if (validateStep(stepOneSchema)) {
        setStep(2)
      }
    } else if (step === 2) {
      if (validateStep(stepTwoSchema(form.getValues('platform')))) {
        setStep(3)
        setResend(30)
        setOtpError(false)
      }
    } else if (step === 4) {
      if (validateStep(planSchema)) {
        setStep(5)
      }
    }
  }

  const handleOtpComplete = async (value) => {
    try {
      const phone = form.getValues('phone')
      const response = await API.post('/auth/verify-otp', { phone, otp: value })
      if (response.data?.verified || response.data?.token || response.data?.role === 'worker') {
        setOtpError(false)
        setStep(4)
      } else {
        setOtpError(true)
      }
    } catch (error) {
      setOtpError(true)
    }
  }

  const passwordStrength = useMemo(() => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^a-zA-Z0-9]/.test(password)) score += 1
    return score
  }, [password])

  const strengthLabel = ['Weak', 'Fair', 'Good', 'Strong'][Math.max(passwordStrength - 1, 0)]

  const handleSubmit = async () => {
    if (!validateStep(passwordSchema)) {
      return
    }

    setLoading(true)
    const payload = {
      fullName: form.getValues('fullName'),
      phone: form.getValues('phone'),
      dob: form.getValues('dob'),
      city: form.getValues('city'),
      platform: form.getValues('platform'),
      partnerId: form.getValues('partnerId'),
      experience: form.getValues('experience'),
      plan: form.getValues('plan'),
      password: form.getValues('password')
    }

    const result = await registerWorker(payload)
    setLoading(false)
    if (!result.success) {
      return
    }
    setSuccess(true)
    setTimeout(() => navigate('/dashboard'), 2000)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="gs-card flex w-full max-w-md flex-col items-center gap-3 px-8 py-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-emerald-200">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div className="text-lg font-semibold text-gs-text">Account created successfully.</div>
          <div className="text-sm text-gs-muted">Redirecting to your dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="gs-card w-full max-w-xl px-8 py-10"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gs-electric to-gs-violet text-sm font-semibold text-white">
            GS
          </div>
        </div>
        <StepIndicator
          currentStep={step}
          steps={['Personal Info', 'Partner Verification', 'OTP', 'Plan', 'Password']}
        />

        {step === 1 ? (
          <div className="mt-8 flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gs-text">Tell us about yourself</h2>
              <p className="text-sm text-gs-muted">We keep this private and secure.</p>
            </div>
            <Input
              label="Full Name"
              placeholder="Akshith"
              {...form.register('fullName')}
              error={form.formState.errors.fullName?.message}
            />
            <Input
              label="Phone Number"
              placeholder="9876543210"
              {...form.register('phone')}
              error={form.formState.errors.phone?.message}
            />
            <Input
              label="Date of Birth"
              type="date"
              {...form.register('dob')}
              error={form.formState.errors.dob?.message}
            />
            <Input
              label="City"
              placeholder="hyderabad"
              {...form.register('city')}
              error={form.formState.errors.city?.message}
            />
            <Button onClick={handleNext} className="mt-2 w-full">
              Continue
            </Button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="mt-8 flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gs-text">Verify your delivery account</h2>
              <p className="text-sm text-gs-muted">Pick your platform and partner ID.</p>
            </div>
            <label className="text-xs font-medium text-gs-muted">Delivery Platform</label>
            <select
              {...form.register('platform')}
              className="w-full rounded-[10px] border border-gs-border bg-gs-bg px-4 py-3 text-sm"
            >
              {['Zomato', 'Swiggy', 'Amazon', 'Flipkart', 'Zepto', 'Blinkit', 'Dunzo'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {form.formState.errors.platform?.message ? (
              <div className="text-xs text-gs-danger">
                {form.formState.errors.platform?.message}
              </div>
            ) : null}
            <Input
              label="Partner ID"
              {...form.register('partnerId')}
              helper={getPartnerIdHint(platform)}
              error={form.formState.errors.partnerId?.message}
            />
            <label className="text-xs font-medium text-gs-muted">Years of Experience</label>
            <select
              {...form.register('experience')}
              className="w-full rounded-[10px] border border-gs-border bg-gs-bg px-4 py-3 text-sm"
            >
              <option value="">Select experience</option>
              {experienceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {form.formState.errors.experience?.message ? (
              <div className="text-xs text-gs-danger">
                {form.formState.errors.experience?.message}
              </div>
            ) : null}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="mt-8 flex flex-col items-center gap-4 text-center">
            <div>
              <h2 className="text-xl font-semibold text-gs-text">Verify your phone</h2>
              <p className="text-sm text-gs-muted">Enter the 6-digit code sent to your phone.</p>
            </div>
            <OTPInput onComplete={handleOtpComplete} hasError={otpError} />
            {otpError ? (
              <div className="text-xs text-gs-danger">Incorrect OTP. Please try again.</div>
            ) : null}
            <div className="text-xs text-gs-dim">
              {resend > 0 ? (
                `Resend in ${resend}s`
              ) : (
                <button
                  type="button"
                  onClick={() => setResend(30)}
                  className="font-semibold text-gs-electric"
                >
                  Resend OTP
                </button>
              )}
            </div>
            <Button variant="secondary" onClick={() => setStep(2)} className="mt-2 w-full">
              Back
            </Button>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="mt-8 flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gs-text">Choose your plan</h2>
              <p className="text-sm text-gs-muted">Pick a weekly coverage tier.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {planOptions.map((plan) => {
                const selected = form.watch('plan') === plan.id
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => form.setValue('plan', plan.id)}
                    className={`rounded-xl border px-3 py-3 text-left text-xs transition ${
                      selected
                        ? 'border-gs-electric bg-blue-50 shadow-[0_0_0_2px_rgba(14,165,233,0.2)]'
                        : 'border-gs-border bg-white'
                    }`}
                  >
                    <div className="font-semibold text-gs-text">{plan.id}</div>
                    <div className="font-mono text-sm text-gs-electric">{plan.price}</div>
                    <div className="text-gs-muted">{plan.coverage}</div>
                  </button>
                )
              })}
            </div>
            {form.formState.errors.plan?.message ? (
              <div className="text-xs text-gs-danger">{form.formState.errors.plan?.message}</div>
            ) : null}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(3)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="mt-8 flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gs-text">Set a password</h2>
              <p className="text-sm text-gs-muted">Secure your account with a strong password.</p>
            </div>
            <Input
              label="Password"
              type="password"
              {...form.register('password')}
              error={form.formState.errors.password?.message}
            />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((segment) => (
                <div
                  key={segment}
                  className={`h-2 flex-1 rounded-full ${
                    passwordStrength >= segment
                      ? segment === 1
                        ? 'bg-gs-danger'
                        : segment === 2
                        ? 'bg-gs-warning'
                        : segment === 3
                        ? 'bg-gs-gold'
                        : 'bg-gs-success'
                      : 'bg-gs-border'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-gs-muted">{strengthLabel}</div>
            <Input
              label="Confirm Password"
              type="password"
              {...form.register('confirmPassword')}
              error={form.formState.errors.confirmPassword?.message}
            />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(4)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                {loading ? <LoadingSpinner /> : 'Create my account'}
              </Button>
            </div>
          </div>
        ) : null}
      </motion.div>
    </div>
  )
}

export default Register
