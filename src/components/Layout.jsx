import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { EEGStreamProvider } from "../utils/EEGStreamContext";

export default function Layout() {
  return (
    <EEGStreamProvider>
      <div className="flex h-screen w-full bg-slate-50 text-slate-800 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 w-full h-full">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-dark to-dark pointer-events-none -z-10" />
            <Outlet />
          </main>
        </div>
      </div>
    </EEGStreamProvider>
  );
}

