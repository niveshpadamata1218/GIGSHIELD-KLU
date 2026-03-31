import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

function Navbar({ variant = 'landing' }) {
  const isLanding = variant === 'landing'
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 border-b border-gs-border bg-white/80 backdrop-blur transition-shadow ${
        scrolled ? 'shadow-[0_2px_16px_rgba(0,0,0,0.08)]' : ''
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-gs-text">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-gs-electric to-gs-violet" />
          GigShield
        </Link>
        {isLanding ? (
          <div className="flex items-center gap-3">
            <NavLink
              to="/login"
              className="rounded-[10px] border border-gs-border bg-white px-4 py-2 text-sm font-semibold text-gs-text hover:border-gs-electric hover:text-gs-electric"
            >
              Worker login
            </NavLink>
            <NavLink to="/admin/login" className="text-sm text-gs-muted hover:text-gs-text">
              Admin
            </NavLink>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-gs-electric to-gs-violet px-5 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(14,165,233,0.3)] transition-transform hover:scale-[1.02]"
            >
              Get protected
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  )
}

export default Navbar
