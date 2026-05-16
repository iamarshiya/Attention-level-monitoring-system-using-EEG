import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Upload as UploadIcon, 
  Activity, 
  Settings as SettingsIcon,
  BrainCircuit,
  PanelLeftClose,
  PanelLeftOpen,
  FlaskConical
} from "lucide-react";
import { cn } from "../utils/cn";

const NAV_ITEMS = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Upload Data", path: "/upload", icon: UploadIcon },
  { name: "Research Lab", path: "/research", icon: FlaskConical },
  { name: "Analytics", path: "/analytics", icon: Activity },
  { name: "Settings", path: "/settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside 
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className="glass-card flex flex-col h-full m-4 mr-0 z-20 border-r border-slate-100"
    >
      <div className="flex z-10 items-center justify-between p-6">
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex items-center gap-3 text-slate-900 font-semibold text-lg"
          >
            <BrainCircuit className="text-primary w-7 h-7 drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
            <span>NerveNet</span>
          </motion.div>
        )}
        {collapsed && (
          <BrainCircuit className="text-primary w-7 h-7 mx-auto drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
        )}
      </div>

      <nav className="flex-1 px-4 mt-6 z-10 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-300 group relative",
                isActive 
                  ? "bg-primary/20 text-slate-900 shadow-[inset_0_0_20px_rgba(99,102,241,0.2)]" 
                  : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full shadow-[0_0_15px_rgba(99,102,241,1)]"
                />
              )}
              <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.8)]")} />
              {!collapsed && (
                <span className="font-medium whitespace-nowrap">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 z-10">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex w-full items-center justify-center p-3 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>
    </motion.aside>
  );
}
