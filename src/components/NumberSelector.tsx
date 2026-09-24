import React from 'react';
import { Dices, RotateCcw, Sparkles } from 'lucide-react';

interface NumberSelectorProps {
  poolSize: number;
  pickSize: number;
  selectedNumbers: number[];
  onChange: (numbers: number[]) => void;
}

export const NumberSelector: React.FC<NumberSelectorProps> = ({
  poolSize,
  pickSize,
  selectedNumbers,
  onChange,
}) => {
  const toggleNumber = (n: number) => {
    if (selectedNumbers.includes(n)) {
      onChange(selectedNumbers.filter((x) => x !== n).sort((a, b) => a - b));
    } else {
      if (selectedNumbers.length < pickSize) {
        onChange([...selectedNumbers, n].sort((a, b) => a - b));
      }
    }
  };

  const handleQuickPick = () => {
    const pool = Array.from({ length: poolSize }, (_, i) => i + 1);
    const picked: number[] = [];
    for (let i = 0; i < pickSize; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    onChange(picked.sort((a, b) => a - b));
  };

  const presets = [
    { label: 'Classic Draw', numbers: [3, 7, 12, 18, 22, 26].filter((n) => n <= poolSize).slice(0, pickSize) },
    { label: 'Low Range', numbers: Array.from({ length: pickSize }, (_, i) => i + 1) },
    { label: 'High Range', numbers: Array.from({ length: pickSize }, (_, i) => poolSize - pickSize + i + 1) },
    { label: 'Even Spread', numbers: Array.from({ length: pickSize }, (_, i) => Math.floor((poolSize / pickSize) * i) + 1) },
  ];

  return (
    <div className="bg-[#161b22] border border-neutral-800 rounded-xl p-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white">Winning Numbers Selection</h2>
            <span
              className={`text-xs font-mono font-medium px-2 py-0.5 rounded ${
                selectedNumbers.length === pickSize
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
              }`}
            >
              {selectedNumbers.length}/{pickSize} Selected
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Pick exactly {pickSize} numbers (1 to {poolSize}) to test match coverage across your tickets.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleQuickPick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg text-xs font-medium transition-colors border border-neutral-700"
          >
            <Dices className="w-3.5 h-3.5 text-emerald-400" />
            <span>Random Draw</span>
          </button>
          <button
            onClick={() => onChange([])}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 rounded-lg text-xs font-medium transition-colors border border-neutral-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Number Buttons Grid 1 to poolSize */}
      <div className="mt-4">
        <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 lg:grid-cols-14 gap-2">
          {Array.from({ length: poolSize }, (_, i) => i + 1).map((n) => {
            const isSelected = selectedNumbers.includes(n);
            return (
              <button
                key={n}
                onClick={() => toggleNumber(n)}
                className={`h-10 rounded-lg font-mono text-sm font-bold transition-all flex items-center justify-center ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 scale-105 border border-emerald-400'
                    : 'bg-[#21262d] hover:bg-neutral-700 text-neutral-300 border border-neutral-700/80 hover:border-neutral-500'
                }`}
              >
                {String(n).padStart(2, '0')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Numbers Summary & Presets */}
      <div className="mt-4 pt-4 border-t border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-neutral-400 font-medium">Selected Draw:</span>
          {selectedNumbers.length === 0 ? (
            <span className="text-xs text-neutral-500 italic">No numbers selected yet</span>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedNumbers.map((n) => (
                <span
                  key={n}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono text-xs font-bold"
                >
                  {String(n).padStart(2, '0')}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Sparkles className="w-3 h-3 text-neutral-500 shrink-0" />
          <span className="text-[11px] text-neutral-500 mr-1">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => onChange(p.numbers)}
              className="text-[11px] px-2 py-0.5 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors border border-neutral-700/60"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
