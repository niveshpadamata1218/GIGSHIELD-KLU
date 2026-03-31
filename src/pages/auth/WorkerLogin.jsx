import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import OTPInput from '../../components/ui/OTPInput'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { workerLoginSchema } from '../../utils/validation'
import { useAuthStore } from '../../store/authStore'
import { maskPhone } from '../../utils/formatters'

function WorkerLogin() {
  const navigate = useNavigate()
  const { requestWorkerLogin, verifyWorkerOtp } = useAuthStore()
  const [stage, setStage] = useState('credentials')
  const [showDemo, setShowDemo] = useState(false)
  const [bannerError, setBannerError] = useState('')
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpError, setOtpError] = useState(false)
  const [resend, setResend] = useState(30)
  const [tempToken, setTempToken] = useState(null)
  const [pendingPhone, setPendingPhone] = useState('')

  const form = useForm({
    resolver: zodResolver(workerLoginSchema),
    defaultValues: { phone: '', password: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  })

  const phone = form.watch('phone')
  const maskedPhone = useMemo(
    () => maskPhone(pendingPhone || phone),
    [pendingPhone, phone]
  )

  useEffect(() => {
    if (stage !== 'otp' || resend <= 0) {
      return
    }

    const id = setInterval(() => setResend((prev) => (prev > 0 ? prev - 1 : 0)), 1000)
    return () => clearInterval(id)
  }, [stage, resend])

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  const onSubmit = async (values) => {
    console.log('Worker login submit', values)
    setLoading(true)
    setBannerError('')

    const result = await requestWorkerLogin(values)
    setLoading(false)
    if (!result.success) {
      setBannerError('Invalid credentials. Please use the demo account.')
      triggerShake()
      return
    }
    setTempToken(result.tempToken)
    setPendingPhone(values.phone)
    setStage('otp')
    setResend(30)
    setOtpError(false)
  }

  const { errors, touchedFields, isSubmitted } = form.formState
  const getError = (field) => {
    const message = errors[field]?.message
    return message && (touchedFields[field] || isSubmitted) ? message : ''
  }

  const handleOtpComplete = async (value) => {
    const result = await verifyWorkerOtp({ phone: pendingPhone, tempToken, otp: value })
    if (result.success) {
      navigate('/dashboard')
    } else {
      setOtpError(true)
      triggerShake()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className={`grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-gs-border bg-white shadow-xl lg:grid-cols-2 ${
          shake ? 'animate-shake' : ''
        }`}
      >
        <div className="flex flex-col justify-between bg-gs-surface-2 px-10 py-12">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-bold text-gs-text">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-gs-electric to-gs-violet" />
              GigShield
            </div>
            <h1 className="mt-6 font-display text-3xl font-extrabold text-gs-text">
              Protect your income. Protect your future.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-gs-muted">
              When work stops, your life should not. GigShield ensures you and your family stay secure even when disruptions hit.
            </p>
            <div className="mt-6 space-y-3 text-sm text-gs-text">
              <div className="border-l-4 border-gs-electric bg-white px-3 py-2">Instant payouts during disruptions</div>
              <div className="border-l-4 border-gs-violet bg-white px-3 py-2">No claims. No paperwork.</div>
              <div className="border-l-4 border-gs-gold bg-white px-3 py-2">Built for real gig workers</div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-gs-muted">
              <span className="rounded-full bg-white px-3 py-2">Zero-touch claims</span>
              <span className="rounded-full bg-white px-3 py-2">AI-based pricing</span>
              <span className="rounded-full bg-white px-3 py-2">Fraud detection</span>
              <span className="rounded-full bg-white px-3 py-2">Gig Score</span>
              <span className="rounded-full bg-white px-3 py-2">Instant payouts</span>
            </div>
          </div>
          <div className="mt-10 rounded-xl border border-gs-border bg-white px-4 py-3 text-xs text-gs-muted">
            AI + Insurance + Automation + Fraud Detection + Real-time Data
          </div>
        </div>

        <div className="px-10 py-12">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-extrabold text-gs-text">Welcome back</h2>
            <p className="mt-2 text-sm text-gs-muted">Sign in to access your coverage and payouts.</p>
          </div>

          {bannerError ? (
            <div className="mb-4 rounded-lg border-l-4 border-gs-danger bg-red-50 px-3 py-2 text-xs text-gs-danger">
              {bannerError}
            </div>
          ) : null}

          {stage === 'credentials' ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="Phone Number"
                placeholder="10-digit mobile number"
                {...form.register('phone')}
                error={getError('phone')}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Your password"
                {...form.register('password')}
                error={getError('password')}
              />
              <button
                type="button"
                onClick={() => {
                  form.setValue('phone', '9876543210', { shouldValidate: true })
                  form.setValue('password', 'demo@123', { shouldValidate: true })
                  setShowDemo(true)
                }}
                className="text-left text-xs font-semibold text-gs-electric"
              >
                Use demo account
              </button>
              {showDemo ? (
                <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 font-mono text-xs text-gs-text">
                  Phone: 9876543210 | Password: demo@123
                </div>
              ) : null}
              <Button type="submit" className="mt-2 w-full">
                {loading ? <LoadingSpinner /> : 'Sign in'}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="text-sm font-semibold text-gs-text">Verify your phone</div>
              <div className="text-xs text-gs-muted">OTP sent to {maskedPhone}</div>
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
            </div>
          )}

          <div className="mt-6 text-center text-xs text-gs-muted">
            New to GigShield?{' '}
            <Link to="/register" className="font-semibold text-gs-electric">
              Register here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default WorkerLogin
