function Card({ accent, className = '', children }) {
  const accentStyles = accent
    ? `border-l-4 ${accent} pl-5`
    : 'border border-gs-border'

  return <div className={`gs-card ${accentStyles} ${className}`}>{children}</div>
}

export default Card
