import { NavLink, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const links = [
  { label: 'Overview', to: '/admin' },
  { label: 'Disruptions', to: '/admin/disruptions' },
  { label: 'Claims', to: '/admin/claims' },
  { label: 'Fraud', to: '/admin/fraud' },
  { label: 'Workers', to: '/admin/workers' }
]

function AdminSidebar({ isMobile = false, isOpen = false, onClose }) {
  const { user, logout } = useAuthStore()

  const content = (
    <div className="flex h-full flex-col">
      <Link to="/" onClick={onClose} className="mb-6 flex items-center gap-2 rounded-lg border border-gs-border bg-gradient-to-br from-gs-electric/10 to-gs-violet/10 px-3 py-2 transition hover:border-gs-electric hover:bg-gradient-to-br hover:from-gs-electric/20 hover:to-gs-violet/20">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-gs-electric to-gs-violet text-xs font-semibold text-white">
          GS
        </span>
        <span className="text-sm font-semibold text-gs-text">Home</span>
      </Link>
      <div className="flex items-center gap-3 rounded-lg border border-gs-border-light bg-gs-surface-2 px-3 py-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-gs-electric to-gs-violet text-sm font-semibold text-white">
          {user?.name?.[0] || 'A'}
        </div>
        <div>
          <div className="text-sm font-semibold text-gs-text">Admin</div>
          <div className="text-xs text-gs-muted">System operator</div>
        </div>
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
            end={link.to === '/admin'}
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

export default AdminSidebar
