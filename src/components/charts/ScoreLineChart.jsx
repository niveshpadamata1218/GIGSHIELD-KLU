import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

function ScoreLineChart({ data }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#F1F5FE" vertical={false} />
          <XAxis dataKey="week" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: '10px',
              border: '1px solid #E2E8F6',
              fontSize: '12px'
            }}
          />
          <ReferenceLine
            y={75}
            stroke="#10B981"
            strokeDasharray="4 4"
            label={{ value: 'Discount threshold', position: 'right', fill: '#10B981', fontSize: 11 }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#F59E0B"
            strokeWidth={2.5}
            fill="url(#scoreFill)"
            dot={{ fill: '#F59E0B', r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ScoreLineChart
