import React from 'react';
import { Settings2, ShieldCheck, Layers, Award } from 'lucide-react';
import { GameConfig } from '../types';

interface DynamicConfigBarProps {
  config: GameConfig;
  onChangeConfig: (config: GameConfig) => void;
  schonheimBound: number;
  totalCombinations: number;
  totalWheelSize: number;
}

export const DynamicConfigBar: React.FC<DynamicConfigBarProps> = ({
  config,
  onChangeConfig,
  schonheimBound,
  totalCombinations,
  totalWheelSize,
}) => {
  return (
    <div className="bg-[#161b22] border border-neutral-800 rounded-xl p-4 sm:p-5 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Label */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center shrink-0">
            <Settings2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Dynamic Game Configuration</h2>
            <p className="text-xs text-neutral-400">
              Universal combinatorial wheel for any lottery universe ($v$) and guarantee ($t$-if-$m$).
            </p>
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1 lg:max-w-2xl">
          {/* Total Number Pool (v) */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 font-mono">
              Pool Universe (v)
            </label>
            <select
              value={config.poolSize}
              onChange={(e) => {
                const newPool = Number(e.target.value);
                onChangeConfig({
                  ...config,
                  poolSize: newPool,
                  pickSize: newPool < 27 && config.pickSize > 6 ? 5 : config.pickSize,
                });
              }}
              className="w-full bg-[#0d1117] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
            >
              <option value={20}>20 Numbers (6/20 Quick System)</option>
              <option value={24}>24 Numbers (6/24 System)</option>
              <option value={27}>27 Numbers (6/27 Standard)</option>
              <option value={30}>30 Numbers (6/30 Half-Pool)</option>
              <option value={36}>36 Numbers (6/36 Expanded)</option>
              <option value={42}>42 Numbers (6/42 National)</option>
              <option value={45}>45 Numbers (6/45 Mega)</option>
              <option value={49}>49 Numbers (6/49 Classic)</option>
            </select>
          </div>

          {/* Pick Size (k) */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 font-mono">
              Pick Size (k)
            </label>
            <select
              value={config.pickSize}
              onChange={(e) => {
                onChangeConfig({
                  ...config,
                  pickSize: Number(e.target.value),
                });
              }}
              className="w-full bg-[#0d1117] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
            >
              <option value={6}>6 Numbers per Ticket</option>
              <option value={5}>5 Numbers per Ticket</option>
            </select>
          </div>

          {/* Target Guarantee (t) */}
          <div>
            <label className="block text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-1 font-mono">
              Target Guarantee (t-if-6)
            </label>
            <select
              value={config.guarantee}
              onChange={(e) => {
                onChangeConfig({
                  ...config,
                  guarantee: Number(e.target.value),
                });
              }}
              className="w-full bg-[#0d1117] border border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-200 font-mono focus:outline-none focus:border-emerald-500"
            >
              <option value={5}>5-if-6 (Guaranteed 5-Match)</option>
              <option value={4}>4-if-6 (Guaranteed 4-Match)</option>
              <option value={3}>3-if-6 (Budget Guarantee)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Information Banner */}
      <div className="mt-3.5 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-neutral-400">
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
            Current Wheel: <strong className="text-amber-300">{totalWheelSize.toLocaleString()}</strong> tickets (
            <span className="text-emerald-400 font-semibold">
              {((schonheimBound / totalWheelSize) * 100).toFixed(1)}% Packing
            </span>
            )
          </span>
        </div>
      </div>
    </div>
  );
};
