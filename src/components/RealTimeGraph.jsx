import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function RealTimeGraph({ data }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length && payload[0].value > 0) {
      return (
        <div className="glass-card p-3 border border-slate-200 shadow-lg bg-white">
          <p className="text-slate-500 text-xs mb-1 font-mono">{label}</p>
          <p className="font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Score: <span className="text-primary">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full pb-8">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" vertical={false} />
          <XAxis dataKey="time" stroke="rgba(15,23,42,0.2)" tick={{ fill: 'rgba(15,23,42,0.5)', fontSize: 12, fontFamily: 'monospace' }} tickMargin={10} minTickGap={20} />
          <YAxis stroke="rgba(15,23,42,0.2)" tick={{ fill: 'rgba(15,23,42,0.5)', fontSize: 12, fontFamily: 'monospace' }} domain={[0, 100]} tickCount={6} tickMargin={10} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" dataKey="attention" stroke="#4f46e5" strokeWidth={3} dot={false}
            activeDot={{ r: 6, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
