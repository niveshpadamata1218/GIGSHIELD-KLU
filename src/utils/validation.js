import { z } from 'zod'

export const phoneRegex = /^[6-9]\d{9}$/
export const nameRegex = /^[a-zA-Z\s]{3,50}$/

export const partnerIdRegexMap = {
  Zomato: /^ZMT\d{8}$/,
  Swiggy: /^SWG\d{8}$/,
  Amazon: /^AMZ\d{9}$/,
  Flipkart: /^FLK\d{8}$/,
  Zepto: /^ZPT\d{7}$/,
  Blinkit: /^BLK\d{7}$/,
  Dunzo: /^DNZ\d{6}$/
}

export const partnerIdHintMap = {
  Zomato: 'Format: ZMT + 8 digits (e.g. ZMT12345678)',
  Swiggy: 'Format: SWG + 8 digits',
  Amazon: 'Format: AMZ + 9 digits',
  Flipkart: 'Format: FLK + 8 digits',
  Zepto: 'Format: ZPT + 7 digits',
  Blinkit: 'Format: BLK + 7 digits',
  Dunzo: 'Format: DNZ + 6 digits'
}

export const getPartnerIdRegex = (platform) =>
  partnerIdRegexMap[platform] || /.+/

export const getPartnerIdHint = (platform) =>
  partnerIdHintMap[platform] || 'Enter your partner ID'

const parseDob = (value) => {
  if (typeof value !== 'string') {
    return null
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      return null
    }
    return date
  }

  return null
}

export const stepOneSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Required')
    .min(3, 'Name must be 3-50 letters only')
    .max(50, 'Name must be 3-50 letters only')
    .regex(nameRegex, 'Name must be 3-50 letters only'),
  phone: z
    .string()
    .min(1, 'Required')
    .regex(phoneRegex, 'Enter a valid 10-digit Indian mobile number'),
  dob: z
    .string()
    .min(1, 'Required')
    .refine((value) => {
      const date = parseDob(value)
      const now = new Date()
      if (!date) {
        return false
      }
      if (date > now) {
        return false
      }
      const age = now.getFullYear() - date.getFullYear()
      const monthDiff = now.getMonth() - date.getMonth()
      const dayDiff = now.getDate() - date.getDate()
      const adjustedAge =
        monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age
      return adjustedAge >= 18
    }, 'You must be at least 18 years old to register'),
  city: z.string().min(1, 'Required').min(2, 'Please enter your city')
})

export const stepTwoSchema = (platform) =>
  z.object({
    platform: z.string().min(1, 'Required'),
    partnerId: z
      .string()
      .min(1, 'Required')
      .regex(getPartnerIdRegex(platform), getPartnerIdHint(platform)),
    experience: z.string().min(1, 'Required')
  })

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code')
})

export const planSchema = z.object({
  plan: z.string().min(1, 'Please select a coverage plan')
})

export const passwordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

export const workerLoginSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone is required')
    .regex(phoneRegex, 'Enter a valid 10-digit Indian mobile number'),
  password: z.string().min(1, 'Password is required')
})

export const adminLoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required')
})
