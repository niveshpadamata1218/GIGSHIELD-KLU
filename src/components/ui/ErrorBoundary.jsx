import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info)
    this.setState({ error, info })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gs-bg px-6 text-center">
          <div className="gs-card w-full max-w-md px-6 py-8">
            <div className="text-lg font-semibold text-gs-text">Something went wrong.</div>
            <div className="mt-2 text-sm text-gs-muted">
              Please refresh the page. If the issue persists, contact support.
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-left">
                <div className="text-xs font-mono text-red-700 break-words">
                  {this.state.error.toString()}
                </div>
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full rounded-lg bg-gs-electric px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
