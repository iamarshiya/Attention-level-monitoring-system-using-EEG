import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Activity, Brain, Shield, Zap, MoveRight, Layers, Workflow, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-hidden font-sans selection:bg-primary/30">
      
      {/* Navbar for Landing */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Brain className="w-8 h-8 text-primary shadow-primary/50 drop-shadow-md" />
          <span className="text-xl font-bold tracking-tight text-slate-900">NerveNet AI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-medium hover:text-slate-900 transition-colors">Login</Link>
          <Link to="/dashboard" className="px-5 py-2 rounded-full bg-primary text-slate-900 font-semibold text-sm hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            Go to Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 flex flex-col items-center justify-center text-center">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }} 
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} 
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-secondary/20 blur-[120px]" 
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-slate-100 border border-slate-200 text-primary text-sm font-semibold mb-6 shadow-xl">
            Neurological Analytics 2.0
          </span>
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-slate-500 mb-6 drop-shadow-lg">
            AI-Powered EEG Attention Monitoring
          </h1>
          <p className="text-lg lg:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Real-time cognitive state detection using sophisticated brainwave analysis and machine learning. Elevate performance, safety, and focus.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-slate-900 font-bold text-lg hover:scale-105 transition-all shadow-[0_0_30px_rgba(168,85,247,0.6)] flex items-center justify-center gap-2 group">
              Start Monitoring
              <MoveRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-100 border border-slate-200 text-slate-900 font-bold text-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              View Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative z-10 bg-slate-100 border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Core Capabilities</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Our models process raw neuro-data to provide instantaneous, actionable insights.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Brain, title: "AI Analysis", desc: "Proprietary deep learning models decode complex neurological patterns with 99.4% accuracy.", color: "text-primary", bg: "bg-primary/10" },
              { icon: Activity, title: "Real-Time Tracking", desc: "Zero-latency streaming of focus states and mental fatigue indicators.", color: "text-secondary", bg: "bg-secondary/10" },
              { icon: Zap, title: "Brainwave Insights", desc: "Granular breakdown of Alpha, Beta, Theta, and Gamma frequencies.", color: "text-accent", bg: "bg-accent/10" }
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="glass-card p-8 group hover:border-slate-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works & Applications */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <span className="text-primary font-semibold tracking-wider text-sm uppercase mb-2 block">Workflow</span>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-8">How it works</h2>
            <div className="space-y-8">
              {[
                { step: "01", title: "Connect Hardware", desc: "Seamlessly integrate with consumer or clinical grade EEG headsets." },
                { step: "02", title: "Signal Processing", desc: "Raw data is filtered to remove artifacts and isolate cognitive bands." },
                { step: "03", title: "Actionable Output", desc: "View real-time attention scores and receive predictive alerts." }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-900 group-hover:bg-primary/20 group-hover:border-primary/50 group-hover:text-primary transition-all">
                      {item.step}
                    </div>
                    {idx !== 2 && <div className="w-[1px] h-12 bg-slate-200 mt-2" />}
                  </div>
                  <div className="pt-2">
                    <h4 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-10 relative overflow-hidden h-full flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-[80px] rounded-full pointer-events-none" />
            
            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Layers className="text-secondary" />
              Applications
            </h3>
            
            <ul className="space-y-6">
              {[
                { title: "Healthcare", desc: "Monitor cognitive decline, ADHD therapies, and post-surgery focus recovery." },
                { title: "Education", desc: "Optimize learning environments by tracking collective class attention spans." },
                { title: "Productivity", desc: "Prevent burnout in high-stakes environments like air traffic control or day trading." }
              ].map((app, idx) => (
                <li key={idx} className="flex gap-4 items-start">
                  <CheckCircle className="w-6 h-6 text-accent shrink-0 mt-1" />
                  <div>
                    <h5 className="font-bold text-slate-900 text-lg">{app.title}</h5>
                    <p className="text-slate-400 text-sm mt-1">{app.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

    </div>
  );
}
