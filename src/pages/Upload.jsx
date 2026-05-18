import { useState, useRef, useEffect } from "react";
import { Upload as UploadIcon, FileJson, CheckCircle2, X, Info, Database } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "eeg_uploaded_datasets";

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [savedDatasets, setSavedDatasets] = useState([]);
  const fileInputRef = useRef(null);

  // Restore persisted datasets on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      setSavedDatasets(saved);
    } catch { setSavedDatasets([]); }
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

  const handleFilesAdded = (newFiles) => {
    const validFiles = Array.from(newFiles).filter(f => f.name.endsWith('.csv') || f.type === 'text/csv');
    if (validFiles.length > 0) {
      setFiles(prev => {
        const combined = [...prev, ...validFiles.map(f => ({ file: f, status: 'idle', parsedRows: 0 }))];
        return combined.slice(0, 2);
      });
    } else {
      alert("Please upload a valid CSV.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFilesAdded(e.dataTransfer.files);
  };

  const handleChange = (e) => {
    if (e.target.files) handleFilesAdded(e.target.files);
  };

  const handleRemove = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveSaved = (index) => {
    const updated = savedDatasets.filter((_, i) => i !== index);
    setSavedDatasets(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleUpload = async (index) => {
    const targetFile = files[index];
    if (!targetFile || targetFile.status === 'uploading' || targetFile.status === 'success') return;

    setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'uploading' } : f));
    
    const formData = new FormData();
    formData.append("file", targetFile.file);

    try {
        const host = window.location.hostname || "127.0.0.1";
        const response = await fetch(`http://${host}:8000/api/v1/upload`, {
            method: "POST",
            body: formData,
        });
        
        if (!response.ok) throw new Error("Backend rejection.");
        const data = await response.json();
        
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'success', parsedRows: data.parsed_rows } : f));

        // Persist to localStorage so it survives navigation
        const newEntry = {
          name: targetFile.file.name,
          sizeMB: (targetFile.file.size / 1024 / 1024).toFixed(2),
          parsedRows: data.parsed_rows,
          uploadedAt: new Date().toLocaleString(),
          isPrimary: savedDatasets.length === 0,
        };
        const updated = [...savedDatasets.filter(d => d.name !== newEntry.name), newEntry].slice(0, 2);
        setSavedDatasets(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch(err) {
        console.error("Backend offline or upload failed.", err);
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'idle' } : f));
        alert("Failed to connect to the backend API.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-full flex flex-col justify-center animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Deploy Raw Dataset Node</h1>
        <p className="text-slate-500 flex items-center gap-2">
          <Info className="w-4 h-4" /> 
          Transmit standard EEG CSV datasets. Uploaded datasets persist here across navigation — use the ✕ to clear them manually.
        </p>
      </div>

      {/* ── Active Datasets (persisted) ───────────────────────────── */}
      {savedDatasets.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest">
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            Active Datasets — Streaming Now
          </div>
          <AnimatePresence>
            {savedDatasets.map((ds, index) => (
              <motion.div
                key={ds.name + index}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-5 flex items-center justify-between border border-emerald-200 bg-emerald-50/40"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                    <FileJson className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900">{ds.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        ds.isPrimary ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                      }`}>
                        {ds.isPrimary ? "Dataset 1 (Primary)" : "Dataset 2 (Comparison)"}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                        ● LIVE
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {ds.sizeMB} MB · {ds.parsedRows?.toLocaleString()} rows · Uploaded {ds.uploadedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    Ingested
                  </div>
                  <a href="/dashboard" className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 transition-colors">
                    View Dashboard ➔
                  </a>
                  <button onClick={() => handleRemoveSaved(index)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Remove dataset">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Drop Zone ─────────────────────────────────────────────── */}
      <div 
        className={`glass-card p-12 flex flex-col items-center justify-center text-center transition-all ${
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
        <p className="text-slate-500 mb-8 max-w-sm">Requires standard CSV header configuration. Max 2 files allowed.</p>

        <input type="file" accept=".csv" ref={fileInputRef} onChange={handleChange} className="hidden" multiple />
        <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors text-slate-900 font-medium disabled:opacity-50" disabled={files.length >= 2}>
          Select Packages
        </button>
      </div>

      {/* ── Pending Uploads ───────────────────────────────────────── */}
      <div className="space-y-4">
        <AnimatePresence>
          {files.map((fileObj, index) => (
            <motion.div key={index + fileObj.file.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card p-6 flex items-center justify-between border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 text-secondary rounded-lg"><FileJson className="w-6 h-6" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{fileObj.file.name}</p>
                  </div>
                  <p className="text-sm text-slate-500">{(fileObj.file.size / 1024 / 1024).toFixed(2)} MB · Ready to upload</p>
                </div>
              </div>

              {fileObj.status === "idle" && (
                <div className="flex items-center gap-3">
                  <button onClick={() => handleRemove(index)} className="p-2 text-slate-500 hover:text-red-500 transition-colors" title="Remove dataset"><X className="w-5 h-5" /></button>
                  <button onClick={() => handleUpload(index)} className="px-6 py-2 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-md transition-all hover:scale-105">
                    Execute Inference
                  </button>
                </div>
              )}
              {fileObj.status === "uploading" && <div className="flex items-center gap-3 text-primary font-medium animate-pulse"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Transmitting...</div>}
              {fileObj.status === "success" && (
                <div className="flex items-center gap-4">
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-success font-medium bg-green-50 px-3 py-1 rounded-lg border border-green-200">
                    <CheckCircle2 className="w-5 h-5" /> Ingested {fileObj.parsedRows?.toLocaleString()} Arrays
                  </motion.div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
