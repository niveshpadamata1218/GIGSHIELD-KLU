function StatCard({
  label,
  value,
  sublabel,
  color = 'text-gs-electric',
  accent,
  trend
}) {
  const borderClass = accent || color.replace('text-', 'border-t-') || 'border-t-gs-electric'

  return (
    <div className={`gs-card gs-card-hover flex flex-col gap-2 border-t-4 ${borderClass} px-5 py-4`}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gs-muted">
        {label}
      </span>
      <span className={`font-mono text-2xl ${color}`}>{value}</span>
      {sublabel ? <span className="text-xs text-gs-dim">{sublabel}</span> : null}
      {trend ? (
        <span className={`text-xs font-medium ${trend.color}`}>{trend.label}</span>
      ) : null}
    </div>
  )
}

export default StatCard
