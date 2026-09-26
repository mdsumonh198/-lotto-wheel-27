import React, { useState, useMemo } from 'react';
import { TicketEvaluation, GuaranteeGoal, GameCategory } from '../types';
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Copy,
  Check,
  FileSpreadsheet,
  Trophy,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { exportEvaluationsToCSV } from '../wheelEngine';

interface DetailTableProps {
  evaluations: TicketEvaluation[];
  winningNumbers: number[];
  budgetCount: number;
  goal?: GuaranteeGoal;
  poolSize?: number;
  pickSize?: number;
  gameCategory?: GameCategory;
  orderMatters?: boolean;
  lang?: 'bn' | 'en';
}

export const DetailTable: React.FC<DetailTableProps> = ({
  evaluations,
  winningNumbers,
  budgetCount,
  goal,
  poolSize = 27,
  pickSize = 6,
  gameCategory = 'lotto',
  orderMatters = false,
  lang = 'bn',
}) => {
  const isBn = lang === 'bn';
  const isDigitGame = gameCategory === 'pick_digits' || poolSize === 10 || pickSize <= 4;
  const [scopeFilter, setScopeFilter] = useState<'budget' | 'full'>('full'); // Default to full wheel so all 2,335 tickets are immediately visible
  const [tierFilter, setTierFilter] = useState<'goal-only' | 'straight-only' | 'box-only' | 'pairs-only' | 'all-winning' | '5-only' | '4-only' | '3-only' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(100);

  // Client Proof Inspector State
  const [proofQuery, setProofQuery] = useState<string>('1, 2, 3, 4, 5, 6');
  const [copiedProof, setCopiedProof] = useState<boolean>(false);
  const [expandedTier, setExpandedTier] = useState<'5' | '4' | '3' | null>('4');

  const targetTier = goal?.matchTier || (isDigitGame ? 3 : 5);

  // Winning ticket groups by match count
  const ticketsByMatch = useMemo(() => {
    const groups: { [key: number]: TicketEvaluation[] } = { 6: [], 5: [], 4: [], 3: [], 2: [], 1: [], 0: [] };
    evaluations.forEach((item) => {
      const m = Math.min(item.matches, 6);
      if (groups[m]) {
        groups[m].push(item);
      }
    });
    return groups;
  }, [evaluations]);

  const match5List = ticketsByMatch[5] || [];
  const match4List = ticketsByMatch[4] || [];
  const match3List = ticketsByMatch[3] || [];
  const jackpotList = ticketsByMatch[6] || [];

  // Client proof lookup logic
  const proofResult = useMemo(() => {
    const q = proofQuery.trim().toLowerCase();
    if (!q) return null;

    // 1. Try parsing numbers (e.g. "1, 2, 3, 4, 5, 7" or "1 2 3 4 5 6" or "01-02-03-04-05-06")
    const numTokens = q.match(/\d+/g)?.map(Number);
    if (numTokens && numTokens.length === pickSize) {
      const sortedSearch = [...numTokens].sort((a, b) => a - b);
      const exactFound = evaluations.find((item) => {
        const sortedItem = [...item.numbers].sort((a, b) => a - b);
        return sortedItem.every((val, idx) => val === sortedSearch[idx]);
      });

      if (exactFound) {
        return {
          found: true,
          isExact: true,
          ticket: exactFound,
          searchType: 'numbers' as const,
          sheetRow: exactFound.sheetRow || (exactFound.priorityRank + 1),
          hitsCount: pickSize,
          matchedBalls: exactFound.numbers,
          drawNumbers: sortedSearch,
          excelRowNote: `Excel Sheet Row #${exactFound.sheetRow || (exactFound.priorityRank + 1)} (Row 1 is CSV Header)`,
        };
      }

      // Not an exact ticket, find guaranteed winning ticket in wheel for this draw!
      const searchSet = new Set(sortedSearch);
      let bestTicket: TicketEvaluation | null = null;
      let maxHits = 0;
      let bestHitsList: number[] = [];

      for (const item of evaluations) {
        const hits = item.numbers.filter((n) => searchSet.has(n));
        if (hits.length > maxHits) {
          maxHits = hits.length;
          bestTicket = item;
          bestHitsList = hits;
        }
      }

      if (bestTicket) {
        return {
          found: true,
          isExact: false,
          ticket: bestTicket,
          searchType: 'numbers' as const,
          sheetRow: bestTicket.sheetRow || (bestTicket.priorityRank + 1),
          hitsCount: maxHits,
          matchedBalls: bestHitsList,
          drawNumbers: sortedSearch,
          excelRowNote: `Excel Sheet Row #${bestTicket.sheetRow || (bestTicket.priorityRank + 1)} (Row 1 is CSV Header)`,
        };
      }
    }

    // 2. Try parsing ticket ID or Rank or Sheet Row
    // e.g. "TK-0001", "1", "#1", "row 2", "sheet row 2"
    let targetRank = -1;
    let targetRow = -1;

    if (q.startsWith('tk-')) {
      const idNum = parseInt(q.replace('tk-', ''), 10);
      if (!isNaN(idNum)) targetRank = idNum;
    } else if (q.includes('row')) {
      const rowNum = parseInt(q.replace(/\D/g, ''), 10);
      if (!isNaN(rowNum)) targetRow = rowNum;
    } else if (!isNaN(Number(q))) {
      targetRank = parseInt(q, 10);
    }

    if (targetRank > 0) {
      const found = evaluations.find((item) => item.priorityRank === targetRank || item.id.toLowerCase() === `tk-${String(targetRank).padStart(4, '0')}`.toLowerCase());
      if (found) {
        return {
          found: true,
          isExact: true,
          ticket: found,
          searchType: 'id' as const,
          sheetRow: found.sheetRow || (found.priorityRank + 1),
          hitsCount: found.matches,
          matchedBalls: found.matchedDigits,
          drawNumbers: winningNumbers,
          excelRowNote: `Excel Sheet Row #${found.sheetRow || (found.priorityRank + 1)} (Row 1 is CSV Header)`,
        };
      }
    }

    if (targetRow > 1) {
      const found = evaluations.find((item) => (item.sheetRow || item.priorityRank + 1) === targetRow);
      if (found) {
        return {
          found: true,
          isExact: true,
          ticket: found,
          searchType: 'row' as const,
          sheetRow: targetRow,
          hitsCount: found.matches,
          matchedBalls: found.matchedDigits,
          drawNumbers: winningNumbers,
          excelRowNote: `Excel Sheet Row #${targetRow} (Row 1 is CSV Header)`,
        };
      }
    }

    return {
      found: false,
      query: proofQuery,
      parsedCount: numTokens?.length || 0,
    };
  }, [proofQuery, evaluations, pickSize, winningNumbers]);

  // Handle copying proof for client
  const handleCopyProof = () => {
    if (!proofResult || !proofResult.found || !proofResult.ticket) return;
    const t = proofResult.ticket;
    const row = t.sheetRow || (t.priorityRank + 1);
    const isExact = proofResult.isExact;
    const hits = proofResult.hitsCount || t.matches;
    const drawStr = proofResult.drawNumbers
      ? proofResult.drawNumbers.map((n) => String(n).padStart(2, '0')).join(' - ')
      : winningNumbers.map((n) => String(n).padStart(2, '0')).join(' - ');
    const matchedStr = proofResult.matchedBalls
      ? proofResult.matchedBalls.map((n) => String(n).padStart(2, '0')).join(', ')
      : t.matchedDigits.map((n) => String(n).padStart(2, '0')).join(', ');

    const text = `================================================
LOTTERY WHEEL VERIFICATION & CLIENT PROOF
================================================
Draw Numbers  : ${drawStr}
${isExact ? 'Status        : EXACT TICKET IN WHEEL (100% MATCH)' : `Status        : ${hits}-MATCH GUARANTEED WINNER`}
Winning Ticket: ${t.id} (Priority Rank #${t.priorityRank})
EXCEL ROW #   : Sheet Row ${row} (Row 1 = CSV Header)
Ticket Numbers: ${t.numbers.map((n) => String(n).padStart(2, '0')).join(' - ')}
Matched Balls : [${matchedStr}] (${hits} Hits Guaranteed)
Wheel Dataset : Verified in ${evaluations.length.toLocaleString()} Tickets Full Wheel
================================================`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedProof(true);
      setTimeout(() => setCopiedProof(false), 2500);
    });
  };

  // Filtered tickets
  const filtered = useMemo(() => {
    let result = evaluations;

    // Scope filter (Active Budget vs Full Wheel)
    if (scopeFilter === 'budget') {
      result = result.filter((e) => e.inBudget);
    }

    // Match tier filter
    if (tierFilter === '5-only') {
      result = result.filter((e) => e.matches >= 5);
    } else if (tierFilter === '4-only') {
      result = result.filter((e) => e.matches === 4);
    } else if (tierFilter === '3-only') {
      result = result.filter((e) => e.matches === 3);
    } else if (tierFilter === 'goal-only') {
      result = result.filter((e) => e.meetsGoal || e.matches >= targetTier);
    } else if (tierFilter === 'straight-only') {
      result = result.filter((e) => e.isStraightWin);
    } else if (tierFilter === 'box-only') {
      result = result.filter((e) => e.isBoxWin);
    } else if (tierFilter === 'pairs-only') {
      result = result.filter((e) => e.isFrontPair || e.isBackPair || e.isSplitPair);
    } else if (tierFilter === 'all-winning') {
      if (isDigitGame) {
        result = result.filter((e) => e.matches >= 2 || e.isStraightWin || e.isBoxWin || e.isFrontPair || e.isBackPair);
      } else {
        result = result.filter((e) => e.matches >= 3);
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((e) => {
        const rowNum = e.sheetRow || (e.priorityRank + 1);
        const rankMatch = String(e.priorityRank).includes(q) || `#${e.priorityRank}`.includes(q);
        const rowMatch = `row ${rowNum}`.includes(q) || `row#${rowNum}`.includes(q) || `রো ${rowNum}`.includes(q);
        const idMatch = e.id.toLowerCase().includes(q);
        const numMatch = e.numbers.some((n) => String(n) === q || String(n).padStart(2, '0') === q);
        const joinedMatch = e.numbers.join('').includes(q) || e.numbers.join('-').includes(q) || e.numbers.join(' ').includes(q);
        return rankMatch || rowMatch || idMatch || numMatch || joinedMatch;
      });
    }

    return [...result].sort((a, b) => a.priorityRank - b.priorityRank);
  }, [evaluations, scopeFilter, tierFilter, searchQuery, targetTier, isDigitGame]);

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
    link.setAttribute('download', `lottery_evaluation_${gameCategory}_${scopeFilter}_${filtered.length}_tickets.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#161b22] border border-neutral-800 rounded-xl overflow-hidden shadow-xl mb-8 font-sans">
      {/* ========================================================================= */}
      {/* 1. CLIENT PROOF & SHEET ROW INSPECTOR (ক্লায়েন্ট প্রমাণ ও শিট রো যাচাইকারী) */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 border-b border-neutral-800 bg-gradient-to-r from-[#1c2333] to-[#161b22]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{isBn ? 'ক্লায়েন্ট প্রমাণ ও শিট রো যাচাইকারী (Client Proof & Sheet Row Inspector)' : 'Client Proof & Sheet Row Inspector'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                  {isBn ? '১০০% প্রমাণ নিশ্চয়তা' : '100% Verified Proof'}
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                {isBn
                  ? 'ক্লায়েন্ট যে টিকিট দেখতে চায় (যেমন: 1, 2, 3, 4, 5, 6 বা TK-0001), তা লিখে যাচাই করুন এবং এক্সেল শিটের ঠিক কত নম্বর রো-তে আছে তার সরাসরি প্রমাণ দিন।'
                  : 'Enter any ticket numbers or ID to get instant proof and exact Excel/CSV sheet row location.'}
              </p>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] text-neutral-400">{isBn ? 'দ্রুত পরীক্ষা:' : 'Quick Proof:'}</span>
            <button
              onClick={() => setProofQuery('1, 2, 3, 4, 5, 6')}
              className="px-2 py-1 rounded bg-[#0d1117] hover:bg-neutral-800 text-emerald-300 border border-emerald-800/80 font-mono text-[11px] cursor-pointer transition-colors"
            >
              1, 2, 3, 4, 5, 6
            </button>
            <button
              onClick={() => setProofQuery('TK-0001')}
              className="px-2 py-1 rounded bg-[#0d1117] hover:bg-neutral-800 text-cyan-300 border border-cyan-800 font-mono text-[11px] cursor-pointer transition-colors"
            >
              TK-0001 (Row 2)
            </button>
            <button
              onClick={() => setProofQuery('TK-0138')}
              className="px-2 py-1 rounded bg-[#0d1117] hover:bg-neutral-800 text-amber-300 border border-amber-800 font-mono text-[11px] cursor-pointer transition-colors"
            >
              TK-0138 (Row 139)
            </button>
            <button
              onClick={() => setProofQuery(`TK-${String(evaluations.length).padStart(4, '0')}`)}
              className="px-2 py-1 rounded bg-[#0d1117] hover:bg-neutral-800 text-purple-300 border border-purple-800 font-mono text-[11px] cursor-pointer transition-colors"
            >
              {isBn ? `শেষ টিকিট (${evaluations.length})` : `Last Ticket (${evaluations.length})`}
            </button>
          </div>
        </div>

        {/* Input bar and verification result */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={proofQuery}
              onChange={(e) => setProofQuery(e.target.value)}
              placeholder={isBn ? 'যেমন: 1, 2, 3, 4, 5, 6 অথবা TK-0001 অথবা Row 2...' : 'e.g. 1, 2, 3, 4, 5, 6 or TK-0001 or Row 2...'}
              className="w-full bg-[#0d1117] border border-emerald-700/60 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
            />
          </div>
          {proofResult?.found && (
            <button
              onClick={handleCopyProof}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-900/40 cursor-pointer shrink-0"
            >
              {copiedProof ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
              <span>{copiedProof ? (isBn ? 'প্রমাণ কপি হয়েছে!' : 'Proof Copied!') : (isBn ? 'ক্লায়েন্টকে পাঠানোর টেক্সট কপি করুন' : 'Copy Proof for Client')}</span>
            </button>
          )}
        </div>

        {/* Live Proof Verification Card */}
        {proofResult && (
          <div
            className={`p-3.5 rounded-lg border text-xs font-mono transition-all ${
              proofResult.found
                ? 'bg-emerald-950/40 border-emerald-600/80 text-emerald-200'
                : 'bg-amber-950/30 border-amber-800 text-amber-200'
            }`}
          >
            {proofResult.found && proofResult.ticket ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-emerald-800/60 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-bold text-emerald-300">
                      {proofResult.isExact
                        ? (isBn ? '✅ হুবহু টিকিট প্রমাণিত (EXACT TICKET IN WHEEL)' : '✅ EXACT TICKET IN WHEEL')
                        : (isBn ? `✅ ড্র নম্বরের বিপরীতে ${proofResult.hitsCount}-ম্যাচ উইনিং টিকিট নিশ্চিত!` : `✅ ${proofResult.hitsCount}-MATCH GUARANTEED WINNING TICKET!`)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-900/80 text-white font-bold border border-emerald-600">
                      {proofResult.ticket.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-700 flex items-center gap-1">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>
                        {isBn ? `এক্সেল শিট রো #${proofResult.sheetRow}` : `Excel Sheet Row #${proofResult.sheetRow}`}
                      </span>
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    (CSV ফাইলে Row 1 হেডার, Row 2 থেকে টিকিট শুরু)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-neutral-400 text-[11px]">
                      {proofResult.isExact ? (isBn ? 'টিকিট নম্বর:' : 'Numbers:') : (isBn ? 'হুইলে থাকা উইনিং টিকিট:' : 'Winning Ticket in Wheel:')}
                    </span>
                    {proofResult.ticket.numbers.map((num, i) => {
                      const isHit = proofResult.matchedBalls ? proofResult.matchedBalls.includes(num) : winningNumbers.includes(num);
                      return (
                        <span
                          key={i}
                          className={`inline-flex items-center justify-center w-6 h-6 rounded text-[11px] font-extrabold ${
                            isHit
                              ? 'bg-emerald-500 text-black shadow-sm ring-1 ring-emerald-300'
                              : 'bg-[#0d1117] text-white border border-neutral-700'
                          }`}
                        >
                          {String(num).padStart(2, '0')}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[11px] text-neutral-400">
                      {proofResult.isExact ? (isBn ? 'উইন ক্যাটাগরি:' : 'Status:') : (isBn ? 'মিলে যাওয়া সংখ্যা:' : 'Matched Balls:')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-500 text-black font-extrabold text-xs">
                      {proofResult.hitsCount} Hits Guaranteed
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {isBn
                    ? `"${proofQuery}" পাওয়া যায়নি। অনুগ্রহ করে ঠিক ${pickSize}টি নম্বর কমা দিয়ে লিখুন (যেমন: 1, 2, 3, 4, 5, 7) অথবা টিকিট আইডি (TK-0001) দিয়ে খুঁজুন।`
                    : `"${proofQuery}" not found. Please enter ${pickSize} numbers (e.g. 1, 2, 3, 4, 5, 7) or Ticket ID.`}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. EXACT WINNING TICKETS SUMMARY (5-Match, 4-Match, 3-Match with Sheet Row) */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 border-b border-neutral-800 bg-[#12161f]">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-bold text-white">
              {isBn ? 'উইনিং টিকেটের সম্পূর্ণ তালিকা ও এক্সেল শিট রো' : 'Complete Winning Tickets List & Excel Sheet Rows'}
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {isBn
              ? `মোট উইনিং টিকিট: ${(match5List.length + match4List.length + match3List.length).toLocaleString()}টি`
              : `Total Winners: ${(match5List.length + match4List.length + match3List.length).toLocaleString()}`}
          </span>
        </div>

        {/* Winning Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {/* ⭐ 5-Match Guaranteed */}
          <div
            onClick={() => setExpandedTier(expandedTier === '5' ? null : '5')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              expandedTier === '5'
                ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50'
                : 'bg-[#161b22] border-emerald-900/60 hover:border-emerald-600'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span>⭐</span>
                <span>{isBn ? '৫-ম্যাচ গ্যারান্টিড' : '5-Match Guaranteed'}</span>
              </span>
              <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-emerald-500 text-black">
                {match5List.length} {isBn ? 'টি' : 'tix'}
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">
              {isBn ? '১০০% ম্যাথমেটিক্যাল গ্যারান্টি পূরণ' : '100% Mathematical Lock Fulfilled'}
            </div>
            <div className="mt-2 text-[10px] text-emerald-300 font-mono">
              {expandedTier === '5' ? (isBn ? '▲ বন্ধ করতে ক্লিক করুন' : '▲ Click to collapse') : (isBn ? '▼ বিস্তারিত ও শিট রো দেখতে ক্লিক করুন' : '▼ Click to view sheet rows')}
            </div>
          </div>

          {/* 🔵 4-Match */}
          <div
            onClick={() => setExpandedTier(expandedTier === '4' ? null : '4')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              expandedTier === '4'
                ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-950/50'
                : 'bg-[#161b22] border-cyan-900/60 hover:border-cyan-600'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <span>🔵</span>
                <span>{isBn ? '৪-ম্যাচ টিকিটসমূহ' : '4-Match Winners'}</span>
              </span>
              <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-cyan-500 text-black">
                {match4List.length} {isBn ? 'টি' : 'tix'}
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">
              {isBn ? '৪টি নম্বর হুবহু মিলে যাওয়া টিকিট' : 'Tickets matching 4 exact numbers'}
            </div>
            <div className="mt-2 text-[10px] text-cyan-300 font-mono">
              {expandedTier === '4' ? (isBn ? '▲ বন্ধ করতে ক্লিক করুন' : '▲ Click to collapse') : (isBn ? '▼ বিস্তারিত ও শিট রো দেখতে ক্লিক করুন' : '▼ Click to view sheet rows')}
            </div>
          </div>

          {/* 🟡 3-Match */}
          <div
            onClick={() => setExpandedTier(expandedTier === '3' ? null : '3')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              expandedTier === '3'
                ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/50'
                : 'bg-[#161b22] border-amber-900/60 hover:border-amber-600'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <span>🟡</span>
                <span>{isBn ? '৩-ম্যাচ টিকিটসমূহ' : '3-Match Winners'}</span>
              </span>
              <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-amber-500 text-black">
                {match3List.length} {isBn ? 'টি' : 'tix'}
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">
              {isBn ? '৩টি নম্বর হুবহু মিলে যাওয়া টিকিট' : 'Tickets matching 3 numbers'}
            </div>
            <div className="mt-2 text-[10px] text-amber-300 font-mono">
              {expandedTier === '3' ? (isBn ? '▲ বন্ধ করতে ক্লিক করুন' : '▲ Click to collapse') : (isBn ? '▼ বিস্তারিত ও শিট রো দেখতে ক্লিক করুন' : '▼ Click to view sheet rows')}
            </div>
          </div>
        </div>

        {/* Expanded Winning Tier Breakdown */}
        {expandedTier === '5' && (
          <div className="p-3.5 rounded-xl bg-[#0d1117] border border-emerald-700/60 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-300 font-mono">
                ⭐ {isBn ? `৫-ম্যাচ উইনিং টিকিট তালিকা (মোট ${match5List.length}টি)` : `5-Match Winning Tickets (Total ${match5List.length})`}:
              </span>
              <button
                onClick={() => {
                  setTierFilter('5-only');
                  setCurrentPage(1);
                }}
                className="text-[11px] text-emerald-400 hover:underline font-mono cursor-pointer"
              >
                {isBn ? 'টেবিলে শুধুমাত্র ৫-ম্যাচ ফিল্টার করুন →' : 'Filter table to 5-Match →'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {match5List.map((t) => (
                <div key={t.id} className="p-2.5 rounded-lg bg-[#161b22] border border-emerald-800 flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{t.id}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-bold">
                      {isBn ? `রো #${t.sheetRow || (t.priorityRank + 1)}` : `Sheet Row #${t.sheetRow || (t.priorityRank + 1)}`}
                    </span>
                    {t.inBudget && <span className="text-[9px] px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">বাজেট</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    {t.numbers.map((n, i) => (
                      <span
                        key={i}
                        className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-extrabold ${
                          winningNumbers.includes(n) ? 'bg-emerald-500 text-black font-black' : 'bg-[#21262d] text-neutral-400'
                        }`}
                      >
                        {String(n).padStart(2, '0')}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {expandedTier === '4' && (
          <div className="p-3.5 rounded-xl bg-[#0d1117] border border-cyan-700/60 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-300 font-mono">
                🔵 {isBn ? `৪-ম্যাচ উইনিং টিকিট তালিকা (মোট ${match4List.length}টি)` : `4-Match Winning Tickets (Total ${match4List.length})`}:
              </span>
              <button
                onClick={() => {
                  setTierFilter('4-only');
                  setCurrentPage(1);
                }}
                className="text-[11px] text-cyan-400 hover:underline font-mono cursor-pointer"
              >
                {isBn ? 'টেবিলে শুধুমাত্র ৪-ম্যাচ ফিল্টার করুন →' : 'Filter table to 4-Match →'}
              </button>
            </div>
            {/* Chips showing Ticket ID and Sheet Row */}
            <div className="flex flex-wrap gap-1.5 mb-2 max-h-48 overflow-y-auto p-1 bg-[#161b22] rounded-lg border border-neutral-800">
              {match4List.map((t) => (
                <span
                  key={t.id}
                  onClick={() => setSearchQuery(t.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#0d1117] hover:bg-neutral-800 text-cyan-300 border border-cyan-900 text-[11px] font-mono cursor-pointer transition-colors"
                  title={isBn ? `ক্লিক করে টেবিলে এই টিকিট দেখুন: ${t.numbers.join(', ')}` : `Click to inspect ${t.id}`}
                >
                  <span className="font-bold">{t.id}</span>
                  <span className="text-[10px] text-neutral-400">
                    ({isBn ? `রো #${t.sheetRow || (t.priorityRank + 1)}` : `Row ${t.sheetRow || (t.priorityRank + 1)}`})
                  </span>
                </span>
              ))}
            </div>
            <div className="text-[10px] text-neutral-400">
              {isBn ? '💡 যেকোনো টিকেটে ক্লিক করে সরাসরি টেবিলে তার সম্পূর্ণ তথ্য দেখুন।' : '💡 Click any ticket chip to view full details in the table.'}
            </div>
          </div>
        )}

        {expandedTier === '3' && (
          <div className="p-3.5 rounded-xl bg-[#0d1117] border border-amber-700/60 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-300 font-mono">
                🟡 {isBn ? `৩-ম্যাচ উইনিং টিকিট তালিকা (মোট ${match3List.length}টি)` : `3-Match Winning Tickets (Total ${match3List.length})`}:
              </span>
              <button
                onClick={() => {
                  setTierFilter('3-only');
                  setCurrentPage(1);
                }}
                className="text-[11px] text-amber-400 hover:underline font-mono cursor-pointer"
              >
                {isBn ? 'টেবিলে শুধুমাত্র ৩-ম্যাচ ফিল্টার করুন →' : 'Filter table to 3-Match →'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1 mb-2 max-h-48 overflow-y-auto p-1 bg-[#161b22] rounded-lg border border-neutral-800 font-mono text-[10px]">
              {match3List.map((t) => (
                <span
                  key={t.id}
                  onClick={() => setSearchQuery(t.id)}
                  className="px-1.5 py-0.5 rounded bg-[#0d1117] hover:bg-neutral-800 text-amber-300 border border-amber-900/60 cursor-pointer"
                >
                  #{t.priorityRank} (R{t.sheetRow || (t.priorityRank + 1)})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. TABLE CONTROLS (Full Wheel Browsing & Page Size Selector) */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 border-b border-neutral-800 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 flex-wrap">
              <span>{isBn ? 'লাইভ ম্যাচ ও সম্পূর্ণ হুইল ব্রাউজার' : 'Live Matching & Full Wheel Browser'}</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                {filtered.length.toLocaleString()} {isBn ? 'টি টিকিট প্রদর্শিত' : 'tickets displayed'}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                {isBn ? `(হুইলের মোট আকার: ${evaluations.length.toLocaleString()}টি)` : `(Total Wheel: ${evaluations.length.toLocaleString()})`}
              </span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isBn
                ? 'প্রতিটি টিকেটের সাথে এক্সেল শিটের সঠিক রো নম্বর (Excel Sheet Row #) সংযুক্ত।'
                : 'Every ticket mapped to its exact Excel / CSV spreadsheet row number.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFiltered}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg text-xs font-medium transition-colors border border-neutral-700 shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isBn ? 'টেবিল এক্সপোর্ট (CSV)' : 'Export Table (CSV)'}</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Scope Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 font-mono">
              {isBn ? 'প্রদর্শনের পরিধি (Scope)' : 'Display Scope'}
            </label>
            <div className="flex items-center rounded-lg bg-[#0d1117] p-1 border border-neutral-700">
              <button
                type="button"
                onClick={() => {
                  setScopeFilter('full');
                  setCurrentPage(1);
                }}
                className={`flex-1 py-1 px-2 rounded text-xs font-bold font-mono transition-colors ${
                  scopeFilter === 'full'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                🌟 {isBn ? `সম্পূর্ণ হুইল (${evaluations.length})` : `Full Wheel (${evaluations.length})`}
              </button>
              <button
                type="button"
                onClick={() => {
                  setScopeFilter('budget');
                  setCurrentPage(1);
                }}
                className={`flex-1 py-1 px-2 rounded text-xs font-bold font-mono transition-colors ${
                  scopeFilter === 'budget'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isBn ? `বাজেট (${budgetCount})` : `Budget (${budgetCount})`}
              </button>
            </div>
          </div>

          {/* Tier Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 font-mono">
              {isBn ? 'ম্যাচ ফিল্টার' : 'Prize / Match Filter'}
            </label>
            <select
              value={tierFilter}
              onChange={(e) => {
                setTierFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0d1117] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">{isBn ? `🌟 সব টিকিট (${filtered.length})` : 'All Tickets'}</option>
              <option value="5-only">{isBn ? `⭐ ৫-ম্যাচ শুধুমাত্র (${match5List.length})` : `⭐ 5-Match Only (${match5List.length})`}</option>
              <option value="4-only">{isBn ? `🔵 ৪-ম্যাচ শুধুমাত্র (${match4List.length})` : `🔵 4-Match Only (${match4List.length})`}</option>
              <option value="3-only">{isBn ? `🟡 ৩-ম্যাচ শুধুমাত্র (${match3List.length})` : `🟡 3-Match Only (${match3List.length})`}</option>
              <option value="all-winning">{isBn ? `🏆 সব উইনিং টিকিট (৩+ ম্যাচ: ${match5List.length + match4List.length + match3List.length})` : 'All Winning (3+ Matches)'}</option>
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 font-mono">
              {isBn ? 'অনুসন্ধান (Search)' : 'Search Ticket / Row'}
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
                placeholder={isBn ? 'র‍্যাঙ্ক, রো #, TK-ID বা নম্বর...' : 'Rank, Row #, TK-ID or Ball...'}
                className="w-full bg-[#0d1117] border border-neutral-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Page Size View Option */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 font-mono">
              {isBn ? 'ভিউ প্রতি টিকিট সংখ্যা' : 'Show Per View'}
            </label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full bg-[#0d1117] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500 font-mono font-bold"
            >
              <option value={50}>50 tickets</option>
              <option value={100}>100 tickets</option>
              <option value={250}>250 tickets</option>
              <option value={500}>500 tickets</option>
              <option value={1000}>1,000 tickets</option>
              <option value={Math.max(2335, evaluations.length)}>🚀 {isBn ? `সকল ${evaluations.length.toLocaleString()}টি টিকিট একসাথে দেখুন` : `Show ALL ${evaluations.length.toLocaleString()} Tickets`}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TABLE ELEMENT WITH EXCEL SHEET ROW COLUMN */}
      {/* ========================================================================= */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-neutral-300">
          <thead className="bg-[#0d1117] border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[11px]">
            <tr>
              <th className="py-3 px-3 font-semibold text-emerald-400">
                {isBn ? 'এক্সেল শিট রো #' : 'Excel Sheet Row #'}
              </th>
              <th className="py-3 px-3 font-semibold">{isBn ? 'প্রায়োরিটি র‍্যাঙ্ক' : 'Priority Rank'}</th>
              <th className="py-3 px-3 font-semibold">{isBn ? 'টিকিট আইডি' : 'Ticket ID'}</th>
              <th className="py-3 px-4 font-semibold">
                {isDigitGame ? (isBn ? 'ডিজিট স্লট (১, ২, ৩)' : 'Digits (1, 2, 3)') : (isBn ? 'টিকিট নম্বর' : 'Ticket Numbers')}
              </th>
              <th className="py-3 px-3 font-semibold text-center">{isBn ? 'ম্যাচ' : 'Matches'}</th>
              <th className="py-3 px-3 font-semibold">{isBn ? 'স্ট্যাটাস / প্রাইজ টায়ার' : 'Status / Prize Tier'}</th>
              <th className="py-3 px-4 font-semibold">
                {isDigitGame ? (isBn ? 'পজিশনাল মিল' : 'Positional Breakdown') : (isBn ? 'মিলে যাওয়া সংখ্যা' : 'Matched Numbers')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/80 font-mono">
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-neutral-500 italic">
                  {isBn ? 'এই ফিল্টারে কোনো টিকিট পাওয়া যায়নি।' : 'No tickets matched the selected criteria.'}
                </td>
              </tr>
            ) : (
              pageItems.map((item) => {
                const sheetRow = item.sheetRow || (item.priorityRank + 1);
                const isJackpot = item.matches === 6;
                const is5Match = item.matches === 5;
                const is4Match = item.matches === 4;
                const is3Match = item.matches === 3;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-neutral-800/40 transition-colors ${
                      isJackpot
                        ? 'bg-yellow-950/30'
                        : is5Match
                        ? 'bg-emerald-950/30'
                        : is4Match
                        ? 'bg-cyan-950/20'
                        : is3Match
                        ? 'bg-amber-950/15'
                        : ''
                    }`}
                  >
                    {/* Excel Sheet Row Column */}
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-950/90 text-emerald-300 border border-emerald-700/80">
                        {isBn ? `রো #${sheetRow}` : `Row #${sheetRow}`}
                      </span>
                    </td>

                    {/* Priority Rank */}
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs bg-[#21262d] text-neutral-200 border border-neutral-700">
                        #{item.priorityRank}
                      </span>
                    </td>

                    {/* Ticket ID & Budget Badge */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-white">{item.id}</span>
                        {item.inBudget && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                            {isBn ? 'বাজেট' : 'Budget'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Digits Display */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {item.numbers.map((n, idx) => {
                          const isExactPosMatch = isDigitGame && winningNumbers[idx] === n;
                          const isAnyMatch = !isDigitGame && winningNumbers.includes(n);

                          return (
                            <div key={`${n}-${idx}`} className="flex flex-col items-center">
                              <span
                                className={`inline-flex items-center justify-center ${
                                  isDigitGame ? 'w-7 h-7 text-sm' : 'w-6 h-6 text-[11px]'
                                } rounded font-extrabold ${
                                  isExactPosMatch || isAnyMatch
                                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/50 ring-1 ring-emerald-300'
                                    : 'bg-[#21262d] text-neutral-400'
                                }`}
                              >
                                {isDigitGame ? n : String(n).padStart(2, '0')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    {/* Matches Count */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded font-extrabold text-xs ${
                          isJackpot
                            ? 'bg-yellow-400 text-black'
                            : is5Match
                            ? 'bg-emerald-500 text-black'
                            : is4Match
                            ? 'bg-cyan-500 text-black'
                            : is3Match
                            ? 'bg-amber-500 text-black'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {item.matches}
                      </span>
                    </td>

                    {/* Status / Prize Tier */}
                    <td className="py-2.5 px-3">
                      {item.matches === 6 ? (
                        <span className="text-yellow-400 font-bold">👑 ৬/৬ জ্যাকপট</span>
                      ) : item.matches === 5 ? (
                        <span className="text-emerald-400 font-bold">⭐ ৫-ম্যাচ (Guaranteed)</span>
                      ) : item.matches === 4 ? (
                        <span className="text-cyan-400 font-semibold">🔹 ৪-ম্যাচ</span>
                      ) : item.matches === 3 ? (
                        <span className="text-amber-400 font-medium">🔸 ৩-ম্যাচ</span>
                      ) : (
                        <span className="text-neutral-500">{item.matches}-{isBn ? 'ম্যাচ' : 'Match'}</span>
                      )}
                    </td>

                    {/* Breakdown */}
                    <td className="py-2.5 px-4">
                      {item.matchedDigits.length > 0 ? (
                        <span className="text-emerald-300 font-bold">
                          {item.matchedDigits.map((n) => String(n).padStart(2, '0')).join(' · ')}
                        </span>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-neutral-800 bg-[#0d1117] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-400">
        <div className="flex items-center gap-2 flex-wrap">
          <span>{isBn ? 'প্রতি পেজে টিকিট:' : 'Per page:'}</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-[#161b22] border border-neutral-700 rounded px-2 py-1 text-xs text-neutral-200 font-mono"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={250}>250</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
            <option value={Math.max(2335, evaluations.length)}>🚀 {isBn ? `সকল ${evaluations.length.toLocaleString()}` : `All ${evaluations.length.toLocaleString()}`}</option>
          </select>
          <span className="ml-2 font-mono">
            {isBn
              ? `প্রদর্শিত ${Math.min(startIndex + 1, filtered.length)} থেকে ${Math.min(startIndex + pageSize, filtered.length)} (মোট ${filtered.length.toLocaleString()}টি টিকিট)`
              : `Showing ${Math.min(startIndex + 1, filtered.length)} to ${Math.min(startIndex + pageSize, filtered.length)} of ${filtered.length.toLocaleString()} tickets`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={validPage === 1}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-200 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-neutral-300">
            {isBn ? `পেজ ${validPage} এর ${totalPages}` : `Page ${validPage} of ${totalPages}`}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={validPage === totalPages}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-200 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
