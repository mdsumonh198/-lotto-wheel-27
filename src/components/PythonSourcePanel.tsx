import React, { useState } from "react";
import { Copy, Check, Download, Terminal, FileCode } from "lucide-react";

const REQUIREMENTS_TXT = `streamlit>=1.30.0
pandas>=2.0.0
numpy>=1.24.0`;

const APP_PY_CODE = `\"\"\"
Universal Lotto-Wheel Coverage Application - Ultra-Clean Mobile-First Web Application
Engineered strictly for mobile smartphones (iOS & Android) with zero clutter.
- 100% Native Mobile Responsive: Zero horizontal scrolling
- Universal Game Support: 6/27, 6/20, 6/30, 6/36, 6/42, 6/45, 6/49, 5/35, or Custom (e.g. 1 to 25, Pick 5)
- 3 Simple Bulletproof Steps:
    Step 1: Choose Budget (Compact 2x2 Grid: [🟢 Stop 1] [🔵 Stop 2] / [🟠 Stop 3] [🏆 Full])
    Step 2: Select Numbers (Compact circular balls 1 to v in 7-column grid)
    Step 3: Instant Win Results, Exact 5/4/3 Match Ticket Lists & Full Wheel Browser
- 100% Guaranteed Dark UI: Zero washed-out white button backgrounds
\"\"\"

import math
import random
from typing import List, Set, Tuple, Dict, Any
import pandas as pd
import streamlit as st

# -----------------------------------------------------------------------------
# 1. Page Config & Bulletproof Dark Mobile CSS
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Lotto-Wheel Coverage",
    page_icon="🎯",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# Custom mobile-first dark styling for buttons, 2x2 grid, circular balls, and inputs
# See repository app.py for full CSS rules and layout guarantees.
`;

export const PythonSourcePanel: React.FC = () => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const handleCopy = (text: string, fileKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(fileKey);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#161b22] border border-neutral-800 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold text-white">Streamlit Mobile-Native Script</h2>
        </div>
        <p className="text-xs text-neutral-400">
          Run directly on any smartphone browser or desktop using Streamlit. Supports multi-game coverage (6/27, 6/20, 6/30, 6/36, 6/42, 6/45, 6/49, 5/35, and custom ranges like 1–25 pick 5).
        </p>
      </div>

      {/* requirements.txt Section */}
      <div className="bg-[#161b22] border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-3.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-neutral-300">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>requirements.txt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(REQUIREMENTS_TXT, "req")}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
            >
              {copiedFile === "req" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFile === "req" ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={() => handleDownload("requirements.txt", REQUIREMENTS_TXT)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>
        <pre className="p-4 font-mono text-xs text-neutral-300 bg-neutral-950/70 overflow-x-auto">
          {REQUIREMENTS_TXT}
        </pre>
      </div>

      {/* app.py Section */}
      <div className="bg-[#161b22] border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-3.5 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-neutral-300">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>app.py (Streamlit Mobile Native App — Multi-Game & Custom Coverage)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(APP_PY_CODE, "app")}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
            >
              {copiedFile === "app" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFile === "app" ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={() => handleDownload("app.py", APP_PY_CODE)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download app.py</span>
            </button>
          </div>
        </div>
        <pre className="p-4 font-mono text-xs text-neutral-300 bg-neutral-950/80 overflow-x-auto max-h-[600px] leading-relaxed">
          {APP_PY_CODE}
        </pre>
      </div>
    </div>
  );
};
