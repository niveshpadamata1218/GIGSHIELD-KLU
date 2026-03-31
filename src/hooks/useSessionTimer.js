import { useEffect, useMemo, useState } from 'react'

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return [hours, minutes, secs].map((value) => String(value).padStart(2, '0')).join(':')
}

export const useSessionTimer = (isActive, startTime) => {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!isActive || !startTime) {
      setElapsed(0)
      return
    }

    const updateElapsed = () => {
      const diff = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)
      setElapsed(diff)
    }

    updateElapsed()
    const id = setInterval(updateElapsed, 1000)
    return () => clearInterval(id)
  }, [isActive, startTime])

  const formatted = useMemo(() => formatTime(elapsed), [elapsed])

  return { elapsed, formatted }
}
