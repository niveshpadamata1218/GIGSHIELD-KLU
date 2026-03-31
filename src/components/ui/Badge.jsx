const badgeStyles = {
  active: 'bg-emerald-50 text-gs-success border-emerald-200',
  pending: 'bg-orange-50 text-gs-warning border-orange-200',
  fraud: 'bg-red-50 text-gs-danger border-red-200',
  paid: 'bg-blue-50 text-gs-electric border-blue-200',
  clear: 'bg-emerald-50 text-gs-success border-emerald-200'
}

function Badge({ status = 'active', label }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.06em] ${
        badgeStyles[status] || badgeStyles.active
      }`}
    >
      {label}
    </span>
  )
}

export default Badge
