import React from 'react';
import { Wallet, Sparkles, SlidersHorizontal, ArrowDownWideNarrow, ShieldCheck, Download } from 'lucide-react';

interface SmartBudgetPanelProps {
  budgetCount: number;
  totalTickets: number;
  onChangeBudget: (budget: number) => void;
  onDownloadBudget: () => void;
  guaranteedMatchesBudget: number;
}

export const SmartBudgetPanel: React.FC<SmartBudgetPanelProps> = ({
  budgetCount,
  totalTickets,
  onChangeBudget,
  onDownloadBudget,
  guaranteedMatchesBudget,
}) => {
  const presets = [
    { label: '50 Tickets', count: Math.min(50, totalTickets) },
    { label: '100 Tickets', count: Math.min(100, totalTickets) },
    { label: '250 Tickets', count: Math.min(250, totalTickets) },
    { label: '500 Tickets', count: Math.min(500, totalTickets) },
    { label: 'Full Wheel', count: totalTickets },
  ];

  return (
    <div className="bg-gradient-to-r from-[#161b22] via-[#1c1810] to-[#161b22] border-2 border-amber-500/60 rounded-xl p-5 mb-6 shadow-xl shadow-amber-950/20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-600/70 flex items-center justify-center shrink-0 shadow-md shadow-amber-900/40">
            <Wallet className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Step 1
              </span>
              <h3 className="text-base font-bold text-white tracking-tight">
                Smart Budget & Stop System (Priority Ranked Ordering)
              </h3>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/80">
                Top {budgetCount.toLocaleString()} / {totalTickets.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-neutral-300 mt-0.5">
              Tickets are incrementally sorted by maximum marginal coverage entropy. If your client can only afford 50, 100, or 250 tickets, the top N priority tickets maximize the mathematical prize spread.
            </p>
          </div>
        </div>

        {/* Download Top N Budget Button */}
        <button
          onClick={onDownloadBudget}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold rounded-lg text-xs transition-all shadow-md shadow-amber-950/50 shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download Top {budgetCount.toLocaleString()} Budget Tickets (CSV)</span>
        </button>
      </div>

      {/* Slider & Presets Controls */}
      <div className="mt-4 pt-1 grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
        {/* Slider */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              Budget Size Slider:
            </span>
            <span className="font-bold text-amber-300">
              {budgetCount.toLocaleString()} tickets ({( (budgetCount / totalTickets) * 100 ).toFixed(1)}% of wheel)
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={totalTickets}
            step={totalTickets > 100 ? 5 : 1}
            value={budgetCount}
            onChange={(e) => onChangeBudget(Number(e.target.value))}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
          />

          <div className="flex justify-between text-[10px] font-mono text-neutral-500">
            <span>1 ticket (Minimum)</span>
            <span>{Math.round(totalTickets / 2).toLocaleString()} tickets</span>
            <span>{totalTickets.toLocaleString()} tickets (Full Wheel)</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
            Quick Budget Presets:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => onChangeBudget(p.count)}
                className={`text-xs px-2.5 py-1 rounded-md font-mono transition-colors border ${
                  budgetCount === p.count
                    ? 'bg-amber-500 text-black font-bold border-amber-400'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
