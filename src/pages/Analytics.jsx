import { PieChart, Pie, Cell, Tooltip as PieTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { ListFilter, Calendar, Download } from "lucide-react";

const pieData = [
  { name: 'Focused', value: 65, color: '#22c55e' },
  { name: 'Neutral', value: 25, color: '#eab308' },
  { name: 'Distracted', value: 10, color: '#ef4444' },
];

const barData = [
  { subject: 'Sub-01', accuracy: 94 },
  { subject: 'Sub-02', accuracy: 88 },
  { subject: 'Sub-03', accuracy: 96 },
  { subject: 'Sub-04', accuracy: 91 },
  { subject: 'Sub-05', accuracy: 85 },
  { subject: 'Sub-06', accuracy: 98 },
];

export default function Analytics() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Aggregate Analytics</h1>
          <p className="text-slate-400">Longitudinal evaluation of cohort cognitive models.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors text-slate-700 font-medium">
            <Calendar className="w-4 h-4" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 rounded-lg hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.5)] font-semibold">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8 h-[450px] flex flex-col"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-slate-900">Attention Distribution</h3>
            <ListFilter className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-900" />
          </div>
          <p className="text-sm text-slate-400 mb-8">Average state distribution across all recorded sessions.</p>
          
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={140}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: `drop-shadow(0px 0px 8px ${entry.color}80)` }} />
                  ))}
                </Pie>
                <PieTooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: 'rgba(15,23,42,0.1)', borderRadius: '12px', padding: '12px' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-slate-900 drop-shadow-lg">65%</span>
              <span className="text-sm text-success font-semibold tracking-widest mt-1">PEAK FOCUS</span>
            </div>
          </div>
          
          <div className="flex justify-center gap-6 mt-6">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color, boxShadow: `0 0 10px ${d.color}` }} />
                <span className="text-sm text-slate-700 font-medium">{d.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 h-[450px] flex flex-col"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-slate-900">Model Accuracy Analysis</h3>
            <span className="px-3 py-1 bg-primary/20 text-primary font-bold rounded-lg text-sm">Target: 90%+</span>
          </div>
          <p className="text-sm text-slate-400 mb-8">Cross-subject validation of the Deep Learning EEG classifier.</p>
          
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.05)" vertical={false} />
                <XAxis dataKey="subject" stroke="rgba(15,23,42,0.3)" tick={{ fill: 'rgba(15,23,42,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(15,23,42,0.3)" tick={{ fill: 'rgba(15,23,42,0.5)', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <BarTooltip 
                  cursor={{ fill: 'rgba(15,23,42,0.05)' }} 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(15,23,42,0.1)', borderRadius: '12px' }}
                />
                <Bar 
                  dataKey="accuracy" 
                  fill="url(#colorUv)" 
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.accuracy >= 90 ? '#a855f7' : '#06b6d4'} style={{ filter: entry.accuracy >= 90 ? 'drop-shadow(0 0 10px rgba(168,85,247,0.5))' : 'drop-shadow(0 0 10px rgba(6,182,212,0.5))' }} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
