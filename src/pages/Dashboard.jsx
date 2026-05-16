import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AttentionCard from "../components/AttentionCard";
import RealTimeGraph from "../components/RealTimeGraph";
import BrainwaveCards from "../components/BrainwaveCards";
import AlertPanel from "../components/AlertPanel";

const initGraph = Array.from({length: 60}, (_, i) => ({time: '', attention: 0}));
const initBands = Array.from({length: 20}, () => ({val: 0}));

export default function Dashboard() {
  // True states governed exclusively by FastAPI sockets
  // State encompassing Elite UI metrics
  const [streamData, setStreamData] = useState({ 
    score: 0, 
    state: "Waiting", 
    alpha: 0, 
    beta: 0, 
    theta: 0,
    fatigue: 0,
    stress: 0,
    confidence: 0,
    explanation: "System initializing...",
    trend: "stable",
    drop_detected: false
  });
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [history, setHistory] = useState(initGraph);
  const [bands, setBands] = useState({ alpha: initBands, beta: initBands, theta: initBands });

  useEffect(() => {
    // Kill old dummy loops by using exclusively Native WebSockets mapped to python.
    const ws = new WebSocket("ws://127.0.0.1:8000/api/v1/stream");
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.state === "Waiting") return; // Block dummy execution if no file uploaded
      
      setStreamData(data);
      setHistory(prev => [...prev.slice(1), { time: data.timestamp, attention: data.score }]);
      setBands(prev => ({
        alpha: [...prev.alpha.slice(1), { val: data.alpha }],
        beta: [...prev.beta.slice(1), { val: data.beta }],
        theta: [...prev.theta.slice(1), { val: data.theta }]
      }));
    };

    return () => ws.close();
  }, []);

  const isActive = streamData.state !== "Waiting";

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      // Small feedback ping
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
      audio.volume = 0.2;
      audio.play().catch(() => {});
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 pb-10">
      {/* Patient Context & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-[0.2em] uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live Neural Telemetry
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Cognitive <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Command Center</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Session ID: <span className="text-slate-900 font-mono">EEG-2024-X92</span> • Subject: <span className="text-slate-900">Marcus Wright (A-01)</span></p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={toggleSound}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-bold text-xs ${soundEnabled ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white border-slate-200 text-slate-400 opacity-60'}`}
          >
            {soundEnabled ? "🔊 AUDIO ALERTS ACTIVE" : "🔇 AUDIO MUTED"}
          </button>
          
          <div className="flex items-center gap-3 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isActive ? 'bg-success' : 'bg-warning'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isActive ? 'bg-success' : 'bg-warning'}`}></span>
            </span>
            <span className={`text-xs font-black tracking-widest ${isActive ? 'text-success' : 'text-warning'}`}>
              {isActive ? 'WSS ENCRYPTED LINK' : 'LINK OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <AttentionCard 
            score={streamData.score} 
            stateLabel={streamData.state} 
            confidence={streamData.confidence}
            explanation={streamData.explanation}
          />
        </div>
        <div className="lg:col-span-3">
           <div className="grid md:grid-cols-2 gap-6 h-full">
              <AlertPanel streamData={{...streamData, soundEnabled}} />
              
              <div className="glass-card p-6 flex flex-col justify-between border-l-4 border-l-primary shadow-xl">
                 <div>
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="p-1.5 bg-primary/10 rounded-lg text-primary">🧠</span>
                          Explainable AI Context
                       </h3>
                       <span className="text-[10px] font-bold bg-slate-100 text-slate-400 px-2 py-0.5 rounded uppercase tracking-tighter">RF Model V2.4</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">
                       {isActive ? streamData.explanation : "Waiting for real-time neural data ingestion to begin analysis..."}
                    </p>
                 </div>
                 
                 <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>Physical Fatigue</span>
                          <span className="text-slate-700">{Math.round(streamData.fatigue)}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${streamData.fatigue}%` }}
                             className="h-full bg-accent rounded-full"
                          />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <span>Stress Index</span>
                          <span className="text-slate-700">{Math.round(streamData.stress)}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${streamData.stress}%` }}
                             className="h-full bg-secondary rounded-full"
                          />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <BrainwaveCards data={bands} />

      <div className="glass-card p-8 h-[450px] shadow-2xl group">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900">Neural Analytics Trace</h3>
            <p className="text-xs text-slate-400 font-medium">Real-time prediction drift across 12-bit EEG spectrum</p>
          </div>
          <div className="flex gap-2">
             <button className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold hover:bg-slate-200 transition-colors uppercase tracking-widest">1 MIN</button>
             <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-bold shadow-lg shadow-primary/30 uppercase tracking-widest">LIVE DATA</button>
          </div>
        </div>
        <RealTimeGraph data={history} />
      </div>
    </div>
  );
}
