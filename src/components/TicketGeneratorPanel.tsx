import React, { useState, useMemo } from 'react';
import { Sparkles, Download, Copy, Check, Filter, Layers, RefreshCw, Dice5 } from 'lucide-react';
import { Ticket, GamePreset } from '../types';
import { GAME_PRESETS, generateCustomTickets } from '../wheelEngine';

interface TicketGeneratorPanelProps {
  currentPresetId?: string;
  onSelectGame?: (preset: GamePreset) => void;
}

export const TicketGeneratorPanel: React.FC<TicketGeneratorPanelProps> = ({
  currentPresetId = '6-27',
  onSelectGame,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(currentPresetId);
  const [poolSize, setPoolSize] = useState<number>(27);
  const [pickSize, setPickSize] = useState<number>(6);
  const [ticketCount, setTicketCount] = useState<number>(10);
  const [balancedOddEven, setBalancedOddEven] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<number[]>([]);
  const [excludeNumbers, setExcludeNumbers] = useState<number[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  // Active preset
  const activePreset = useMemo(() => {
    return GAME_PRESETS.find((p) => p.id === selectedPresetId);
  }, [selectedPresetId]);

  // Handle preset change
  const handlePresetSelect = (preset: GamePreset) => {
    setSelectedPresetId(preset.id);
    setPoolSize(preset.poolSize);
    setPickSize(preset.pickSize);
    setIncludeNumbers((prev) => prev.filter((n) => n <= preset.poolSize));
    setExcludeNumbers((prev) => prev.filter((n) => n <= preset.poolSize));
    if (onSelectGame) {
      onSelectGame(preset);
    }
  };

  // State to hold generated tickets
  const [generatedTickets, setGeneratedTickets] = useState<Ticket[]>(() => {
    return generateCustomTickets(27, 6, { count: 10, balancedOddEven: true });
  });

  // Handle generation
  const handleGenerate = () => {
    const tickets = generateCustomTickets(poolSize, pickSize, {
      count: ticketCount,
      includeKeyNumbers: includeNumbers,
      excludeNumbers: excludeNumbers,
      balancedOddEven,
    });
    setGeneratedTickets(tickets);
  };

  // Export CSV
  const handleDownloadCSV = () => {
    if (generatedTickets.length === 0) return;
    const numHeaders = Array.from({ length: pickSize }, (_, i) => `Ball_${i + 1}`);
    const header = ['Ticket_ID', 'Rank', 'Numbers', ...numHeaders];
    const rows = generatedTickets.map((t, idx) => [
      t.id,
      idx + 1,
      `"${t.numbers.map((n) => String(n).padStart(2, '0')).join(' ')}"`,
      ...t.numbers.map(String),
    ]);
    const csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `generated_lottery_tickets_${pickSize}_of_${poolSize}_${generatedTickets.length}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (generatedTickets.length === 0) return;
    const text = generatedTickets
      .map(
        (t, idx) =>
          `Ticket ${idx + 1} (${t.id}): ${t.numbers.map((n) => String(n).padStart(2, '0')).join(' - ')}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Number frequency in generated tickets
  const frequencyMap = useMemo(() => {
    const map: Record<number, number> = {};
    for (const t of generatedTickets) {
      for (const n of t.numbers) {
        map[n] = (map[n] || 0) + 1;
      }
    }
    return map;
  }, [generatedTickets]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-[#161b22] to-blue-950/60 border border-emerald-800/60 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Universal Lottery Ticket Generator
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal border border-emerald-500/30">
                  Any Game · 1 to 50 Balls
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Generate high-dispersion, entropy-balanced ticket sets for 6/49, 6/45, 6/42, 6/36, 6/27, 6/20, 5/35 or custom rules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerate}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Generate {ticketCount} Tickets
            </button>
          </div>
        </div>
      </div>

      {/* Game Preset Quick Selectors */}
      <div className="bg-[#161b22] border border-neutral-800 rounded-2xl p-4 sm:p-5">
        <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          Select Game Preset (যেকোনো লটারি গেম সিলেক্ট করুন):
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {GAME_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950/50'
                    : 'bg-[#0d1117] border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold truncate">{preset.name.split(' ')[0]} {preset.shortLabel}</div>
                <div className="text-[10px] text-neutral-400 font-mono mt-1">
                  {preset.pickSize} of {preset.poolSize}
                </div>
              </button>
            );
          })}
        </div>

        {activePreset && (
          <div className="mt-3 text-xs text-emerald-400/90 font-mono bg-emerald-950/30 border border-emerald-800/40 rounded-lg px-3 py-2">
            ℹ️ <strong className="text-white">{activePreset.name}:</strong> {activePreset.description}
          </div>
        )}
      </div>

      {/* Generator Controls */}
      <div className="bg-[#161b22] border border-neutral-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-blue-400" />
          Generation Settings & Filters
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Ticket Count Presets */}
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5 font-medium">
              Number of Tickets to Generate:
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[5, 10, 20, 50, 100].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => setTicketCount(cnt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    ticketCount === cnt
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                      : 'bg-[#0d1117] border border-neutral-700 text-neutral-300 hover:border-neutral-600'
                  }`}
                >
                  {cnt}
                </button>
              ))}
              <input
                type="number"
                min="1"
                max="500"
                value={ticketCount}
                onChange={(e) => setTicketCount(Math.max(1, Math.min(500, Number(e.target.value))))}
                className="w-16 bg-[#0d1117] border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white font-mono text-center focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Game Universe Controls */}
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5 font-medium">
              Number Universe (Pool v):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max="50"
                value={poolSize}
                onChange={(e) => setPoolSize(Number(e.target.value))}
                className="flex-1 accent-emerald-500 cursor-pointer"
              />
              <span className="text-xs font-mono font-bold text-emerald-400 w-12 text-right">
                1–{poolSize}
              </span>
            </div>
          </div>

          {/* Numbers Per Ticket */}
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5 font-medium">
              Pick Size (k per ticket):
            </label>
            <div className="flex items-center gap-2">
              {[5, 6, 7].map((k) => (
                <button
                  key={k}
                  onClick={() => setPickSize(k)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    pickSize === k
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#0d1117] border border-neutral-700 text-neutral-300 hover:border-neutral-600'
                  }`}
                >
                  {k} Numbers
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lucky Key Numbers to Include */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs text-neutral-400 font-medium flex items-center gap-1.5">
              🍀 Lucky / Key Numbers to Lock in Every Ticket (Max {pickSize - 1}):
            </label>
            {includeNumbers.length > 0 && (
              <button
                onClick={() => setIncludeNumbers([])}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Clear Key Numbers
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-[#0d1117] rounded-xl border border-neutral-800/80">
            {Array.from({ length: poolSize }, (_, i) => i + 1).map((num) => {
              const isIncluded = includeNumbers.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => {
                    if (isIncluded) {
                      setIncludeNumbers(includeNumbers.filter((n) => n !== num));
                    } else if (includeNumbers.length < pickSize - 1) {
                      setIncludeNumbers([...includeNumbers, num].sort((a, b) => a - b));
                    }
                  }}
                  className={`w-7 h-7 rounded-full text-xs font-bold font-mono transition-all flex items-center justify-center ${
                    isIncluded
                      ? 'bg-emerald-500 text-black shadow-sm shadow-emerald-500/50 scale-105'
                      : 'bg-neutral-800/80 text-neutral-400 hover:text-white hover:bg-neutral-700'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center gap-4 pt-2 border-t border-neutral-800">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
            <input
              type="checkbox"
              checked={balancedOddEven}
              onChange={(e) => setBalancedOddEven(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span>Balance Odd / Even Distribution (Statistically proven standard ratio)</span>
          </label>
        </div>
      </div>

      {/* Generated Results Panel */}
      <div className="bg-[#161b22] border border-neutral-800 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Generated Tickets: <span className="text-emerald-400">{generatedTickets.length}</span>
              <span className="text-xs text-neutral-400 font-mono font-normal">
                (Game {pickSize}/{poolSize})
              </span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Optimized for maximum combinatorial dispersion with zero repetitive combinations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1117] border border-neutral-700 hover:border-neutral-500 text-neutral-200 text-xs font-medium rounded-xl transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>

            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
          </div>
        </div>

        {/* Tickets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {generatedTickets.map((ticket, idx) => (
            <div
              key={ticket.id}
              className="bg-[#0d1117] border border-neutral-800 rounded-xl p-3 flex items-center justify-between hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-mono font-bold text-neutral-400 bg-neutral-800/60 px-2 py-1 rounded-md">
                  #{idx + 1}
                </span>
                <div className="flex items-center gap-1.5">
                  {ticket.numbers.map((n) => {
                    const isKey = includeNumbers.includes(n);
                    return (
                      <span
                        key={n}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                          isKey
                            ? 'bg-emerald-500 text-black ring-2 ring-emerald-400/50'
                            : 'bg-slate-800 text-white border border-slate-700'
                        }`}
                      >
                        {String(n).padStart(2, '0')}
                      </span>
                    );
                  })}
                </div>
              </div>

              <span className="text-[10px] text-neutral-400 font-mono">
                {ticket.id}
              </span>
            </div>
          ))}
        </div>

        {/* Number Dispersion & Coverage Strip */}
        <div className="mt-4 pt-4 border-t border-neutral-800/80">
          <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Number Coverage in Current Batch ({Object.keys(frequencyMap).length} of {poolSize} numbers played):
          </div>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
            {Array.from({ length: poolSize }, (_, i) => i + 1).map((num) => {
              const count = frequencyMap[num] || 0;
              return (
                <div
                  key={num}
                  className={`text-[10px] font-mono px-2 py-1 rounded border flex items-center gap-1 ${
                    count > 0
                      ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <span>{String(num).padStart(2, '0')}</span>
                  <span className="font-bold">({count}x)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
