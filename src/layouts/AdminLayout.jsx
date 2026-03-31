import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/ui/AdminSidebar'
import { useAdminStore } from '../store/adminStore'
import LoadingSpinner from '../components/ui/LoadingSpinner'

function AdminLayout() {
  const [open, setOpen] = useState(false)
  const hydrate = useAdminStore((state) => state.hydrate)
  const loading = useAdminStore((state) => state.loading)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  return (
    <div className="flex min-h-screen bg-gs-bg">
      <AdminSidebar />
      <AdminSidebar isMobile isOpen={open} onClose={() => setOpen(false)} />
      <main className="flex-1 px-6 py-8 md:px-10">
        <div className="mb-6 flex items-center justify-between md:hidden">
          <button
            className="rounded-lg border border-gs-border bg-white px-3 py-2 text-sm font-semibold text-gs-text"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
          <div className="text-sm font-semibold text-gs-text">GigShield Admin</div>
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

export default AdminLayout
