import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gs-bg px-6 text-center">
      <div className="gs-card w-full max-w-md px-6 py-8">
        <div className="text-lg font-semibold text-gs-text">Page not found</div>
        <div className="mt-2 text-sm text-gs-muted">
          The page you are looking for does not exist.
        </div>
        <Link
          to="/"
          className="mt-4 inline-flex items-center justify-center rounded-[10px] border border-gs-border bg-white px-4 py-2 text-sm font-semibold text-gs-text hover:border-gs-electric hover:text-gs-electric"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
