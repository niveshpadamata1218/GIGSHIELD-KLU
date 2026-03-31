function LoadingSpinner({ label = '', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative h-4 w-8 vehicle-move">
        <span className="absolute bottom-1 left-0 h-2 w-4 rounded-sm bg-gs-electric" />
        <span className="absolute bottom-1 left-3 h-2 w-3 rounded-sm bg-gs-violet" />
        <span className="absolute -bottom-1 left-1 h-2 w-2 rounded-full border-2 border-gs-electric border-t-transparent animate-spin" />
        <span className="absolute -bottom-1 left-4 h-2 w-2 rounded-full border-2 border-gs-electric border-t-transparent animate-spin" />
      </span>
      {label ? <span className="text-xs text-gs-muted">{label}</span> : null}
    </span>
  )
}

export default LoadingSpinner
