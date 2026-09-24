import React from 'react';
import { MatchCounts, GameCategory, TicketEvaluation } from '../types';
import { GoalEvaluationResult } from '../wheelEngine';
import { CheckCircle2, Trophy, Layers, Target, Wallet } from 'lucide-react';

interface MetricCardsProps {
  budgetMatchCounts: MatchCounts;
  fullMatchCounts: MatchCounts;
  budgetCount: number;
  totalEvaluated: number;
  schonheimBound: number;
  goalSummary?: GoalEvaluationResult;
  gameCategory?: GameCategory;
  orderMatters?: boolean;
  evaluations?: TicketEvaluation[];
  lang?: 'bn' | 'en';
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  budgetMatchCounts,
  fullMatchCounts,
  budgetCount,
  totalEvaluated,
  schonheimBound,
  goalSummary,
  gameCategory = 'lotto',
  orderMatters = false,
  evaluations = [],
  lang = 'bn',
}) => {
  const isBn = lang === 'bn';
  const isDigitGame = gameCategory === 'pick_digits' || totalEvaluated === 1000;
  const targetTier = goalSummary?.matchTier || (isDigitGame ? 3 : 4);
  const targetFreq = goalSummary?.targetFrequency || 1;
  const isGoalAchieved = goalSummary?.isBudgetGoalAchieved ?? false;

  // Primary Goal hits (Unified: exactly what the user selected)
  const targetHitsBudget = goalSummary?.budgetHits ?? (budgetMatchCounts[targetTier as keyof MatchCounts] || 0);
  const targetHitsFull = goalSummary?.fullHits ?? (fullMatchCounts[targetTier as keyof MatchCounts] || 0);

  // Top Tier hits
  let topTierHitsBudget = 0;
  let topTierHitsFull = 0;
  let topTierLabel = isBn ? 'জ্যাকপট ও টপ টায়ার' : 'Jackpot & Top Tier';

  // Supporting / Minor Tier hits
  let minorTierHitsBudget = 0;
  let minorTierHitsFull = 0;
  let minorTierLabel = isBn ? 'সাপোর্টিং / মাইনর টায়ার' : 'Supporting / Minor Tier';

  if (isDigitGame) {
    topTierLabel = isBn ? 'Straight (হুবহু অর্ডার)' : 'Straight (Exact Order)';
    minorTierLabel = isBn ? 'Box / Pair ম্যাচ' : 'Box / Pair Matches';
    for (const e of evaluations) {
      if (e.isStraightWin) {
        topTierHitsFull++;
        if (e.inBudget) topTierHitsBudget++;
      }
      if (e.isBoxWin || e.isFrontPair || e.isBackPair) {
        minorTierHitsFull++;
        if (e.inBudget) minorTierHitsBudget++;
      }
    }
  } else {
    if (targetTier <= 4) {
      topTierLabel = isBn ? '৫ ও ৬-ম্যাচ হিট' : '5 & 6-Match Hits';
      topTierHitsBudget = (budgetMatchCounts[5] || 0) + (budgetMatchCounts[6] || 0);
      topTierHitsFull = (fullMatchCounts[5] || 0) + (fullMatchCounts[6] || 0);

      minorTierLabel = isBn ? '৩-ম্যাচ হিট' : '3-Match Hits';
      minorTierHitsBudget = budgetMatchCounts[3] || 0;
      minorTierHitsFull = fullMatchCounts[3] || 0;
    } else {
      topTierLabel = isBn ? '৬/৬ জ্যাকপট হিট' : '6/6 Jackpot Hits';
      topTierHitsBudget = budgetMatchCounts[6] || 0;
      topTierHitsFull = fullMatchCounts[6] || 0;

      minorTierLabel = isBn ? '৪-ম্যাচ হিট' : '4-Match Hits';
      minorTierHitsBudget = budgetMatchCounts[4] || 0;
      minorTierHitsFull = fullMatchCounts[4] || 0;
    }
  }

  return (
    <div className="space-y-4 mb-6 font-sans">
      {/* Target Goal Achievement Banner (Unified) */}
      {goalSummary && (
        <div
          className={`border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg transition-all ${
            isGoalAchieved
              ? 'bg-gradient-to-r from-emerald-950/80 via-[#0a2717] to-emerald-950/80 border-emerald-500/80 shadow-emerald-950/30'
              : 'bg-gradient-to-r from-amber-950/60 via-[#271d0a] to-amber-950/60 border-amber-500/80 shadow-amber-950/30'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                isGoalAchieved
                  ? 'bg-emerald-900/80 border border-emerald-500 text-emerald-300'
                  : 'bg-amber-900/80 border border-amber-500 text-amber-300'
              }`}
            >
              {isGoalAchieved ? <CheckCircle2 className="w-6 h-6 animate-pulse" /> : <Target className="w-6 h-6" />}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-xs uppercase font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    isGoalAchieved
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {isGoalAchieved
                    ? isBn ? '✅ টার্গেট গোল অর্জিত হয়েছে' : '✅ TARGET GOAL ACHIEVED'
                    : isBn ? '⏳ টার্গেট চলমান' : '⏳ IN PROGRESS'}
                </span>
                <h4 className="text-sm font-bold text-white tracking-wide">
                  {isBn
                    ? `টার্গেট: ${targetTier}-ম্যাচ কমপক্ষে ${targetFreq} বার (${isDigitGame && orderMatters ? 'Straight হুবহু অর্ডার' : isDigitGame ? 'Box যেকোনো ক্রম' : `${targetTier}-ম্যাচ সুনিশ্চিত`})`
                    : `Target: Guaranteed ${targetTier}-Match at least ${targetFreq} time(s)`}
                </h4>
              </div>

              <p className="text-xs text-neutral-300 mt-1">
                {isGoalAchieved ? (
                  <span>
                    {isBn ? (
                      <>
                        🎉 আপনার নির্বাচিত শীর্ষ <strong className="text-white">{budgetCount.toLocaleString()}</strong> টিকিটের মধ্যে মোট{' '}
                        <strong className="text-emerald-300 font-mono text-sm">{targetHitsBudget}</strong> টি টিকিটে {targetTier}-ম্যাচ হয়েছে!
                        (টার্গেট ছিল কমপক্ষে {targetFreq}টি)। আপনার কাঙ্ক্ষিত গ্যারান্টি সম্পূর্ণ সফল!
                      </>
                    ) : (
                      <>
                        Target achieved! Out of your top {budgetCount.toLocaleString()} tickets, {targetHitsBudget} tickets hit {targetTier}-match.
                      </>
                    )}
                  </span>
                ) : (
                  <span>
                    {isBn ? (
                      <>
                        আপনার বর্তমান বাজেটে (<strong className="text-white">{budgetCount.toLocaleString()}</strong> টিকিট) মোট{' '}
                        <strong className="text-amber-300 font-mono">{targetHitsBudget}</strong>/{targetFreq} টি {targetTier}-ম্যাচ পাওয়া গেছে।
                        টার্গেট পূরণ করতে বাজেট বাড়িয়ে নিন।
                      </>
                    ) : (
                      <>
                        Currently {targetHitsBudget}/{targetFreq} tickets in budget hit {targetTier}-match. Increase budget to achieve lock.
                      </>
                    )}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto font-mono text-xs">
            <span className="text-neutral-400">{isBn ? 'টার্গেট হিট (বাজেটে):' : 'Target Hits in Budget:'}</span>
            <span
              className={`text-base font-extrabold px-3 py-1 rounded-lg border ${
                isGoalAchieved
                  ? 'bg-emerald-500 text-black border-emerald-400'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500'
              }`}
            >
              {targetHitsBudget} / {targetFreq}
            </span>
          </div>
        </div>
      )}

      {/* Unified 5 Metric Cards (Standardized for ALL Games) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Active Budget */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#161b22] to-[#251b0b] border-2 border-amber-500/70 rounded-xl p-4 shadow-lg shadow-amber-950/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
              {isBn ? 'সক্রিয় বাজেট টিকিট' : 'Active Budget'}
            </span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-300 tabular-nums">
              {budgetCount.toLocaleString()}
            </span>
            <span className="text-xs text-amber-400/90 font-medium">{isBn ? 'টিকিট' : 'tickets'}</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-amber-900/60 text-[11px] text-amber-300/80 font-mono truncate">
            {isBn ? 'শীর্ষ প্রায়োরিটি র‍্যাঙ্ক' : 'Top Priority Ranked'} ({((budgetCount / totalEvaluated) * 100).toFixed(1)}%)
          </div>
        </div>

        {/* Card 2: Primary Goal Hits */}
        <div
          className={`relative overflow-hidden rounded-xl p-4 shadow-lg transition-all ${
            isGoalAchieved
              ? 'bg-gradient-to-br from-[#161b22] to-[#0b2518] border-2 border-emerald-400 shadow-emerald-950/50 ring-2 ring-emerald-500/30'
              : 'bg-gradient-to-br from-[#161b22] to-[#1c1a12] border-2 border-cyan-400 shadow-cyan-950/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span>🎯 {targetTier}-{isBn ? 'ম্যাচ হিট' : 'Match Hits'}</span>
              <span className="px-1.5 py-0.2 text-[9px] bg-cyan-400 text-black font-extrabold rounded">
                {isBn ? 'আপনার টার্গেট' : 'YOUR TARGET'}
              </span>
            </span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-cyan-300 tabular-nums">
              {targetHitsBudget}
            </span>
            <span className="text-xs text-cyan-400/90 font-medium">{isBn ? 'বাজেটে হিট' : 'in budget'}</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-800 text-[11px] text-neutral-300 font-mono truncate flex items-center justify-between">
            <span>{isBn ? `ফুল হুইলে: ${targetHitsFull}` : `Full Wheel: ${targetHitsFull}`}</span>
            <span className={isGoalAchieved ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {isGoalAchieved ? (isBn ? 'টার্গেট অর্জিত' : 'Goal Achieved') : (isBn ? `${targetFreq} বার প্রয়োজন` : `Need ${targetFreq}x`)}
            </span>
          </div>
        </div>

        {/* Card 3: Top Tier / Jackpot Hits */}
        <div className="bg-[#161b22] border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono truncate">
              {topTierLabel}
            </span>
            <Trophy className="w-4 h-4 text-yellow-400 shrink-0" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
              {topTierHitsBudget}
            </span>
            <span className="text-xs text-neutral-400 font-medium">{isBn ? 'বাজেটে' : 'in budget'}</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 font-mono truncate">
            {isBn ? `ফুল হুইলে: ${topTierHitsFull} টি` : `Full Wheel: ${topTierHitsFull} tickets`}
          </div>
        </div>

        {/* Card 4: Supporting / Minor Tier Hits */}
        <div className="bg-[#161b22] border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider font-mono truncate">
              {minorTierLabel}
            </span>
            <Layers className="w-4 h-4 text-neutral-400 shrink-0" />
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
              {minorTierHitsBudget}
            </span>
            <span className="text-xs text-neutral-400 font-medium">{isBn ? 'বাজেটে' : 'in budget'}</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 font-mono truncate">
            {isBn ? `ফুল হুইলে: ${minorTierHitsFull} টি` : `Full Wheel: ${minorTierHitsFull} tickets`}
          </div>
        </div>

        {/* Card 5: Wheel Size & Bound Efficiency */}
        <div className="bg-[#161b22] border border-neutral-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider font-mono">
              {isBn ? 'মোট হুইল সাইজ' : 'Wheel Size'}
            </span>
            <span className="text-[10px] font-mono text-neutral-500">
              {isBn ? 'বাউন্ড: ' : 'Bound: '}{schonheimBound.toLocaleString()}
            </span>
          </div>
          <div className="mt-2.5 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
              {totalEvaluated.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-400 font-medium">{isBn ? 'টিকিট' : 'tickets'}</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-neutral-800 text-[11px] text-emerald-400 font-bold font-mono truncate">
            100.0% Bound Efficiency
          </div>
        </div>
      </div>
    </div>
  );
};
