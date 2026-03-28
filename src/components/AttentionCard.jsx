import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export default function AttentionCard({ score, stateLabel }) {
  const getStatus = (val, label) => {
    if (label === "Waiting") return { label: "AWAITING DATA", color: "text-slate-500", stroke: "rgba(15,23,42,0.1)", glow: "transparent" };
    if (val >= 70) return { label: "Focused", color: "text-success", stroke: "#10b981", glow: "rgba(16,185,129,0.15)" };
    if (val >= 40) return { label: "Neutral", color: "text-warning", stroke: "#f59e0b", glow: "rgba(245,158,11,0.15)" };
    return { label: "Distracted", color: "text-danger", stroke: "#ef4444", glow: "rgba(239,68,68,0.15)" };
  };

  const status = getStatus(score, stateLabel);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((score || 0.1) / 100) * circumference;

  return (
    <div className="glass-card p-6 h-full flex flex-col items-center justify-center relative overflow-hidden">
      <motion.div animate={{ backgroundColor: status.glow }} transition={{ duration: 1 }} className="absolute inset-0 opacity-50 blur-[80px] -z-10" />

      <div className="w-full flex justify-between items-start mb-4">
        <h3 className="font-semibold text-slate-700">Cognitive State</h3>
        <Brain className="w-5 h-5 text-slate-400" />
      </div>

      <div className="relative flex items-center justify-center mb-4">
        <svg width="180" height="180" className="transform -rotate-90">
          <circle cx="90" cy="90" r={radius} stroke="rgba(15,23,42,0.05)" strokeWidth="12" fill="transparent" />
          <motion.circle 
            cx="90" cy="90" r={radius} stroke={status.stroke} strokeWidth="12" fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset, stroke: status.stroke }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <motion.span className="text-4xl font-black text-slate-900" key={score} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
            {score === 0 ? "--" : score}
          </motion.span>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">INDEX</span>
        </div>
      </div>

      <motion.div key={status.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 ${status.color} font-bold tracking-wide shadow-sm text-sm`}>
        {status.label.toUpperCase()}
      </motion.div>
    </div>
  );
}
