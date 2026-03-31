function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gs-bg" />
      <div className="absolute -top-52 -left-52 h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.07)_0%,transparent_70%)] animate-orb-1" />
      <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.06)_0%,transparent_70%)] animate-orb-2" />
      <div className="absolute top-[40%] right-[10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,transparent_70%)] animate-orb-3" />
      <div className="absolute inset-0 gs-dot-grid" />
    </div>
  )
}

export default AnimatedBackground
