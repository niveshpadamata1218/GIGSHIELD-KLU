import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAdminStore } from '../../store/adminStore'

const filters = ['All', 'Active', 'Suspended', 'Plan type']

function WorkerRegistry() {
  const { workers } = useAdminStore()
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = workers.filter((worker) =>
    worker.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      className="flex flex-col gap-8"
    >
      <div>
        <h1 className="font-display text-2xl font-semibold text-gs-text">Worker registry</h1>
        <p className="text-sm text-gs-muted">Search and audit worker profiles.</p>
      </div>

      <div className="gs-card px-6 py-5">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or phone"
          className="w-full rounded-[10px] border border-gs-border bg-gs-bg px-4 py-3 text-sm"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                activeFilter === filter
                  ? 'bg-blue-50 text-gs-electric'
                  : 'bg-gs-surface-2 text-gs-muted'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="gs-card px-6 py-5">
        <div className="text-sm font-semibold text-gs-text">Workers</div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.08em] text-gs-muted">
              <tr>
                <th className="py-2">ID</th>
                <th className="py-2">Name</th>
                <th className="py-2">Phone</th>
                <th className="py-2">Platform</th>
                <th className="py-2">Plan</th>
                <th className="py-2">Gig Score</th>
                <th className="py-2">Status</th>
                <th className="py-2">Join date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((worker) => (
                <tr key={worker.id} className="border-t border-gs-border">
                  <td className="py-3 font-mono text-xs text-gs-muted">{worker.id}</td>
                  <td className="py-3">{worker.name}</td>
                  <td className="py-3">{worker.phone}</td>
                  <td className="py-3">{worker.platform}</td>
                  <td className="py-3">{worker.plan}</td>
                  <td
                    className={`py-3 font-mono ${
                      worker.gigScore >= 75
                        ? 'text-gs-success'
                        : worker.gigScore >= 60
                        ? 'text-gs-gold'
                        : worker.gigScore >= 40
                        ? 'text-gs-warning'
                        : 'text-gs-danger'
                    }`}
                  >
                    {worker.gigScore}
                  </td>
                  <td className="py-3 capitalize">{worker.status}</td>
                  <td className="py-3">{worker.joinDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

export default WorkerRegistry
