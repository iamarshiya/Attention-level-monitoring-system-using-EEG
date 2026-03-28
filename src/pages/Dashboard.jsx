import { useEffect, useState } from "react";
import AttentionCard from "../components/AttentionCard";
import RealTimeGraph from "../components/RealTimeGraph";
import BrainwaveCards from "../components/BrainwaveCards";
import AlertPanel from "../components/AlertPanel";

const initGraph = Array.from({length: 60}, (_, i) => ({time: '', attention: 0}));
const initBands = Array.from({length: 20}, () => ({val: 0}));

export default function Dashboard() {
  // True states governed exclusively by FastAPI sockets
  const [streamData, setStreamData] = useState({ score: 0, state: "Waiting", alpha: 0, beta: 0, theta: 0 });
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Inference Dashboard</h1>
          <p className="text-slate-500">{isActive ? "Processing Live Remote Dataset" : "Go to Upload tab to activate stream."}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isActive ? 'bg-success' : 'bg-warning'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isActive ? 'bg-success' : 'bg-warning'}`}></span>
          </span>
          <span className={`text-sm font-medium ${isActive ? 'text-success' : 'text-warning'}`}>
            {isActive ? 'Backend WebSockets Linked' : 'Awaiting CSV Upload'}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {/* Passed down identically so child has zero dummy functions */}
          <AttentionCard score={streamData.score} stateLabel={streamData.state} />
        </div>
        <div className="lg:col-span-2">
          <AlertPanel />
        </div>
      </div>

      <BrainwaveCards data={bands} />

      <div className="glass-card p-6 h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Backend Analytics Trace</h3>
        </div>
        <RealTimeGraph data={history} />
      </div>
    </div>
  );
}
