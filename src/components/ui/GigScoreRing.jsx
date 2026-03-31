import { useEffect, useId, useMemo, useState } from 'react'
import { getScoreColor } from '../../utils/gigScoreCalculator'

function GigScoreRing({ score = 78, size = 200 }) {
  const strokeWidth = 14
  const radius = size / 2 - strokeWidth
  const circumference = 2 * Math.PI * radius
  const dash = (score / 100) * circumference
  const color = getScoreColor(score)
  const [displayScore, setDisplayScore] = useState(0)
  const [dashValue, setDashValue] = useState(0)
  const gradientId = useId()

  useEffect(() => {
    setDashValue(0)
    let frame = 0
    const duration = 1500
    const totalFrames = Math.round(duration / 16)

    const tick = () => {
      frame += 1
      const progress = Math.min(frame / totalFrames, 1)
      setDisplayScore(Math.round(progress * score))
      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [score])

  useEffect(() => {
    const id = setTimeout(() => setDashValue(dash), 40)
    return () => clearTimeout(id)
  }, [dash])

  const viewBox = useMemo(() => `0 0 ${size} ${size}`, [size])

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={viewBox}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F6"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          style={{
            strokeDasharray: `${dashValue} ${circumference}`,
            transition: 'stroke-dasharray 1.5s ease-out'
          }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-mono text-4xl" style={{ color }}>
          {displayScore}
        </div>
        <div className="text-[11px] uppercase tracking-[0.16em] text-gs-muted">
          Gig Score
        </div>
      </div>
    </div>
  )
}

export default GigScoreRing
