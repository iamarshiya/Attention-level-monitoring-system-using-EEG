import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Waves } from "lucide-react";

export default function BrainwaveCards({ data }) {
  const cards = [
    { name: "Alpha", range: "8-12 Hz", data: data.alpha, color: "#4f46e5", bg: "bg-slate-50" },
    { name: "Beta", range: "12-30 Hz", data: data.beta, color: "#9333ea", bg: "bg-slate-50" },
    { name: "Theta", range: "4-8 Hz", data: data.theta, color: "#0891b2", bg: "bg-slate-50" },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {cards.map((card, idx) => {
        const lastVal = card.data[card.data.length - 1]?.val || 0;
        
        return (
        <motion.div key={card.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className={`glass-card p-6 ${card.bg} border border-slate-200 flex flex-col hover:border-slate-300 transition-all group`}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Waves className="w-5 h-5" style={{ color: card.color }} />
                {card.name}
              </h4>
              <p className="text-xs text-slate-500 font-mono mt-1">{card.range}</p>
            </div>
            <div className="px-2 py-1 bg-white border border-slate-200 rounded font-bold" style={{ color: card.color }}>
              {Math.floor(lastVal)} μV
            </div>
          </div>
          
          <div className="h-20 w-full mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={card.data}>
                <defs>
                  <linearGradient id={`color-${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={card.color} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={card.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="val" stroke={card.color} fillOpacity={1} fill={`url(#color-${idx})`} isAnimationActive={false} strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )})}
    </div>
  );
}
