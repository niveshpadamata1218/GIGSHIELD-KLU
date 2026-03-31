const base =
  'inline-flex items-center justify-center gap-2 rounded-[10px] px-6 py-3 text-sm font-semibold transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-gs-electric/40 disabled:cursor-not-allowed disabled:opacity-60'

const variants = {
  primary:
    'bg-gradient-to-br from-gs-electric to-gs-violet text-white shadow-[0_4px_14px_rgba(14,165,233,0.3)] hover:scale-[1.02]',
  secondary:
    'bg-white text-gs-text border border-gs-border hover:border-gs-electric hover:text-gs-electric',
  danger:
    'bg-red-50 text-gs-danger border border-gs-danger/40 hover:border-gs-danger',
  warning:
    'bg-orange-50 text-gs-warning border border-gs-warning/40 hover:border-gs-warning'
}

function Button({ variant = 'primary', className = '', ...props }) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}

export default Button
