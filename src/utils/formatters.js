import { format } from 'date-fns'

export const formatCurrency = (value) => {
  if (value === null || value === undefined) {
    return '--'
  }

  return `Rs ${Number(value).toLocaleString('en-IN')}`
}

export const formatDate = (dateString) => {
  if (!dateString) {
    return ''
  }

  const date = new Date(dateString)
  return format(date, 'MMM d, yyyy')
}

export const maskPhone = (phone) => {
  if (!phone || phone.length < 10) {
    return phone
  }

  return `${phone.slice(0, 2)}*****${phone.slice(-3)}`
}
