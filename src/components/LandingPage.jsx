import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  ChevronRight, 
  Newspaper, 
  ExternalLink, 
  RefreshCw, 
  ArrowRight
} from 'lucide-react';
import { VectorKit } from './VectorKit';

// Fallback star lineup if players data is loading
const FALLBACK_STAR_11 = [
  { id: 350, web_name: "Haaland", second_name: "Haaland", element_type: 4, team: 15, team_code: 43, squad_number: 9, now_cost: 152, event_points: 17, total_points: 35, isCaptain: true },
  { id: 377, web_name: "Isak", second_name: "Isak", element_type: 4, team: 17, team_code: 4, squad_number: 14, now_cost: 85, event_points: 12, total_points: 24 },
  { id: 19,  web_name: "Saka", second_name: "Saka", element_type: 3, team: 1, team_code: 3, squad_number: 7, now_cost: 101, event_points: 13, total_points: 28 },
  { id: 328, web_name: "Salah", second_name: "Salah", element_type: 3, team: 14, team_code: 14, squad_number: 11, now_cost: 126, event_points: 15, total_points: 32 },
  { id: 211, web_name: "Palmer", second_name: "Palmer", element_type: 3, team: 6, team_code: 8, squad_number: 20, now_cost: 106, event_points: 14, total_points: 29 },
  { id: 355, web_name: "De Bruyne", second_name: "De Bruyne", element_type: 3, team: 15, team_code: 43, squad_number: 17, now_cost: 95, event_points: 11, total_points: 22 },
  { id: 18,  web_name: "Saliba", second_name: "Saliba", element_type: 2, team: 1, team_code: 3, squad_number: 2, now_cost: 60, event_points: 9, total_points: 18 },
  { id: 311, web_name: "Alexander-Arnold", second_name: "Trent", element_type: 2, team: 14, team_code: 14, squad_number: 66, now_cost: 71, event_points: 10, total_points: 20 },
  { id: 356, web_name: "Gvardiol", second_name: "Gvardiol", element_type: 2, team: 15, team_code: 43, squad_number: 24, now_cost: 60, event_points: 8, total_points: 16 },
  { id: 450, web_name: "Porro", second_name: "Porro", element_type: 2, team: 19, team_code: 6, squad_number: 23, now_cost: 55, event_points: 9, total_points: 17 },
  { id: 1,   web_name: "Raya", second_name: "Raya", element_type: 1, team: 1, team_code: 3, squad_number: 22, now_cost: 55, event_points: 11, total_points: 21 },
];

// Fixed 4-4-2 pitch coordinates
const COORDS_442 = {
  gk:  [{ top: '85%', left: '50%' }],
  def: [
    { top: '65%', left: '16%' },
    { top: '65%', left: '38%' },
    { top: '65%', left: '62%' },
    { top: '65%', left: '84%' }
  ],
  mid: [
    { top: '42%', left: '16%' },
    { top: '42%', left: '38%' },
    { top: '42%', left: '62%' },
    { top: '42%', left: '84%' }
  ],
  fwd: [
    { top: '18%', left: '35%' },
    { top: '18%', left: '65%' }
  ]
};

// Fallback Premier League news items in case API is unavailable or offline
const FALLBACK_NEWS = [
  {
    id: "f1",
    title: "Premier League Gameweek Preview: Tactical Battles & Key Matchups",
    summary: "Managers face tough selection dilemmas ahead of the weekend deadline as top four contenders clash.",
    source: "BBC Sport",
    pubDate: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    link: "https://www.bbc.com/sport/football"
  },
  {
    id: "f2",
    title: "Haaland & Saka Dominate Early FPL Captaincy Polls",
    summary: "Over 65% of managers have handed the armband to the high-flying strikers following consecutive multi-goal hauls.",
    source: "Sky Sports",
    pubDate: new Date(Date.now() - 1000 * 60 * 85).toISOString(),
    link: "https://www.skysports.com/football"
  },
  {
    id: "f3",
    title: "Injury Update: Key Midfielders Cleared for Weekend Kickoff",
    summary: "Latest team news reveals boost for title challengers as first-team stars return to full training.",
    source: "BBC Sport",
    pubDate: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    link: "https://www.bbc.com/sport/football"
  },
  {
    id: "f4",
    title: "Budget Bargains: Unheralded Defenders Delivering Big Clean Sheet Returns",
    summary: "Under-the-radar defenders priced under £5.0M are proving critical for savvy tacticians building within salary caps.",
    source: "Sky Sports",
    pubDate: new Date(Date.now() - 1000 * 60 * 210).toISOString(),
    link: "https://www.skysports.com/football"
  }
];

export const LandingPage = ({
  setCurrentView,
  activeGameweek,
  players = [],
  fplTeams = {},
  onSelectPlayer
}) => {
  const [news, setNews] = useState(FALLBACK_NEWS);
  const [newsLoading, setNewsLoading] = useState(false);

  // Fetch live sports news from /api/news
  const fetchNews = async () => {
    setNewsLoading(true);
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          setNews(data.articles);
        }
      }
    } catch (e) {
      console.warn("Could not fetch /api/news, using fallback news items:", e);
    } finally {
      setNewsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Compute Gameweek Star Performers in 4-4-2 from real live FPL data
  const pitchPlayers = React.useMemo(() => {
    if (!players || players.length === 0) {
      // Map fallback players to 4-4-2 positions
      const gks = FALLBACK_STAR_11.filter(p => p.element_type === 1);
      const defs = FALLBACK_STAR_11.filter(p => p.element_type === 2);
      const mids = FALLBACK_STAR_11.filter(p => p.element_type === 3);
      const fwds = FALLBACK_STAR_11.filter(p => p.element_type === 4);
      return [
        { ...gks[0], coord: COORDS_442.gk[0] },
        ...defs.slice(0, 4).map((p, i) => ({ ...p, coord: COORDS_442.def[i] })),
        ...mids.slice(0, 4).map((p, i) => ({ ...p, coord: COORDS_442.mid[i] })),
        ...fwds.slice(0, 2).map((p, i) => ({ ...p, coord: COORDS_442.fwd[i] })),
      ];
    }

    const hasLivePoints = players.some(p => (p.event_points || 0) > 0);
    const scoreOf = (p) => hasLivePoints 
      ? (p.event_points || 0) 
      : (parseFloat(p.form || 0) * 10 + (p.total_points || 0));

    const gks = players.filter(p => p.element_type === 1).sort((a, b) => scoreOf(b) - scoreOf(a));
    const defs = players.filter(p => p.element_type === 2).sort((a, b) => scoreOf(b) - scoreOf(a));
    const mids = players.filter(p => p.element_type === 3).sort((a, b) => scoreOf(b) - scoreOf(a));
    const fwds = players.filter(p => p.element_type === 4).sort((a, b) => scoreOf(b) - scoreOf(a));

    const selectedGK = gks.slice(0, 1);
    const selectedDEFs = defs.slice(0, 4);
    const selectedMIDs = mids.slice(0, 4);
    const selectedFWDs = fwds.slice(0, 2);

    const all11 = [...selectedGK, ...selectedDEFs, ...selectedMIDs, ...selectedFWDs];

    // Find highest point scorer for Captain armband
    let topScorerId = all11.length > 0 ? all11[0].id : null;
    let maxScore = -1;
    all11.forEach(p => {
      const s = scoreOf(p);
      if (s > maxScore) {
        maxScore = s;
        topScorerId = p.id;
      }
    });

    return [
      { ...selectedGK[0], coord: COORDS_442.gk[0], isCaptain: selectedGK[0]?.id === topScorerId },
      ...selectedDEFs.map((p, i) => ({ ...p, coord: COORDS_442.def[i], isCaptain: p.id === topScorerId })),
      ...selectedMIDs.map((p, i) => ({ ...p, coord: COORDS_442.mid[i], isCaptain: p.id === topScorerId })),
      ...selectedFWDs.map((p, i) => ({ ...p, coord: COORDS_442.fwd[i], isCaptain: p.id === topScorerId })),
    ];
  }, [players]);

  const formatRelativeTime = (isoString) => {
    try {
      const diffMin = Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60));
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="w-full flex flex-col space-y-16 pb-20">
      {/* 1. HERO INTRO SECTION */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-slate-950 text-white shadow-2xl">
        {/* Background 3D Stadium Image with Gradients */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero_stadium.jpg" 
            alt="FPLS Arena" 
            className="w-full h-full object-cover object-center opacity-30 scale-105 transform hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-14 sm:py-20 flex flex-col items-center text-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ROBINHOOD CHAIN • GAMEWEEK {activeGameweek?.gameweek || 4} ACTIVE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.08]">
            Fantasy Premier League <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
              Stock & Squad Trading
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
            Stake <span className="text-white font-mono font-bold">100,000 $FPLS</span>, build your ultimate 11-player squad under the strict <span className="text-emerald-400 font-mono font-bold">£80.0M</span> salary cap, and compete for the <span className="text-amber-300 font-bold">Top 3 Podium Payout (60% / 20% / 10%)</span> with deflationary <span className="text-rose-400 font-bold">10% burn</span>.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <button
              onClick={() => setCurrentView('team')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base shadow-emerald-glow flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>Build Your Squad</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => setCurrentView('rules')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>How It Works & Points</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Key Metrics Bar */}
          <div className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Salary Cap</div>
              <div className="text-xl md:text-2xl font-bold font-mono text-emerald-400 mt-0.5">£80.0M</div>
              <div className="text-[10px] text-slate-500 mt-1">11 Real PL Players</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Entry Stake</div>
              <div className="text-xl md:text-2xl font-bold font-mono text-white mt-0.5">100K $FPLS</div>
              <div className="text-[10px] text-slate-500 mt-1">Per Gameweek Entry</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Podium Payouts</div>
              <div className="text-xl md:text-2xl font-bold font-mono text-amber-400 mt-0.5">Top 3 Win</div>
              <div className="text-[10px] text-slate-500 mt-1">60% • 20% • 10% Pool</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-md">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Deflationary Burn</div>
              <div className="text-xl md:text-2xl font-bold font-mono text-rose-400 mt-0.5">10% Burn 🔥</div>
              <div className="text-[10px] text-slate-500 mt-1">Sent to 0x...dEaD</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STAR PERFORMERS OF THE GAMEWEEK (4-4-2 TACTICAL FORMATION) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="text-xs font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
              Gameweek {activeGameweek?.gameweek || 3} Selection
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              Star Performers (4-4-2)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              The highest-performing Premier League stars for this gameweek arranged in a classic 4-4-2 lineup based on official match data.
            </p>
          </div>

          <button
            onClick={() => setCurrentView('team')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer"
          >
            <span>Build Your Own 11</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tactical Emerald Pitch with Star Performers */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[520px] rounded-3xl overflow-hidden border-2 border-emerald-800/80 shadow-2xl bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 p-4 select-none">
          {/* Tactical Pitch Markings */}
          <div className="absolute inset-4 border-2 border-white/20 rounded-2xl pointer-events-none">
            {/* Halfway Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 -translate-y-1/2" />
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 w-28 sm:w-36 h-28 sm:h-36 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/20" />
            {/* Center Spot */}
            <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" />
            {/* Top Penalty Box */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-52 sm:w-64 h-20 sm:h-24 border-b-2 border-l-2 border-r-2 border-white/20" />
            {/* Bottom Penalty Box */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-52 sm:w-64 h-20 sm:h-24 border-t-2 border-l-2 border-r-2 border-white/20" />
          </div>

          {/* Star Performer Player Tokens */}
          {pitchPlayers.map((player) => {
            const team = fplTeams[player.team];
            const points = player.event_points || player.total_points || 0;

            return (
              <div
                key={player.id}
                style={{
                  top: player.coord.top,
                  left: player.coord.left,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group cursor-pointer"
                onClick={() => {
                  if (onSelectPlayer) onSelectPlayer(player);
                  setCurrentView('team');
                }}
                title={`Click to add ${player.second_name || player.web_name} to your squad`}
              >
                {/* Captain Armband on Top Performer */}
                {player.isCaptain && (
                  <div className="absolute -top-3 -right-2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center font-mono shadow-md border border-amber-200 z-20">
                    C
                  </div>
                )}

                {/* Jersey Kit */}
                <div className="transform transition-transform group-hover:scale-110">
                  <VectorKit 
                    player={player} 
                    shortName={team?.short_name}
                    className="w-10 h-12 sm:w-12 sm:h-14 drop-shadow-lg"
                  />
                </div>

                {/* Player Tag with Points & Price */}
                <div className="mt-0.5 px-2 py-0.5 rounded-md bg-slate-900/90 border border-emerald-500/40 text-white text-[9px] sm:text-[10px] font-bold tracking-tight shadow-md text-center whitespace-nowrap">
                  <span>{player.second_name || player.web_name}</span>
                  <span className="ml-1 text-[8px] text-emerald-400 font-mono">
                    {points > 0 ? `${points} PTS` : `£${(player.now_cost / 10).toFixed(1)}M`}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Bottom Pitch Badges */}
          <div className="absolute bottom-3 left-4 text-xs font-mono font-bold text-white/60 bg-black/40 px-3 py-1 rounded-xl backdrop-blur-sm">
            FORMATION: 4-4-2
          </div>

          <div className="absolute bottom-3 right-4">
            <button
              onClick={() => setCurrentView('team')}
              className="text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 px-3 py-1.5 rounded-xl backdrop-blur-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Build Your Squad</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. FREE LIVE SPORTS NEWS FEED */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-sm">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                Live Wire
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Premier League News Feed
              </h2>
            </div>
          </div>

          <button
            onClick={fetchNews}
            disabled={newsLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${newsLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>

        {/* News Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map((item) => (
            <a
              key={item.id}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="card-modern p-5 flex flex-col justify-between hover:border-emerald-500/40 hover:shadow-card transition-all group block"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                    {item.source}
                  </span>
                  <span className="font-mono text-[11px]">{formatRelativeTime(item.pubDate)}</span>
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
                  {item.title}
                </h3>
                {item.summary && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <span>Read full report</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 4. HOW IT WORKS 3-STEP TEASER */}
      <section className="card-modern p-8 sm:p-10 bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border border-slate-200 dark:border-slate-800">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <div className="text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
            Simple, Transparent, On-Chain
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            How The Game Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Three simple steps to compete, win, and claim your share of the gameweek prize pool.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-subtle">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">100K $FPLS Stake</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Pay the 100,000 $FPLS entry fee to join the gameweek before the strict 1-hour kickoff deadline.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-subtle">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Build Under £80.0M</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Select 11 real Premier League players matching official market valuations. Designate your Captain for 2x points.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-3 shadow-subtle">
            <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Podium Prize Payouts</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              The top 3 highest scoring managers share 90% of the prize pool (60% 1st, 20% 2nd, 10% 3rd). 10% is burned permanently.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setCurrentView('rules')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <span>View Full Official Points Matrix & Rules</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
