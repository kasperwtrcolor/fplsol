import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PONS_CONFIG } from '../config/contracts';
import { VectorKit } from './VectorKit';

// Custom typewriter hook according to spec
export const useTypewriter = (text, speed = 38, startDelay = 600) => {
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
  onSelectPlayer,
  authenticated = false,
  userWallet = '',
  fplsBalanceRaw = null,
  login = () => {},
  logout = () => {}
}) => {
  // Mobile navbar overlay state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Multi-select service pills state
  const [services, setServices] = useState(["Brand", "Digital", "Campaign", "Other"]);

  // Video background scrubbing & loading state
  const videoRef = useRef(null);
  const prevXRef = useRef(null);
  const isSeekingRef = useRef(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isVideoBuffering, setIsVideoBuffering] = useState(true);

  // Typewriter hook for main headline
  const { displayed, done } = useTypewriter("we'd love to\nhear from you!", 38, 600);

  // Interactive vector jersey showcase in hero
  const [selectedJerseyIdx, setSelectedJerseyIdx] = useState(0);

  // News state
  const [news, setNews] = useState(FALLBACK_NEWS);
  const [newsLoading, setNewsLoading] = useState(false);

  // Toggle multi-select services
  const toggleService = (svc) => {
    setServices(prev => 
      prev.includes(svc) ? prev.filter(s => s !== svc) : [...prev, svc]
    );
  };

  // Video scrubbing and playback logic via useEffect
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsVideoLoaded(true);
      setIsVideoBuffering(false);
      // Mobile Autoplay Hook (< 1024)
      if (window.innerWidth < 1024) {
        video.autoplay = true;
        video.play().catch(() => {});
      }
    };

    const handleWaiting = () => setIsVideoBuffering(true);
    const handlePlaying = () => setIsVideoBuffering(false);
    const handleSeeked = () => {
      isSeekingRef.current = false;
      setIsVideoBuffering(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('seeked', handleSeeked);

    if (video.readyState >= 2) {
      handleLoadedData();
    }

    // Desktop Mouse Scrubbing Hook
    const handleMouseMove = (e) => {
      if (window.innerWidth < 1024 || !video || !video.duration) return;

      const currentX = e.clientX;
      if (prevXRef.current === null) {
        prevXRef.current = currentX;
        return;
      }

      const delta = currentX - prevXRef.current;
      prevXRef.current = currentX;

      if (!isSeekingRef.current) {
        const timeShift = (delta / window.innerWidth) * 0.8 * video.duration;
        const targetTime = Math.max(0, Math.min(video.duration, video.currentTime + timeShift));
        isSeekingRef.current = true;
        video.currentTime = targetTime;
      }
    };

    const handleResize = () => {
      if (window.innerWidth < 1024 && video) {
        video.autoplay = true;
        video.play().catch(() => {});
      } else if (video) {
        video.pause();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('seeked', handleSeeked);
    };
  }, []);

  // Fetch news
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

    const gks = players.filter(p => p.element_type === 1).sort((a, b) => (b.event_points || 0) - (a.event_points || 0));
    const defs = players.filter(p => p.element_type === 2).sort((a, b) => (b.event_points || 0) - (a.event_points || 0));
    const mids = players.filter(p => p.element_type === 3).sort((a, b) => (b.event_points || 0) - (a.event_points || 0));
    const fwds = players.filter(p => p.element_type === 4).sort((a, b) => (b.event_points || 0) - (a.event_points || 0));

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

  // Featured stars for the hero vector jersey showcase
  const featuredStars = useMemo(() => {
    return [
      { id: 350, name: "Erling Haaland", team: "MCI", club: "Man City", num: 9, price: "£15.2M", pts: 17, captain: true, role: "Forward", color: "from-sky-400 to-sky-600" },
      { id: 19,  name: "Bukayo Saka", team: "ARS", club: "Arsenal", num: 7, price: "£10.1M", pts: 13, captain: false, role: "Midfielder", color: "from-red-500 to-rose-700" },
      { id: 211, name: "Cole Palmer", team: "CHE", club: "Chelsea", num: 20, price: "£10.6M", pts: 14, captain: false, role: "Midfielder", color: "from-blue-500 to-indigo-700" },
      { id: 328, name: "Mohamed Salah", team: "LIV", club: "Liverpool", num: 11, price: "£12.6M", pts: 15, captain: false, role: "Midfielder", color: "from-red-600 to-red-900" },
      { id: 18,  name: "William Saliba", team: "ARS", club: "Arsenal", num: 2, price: "£6.0M", pts: 9, captain: false, role: "Defender", color: "from-red-500 to-rose-700" },
    ];
  }, []);

  const activeStar = featuredStars[selectedJerseyIdx] || featuredStars[0];

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
    // 2. General Page Structure
    <div className="relative bg-white text-neutral-900 font-sans selection:bg-[#EAECE9] selection:text-[#1C2E1E] antialiased overflow-x-hidden flex flex-col lg:block lg:min-h-screen w-full">
      
      {/* 4. Interactive Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 px-5 sm:px-8 py-4 sm:py-5 flex flex-row justify-between items-center bg-white/75 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-b border-black/5 lg:border-none transition-colors duration-200">
        {/* Logo (Left side) */}
        <div 
          onClick={() => setCurrentView('overview')}
          className="flex flex-row items-center gap-3 cursor-pointer group"
          title="FPL.STOCK on Robinhood Chain"
        >
          <span className="text-[21px] sm:text-[26px] tracking-tight text-black font-medium select-none">
            Mainframe&reg;
          </span>
          <span className="text-[25px] sm:text-[30px] text-black select-none tracking-[-0.02em] font-medium leading-none mb-1">
            &#10033;
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/5 border border-black/10 text-xs font-mono font-medium text-black">
            FPL.STOCK • Robinhood Chain
          </span>
        </div>

        {/* Desktop Nav Links (Center) */}
        <div className="hidden md:flex flex-row items-center text-[23px] text-black font-normal">
          <button 
            onClick={() => setCurrentView('team')} 
            className="hover:opacity-60 transition-opacity cursor-pointer"
            title="Labs - Build 11-Player Squad"
          >
            Labs
          </button>
          <span className="opacity-40">,&nbsp;</span>
          <button 
            onClick={() => setCurrentView('fixtures')} 
            className="hover:opacity-60 transition-opacity cursor-pointer"
            title="Studio - Fixtures & Live Matches"
          >
            Studio
          </button>
          <span className="opacity-40">,&nbsp;</span>
          <button 
            onClick={() => setCurrentView('leaderboard')} 
            className="hover:opacity-60 transition-opacity cursor-pointer"
            title="Openings - Leaderboard & Rewards"
          >
            Openings
          </button>
          <span className="opacity-40">,&nbsp;</span>
          <button 
            onClick={() => setCurrentView('profile')} 
            className="hover:opacity-60 transition-opacity cursor-pointer"
            title="Shop - Manager Profile & Dividends"
          >
            Shop
          </button>
        </div>

        {/* Desktop CTA (Right) */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={() => setCurrentView('rules')}
            className="text-[23px] text-black underline underline-offset-2 hover:opacity-60 transition-opacity cursor-pointer"
          >
            Get in touch
          </button>

          {authenticated ? (
            <button
              onClick={logout}
              className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl border border-black/20 hover:bg-black/5 text-black transition-colors cursor-pointer"
              title="Click to disconnect"
            >
              {userWallet.slice(0, 6)}...{userWallet.slice(-4)}
            </button>
          ) : (
            <button
              onClick={login}
              className="text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl bg-black text-white hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex md:hidden flex-col justify-center items-center w-8 h-8 gap-[5px] z-50 focus:outline-none cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          <span className={`w-6 h-[2px] bg-black transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`w-6 h-[2px] bg-black transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-[2px] bg-black transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>

        {/* Full-screen Mobile Navigation Overlay */}
        <div className={`fixed inset-0 z-[49] bg-white/95 backdrop-blur-sm transition-opacity duration-300 md:hidden flex flex-col justify-center px-8 py-12 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col space-y-6 text-2xl font-medium text-black">
            <button 
              onClick={() => { setCurrentView('overview'); setIsMobileMenuOpen(false); }} 
              className="text-left hover:opacity-60 cursor-pointer"
            >
              Overview
            </button>
            <button 
              onClick={() => { setCurrentView('team'); setIsMobileMenuOpen(false); }} 
              className="text-left hover:opacity-60 cursor-pointer flex items-center justify-between"
            >
              <span>Labs</span>
              <span className="text-xs font-mono opacity-50">Squad Builder</span>
            </button>
            <button 
              onClick={() => { setCurrentView('fixtures'); setIsMobileMenuOpen(false); }} 
              className="text-left hover:opacity-60 cursor-pointer flex items-center justify-between"
            >
              <span>Studio</span>
              <span className="text-xs font-mono opacity-50">Live Fixtures</span>
            </button>
            <button 
              onClick={() => { setCurrentView('leaderboard'); setIsMobileMenuOpen(false); }} 
              className="text-left hover:opacity-60 cursor-pointer flex items-center justify-between"
            >
              <span>Openings</span>
              <span className="text-xs font-mono opacity-50">Leaderboard</span>
            </button>
            <button 
              onClick={() => { setCurrentView('profile'); setIsMobileMenuOpen(false); }} 
              className="text-left hover:opacity-60 cursor-pointer flex items-center justify-between"
            >
              <span>Shop</span>
              <span className="text-xs font-mono opacity-50">Manager Profile</span>
            </button>
            <button 
              onClick={() => { setCurrentView('rules'); setIsMobileMenuOpen(false); }} 
              className="text-left underline underline-offset-4 hover:opacity-60 cursor-pointer"
            >
              Get in touch (Rules & Info)
            </button>

            {authenticated ? (
              <button 
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="text-left text-sm font-mono text-neutral-600 hover:text-black mt-4 pt-4 border-t border-neutral-200"
              >
                Disconnect ({userWallet.slice(0, 6)}...{userWallet.slice(-4)})
              </button>
            ) : (
              <button 
                onClick={() => { login(); setIsMobileMenuOpen(false); }}
                className="text-left text-sm font-mono font-bold text-emerald-600 hover:text-emerald-700 mt-4 pt-4 border-t border-neutral-200"
              >
                Connect Wallet →
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. Background Video Component (with Native Scrubbing) */}
      <div className="order-last lg:order-none relative lg:absolute lg:inset-0 lg:z-0 overflow-hidden pointer-events-none w-full aspect-square md:aspect-video lg:aspect-auto lg:h-full bg-neutral-50 lg:bg-transparent">
        {/* Loading animation overlay while video is buffering */}
        {(!isVideoLoaded || isVideoBuffering) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-neutral-50/70 backdrop-blur-xs transition-opacity duration-300">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-neutral-300 border-t-black animate-spin" />
              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
            </div>
            <span className="text-xs font-mono text-neutral-600 mt-3 tracking-wide">
              Loading video experience...
            </span>
          </div>
        )}

        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-right lg:object-right-bottom transition-opacity duration-700"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260601_110537_3a579fa0-7bbc-4d94-9d25-0e816c7840f5.mp4"
        />
      </div>

      {/* 5. Content Layout Container */}
      <div className="relative z-10 flex flex-col order-first lg:order-none w-full bg-white lg:bg-transparent pb-8 lg:pb-0 lg:min-h-screen">
        <main id="spade-hero" className="w-full max-w-7xl mx-auto px-6 py-12 pt-28 sm:pt-36 flex-1 flex flex-col justify-center">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Typewriter, Description, Service Pills, Status Banner */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
              
              {/* 6. Typewriter Hook and Headline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-5xl md:text-6xl lg:text-[76px] font-normal tracking-tight text-black leading-[1.08] mb-8 select-none w-full whitespace-pre-wrap">
                  {displayed}
                  {!done && (
                    <span className="inline-block w-[2px] h-[1.1em] bg-black align-middle ml-[2px] animate-blink" />
                  )}
                </h1>
              </motion.div>

              {/* 7. Secondary Description Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <p className="text-lg md:text-xl text-[#5A635A] leading-relaxed font-normal mb-8 max-w-2xl">
                  Whether you have questions, feedback, <br /> drop us a message and we'll get back to you as soon as possible.
                </p>

                {/* Core FPL Stock Game Narrative & Info Badge */}
                <div className="mb-12 inline-flex flex-wrap items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FAFBF9] border border-[#EAECE9] text-xs font-mono text-neutral-800 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold">GAMEWEEK {activeGameweek?.gameweek || 4} ACTIVE</span>
                  <span className="text-neutral-300">•</span>
                  <span>100K $FPLS Stake</span>
                  <span className="text-neutral-300">•</span>
                  <span>£80.0M Cap</span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-purple-700 font-bold">GME Stock Yield on Pons</span>
                </div>
              </motion.div>

              {/* 8. Interactive Multi-Select Service Pills */}
              <div className="space-y-4 max-w-2xl">
                <div>
                  <h3 className="text-2xl font-medium tracking-tight mb-2 text-black">
                    What sort of service?
                  </h3>
                  <p className="opacity-85 text-[#738273] mb-8 text-sm">
                    Select all that apply
                  </p>
                </div>

                {/* Multi-Select Pills List */}
                <div className="flex flex-wrap gap-3">
                  {["Brand", "Digital", "Campaign", "Other"].map((svc) => {
                    const isActive = services.includes(svc);
                    return (
                      <motion.button
                        key={svc}
                        onClick={() => toggleService(svc)}
                        whileTap={{ scale: 0.96 }}
                        className={`px-6 py-2.5 rounded-full text-base font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer select-none ${
                          isActive
                            ? 'bg-[#1C2E1E] text-white shadow-md shadow-emerald-950/5 transform'
                            : 'bg-white text-[#1C2E1E] border border-[#F1F3F1] hover:bg-[#F1F3F1]/55'
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            <Check className="w-4 h-4 text-emerald-400" />
                          </motion.span>
                        )}
                        <span>{svc}</span>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Contingent Feedback Status Banner */}
                <div className="pt-4">
                  <AnimatePresence mode="wait">
                    {services.length === 0 ? (
                      <motion.p
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="italic text-xs text-neutral-600"
                      >
                        Please click to select services above.
                      </motion.p>
                    ) : (
                      <motion.div
                        key="active"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-[#FAFBF9] border border-[#EAECE9] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="text-sm text-[#1C2E1E] font-medium">
                          Ready to inquire about: <strong className="font-bold text-black">{services.join(", ")}</strong>
                        </div>
                        <button
                          onClick={() => setCurrentView('team')}
                          className="inline-flex items-center gap-2 text-[#4D6D47] hover:text-[#1C2E1E] uppercase text-xs font-bold tracking-wider transition-colors cursor-pointer"
                        >
                          <span>Let's Go</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

            </div>

            {/* Right Column: INCORPORATE OUR VECTOR JERSEYS IN THE DESIGN */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="w-full max-w-sm rounded-3xl p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-[#EAECE9] shadow-xl relative overflow-hidden"
              >
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Vector Jersey Kit Deck
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-700 border border-purple-500/20">
                    Official PL Colors
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
                    initial={{ scale: 0.85, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="transform hover:scale-105 transition-transform cursor-pointer"
                  >
                    <VectorKit
                      player={{
                        id: activeStar.id,
                        squad_number: activeStar.num,
                        web_name: activeStar.name.split(' ')[1] || activeStar.name,
                        second_name: activeStar.name.split(' ')[1] || activeStar.name,
                        team_code: activeStar.team === 'MCI' ? 43 : activeStar.team === 'ARS' ? 3 : activeStar.team === 'CHE' ? 8 : 14
                      }}
                      shortName={activeStar.team}
                      className="w-24 h-28 sm:w-28 sm:h-32 drop-shadow-xl"
                    />
                  </motion.div>

                  <div className="mt-3 text-center">
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                      {activeStar.name}
                    </h4>
                    <div className="flex items-center justify-center gap-2 mt-1 text-xs">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold">
                        {activeStar.team} • #{activeStar.num}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-mono font-bold">
                        {activeStar.price}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 font-mono font-bold">
                        {activeStar.pts} PTS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Jersey Selector Tabs */}
                <div className="grid grid-cols-5 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {featuredStars.map((star, idx) => (
                    <button
                      key={star.id}
                      onClick={() => setSelectedJerseyIdx(idx)}
                      className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selectedJerseyIdx === idx
                          ? 'border-emerald-500 bg-emerald-500/10 scale-105 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-70'
                      }`}
                    >
                      <div className="text-[10px] font-bold font-mono text-slate-800 dark:text-slate-200">
                        {star.team}
                      </div>
                      <div className="text-[9px] text-slate-500">
                        #{star.num}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Draft Action CTA */}
                <div className="mt-4">
                  <button
                    onClick={() => {
                      if (onSelectPlayer) {
                        onSelectPlayer({
                          id: activeStar.id,
                          web_name: activeStar.name.split(' ')[1] || activeStar.name,
                          second_name: activeStar.name.split(' ')[1] || activeStar.name,
                          element_type: activeStar.role === 'Forward' ? 4 : activeStar.role === 'Midfielder' ? 3 : 2,
                          now_cost: parseFloat(activeStar.price.replace('£', '').replace('M', '')) * 10,
                          team: activeStar.team === 'MCI' ? 15 : activeStar.team === 'ARS' ? 1 : activeStar.team === 'CHE' ? 6 : 14,
                          team_code: activeStar.team === 'MCI' ? 43 : activeStar.team === 'ARS' ? 3 : activeStar.team === 'CHE' ? 8 : 14,
                          squad_number: activeStar.num,
                        });
                      }
                      setCurrentView('team');
                    }}
                    className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 shadow-emerald-glow cursor-pointer"
                  >
                    <span>Draft {activeStar.name.split(' ')[1] || activeStar.name} to Squad</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>

          </div>

        </main>
      </div>

      {/* ----------------- ADDITIONAL SECTIONS MAINTAINING ALL APP INFORMATION ----------------- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 space-y-16">
        
        {/* 1. HOLDER BENEFIT • PONS LAUNCHPAD & GME STOCK YIELD BANNER */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 border border-purple-500/40 p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono font-bold">
                <span>💎 TOKEN HOLDER BENEFIT • PONS LAUNCHPAD</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Hold $FPLS, Earn Real Wall Street Equity
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Every trade on Pons Family incurs a <strong>3% trading tax</strong> that is automatically swapped into tokenized GameStop (<span className="text-purple-300 font-mono font-bold">$GME</span>) stock equity. 
                <strong> 100% of this tax is distributed directly to $FPLS token holders</strong>. You don't have to win matches to earn — simply hold $FPLS in your wallet and claim your stock dividends anytime directly on Pons!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <a
                href={PONS_CONFIG.dividendsClaimUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer whitespace-nowrap"
              >
                <span>Claim Dividends on Pons</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <a
                href={PONS_CONFIG.tokenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap"
              >
                <span>Trade $FPLS on Pons</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          </div>
        </section>

        {/* 2. KEY METRICS BAR */}
        <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-3 text-left">
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-xs">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Salary Cap</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">£80.0M</div>
            <div className="text-[10px] text-slate-400 mt-1">11 Real PL Players</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-xs">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Entry Stake</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">100K</div>
            <div className="text-[10px] text-slate-400 mt-1">$FPLS per Gameweek</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-xs">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Podium Pool</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-0.5">90%</div>
            <div className="text-[10px] text-slate-400 mt-1">60% 1st / 20% 2nd / 10% 3rd</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-xs">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Trading Tax</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">3%</div>
            <div className="text-[10px] text-slate-400 mt-1">Holder GME Dividends</div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 shadow-xs col-span-2 md:col-span-1">
            <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Burn Rate</div>
            <div className="text-xl md:text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">10%</div>
            <div className="text-[10px] text-slate-400 mt-1">Deflationary Burn</div>
          </div>
        </div>

        {/* 3. STAR PERFORMERS OF THE GAMEWEEK (4-4-2 TACTICAL FORMATION WITH VECTOR JERSEYS) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <div className="text-xs font-mono font-semibold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                Gameweek {activeGameweek?.gameweek || 4} Selection
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Star Performers (4-4-2 Formation)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                The highest-performing Premier League stars for this gameweek arranged in a classic 4-4-2 lineup rendered with our custom vector jerseys based on official match data.
              </p>
            </div>

            <button
              onClick={() => setCurrentView('team')}
              className="btn-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-emerald-glow"
            >
              <span>Build Your Own 11</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tactical Pitch with VectorKit Jerseys */}
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[520px] rounded-3xl overflow-hidden border-2 border-emerald-800/80 shadow-2xl bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 p-4 select-none">
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
                  title={`Click to add ${player.second_name || player.web_name} to your squad`}
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

        {/* 4. PREMIER LEAGUE LIVE NEWS FEED (WITH LOADING ANIMATION) */}
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-slate-800 hover:bg-neutral-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${newsLoading ? 'animate-spin' : ''}`} />
              <span>{newsLoading ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>

          {/* News Loading Animation or Content Grid */}
          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="card-modern p-5 space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
                  <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6" />
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
                  className="card-modern p-5 flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-lg transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{item.source || 'BBC Sport'}</span>
                      <span>{formatPubDate(item.pubDate)}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 group-hover:text-emerald-500">
                    <span className="font-medium">Read article</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

      </div>

    </div>
  );
};
