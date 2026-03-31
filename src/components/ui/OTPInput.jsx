import { useEffect, useRef, useState } from 'react'

function OTPInput({ onComplete, hasError }) {
  const [values, setValues] = useState(Array(6).fill(''))
  const inputsRef = useRef([])

  useEffect(() => {
    inputsRef.current?.[0]?.focus()
  }, [])

  const updateValue = (index, value) => {
    const next = [...values]
    next[index] = value
    setValues(next)

    const joined = next.join('')
    if (joined.length === 6 && !next.includes('')) {
      onComplete?.(joined)
    }
  }

  const handleChange = (index, event) => {
    const value = event.target.value.replace(/\D/g, '')
    if (!value) {
      updateValue(index, '')
      return
    }

    updateValue(index, value[0])
    if (index < 5) {
      inputsRef.current?.[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && values[index] === '' && index > 0) {
      inputsRef.current?.[index - 1]?.focus()
    }
  }

  const handlePaste = (event) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) {
      return
    }

    const next = pasted.split('')
    setValues((prev) => prev.map((_, idx) => next[idx] || ''))
    if (next.length === 6) {
      onComplete?.(next.join(''))
    }
  }

  return (
    <div
      className={`flex gap-3 ${hasError ? 'animate-shake' : ''}`}
      onPaste={handlePaste}
    >
      {values.map((value, index) => (
        <input
          key={`otp-${index}`}
          ref={(el) => {
            inputsRef.current[index] = el
          }}
          value={value}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          maxLength={1}
          className={`h-12 w-10 rounded-[10px] border text-center font-mono text-lg text-gs-text focus:border-gs-electric focus:outline-none focus:ring-2 focus:ring-gs-electric/20 ${
            value ? 'border-gs-electric' : 'border-gs-border'
          } ${hasError ? 'border-gs-danger bg-red-50' : 'bg-white'}`}
        />
      ))}
    </div>
  )
}

export default OTPInput
