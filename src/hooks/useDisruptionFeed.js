import { useEffect, useState } from 'react'
import { demoDisruptions } from '../data/demoData'

export const useDisruptionFeed = () => {
  const [items, setItems] = useState(demoDisruptions)

  useEffect(() => {
    const id = setInterval(() => {
      setItems((prev) => prev)
    }, 12000)

    return () => clearInterval(id)
  }, [])

  return items
}
