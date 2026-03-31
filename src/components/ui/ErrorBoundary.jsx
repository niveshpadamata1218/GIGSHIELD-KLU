import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info)
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
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
