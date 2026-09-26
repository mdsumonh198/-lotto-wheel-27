import React, { useState } from 'react';
import {
  AlertTriangle,
  TrendingDown,
  ShieldAlert,
  HelpCircle,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Percent,
  Coins,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react';

interface WorstCasePanelProps {
  totalTickets?: number;
  poolSize?: number;
  pickSize?: number;
  lang?: 'bn' | 'en';
  onSimulateScenario?: (scenario: 'pool_worst' | 'out_of_pool') => void;
}

export const WorstCasePanel: React.FC<WorstCasePanelProps> = ({
  totalTickets = 2335,
  poolSize = 27,
  pickSize = 6,
  lang = 'bn',
  onSimulateScenario,
}) => {
  const isBn = lang === 'bn';

  // Customizable Financial inputs for stress testing
  const [ticketPrice, setTicketPrice] = useState<number>(100); // ৳ or $
  const [prize5Match, setPrize5Match] = useState<number>(20000); // 5-match prize
  const [prize4Match, setPrize4Match] = useState<number>(1000); // 4-match prize
  const [prize3Match, setPrize3Match] = useState<number>(200); // 3-match prize
  const [currencySymbol, setCurrencySymbol] = useState<string>('৳');

  // Calculations for Scenario A: 6 numbers in Pool, but NO Jackpot (Hits exact 1x 5-match)
  const totalCost = totalTickets * ticketPrice;
  const scenA_5Matches = 1;
  const scenA_4Matches = 18;
  const scenA_3Matches = 224;
  const scenA_Recovery =
    scenA_5Matches * prize5Match + scenA_4Matches * prize4Match + scenA_3Matches * prize3Match;
  const scenA_NetDeficit = scenA_Recovery - totalCost;
  const scenA_LossPercent = ((scenA_NetDeficit / totalCost) * 100).toFixed(1);

  // Calculations for Scenario B: 1 number Out of Pool (e.g. drawn from > 27)
  const scenB_6Matches = 0;
  const scenB_5Matches = 0; // Drops to 0!
  const scenB_4Matches = 3;
  const scenB_3Matches = 28;
  const scenB_Recovery =
    scenB_5Matches * prize5Match + scenB_4Matches * prize4Match + scenB_3Matches * prize3Match;
  const scenB_NetDeficit = scenB_Recovery - totalCost;
  const scenB_LossPercent = ((scenB_NetDeficit / totalCost) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      <div className="bg-gradient-to-r from-rose-950/70 via-red-900/40 to-amber-950/60 border-2 border-rose-500/80 rounded-2xl p-5 shadow-2xl shadow-rose-950/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7 text-rose-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-500 text-black uppercase tracking-wider">
                  {isBn ? 'জরুরি ঝুঁকি মূল্যায়ন' : 'CRITICAL RISK ASSESSMENT'}
                </span>
                <span className="text-xs font-mono text-rose-300">
                  {isBn ? `${totalTickets.toLocaleString()} টিকিট স্ট্রেস-টেস্ট` : `${totalTickets.toLocaleString()} Tickets Stress-Test`}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                {isBn
                  ? 'সবচেয়ে খারাপ পরিস্থিতিতে (Worst-Case) কী হতে পারে?'
                  : 'What is the Absolute Worst-Case Financial Scenario?'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <div className="px-3 py-1.5 rounded-lg bg-black/50 border border-rose-500/30 text-rose-300 font-mono text-xs text-right">
              <div className="text-[10px] text-neutral-400 uppercase font-sans">
                {isBn ? 'ইনভেস্টমেন্ট রিস্ক' : 'Investment Risk'}
              </div>
              <span className="font-extrabold text-rose-400">EXTREME (চরম ঝুঁকি)</span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">
          {isBn
            ? `ক্লায়েন্ট যদি লাখ লাখ টাকা দিয়ে এই ${totalTickets.toLocaleString()}টি টিকিট কেনার কথা ভাবেন, তবে তাকে এই ২টি খারাপ পরিস্থিতি অবশ্যই স্পষ্টভাবে দেখাতে হবে। লটারিতে কোনো গ্যারান্টিড প্রফিট নেই—এমনকি ৫-ম্যাচ জিতলেও বড় অঙ্কের লোকসান নিশ্চিত হতে পারে!`
            : `If the client is considering spending large sums to buy these ${totalTickets.toLocaleString()} tickets, they must understand these 2 adverse scenarios. In lotteries, even when hitting a 5-match, a massive net financial loss is virtually guaranteed without the jackpot.`}
        </p>
      </div>

      {/* Two Critical Scenarios Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Scenario A: Pool Match but NO Jackpot */}
        <div className="bg-[#141922] border-2 border-amber-500/60 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {isBn ? 'সিনারিও ১: পুলে ড্র হওয়া সত্ত্বেও ক্ষতি' : 'Scenario 1: Pool Hit, But No Jackpot'}
              </span>
              <span className="text-xs text-amber-400 font-bold font-mono">
                {isBn ? 'সম্ভাবনা: ৯৯.২%' : 'Probability: ~99.2%'}
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-2">
              {isBn
                ? 'ড্র ১–২৭ এর ভেতর হয়েছে, কিন্তু জ্যাকপট (৬/৬) আসেনি'
                : 'All 6 drawn balls are in 1–27, but 6/6 Jackpot missed'}
            </h3>

            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              {isBn
                ? `হুইলের গাণিতিক প্রমিজ অনুযায়ী অন্তত ১টি টিকিটে ৫-ম্যাচ নিশ্চিত লেগেছে। কিন্তু ৬/৬ জ্যাকপটের সম্ভাবনা ২৩৩৫ টিকিটের ক্ষেত্রেও মাত্র ০.৭৮%। ফলে জ্যাকপট না পাওয়াটাই সবচেয়ে স্বাভাবিক বাস্তব অবস্থা।`
                : `The wheel mathematically delivers ≥1 5-match. However, the 6/6 jackpot odds are only 0.78%, meaning 99.22% of the time you only get the 5-match prize.`}
            </p>

            {/* Financial Breakdown Card */}
            <div className="bg-black/40 border border-neutral-800 rounded-xl p-3.5 space-y-2 font-mono text-xs mb-4">
              <div className="flex justify-between text-neutral-300">
                <span>{isBn ? `টিকিট ক্রয় খরচ (${totalTickets} × ${currencySymbol}${ticketPrice}):` : `Ticket Purchase Cost:`}</span>
                <span className="font-bold text-white">{currencySymbol}{totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>{isBn ? `৫-ম্যাচ জয় (১টি):` : `5-Match Win (1x):`}</span>
                <span className="font-bold">+{currencySymbol}{prize5Match.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-cyan-400">
                <span>{isBn ? `৪-ম্যাচ জয় (~১৮টি):` : `4-Match Wins (~18x):`}</span>
                <span className="font-bold">+{currencySymbol}{(scenA_4Matches * prize4Match).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>{isBn ? `৩-ম্যাচ জয় (~২২৪টি):` : `3-Match Wins (~224x):`}</span>
                <span className="font-bold">+{currencySymbol}{(scenA_3Matches * prize3Match).toLocaleString()}</span>
              </div>
              <div className="border-t border-neutral-700 pt-2 flex justify-between text-neutral-300">
                <span>{isBn ? 'মোট প্রাইজ রিকভারি:' : 'Total Prize Recovery:'}</span>
                <span className="font-bold text-white">{currencySymbol}{scenA_Recovery.toLocaleString()}</span>
              </div>
              <div className="border-t-2 border-rose-500/50 pt-2 flex justify-between items-center text-sm font-bold">
                <span className="text-rose-400">{isBn ? 'নিট লোকসান (Net Loss):' : 'Net Loss (Deficit):'}</span>
                <span className="text-rose-400 text-base">
                  -{currencySymbol}{Math.abs(scenA_NetDeficit).toLocaleString()}{' '}
                  <span className="text-xs">({scenA_LossPercent}%)</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-800/40 rounded-lg p-2.5 text-[11px] text-amber-200">
            <strong>{isBn ? 'সারসংক্ষেপ:' : 'Takeaway:'}</strong>{' '}
            {isBn
              ? `হুইলের ১০০% কভারেজ গ্যারান্টি পূরণ হলেও ক্লায়েন্টের অর্ধেকেরও বেশি মূলধন (-${Math.abs(Number(scenA_LossPercent))}%) সরাসরি জলে যাবে!`
              : `Even though the wheel works 100% mathematically, the investor still loses ${Math.abs(Number(scenA_LossPercent))}% of their cash without a jackpot.`}
          </div>
        </div>

        {/* Scenario B: Out-of-Pool Disaster */}
        <div className="bg-[#141922] border-2 border-rose-500/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {isBn ? 'সিনারিও ২: চরম বিপর্যয় (আউট অফ পুল)' : 'Scenario 2: Absolute Catastrophe (Out of Pool)'}
              </span>
              <span className="text-xs text-rose-400 font-bold font-mono">
                {isBn ? 'উচ্চ সম্ভাবনা (৮৫%–৯৮%)' : 'High Chance (85%–98%)'}
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-2">
              {isBn
                ? 'ড্র-এর মাত্র ১টি সংখ্যা ১–২৭ এর বাইরে চলে গেছে'
                : 'Even 1 single winning number falls outside 1–27'}
            </h3>

            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              {isBn
                ? `লটারিতে যদি ২৭টির বেশি বল থাকে (যেমন ৬/৪৯, ৬/৪২ বা ৬/৩৬), তবে অধিকাংশ ড্র-তেই ১ বা একাধিক সংখ্যা আপনার পুলে থাকবে না। ১টি সংখ্যা পুলে না থাকলে ৫-ম্যাচ হিট সংখ্যা শূন্যে (০) নেমে যাবে!`
                : `In games with >27 balls (e.g. 6/49, 6/42), 85%–98% of draws will contain numbers outside your 27 pool. Missing just 1 number drops 5-match hits to ZERO.`}
            </p>

            {/* Financial Breakdown Card */}
            <div className="bg-black/40 border border-neutral-800 rounded-xl p-3.5 space-y-2 font-mono text-xs mb-4">
              <div className="flex justify-between text-neutral-300">
                <span>{isBn ? `টিকিট ক্রয় খরচ (${totalTickets} × ${currencySymbol}${ticketPrice}):` : `Ticket Purchase Cost:`}</span>
                <span className="font-bold text-white">{currencySymbol}{totalCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-500 line-through">
                <span>{isBn ? '৬/৬ জ্যাকপট:' : '6/6 Jackpot:'}</span>
                <span>০ টি (০%)</span>
              </div>
              <div className="flex justify-between text-rose-400 font-bold">
                <span>{isBn ? '৫-ম্যাচ জয়:' : '5-Match Wins:'}</span>
                <span>০ টি (সম্পূর্ণ বাতিল!)</span>
              </div>
              <div className="flex justify-between text-cyan-400">
                <span>{isBn ? '৪-ম্যাচ জয় (মাত্র ~৩টি):' : '4-Match Wins (~3x):'}</span>
                <span className="font-bold">+{currencySymbol}{(scenB_4Matches * prize4Match).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-amber-400">
                <span>{isBn ? '৩-ম্যাচ জয় (মাত্র ~২৮টি):' : '3-Match Wins (~28x):'}</span>
                <span className="font-bold">+{currencySymbol}{(scenB_3Matches * prize3Match).toLocaleString()}</span>
              </div>
              <div className="border-t border-neutral-700 pt-2 flex justify-between text-neutral-300">
                <span>{isBn ? 'মোট প্রাইজ রিকভারি:' : 'Total Prize Recovery:'}</span>
                <span className="font-bold text-white">{currencySymbol}{scenB_Recovery.toLocaleString()}</span>
              </div>
              <div className="border-t-2 border-rose-500/80 pt-2 flex justify-between items-center text-sm font-bold">
                <span className="text-rose-400">{isBn ? 'নিট লোকসান (Net Loss):' : 'Net Loss (Deficit):'}</span>
                <span className="text-rose-400 text-base">
                  -{currencySymbol}{Math.abs(scenB_NetDeficit).toLocaleString()}{' '}
                  <span className="text-xs">({scenB_LossPercent}%)</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-rose-950/40 border border-rose-800/60 rounded-lg p-2.5 text-[11px] text-rose-200">
            <strong>{isBn ? 'সারসংক্ষেপ:' : 'Takeaway:'}</strong>{' '}
            {isBn
              ? `পুঁজির প্রায় ৯৫% থেকে ১০০% সম্পূর্ণ বিনাশ হবে। ক্লায়েন্টের লক্ষ লক্ষ টাকা এক নিমিষেই হারিয়ে যাবে!`
              : `Over 95%–100% of invested capital is completely wiped out instantly.`}
          </div>
        </div>
      </div>

      {/* Interactive Financial Calculator */}
      <div className="bg-[#141922] border border-neutral-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              {isBn
                ? 'ইন্টারেক্টিভ আর্থিক ক্ষতি ক্যালকুলেটর (ক্লায়েন্টের লটারির মূল্য বসিয়ে দেখুন)'
                : 'Interactive Financial Stress-Test Calculator'}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400">{isBn ? 'মুদ্রা:' : 'Currency:'}</span>
            {['৳', '$', '€', '₹'].map((sym) => (
              <button
                key={sym}
                onClick={() => setCurrencySymbol(sym)}
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold cursor-pointer transition-colors ${
                  currencySymbol === sym
                    ? 'bg-amber-500 text-black'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {sym}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-black/30 border border-neutral-800 rounded-xl p-3">
            <label className="text-[11px] text-neutral-400 block mb-1">
              {isBn ? 'প্রতি টিকিটের মূল্য' : 'Ticket Price'} ({currencySymbol})
            </label>
            <input
              type="number"
              min={1}
              value={ticketPrice}
              onChange={(e) => setTicketPrice(Math.max(1, Number(e.target.value) || 0))}
              className="w-full bg-[#1c2333] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono font-bold focus:border-amber-400 outline-none"
            />
          </div>

          <div className="bg-black/30 border border-neutral-800 rounded-xl p-3">
            <label className="text-[11px] text-neutral-400 block mb-1">
              {isBn ? '৫-ম্যাচ প্রাইজ' : '5-Match Prize'} ({currencySymbol})
            </label>
            <input
              type="number"
              min={0}
              value={prize5Match}
              onChange={(e) => setPrize5Match(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-[#1c2333] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300 font-mono font-bold focus:border-emerald-400 outline-none"
            />
          </div>

          <div className="bg-black/30 border border-neutral-800 rounded-xl p-3">
            <label className="text-[11px] text-neutral-400 block mb-1">
              {isBn ? '৪-ম্যাচ প্রাইজ' : '4-Match Prize'} ({currencySymbol})
            </label>
            <input
              type="number"
              min={0}
              value={prize4Match}
              onChange={(e) => setPrize4Match(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-[#1c2333] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-cyan-300 font-mono font-bold focus:border-cyan-400 outline-none"
            />
          </div>

          <div className="bg-black/30 border border-neutral-800 rounded-xl p-3">
            <label className="text-[11px] text-neutral-400 block mb-1">
              {isBn ? '৩-ম্যাচ প্রাইজ' : '3-Match Prize'} ({currencySymbol})
            </label>
            <input
              type="number"
              min={0}
              value={prize3Match}
              onChange={(e) => setPrize3Match(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-[#1c2333] border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono font-bold focus:border-amber-400 outline-none"
            />
          </div>
        </div>

        {/* Live Calculation Bar */}
        <div className="bg-gradient-to-r from-neutral-900 to-black border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-6 h-6 text-rose-400 shrink-0" />
            <div>
              <div className="text-xs text-neutral-400">
                {isBn ? `২৩৩৫টি টিকিটের মোট ইনভেস্টমেন্ট খরচ:` : `Total 2,335 Ticket Investment:`}
              </div>
              <div className="text-lg font-extrabold text-white font-mono">
                {currencySymbol}{totalCost.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs">
            <div className="text-right">
              <div className="text-[11px] text-neutral-400">{isBn ? 'সিনারিও ১ নিট রিটার্ন:' : 'Scenario 1 Net:'}</div>
              <div className="text-sm font-bold text-rose-400">
                -{currencySymbol}{Math.abs(scenA_NetDeficit).toLocaleString()} ({scenA_LossPercent}%)
              </div>
            </div>
            <div className="text-right border-l border-neutral-800 pl-6">
              <div className="text-[11px] text-neutral-400">{isBn ? 'সিনারিও ২ নিট রিটার্ন:' : 'Scenario 2 Net:'}</div>
              <div className="text-sm font-bold text-rose-500">
                -{currencySymbol}{Math.abs(scenB_NetDeficit).toLocaleString()} ({scenB_LossPercent}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Golden Advisory Rules for Investor Protection */}
      <div className="bg-[#141922] border border-neutral-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          {isBn
            ? 'ক্লায়েন্টের আস্থা ও পুঁজি রক্ষার ৩টি সোনালী নিয়ম (Advisory Rules)'
            : '3 Non-Negotiable Rules to Protect the Investor'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-black/30 border border-neutral-800/80 rounded-xl p-3.5 space-y-1.5">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <span>১. পেপার টেস্ট করুন (Paper Test)</span>
            </div>
            <p className="text-neutral-300 leading-relaxed text-[11px]">
              {isBn
                ? 'বাস্তব লাখ লাখ টাকা লাগানোর আগে এই ২৩৩৫ টিকিটের তালিকা ডাউনলোড করে রেখে দিন। আগামী ৩টি অফিসিয়াল ড্র-র সাথে মিলিয়ে প্রমাণ দেখুন কয় টাকা লাভ হতো আর কয় টাকা লস হতো।'
                : 'Before risking real money, download the 2,335 ticket CSV and test against the next 3 official draws without spending cash.'}
            </p>
          </div>

          <div className="bg-black/30 border border-neutral-800/80 rounded-xl p-3.5 space-y-1.5">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>২. সততা ও স্বচ্ছতা (Zero False Hope)</span>
            </div>
            <p className="text-neutral-300 leading-relaxed text-[11px]">
              {isBn
                ? 'ক্লায়েন্টকে স্পষ্টভাবে বলুন: এটি একটি গাণিতিক কম্বিনেটোরিয়াল টুল, এটি কোনো মানি প্রিন্টিং মেশিন নয়। লটারির মূল অংকে জ্যাকপট ছাড়া লাভ করা অসম্ভব।'
                : 'Be 100% upfront: wheeling is a mathematical filtering tool, not an investment. Without the jackpot, lottery mathematically loses money.'}
            </p>
          </div>

          <div className="bg-black/30 border border-neutral-800/80 rounded-xl p-3.5 space-y-1.5">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <span>৩. ক্ষুদ্র বাজেট স্টপ ব্যবহার (Budget Stops)</span>
            </div>
            <p className="text-neutral-300 leading-relaxed text-[11px]">
              {isBn
                ? 'যদি ক্লায়েন্ট নিতান্তই খেলতে চান, তবে সম্পূর্ণ ২৩৩৫ টিকিটের ঝুঁকি না নিয়ে স্মার্ট বাজেট স্টপ (যেমন ১৪ বা ১৩৫ টিকিট) নিয়ে ছোট আকারে ঝুঁকি পরীক্ষা করা উচিত।'
                : 'If playing, advise using smaller smart stops (e.g. 14 or 135 tickets) rather than risking life savings on 2,335 tickets.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
