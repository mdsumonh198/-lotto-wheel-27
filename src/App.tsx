import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { DynamicConfigBar } from './components/DynamicConfigBar';
import { SmartBudgetPanel } from './components/SmartBudgetPanel';
import { NumberSelector } from './components/NumberSelector';
import { MetricCards } from './components/MetricCards';
import { DetailTable } from './components/DetailTable';
import { TicketGeneratorPanel } from './components/TicketGeneratorPanel';
import { OperationsResearchPanel } from './components/OperationsResearchPanel';
import { PythonSourcePanel } from './components/PythonSourcePanel';
import { ColabScriptPanel } from './components/ColabScriptPanel';
import {
  generateWheel,
  evaluateWheel,
  exportWheelToCSV,
  DEFAULT_POOL_SIZE,
  DEFAULT_TICKET_SIZE,
  DEFAULT_GUARANTEE,
  DRAWN_COUNT,
} from './wheelEngine';
import { GameConfig } from './types';
import { BarChart3, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'generator' | 'or-theory' | 'python-source' | 'colab-mip'>('dashboard');

  // Feature 1: Dynamic Game Configuration
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    poolSize: DEFAULT_POOL_SIZE, // v: 27
    pickSize: DEFAULT_TICKET_SIZE, // k: 6
    guarantee: DEFAULT_GUARANTEE, // t: 5
    drawnNumbers: DRAWN_COUNT, // m: 6
  });

  // Winning Numbers selection
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([3, 7, 12, 18, 22, 26]);

  // Generate priority-ranked wheel whenever gameConfig changes
  const { tickets, theoreticalBound, totalDraws } = useMemo(() => {
    return generateWheel(gameConfig);
  }, [gameConfig]);

  // Feature 2: Smart Budget (Top N Priority Tickets)
  const [budgetCount, setBudgetCount] = useState<number>(250);

  // Sync budgetCount bounds when wheel size changes
  const activeBudget = Math.min(budgetCount, tickets.length);

  // Evaluate matches
  const { evaluations, fullMatchCounts, budgetMatchCounts } = useMemo(() => {
    if (selectedNumbers.length !== gameConfig.drawnNumbers) {
      return {
        evaluations: [],
        fullMatchCounts: { 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 },
        budgetMatchCounts: { 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 },
      };
    }
    return evaluateWheel(tickets, selectedNumbers, activeBudget, gameConfig.guarantee);
  }, [tickets, selectedNumbers, activeBudget, gameConfig.guarantee, gameConfig.drawnNumbers]);

  // Export Full Wheel
  const handleExportFullWheel = () => {
    const csv = exportWheelToCSV(tickets);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `lottery_wheel_${gameConfig.pickSize}_${gameConfig.poolSize}_full_${tickets.length}_tickets.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Top N Budget Tickets
  const handleExportBudgetTickets = () => {
    const budgetTickets = tickets.slice(0, activeBudget);
    const csv = exportWheelToCSV(budgetTickets);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `lottery_wheel_${gameConfig.pickSize}_${gameConfig.poolSize}_top_${activeBudget}_budget_tickets.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 3-Zone Header Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportWheel={handleExportFullWheel}
        onExportBudget={handleExportBudgetTickets}
        budgetCount={activeBudget}
        poolSize={gameConfig.poolSize}
        pickSize={gameConfig.pickSize}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <div>
            {/* Feature 1: Dynamic Game Configuration Bar */}
            <DynamicConfigBar
              config={gameConfig}
              onChangeConfig={(newCfg) => {
                setGameConfig(newCfg);
                // Adjust winning numbers if pool shrinks
                setSelectedNumbers((prev) =>
                  prev.filter((n) => n <= newCfg.poolSize).slice(0, newCfg.drawnNumbers)
                );
              }}
              schonheimBound={theoreticalBound}
              totalCombinations={totalDraws}
              totalWheelSize={tickets.length}
            />

            {/* Feature 2: Smart Budget / Stop System Panel */}
            <SmartBudgetPanel
              budgetCount={activeBudget}
              totalTickets={tickets.length}
              onChangeBudget={(val) => setBudgetCount(val)}
              onDownloadBudget={handleExportBudgetTickets}
              guaranteedMatchesBudget={budgetMatchCounts[5]}
            />

            {/* Winning Numbers Selector */}
            <NumberSelector
              poolSize={gameConfig.poolSize}
              pickSize={gameConfig.drawnNumbers}
              selectedNumbers={selectedNumbers}
              onChange={setSelectedNumbers}
            />

            {/* Validation warning if not exact numbers selected */}
            {selectedNumbers.length !== gameConfig.drawnNumbers ? (
              <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-5 text-center text-amber-300 text-sm flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <span>
                  Please select exactly {gameConfig.drawnNumbers} numbers from 1 to {gameConfig.poolSize} to analyze match coverage. (Currently selected: {selectedNumbers.length}/{gameConfig.drawnNumbers})
                </span>
              </div>
            ) : (
              <>
                {/* Key Result Metrics Cards */}
                <MetricCards
                  budgetMatchCounts={budgetMatchCounts}
                  fullMatchCounts={fullMatchCounts}
                  budgetCount={activeBudget}
                  totalEvaluated={tickets.length}
                  schonheimBound={theoreticalBound}
                />

                {/* Distribution Summary Strip */}
                <div className="bg-[#161b22] border border-neutral-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">
                      Active Budget ({activeBudget.toLocaleString()} tickets) Match Distribution
                    </span>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-6 text-xs font-mono flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
                      <span className="text-neutral-400">5-Match:</span>
                      <span className="font-bold text-emerald-300 tabular-nums">
                        {budgetMatchCounts[5]} ({((budgetMatchCounts[5] / activeBudget) * 100).toFixed(2)}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                      <span className="text-neutral-400">4-Match:</span>
                      <span className="font-bold text-blue-300 tabular-nums">
                        {budgetMatchCounts[4]} ({((budgetMatchCounts[4] / activeBudget) * 100).toFixed(2)}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="text-neutral-400">3-Match:</span>
                      <span className="font-bold text-amber-300 tabular-nums">
                        {budgetMatchCounts[3]} ({((budgetMatchCounts[3] / activeBudget) * 100).toFixed(2)}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-neutral-600"></span>
                      <span className="text-neutral-400">2-Match:</span>
                      <span className="font-bold text-neutral-300 tabular-nums">
                        {budgetMatchCounts[2]} ({((budgetMatchCounts[2] / activeBudget) * 100).toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Priority Ranked Detail Table */}
                <DetailTable
                  evaluations={evaluations}
                  winningNumbers={selectedNumbers}
                  budgetCount={activeBudget}
                />
              </>
            )}
          </div>
        )}

        {activeTab === 'generator' && (
          <TicketGeneratorPanel
            currentPresetId={`${gameConfig.pickSize}-${gameConfig.poolSize}`}
            onSelectGame={(preset) => {
              setGameConfig({
                poolSize: preset.poolSize,
                pickSize: preset.pickSize,
                guarantee: preset.guarantee,
                drawnNumbers: preset.drawnNumbers,
              });
              setSelectedNumbers((prev) =>
                prev.filter((n) => n <= preset.poolSize).slice(0, preset.drawnNumbers)
              );
            }}
          />
        )}

        {activeTab === 'or-theory' && <OperationsResearchPanel />}

        {activeTab === 'python-source' && <PythonSourcePanel />}

        {activeTab === 'colab-mip' && <ColabScriptPanel />}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-[#0d1117] py-4 text-center text-xs text-neutral-500 font-mono">
        Lotto-Wheel Analyzer · Game {gameConfig.pickSize}/{gameConfig.poolSize} · Schönheim Bound: {theoreticalBound.toLocaleString()} · Priority Ranked Smart Budget Design
      </footer>
    </div>
  );
}
