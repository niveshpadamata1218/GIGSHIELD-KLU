import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuthStore } from '../../store/authStore'

const adminLoginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

const DEMO_ADMIN_CREDENTIALS = {
  email: 'admin@gigshield.in',
  password: 'admin@shield2026'
}

function AdminLogin() {
  const navigate = useNavigate()
  const { loginAdmin } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [bannerError, setBannerError] = useState('')
  const [shake, setShake] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)

  const form = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit'
  })

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  const onSubmit = async (values) => {
    setLoading(true)
    setBannerError('')

    const result = await loginAdmin(values)
    setLoading(false)

    if (!result.success) {
      setBannerError(result.message || 'Invalid admin credentials')
      triggerShake()
      return
    }

    navigate('/admin')
  }

  const { errors, touchedFields, isSubmitted } = form.formState
  const getError = (field) => {
    const message = errors[field]?.message
    return message && (touchedFields[field] || isSubmitted) ? message : ''
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
      <Link
        to="/"
        className="absolute left-6 top-6 flex items-center gap-2 font-display text-xl font-bold text-gs-text transition-opacity hover:opacity-80 z-10"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gs-danger to-gs-electric text-xs font-semibold text-white">
          GA
        </span>
        GigShield Admin
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className={`grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-2xl border border-gs-border bg-white shadow-xl lg:grid-cols-2 ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Left Panel */}
        <div className="flex flex-col justify-between bg-gs-surface-2 px-10 py-12">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-bold text-gs-text">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-gs-danger to-gs-electric" />
              GigShield Admin
            </div>
            <h1 className="mt-6 font-display text-3xl font-extrabold text-gs-text">
              Admin Control Center
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-gs-muted">
              Manage workers, analyze fraud, monitor payments, and ensure system integrity across the platform.
            </p>
            <div className="mt-6 space-y-3 text-sm text-gs-text">
              <div className="border-l-4 border-gs-danger bg-white px-3 py-2">User Management</div>
              <div className="border-l-4 border-gs-electric bg-white px-3 py-2">Fraud Detection</div>
              <div className="border-l-4 border-gs-gold bg-white px-3 py-2">Payment Analytics</div>
              <div className="border-l-4 border-gs-violet bg-white px-3 py-2">Risk Assessment</div>
            </div>
          </div>
          <div className="mt-10 rounded-xl border border-gs-border bg-white px-4 py-3 text-xs text-gs-muted">
            Admin features: All user data • Transaction history • Fraud analytics • System controls
          </div>
        </div>

        {/* Right Panel */}
        <div className="px-10 py-12">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-extrabold text-gs-text">Admin Access</h2>
            <p className="mt-2 text-sm text-gs-muted">Sign in with admin credentials</p>
          </div>

          {bannerError && (
            <div className="mb-4 rounded-lg border-l-4 border-gs-danger bg-red-50 px-3 py-2 text-xs text-gs-danger">
              {bannerError}
            </div>
          )}

          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Admin Email"
              placeholder="admin@gigshield.in"
              {...form.register('email')}
              error={getError('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Admin password"
              {...form.register('password')}
              error={getError('password')}
            />

            <button
              type="button"
              onClick={() => setShowCredentials(!showCredentials)}
              className="text-left text-xs font-semibold text-gs-danger"
            >
              Show admin credentials
            </button>

            {showCredentials && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-mono text-xs text-gs-text">
                <div>Email: {DEMO_ADMIN_CREDENTIALS.email}</div>
                <div>Password: {DEMO_ADMIN_CREDENTIALS.password}</div>
              </div>
            )}

            <Button type="submit" className="mt-2 w-full" disabled={loading}>
              {loading ? <LoadingSpinner /> : 'Sign in as Admin'}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-gs-muted">
            Back to{' '}
            <Link to="/login" className="font-semibold text-gs-electric">
              Worker Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AdminLogin
