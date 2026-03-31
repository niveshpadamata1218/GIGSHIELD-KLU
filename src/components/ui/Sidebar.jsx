import { NavLink } from 'react-router-dom'
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
  const { user, logout } = useAuthStore()

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-gs-electric to-gs-violet text-sm font-semibold text-white">
          {user?.name
            ? user.name
                .split(' ')
                .map((part) => part[0])
                .join('')
            : 'GS'}
        </div>
        <div>
          <div className="text-sm font-semibold text-gs-text">
            {user?.name || 'Gig Worker'}
          </div>
          <div className="mt-1 inline-flex rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-gs-electric">
            {user?.plan || 'Urban Plan'}
          </div>
        </div>
      </div>

      <nav className="mt-10 flex flex-col gap-2">
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
