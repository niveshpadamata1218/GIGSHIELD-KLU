import { useEffect, useState } from 'react'
import { Outlet, Link } from 'react-router-dom'
import Sidebar from '../components/ui/Sidebar'
import { useDashboardStore } from '../store/dashboardStore'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function DashboardLayout() {
  const [open, setOpen] = useState(false)
  const hydrate = useDashboardStore((state) => state.hydrate)
  const loading = useDashboardStore((state) => state.loading)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <div className="flex min-h-screen bg-gs-bg">
      <Sidebar />
      <Sidebar isMobile isOpen={open} onClose={() => setOpen(false)} />
      <main className="flex-1 px-6 py-8 md:px-10">
        <div className="mb-6 flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-gs-border bg-white px-3 py-2 text-sm font-semibold text-gs-text"
              onClick={() => setOpen(true)}
            >
              Menu
            </button>
            <Link to="/" className="inline-flex items-center gap-2 rounded-lg border border-gs-border bg-gradient-to-br from-gs-electric/10 to-gs-violet/10 px-3 py-2 transition hover:border-gs-electric hover:bg-gradient-to-br hover:from-gs-electric/20 hover:to-gs-violet/20">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-gs-electric to-gs-violet text-xs font-semibold text-white">
                GS
              </span>
              <span className="text-xs font-semibold text-gs-text">Home</span>
            </Link>
          </div>
          <div className="text-sm font-semibold text-gs-text">GigShield Dashboard</div>
        </div>
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner label="Loading..." />
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  )
}

export default DashboardLayout
