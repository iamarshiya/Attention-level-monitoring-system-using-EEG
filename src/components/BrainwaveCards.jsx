import { motion } from "framer-motion";
import { Waves, Info } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler
);

export default function BrainwaveCards({ data }) {
  const cards = [
    { name: "Alpha", range: "8-12 Hz", data: data.alpha, color: "#4f46e5", bg: "bg-slate-50", desc: "Associated with relaxation and calm focus." },
    { name: "Beta", range: "12-30 Hz", data: data.beta, color: "#9333ea", bg: "bg-slate-50", desc: "Associated with active thinking, stress, or high alertness." },
    { name: "Theta", range: "4-8 Hz", data: data.theta, color: "#0891b2", bg: "bg-slate-50", desc: "Associated with drowsiness, deep relaxation, or meditation." },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {cards.map((card, idx) => {
        const lastVal = card.data[card.data.length - 1]?.val || 0;
        
        const chartData = {
          labels: card.data.map((_, i) => i),
          datasets: [
            {
              fill: true,
              data: card.data.map(d => d.val),
              borderColor: card.color,
              backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 80);
                gradient.addColorStop(0, `${card.color}80`);
                gradient.addColorStop(1, `${card.color}00`);
                return gradient;
              },
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.4,
            },
          ],
        };

        const options = {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          scales: {
            x: { display: false },
            y: { display: false }
          },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          }
        };

        return (
          <motion.div key={card.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className={`glass-card p-6 ${card.bg} border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-all group shadow-sm hover:shadow-xl relative overflow-hidden`}>
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] transform translate-x-8 -translate-y-8 rounded-full" style={{ backgroundColor: card.color }}></div>

            <div className="flex justify-between items-start mb-2 relative z-10">
              <div>
                <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2 group cursor-help relative">
                  <div className="p-1.5 rounded-md text-white shadow-sm" style={{ backgroundColor: card.color }}>
                    <Waves className="w-4 h-4" />
                  </div>
                  {card.name}
                  <Info className="w-4 h-4 text-slate-400" />
                  <div className="absolute left-0 top-full mt-2 w-48 p-2 bg-slate-900 text-white text-[10px] leading-tight rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl font-medium">
                    {card.desc}
                  </div>
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-1 font-semibold tracking-wide bg-white px-2 py-0.5 rounded-full inline-block border border-slate-100">{card.range}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-2xl font-black tracking-tighter" style={{ color: card.color }}>
                  {lastVal.toFixed(3)}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">μV Power</span>
              </div>
            </div>
            
            <div className="h-24 w-full relative z-10 mt-2">
              <Line data={chartData} options={options} />
            </div>
          </motion.div>
        )
      })}
    </div>
  );
}
