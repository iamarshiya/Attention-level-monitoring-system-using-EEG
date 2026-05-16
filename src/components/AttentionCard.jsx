import { motion } from "framer-motion";
import { Brain } from "lucide-react";

export default function AttentionCard({ score, stateLabel, confidence = 88, explanation }) {
  const getStatus = (val, label) => {
    if (label === "Waiting") return { label: "OFFLINE", color: "text-slate-400", stroke: "rgba(15,23,42,0.1)", glow: "transparent", pulse: false };
    if (val >= 70) return { label: "Optimal Focus", color: "text-success", stroke: "#10b981", glow: "rgba(16,185,129,0.2)", pulse: true };
    if (val >= 40) return { label: "Neutral / Calm", color: "text-warning", stroke: "#f59e0b", glow: "rgba(245,158,11,0.2)", pulse: false };
    return { label: "High Distraction", color: "text-danger", stroke: "#ef4444", glow: "rgba(239,68,68,0.2)", pulse: true };
  };

  const status = getStatus(score, stateLabel);
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((score || 2) / 100) * circumference;

  return (
    <div className="glass-card p-6 h-full flex flex-col items-center justify-between relative overflow-hidden shadow-2xl">
      {status.pulse && (
         <motion.div 
           animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }} 
           transition={{ duration: 2, repeat: Infinity }}
           className="absolute inset-0 z-0 rounded-full"
           style={{ backgroundColor: status.stroke }}
         />
      )}
      
      <div className="w-full flex justify-between items-start z-10">
        <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Neural State</h3>
        <motion.div 
           animate={score > 80 ? { rotate: [0, 10, -10, 0] } : {}}
           transition={{ repeat: Infinity, duration: 2 }}
        >
           <Brain className={`w-5 h-5 ${status.color}`} />
        </motion.div>
      </div>

      <div className="relative flex items-center justify-center z-10 my-4">
        <svg width="160" height="160" className="transform -rotate-90">
          <circle cx="80" cy="80" r={radius} stroke="rgba(15,23,42,0.03)" strokeWidth="10" fill="transparent" />
          <motion.circle 
            cx="80" cy="80" r={radius} stroke={status.stroke} strokeWidth="10" fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset, stroke: status.stroke }}
            transition={{ duration: 1, ease: "circOut" }}
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <motion.span 
            className="text-5xl font-black text-slate-900 tracking-tighter" 
            key={score} 
            initial={{ opacity: 0, scale: 0.5 }} 
            animate={{ opacity: 1, scale: 1 }}
          >
            {score === 0 ? "--" : Math.round(score)}
          </motion.span>
          <div className="flex items-center gap-1">
             <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Index</span>
             {score > 0 && (
                <motion.span 
                  initial={{ opacity: 0, y: 5 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-[10px] font-bold ${score > 70 ? 'text-success' : 'text-danger'}`}
                >
                  {score > 70 ? "▲" : "▼"}
                </motion.span>
             )}
          </div>
        </div>
      </div>

      <div className="w-full space-y-4 z-10">
        <motion.div 
          key={status.label} 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className={`w-full py-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center ${status.color} font-black tracking-tighter text-sm shadow-sm`}
        >
          {status.label.toUpperCase()}
        </motion.div>

        <div className="space-y-1.5">
           <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <span>DL Confidence</span>
              <span className="text-slate-900">{score > 0 ? (confidence || 92) : 0}%</span>
           </div>
           <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: score > 0 ? `${confidence || 92}%` : '0%' }}
                 className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              />
           </div>
        </div>
      </div>
    </div>
  );
}
