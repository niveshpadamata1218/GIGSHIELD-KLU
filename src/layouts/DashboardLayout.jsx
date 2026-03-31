import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
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
          <button
            className="rounded-lg border border-gs-border bg-white px-3 py-2 text-sm font-semibold text-gs-text"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
          <div className="text-sm font-semibold text-gs-text">GigShield</div>
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
