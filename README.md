# 🕵️‍♂️ Forensic Orchestrator HUD

> **A Next-Gen Cyber-Forensic Command Console.**
> This project is a high-fidelity, React-based Single Page Application (SPA) designed to simulate an advanced **Digital Forensics & Incident Response (DFIR)** interface. It features real-time evidence ingestion, automated AI analysis, causal graph visualization, and automated report generation—all wrapped in a strictly typed, error-proof, and responsive Cyberpunk/Sci-Fi UI.

---

## ⚡ Key Features

### 🧠 1. "Auto-Pilot" Intelligence

* **Zero-Touch Operation:** The system automatically ingests, selects, and analyzes incoming evidence streams.
* **Auto-Triage:** Automatically flags artifacts as **Critical** or **Tampered** based on simulated heuristics (Entropy, Threat Intelligence).
* **Smart Reporting:** Automatically populates the case dossier with high-severity findings without user intervention.

### 🔗 2. Bead Memory Interface (Causal Graph)

* **Force-Directed Graph:** Visualizes the attack chain using a physics-based engine (`react-force-graph-2d`).
* **Temporal Chaining:** Links evidence nodes chronologically (The "Bead" String).
* **Attribution Clustering:** Dynamically links artifacts that share specific Threat Actor TTPs (Tactics, Techniques, and Procedures).
* **Auto-Focus Camera:** The view automatically pans and zooms to the latest active evidence.

### 🔬 3. Deep Analysis Engine

* **Multi-Vector Inspection:**
* **Overview:** Metadata, Hash, and Integrity status.
* **Hex Editor:** Scrollable raw byte inspection view.
* **Strings:** Extracts suspicious IOCs (IPs, URLs, Shell Commands).
* **AI Insight:** Simulated LLM-based verdict and attribution confidence scoring.


* **Anti-Forensics Detection:** Visual alerts for "Timestomping" or "Log Wiping" attempts.

### 📄 4. Integrated Report Generator

* **Live Dossier Building:** Switch tabs to view the case report being built in real-time.
* **Editable Summary:** Write executive summaries directly in the UI.
* **PDF Simulation:** "Export" functionality with loading states.

### 💻 5. System Terminal & Automation

* **Live CLI Overlay:** A toggleable terminal window showing real-time system logs and kernel operations.
* **Background Tasks:** Visual progress bars for simulated tasks like "MFT Carving" or "Registry Parsing".

---

## 🛠️ Tech Stack

* **Core:** [React 18](https://reactjs.org/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Custom "Glassmorphism" & Neon palette)
* **Animations:** [Framer Motion](https://www.framer.com/motion/) (Smooth transitions, glitches, entrances)
* **Visualization:** [react-force-graph-2d](https://github.com/vasturiano/react-force-graph) (Canvas-based graph rendering)
* **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Installation & Setup

1. **Clone the Repository**
```bash
git clone https://github.com/your-username/forensic-orchestrator.git
cd forensic-orchestrator

```


2. **Install Dependencies**
```bash
npm install framer-motion lucide-react react-force-graph-2d
# OR
yarn add framer-motion lucide-react react-force-graph-2d

```


*(Note: Ensure you have `react` and `react-dom` installed as well)*
3. **Run the Development Server**
```bash
npm run dev

```



---

## 🎮 Usage Guide

### The Interface Layout

1. **Top Bar (HUD):**
* **System Stats:** CPU/Mem usage and Live Feed status.
* **Auto-Pilot Toggle:** Click the `⚡ AUTO-PILOT` button to enable/disable automatic investigation.
* **Terminal Toggle:** Click the `>_` icon to show/hide the live log overlay.


2. **Left Panel (Ingestion):**
* **Evidence Stream:** A scrolling list of incoming artifacts. Click any item to pause Auto-Pilot and inspect manually.
* **Tasks:** Monitor background forensic processes.


3. **Center Panel (Visualization):**
* **Graph:** Interactive canvas. Drag nodes to rearrange. Scroll to zoom.
* **Kill Chain:** Bottom strip showing the progression of the attack through the Cyber Kill Chain phases.


4. **Right Panel (Analysis/Report):**
* **Tabs:** Switch between `ANALYSIS` (Deep dive) and `REPORT` (Document builder).
* **Manual Override:** Click "Add to Report" on any artifact to manually force it into the dossier.



---

## 🎨 Customization

### Modifying Data Generation

Edit the `generateArtifact` function to change the frequency of malicious events or add new artifact types:

```javascript
// Example: Add "USB Device" artifacts
const ARTIFACT_TYPES = [
  "Windows Event Log",
  "Prefetch",
  "USB Device Connection", // New Type
  ...
];

```

### Changing The Theme

The UI uses a strict color palette defined in Tailwind classes.

* **Primary:** `emerald-500` (Safe/System)
* **Danger:** `red-500` (Critical/Tampered)
* **Warning:** `orange-500` (High Severity)
* **AI/Attribution:** `purple-500` (Neural/Linked)
* **Background:** `#020408` (Deep Void)

---

## ⚠️ Notes

* **Mock Data:** This application currently runs on **simulated data**. It does not actually connect to a live filesystem or SIEM.
* **Performance:** The graph uses `react-force-graph-2d` which renders on HTML5 Canvas for high performance, handling hundreds of nodes easily.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built for the Cyber Defenders of Tomorrow.* 🛡️
