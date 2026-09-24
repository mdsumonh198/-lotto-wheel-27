import React, { useState, useMemo } from 'react';
import { TicketEvaluation } from '../types';
import { Search, Download, ChevronLeft, ChevronRight, Filter, Wallet, Shield, CheckCircle2, Sparkles, Trophy } from 'lucide-react';
import { exportEvaluationsToCSV, exportSmartStopWheelToCSV } from '../wheelEngine';

interface DetailTableProps {
  evaluations: TicketEvaluation[];
  winningNumbers: number[];
  budgetCount: number;
}

export const DetailTable: React.FC<DetailTableProps> = ({
  evaluations,
  winningNumbers,
  budgetCount,
}) => {
  const [scopeFilter, setScopeFilter] = useState<'budget' | 'full'>('budget');
  const [tierFilter, setTierFilter] = useState<'all-winning' | '5-only' | '4-only' | '3-only' | 'all'>('all-winning');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const winningSet = useMemo(() => new Set(winningNumbers), [winningNumbers]);

  const filtered = useMemo(() => {
    let result = evaluations;

    // Scope filter (Active Budget vs Full Wheel)
    if (scopeFilter === 'budget') {
      result = result.filter((e) => e.inBudget);
    }

    // Match tier filter
    if (tierFilter === 'all-winning') {
      result = result.filter((e) => e.matches >= 3);
    } else if (tierFilter === '5-only') {
      result = result.filter((e) => e.matches >= 5);
    } else if (tierFilter === '4-only') {
      result = result.filter((e) => e.matches === 4);
    } else if (tierFilter === '3-only') {
      result = result.filter((e) => e.matches === 3);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((e) => {
        const rankMatch = String(e.priorityRank).includes(q) || `#${e.priorityRank}`.includes(q);
        const idMatch = e.id.toLowerCase().includes(q);
        const numMatch = e.numbers.some((n) => String(n) === q || String(n).padStart(2, '0') === q);
        return rankMatch || idMatch || numMatch;
      });
    }

    // Sort: Priority rank ascending for budget order, with winning status visible
    return [...result].sort((a, b) => a.priorityRank - b.priorityRank);
  }, [evaluations, scopeFilter, tierFilter, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  const handleDownloadFiltered = () => {
    const csvData = exportEvaluationsToCSV(filtered);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lottery_wheel_evaluation_${scopeFilter}_${tierFilter}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerCSVDownload = (data: TicketEvaluation[], filename: string) => {
    const csvData = exportSmartStopWheelToCSV(data);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#161b22] border border-neutral-800 rounded-xl overflow-hidden shadow-xl mb-8">
      {/* Controls Bar */}
      <div className="p-4 sm:p-5 border-b border-neutral-800 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>Priority-Ranked Match Evaluation Table</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                {filtered.length.toLocaleString()} matching tickets
              </span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Ranked from highest marginal coverage entropy down to full wheel size.
            </p>
          </div>

          <button
            onClick={handleDownloadFiltered}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg text-xs font-medium transition-colors border border-neutral-700 shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Table (CSV)</span>
          </button>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Scope Filter: Budget vs Full */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 font-mono">
              Display Scope
            </label>
            <select
              value={scopeFilter}
              onChange={(e) => {
                setScopeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0d1117] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-amber-500"
            >
              <option value="budget">Top {budgetCount.toLocaleString()} Budget Tickets</option>
              <option value="full">Full Wheel ({evaluations.length.toLocaleString()} Tickets)</option>
            </select>
          </div>

          {/* Tier Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 font-mono">
              Prize Tier
            </label>
            <select
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0d1117] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all-winning">Winning Tickets (3+ Matches)</option>
              <option value="5-only">5-Matches Only (Guaranteed)</option>
              <option value="4-only">4-Matches Only</option>
              <option value="3-only">3-Matches Only</option>
              <option value="all">All Tickets in Scope</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 font-mono">
              Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search Rank, TK-ID, or Number..."
                className="w-full bg-[#0d1117] border border-neutral-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="bg-[#0d1117] border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[11px]">
            <tr>
              <th className="py-3 px-4 font-semibold">Priority Rank</th>
              <th className="py-3 px-4 font-semibold">Ticket ID</th>
              <th className="py-3 px-4 font-semibold">Ticket Numbers</th>
              <th className="py-3 px-4 font-semibold text-center">Matches</th>
              <th className="py-3 px-4 font-semibold">Status / Prize Tier</th>
              <th className="py-3 px-4 font-semibold">Matched Digits</th>
              <th className="py-3 px-4 font-semibold">Unmatched Digits</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/80 font-mono">
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-neutral-500 italic">
                  No tickets matched the selected criteria in this scope.
                </td>
              </tr>
            ) : (
              pageItems.map((item) => {
                const isJackpot = item.matches === 6;
                const isFive = item.matches === 5;
                const isFour = item.matches === 4;
                const isThree = item.matches === 3;

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className={`hover:bg-neutral-800/40 transition-colors ${
                        isFive
                          ? 'bg-emerald-950/20'
                          : isJackpot
                          ? 'bg-yellow-950/20'
                          : ''
                      }`}
                    >
                      {/* Priority Rank */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs bg-[#21262d] text-neutral-200 border border-neutral-700">
                          #{item.priorityRank}
                        </span>
                      </td>

                      {/* Ticket ID & Budget Badge */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-white">{item.id}</span>
                          {item.inBudget && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                              Budget
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ticket Numbers */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {item.numbers.map((n) => {
                            const isMatch = winningSet.has(n);
                            return (
                              <span
                                key={n}
                                className={`inline-flex items-center justify-center w-6 h-6 rounded text-[11px] font-bold ${
                                  isMatch
                                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700'
                                    : 'bg-[#21262d] text-neutral-400'
                                }`}
                              >
                                {String(n).padStart(2, '0')}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Matches Count */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded font-extrabold text-xs ${
                            isJackpot
                              ? 'bg-yellow-500 text-black'
                              : isFive
                              ? 'bg-emerald-500 text-black'
                              : isFour
                              ? 'bg-blue-900/80 text-blue-300 border border-blue-700'
                              : isThree
                              ? 'bg-amber-900/60 text-amber-300 border border-amber-700'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {item.matches}
                        </span>
                      </td>

                      {/* Prize Tier */}
                      <td className="py-3 px-4">
                        {isJackpot ? (
                          <span className="text-yellow-400 font-bold flex items-center gap-1">
                            👑 Jackpot (6/6)
                          </span>
                        ) : isFive ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            ⭐ 5-Match (Guaranteed)
                          </span>
                        ) : isFour ? (
                          <span className="text-blue-400 font-medium">🔹 4-Match Prize</span>
                        ) : isThree ? (
                          <span className="text-amber-400 font-medium">🔸 3-Match Prize</span>
                        ) : (
                          <span className="text-neutral-500">{item.matches}-Match (No Prize)</span>
                        )}
                      </td>

                      {/* Matched Digits */}
                      <td className="py-3 px-4 text-emerald-400">
                        {item.matchedDigits.length > 0
                          ? item.matchedDigits.map((n) => String(n).padStart(2, '0')).join(' · ')
                          : '—'}
                      </td>

                      {/* Unmatched Digits */}
                      <td className="py-3 px-4 text-neutral-500">
                        {item.unmatchedDigits.length > 0
                          ? item.unmatchedDigits.map((n) => String(n).padStart(2, '0')).join(' · ')
                          : '—'}
                      </td>
                    </tr>

                    {/* SMART STOP 1: Rank #14 */}
                    {item.priorityRank === 14 && (
                      <tr className="bg-[#1e1708] border-y-2 border-amber-500/80">
                        <td colSpan={7} className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 font-sans">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-extrabold text-amber-400">
                                  🛑 SMART STOP 1: Minimum Budget Entry (Top 14 Tickets)
                                </span>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-600/50">
                                  Low-Risk Core
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-neutral-300">
                                <span className="flex items-center gap-1">
                                  <span>🟡</span> <strong>3-Match:</strong> 100% Guaranteed ≥ 1 Ticket
                                </span>
                                <span className="flex items-center gap-1">
                                  <span>🔵</span> <strong>4-Match:</strong> ~15% Probability
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const subset = evaluations.slice(0, 14);
                                triggerCSVDownload(subset, 'lotto_wheel_smart_stop_top_14.csv');
                              }}
                              className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-lg text-xs transition-colors shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Top 14 Tickets (CSV)</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* SMART STOP 2: Rank #135 */}
                    {item.priorityRank === 135 && (
                      <tr className="bg-[#081e28] border-y-2 border-cyan-500/80">
                        <td colSpan={7} className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 font-sans">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-extrabold text-cyan-400">
                                  🛑 SMART STOP 2: Sweet Spot ROI Zone (Top 135 Tickets)
                                </span>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-900/60 text-cyan-300 border border-cyan-600/50">
                                  Optimal Value
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-neutral-300">
                                <span className="flex items-center gap-1">
                                  <span>🔵</span> <strong>4-Match:</strong> 100% Guaranteed ≥ 1 to 2 Tickets
                                </span>
                                <span className="flex items-center gap-1">
                                  <span>🟡</span> <strong>3-Match:</strong> Guaranteed 8 to 15 Tickets
                                </span>
                                <span className="flex items-center gap-1">
                                  <span>🟢</span> <strong>5-Match:</strong> ~20% Probability
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const subset = evaluations.slice(0, 135);
                                triggerCSVDownload(subset, 'lotto_wheel_smart_stop_top_135.csv');
                              }}
                              className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold rounded-lg text-xs transition-colors shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Top 135 Tickets (CSV)</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* SMART STOP 3: Rank #500 */}
                    {item.priorityRank === 500 && (
                      <tr className="bg-[#241306] border-y-2 border-orange-500/80">
                        <td colSpan={7} className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 font-sans">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-extrabold text-orange-400">
                                  🛑 SMART STOP 3: Syndicate Safe Zone (Top 500 Priority Tickets)
                                </span>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-900/60 text-orange-300 border border-orange-600/50">
                                  High Roller / Syndicate
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-neutral-300">
                                <span className="flex items-center gap-1">
                                  <span>🟢</span> <strong>5-Match:</strong> ~75% Win Probability (Hits in 3 of 4 draws)
                                </span>
                                <span className="flex items-center gap-1">
                                  <span>🔵</span> <strong>4-Match:</strong> Guaranteed 2 to 4 Tickets
                                </span>
                                <span className="flex items-center gap-1">
                                  <span>🟡</span> <strong>3-Match:</strong> Guaranteed 35 to 45 Tickets
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const subset = evaluations.slice(0, 500);
                                triggerCSVDownload(subset, 'lotto_wheel_smart_stop_top_500.csv');
                              }}
                              className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-black font-bold rounded-lg text-xs transition-colors shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Top 500 Tickets (CSV)</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* FINAL MILESTONE: Rank #2335 */}
                    {item.priorityRank === 2335 && (
                      <tr className="bg-[#062416] border-y-2 border-emerald-500/80">
                        <td colSpan={7} className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 font-sans">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-extrabold text-emerald-400">
                                  🏆 FINAL STOP: Absolute 100% Mathematical Lock (Full 2,335 Tickets)
                                </span>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-600/50">
                                  Zero Miss Guaranteed
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-neutral-300">
                                <span className="flex items-center gap-1">
                                  <span>🟢</span> <strong>5-Match:</strong> 100% Guaranteed ≥ 1 to 3 Tickets
                                </span>
                                <span className="flex items-center gap-1">
                                  <span>🔵</span> <strong>4-Match:</strong> Guaranteed 12 to 25 Tickets
                                </span>
                                <span className="flex items-center gap-1">
                                  <span>🟡</span> <strong>3-Match:</strong> Guaranteed 110 to 210 Tickets
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                triggerCSVDownload(evaluations, 'lotto_wheel_full_2335_tickets.csv');
                              }}
                              className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-xs transition-colors shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Full 2,335 Wheel (CSV)</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-neutral-800 bg-[#0d1117] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-[#161b22] border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200"
          >
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="ml-2">
            Showing {Math.min(startIndex + 1, filtered.length)} to{' '}
            {Math.min(startIndex + pageSize, filtered.length)} of {filtered.length.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validPage === 1}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-neutral-300">
            Page {validPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validPage === totalPages}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
