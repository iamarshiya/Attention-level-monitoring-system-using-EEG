import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Activity, Info, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export default function AlertPanel() {
  const [alerts, setAlerts] = useState([
    { id: 1, type: "info", message: "Calibration complete. Baseline established.", time: "02:14:00" },
    { id: 2, type: "success", message: "Alpha band locking optimal stability.", time: "02:22:15" },
    { id: 3, type: "warning", message: "Theta waves elevated. Fatigue detected.", time: "02:35:40" },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.85) {
        setAlerts(prev => {
          const newAlert = {
            id: Date.now(),
            type: rand > 0.95 ? "error" : "warning",
            message: rand > 0.95 ? "Critical attention drop detected (<30)" : "Minor interference in frontal lobe region.",
            time: new Date().toISOString().substring(11, 19)
          };
          return [newAlert, ...prev].slice(0, 4);
        });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <Activity className="w-5 h-5" /> Subconscious Event Log
        </h3>
        <span className="text-xs font-semibold px-2 py-1 bg-slate-200 rounded-full text-slate-400">Live Stream</span>
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
              
              <div className="shrink-0 mt-1">
                {alert.type === "error" && <Zap className="w-5 h-5 text-danger drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />}
                {alert.type === "warning" && <AlertCircle className="w-5 h-5 text-warning drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />}
                {alert.type === "info" && <Info className="w-5 h-5 text-primary" />}
                {alert.type === "success" && <Activity className="w-5 h-5 text-success" />}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${alert.type === 'error' ? 'text-danger font-bold' : 'text-slate-800'}`}>
                  {alert.message}
                </p>
                <div className="text-xs text-slate-400 mt-1 font-mono">{alert.time} • T-01</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
