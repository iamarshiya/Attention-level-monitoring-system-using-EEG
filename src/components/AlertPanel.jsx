import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Activity, Info, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export default function AlertPanel({ streamData }) {
  const [alerts, setAlerts] = useState([
    { id: 1, type: "info", message: "Calibration complete. Baseline established.", time: "00:00:00" },
  ]);

  useEffect(() => {
    if (!streamData || streamData.state === "Waiting") return;

    if (streamData.drop_detected) {
      // Audio Alert Trigger
      if (streamData.soundEnabled) {
         const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
         audio.volume = 0.3;
         audio.play().catch(() => {});
      }

      setAlerts(prev => {
        const newAlert = {
          id: Date.now(),
          type: "error",
          priority: "CRITICAL",
          message: `Attention drop! Score: ${Math.round(streamData.score)}. Recommendation: Take a 5min break.`,
          time: streamData.timestamp
        };
        if (prev.length > 0 && prev[0].message === newAlert.message) return prev;
        return [newAlert, ...prev].slice(0, 4);
      });
    } else if (streamData.trend === "increasing" && streamData.score >= 85) {
      setAlerts(prev => {
        const newAlert = {
          id: Date.now(),
          type: "success",
          priority: "STABLE",
          message: `Optimal Beta-band locking. System coherence 94.2%.`,
          time: streamData.timestamp
        };
        if (prev.length > 0 && prev[0].message === newAlert.message) return prev;
        return [newAlert, ...prev].slice(0, 4);
      });
    }
  }, [streamData]);

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <Activity className="w-5 h-5" /> Cognitive Event Stream
        </h3>
        <span className="text-xs font-semibold px-2 py-1 bg-slate-200 rounded-full text-slate-400">Live Diagnostics</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-smooth">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className={`p-4 rounded-xl border border-slate-100 bg-slate-100 flex items-start gap-4 hover:bg-slate-200 transition-colors relative overflow-hidden`}
            >
              {alert.type === "error" && <div className="absolute inset-0 bg-danger/10 animate-pulse pointer-events-none" />}
              {alert.type === "warning" && <div className="absolute inset-0 bg-warning/5 animate-pulse pointer-events-none" />}
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded leading-none ${alert.type === 'error' ? 'bg-danger text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {alert.priority || "LOG"}
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono tracking-tighter">{alert.time}</div>
                </div>
                <p className={`text-sm font-medium leading-snug ${alert.type === 'error' ? 'text-danger font-bold' : 'text-slate-800'}`}>
                  {alert.message}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
