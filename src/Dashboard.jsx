import React, { useEffect, useMemo, useState, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Share2, FileText, Search, ShieldAlert, Cpu, Network, 
  Terminal, Activity, Save, Download, RefreshCw, 
  Clock, CheckCircle, AlertTriangle, ChevronRight, 
  Database, Play, Pause, Zap, Crosshair, X, Briefcase, 
  List, Layout, Lock, Hash
} from "lucide-react";

// Lazy load graph
const ForceGraph2D = React.lazy(() => import("react-force-graph-2d"));

// --- CONFIGURATION ---

const PHASES = [
  "Reconnaissance", "Resource Dev", "Initial Access", "Execution", 
  "Persistence", "Privilege Esc", "Defense Evasion", "Credential Access", 
  "Discovery", "Lateral Move", "Collection", "Exfiltration", "Command & Control"
];

const ARTIFACT_TYPES = [
  "Windows Event Log", "Prefetch", "Registry Key", "Memory Dump", 
  "PCAP Stream", "MFT Entry", "Shimcache", "Amcache", "PowerShell History",
  "Bash History", "Cron Job", "Systemd Service"
];

const ACTORS = [
  { name: "APT29 (Cozy Bear)", origin: "RU", type: "State-Sponsored" },
  { name: "Lazarus Group", origin: "KP", type: "State-Sponsored" },
  { name: "FIN7", origin: "Eastern Europe", type: "Financially Motivated" },
  { name: "Wizard Spider", origin: "Unknown", type: "Ransomware Cartel" }
];

const SUSPICIOUS_STRINGS = [
  "powershell.exe -nop -w hidden -enc", "vssadmin delete shadows /all /quiet", 
  "whoami /priv", "net group \"Domain Admins\" /domain", 
  "IEX (New-Object Net.WebClient).DownloadString", "rundll32.exe shell32.dll",
  "chmod 777 /tmp/.payload", "cat /etc/shadow", "nc -e /bin/sh 10.10.10.10"
];

// --- UTILS ---

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const idGen = () => Math.random().toString(36).substr(2, 6).toUpperCase();

// Generate Artifact
const generateArtifact = (prevTime) => {
  const isMalicious = Math.random() > 0.65; // High chance of activity
  const isTampered = isMalicious && Math.random() > 0.8;
  const actor = pick(ACTORS);
  
  return {
    id: `ART-${idGen()}`,
    type: pick(ARTIFACT_TYPES),
    phase: pick(PHASES),
    timestamp: prevTime + rand(60000, 3600000),
    severity: isMalicious ? (rand(0,1) > 0.6 ? "Critical" : "High") : "Low",
    tampered: isTampered,
    antiForensicsMethod: isTampered ? (Math.random() > 0.5 ? "Timestomping" : "Log Wiping") : null,
    attribution: { 
      name: isMalicious ? actor.name : "Unknown", 
      score: isMalicious ? rand(0.75, 0.99) : rand(0, 0.3),
      origin: actor.origin
    },
    entropy: rand(3.5, 7.9).toFixed(2),
    strings: isMalicious ? Array.from({length: rand(1, 4)}).map(() => pick(SUSPICIOUS_STRINGS)) : [],
    aiAnalysis: isMalicious 
      ? `AUTOMATED VERDICT: MALICIOUS. Pattern matches ${actor.name} TTPs. Auto-flagged for report.` 
      : "AUTOMATED VERDICT: BENIGN. Standard system behavior.",
    includedInReport: false, // Will be set by Auto-Pilot
    rawHex: Array.from({length: 64}).map(() => Math.floor(Math.random()*255).toString(16).padStart(2,'0')).join(' ')
  };
};

const processGraphData = (artifacts) => {
  const nodes = artifacts.map(art => ({
    id: art.id,
    group: art.phase,
    val: art.severity === "Critical" ? 10 : 5,
    data: art
  }));

  const links = [];
  // Temporal Chain
  const sorted = [...artifacts].sort((a,b) => a.timestamp - b.timestamp);
  for(let i=0; i<sorted.length-1; i++) {
    links.push({ source: sorted[i].id, target: sorted[i+1].id, type: "temporal", color: "#334155" });
  }
  // Attribution Clusters
  for(let i=0; i<artifacts.length; i++) {
    for(let j=i+1; j<artifacts.length; j++) {
      if(artifacts[i].attribution.name !== "Unknown" && 
         artifacts[i].attribution.name === artifacts[j].attribution.name && 
         artifacts[i].attribution.score > 0.8 && artifacts[j].attribution.score > 0.8) {
        links.push({ source: artifacts[i].id, target: artifacts[j].id, type: "attribution", color: "#a855f7" });
      }
    }
  }
  return { nodes, links };
};

// --- STYLES ---

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;700&display=swap');
    body { font-family: 'JetBrains Mono', monospace; background-color: #020408; color: #e2e8f0; overflow: hidden; }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: #050910; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 2px; }
    .scanline {
      position: absolute; inset: 0; pointer-events: none; z-index: 50;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
      background-size: 100% 2px, 3px 100%; opacity: 0.4;
    }
    .panel-border {
      position: absolute; inset: 0; pointer-events: none;
      border: 1px solid rgba(30, 41, 59, 0.5);
      box-shadow: inset 0 0 15px rgba(0,0,0,0.3);
    }
  `}</style>
);

// --- COMPONENTS ---

const Panel = ({ title, icon: Icon, children, className = "", toolbar, footer }) => (
  <div className={`relative flex flex-col bg-[#050910] ${className}`}>
    <div className="panel-border" />
    <div className="flex-none flex items-center justify-between px-3 py-2 bg-[#0a101d] border-b border-slate-800/50 z-10">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} className="text-emerald-500" />}
        <span className="text-[11px] font-bold tracking-widest text-slate-300 uppercase">{title}</span>
      </div>
      <div className="flex items-center gap-2">{toolbar}</div>
    </div>
    <div className="relative flex-1 min-h-0 overflow-hidden z-10">
      {children}
    </div>
    {footer && <div className="flex-none border-t border-slate-800/50 p-1 bg-[#080c15] z-10">{footer}</div>}
  </div>
);

// --- 1. EVIDENCE FEED ---
const EvidenceFeed = ({ artifacts, selectedId, onSelect }) => {
  const scrollRef = useRef(null);
  
  // Auto-scroll to bottom when new artifacts arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [artifacts.length]);

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto scroll-smooth">
      <table className="w-full text-[10px] text-left border-collapse">
        <thead className="sticky top-0 bg-[#0a101d] text-slate-500 font-bold border-b border-slate-800 z-20">
          <tr><th className="p-2">ID</th><th className="p-2">TYPE</th><th className="p-2 text-right">SEV</th></tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {artifacts.map(art => (
              <motion.tr 
                key={art.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => onSelect(art)}
                className={`
                  cursor-pointer border-b border-slate-800/30 transition-colors
                  ${selectedId === art.id ? "bg-emerald-500/10 border-l-2 border-l-emerald-500" : "hover:bg-slate-900 border-l-2 border-l-transparent"}
                `}
              >
                <td className="p-2 font-mono">
                  <div className={selectedId === art.id ? "text-emerald-400 font-bold" : "text-slate-300"}>{art.id}</div>
                  <div className="text-[8px] text-slate-600">{new Date(art.timestamp).toLocaleTimeString([], {hour12:false})}</div>
                </td>
                <td className="p-2 text-slate-400">
                  <div className="truncate w-24">{art.type}</div>
                  {art.tampered && <span className="text-[8px] text-red-500 font-bold uppercase">TAMPERED</span>}
                </td>
                <td className="p-2 text-right">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${art.severity === "Critical" ? "bg-red-500/20 text-red-400" : art.severity === "High" ? "bg-orange-500/20 text-orange-400" : "bg-slate-800 text-slate-500"}`}>
                    {art.severity.slice(0,3).toUpperCase()}
                  </span>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

// --- 2. BEAD GRAPH (Auto-Focus) ---
const BeadGraph = ({ data, onSelect, selectedId }) => {
  const fgRef = useRef();
  const wrapperRef = useRef();
  const [dims, setDims] = useState({ w: 1, h: 1 });

  useEffect(() => {
    if(!wrapperRef.current) return;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: width, h: height });
    });
    obs.observe(wrapperRef.current);
    return () => obs.disconnect();
  }, []);

  // Auto-Focus Camera on New Selection
  useEffect(() => {
    if (fgRef.current && selectedId) {
      const node = data.nodes.find(n => n.id === selectedId);
      if (node) {
        // Smoothly fly to the new node
        fgRef.current.centerAt(node.x, node.y, 1000);
        fgRef.current.zoom(4, 1000);
      }
    }
  }, [selectedId, data.nodes]);

  return (
    <div ref={wrapperRef} className="absolute inset-0 bg-[#03050a]">
      <Suspense fallback={<div/>}>
        <ForceGraph2D
          ref={fgRef}
          width={dims.w}
          height={dims.h}
          graphData={data}
          nodeLabel="id"
          backgroundColor="rgba(0,0,0,0)"
          onNodeClick={(node) => onSelect(node.data)}
          nodeRelSize={6}
          linkColor={link => link.color}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const isSelected = node.id === selectedId;
            const size = isSelected ? 6 : 4;
            
            if (node.data.severity === "Critical" || node.data.tampered) {
              ctx.shadowColor = node.data.tampered ? "#ef4444" : "#f97316";
              ctx.shadowBlur = 15;
            } else {
              ctx.shadowBlur = 0;
            }

            ctx.beginPath();
            ctx.fillStyle = node.data.tampered ? "#ef4444" : node.data.severity === "Critical" ? "#f97316" : "#10b981";
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
            ctx.fill();

            if (isSelected) {
              ctx.strokeStyle = "#fff";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.arc(node.x, node.y, size + 2, 0, 2 * Math.PI);
              ctx.stroke();
            }

            if (globalScale > 2 || isSelected) {
              ctx.font = `3px monospace`;
              ctx.fillStyle = "#cbd5e1";
              ctx.textAlign = "center";
              ctx.textBaseline = "top";
              ctx.fillText(node.id, node.x, node.y + size + 2);
            }
          }}
        />
      </Suspense>
    </div>
  );
};

// --- 3. ANALYSIS ENGINE ---
const AnalysisEngine = ({ artifact, onAddToReport, isScanning }) => {
  if (!artifact) return (
    <div className="flex flex-col items-center justify-center h-full text-slate-600 opacity-50 p-4 text-center">
      <div className="animate-pulse"><Activity size={32} /></div>
      <span className="text-[10px] mt-2 tracking-widest">WAITING FOR STREAM...</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#050910] relative">
      {/* Scanning Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-500"
          >
            <RefreshCw className="animate-spin mb-2" size={24}/>
            <div className="text-xs font-mono font-bold">AUTOMATED ANALYSIS RUNNING...</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
           <div>
             <h2 className="text-lg font-bold text-slate-100">{artifact.id}</h2>
             <div className="text-[10px] text-slate-400 mt-0.5">{artifact.type}</div>
           </div>
           <button 
             onClick={() => onAddToReport(artifact.id)}
             className={`px-3 py-1.5 text-[9px] font-bold border rounded flex items-center gap-2 transition-all
               ${artifact.includedInReport ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-slate-800 border-slate-600 text-slate-300"}`}
           >
             {artifact.includedInReport ? "REPORTED" : "ADD TO REPORT"}
           </button>
        </div>

        {/* Severity & Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className={`p-2 border rounded ${artifact.severity==='Critical' ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-900/50 border-slate-800'}`}>
            <div className="text-[9px] text-slate-500 uppercase">Threat Level</div>
            <div className={`text-base font-bold ${artifact.severity==='Critical'?'text-red-500':'text-emerald-500'}`}>{artifact.severity.toUpperCase()}</div>
          </div>
          <div className="bg-slate-900/50 p-2 border border-slate-800 rounded">
             <div className="text-[9px] text-slate-500 uppercase">Entropy Score</div>
             <div className="text-base font-bold text-slate-300">{artifact.entropy}</div>
          </div>
        </div>

        {/* AI Insight */}
        <div className="bg-slate-900/50 border border-slate-800 p-3 rounded relative overflow-hidden">
           <div className={`absolute top-0 left-0 w-1 h-full ${artifact.severity==='Critical'?'bg-red-500':'bg-emerald-500'}`}/>
           <div className="flex items-center gap-2 text-slate-400 mb-2 font-bold text-[10px]">
             <Cpu size={14}/> INTELLIGENT AGENT VERDICT
           </div>
           <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
             {artifact.aiAnalysis}
           </p>
        </div>

        {/* Attribution */}
        <div className="space-y-1">
           <div className="text-[10px] font-bold text-slate-500 uppercase">Attribution Match</div>
           <div className="flex items-center justify-between text-[10px] text-slate-300 bg-slate-900 p-2 border border-slate-800 rounded">
              <div className="flex items-center gap-2"><Network size={12}/> {artifact.attribution.name}</div>
              <span className="text-purple-400 font-mono">{(artifact.attribution.score * 100).toFixed(1)}%</span>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- 4. REPORT GENERATOR (Re-added & Functional) ---
const ReportBuilder = ({ artifacts }) => {
  const [reportText, setReportText] = useState("Automated analysis detected multiple indicators of compromise consistent with APT activity. Recommendation: Isolate affected hosts.");
  const [exporting, setExporting] = useState(false);

  const reportItems = artifacts.filter(a => a.includedInReport);
  const criticalCount = reportItems.filter(a => a.severity === 'Critical').length;

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => setExporting(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-100 text-black font-sans relative">
      {/* Export Overlay */}
      {exporting && (
        <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center text-emerald-500">
           <Download className="animate-bounce mb-4" size={32}/>
           <div className="text-xs font-bold font-mono">COMPILING PDF REPORT...</div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex-none p-2 border-b border-gray-300 bg-white flex justify-between items-center">
        <div className="text-[10px] font-bold flex items-center gap-2 uppercase text-slate-700">
          <Briefcase size={12}/> Report Builder
        </div>
        <button onClick={handleExport} className="px-3 py-1 bg-black text-white text-[10px] rounded hover:bg-gray-800 flex items-center gap-1">
          <Save size={10}/> EXPORT
        </button>
      </div>

      {/* Document View */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
         {/* Report Header */}
         <div className="border-b-2 border-black pb-4">
            <h1 className="text-2xl font-bold uppercase tracking-tight">Forensic Case Report</h1>
            <div className="flex justify-between text-[10px] mt-2 text-gray-600 font-mono">
               <span>CASE ID: #2026-AUTO-99</span>
               <span>STATUS: {criticalCount > 0 ? "CRITICAL" : "INVESTIGATING"}</span>
            </div>
         </div>

         {/* 1. Executive Summary */}
         <div className="space-y-2">
            <h3 className="font-bold text-[10px] uppercase bg-black text-white px-2 py-1 inline-block">1. Executive Summary</h3>
            <textarea 
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              className="w-full h-24 text-[11px] border border-gray-300 p-2 focus:border-black outline-none resize-none bg-white font-serif leading-relaxed"
            />
         </div>

         {/* 2. Flagged Artifacts */}
         <div className="space-y-2">
            <h3 className="font-bold text-[10px] uppercase bg-black text-white px-2 py-1 inline-block">2. Flagged Artifacts ({reportItems.length})</h3>
            {reportItems.length === 0 ? (
              <div className="text-[10px] text-gray-500 italic p-4 border border-dashed border-gray-300 text-center bg-gray-50">
                No artifacts flagged. Toggle "Auto-Pilot" to automatically add critical threats here.
              </div>
            ) : (
              <table className="w-full text-[10px] border-collapse mt-2">
                <thead>
                  <tr className="border-b-2 border-black text-left">
                     <th className="py-1">Time</th>
                     <th className="py-1">Type</th>
                     <th className="py-1 text-right">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {reportItems.map((item, i) => (
                    <tr key={i} className="border-b border-gray-200">
                       <td className="py-2 font-mono text-gray-600">{new Date(item.timestamp).toLocaleTimeString()}</td>
                       <td className="py-2">{item.type}</td>
                       <td className={`py-2 text-right font-bold ${item.severity === 'Critical' ? 'text-red-600' : 'text-emerald-600'}`}>{item.severity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
         </div>
      </div>
    </div>
  );
};

// --- 5. TERMINAL (Live Logs) ---
const TerminalOverlay = ({ isOpen, onClose, logs }) => {
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
          className="absolute bottom-0 left-0 right-0 h-48 bg-black/95 border-t border-emerald-500/30 z-50 flex flex-col shadow-2xl"
        >
          <div className="flex justify-between items-center bg-emerald-900/20 px-3 py-1 border-b border-emerald-500/30">
            <span className="text-[10px] text-emerald-400 font-bold font-mono">SYSTEM_LOGS // REALTIME</span>
            <button onClick={onClose} className="text-emerald-400 hover:text-white"><X size={14}/></button>
          </div>
          <div className="flex-1 p-3 font-mono text-[10px] text-emerald-400/80 overflow-y-auto space-y-1">
             {logs.map((log, i) => <div key={i}>{log}</div>)}
             <div ref={endRef} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- MAIN ORCHESTRATOR ---

export default function ForensicOrchestrator() {
  const [artifacts, setArtifacts] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [autoPilot, setAutoPilot] = useState(true); // DEFAULT: ON
  const [activeTab, setActiveTab] = useState("analysis"); // analysis | report
  const [terminalOpen, setTerminalOpen] = useState(true); 
  const [logs, setLogs] = useState(["> System Initialized...", "> Auto-Pilot Engaged."]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastTime, setLastTime] = useState(Date.now());

  // Derived
  const selectedArtifact = useMemo(() => artifacts.find(a => a.id === selectedId), [artifacts, selectedId]);
  const graphData = useMemo(() => processGraphData(artifacts), [artifacts]);

  // --- AUTOMATION CORE ---
  useEffect(() => {
    const stream = setInterval(() => {
      if(artifacts.length > 30) return;
      
      const newArt = generateArtifact(lastTime);
      setLastTime(newArt.timestamp);

      setArtifacts(prev => {
        const updated = [...prev, newArt].sort((a,b) => a.timestamp - b.timestamp);
        return updated;
      });

      // AUTO-PILOT LOGIC
      if (autoPilot) {
        // A. Auto-Select
        setSelectedId(newArt.id);
        
        // B. Simulate Analysis Scan
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 800); 

        // C. Auto-Report if malicious
        if (newArt.severity === "Critical" || newArt.severity === "High" || newArt.tampered) {
          setArtifacts(prev => prev.map(a => a.id === newArt.id ? { ...a, includedInReport: true } : a));
          setLogs(prev => [...prev, `> [AUTO-PILOT] Analyzed ${newArt.id}: ${newArt.severity}. FLAGGED for report.`]);
        } else {
          setLogs(prev => [...prev, `> [AUTO-PILOT] Analyzed ${newArt.id}: Low Risk. Archived.`]);
        }
      } else {
        setLogs(prev => [...prev, `> Ingested artifact ${newArt.id}. Pending manual review.`]);
      }

    }, 4000); 

    return () => clearInterval(stream);
  }, [artifacts.length, autoPilot, lastTime]);

  const toggleReport = (id) => {
    setArtifacts(prev => prev.map(a => a.id === id ? { ...a, includedInReport: !a.includedInReport } : a));
  };

  return (
    <div className="w-screen h-screen bg-[#020408] text-slate-200 overflow-hidden flex flex-col font-mono relative">
      <GlobalStyles />
      <div className="scanline" />

      {/* HEADER */}
      <header className="flex-none h-12 bg-[#050910] border-b border-slate-800 flex items-center justify-between px-4 z-50">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/50 flex items-center justify-center rounded">
               <Activity className="text-emerald-500" size={18}/>
            </div>
            <div>
               <h1 className="text-sm font-bold tracking-[0.2em] text-white">FORENSIC_ORCHESTRATOR</h1>
               <div className="text-[9px] text-slate-500 flex gap-3">
                  <span>AI_ENGINE: ONLINE</span>
                  <span className="text-emerald-500 font-bold">● LIVE FEED</span>
               </div>
            </div>
         </div>
         
         <div className="flex items-center gap-4">
            {/* Auto-Pilot Toggle */}
            <div 
              onClick={() => setAutoPilot(!autoPilot)}
              className={`flex items-center gap-2 px-3 py-1 rounded cursor-pointer border transition-all ${autoPilot ? "bg-emerald-900/30 border-emerald-500 text-emerald-400" : "bg-slate-900 border-slate-700 text-slate-500"}`}
            >
              <Zap size={12} className={autoPilot ? "fill-current" : ""} />
              <span className="text-[10px] font-bold">AUTO-PILOT: {autoPilot ? "ON" : "OFF"}</span>
            </div>

            <div className="h-6 w-[1px] bg-slate-800"/>
            
            <button onClick={() => setTerminalOpen(!terminalOpen)} className={`p-1.5 border rounded transition-colors ${terminalOpen ? "bg-slate-700 text-white border-slate-500" : "border-slate-700 text-slate-500 hover:border-slate-500"}`}>
               <Terminal size={14}/>
            </button>
         </div>
      </header>

      {/* WORKSPACE */}
      <div className="flex-1 flex min-h-0 relative z-40">
         
         {/* LEFT: STREAM */}
         <div className="w-[280px] border-r border-slate-800 flex flex-col min-h-0">
            <Panel title="Live Ingestion" icon={Database} className="flex-1 min-h-0">
               <EvidenceFeed artifacts={artifacts} selectedId={selectedId} onSelect={(a) => { setSelectedId(a.id); }} />
            </Panel>
         </div>

         {/* CENTER: GRAPH & TIMELINE */}
         <div className="flex-1 flex flex-col min-h-0 bg-[#03050a] border-r border-slate-800">
            <Panel title="Causal Graph" icon={Share2} className="flex-1 min-h-0" 
               toolbar={
                  <div className="flex gap-2 text-[9px] text-slate-500">
                     <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>Safe</span>
                     <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"/>Critical</span>
                  </div>
               }>
               <BeadGraph data={graphData} onSelect={(a) => { setSelectedId(a.id); }} selectedId={selectedId} />
            </Panel>
            
            <Panel title="Kill Chain" icon={ChevronRight} className="h-[120px] flex-none border-t border-slate-800">
               <div className="h-full flex items-center px-4 gap-2 overflow-x-auto whitespace-nowrap">
                  {PHASES.map((p,i) => {
                     const count = artifacts.filter(a=>a.phase===p).length;
                     const active = count > 0;
                     return (
                        <div key={i} className="flex flex-col items-center min-w-[70px] group">
                           <div className={`w-2 h-2 rounded-full mb-2 border transition-all duration-300 ${active ? "bg-emerald-500 border-emerald-300 shadow-[0_0_10px_#10b981]" : "bg-slate-900 border-slate-700"}`}/>
                           <span className={`text-[8px] uppercase ${active ? "text-white font-bold" : "text-slate-600"}`}>{p.split(" ")[0]}</span>
                        </div>
                     )
                  })}
               </div>
            </Panel>
         </div>

         {/* RIGHT: DUAL-MODE PANEL (Analysis / Report) */}
         <div className="w-[400px] flex flex-col min-h-0 bg-[#050910]">
            {/* Right Panel Tabs */}
            <div className="flex border-b border-slate-800 bg-[#020408]">
               <button 
                  onClick={() => setActiveTab("analysis")} 
                  className={`flex-1 py-2 text-[10px] font-bold uppercase border-r border-slate-800 ${activeTab==="analysis" ? "bg-slate-800 text-emerald-400 border-b-2 border-b-emerald-500" : "text-slate-500"}`}
               >
                  <Search size={12} className="inline mr-2"/> Analysis
               </button>
               <button 
                  onClick={() => setActiveTab("report")} 
                  className={`flex-1 py-2 text-[10px] font-bold uppercase ${activeTab==="report" ? "bg-slate-800 text-emerald-400 border-b-2 border-b-emerald-500" : "text-slate-500"}`}
               >
                  <Briefcase size={12} className="inline mr-2"/> Report
               </button>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden relative">
               {activeTab === "analysis" ? (
                  <AnalysisEngine artifact={selectedArtifact} onAddToReport={toggleReport} isScanning={isScanning} />
               ) : (
                  <ReportBuilder artifacts={artifacts} />
               )}
            </div>
         </div>

      </div>

      {/* TERMINAL OVERLAY */}
      <TerminalOverlay isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} logs={logs} />
      
    </div>
  );
}