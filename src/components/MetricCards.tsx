import React from 'react';
import { MatchCounts } from '../types';
import { CheckCircle2, Trophy, Layers, Target, ShieldCheck, Wallet } from 'lucide-react';

interface MetricCardsProps {
  budgetMatchCounts: MatchCounts;
  fullMatchCounts: MatchCounts;
  budgetCount: number;
  totalEvaluated: number;
  schonheimBound: number;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  budgetMatchCounts,
  fullMatchCounts,
  budgetCount,
  totalEvaluated,
  schonheimBound,
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Jackpot Alert if 6-match exists */}
      {budgetMatchCounts[6] > 0 ? (
        <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-emerald-500/20 border border-yellow-500/60 rounded-xl p-4 flex items-center gap-3 shadow-lg shadow-yellow-950/20">
          <Trophy className="w-6 h-6 text-yellow-400 shrink-0 animate-bounce" />
          <div>
            <div className="text-sm font-bold text-yellow-300">
              Direct 6/6 Jackpot Hit in your Budget Tickets!
            </div>
            <div className="text-xs text-neutral-300">
              {budgetMatchCounts[6]} ticket in your top {budgetCount.toLocaleString()} budget selection matched all 6 numbers.
            </div>
          </div>
        </div>
      ) : fullMatchCounts[6] > 0 ? (
        <div className="bg-blue-950/30 border border-blue-800/60 rounded-xl p-3 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-blue-400 shrink-0" />
          <div className="text-xs text-neutral-300">
            A 6/6 jackpot hit is present within the full wheel ({fullMatchCounts[6]} ticket).
          </div>
        </div>
      ) : null}

      {/* Grid of 5 Key Cards (Budget + 5-Match + 4-Match + 3-Match + Wheel Size) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Active Budget Selected */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#161b22] to-[#251b0b] border-2 border-amber-500/70 rounded-xl p-4 shadow-lg shadow-amber-950/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
              Active Budget
            </span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-300 tabular-nums">
              {budgetCount.toLocaleString()}
            </span>
            <span className="text-xs text-amber-400/90 font-medium">tickets</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-amber-900/60 text-[11px] text-amber-300/80 font-mono truncate">
            Top Priority Ranked ({( (budgetCount / totalEvaluated) * 100 ).toFixed(1)}%)
          </div>
        </div>

        {/* Card 2: 5-Match Count (Budget & Full Wheel) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#161b22] to-[#0b2518] border-2 border-emerald-500/80 rounded-xl p-4 shadow-lg shadow-emerald-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
              5-Match Count
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-300 tabular-nums">
              {budgetMatchCounts[5]}
            </span>
            <span className="text-xs text-emerald-400/90 font-medium">in budget</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-emerald-900/60 flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold truncate">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Full: {fullMatchCounts[5]} (Guaranteed ≥ 1)</span>
          </div>
        </div>

        {/* Card 3: 4-Match Count */}
        <div className="bg-[#161b22] border border-neutral-800 hover:border-neutral-700 transition-colors rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
              4-Match Count
            </span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-blue-300 tabular-nums">
              {budgetMatchCounts[4]}
            </span>
            <span className="text-xs text-neutral-400 font-medium">in budget</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 font-mono truncate">
            Full Wheel: {fullMatchCounts[4]} tickets
          </div>
        </div>

        {/* Card 4: 3-Match Count */}
        <div className="bg-[#161b22] border border-neutral-800 hover:border-neutral-700 transition-colors rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
              3-Match Count
            </span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-300 tabular-nums">
              {budgetMatchCounts[3]}
            </span>
            <span className="text-xs text-neutral-400 font-medium">in budget</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 font-mono truncate">
            Full Wheel: {fullMatchCounts[3]} tickets
          </div>
        </div>

        {/* Card 5: Total Wheel Size */}
        <div className="bg-[#161b22] border border-neutral-800 hover:border-neutral-700 transition-colors rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
              Total Wheel Size
            </span>
            <span className="text-[10px] font-mono text-neutral-500">
              Bound: {schonheimBound.toLocaleString()}
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
              {totalEvaluated.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-400 font-medium">tickets</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 font-mono truncate">
            {((schonheimBound / totalEvaluated) * 100).toFixed(1)}% Packing Efficiency
          </div>
        </div>
      </div>
    </div>
  );
};
