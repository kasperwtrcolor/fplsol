import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  ChevronRight, 
  Newspaper, 
  ExternalLink, 
  RefreshCw, 
  ArrowRight,
  Check,
  Sparkles,
  Shield,
  Zap,
  TrendingUp,
  Coins
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PONS_CONFIG } from '../config/contracts';
import { VectorKit } from './VectorKit';

// Custom Typewriter Hook for editorial headlines
export const useTypewriter = (text, speed = 36, startDelay = 500) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);

    let intervalId = null;
    const timeoutId = setTimeout(() => {
      let currentIndex = 0;
      intervalId = setInterval(() => {
        currentIndex++;
        setDisplayed(text.slice(0, currentIndex));
        if (currentIndex >= text.length) {
          clearInterval(intervalId);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
};

// Fallback star lineup if live FPL players data is loading (Ordered for 4-4-2: 1 GK, 4 DEF, 4 MID, 2 FWD)
const FALLBACK_STAR_11 = [
  // 1 Goalkeeper
  { id: 1,   web_name: "Raya", second_name: "Raya", element_type: 1, team: 1, team_code: 3, squad_number: 22, now_cost: 60, event_points: 3, total_points: 15 },
  // 4 Defenders
  { id: 6,   web_name: "Saliba", second_name: "Saliba", element_type: 2, team: 1, team_code: 3, squad_number: 2, now_cost: 60, event_points: 6, total_points: 18 },
  { id: 8,   web_name: "Calafiori", second_name: "Calafiori", element_type: 2, team: 1, team_code: 3, squad_number: 33, now_cost: 57, event_points: 2, total_points: 22 },
  { id: 391, web_name: "Gvardiol", second_name: "Gvardiol", element_type: 2, team: 15, team_code: 43, squad_number: 24, now_cost: 56, event_points: 8, total_points: 22 },
  { id: 279, web_name: "Ajayi", second_name: "Ajayi", element_type: 2, team: 11, team_code: 88, squad_number: 6, now_cost: 41, event_points: 5, total_points: 25 },
  // 4 Midfielders
  { id: 12,  web_name: "Saka", second_name: "Saka", element_type: 3, team: 1, team_code: 3, squad_number: 7, now_cost: 95, event_points: 2, total_points: 22 },
  { id: 154, web_name: "Palmer", second_name: "Palmer", element_type: 3, team: 6, team_code: 8, squad_number: 20, now_cost: 96, event_points: 1, total_points: 21 },
  { id: 426, web_name: "B.Fernandes", second_name: "Fernandes", element_type: 3, team: 16, team_code: 1, squad_number: 8, now_cost: 120, event_points: 2, total_points: 27 },
  { id: 367, web_name: "Gakpo", second_name: "Gakpo", element_type: 3, team: 14, team_code: 14, squad_number: 18, now_cost: 72, event_points: 11, total_points: 28 },
  // 2 Forwards
  { id: 411, web_name: "Haaland", second_name: "Haaland", element_type: 4, team: 15, team_code: 43, squad_number: 9, now_cost: 155, event_points: 9, total_points: 24, isCaptain: true },
  { id: 379, web_name: "Isak", second_name: "Isak", element_type: 4, team: 14, team_code: 14, squad_number: 9, now_cost: 90, event_points: 13, total_points: 23 },
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

// Fallback Premier League news items
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

  // Typewriter effect for headline
  const { displayed, done } = useTypewriter("Fantasy Premier League\nStock Meets Real Equity.", 34, 400);

  // Multi-select pill filters (highlighting key platform features)
  const [selectedPills, setSelectedPills] = useState([
    "£80.0M Salary Cap",
    "Podium Pool (60/20/10)",
    "3% GME Stock Dividends",
    "10% Deflationary Burn"
  ]);

  const togglePill = (pill) => {
    setSelectedPills(prev => 
      prev.includes(pill) ? prev.filter(p => p !== pill) : [...prev, pill]
    );
  };

  // Interactive Featured Vector Kit Showcase Deck (Dynamically synced to live FPL season data)
  const [selectedStarIdx, setSelectedStarIdx] = useState(0);
  const featuredStars = useMemo(() => {
    // Current season premier star blueprints with verified live IDs and official numbers
    const STAR_BLUEPRINTS = [
      { id: 411, name: "Erling Haaland", web_name: "Haaland", team: "MCI", club: "Man City", num: 9, defaultCost: 155, pts: 24, captain: true, role: "Forward", element_type: 4, teamId: 15, teamCode: 43 },
      { id: 12,  name: "Bukayo Saka", web_name: "Saka", team: "ARS", club: "Arsenal", num: 7, defaultCost: 95, pts: 22, captain: false, role: "Midfielder", element_type: 3, teamId: 1, teamCode: 3 },
      { id: 154, name: "Cole Palmer", web_name: "Palmer", team: "CHE", club: "Chelsea", num: 20, defaultCost: 96, pts: 21, captain: false, role: "Midfielder", element_type: 3, teamId: 6, teamCode: 8 },
      { id: 426, name: "Bruno Fernandes", web_name: "B.Fernandes", team: "MUN", club: "Man Utd", num: 8, defaultCost: 120, pts: 27, captain: false, role: "Midfielder", element_type: 3, teamId: 16, teamCode: 1 },
      { id: 6,   name: "William Saliba", web_name: "Saliba", team: "ARS", club: "Arsenal", num: 2, defaultCost: 60, pts: 18, captain: false, role: "Defender", element_type: 2, teamId: 1, teamCode: 3 },
    ];

    return STAR_BLUEPRINTS.map(star => {
      // Find matching player in live bootstrap-static players array
      const livePlayer = (players && players.length > 0)
        ? players.find(p => p.id === star.id || (p.web_name === star.web_name && p.team === star.teamId))
        : null;

      const nowCost = livePlayer?.now_cost || star.defaultCost;
      const formattedPrice = `£${(nowCost / 10).toFixed(1)}M`;
      const points = livePlayer?.total_points || star.pts;
      const teamObj = fplTeams?.[livePlayer?.team || star.teamId];
      const teamShort = teamObj?.short_name || star.team;
      const clubName = teamObj?.name || star.club;
      const teamCode = livePlayer?.team_code || star.teamCode;
      const squadNum = livePlayer?.squad_number || star.num;

      // Fully qualified live FPL player object for seamless squad drafting
      const playerObj = livePlayer ? {
        ...livePlayer,
        squad_number: squadNum,
      } : {
        id: star.id,
        web_name: star.web_name,
        second_name: star.name.split(' ').slice(1).join(' ') || star.web_name,
        element_type: star.element_type,
        now_cost: nowCost,
        team: star.teamId,
        team_code: teamCode,
        squad_number: squadNum,
        event_points: star.pts,
        total_points: star.pts,
      };

      return {
        id: livePlayer?.id || star.id,
        name: star.name,
        web_name: livePlayer?.web_name || star.web_name,
        team: teamShort,
        club: clubName,
        num: squadNum,
        price: formattedPrice,
        cost: nowCost,
        pts: points,
        captain: star.captain,
        role: star.role,
        element_type: livePlayer?.element_type || star.element_type,
        teamId: livePlayer?.team || star.teamId,
        teamCode: teamCode,
        playerObj
      };
    });
  }, [players, fplTeams]);

  const activeStar = featuredStars[selectedStarIdx] || featuredStars[0];

  // Fetch live sports news
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
  const pitchPlayers = useMemo(() => {
    if (!players || players.length === 0) {
      return [
        { ...FALLBACK_STAR_11[0], coord: COORDS_442.gk[0] },
        { ...FALLBACK_STAR_11[1], coord: COORDS_442.def[0] },
        { ...FALLBACK_STAR_11[2], coord: COORDS_442.def[1] },
        { ...FALLBACK_STAR_11[3], coord: COORDS_442.def[2] },
        { ...FALLBACK_STAR_11[4], coord: COORDS_442.def[3] },
        { ...FALLBACK_STAR_11[5], coord: COORDS_442.mid[0] },
        { ...FALLBACK_STAR_11[6], coord: COORDS_442.mid[1] },
        { ...FALLBACK_STAR_11[7], coord: COORDS_442.mid[2] },
        { ...FALLBACK_STAR_11[8], coord: COORDS_442.mid[3] },
        { ...FALLBACK_STAR_11[9], coord: COORDS_442.fwd[0] },
        { ...FALLBACK_STAR_11[10], coord: COORDS_442.fwd[1] },
      ];
    }

    // Sort by gameweek event points, breaking ties with season total points
    const sortByForm = (a, b) => {
      const formA = ((a.event_points || 0) * 100) + (a.total_points || 0);
      const formB = ((b.event_points || 0) * 100) + (b.total_points || 0);
      return formB - formA;
    };

    const gks = players.filter(p => p.element_type === 1).sort(sortByForm);
    const defs = players.filter(p => p.element_type === 2).sort(sortByForm);
    const mids = players.filter(p => p.element_type === 3).sort(sortByForm);
    const fwds = players.filter(p => p.element_type === 4).sort(sortByForm);

    const selectedGk = gks.slice(0, 1);
    const selectedDefs = defs.slice(0, 4);
    const selectedMids = mids.slice(0, 4);
    const selectedFwds = fwds.slice(0, 2);

    const squad = [
      ...selectedGk.map((p, i) => ({ ...p, coord: COORDS_442.gk[i] })),
      ...selectedDefs.map((p, i) => ({ ...p, coord: COORDS_442.def[i] })),
      ...selectedMids.map((p, i) => ({ ...p, coord: COORDS_442.mid[i] })),
      ...selectedFwds.map((p, i) => ({ ...p, coord: COORDS_442.fwd[i] })),
    ];

    let highestPoints = -1;
    let captainId = null;
    squad.forEach(p => {
      const pts = p.event_points || p.total_points || 0;
      if (pts > highestPoints) {
        highestPoints = pts;
        captainId = p.id;
      }
    });

    return squad.map(p => ({
      ...p,
      isCaptain: p.id === captainId
    }));
  }, [players]);

  const formatPubDate = (isoString) => {
    if (!isoString) return '';
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
    <div className="w-full flex flex-col space-y-16 pb-20 font-sans selection:bg-[#EAECE9] selection:text-[#1C2E1E]">
      
      {/* 1. MODERN EDITORIAL HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-[#EAECE9] dark:border-slate-800 shadow-sm p-6 sm:p-10 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Typewriter Headline, Description, Service Pills, Status Banner */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            
            {/* Status Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAFBF9] dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700 text-xs font-mono font-medium text-neutral-800 dark:text-slate-200 mb-6 w-fit shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold">GAMEWEEK {activeGameweek?.gameweek || 4} ACTIVE</span>
              <span className="text-neutral-300 dark:text-slate-600">•</span>
              <span className="text-forest dark:text-emerald-400 font-semibold">Robinhood Chain</span>
              <span className="text-neutral-300 dark:text-slate-600">•</span>
              <span className="text-purple-600 dark:text-purple-400 font-bold">GME Stock Yield</span>
            </div>

            {/* Typewriter Headline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.08] mb-6 select-none whitespace-pre-wrap">
                {displayed}
                {!done && (
                  <span className="inline-block w-[2px] h-[1.1em] bg-neutral-900 dark:bg-white align-middle ml-[2px] animate-blink" />
                )}
              </h1>
            </motion.div>

            {/* Crisp Editorial Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <p className="text-sm sm:text-base text-forest-text dark:text-slate-300 leading-relaxed font-normal mb-6 max-w-xl">
                Build your 11-player squad under the strict <strong className="text-emerald-600 dark:text-emerald-400 font-mono">£80.0M</strong> salary cap. Compete for the weekly podium pool and earn real <strong className="text-purple-600 dark:text-purple-400">GameStop ($GME)</strong> stock equity dividends.
              </p>
            </motion.div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setCurrentView('team')}
                className="btn-primary px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Draft Your Squad</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentView('leaderboard')}
                className="btn-secondary px-5 py-2.5 text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>View Standings</span>
              </button>
            </div>
          </div>

          {/* Right Column: Featured Vector Kit Showcase Card */}
          <div className="lg:col-span-5 xl:col-span-4 flex justify-center w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full max-w-sm rounded-3xl bg-[#FAFBF9] dark:bg-slate-800/90 border border-[#EAECE9] dark:border-slate-700 p-5 shadow-sm"
            >
              {/* Header with Title & Live Badge */}
              <div className="flex items-center justify-between pb-3 border-b border-[#EAECE9] dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-forest dark:bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-forest dark:text-slate-200">
                    Vector Jersey Kit Deck
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-forest/10 dark:bg-forest/40 text-forest dark:text-emerald-300 border border-forest/20">
                  Official PL Kits
                </span>
              </div>

              {/* Central Featured Vector Jersey */}
              <div className="flex flex-col items-center justify-center py-6 relative">
                {activeStar.captain && (
                  <div className="absolute top-2 right-12 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center font-mono shadow-md border border-amber-200 z-20">
                    C
                  </div>
                )}

                <motion.div
                  key={activeStar.id}
                  initial={{ scale: 0.85, opacity: 0, y: 8 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 20 }}
                  className="transform hover:scale-105 transition-transform cursor-pointer"
                >
                  <VectorKit
                    player={activeStar.playerObj}
                    shortName={activeStar.team}
                    className="w-24 h-28 sm:w-28 sm:h-32 drop-shadow-lg"
                  />
                </motion.div>

                <div className="mt-3 text-center">
                  <h4 className="font-extrabold text-base text-neutral-900 dark:text-white">
                    {activeStar.name}
                  </h4>
                  <div className="flex items-center justify-center gap-2 mt-1.5 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 text-neutral-700 dark:text-slate-200 border border-[#EAECE9] dark:border-slate-600 font-mono font-bold">
                      {activeStar.team} • #{activeStar.num}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono font-bold">
                      {activeStar.price}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-mono font-bold">
                      {activeStar.pts} PTS
                    </span>
                  </div>
                </div>
              </div>

              {/* Jersey Selector Tabs */}
              <div className="grid grid-cols-5 gap-2 pt-3 border-t border-[#EAECE9] dark:border-slate-700">
                {featuredStars.map((star, idx) => (
                  <button
                    key={star.id}
                    onClick={() => setSelectedStarIdx(idx)}
                    className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedStarIdx === idx
                        ? 'border-forest dark:border-emerald-400 bg-white dark:bg-slate-700 shadow-sm scale-105'
                        : 'border-[#EAECE9] dark:border-slate-700 hover:bg-neutral-100 dark:hover:bg-slate-700/50 opacity-70'
                    }`}
                  >
                    <div className="text-[10px] font-bold font-mono text-neutral-800 dark:text-slate-200">
                      {star.team}
                    </div>
                    <div className="text-[9px] text-neutral-500 dark:text-slate-400">
                      #{star.num}
                    </div>
                  </button>
                ))}
              </div>

              {/* Quick Draft Action */}
              <div className="mt-4">
                <button
                  onClick={() => {
                    if (onSelectPlayer) {
                      onSelectPlayer(activeStar.playerObj);
                    }
                    setCurrentView('team');
                  }}
                  className="w-full py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <span>Draft {activeStar.name.split(' ')[1] || activeStar.name} to Squad</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 2. CONSOLIDATED LIVE PROTOCOL & HOLDER STOCK DIVIDENDS STRIP */}
      <section className="w-full space-y-4">
        {/* 4 Core Protocol Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#EAECE9] dark:border-slate-800 shadow-xs">
            <div className="text-[11px] font-mono text-forest-muted dark:text-slate-400 uppercase tracking-wider">Salary Cap</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">£80.0M</div>
            <div className="text-[11px] text-forest-text dark:text-slate-400 mt-1">11 Real PL Players</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#EAECE9] dark:border-slate-800 shadow-xs">
            <div className="text-[11px] font-mono text-forest-muted dark:text-slate-400 uppercase tracking-wider">Entry Stake</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-0.5">100K</div>
            <div className="text-[11px] text-forest-text dark:text-slate-400 mt-1">$FPLS • 10% Burned</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#EAECE9] dark:border-slate-800 shadow-xs">
            <div className="text-[11px] font-mono text-forest-muted dark:text-slate-400 uppercase tracking-wider">Podium Split</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">60/20/10</div>
            <div className="text-[11px] text-forest-text dark:text-slate-400 mt-1">Top 3 Managers Win</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#EAECE9] dark:border-slate-800 shadow-xs">
            <div className="text-[11px] font-mono text-forest-muted dark:text-slate-400 uppercase tracking-wider">Holder Yield</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">3% Tax</div>
            <div className="text-[11px] text-forest-text dark:text-slate-400 mt-1">Tokenized $GME Stock</div>
          </div>
        </div>

        {/* Sleek Pons Launchpad Stock Dividend Card */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/60 to-slate-950 border border-purple-500/40 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-200 font-mono font-black text-sm shrink-0">
              💎
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-wider font-bold text-purple-300 font-mono">
                  Holder Equity Yield • Pons Launchpad
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
                  Robinhood Chain
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Every trade on Pons incurs a 3% tax automatically converted to GameStop ($GME) equity for $FPLS holders.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
            <a
              href={PONS_CONFIG.dividendsClaimUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <span>Claim Dividends on Pons</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={PONS_CONFIG.tokenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Trade $FPLS</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </section>

      {/* 4. STAR PERFORMERS OF THE GAMEWEEK (4-4-2 TACTICAL FORMATION WITH VECTOR JERSEYS) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <div className="text-xs font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
              Gameweek {activeGameweek?.gameweek || 4} Selection
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white mt-1">
              Star Performers (4-4-2 Formation)
            </h2>
            <p className="text-xs sm:text-sm text-forest-text dark:text-slate-400 mt-1 max-w-xl">
              The highest-performing Premier League stars for this gameweek arranged in a classic 4-4-2 lineup rendered with our custom vector jerseys based on official match data.
            </p>
          </div>

          <button
            onClick={() => setCurrentView('team')}
            className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-light text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <span>Build Your Own 11</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tactical Pitch with VectorKit Jerseys */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[520px] rounded-3xl overflow-hidden border-2 border-emerald-800/80 shadow-xl bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 p-4 select-none">
          {/* Tactical Pitch Markings */}
          <div className="absolute inset-4 border-2 border-white/20 rounded-2xl pointer-events-none">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/20 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-28 sm:w-36 h-28 sm:h-36 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/20" />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-52 sm:w-64 h-20 sm:h-24 border-b-2 border-l-2 border-r-2 border-white/20" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-52 sm:w-64 h-20 sm:h-24 border-t-2 border-l-2 border-r-2 border-white/20" />
          </div>

          {/* Star Performer Player Tokens with VectorKit */}
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
                title={`Click to draft ${player.second_name || player.web_name} to your squad`}
              >
                {/* Captain Armband on Top Performer */}
                {player.isCaptain && (
                  <div className="absolute -top-3 -right-2 bg-amber-400 text-slate-950 text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center font-mono shadow-md border border-amber-200 z-20">
                    C
                  </div>
                )}

                {/* Vector Jersey Kit */}
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

      {/* 5. PREMIER LEAGUE LIVE NEWS FEED (WITH LOADING ANIMATION) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest-surface dark:bg-slate-800 border border-[#EAECE9] dark:border-slate-700 text-forest dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-semibold uppercase text-forest-muted dark:text-slate-400 tracking-wider">
                Live Wire
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white">
                Premier League News Feed
              </h2>
            </div>
          </div>

          <button
            onClick={fetchNews}
            disabled={newsLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-[#F1F3F1] dark:hover:bg-slate-700 text-neutral-800 dark:text-slate-200 border border-[#EAECE9] dark:border-slate-700 text-xs font-mono font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${newsLoading ? 'animate-spin' : ''}`} />
            <span>{newsLoading ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>

        {/* News Loading Animation or Content Grid */}
        {newsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="card-modern p-5 space-y-3 relative overflow-hidden">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3 animate-pulse" />
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-full animate-pulse" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {news.slice(0, 4).map((item) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white dark:bg-slate-900 border border-[#EAECE9] dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-forest dark:hover:border-emerald-400/50 hover:shadow-md transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-forest-muted dark:text-slate-400">
                    <span className="font-semibold text-forest dark:text-emerald-400">{item.source || 'BBC Sport'}</span>
                    <span>{formatPubDate(item.pubDate)}</span>
                  </div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-forest dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-forest-text dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#EAECE9] dark:border-slate-800 flex items-center justify-between text-xs text-forest dark:text-slate-400 group-hover:text-forest-light">
                  <span className="font-medium">Read article</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
