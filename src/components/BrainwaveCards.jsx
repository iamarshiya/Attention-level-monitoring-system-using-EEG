import { motion } from "framer-motion";
import { Waves } from "lucide-react";
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
    { name: "Alpha", range: "8-12 Hz", data: data.alpha, color: "#4f46e5", bg: "bg-slate-50" },
    { name: "Beta", range: "12-30 Hz", data: data.beta, color: "#9333ea", bg: "bg-slate-50" },
    { name: "Theta", range: "4-8 Hz", data: data.theta, color: "#0891b2", bg: "bg-slate-50" },
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
          <motion.div key={card.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className={`glass-card p-6 ${card.bg} border border-slate-200 flex flex-col hover:border-slate-300 transition-all group shadow-sm hover:shadow-xl`}>
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
            
            <div className="h-24 w-full">
              <Line data={chartData} options={options} />
            </div>
          </motion.div>
        )
      })}
    </div>
  );
}
