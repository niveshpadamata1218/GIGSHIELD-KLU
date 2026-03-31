import {
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const getDotColor = (score) => {
  if (score >= 70) return '#EF4444'
  if (score >= 50) return '#F97316'
  return '#10B981'
}

const CustomDot = (props) => {
  const { cx, cy, payload } = props
  const color = getDotColor(payload.fraudScore)

  return <circle cx={cx} cy={cy} r={5} fill={color} />
}

function FraudScatterChart({ data }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid stroke="#F1F5FE" />
          <XAxis type="number" dataKey="gigScore" domain={[0, 100]} tick={{ fill: '#94A3B8' }} />
          <YAxis type="number" dataKey="fraudScore" domain={[0, 100]} tick={{ fill: '#94A3B8' }} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              borderRadius: '10px',
              border: '1px solid #E2E8F6',
              fontSize: '12px'
            }}
          />
          <ReferenceLine x={75} stroke="#10B981" strokeDasharray="4 4" />
          <ReferenceLine y={50} stroke="#EF4444" strokeDasharray="4 4" />
          <Scatter data={data} shape={CustomDot} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

export default FraudScatterChart
