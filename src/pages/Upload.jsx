import { useState, useRef } from "react";
import { Upload as UploadIcon, FileJson, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState("idle"); 
  const [parsedRows, setParsedRows] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv') || droppedFile.type === 'text/csv') setFile(droppedFile);
      else alert("Please upload a valid CSV.");
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    
    // Transmit exactly to the FastAPI Backend
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/upload", {
            method: "POST",
            body: formData,
        });
        
        if (!response.ok) throw new Error("Backend rejection.");
        const data = await response.json();
        
        setParsedRows(data.parsed_rows);
        setStatus("success");
        setTimeout(() => { setFile(null); setStatus("idle"); }, 3000);
    } catch(err) {
        console.error("Backend offline or upload failed.", err);
        setStatus("idle");
        alert("Failed to connect to the backend API.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-full flex flex-col justify-center animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Deploy Raw Dataset Node</h1>
        <p className="text-slate-500">Transmit a standard EEG CSV to the backend ML inference engine.</p>
      </div>

      <div 
        className={`glass-card p-12 mt-8 flex flex-col items-center justify-center text-center transition-all ${
          isDragging ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'border-dashed border-slate-300 hover:border-slate-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm relative">
          <UploadIcon className={`w-10 h-10 ${isDragging ? 'text-primary scale-110' : 'text-slate-400'} transition-all`} />
          {isDragging && <div className="absolute inset-0 border-2 border-primary rounded-full animate-ping opacity-50" />}
        </div>
        
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Drop payload node here</h3>
        <p className="text-slate-500 mb-8 max-w-sm">Requires standard CSV header configuration corresponding to your runtime setup.</p>

        <input type="file" accept=".csv" ref={fileInputRef} onChange={handleChange} className="hidden" />
        <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors text-slate-900 font-medium">
          Select Package
        </button>
      </div>

      <AnimatePresence>
        {file && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/10 text-secondary rounded-lg"><FileJson className="w-6 h-6" /></div>
              <div>
                <p className="font-semibold text-slate-900">{file.name}</p>
                <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>

            {status === "idle" && (
              <div className="flex items-center gap-3">
                <button onClick={() => setFile(null)} className="p-2 text-slate-500 hover:text-slate-900 transition-colors"><X className="w-5 h-5" /></button>
                <button onClick={handleUpload} className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-md transition-all hover:scale-105">
                  Execute Inference
                </button>
              </div>
            )}
            {status === "uploading" && <div className="flex items-center gap-3 text-primary font-medium animate-pulse"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Transmitting to Backend...</div>}
            {status === "success" && <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-success font-medium"><CheckCircle2 className="w-5 h-5" /> Ingested {parsedRows.toLocaleString()} Arrays into Global Runtime.</motion.div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
