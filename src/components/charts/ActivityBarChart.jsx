import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null
  }

  const data = payload[0].payload

  return (
    <div className="gs-card px-3 py-2 text-xs text-gs-text">
      <div className="font-semibold">{data.day}</div>
      <div className="text-gs-muted">Hours: {data.hours}</div>
    </div>
  )
}

function ActivityBarChart({ data }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#F1F5FE" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} />
          <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="hours" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ActivityBarChart
