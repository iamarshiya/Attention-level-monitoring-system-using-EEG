import { Bell, User, Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-20 w-full flex items-center justify-between px-8 bg-card/60 backdrop-blur-2xl border-b border-slate-200 shadow-2xl z-10 sticky top-0 relative">
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search patient data..." 
            className="w-full bg-slate-100 border border-slate-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 text-slate-900 placeholder-slate-500 transition-all font-sans"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-700 hover:text-slate-900 transition-colors group">
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-1 right-2 w-2 h-2 bg-danger rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,1)]" />
        </button>
        <div className="flex items-center gap-3 border-l border-slate-200 pl-6 cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all group-hover:shadow-[0_0_25px_rgba(168,85,247,0.8)]">
            <div className="w-full h-full bg-slate-50 rounded-full flex items-center justify-center overflow-hidden relative">
              <User className="w-5 h-5 text-slate-800 z-10 relative" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 z-0" />
            </div>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-semibold text-slate-900">Dr. K. Reynolds</span>
            <span className="text-xs text-primary font-medium tracking-wide">LEAD NEUROSCIENTIST</span>
          </div>
        </div>
      </div>
    </header>
  );
}
