import React, { useState } from 'react';
import { Settings2, ShieldCheck, Layers, Award, Sliders, Check } from 'lucide-react';
import { GameConfig } from '../types';

interface DynamicConfigBarProps {
  config: GameConfig;
  onChangeConfig: (config: GameConfig) => void;
  schonheimBound: number;
  totalCombinations: number;
  totalWheelSize: number;
}

interface PresetOption {
  id: string;
  name: string;
  poolSize: number;
  pickSize: number;
  drawnNumbers: number;
  guarantee: number;
}

const PRESET_OPTIONS: PresetOption[] = [
  { id: '6-27', name: '🎯 6/27 Standard (1–27, Pick 6)', poolSize: 27, pickSize: 6, drawnNumbers: 6, guarantee: 5 },
  { id: '6-20', name: '🎱 6/20 Quick System (1–20, Pick 6)', poolSize: 20, pickSize: 6, drawnNumbers: 6, guarantee: 5 },
  { id: '6-30', name: '🎲 6/30 System (1–30, Pick 6)', poolSize: 30, pickSize: 6, drawnNumbers: 6, guarantee: 5 },
  { id: '6-36', name: '💎 6/36 Expanded (1–36, Pick 6)', poolSize: 36, pickSize: 6, drawnNumbers: 6, guarantee: 5 },
  { id: '6-42', name: '🔥 6/42 National (1–42, Pick 6)', poolSize: 42, pickSize: 6, drawnNumbers: 6, guarantee: 5 },
  { id: '6-45', name: '⭐ 6/45 Mega (1–45, Pick 6)', poolSize: 45, pickSize: 6, drawnNumbers: 6, guarantee: 5 },
  { id: '6-49', name: '🏆 6/49 Classic (1–49, Pick 6)', poolSize: 49, pickSize: 6, drawnNumbers: 6, guarantee: 5 },
  { id: '5-35', name: '⚡ 5/35 Fantasy (1–35, Pick 5)', poolSize: 35, pickSize: 5, drawnNumbers: 5, guarantee: 4 },
];

export const DynamicConfigBar: React.FC<DynamicConfigBarProps> = ({
  config,
  onChangeConfig,
  schonheimBound,
  totalCombinations,
  totalWheelSize,
}) => {
  // Check if current config matches any preset or is custom
  const matchedPreset = PRESET_OPTIONS.find(
    (p) => p.poolSize === config.poolSize && p.pickSize === config.pickSize
  );

  const [isCustomMode, setIsCustomMode] = useState<boolean>(!matchedPreset);
  const [customPool, setCustomPool] = useState<number>(config.poolSize || 25);
  const [customPick, setCustomPick] = useState<number>(config.pickSize || 5);

  const handlePresetSelect = (presetId: string) => {
    if (presetId === 'custom') {
      setIsCustomMode(true);
      onChangeConfig({
        poolSize: customPool,
        pickSize: customPick,
        drawnNumbers: customPick,
        guarantee: Math.max(2, customPick - 1),
      });
      return;
    }

    const preset = PRESET_OPTIONS.find((p) => p.id === presetId);
    if (preset) {
      setIsCustomMode(false);
      onChangeConfig({
        poolSize: preset.poolSize,
        pickSize: preset.pickSize,
        drawnNumbers: preset.drawnNumbers,
        guarantee: preset.guarantee,
      });
    }
  };

  const handleApplyCustom = (newPool: number, newPick: number) => {
    const validPool = Math.max(10, Math.min(60, newPool));
    const validPick = Math.max(3, Math.min(validPool - 1, newPick));
    setCustomPool(validPool);
    setCustomPick(validPick);
    onChangeConfig({
      poolSize: validPool,
      pickSize: validPick,
      drawnNumbers: validPick,
      guarantee: Math.max(2, validPick - 1),
    });
  };

  return (
    <div className="bg-[#121824] border border-neutral-800/90 rounded-2xl p-4 sm:p-5 mb-6 shadow-xl">
      <div className="flex flex-col gap-4">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-600/50 flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/20">
              <Settings2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Multi-Game Coverage Engine
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {config.pickSize}/{config.poolSize} Active
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                যেকোনো লটারি গেম সিলেক্ট করুন অথবা নিজের মতো রেঞ্জ (যেমন ১–২৫, পিক ৫) সেট করে কভারেজ তৈরি করুন
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-[#0a0e17] p-1 rounded-xl border border-neutral-800 self-start sm:self-auto">
            <button
              onClick={() => {
                setIsCustomMode(false);
                if (matchedPreset) {
                  handlePresetSelect(matchedPreset.id);
                } else {
                  handlePresetSelect('6-27');
                }
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                !isCustomMode
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/50'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Presets
            </button>
            <button
              onClick={() => {
                setIsCustomMode(true);
                handleApplyCustom(customPool, customPick);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                isCustomMode
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/50'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sliders className="w-3 h-3" />
              Custom (যেমন: 1–25, Pick 5)
            </button>
          </div>
        </div>

        {/* Configuration Controls */}
        {!isCustomMode ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1 font-mono">
                Select Lottery Game
              </label>
              <select
                value={matchedPreset?.id || 'custom'}
                onChange={(e) => handlePresetSelect(e.target.value)}
                className="w-full bg-[#0a0e17] border border-neutral-700/80 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {PRESET_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0a0e17] text-white">
                    {p.name}
                  </option>
                ))}
                <option value="custom" className="bg-[#0a0e17] text-emerald-400">
                  ⚙️ Custom Pool & Pick (কাস্টম সেট করুন)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1 font-mono">
                Numbers Per Ticket (k)
              </label>
              <div className="w-full bg-[#0a0e17] border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-emerald-400">
                {config.pickSize} Numbers
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1 font-mono">
                Target Guarantee (t)
              </label>
              <select
                value={config.guarantee}
                onChange={(e) => {
                  onChangeConfig({
                    ...config,
                    guarantee: Number(e.target.value),
                  });
                }}
                className="w-full bg-[#0a0e17] border border-neutral-700/80 rounded-xl px-3 py-2.5 text-xs font-semibold text-white font-mono focus:outline-none focus:border-emerald-500"
              >
                <option value={config.pickSize - 1} className="bg-[#0a0e17]">
                  {config.pickSize - 1}-if-{config.pickSize} (Major Prize Guarantee)
                </option>
                <option value={Math.max(2, config.pickSize - 2)} className="bg-[#0a0e17]">
                  {Math.max(2, config.pickSize - 2)}-if-{config.pickSize} (High Win Budget)
                </option>
              </select>
            </div>
          </div>
        ) : (
          /* Custom Pool & Pick Mode: e.g. 1 to 25, Pick 5 */
          <div className="bg-[#0a0e17] border border-emerald-900/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">
                Custom Ticket Coverage Setup (কাস্টম কভারেজ তৈরি করুন)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1 font-mono">
                  Pool Universe (যেমন ১ থেকে ২৫):
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-400 font-mono">1 to</span>
                  <input
                    type="number"
                    min={10}
                    max={60}
                    value={customPool}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setCustomPool(val);
                      handleApplyCustom(val, customPick);
                    }}
                    className="w-full bg-[#141b26] border border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                    placeholder="25"
                  />
                  <span className="text-xs text-neutral-400 font-mono">balls</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1 font-mono">
                  Pick Size (প্রতি টিকিটে সংখ্যা):
                </label>
                <select
                  value={customPick}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCustomPick(val);
                    handleApplyCustom(customPool, val);
                  }}
                  className="w-full bg-[#141b26] border border-neutral-700 rounded-lg px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value={5} className="bg-[#141b26]">Pick 5 Numbers (e.g. 5/25)</option>
                  <option value={6} className="bg-[#141b26]">Pick 6 Numbers (e.g. 6/25)</option>
                  <option value={4} className="bg-[#141b26]">Pick 4 Numbers</option>
                  <option value={7} className="bg-[#141b26]">Pick 7 Numbers</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1 font-mono">
                  Guaranteed Match Tier:
                </label>
                <div className="w-full bg-[#141b26] border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono font-bold text-emerald-400 flex items-center justify-between">
                  <span>{customPick - 1}-if-{customPick} Guaranteed</span>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Quick Presets Buttons inside Custom */}
            <div className="mt-3 pt-3 border-t border-neutral-800/80 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-neutral-400 font-mono">Quick Examples:</span>
              <button
                type="button"
                onClick={() => handleApplyCustom(25, 5)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-all ${
                  customPool === 25 && customPick === 5
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-[#141b26] text-neutral-300 border border-neutral-700 hover:border-emerald-500'
                }`}
              >
                1 to 25 (Pick 5)
              </button>
              <button
                type="button"
                onClick={() => handleApplyCustom(20, 6)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-all ${
                  customPool === 20 && customPick === 6
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-[#141b26] text-neutral-300 border border-neutral-700 hover:border-emerald-500'
                }`}
              >
                1 to 20 (Pick 6)
              </button>
              <button
                type="button"
                onClick={() => handleApplyCustom(30, 6)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-all ${
                  customPool === 30 && customPick === 6
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-[#141b26] text-neutral-300 border border-neutral-700 hover:border-emerald-500'
                }`}
              >
                1 to 30 (Pick 6)
              </button>
              <button
                type="button"
                onClick={() => handleApplyCustom(35, 5)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-all ${
                  customPool === 35 && customPick === 5
                    ? 'bg-emerald-500 text-black font-bold'
                    : 'bg-[#141b26] text-neutral-300 border border-neutral-700 hover:border-emerald-500'
                }`}
              >
                1 to 35 (Pick 5)
              </button>
            </div>
          </div>
        )}

        {/* Live Mathematical Verification Strip */}
        <div className="pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-neutral-300">
              Total Draws: <strong className="text-white">{totalCombinations.toLocaleString()}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-neutral-300">
              Schönheim Bound: <strong className="text-blue-300">{schonheimBound.toLocaleString()}</strong> tickets
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-neutral-300">
              Coverage Design: <strong className="text-amber-300">{totalWheelSize.toLocaleString()}</strong> tickets (
              <span className="text-emerald-400 font-semibold">
                {((schonheimBound / Math.max(1, totalWheelSize)) * 100).toFixed(1)}% Packing
              </span>
              )
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
