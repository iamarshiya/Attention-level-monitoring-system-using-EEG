import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Cpu, Layers, Brain, Zap } from "lucide-react";

const WS_URL = "ws://127.0.0.1:8000/api/v1/research/stream";

// ── 10-20 scalp head geometry constants ──────────────────────────
const CANVAS_R = 140;         // radius of scalp circle
const CX = 160, CY = 160;    // canvas center

function toCanvas(nx, ny) {
  // normalised [-1,1] → canvas pixel
  return [CX + nx * CANVAS_R, CY - ny * CANVAS_R];
}

// Power → colour (blue=low, red=high)
function powerToColor(norm, alpha = 0.85) {
  const r = Math.round(255 * norm);
  const b = Math.round(255 * (1 - norm));
  const g = Math.round(80  * (1 - Math.abs(norm - 0.5) * 2));
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── ScalpCanvas component ─────────────────────────────────────────
function ScalpCanvas({ topology, activeChannel, onHover }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !topology?.length) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 320, 320);

    // Head circle
    ctx.beginPath();
    ctx.arc(CX, CY, CANVAS_R, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(99,102,241,0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Nose indicator
    ctx.beginPath();
    ctx.moveTo(CX - 12, CY - CANVAS_R + 4);
    ctx.lineTo(CX, CY - CANVAS_R - 16);
    ctx.lineTo(CX + 12, CY - CANVAS_R + 4);
    ctx.strokeStyle = "rgba(148,163,184,0.5)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Ear indicators
    [-1, 1].forEach(side => {
      ctx.beginPath();
      ctx.ellipse(CX + side * (CANVAS_R + 8), CY, 10, 18, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(148,163,184,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Crosshair
    ctx.beginPath();
    ctx.moveTo(CX, CY - CANVAS_R); ctx.lineTo(CX, CY + CANVAS_R);
    ctx.moveTo(CX - CANVAS_R, CY); ctx.lineTo(CX + CANVAS_R, CY);
    ctx.strokeStyle = "rgba(99,102,241,0.1)";
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Channel blobs + labels
    topology.forEach(ch => {
      const [px, py] = toCanvas(ch.x, ch.y);
      const norm = ch.power_norm ?? 0.5;
      const isActive = activeChannel === ch.channel;
      const isBad = ch.quality === "bad";

      // Glow for active
      if (isActive) {
        const grd = ctx.createRadialGradient(px, py, 0, px, py, 22);
        grd.addColorStop(0, "rgba(168,85,247,0.5)");
        grd.addColorStop(1, "rgba(168,85,247,0.0)");
        ctx.beginPath();
        ctx.arc(px, py, 22, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // Channel dot
      const r = isBad ? 9 : 7;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = isBad ? "rgba(239,68,68,0.85)" : powerToColor(norm);
      ctx.fill();
      ctx.strokeStyle = isActive ? "#a855f7" : "rgba(255,255,255,0.2)";
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.stroke();

      // Label
      ctx.font = `bold ${isActive ? 9 : 8}px monospace`;
      ctx.fillStyle = isActive ? "#e2e8f0" : "rgba(226,232,240,0.7)";
      ctx.textAlign = "center";
      ctx.fillText(ch.channel, px, py - r - 2);
    });
  }, [topology, activeChannel]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={320}
      style={{ touchAction: "none", cursor: "crosshair" }}
      onMouseMove={e => {
        const rect = canvasRef.current.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        let closest = null, minDist = 20;
        topology?.forEach(ch => {
          const [px, py] = toCanvas(ch.x, ch.y);
          const d = Math.hypot(mx - px, my - py);
          if (d < minDist) { minDist = d; closest = ch.channel; }
        });
        onHover(closest);
      }}
      onMouseLeave={() => onHover(null)}
    />
  );
}

// ── ICA Component Card ────────────────────────────────────────────
function ICACard({ comp, idx }) {
  const isArtifact = comp.type === "Artifact";
  const colors = isArtifact
    ? { border: "border-red-500/30", badge: "bg-red-500/20 text-red-400", text: "text-red-400" }
    : { border: "border-indigo-500/30", badge: "bg-indigo-500/20 text-indigo-400", text: "text-indigo-400" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08 }}
      className={`bg-slate-800/60 rounded-xl p-4 border ${colors.border} flex flex-col gap-2`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">IC{comp.id}</span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${colors.badge}`}>
          {comp.type.toUpperCase()}
        </span>
      </div>
      <div className={`text-sm font-bold ${colors.text}`}>{comp.label}</div>
      <div className="text-[10px] text-slate-500 font-mono">{comp.lobe} · {comp.dominant_freq}Hz</div>
      <div className="text-[10px] text-slate-400">{comp.variance_explained}% variance</div>
      <div className="h-0.5 w-full bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${isArtifact ? "bg-red-500/60" : "bg-indigo-500/60"}`}
          style={{ width: `${comp.variance_explained}%`, transition: "width 0.5s" }}
        />
      </div>
    </motion.div>
  );
}

// ── Neurofeedback Bar ─────────────────────────────────────────────
function NeurofeedbackBar({ nf }) {
  if (!nf) return null;
  const pct = nf.score_pct ?? 0;
  const inZone = nf.in_target_zone;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-slate-300">
          Target: {nf.target_range}
          <span className="ml-2 font-mono text-[10px] text-slate-500">({nf.protocol})</span>
        </div>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${
          inZone ? "bg-emerald-500/20 text-emerald-400" : "bg-orange-500/20 text-orange-400"
        }`}>
          {inZone ? "IN ZONE" : "OUT"}
        </span>
      </div>

      {/* Progress track */}
      <div className="relative h-8 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
        {/* Target zone shading */}
        <div className="absolute top-0 bottom-0 bg-emerald-500/10 border-x border-emerald-500/20"
          style={{ left: "60%", width: "20%" }} />

        {/* Current score bar */}
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "circOut" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-black text-white drop-shadow">{pct}%</span>
        </div>

        {/* Target zone label */}
        <div className="absolute bottom-0 text-[8px] text-emerald-400 font-bold"
          style={{ left: "60%", transform: "translateX(-50%)" }}>Target 60–80%</div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Rewards",  value: nf.rewards,   color: "text-emerald-400" },
          { label: "Inhibits", value: nf.inhibits,  color: "text-red-400"     },
          { label: "Accuracy", value: `${nf.accuracy}%`, color: "text-indigo-400" },
        ].map(s => (
          <div key={s.label} className="bg-slate-800/60 rounded-lg p-3 text-center border border-slate-700">
            <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Lobe Activation Bar ───────────────────────────────────────────
function LobeBar({ lobe, data }) {
  const alpha = data?.avg_alpha ?? 0;
  const beta  = data?.avg_beta  ?? 0;
  const total = alpha + beta + 0.001;

  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-bold text-slate-400 w-20 shrink-0">{lobe}</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-400/70 rounded-full" style={{ width: `${(alpha / total) * 100}%` }} />
      </div>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-purple-400/70 rounded-full" style={{ width: `${(beta / total) * 100}%` }} />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function Research() {
  const [live, setLive]               = useState(null);
  const [activeChannel, setActiveChannel] = useState(null);
  const [connected, setConnected]     = useState(false);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onopen  = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (e) => {
      const d = JSON.parse(e.data);
      if (d.type === "research") setLive(d);
    };
    return () => ws.close();
  }, []);

  const hovered = live?.topology?.find(t => t.channel === activeChannel);

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs tracking-[0.2em] uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Advanced Neuroimaging Pipeline
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Scalp <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">
              Research Lab
            </span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            ICA · Topology · Neurofeedback · Band Analysis
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-orange-400"}`} />
          <span className="text-xs font-black text-slate-300 tracking-widest">
            {connected ? "RESEARCH WSS LIVE" : "CONNECTING..."}
          </span>
        </div>
      </div>

      {!live && (
        <div className="bg-slate-900/60 border border-slate-700 rounded-2xl p-12 text-center">
          <Brain className="w-12 h-12 text-indigo-400 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400 font-medium">Upload <span className="font-mono text-indigo-400">features_raw.csv</span> then switch to <b>Dashboard</b> stream to begin research analysis.</p>
        </div>
      )}

      {live && (
        <div className="grid lg:grid-cols-2 gap-6">

          {/* ── Scalp Topology Panel ─────────────────────────────── */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Scalp Topography
              </h3>
              <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">10-20 SYSTEM</span>
            </div>

            <div className="flex gap-6 items-start">
              {/* Canvas */}
              <ScalpCanvas
                topology={live.topology}
                activeChannel={activeChannel}
                onHover={setActiveChannel}
              />

              {/* Channel Quality List */}
              <div className="flex-1 space-y-2 max-h-[320px] overflow-y-auto pr-1">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Channel Quality</div>
                <AnimatePresence>
                  {live.topology?.slice(0, 12).map((ch, i) => (
                    <motion.div
                      key={ch.channel}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg transition-colors ${activeChannel === ch.channel ? "bg-slate-800" : "hover:bg-slate-800/50"}`}
                      onMouseEnter={() => setActiveChannel(ch.channel)}
                    >
                      <span className="text-xs font-bold text-slate-300 w-8">{ch.channel}</span>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${ch.quality === "bad" ? "bg-red-500" : ch.quality === "warn" ? "bg-amber-400" : "bg-emerald-400"}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (ch.impedance / 15) * 100)}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 w-10 text-right">{ch.impedance}kΩ</span>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${ch.quality === "bad" ? "bg-red-500" : ch.quality === "warn" ? "bg-amber-400" : "bg-emerald-400"}`} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Hovered channel detail */}
            <AnimatePresence>
              {hovered && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 p-3 bg-slate-800/60 rounded-xl border border-slate-700 grid grid-cols-3 gap-3"
                >
                  <div className="text-center">
                    <div className="text-[10px] text-indigo-300 font-bold uppercase">Alpha</div>
                    <div className="text-sm font-black text-slate-200">{hovered.alpha?.toFixed(3)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-purple-300 font-bold uppercase">Beta</div>
                    <div className="text-sm font-black text-slate-200">{hovered.beta?.toFixed(3)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] text-cyan-300 font-bold uppercase">Theta</div>
                    <div className="text-sm font-black text-slate-200">{hovered.theta?.toFixed(3)}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── ICA Components Panel ──────────────────────────────── */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                ICA Components
              </h3>
              <span className="text-[10px] font-black bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                {live.ica?.status ?? "ANALYZING"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {live.ica?.components?.map((comp, i) => (
                <ICACard key={comp.id} comp={comp} idx={i} />
              ))}
            </div>

            {/* Neurofeedback Protocol */}
            <div className="border-t border-slate-800 pt-4">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2 mb-3">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Neurofeedback Protocol
              </h4>
              <NeurofeedbackBar nf={live.neurofeedback} />
            </div>
          </div>

        </div>
      )}

      {/* ── Lobe Activation + Research Report ──────────────────────── */}
      {live && (
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Lobe Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Lobe Activation Map
            </h3>
            <div className="flex gap-4 text-[9px] text-slate-500 mb-3 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />Alpha</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />Beta</span>
            </div>
            <div className="space-y-3">
              {Object.entries(live.lobe_summary ?? {}).map(([lobe, data]) => (
                <LobeBar key={lobe} lobe={lobe} data={data} />
              ))}
            </div>

            {/* Global Indices */}
            <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3">
              {[
                { label: "Attention Index",  val: live.global_indices?.attention_index,   color: "text-indigo-400" },
                { label: "Theta/Beta Ratio", val: live.global_indices?.theta_beta_ratio,  color: "text-red-400"    },
                { label: "Engagement",       val: live.global_indices?.engagement_index,  color: "text-emerald-400" },
                { label: "Frontal Asym.",    val: live.global_indices?.frontal_alpha_asymmetry, color: "text-amber-400" },
              ].map(m => (
                <div key={m.label} className="bg-slate-800/40 rounded-xl p-3 border border-slate-700">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{m.label}</div>
                  <div className={`text-lg font-black ${m.color}`}>{(m.val ?? 0).toFixed(3)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Research Report */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Brain className="w-4 h-4 text-emerald-400" />
              Research Report
            </h3>
            {live.research_report && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-200">
                    {live.research_report.cognitive_state}
                  </span>
                  <span className="text-2xl font-black text-emerald-400">
                    {live.research_report.attention_score}
                  </span>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-700">
                  {live.research_report.clinical_note}
                </p>

                {/* TBR + FAA */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700">
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest">Theta/Beta Ratio</div>
                    <div className="text-base font-black text-slate-200 mt-1">
                      {live.research_report.theta_beta_ratio?.value?.toFixed(3)}
                    </div>
                    <div className="text-[10px] text-amber-400 mt-0.5">
                      {live.research_report.theta_beta_ratio?.clinical_significance}
                    </div>
                  </div>
                  <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700">
                    <div className="text-[9px] text-slate-500 uppercase tracking-widest">Frontal Asymmetry</div>
                    <div className="text-base font-black text-slate-200 mt-1">
                      {live.research_report.frontal_alpha_asymmetry?.value?.toFixed(3)}
                    </div>
                    <div className="text-[10px] text-cyan-400 mt-0.5">
                      {live.research_report.frontal_alpha_asymmetry?.interpretation}
                    </div>
                  </div>
                </div>

                {/* ICA Summary */}
                <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700">
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-2">ICA Artifact Summary</div>
                  <div className="flex flex-wrap gap-2">
                    {live.research_report.ica_summary?.artifacts_detected?.map(a => (
                      <span key={a} className="text-[10px] px-2 py-0.5 bg-red-500/20 text-red-400 rounded font-bold">{a}</span>
                    ))}
                    {live.research_report.ica_summary?.neural_components?.map(a => (
                      <span key={a} className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded font-bold">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
