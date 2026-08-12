import { useEffect, useRef, useState } from 'react'
import { isExpired } from '../utils/game'

export function Timer({ startedAt, seconds, onExpire }: { startedAt: string | null; seconds: number; onExpire?: () => void }) {
  const [remaining, setRemaining] = useState(seconds)
  const didExpire = useRef(false)
  const onExpireRef = useRef(onExpire)
  useEffect(() => { onExpireRef.current = onExpire }, [onExpire])
  useEffect(() => {
    didExpire.current = false
    const update = () => {
      const value = startedAt ? Math.max(0, Math.ceil((new Date(startedAt).getTime() + seconds * 1000 - Date.now()) / 1000)) : seconds
      setRemaining(value)
      if (value === 0 && startedAt && isExpired(startedAt, seconds) && !didExpire.current) { didExpire.current = true; onExpireRef.current?.() }
    }
    update(); const id = window.setInterval(update, 250); return () => window.clearInterval(id)
  }, [startedAt, seconds])
  return <div className={`timer ${remaining <= 5 ? 'urgent' : ''}`} aria-label={`${remaining} seconds remaining`}><span>{remaining}</span><small>sec</small></div>
}
