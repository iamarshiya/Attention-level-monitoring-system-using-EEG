import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Bell, Database, ShieldAlert, Cpu } from "lucide-react";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [model, setModel] = useState("transformer");

  const Toggle = ({ enabled, onChange }) => (
    <button 
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark ${
        enabled ? 'bg-primary shadow-[0_0_15px_rgba(99,102,241,0.6)]' : 'bg-slate-200'
      }`}
    >
      <span 
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-300 ${
          enabled ? 'translate-x-8' : 'translate-x-1'
        }`} 
      />
    </button>
  );

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">System Preferences</h1>
        <p className="text-slate-400">Configure core engine parameters and interface behavior.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Appearance & Interface */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 flex flex-col gap-8"
        >
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <Moon className="w-6 h-6 text-secondary" />
            <h3 className="text-xl font-bold text-slate-900">Interface</h3>
          </div>
          
          <div className="flex items-center justify-between group">
            <div>
              <p className="font-semibold text-slate-900 group-hover:text-primary transition-colors">Theme Engine</p>
              <p className="text-sm text-slate-400 mt-1">Force dark mode for optimal viewing in lab environments.</p>
            </div>
            <div className="flex items-center gap-3">
              <Sun className="w-4 h-4 text-slate-400" />
              <Toggle enabled={darkMode} onChange={setDarkMode} />
              <Moon className="w-4 h-4 text-slate-900 drop-shadow-[0_0_5px_rgba(15,23,42,0.8)]" />
            </div>
          </div>

          <div className="flex items-center justify-between group">
            <div>
              <p className="font-semibold text-slate-900 group-hover:text-primary transition-colors">Telemetry Alerts</p>
              <p className="text-sm text-slate-400 mt-1">Enable sensory notifications on critical threshold cross.</p>
            </div>
            <Toggle enabled={notifications} onChange={setNotifications} />
          </div>

          <div className="flex items-center justify-between group">
            <div>
              <p className="font-semibold text-slate-900 group-hover:text-primary transition-colors">Auto-Save Buffer</p>
              <p className="text-sm text-slate-400 mt-1">Continuously dump raw EEG stream to local disk.</p>
            </div>
            <Toggle enabled={autoSave} onChange={setAutoSave} />
          </div>
        </motion.div>

        {/* Model & AI Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 flex flex-col gap-8"
        >
          <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
            <Cpu className="w-6 h-6 text-accent" />
            <h3 className="text-xl font-bold text-slate-900">Neural Engine</h3>
          </div>
          
          <div>
            <p className="font-semibold text-slate-900 mb-2">Active Classifier Model</p>
            <p className="text-sm text-slate-400 mb-4">Select the foundational architecture for real-time inference.</p>
            
            <div className="grid gap-4">
              {[
                { id: "transformer", name: "EEG-Transformer (v4.2)", desc: "Highest accuracy. Attentional parsing across 64 channels.", rec: true },
                { id: "cnn", name: "ConvNet Fast-Path", desc: "Lowest latency. Best for gaming or rapid feedback loops.", rec: false },
                { id: "hybrid", name: "Hybrid LSTM", desc: "Legacy compatibility mode. Good for noisy datasets.", rec: false }
              ].map((m) => (
                <div 
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    model === m.id 
                      ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(99,102,241,0.15)] relative overflow-hidden' 
                      : 'border-slate-200 bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  {model === m.id && <div className="absolute top-0 right-0 w-8 h-8 bg-primary/20 blur-xl rounded-full" />}
                  <div className="flex justify-between items-center mb-1 relative z-10">
                    <span className={`font-bold ${model === m.id ? 'text-slate-900' : 'text-slate-700'}`}>{m.name}</span>
                    {m.rec && <span className="text-xs px-2 py-0.5 bg-success/20 text-success rounded font-semibold tracking-wider">RECOMMENDED</span>}
                  </div>
                  <p className="text-sm text-slate-400 relative z-10">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </motion.div>

        {/* System Status Footnote */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2 glass-card p-6 flex items-center justify-between border-danger/30 bg-danger/5"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-danger/20 rounded-full">
              <ShieldAlert className="w-6 h-6 text-danger" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Emergency Override</h4>
              <p className="text-sm text-slate-400">Instantly halt data collection and purge volatile memory.</p>
            </div>
          </div>
          <button className="px-6 py-3 rounded-xl bg-danger/20 text-danger font-bold hover:bg-danger hover:text-slate-900 hover:shadow-[0_0_20px_rgba(239,68,68,0.8)] transition-all uppercase tracking-wide">
            Purge Data
          </button>
        </motion.div>

      </div>
    </div>
  );
}
