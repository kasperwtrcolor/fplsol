import React, { useState } from 'react';
import { 
  BookOpen, 
  Cpu, 
  Shield, 
  Coins, 
  Trophy, 
  TrendingUp, 
  Lock, 
  Code2, 
  Terminal, 
  Check, 
  Copy, 
  ExternalLink, 
  ArrowRight, 
  Zap, 
  Calculator, 
  Layers,
  Sparkles
} from 'lucide-react';
import { PONS_CONFIG, FPLS_ADDRESS, FPLGAME_ADDRESS, TREASURY_ADDRESS } from '../config/contracts';

export const TechnicalDocs = ({ setCurrentView }) => {
  const [activeSection, setActiveSection] = useState('architecture');
  const [copiedCode, setCopiedCode] = useState(null);

  // Interactive Simulator State
  const [simEntries, setSimEntries] = useState(100);
  const entryFee = 100000; // 100,000 $FPLS
  const totalStaked = simEntries * entryFee;
  const totalBurned = Math.floor(totalStaked * 0.10);
  const totalPrizePool = Math.floor(totalStaked * 0.90);
  const firstPrize = Math.floor(totalPrizePool * 0.60);
  const secondPrize = Math.floor(totalPrizePool * 0.20);
  const thirdPrize = Math.floor(totalPrizePool * 0.10);
  const estimatedGmeYield = (totalPrizePool * 0.000025).toFixed(3);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections = [
    { id: 'architecture', title: 'System Architecture', icon: Cpu },
    { id: 'mechanics', title: 'Game Engine & Salary Cap', icon: Shield },
    { id: 'scoring', title: 'Scoring Algorithm & Data Sync', icon: Zap },
    { id: 'tokenomics', title: 'Deflationary Tokenomics', icon: Coins },
    { id: 'podium', title: 'Podium Pool & Oracle Proofs', icon: Trophy },
    { id: 'rwa', title: 'RWA Stock Equity & Pons Swap', icon: TrendingUp },
    { id: 'security', title: 'Authentication & Security', icon: Lock },
    { id: 'contracts', title: 'Smart Contract Interfaces', icon: Code2 },
    { id: 'api', title: 'API Endpoints Reference', icon: Terminal },
    { id: 'calculator', title: 'Protocol Simulator', icon: Calculator },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 py-4 select-text">
      
      {/* Hero Header */}
      <div className="card-modern p-6 sm:p-10 bg-gradient-to-br from-slate-900 via-[#1C2E1E] to-slate-950 text-white border-2 border-emerald-500/30 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>FPL.STOCK TECHNICAL WHITE PAPER & PROTOCOL SPECIFICATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Protocol Documentation
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Comprehensive technical architecture, cryptographic proof mechanics, deflationary smart contracts, and real-world asset (RWA) equity integration powering <strong>FPL.STOCK</strong>.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300">
              Network: Robinhood Chain (EVM)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-emerald-400">
              Entry: 100K $FPLS
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-purple-300">
              RWA Equity: GameStop ($GME)
            </span>
          </div>
        </div>
      </div>

      {/* Main Layout: Nav Strip / Sidebar + Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4 sticky top-20 z-20 space-y-2">
          <div className="card-modern p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-[#EAECE9] dark:border-slate-800 shadow-sm">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5">
              Documentation Index
            </div>
            <div className="space-y-1">
              {sections.map(sec => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSection(sec.id);
                      window.scrollTo({ top: 220, behavior: 'smooth' });
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-forest text-white shadow-xs dark:bg-emerald-600'
                        : 'text-neutral-700 dark:text-slate-300 hover:bg-[#F1F3F1] dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-500 dark:text-slate-400'}`} />
                    <span>{sec.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card-modern p-4 text-center space-y-2">
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Ready to build your team?
            </div>
            <button
              onClick={() => setCurrentView('team')}
              className="w-full btn-primary py-2 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Launch Squad Builder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Documentation Content Body */}
        <div className="lg:col-span-8 space-y-8 min-w-0">

          {/* SECTION 1: SYSTEM ARCHITECTURE */}
          {activeSection === 'architecture' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="card-modern p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#EAECE9] dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center shadow-xs">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">System Architecture</h2>
                    <p className="text-xs text-slate-500 font-mono">Full-Stack On-Chain & Off-Chain Topology</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  FPL.STOCK combines decentralized Ethereum Virtual Machine (EVM) smart contracts deployed on <strong>Robinhood Chain</strong> with a high-throughput edge data layer and cryptographically verified oracle pipelines.
                </p>

                {/* Architecture Diagram */}
                <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 space-y-3">
                  <div className="text-emerald-400 font-bold">// ARCHITECTURAL FLOW PIPELINE</div>
                  <pre className="text-[11px] leading-relaxed select-all">
{`┌─────────────────────────────────────────────────────────────────┐
│                       CLIENT APPLICATION LAYER                  │
│  React 18 + Vite + Tailwind CSS + Framer Motion + wagmi/viem    │
└────────────────┬────────────────────────────────┬───────────────┘
                 │                                │
                 ▼                                ▼
┌─────────────────────────────────┐  ┌────────────────────────────┐
│      VERCEL SERVERLESS EDGE     │  │   CLOUD STORAGE DATA LAYER │
│  • /api/fpl (Live Premier API)  │  │   Cloud Firestore Cluster  │
│  • /api/oracle (ECDSA Signing)  │  │   • Entries & Lineups      │
│  • /api/auth/verify (SIWE EIP)  │  │   • Real-Time Leaderboards │
└────────────────┬────────────────┘  └────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                  ROBINHOOD CHAIN PROTOCOL LAYER                 │
│  • FPLS.sol (ERC-20 Token with 3% Transfer Tax Hook)            │
│  • PrizePool.sol (Entry Stake Escrow & Burn Registry)           │
│  • Burn Address (0x000000000000000000000000000000000000dEaD)    │
│  • Tokenized GameStop Stock ($GME Class A Equity Yield)         │
└─────────────────────────────────────────────────────────────────┘`}
                  </pre>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-[#FAFBF9] dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Smart Contract Execution</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Enforces non-custodial entry stake burns, automated 90% prize pool lockups, and cryptographically verified claims.
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#FAFBF9] dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700">
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Live Sports Ingestion</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Direct low-latency ingestion of official Premier League data with caching to prevent rate-limits and ensure millisecond rendering.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: GAME ENGINE & SALARY CAP */}
          {activeSection === 'mechanics' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="card-modern p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#EAECE9] dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center shadow-xs">
                    <Shield className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Game Engine & Salary Cap</h2>
                    <p className="text-xs text-slate-500 font-mono">Mathematical Balance & Tactical Constraints</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Unlike unregulated pay-to-win fantasy games, FPL.STOCK enforces an exact, uncompromised algorithmic salary cap model that rewards pure football knowledge and tactical acumen.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
                    <div className="text-[10px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">Salary Cap</div>
                    <div className="text-xl font-bold font-mono text-emerald-900 dark:text-emerald-200 mt-0.5">£80.0M</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Strict ceiling for 11 players</div>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60">
                    <div className="text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400">Club Limit</div>
                    <div className="text-xl font-bold font-mono text-amber-900 dark:text-amber-200 mt-0.5">Max 3</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Players from same PL team</div>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60">
                    <div className="text-[10px] font-mono font-bold uppercase text-purple-700 dark:text-purple-400">Armband</div>
                    <div className="text-xl font-bold font-mono text-purple-900 dark:text-purple-200 mt-0.5">2x Points</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Captain score doubled</div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Available Formations</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                    {['4-4-2 (Standard)', '4-3-3 (Attacking)', '3-5-2 (Midfield Control)', '3-4-3 (All-Out Attack)', '5-3-2 (Defensive)', '5-4-1 (Solid Counter)'].map(f => (
                      <div key={f} className="p-2.5 rounded-lg bg-[#FAFBF9] dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700 text-center font-bold text-neutral-800 dark:text-slate-200">
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>⏰ Strict 1-Hour Pre-Kickoff Cutoff</span>
                  </div>
                  <p>
                    All squad submissions and captain designations lock automatically exactly <strong>60 minutes</strong> before the scheduled kickoff of the first match in the gameweek. Late submissions are mathematically impossible on-chain and rejected by the smart contracts.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: SCORING ALGORITHM */}
          {activeSection === 'scoring' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="card-modern p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#EAECE9] dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center shadow-xs">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Scoring Algorithm & Real-Time Sync</h2>
                    <p className="text-xs text-slate-500 font-mono">Official Premier League Match Points Matrix</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Scores update dynamically using official Opta and Premier League event feeds. Points are mapped across positions according to tactical performance:
                </p>

                <div className="overflow-x-auto border border-[#EAECE9] dark:border-slate-700 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAFBF9] dark:bg-slate-800 text-slate-500 font-mono uppercase text-[10px] border-b border-[#EAECE9] dark:border-slate-700">
                      <tr>
                        <th className="p-3">Match Event</th>
                        <th className="p-3">Goalkeeper (GK)</th>
                        <th className="p-3">Defender (DEF)</th>
                        <th className="p-3">Midfielder (MID)</th>
                        <th className="p-3">Forward (FWD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAECE9] dark:divide-slate-800 font-mono">
                      <tr>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">Playing 60+ Mins</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+2 PTS</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+2 PTS</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+2 PTS</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+2 PTS</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">Goal Scored</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+6 PTS</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+6 PTS</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+5 PTS</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+4 PTS</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">Goal Assist</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+3 PTS</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+3 PTS</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+3 PTS</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+3 PTS</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">Clean Sheet</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+4 PTS</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+4 PTS</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+1 PTS</td>
                        <td className="p-3 text-slate-400">0 PTS</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">Penalty Save / Miss</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">+5 PTS</td>
                        <td className="p-3 text-rose-500">-2 PTS</td>
                        <td className="p-3 text-rose-500">-2 PTS</td>
                        <td className="p-3 text-rose-500">-2 PTS</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">Yellow / Red Card</td>
                        <td className="p-3 text-rose-500">-1 / -3 PTS</td>
                        <td className="p-3 text-rose-500">-1 / -3 PTS</td>
                        <td className="p-3 text-rose-500">-1 / -3 PTS</td>
                        <td className="p-3 text-rose-500">-1 / -3 PTS</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: DEFLATIONARY TOKENOMICS */}
          {activeSection === 'tokenomics' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="card-modern p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#EAECE9] dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center shadow-xs">
                    <Coins className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Deflationary Tokenomics ($FPLS)</h2>
                    <p className="text-xs text-slate-500 font-mono">100K Entry Fee • 10% Burn • 90% Prize Distribution</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Unlike inflationary GameFi tokens that print unbacked rewards, <strong>$FPLS has a strictly capped supply</strong>. Every gameweek is a net deflationary event where tokens are permanently destroyed on-chain.
                </p>

                {/* Token Split Visual Breakdown */}
                <div className="p-4 rounded-2xl bg-[#FAFBF9] dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-slate-900 dark:text-white">Per-Entry Stake Breakdown: 100,000 $FPLS</span>
                    <span className="text-slate-500">100% On-Chain Verifiable</span>
                  </div>

                  <div className="w-full h-4 rounded-full overflow-hidden flex shadow-inner">
                    <div className="bg-emerald-600 h-full text-[9px] font-bold text-white flex items-center justify-center font-mono" style={{ width: '90%' }}>
                      90% PODIUM PRIZE POOL (90,000 $FPLS)
                    </div>
                    <div className="bg-rose-500 h-full text-[9px] font-bold text-white flex items-center justify-center font-mono" style={{ width: '10%' }}>
                      10% BURN
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                      <div className="font-bold text-emerald-800 dark:text-emerald-300">90% Podium Pool</div>
                      <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                        Locked in PrizePool escrow and disbursed directly to the Top 3 managers at gameweek settlement.
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
                      <div className="font-bold text-rose-800 dark:text-rose-300">10% Permanent Burn</div>
                      <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                        Transferred to dead address (<code className="font-mono text-[10px]">0x00...dEaD</code>), reducing total circulating supply forever.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: PODIUM POOL & ORACLE PROOFS */}
          {activeSection === 'podium' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="card-modern p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#EAECE9] dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center shadow-xs">
                    <Trophy className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Podium Pool & Cryptographic Oracle Proofs</h2>
                    <p className="text-xs text-slate-500 font-mono">60/20/10 Gold, Silver & Bronze Payout Architecture</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  The weekly prize pool is awarded strictly to the top three managers, eliminating dilution and providing tournament-level rewards:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                    <span className="text-2xl">🥇</span>
                    <div className="font-bold text-amber-700 dark:text-amber-300 mt-1">1st Place Champion</div>
                    <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400 mt-0.5">60% of Pool</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-300/20 border border-slate-400/30 text-center">
                    <span className="text-2xl">🥈</span>
                    <div className="font-bold text-slate-700 dark:text-slate-300 mt-1">2nd Place Runner-Up</div>
                    <div className="text-xl font-black font-mono text-slate-800 dark:text-slate-200 mt-0.5">20% of Pool</div>
                  </div>
                  <div className="p-4 rounded-xl bg-amber-700/10 border border-amber-700/30 text-center">
                    <span className="text-2xl">🥉</span>
                    <div className="font-bold text-amber-800 dark:text-amber-400 mt-1">3rd Place Finisher</div>
                    <div className="text-xl font-black font-mono text-amber-700 dark:text-amber-500 mt-0.5">10% of Pool</div>
                  </div>
                </div>

                {/* Oracle Keccak256 Signature Verification */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cryptographic Oracle Attestation</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Settlements are authenticated using ECDSA signed message hashes. The serverless Oracle generates an immutable proof:
                  </p>
                  <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                    <pre className="text-[11px] leading-relaxed">
{`// 1. Pack parameters into Keccak256 Hash
bytes32 messageHash = keccak256(
  abi.encodePacked(gameweek, rank, winnerAddress, fplsPrizeAmount, gmeYieldAmount)
);

// 2. Oracle signs with Ethereum Signed Message prefix (EIP-191)
bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
address signer = ethSignedMessageHash.recover(oracleSignature);

// 3. Smart Contract verifies authorized Oracle signer
require(signer == authorizedOracle, "Invalid Oracle Signature");`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: RWA STOCK EQUITY & PONS SWAP */}
          {activeSection === 'rwa' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="card-modern p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#EAECE9] dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                    <TrendingUp className="w-5 h-5 text-purple-200" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">RWA Stock Equity & Pons Swap</h2>
                    <p className="text-xs text-slate-500 font-mono">Continuous GameStop Corp. ($GME) Stock Dividends</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  FPL.STOCK bridges digital gaming performance with institutional Wall Street equities. Through our launch partner <strong>Pons Family</strong>, the protocol features an autonomous tax-to-equity flywheel:
                </p>

                <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 to-indigo-950/70 border border-purple-500/40 text-white space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-300 text-xs font-mono font-bold">
                      THE 3% TAX EQUITIZATION ENGINE
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="font-bold text-purple-300">1. Decentralized Trade</div>
                      <p className="text-slate-300 mt-1">Every buy/sell of $FPLS on Pons Family triggers an automatic 3% protocol tax.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="font-bold text-purple-300">2. Real Stock Swap</div>
                      <p className="text-slate-300 mt-1">100% of this tax is swapped into tokenized GameStop ($GME) shares on Robinhood Chain.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className="font-bold text-purple-300">3. Holder Dividend Stream</div>
                      <p className="text-slate-300 mt-1">Dividends stream continuously to all token holders, claimable at any time.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAFBF9] dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Pons Family Launchpad Portal</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Direct contract interface for equity dividend claims and liquidity pools.
                    </div>
                  </div>
                  <a
                    href={PONS_CONFIG.platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs font-bold flex items-center gap-1.5"
                  >
                    <span>Visit Pons Family</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: AUTHENTICATION & SECURITY */}
          {activeSection === 'security' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="card-modern p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#EAECE9] dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center shadow-xs">
                    <Lock className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Authentication & Security</h2>
                    <p className="text-xs text-slate-500 font-mono">SIWE (EIP-4361) Cryptographic Handshake</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  FPL.STOCK eliminates insecure passwords and third-party trackers. All authentication is performed via <strong>Sign-In with Ethereum (SIWE / EIP-4361)</strong>:
                </p>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                    <pre className="text-[11px] leading-relaxed">
{`1. Client calls /api/auth/nonce -> Server generates single-use CSRF-protected nonce cookie.
2. User signs EIP-4361 message in MetaMask/Coinbase/Phantom.
3. Client posts { message, signature } to /api/auth/verify.
4. Server verifies signature matching address & nonce, then mints Firebase Custom Token.
5. User gains secure, scoped, non-custodial read/write access to their team lineup.`}
                    </pre>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#FAFBF9] dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white">Reentrancy Protection</div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">All prize release and staking functions use OpenZeppelin ReentrancyGuard.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAFBF9] dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700">
                    <div className="font-bold text-slate-900 dark:text-white">Non-Custodial Escrow</div>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Platform operators cannot withdraw or divert player entry fees from the prize contract.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: SMART CONTRACT INTERFACES */}
          {activeSection === 'contracts' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="card-modern p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#EAECE9] dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center shadow-xs">
                    <Code2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Smart Contract Interfaces & Addresses</h2>
                    <p className="text-xs text-slate-500 font-mono">Solidity 0.8.24 Verified Contract Specifications</p>
                  </div>
                </div>

                {/* Addresses Table */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-[#FAFBF9] dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">FPLS Token Contract</span>
                      <span className="text-slate-900 dark:text-white font-bold">{FPLS_ADDRESS}</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(FPLS_ADDRESS, 'fpls')}
                      className="btn-secondary py-1 px-2.5 text-[10px] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                    >
                      {copiedCode === 'fpls' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode === 'fpls' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAFBF9] dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Game Engine & PrizePool Contract</span>
                      <span className="text-slate-900 dark:text-white font-bold">{FPLGAME_ADDRESS}</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(FPLGAME_ADDRESS, 'game')}
                      className="btn-secondary py-1 px-2.5 text-[10px] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                    >
                      {copiedCode === 'game' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode === 'game' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAFBF9] dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Treasury & Burn Registry</span>
                      <span className="text-slate-900 dark:text-white font-bold">{TREASURY_ADDRESS}</span>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(TREASURY_ADDRESS, 'treasury')}
                      className="btn-secondary py-1 px-2.5 text-[10px] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                    >
                      {copiedCode === 'treasury' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode === 'treasury' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Solidity Snippet */}
                <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800 space-y-2">
                  <div className="text-slate-400 text-[11px] font-bold">// PrizePool.sol — Core Prize Claim Function</div>
                  <pre className="text-[11px] leading-relaxed">
{`function claimDualPrize(
    uint256 gameweek,
    uint256 rank,
    uint256 fplsAmount,
    uint256 gmeAmount,
    bytes calldata signature
) external nonReentrant {
    require(!hasClaimed[gameweek][msg.sender], "Prize already claimed");
    bytes32 messageHash = keccak256(abi.encodePacked(gameweek, rank, msg.sender, fplsAmount, gmeAmount));
    require(recoverSigner(messageHash, signature) == oracleAddress, "Invalid oracle signature");

    hasClaimed[gameweek][msg.sender] = true;
    if (fplsAmount > 0) IERC20(fplsToken).transfer(msg.sender, fplsAmount);
    if (gmeAmount > 0) IERC20(rwaGmeToken).transfer(msg.sender, gmeAmount);

    emit PrizeClaimed(gameweek, rank, msg.sender, fplsAmount, gmeAmount);
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 9: API REFERENCE */}
          {activeSection === 'api' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="card-modern p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#EAECE9] dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center shadow-xs">
                    <Terminal className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">API Endpoints Reference</h2>
                    <p className="text-xs text-slate-500 font-mono">Serverless Edge Microservices Specification</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  {/* Endpoint 1 */}
                  <div className="p-4 rounded-xl bg-[#FAFBF9] dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold">GET</span>
                      <span className="font-bold text-slate-900 dark:text-white">/api/fpl</span>
                    </div>
                    <p className="text-slate-500 font-sans text-xs">
                      Fetches sanitized, cached Premier League bootstrap-static player elements, teams, and active gameweek event status.
                    </p>
                  </div>

                  {/* Endpoint 2 */}
                  <div className="p-4 rounded-xl bg-[#FAFBF9] dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">POST</span>
                      <span className="font-bold text-slate-900 dark:text-white">/api/oracle</span>
                    </div>
                    <p className="text-slate-500 font-sans text-xs">
                      Validates winner scores and mints cryptographic ECDSA attestations for instant on-chain prize release.
                    </p>
                  </div>

                  {/* Endpoint 3 */}
                  <div className="p-4 rounded-xl bg-[#FAFBF9] dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold">POST</span>
                      <span className="font-bold text-slate-900 dark:text-white">/api/auth/verify</span>
                    </div>
                    <p className="text-slate-500 font-sans text-xs">
                      Validates EIP-4361 SIWE signed signature against session nonce and issues Firebase authentication tokens.
                    </p>
                  </div>

                  {/* Endpoint 4 */}
                  <div className="p-4 rounded-xl bg-[#FAFBF9] dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold">GET</span>
                      <span className="font-bold text-slate-900 dark:text-white">/api/news</span>
                    </div>
                    <p className="text-slate-500 font-sans text-xs">
                      Fetches live football news and match previews from official broadcast syndication feeds.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 10: INTERACTIVE PROTOCOL SIMULATOR */}
          {activeSection === 'calculator' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="card-modern p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-[#EAECE9] dark:border-slate-800">
                  <div className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center shadow-xs">
                    <Calculator className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Interactive Protocol Simulator</h2>
                    <p className="text-xs text-slate-500 font-mono">Live Staking, Podium Payout & Burn Modeling</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs font-mono mb-2">
                      <span className="font-bold text-slate-900 dark:text-white">Simulated Gameweek Entries:</span>
                      <span className="px-3 py-1 rounded-full bg-forest text-white font-bold">{simEntries} Managers</span>
                    </div>
                    <input 
                      type="range"
                      min="10"
                      max="2000"
                      step="10"
                      value={simEntries}
                      onChange={(e) => setSimEntries(Number(e.target.value))}
                      className="w-full accent-[#1C2E1E] dark:accent-emerald-400 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                      <span>10 Entries</span>
                      <span>500</span>
                      <span>1,000</span>
                      <span>2,000 Entries</span>
                    </div>
                  </div>

                  {/* Results Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-4 rounded-xl bg-[#FAFBF9] dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700 text-center">
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Total Staked</div>
                      <div className="text-base sm:text-lg font-black font-mono text-slate-900 dark:text-white mt-0.5">
                        {totalStaked.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">$FPLS</div>
                    </div>

                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-center">
                      <div className="text-[10px] font-mono text-rose-700 dark:text-rose-400 uppercase">Tokens Burned</div>
                      <div className="text-base sm:text-lg font-black font-mono text-rose-600 dark:text-rose-300 mt-0.5">
                        {totalBurned.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-rose-500 font-mono">10% Permanent</div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-center">
                      <div className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase">Prize Pool</div>
                      <div className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-300 mt-0.5">
                        {totalPrizePool.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-emerald-500 font-mono">90% Podium</div>
                    </div>

                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 text-center">
                      <div className="text-[10px] font-mono text-purple-700 dark:text-purple-400 uppercase">GME Yield</div>
                      <div className="text-base sm:text-lg font-black font-mono text-purple-600 dark:text-purple-300 mt-0.5">
                        +{estimatedGmeYield}
                      </div>
                      <div className="text-[10px] text-purple-500 font-mono">Wall St Equity</div>
                    </div>
                  </div>

                  {/* Podium Payout Split Simulator */}
                  <div className="p-4 rounded-2xl bg-[#FAFBF9] dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700 space-y-2">
                    <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">Simulated Podium Payouts:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300">
                        <div className="font-bold">🥇 1st Place (60%)</div>
                        <div className="text-base font-black mt-0.5">{firstPrize.toLocaleString()} $FPLS</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-400/10 border border-slate-400/30 text-slate-700 dark:text-slate-300">
                        <div className="font-bold">🥈 2nd Place (20%)</div>
                        <div className="text-base font-black mt-0.5">{secondPrize.toLocaleString()} $FPLS</div>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-700/10 border border-amber-700/30 text-amber-700 dark:text-amber-400">
                        <div className="font-bold">🥉 3rd Place (10%)</div>
                        <div className="text-base font-black mt-0.5">{thirdPrize.toLocaleString()} $FPLS</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
