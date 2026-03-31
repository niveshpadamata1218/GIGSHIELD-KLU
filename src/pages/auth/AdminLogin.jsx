import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { adminLoginSchema } from '../../utils/validation'
import { useAuthStore } from '../../store/authStore'

function AdminLogin() {
  const navigate = useNavigate()
  const { loginAdmin } = useAuthStore()
  const [showDemo, setShowDemo] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
    reValidateMode: 'onChange'
  })

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  const onSubmit = async (values) => {
    console.log('Admin login submit', values)
    setLoading(true)
    setError('')
    const result = await loginAdmin(values)
    setLoading(false)
    if (!result.success) {
      setError('Invalid credentials. Please use the demo account.')
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
      <Link to="/" className="absolute left-6 top-6 flex items-center gap-2 font-display text-xl font-bold text-gs-text transition-opacity hover:opacity-80">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gs-electric to-gs-violet text-xs font-semibold text-white">
          GS
        </span>
        GigShield
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className={`gs-card w-full max-w-md px-8 py-10 ${shake ? 'animate-shake' : ''}`}
      >
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gs-electric to-gs-violet text-sm font-semibold text-white">
            GS
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-gs-text">Admin portal</h1>
          <p className="mt-2 text-sm text-gs-muted">Sign in to manage the platform.</p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border-l-4 border-gs-danger bg-red-50 px-3 py-2 text-xs text-gs-danger">
            {error}
          </div>
        ) : null}

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Email"
            placeholder="admin@gigshield.in"
            {...form.register('email')}
            error={getError('email')}
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
              form.setValue('email', 'admin@gigshield.in', { shouldValidate: true })
              form.setValue('password', 'admin@shield2026', { shouldValidate: true })
              setShowDemo(true)
            }}
            className="text-left text-xs font-semibold text-gs-electric"
          >
            Use demo account
          </button>
          {showDemo ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 font-mono text-xs text-gs-text">
              Email: admin@gigshield.in | Password: admin@shield2026
            </div>
          ) : null}
          <Button type="submit" className="mt-2 w-full">
            {loading ? <LoadingSpinner /> : 'Sign in'}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}

export default AdminLogin
