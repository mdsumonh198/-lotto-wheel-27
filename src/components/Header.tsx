import React from 'react';
import { Download } from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'generator' | 'or-theory' | 'python-source' | 'colab-mip';
  setActiveTab: (tab: 'dashboard' | 'generator' | 'or-theory' | 'python-source' | 'colab-mip') => void;
  onExportWheel: () => void;
  onExportBudget: () => void;
  budgetCount: number;
  poolSize: number;
  pickSize: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onExportWheel,
  onExportBudget,
  budgetCount,
  poolSize,
  pickSize,
}) => {
  return (
    <header className="border-b border-neutral-800 bg-[#0d1117]/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-white font-mono">
            🎯 LOTTO-WHEEL
          </span>
          <span className="hidden sm:inline text-xs text-neutral-400 font-mono">
            Game {pickSize}/{poolSize} · Priority Ranked · Smart Budget
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Live Analyzer
          </button>
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'generator'
                ? 'bg-emerald-500 text-black font-bold shadow-sm shadow-emerald-500/40'
                : 'text-emerald-400 hover:text-white bg-emerald-950/40 border border-emerald-800/40'
            }`}
          >
            ⚡ Ticket Generator
          </button>
          <button
            onClick={() => setActiveTab('or-theory')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'or-theory'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Operations Research
          </button>
          <button
            onClick={() => setActiveTab('python-source')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'python-source'
                ? 'bg-neutral-800 text-white font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Streamlit (app.py)
          </button>
          <button
            onClick={() => setActiveTab('colab-mip')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'colab-mip'
                ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 font-semibold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Colab (OR-Tools MIP)
          </button>
        </nav>

        {/* Zone 3: Primary Action Exports */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportBudget}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 rounded-md transition-colors whitespace-nowrap"
            title={`Download Top ${budgetCount} Budget Tickets CSV`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Top {budgetCount.toLocaleString()} Budget CSV</span>
            <span className="lg:hidden">Budget CSV</span>
          </button>

          <button
            onClick={onExportWheel}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 rounded-md transition-colors whitespace-nowrap"
            title="Download full covering design wheel CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Full Wheel CSV</span>
            <span className="md:hidden">Full CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
};
