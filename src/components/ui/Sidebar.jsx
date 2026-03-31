import { NavLink, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const links = [
  { label: 'Overview', to: '/dashboard' },
  { label: 'Policy', to: '/dashboard/policy' },
  { label: 'Work Tracker', to: '/dashboard/work' },
  { label: 'Gig Score', to: '/dashboard/gigscore' },
  { label: 'Claims', to: '/dashboard/claims' },
  { label: 'Risk Alerts', to: '/dashboard/alerts' }
]

function Sidebar({ isMobile = false, isOpen = false, onClose }) {
  const { logout } = useAuthStore()

  const content = (
    <div className="flex h-full flex-col">
      <Link to="/" onClick={onClose} className="mb-6 flex items-center gap-2 rounded-lg border border-gs-border bg-gradient-to-br from-gs-electric/10 to-gs-violet/10 px-3 py-2 transition hover:border-gs-electric hover:bg-gradient-to-br hover:from-gs-electric/20 hover:to-gs-violet/20">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-gs-electric to-gs-violet text-xs font-semibold text-white">
          GS
        </span>
        <span className="text-sm font-semibold text-gs-text">Home</span>
      </Link>
      <div className="rounded-lg border border-gs-border-light bg-gs-surface-2 px-3 py-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-gs-muted">Worker Panel</div>
        <div className="mt-1 text-sm font-semibold text-gs-text">Coverage and Work Controls</div>
      </div>

      <nav className="mt-8 flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) =>
              `rounded-xl px-4 py-2 text-sm transition ${
                isActive
                  ? 'border-l-4 border-gs-electric bg-blue-50 text-gs-electric font-semibold'
                  : 'text-gs-muted hover:bg-gs-surface-2 hover:text-gs-text'
              }`
            }
            end={link.to === '/dashboard'}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => {
          logout()
          onClose?.()
        }}
        className="mt-auto text-left text-xs font-medium text-gs-muted hover:text-gs-danger"
      >
        Logout
      </button>
    </div>
  )

  if (isMobile) {
    return isOpen ? (
      <div className="fixed inset-0 z-40 md:hidden">
        <div className="absolute inset-0 bg-black/20" onClick={onClose} />
        <aside className="absolute left-0 top-0 h-full w-[248px] border-r border-gs-border bg-white px-6 py-8 shadow-xl">
          {content}
        </aside>
      </div>
    ) : null
  }

  return (
    <aside className="hidden min-h-screen w-[248px] flex-col border-r border-gs-border bg-white px-6 py-8 md:flex">
      {content}
    </aside>
  )
}

export default Sidebar
