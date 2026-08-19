import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { FPLS_ABI, FPLGAME_ABI, FPLS_ADDRESS, FPLGAME_ADDRESS } from './config/contracts';
import { injected } from 'wagmi/connectors';
import { Users, Clock, TrendingUp, Calendar, Trophy, ArrowRight, User, BarChart3, Medal, Target, Home, Target as TeamIcon, Info, Sun, Moon, RotateCcw, Zap, LogIn, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import * as firebaseService from './firebaseService';
// Removed old injected font and style elements
const AnimatedTitle = ({
  title = "FPL.STOCKS",
  subtitle = ""
}) => {
  return <div className="relative">
    <motion.h1 initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 1.2,
      duration: 0.8,
      ease: "easeOut"
    }} className="text-3xl md:text-8xl font-black text-transparent bg-clip-text relative z-10 text-center uppercase" style={{
      backgroundImage: 'linear-gradient(180deg, #e0e0e0 0%, #a0a0a0 100%)',
      letterSpacing: '-2px'
    }}>
      {title}
      <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 1.8,
        duration: 0.5
      }} className="absolute -right-4 md:-right-8 top-0 md:top-4 text-emerald-glow">
        <div className="brand-dot mt-2 md:mt-4"></div>
      </motion.div>
    </motion.h1>
    {subtitle && <motion.div initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 1.5,
      duration: 0.6,
      ease: "easeOut"
    }} className="text-center mt-4 text-emerald-glow tracking-widest font-mono text-sm">
      {subtitle}
    </motion.div>}
  </div>;
};

const CountdownTimer = ({ deadlineTime }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!deadlineTime) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(deadlineTime).getTime() - now;
      setTimeLeft(distance > 0 ? distance : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [deadlineTime]);

  if (!deadlineTime) return null;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <div className="rh-card inline-flex flex-col items-center p-4 mb-4 relative overflow-hidden" style={{ borderColor: 'var(--emerald-muted)' }}>
      <div className="text-emerald-glow text-xs mb-2 uppercase font-bold tracking-widest relative z-10">
        {timeLeft > 0 ? 'GAMEWEEK DEADLINE' : 'GAMEWEEK LIVE'}
      </div>
      <div className="flex space-x-2 text-white font-mono text-3xl leading-none relative z-10">
        <div className="flex flex-col items-center">
          <span className="bg-black/50 px-3 py-2 rounded-md border border-[var(--border-light)]">{days.toString().padStart(2, '0')}</span>
          <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Days</span>
        </div>
        <span className="py-2 text-gray-600">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-black/50 px-3 py-2 rounded-md border border-[var(--border-light)]">{hours.toString().padStart(2, '0')}</span>
          <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Hrs</span>
        </div>
        <span className="py-2 text-gray-600">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-black/50 px-3 py-2 rounded-md border border-[var(--border-light)]">{minutes.toString().padStart(2, '0')}</span>
          <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Min</span>
        </div>
        <span className="py-2 text-gray-600">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-black/50 px-3 py-2 rounded-md border border-[var(--border-light)]">{seconds.toString().padStart(2, '0')}</span>
          <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Sec</span>
        </div>
      </div>
    </div>
  );
};
const SpotlightCard = ({
  children,
  className = "",
  ...props
}) => {

  return (
    <div className={`rh-card ${className}`} {...props}>
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};
const getHue = color => {
  const hues = {
    blue: 220,
    purple: 270,
    green: 120,
    red: 0,
    orange: 30,
    yellow: 50
  };
  return hues[color] || hues.blue;
};
const LoadingWave = ({
  bars = 5,
  message = "",
  messagePosition = "bottom",
  size = "md",
  color = "green"
}) => {
  const sizeVariants = {
    sm: {
      width: "w-1",
      height: "h-4"
    },
    md: {
      width: "w-2",
      height: "h-6"
    },
    lg: {
      width: "w-3",
      height: "h-8"
    }
  };
  const colorVariants = {
    green: "bg-green-400",
    blue: "bg-blue-400",
    purple: "bg-purple-400",
    yellow: "bg-yellow-400",
    red: "bg-red-400"
  };
  const currentSize = sizeVariants[size] || sizeVariants.md;
  const currentColor = colorVariants[color] || colorVariants.green;
  const MessageComponent = () => {
    if (!message) return null;
    return <motion.p initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} className="text-white font-semibold" >
      {message}
    </motion.p>;
  };
  const BarsContainer = () => <div className="flex items-center space-x-1">
    {Array.from({
      length: bars
    }).map((_, index) => <motion.div key={index} className={`${currentSize.width} ${currentSize.height} ${currentColor} rounded-sm`}  animate={{
      scaleY: [1, 1.5, 1]
    }} transition={{
      duration: 0.8,
      repeat: Infinity,
      delay: index * 0.1,
      ease: "easeInOut"
    }} />)}
  </div>;
  if (messagePosition === "left") {
    return <div className="flex items-center space-x-4">
      <MessageComponent />
      <BarsContainer />
    </div>;
  }
  if (messagePosition === "right") {
    return <div className="flex items-center space-x-4">
      <BarsContainer />
      <MessageComponent />
    </div>;
  }
  return <div className="flex flex-col items-center space-y-3">
    <BarsContainer />
    <MessageComponent />
  </div>;
};
const LimelightNav = ({ currentView, setCurrentView, isAdmin }) => {
  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'dashboard', label: 'DASHBOARD' },
    { id: 'team', label: 'TEAM BUILDER' },
    { id: 'profile', label: 'PROFILE' },
    ...(isAdmin ? [{ id: 'admin', label: 'ADMIN' }] : [])
  ];

  return (
    <nav className="flex items-center space-x-6 md:space-x-12 px-4 py-6 text-xs md:text-sm font-mono font-bold tracking-widest text-gray-500 overflow-x-auto w-full justify-center">
      {navItems.map(item => {
        const isActive = currentView === item.id;
        return (
          <button 
            key={item.id} 
            onClick={() => setCurrentView(item.id)}
            className={`transition-colors whitespace-nowrap pb-1 border-b-2 ${isActive ? 'text-white border-green-500' : 'hover:text-gray-300 border-transparent'}`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};
const AnimatedButton = ({
  children,
  onClick,
  disabled = false,
  className = "",
  color = "blue",
  hoverText,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const buttonText = hoverText || children;
  const colorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    yellow: "bg-yellow-500 hover:bg-yellow-600 text-black",
    red: "bg-red-600 hover:bg-red-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    gray: "bg-gray-600 hover:bg-gray-700"
  };
  const dotColors = {
    blue: "bg-blue-400",
    green: "bg-green-400",
    yellow: "bg-yellow-300",
    red: "bg-red-400",
    purple: "bg-purple-400",
    gray: "bg-gray-400"
  };
  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);
  return <button onClick={onClick} disabled={disabled} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseLeave} className={`relative overflow-hidden font-bold py-3 px-6 rounded-lg transition-all duration-300 group ${disabled ? 'bg-gray-600 cursor-not-allowed text-gray-300' : colorClasses[color]} ${className}`} style={{
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '18px',
    boxShadow: isPressed ? '2px 2px 0px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,0,0.4)' : '4px 4px 0px rgba(0,0,0,0.8), 0 0 15px rgba(255,255,0,0.2)',
    transform: `scale(${isPressed ? '0.98' : '1'}) translateY(${isPressed ? '2px' : '0px'})`,
    textShadow: '1px 1px 0px #000'
  }} {...props}>
    { }
    {!disabled && <div className={`absolute top-1/2 left-1/2 w-2 h-2 ${dotColors[color]} rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 group-hover:scale-[30] opacity-20 group-hover:opacity-30`} />}
    { }
    <span className={`relative z-10 transition-all duration-300 group-hover:transform group-hover:translate-x-8 group-hover:opacity-0 ${color === 'yellow' ? 'text-black' : 'text-white'}`}>
      {children}
    </span>
    { }
    {!disabled && <span className={`absolute inset-0 z-10 flex items-center justify-center transition-all duration-300 transform translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 ${color === 'yellow' ? 'text-black' : 'text-white'}`}>
      {buttonText}
      <ArrowRight className="w-4 h-4 ml-2" style={{
        filter: 'drop-shadow(1px 1px 0px #000)'
      }} />
    </span>}
  </button>;
};
const ThemeToggle = ({
  theme,
  setTheme
}) => {
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };
  return <button onClick={toggleTheme} className={`relative w-20 h-10 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-500 ease-in-out
        ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-blue-300/50'}
      `} >
    <motion.div className="absolute top-1 left-1 w-8 h-8 bg-white rounded-full flex items-center justify-center" layout transition={{
      type: 'spring',
      stiffness: 500,
      damping: 40
    }} >
      {theme === 'dark' ? <Moon className="w-5 h-5 text-purple-500" /> : <Sun className="w-5 h-5 text-yellow-500" />}
    </motion.div>
    <div className="w-full flex justify-between px-2">
      <Moon className={`w-5 h-5 transition-colors ${theme === 'dark' ? 'text-yellow-300 opacity-100' : 'text-gray-500 opacity-50'}`} />
      <Sun className={`w-5 h-5 transition-colors ${theme === 'light' ? 'text-yellow-800 opacity-100' : 'text-gray-400 opacity-50'}`} />
    </div>
  </button>;
};
const FormationDock = ({
  selectedFormation,
  setSelectedFormation
}) => {
  const formations = [{
    value: '4-4-2',
    label: 'Balanced'
  }, {
    value: '4-3-3',
    label: 'Attacking'
  }, {
    value: '3-5-2',
    label: 'Midfield Heavy'
  }, {
    value: '3-4-3',
    label: 'Ultra Attack'
  }, {
    value: '5-3-2',
    label: 'Defensive'
  }, {
    value: '5-4-1',
    label: 'Ultra Defensive'
  }];
  return <div className="flex justify-center items-center gap-2 flex-wrap">
    {formations.map(formation => {
      const isActive = selectedFormation === formation.value;
      return <button key={formation.value} onClick={() => setSelectedFormation(formation.value)} className={`relative px-3 py-1 md:px-4 md:py-1 border transition-colors duration-300 font-mono text-[9px] md:text-[10px] tracking-widest ${isActive ? 'bg-white text-black border-white' : 'bg-transparent text-[#666] border-[#1A1A1A] hover:border-[#333] hover:text-white'}`}>
        <span className="font-bold">
          {formation.value}
        </span>
        <motion.div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded border border-green-700/50 pointer-events-none"  initial={{
          opacity: 0,
          y: 10
        }} whileHover={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.2
        }}>
          {formation.label}
        </motion.div>
      </button>;
    })}
  </div>;
};
const LandingHero = ({ setCurrentView, activeGameweek }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-6 pt-16 pb-32">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full flex flex-col items-center min-h-[60vh] justify-center"
      >
        <div className="absolute inset-0 pointer-events-none z-[-1] opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(0, 255, 106, 0.4) 0%, transparent 70%)', width: '600px', height: '600px', left: '50%', transform: 'translate(-50%, -30%)' }}>
          <div className="w-full h-full border border-[var(--border-light)] rounded-full opacity-30"></div>
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[var(--border-light)] opacity-30"></div>
          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-[var(--border-light)] opacity-30"></div>
        </div>

        <h1 className="text-6xl md:text-[110px] leading-[0.85] font-black text-white uppercase tracking-tighter text-center mb-8 font-sans">
          WINNER<br/>TAKES ALL
        </h1>
        
        <p className="text-[var(--emerald-glow)] font-mono text-[10px] md:text-xs uppercase tracking-[0.25em] text-center max-w-lg leading-relaxed mb-12">
          The world's first deflationary fantasy premier league game powered by Robinhood Chain.
        </p>
        
        <button 
          onClick={() => setCurrentView('team')}
          className="border border-white hover:border-[var(--emerald-glow)] text-white hover:text-[var(--emerald-glow)] px-8 py-3 text-xs font-mono font-bold tracking-widest uppercase transition-colors mb-6"
        >
          BUILD SQUAD
        </button>

        {activeGameweek && (
          <div className="flex items-center gap-3 bg-[#0a0a0a] border border-[#1a1a1a] px-4 py-2 rounded-full">
            <div className="w-2 h-2 rounded-full bg-[var(--emerald-glow)] animate-pulse"></div>
            <span className="text-[var(--emerald-glow)] font-mono text-[10px] uppercase tracking-widest">Gameweek {activeGameweek.gameweek} Active</span>
          </div>
        )}
      </motion.div>

      {/* How it Works Sections */}
      <div className="w-full mt-16 space-y-32">
        
        {/* Section 1: Entry & Pool */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center gap-12"
        >
          <div className="flex-1 space-y-6">
            <h2 className="text-[var(--emerald-glow)] font-mono text-xs tracking-[0.2em] uppercase">01 / The Entry</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">Stake to Play</h3>
            <p className="text-gray-400 font-mono text-xs leading-relaxed max-w-md">
              Pay the 100,000 $test entry fee to join the gameweek. 90% of all entries form the winner-takes-all prize pool. The remaining 10% is burned forever, making the token deflationary.
            </p>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-[var(--emerald-glow)] opacity-10 blur-2xl rounded-full"></div>
            <img src="/fpl_entry.jpg" alt="Terminal Entry" className="relative z-10 w-full border border-[#1A1A1A] rounded-lg shadow-2xl opacity-90 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
          </div>
        </motion.div>

        {/* Section 2: Budget */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row-reverse items-center gap-12"
        >
          <div className="flex-1 space-y-6 md:pl-12">
            <h2 className="text-yellow-500 font-mono text-xs tracking-[0.2em] uppercase">02 / The Budget</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">Manage £70M</h3>
            <p className="text-gray-400 font-mono text-xs leading-relaxed max-w-md">
              You have exactly £70.0M to build your dream team of 11 players. Player prices match the official Fantasy Premier League data. Spend wisely to maximize your point potential.
            </p>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-yellow-500 opacity-10 blur-2xl rounded-full"></div>
            <img src="/fpl_budget.jpg" alt="Budget Terminal" className="relative z-10 w-full border border-[#1A1A1A] rounded-lg shadow-2xl opacity-90 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
          </div>
        </motion.div>

        {/* Section 3: Formation & Captain */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-center gap-12"
        >
          <div className="flex-1 space-y-6">
            <h2 className="text-[var(--emerald-glow)] font-mono text-xs tracking-[0.2em] uppercase">03 / Tactics</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none">Formations & Captains</h3>
            <p className="text-gray-400 font-mono text-xs leading-relaxed max-w-md">
              Choose from 6 dynamic formations (e.g. 3-4-3, 4-4-2). Select your Captain carefully—they score double points for the gameweek based on their real-life performance via Chainlink Oracle data.
            </p>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-[var(--emerald-glow)] opacity-10 blur-2xl rounded-full"></div>
            <img src="/fpl_pitch.jpg" alt="Pitch Terminal" className="relative z-10 w-full border border-[#1A1A1A] rounded-lg shadow-2xl opacity-90 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
          </div>
        </motion.div>

      </div>
    </div>
  );
};

function App() {
  const { address: userWallet, isConnected: authenticated } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const { data: fplsBalanceRaw, refetch: refetchBalance } = useReadContract({
    address: FPLS_ADDRESS,
    abi: FPLS_ABI,
    functionName: 'balanceOf',
    args: [userWallet],
    query: { enabled: !!userWallet }
  });

  const fplsBalance = fplsBalanceRaw ? (Number(fplsBalanceRaw) / 1e18).toFixed(0) : '0';

  const { writeContractAsync } = useWriteContract();
  
  const [trendingTokens, setTrendingTokens] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Toast notification removed
  }, []);
  const login = () => {
    connect({ connector: injected() });
  };
  
  const logout = () => {
    disconnect();
  };
  
  // Mock trending tokens for Robinhood Chain
  useEffect(() => {
    setTrendingTokens([
      { symbol: 'AAPL', name: 'Apple Inc.', price: '$189.20', change: '+1.2%' },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: '$210.45', change: '-0.5%' },
      { symbol: 'NVDA', name: 'NVIDIA Corp', price: '$850.10', change: '+3.4%' },
      { symbol: 'RH', name: 'Robinhood', price: '$22.50', change: '+5.1%' }
    ]);
  }, []);
  const [currentView, setCurrentView] = useState('home');
  const [activeGameweek, setActiveGameweek] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [rawLeaderboard, setRawLeaderboard] = useState([]);
  const [entriesCount, setEntriesCount] = useState(0);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [positions, setPositions] = useState([]);
  const [fixtures, setFixtures] = useState([]);
  const [selectedFixtureGameweek, setSelectedFixtureGameweek] = useState(1);
  const [selectedGameweekFixtures, setSelectedGameweekFixtures] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [teamBudget, setTeamBudget] = useState(700);
  const [captain, setCaptain] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userEntries, setUserEntries] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    club: '',
    position: '',
    minPrice: '',
    maxPrice: ''
  });
  const [sortOption, setSortOption] = useState({
    field: 'total_points',
    direction: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showFixtures, setShowFixtures] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [theme, setTheme] = useState('dark');
  const [selectedFormation, setSelectedFormation] = useState('4-3-3');
  const [, setHasAccess] = useState(false);
  const [userInviteCode, setUserInviteCode] = useState(null);
  const [adminInviteCodes, setAdminInviteCodes] = useState([]);
  const [generateCount, setGenerateCount] = useState(5);
  const [gameweekDeadline, setGameweekDeadline] = useState(null);
  const [isAfterDeadline, setIsAfterDeadline] = useState(false);
  const [gw1Countdown, setGw1Countdown] = useState('Loading...');
  const [liveFixtures, setLiveFixtures] = useState([]);
  const [fplTeams, setFplTeams] = useState({});
  const [targetDate, setTargetDate] = useState(null);
  const [livePoints, setLivePoints] = useState({});

  useEffect(() => {
    const fetchFplData = async () => {
      try {
        const bootstrapRes = await fetch('/api/fpl?path=bootstrap-static/');
        const bootstrapData = await bootstrapRes.json();
        
        const teamsMap = {};
        bootstrapData.teams.forEach(t => {
          teamsMap[t.id] = { name: t.short_name, code: t.code };
        });
        setFplTeams(teamsMap);

        const nextGw = bootstrapData.events.find(e => e.is_next) || bootstrapData.events.find(e => e.id === 1) || bootstrapData.events[0];
        if (nextGw) {
          setTargetDate(new Date(nextGw.deadline_time).getTime());
          
          const fixturesRes = await fetch('/api/fpl?path=fixtures/');
          const fixturesData = await fixturesRes.json();
          const nextGwFixtures = fixturesData.filter(f => f.event === nextGw.id).slice(0, 3);
          setLiveFixtures(nextGwFixtures);
        }

        const currentGw = bootstrapData.events.find(e => e.is_current);
        if (currentGw) {
          const liveRes = await fetch(`/api/fpl?path=event/${currentGw.id}/live/`);
          if (liveRes.ok) {
            const liveData = await liveRes.json();
            const pointsMap = {};
            liveData.elements.forEach(el => {
              pointsMap[el.id] = el.stats.total_points;
            });
            setLivePoints(pointsMap);
          }
        }
      } catch (err) {
        console.error("Failed to fetch FPL API data:", err);
      }
    };
    fetchFplData();
  }, []);

  useEffect(() => {
    if (!targetDate) return;
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;
      if (distance < 0) {
        setGw1Countdown('GAMEWEEK STARTED');
        return;
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setGw1Countdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };
    const interval = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(interval);
  }, [targetDate]);
  const [isGameweekStarted, setIsGameweekStarted] = useState(false);
  const [claimableWinnings, setClaimableWinnings] = useState([]);
  const [adminGames, setAdminGames] = useState([]);
  const [selectedShareTopic, setSelectedShareTopic] = useState('gameweek');
  const [generatedShareMessage, setGeneratedShareMessage] = useState('');
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const currentUserEntry = activeGameweek ? userEntries.find(e => e.gameId === activeGameweek.id) : null;
  const isTeamSubmitted = !!currentUserEntry;
  // Real-time Firestore listeners (replaces socket.io)
  useEffect(() => {
    setIsConnected(true);
    // Listen for active game changes
    const unsubGames = firebaseService.subscribeToCollection('games', { status: 'active' }, (games) => {
      if (games.length > 0) {
        const activeGame = games[0];
        activeGame.entryFee = 100000;
        setActiveGameweek(prev => {
          if (!prev || prev.id !== activeGame.id || prev.prizePool !== activeGame.prizePool || prev.status !== activeGame.status) {
            return activeGame;
          }
          return prev;
        });
      }
    });
    return () => {
      unsubGames();
    };
  }, []);
  useEffect(() => {
    loadActiveGameweek();
    loadPlayers();
    loadFixtures();
  }, []);
  useEffect(() => {
    if (userWallet) {
      checkUserAccess();
      setHasAccess(true);
      loadUserData();
    }
  }, [userWallet]);
  useEffect(() => {
    if (activeGameweek?.id) {
      loadLeaderboard(activeGameweek.id);
    }
  }, [activeGameweek?.id]);
  useEffect(() => {
    if (activeGameweek?.status === 'active' && activeGameweek?.gameweek && isGameweekStarted) {
      fetchLivePoints(activeGameweek.gameweek);
      fetchFinalScores();
      const interval = setInterval(() => {
        fetchLivePoints(activeGameweek.gameweek);
        fetchFinalScores();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [activeGameweek?.id, activeGameweek?.status, activeGameweek?.gameweek, isGameweekStarted]);

  useEffect(() => {
    if (rawLeaderboard && rawLeaderboard.length > 0) {
      if (players.length > 0 && isGameweekStarted) {
        const liveLeaderboard = calculateLiveLeaderboard(rawLeaderboard, players, livePoints);
        setLeaderboard(liveLeaderboard);
        setUserEntries(prevEntries => {
          return prevEntries.map(entry => {
            const liveEntry = liveLeaderboard.find(le => le.id === entry.id);
            return liveEntry ? liveEntry : entry;
          });
        });
      } else {
        const zeroPointsEntries = rawLeaderboard.map(entry => ({
          ...entry,
          points: 0
        }));
        setLeaderboard(zeroPointsEntries);
      }
    } else if (rawLeaderboard.length > 0) {
      const sortedEntries = [...rawLeaderboard].sort((a, b) => (b.points || 0) - (a.points || 0));
      setLeaderboard(sortedEntries);
    }
  }, [rawLeaderboard, players, activeGameweek?.status, isGameweekStarted]);
  useEffect(() => {
    if (!userWallet) return;
    const interval = setInterval(() => {
      if (activeGameweek?.id) {
        loadLeaderboard(activeGameweek.id);
        loadActiveGameweek();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [userWallet, activeGameweek?.id]);
  useEffect(() => {
    if (isTeamSubmitted && players.length > 0) {
      try {
        const teamIds = JSON.parse(currentUserEntry.team);
        const teamPlayers = players.filter(p => teamIds.includes(p.id));
        const sortedTeam = [...teamPlayers].sort((a, b) => a.element_type - b.element_type);
        setSelectedTeam(sortedTeam);
        const captainPlayer = teamPlayers.find(p => p.id.toString() === currentUserEntry.captain);
        setCaptain(captainPlayer);
        const teamCost = teamPlayers.reduce((acc, p) => acc + p.now_cost, 0);
        setTeamBudget(600 - teamCost);
      } catch (e) {
        console.error("Error parsing submitted team:", e);
      }
    }
  }, [isTeamSubmitted, players, currentUserEntry?.id]);
  useEffect(() => {
    if (activeGameweek && fixtures.length > 0) {
      setSelectedFixtureGameweek(activeGameweek.gameweek);
      calculateGameweekDeadline();
      checkGameweekStarted();
    }
  }, [activeGameweek, fixtures]);
  useEffect(() => {
    if (fixtures.length > 0) {
      loadSelectedGameweekFixtures();
    }
  }, [selectedFixtureGameweek, fixtures]);
  useEffect(() => {
    if (gameweekDeadline) {
      const interval = setInterval(() => {
        const now = new Date();
        setIsAfterDeadline(now > gameweekDeadline);
        checkGameweekStarted();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameweekDeadline]);
  const handleGameweekUpdate = data => {
    setActiveGameweek(data);
  };
  const handleLeaderboardUpdate = data => {
    setRawLeaderboard(data);
  };
  const handleEntriesUpdate = data => {
    setEntriesCount(data.count);
    if (activeGameweek) {
      setActiveGameweek(prev => ({
        ...prev,
        prizePool: data.count * (prev?.entryFee || 100000)
      }));
    }
    if (activeGameweek?.id) {
      loadLeaderboard(activeGameweek.id);
    }
  };
  const handleTeamSubmitted = data => {
    if (activeGameweek?.id && data.gameId === activeGameweek.id) {
      loadLeaderboard(activeGameweek.id);
      loadActiveGameweek();
      loadUserData();
    }
  };
  const handlePrizePoolUpdate = data => {
    if (activeGameweek?.id === data.gameId) {
      setActiveGameweek(prev => ({
        ...prev,
        prizePool: data.prizePool
      }));
      setEntriesCount(data.entries || entriesCount);
    }
  };
  const handleGameFinalized = data => {
    if (activeGameweek?.id === data.gameId) {
      loadActiveGameweek();
      loadLeaderboard(activeGameweek.id);
      if (userWallet) {
        loadUserData();
      }
    }
  };
  const calculateGameweekDeadline = () => {
    if (!activeGameweek || !fixtures.length) {
      setGameweekDeadline(null);
      setIsAfterDeadline(false);
      return;
    }
    const gameweekFixtures = fixtures.filter(fixture => fixture.gameweek === activeGameweek.gameweek && fixture.kickoffTime);
    if (gameweekFixtures.length === 0) {
      setGameweekDeadline(null);
      setIsAfterDeadline(false);
      return;
    }
    const earliestKickoff = gameweekFixtures.reduce((earliest, fixture) => {
      const kickoffTime = new Date(fixture.kickoffTime);
      return !earliest || kickoffTime < earliest ? kickoffTime : earliest;
    }, null);
    if (earliestKickoff) {
      const deadline = new Date(earliestKickoff.getTime() - 60 * 60 * 1000);
      setGameweekDeadline(deadline);
      setIsAfterDeadline(new Date() > deadline);
    } else {
      setGameweekDeadline(null);
      setIsAfterDeadline(false);
    }
  };
  const checkGameweekStarted = () => {
    if (!activeGameweek || !fixtures.length) {
      setIsGameweekStarted(false);
      return;
    }
    const gameweekFixtures = fixtures.filter(fixture => fixture.gameweek === activeGameweek.gameweek && fixture.kickoffTime);
    if (gameweekFixtures.length === 0) {
      setIsGameweekStarted(false);
      return;
    }
    const now = new Date();
    const hasStartedFixture = gameweekFixtures.some(fixture => {
      const kickoffTime = new Date(fixture.kickoffTime);
      return now >= kickoffTime;
    });
    setIsGameweekStarted(hasStartedFixture);
  };
  const formatDeadline = deadline => {
    if (!deadline) return '';
    const now = new Date();
    const timeDiff = deadline.getTime() - now.getTime();
    if (timeDiff <= 0) {
      return 'Deadline passed';
    }
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(timeDiff % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
    const minutes = Math.floor(timeDiff % (1000 * 60 * 60) / (1000 * 60));
    const seconds = Math.floor(timeDiff % (1000 * 60) / 1000);
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };
  const checkUserAccess = async () => {
    try {
      console.log('Checking admin status for wallet:', userWallet);
      const walletString = typeof userWallet === 'string' ? userWallet : userWallet?.toBase58?.() || String(userWallet);
      const adminStatus = userWallet && userWallet.toLowerCase() === '0xF027b3FC259c02949f9724E5099f86C177949039'.toLowerCase();
      console.log('Admin status result:', adminStatus);
      setIsAdmin(adminStatus);
      if (adminStatus) {
        loadAdminInviteCodes();
        loadAdminGames();
      }
    } catch (error) {
      console.error('Error checking user access:', error);
    }
  };
  const loadUserData = async () => {
    try {
      const stats = await firebaseService.listEntities('user_stats', {
        userId: userWallet
      });
      setUserStats(stats[0] || null);
      const entries = await firebaseService.listEntities('entries', {
        userId: userWallet
      });
      const sortedEntries = entries.sort((a, b) => b.createdAt - a.createdAt);
      setUserEntries(sortedEntries);
      const createdCodes = await firebaseService.listEntities('invite_codes', {
        createdBy: userWallet
      });
      const activeCodes = createdCodes.filter(code => !code.used).sort((a, b) => b.createdAt - a.createdAt);
      if (activeCodes.length > 0) {
        setUserInviteCode(activeCodes[0]);
      }
      await loadClaimableWinnings();
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };
  const loadClaimableWinnings = async () => {
    if (!userWallet) return;
    try {
      const allGames = await firebaseService.listEntities('games');
      const finishedWinnerGames = allGames.filter(game => game.status === 'finished' && game.winnerId === userWallet);
      const claimableGames = [];
      for (const game of finishedWinnerGames) {
        const existingPayout = await firebaseService.listEntities('payouts', {
          gameId: game.id
        });
        if (existingPayout.length === 0) {
          claimableGames.push(game);
        }
      }
      setClaimableWinnings(claimableGames);
    } catch (error) {
      console.error('Error loading claimable winnings:', error);
    }
  };
  const claimSpecificPrize = async gameId => {
    if (!userWallet) return;
    setIsLoading(true);
    setLoadingMessage('Processing prize claim...');
    try {
      await firebaseService.createEntity('payouts', {
        gameId: gameId,
        winnerId: userWallet
      });
      alert('Prize claimed successfully!');
      await loadClaimableWinnings();
      await loadUserData();
      if (activeGameweek?.id === gameId) {
        await loadActiveGameweek();
      }
    } catch (error) {
      console.error('Error claiming prize:', error);
      alert('Error claiming prize. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  const generateNewInviteCode = async () => {
    try {
      await firebaseService.createEntity('invite_codes', {
        createdBy: userWallet
      });
      await checkUserAccess();
    } catch (error) {
      console.error('Error generating invite code:', error);
    }
  };
  const generateAdminInviteCodes = async () => {
    if (!userWallet || !isAdmin) return;
    try {
      for (let i = 0; i < generateCount; i++) {
        await firebaseService.createEntity('invite_codes', {
          createdBy: userWallet
        });
      }
      await loadAdminInviteCodes();
      alert(`Successfully generated ${generateCount} invite codes!`);
    } catch (error) {
      console.error('Error generating invite codes:', error);
      alert('Error generating invite codes. Please try again.');
    }
  };
  const clearAndRepopulateFixtures = async () => {
    if (!userWallet || !isAdmin) return;
    const confirmed = window.confirm('This will delete ALL fixtures and reload them from the API. Are you sure?');
    if (!confirmed) return;
    setIsLoading(true);
    setLoadingMessage('Clearing and repopulating fixtures...');
    try {
      const allFixtures = await firebaseService.listEntities('fixtures');
      console.log(`Found ${allFixtures.length} fixtures to delete`);
      for (const fixture of allFixtures) {
        await firebaseService.deleteEntity('fixtures', fixture.id);
      }
      setFixtures([]);
      setSelectedGameweekFixtures([]);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await fetchAndCacheFixtures();
      alert('Fixtures cleared and repopulated successfully!');
    } catch (error) {
      console.error('Error clearing and repopulating fixtures:', error);
      alert('Error clearing and repopulating fixtures. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  const loadAdminInviteCodes = async () => {
    if (!userWallet || !isAdmin) return;
    try {
      const allCodes = await firebaseService.listEntities('invite_codes', {
        createdBy: userWallet
      });
      setAdminInviteCodes(allCodes.sort((a, b) => b.createdAt - a.createdAt));
    } catch (error) {
      console.error('Error loading admin invite codes:', error);
    }
  };
  const loadAdminGames = async () => {
    try {
      const games = await firebaseService.listEntities('games');
      setAdminGames(games.sort((a, b) => b.gameweek - a.gameweek));
    } catch (error) {
      console.error('Error loading admin games:', error);
    }
  };
  const autoStartNewGameweek = async () => {
    console.log("Attempting to auto-start new gameweek...");
    try {
      const response = await fetch('/api/fpl?path=bootstrap-static/');
      const data = await response.json();
      const currentFplEvent = data.events.find(event => event.is_current === true);
      if (!currentFplEvent) {
        console.log('FPL API: No current gameweek to auto-start.');
        return;
      }
      const currentGameweekNumber = currentFplEvent.id;
      console.log(`Attempting to create gameweek ${currentGameweekNumber} if it doesn't exist...`);
      const newGame = await firebaseService.createEntity('games', {
        gameweek: currentGameweekNumber,
        status: 'active',
        prizePool: 0,
        entryFee: 100000
      });
      // Firestore onSnapshot handles real-time updates automatically
      console.log(`Gameweek ${currentGameweekNumber} auto-started successfully.`);
      setActiveGameweek(newGame);
    } catch (error) {
      console.log('Could not auto-start new gameweek (it might already exist or FPL API is down). Re-checking for active game.');
      const games = await firebaseService.listEntities('games', {
        status: 'active'
      });
      if (games.length > 0) {
        setActiveGameweek(games[0]);
      }
    }
  };
  const loadActiveGameweek = async () => {
    try {
      console.log('--- loadActiveGameweek START ---');
      const games = await firebaseService.listEntities('games', {
        status: 'active'
      });
      if (games.length > 0) {
        console.log('Found active game:', games[0].id);
        let activeGame = games[0];
        activeGame.entryFee = 100000;
        const entries = await firebaseService.listEntities('entries', {
          gameId: activeGame.id
        });
        const currentEntriesCount = entries.length;
        if (currentEntriesCount > 0) {
          activeGame.prizePool = currentEntriesCount * 100000;
        }
        setActiveGameweek(prev => {
          if (!prev || prev.id !== activeGame.id || prev.prizePool !== activeGame.prizePool) {
            return activeGame;
          }
          return prev;
        });
      } else {
        console.log('No active gameweek found. Attempting to auto-start.');
        setActiveGameweek(null);
        await autoStartNewGameweek();
      }
      console.log('--- loadActiveGameweek END ---');
    } catch (error) {
      console.error('Error loading active gameweek:', error);
    }
  };
  const loadLeaderboard = async gameId => {
    if (!gameId) return;
    try {
      const entries = await firebaseService.listEntities('entries', {
        gameId: gameId
      });
      setRawLeaderboard(entries);
      setEntriesCount(entries.length);
      const currentGame = await firebaseService.getEntity('games', gameId);
      if (currentGame) {
        const calculatedPrizePool = entries.length * 100000;
        if (calculatedPrizePool !== currentGame.prizePool) {
          setActiveGameweek(prev => prev && prev.id === gameId ? {
            ...prev,
            prizePool: calculatedPrizePool
          } : prev);

        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };
  const finalizeGameweek = async () => {
    if (!activeGameweek || !userWallet) return;
    setIsLoading(true);
    setLoadingMessage('Finalizing gameweek and determining winner...');
    try {
      const entries = await firebaseService.listEntities('entries', {
        gameId: activeGameweek.id
      });
      if (entries.length === 0) {
        alert('No entries to finalize');
        return;
      }
      setLoadingMessage('Calculating final points for all entries...');
      const updatedEntries = entries.map(entry => {
        try {
          const teamIds = JSON.parse(entry.team);
          const captainId = entry.captain;
          let gameweekPoints = 0;
          teamIds.forEach(playerId => {
            const player = players.find(p => p.id === playerId);
            if (player) {
              const points = player.event_points || 0;
              if (player.id.toString() === captainId) {
                gameweekPoints += points * 2;
              } else {
                gameweekPoints += points;
              }
            }
          });
          return {
            ...entry,
            points: gameweekPoints
          };
        } catch (e) {
          console.error("Error calculating final points for entry:", entry.id, e);
          return {
            ...entry,
            points: 0
          };
        }
      });
      setLoadingMessage('Updating final scores in database...');
      for (const entry of updatedEntries) {
        try {
          await firebaseService.updateEntity('entries', entry.id, {
            points: entry.points
          });
        } catch (error) {
          console.error(`Error updating points for entry ${entry.id}:`, error);
        }
      }
      const sortedEntries = updatedEntries.sort((a, b) => (b.points || 0) - (a.points || 0));
      const winner = sortedEntries[0];
      const totalPrizePool = entries.length * activeGameweek.entryFee;
      await firebaseService.updateEntity('games', activeGameweek.id, {
        status: 'finished',
        winnerId: winner.userId,
        prizePool: totalPrizePool
      });
      setLoadingMessage('Updating user statistics...');
      for (const entry of entries) {
        try {
          let userStatsRecords = await firebaseService.listEntities('user_stats', {
            userId: entry.userId
          });
          let userStatsRecord;
          if (userStatsRecords.length === 0) {
            userStatsRecord = await firebaseService.createEntity('user_stats', {
              userId: entry.userId
            });
          } else {
            userStatsRecord = userStatsRecords[0];
          }
          const isWinner = entry.userId === winner.userId;
          const updatedStats = {
            wins: (userStatsRecord.wins || 0) + (isWinner ? 1 : 0),
            losses: (userStatsRecord.losses || 0) + (isWinner ? 0 : 1),
            totalEarnings: (userStatsRecord.totalEarnings || 0) + (isWinner ? totalPrizePool * 0.95 : 0)
          };
          await firebaseService.updateEntity('user_stats', userStatsRecord.id, updatedStats);
        } catch (statError) {
          console.error(`Error updating stats for user ${entry.userId}:`, statError);
        }
      }

      await loadActiveGameweek();
      await loadLeaderboard(activeGameweek.id);
      await loadUserData();
      await loadActiveGameweek();
      if (activeGameweek?.id) {
        await loadLeaderboard(activeGameweek.id);
      }

      alert(`Gameweek finalized! Winner: ${winner.userId.slice(0, 8)}... with ${winner.points || 0} points`);
    } catch (error) {
      console.error('Error finalizing gameweek:', error);
      alert('Error finalizing gameweek');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  const claimPrize = async () => {
    if (!activeGameweek || !userWallet) return;
    setIsLoading(true);
    setLoadingMessage('Processing prize claim...');
    try {
      await firebaseService.createEntity('payouts', {
        gameId: activeGameweek.id,
        winnerId: userWallet
      });
      alert('Prize claimed successfully!');
      loadActiveGameweek();
    } catch (error) {
      console.error('Error claiming prize:', error);
      alert('Error claiming prize');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    if (userWallet) {
      console.log('Admin useEffect triggered for wallet:', userWallet);
      const adminStatus = userWallet && userWallet.toLowerCase() === '0xF027b3FC259c02949f9724E5099f86C177949039'.toLowerCase();
      console.log('Setting admin status to:', adminStatus);
      setIsAdmin(adminStatus);
      if (adminStatus) {
        loadAdminInviteCodes();
        loadAdminGames();
      }
    } else {
      setIsAdmin(false);
    }
  }, [userWallet]);

  const fetchFplJson = async (url) => {
    // Vercel Serverless Function proxy
    const path = url.split('https://fantasy.premierleague.com/api/')[1];
    const proxyUrl = `/api/fpl?path=${encodeURIComponent(path)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return data;
  };
  const loadPlayers = async () => {
    try {
      const cachedPlayers = localStorage.getItem('fpl_players');
      const cachedTeams = localStorage.getItem('fpl_teams');
      const cachedPositions = localStorage.getItem('fpl_positions');
      const cacheTime = localStorage.getItem('fpl_players_timestamp');
      const now = Date.now();
      if (cachedPlayers && cachedPlayers !== 'undefined' && 
          cachedTeams && cachedTeams !== 'undefined' && 
          cachedPositions && cachedPositions !== 'undefined' && 
          cacheTime && now - parseInt(cacheTime) < 3600000) {
        setPlayers(JSON.parse(cachedPlayers));
        setTeams(JSON.parse(cachedTeams));
        setPositions(JSON.parse(cachedPositions));
      } else {
        await fetchAndCachePlayers();
      }
    } catch (error) {
      console.error('Error loading players:', error);
      // Fallback: clear bad cache if parsing fails
      localStorage.removeItem('fpl_players');
      localStorage.removeItem('fpl_teams');
      localStorage.removeItem('fpl_positions');
      localStorage.removeItem('fpl_players_timestamp');
    }
  };
  const loadFixtures = async () => {
    try {
      const cachedFixtures = await firebaseService.listEntities('fixtures');
      if (cachedFixtures.length > 0) {
        setFixtures(cachedFixtures);
      } else {
        await fetchAndCacheFixtures();
      }
    } catch (error) {
      console.error('Error loading fixtures:', error);
    }
  };
  const loadSelectedGameweekFixtures = () => {
    try {
      const gameweekFixtures = fixtures.filter(fixture => fixture.gameweek === selectedFixtureGameweek);
      const uniqueFixtures = gameweekFixtures.reduce((acc, fixture) => {
        const existingIndex = acc.findIndex(f => f.fixtureId === fixture.fixtureId);
        if (existingIndex === -1) {
          acc.push(fixture);
        }
        return acc;
      }, []);
      setSelectedGameweekFixtures(uniqueFixtures);
    } catch (error) {
      console.error('Error loading selected gameweek fixtures:', error);
    }
  };
  const getAvailableGameweeks = () => {
    const gameweeks = [...new Set(fixtures.map(f => f.gameweek))].filter(gw => gw).sort((a, b) => a - b);
    return gameweeks;
  };
  const fetchAndCachePlayers = async () => {
    try {
      const data = await fetchFplJson('https://fantasy.premierleague.com/api/bootstrap-static/');
      
      if (data && data.elements) {
        localStorage.setItem('fpl_players', JSON.stringify(data.elements));
        localStorage.setItem('fpl_teams', JSON.stringify(data.teams));
        localStorage.setItem('fpl_positions', JSON.stringify(data.element_types));
        localStorage.setItem('fpl_players_timestamp', Date.now().toString());
        setPlayers(data.elements);
        setTeams(data.teams);
        setPositions(data.element_types);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };
  const fetchAndCacheFixtures = async () => {
    try {
      const data = await fetchFplJson('https://fantasy.premierleague.com/api/fixtures/');
      
      if (!Array.isArray(data)) {
        throw new Error("Expected array of fixtures, got: " + typeof data);
      }
      
      const existingFixtures = await firebaseService.listEntities('fixtures');
      const existingFixtureIds = existingFixtures.map(f => f.fixtureId);
      for (const fixture of data) {
        if (!existingFixtureIds.includes(fixture.id)) {
          await firebaseService.createEntity('fixtures', {
            fixtureId: fixture.id,
            gameweek: fixture.event,
            homeTeam: fixture.team_h,
            awayTeam: fixture.team_a,
            kickoffTime: fixture.kickoff_time,
            finished: fixture.finished,
            homeScore: fixture.team_h_score,
            awayScore: fixture.team_a_score
          });
        } else {
          const existingFixture = existingFixtures.find(f => f.fixtureId === fixture.id);
          if (existingFixture && (existingFixture.finished !== fixture.finished || existingFixture.homeScore !== fixture.team_h_score || existingFixture.awayScore !== fixture.team_a_score)) {
            await firebaseService.updateEntity('fixtures', existingFixture.id, {
              finished: fixture.finished,
              homeScore: fixture.team_h_score,
              awayScore: fixture.team_a_score
            });
          }
        }
      }
      const updatedFixtures = await firebaseService.listEntities('fixtures');
      setFixtures(updatedFixtures);
    } catch (error) {
      console.error('Error fetching fixtures:', error);
    }
  };
  const fetchFinalScores = async () => {
    if (!activeGameweek?.gameweek) return;
    try {
      const data = await fetchFplJson('https://fantasy.premierleague.com/api/fixtures/');
      const gameweekFixtures = data.filter(fixture => fixture.event === activeGameweek.gameweek && fixture.finished && fixture.team_h_score !== null && fixture.team_a_score !== null);
      const existingFixtures = await firebaseService.listEntities('fixtures');
      let hasUpdates = false;
      for (const fixture of gameweekFixtures) {
        const existingFixture = existingFixtures.find(f => f.fixtureId === fixture.id);
        if (existingFixture && (existingFixture.finished !== fixture.finished || existingFixture.homeScore !== fixture.team_h_score || existingFixture.awayScore !== fixture.team_a_score)) {
          await firebaseService.updateEntity('fixtures', existingFixture.id, {
            finished: fixture.finished,
            homeScore: fixture.team_h_score,
            awayScore: fixture.team_a_score
          });
          hasUpdates = true;
        }
      }
      if (hasUpdates) {
        const updatedFixtures = await firebaseService.listEntities('fixtures');
        setFixtures(updatedFixtures);
      }
    } catch (error) {
      console.error('Error fetching final scores:', error);
    }
  };
  const fetchLivePoints = async gameweek => {
    if (!gameweek) return;
    try {
      const data = await fetchFplJson(`https://fantasy.premierleague.com/api/event/${gameweek}/live/`);
      const livePlayerPoints = data.elements;
      setPlayers(prevPlayers => {
        if (prevPlayers.length === 0) return [];
        const updatedPlayers = prevPlayers.map(player => {
          const liveData = livePlayerPoints.find(p => p.id === player.id);
          if (liveData && liveData.stats) {
            return {
              ...player,
              event_points: liveData.stats.total_points || 0,
              live_stats: {
                minutes: liveData.stats.minutes || 0,
                goals_scored: liveData.stats.goals_scored || 0,
                assists: liveData.stats.assists || 0,
                clean_sheets: liveData.stats.clean_sheets || 0,
                goals_conceded: liveData.stats.goals_conceded || 0,
                own_goals: liveData.stats.own_goals || 0,
                penalties_saved: liveData.stats.penalties_saved || 0,
                penalties_missed: liveData.stats.penalties_missed || 0,
                yellow_cards: liveData.stats.yellow_cards || 0,
                red_cards: liveData.stats.red_cards || 0,
                saves: liveData.stats.saves || 0,
                bonus: liveData.stats.bonus || 0,
                bps: liveData.stats.bps || 0,
                influence: parseFloat(liveData.stats.influence) || 0,
                creativity: parseFloat(liveData.stats.creativity) || 0,
                threat: parseFloat(liveData.stats.threat) || 0,
                ict_index: parseFloat(liveData.stats.ict_index) || 0,
                in_dreamteam: liveData.stats.in_dreamteam || false
              }
            };
          }
          return player;
        });
        return updatedPlayers;
      });
    } catch (error) {
      console.error('Error fetching live stats:', error);
    }
  };
  const createGameweek = async () => {
    if (!userWallet || !isAdmin) return;
    setIsLoading(true);
    setLoadingMessage('Checking for new gameweek to create...');
    try {
      const data = await fetchFplJson('https://fantasy.premierleague.com/api/bootstrap-static/');
      let currentFplEvent = data.events.find(event => event.is_current === true);
      if (!currentFplEvent) {
        currentFplEvent = data.events.find(event => event.is_next === true);
      }
      if (!currentFplEvent) {
        setIsLoading(false);
      setLoadingMessage('');
      setTimeout(() => alert('FPL API does not indicate a current or next gameweek. The season may be over.'), 100);
        return;
      }
      const currentGameweekNumber = currentFplEvent.id;
      const allGames = await firebaseService.listEntities('games');
      const gameExists = allGames.some(game => game.gameweek === currentGameweekNumber);
      if (gameExists) {
        setIsLoading(false);
      setLoadingMessage('');
      setTimeout(() => alert(`Gameweek ${currentGameweekNumber} already exists. No new gameweek started.`), 100);
        return;
      }
      setLoadingMessage(`Recording Gameweek ${currentGameweekNumber} in database...`);
      const newGame = await firebaseService.createEntity('games', {
        gameweek: currentGameweekNumber,
        status: 'active',
        prizePool: 0,
        entryFee: 100000
      });
      await loadActiveGameweek();
      setIsLoading(false);
      setLoadingMessage('');
      setTimeout(() => alert(`Successfully started Gameweek ${currentGameweekNumber}!`), 100);
    } catch (error) {
      console.error('Error starting new gameweek:', error);
      setIsLoading(false);
      setLoadingMessage('');
      setTimeout(() => alert('An error occurred while trying to start the new gameweek. Check the console for details.'), 100);
    }
  };
  const syncGameweekWithFPL = async () => {
    if (!userWallet || !isAdmin) return;
    setIsLoading(true);
    setLoadingMessage('Syncing gameweek with FPL...');
    try {
      const fplData = await fetchFplJson('https://fantasy.premierleague.com/api/bootstrap-static/');
      let currentFplEvent = fplData.events.find(event => event.is_current === true);
      if (!currentFplEvent) {
        currentFplEvent = fplData.events.find(event => event.is_next === true);
      }
      if (!currentFplEvent) {
        setIsLoading(false);
      setLoadingMessage('');
      setTimeout(() => alert('Could not determine current or next FPL gameweek. FPL API might be down or season ended.'), 100);
        return;
      }
      setLoadingMessage('Fetching fixture data...');
      const fixturesData = await fetchFplJson('https://fantasy.premierleague.com/api/fixtures/');
      let actualCurrentGameweek = currentFplEvent.id;
      const maxGameweeks = Math.max(...fplData.events.map(e => e.id));
      setLoadingMessage('Checking fixture completion status...');
      for (let gwNumber = currentFplEvent.id; gwNumber <= maxGameweeks; gwNumber++) {
        console.log(`Checking gameweek ${gwNumber} completion...`);
        const gameweekFixtures = fixturesData.filter(fixture => fixture.event === gwNumber && fixture.kickoff_time !== null);
        if (gameweekFixtures.length === 0) {
          console.log(`No fixtures found for gameweek ${gwNumber}, skipping`);
          continue;
        }
        const allFixturesFinished = gameweekFixtures.every(fixture => fixture.finished === true);
        console.log(`Gameweek ${gwNumber}: ${gameweekFixtures.length} fixtures, all finished: ${allFixturesFinished}`);
        if (!allFixturesFinished) {
          actualCurrentGameweek = gwNumber;
          console.log(`Gameweek ${gwNumber} has unfinished fixtures, setting as current`);
          break;
        } else {
          const nextGameweekFixtures = fixturesData.filter(fixture => fixture.event === gwNumber + 1 && fixture.kickoff_time !== null);
          if (nextGameweekFixtures.length > 0) {
            console.log(`Gameweek ${gwNumber} completed, checking next gameweek ${gwNumber + 1}`);
            continue;
          } else {
            actualCurrentGameweek = gwNumber;
            console.log(`Gameweek ${gwNumber} is the last available gameweek`);
            break;
          }
        }
      }
      const currentFplGameweekNumber = actualCurrentGameweek;
      setLoadingMessage(`Determined current gameweek: ${currentFplGameweekNumber}`);
      const activeGames = await firebaseService.listEntities('games', {
        status: 'active'
      });
      const currentActiveGame = activeGames.length > 0 ? activeGames[0] : null;
      if (currentActiveGame && currentActiveGame.gameweek === currentFplGameweekNumber) {
        setIsLoading(false);
      setLoadingMessage('');
      setTimeout(() => alert(`Gameweek ${currentFplGameweekNumber} is already active and synced.`), 100);
        return;
      }
      if (currentActiveGame) {
        setLoadingMessage(`Finalizing old Gameweek ${currentActiveGame.gameweek}...`);
        await firebaseService.updateEntity('games', currentActiveGame.id, {
          status: 'finished'
        });
        console.log(`Old Gameweek ${currentActiveGame.gameweek} finalized.`);
      }
      const targetGameweekGame = await firebaseService.listEntities('games', {
        gameweek: currentFplGameweekNumber
      });
      let newActiveGame = null;
      if (targetGameweekGame.length > 0) {
        const existingGame = targetGameweekGame[0];
        if (existingGame.status !== 'active') {
          setLoadingMessage(`Activating existing Gameweek ${currentFplGameweekNumber}...`);
          newActiveGame = await firebaseService.updateEntity('games', existingGame.id, {
            status: 'active'
          });
          console.log(`Existing Gameweek ${currentFplGameweekNumber} activated.`);
        } else {
          newActiveGame = existingGame;
          console.log(`Gameweek ${currentFplGameweekNumber} was already active.`);
        }
      } else {
        setLoadingMessage(`Creating new Gameweek ${currentFplGameweekNumber}...`);
        newActiveGame = await firebaseService.createEntity('games', {
          gameweek: currentFplGameweekNumber,
          status: 'active',
          prizePool: 0,
          entryFee: 100000
        });
        console.log(`New Gameweek ${currentFplGameweekNumber} created.`);
      }
      if (newActiveGame) {
        console.log('New active game set:', newActiveGame.id);
      }
      await loadActiveGameweek();
      setIsLoading(false);
      setLoadingMessage('');
      setTimeout(() => alert(`Gameweek synced successfully! Active Gameweek is now ${currentFplGameweekNumber}.`), 100);
    } catch (error) {
      console.error('Error syncing gameweek:', error);
      setIsLoading(false);
      setLoadingMessage('');
      setTimeout(() => alert('An error occurred during gameweek sync. Please check console for details.'), 100);
    }
  };
  const deleteGameweek = async () => {
    if (!userWallet || !isAdmin) return;
    const confirmed = window.confirm('Are you sure you want to DELETE the current gameweek? This action cannot be undone and will remove all entries and data for this gameweek.');
    if (!confirmed) return;
    const doubleConfirmed = window.confirm('FINAL WARNING: This will permanently delete the active gameweek and all associated entries. Type "DELETE" in the next prompt to confirm.');
    if (!doubleConfirmed) return;
    const finalConfirmation = window.prompt('Type "DELETE" to confirm deletion of the current gameweek:');
    if (finalConfirmation !== 'DELETE') {
      alert('Deletion cancelled - confirmation text did not match.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Deleting current gameweek...');
    try {
      const activeGames = await firebaseService.listEntities('games', {
        status: 'active'
      });
      if (activeGames.length === 0) {
        setIsLoading(false);
      setLoadingMessage('');
      setTimeout(() => alert('No active gameweek found to delete.'), 100);
        return;
      }
      const currentActiveGame = activeGames[0];
      setLoadingMessage(`Deleting Gameweek ${currentActiveGame.gameweek} and all entries...`);
      const gameEntries = await firebaseService.listEntities('entries', {
        gameId: currentActiveGame.id
      });
      for (const entry of gameEntries) {
        await firebaseService.deleteEntity('entries', entry.id);
      }
      const gamePayouts = await firebaseService.listEntities('payouts', {
        gameId: currentActiveGame.id
      });
      for (const payout of gamePayouts) {
        await firebaseService.deleteEntity('payouts', payout.id);
      }
      await firebaseService.deleteEntity('games', currentActiveGame.id);
      await loadActiveGameweek();
      await loadUserData();
      setIsLoading(false);
      setLoadingMessage('');
      setTimeout(() => alert(`Gameweek ${currentActiveGame.gameweek} has been completely deleted.`), 100);
    } catch (error) {
      console.error('Error deleting gameweek:', error);
      setIsLoading(false);
      setLoadingMessage('');
      setTimeout(() => alert('An error occurred while deleting the gameweek. Please check console for details.'), 100);
    }
  };

  const deleteSpecificGameweek = async (gameId, gameweekNumber) => {
    if (!userWallet || !isAdmin) return;
    const finalConfirmation = window.prompt(`Type "DELETE" to confirm deletion of Gameweek ${gameweekNumber}:`);
    if (finalConfirmation !== 'DELETE') {
      return;
    }
    setIsLoading(true);
    setLoadingMessage(`Deleting Gameweek ${gameweekNumber}...`);
    try {
      const gameEntries = await firebaseService.listEntities('entries', { gameId });
      for (const entry of gameEntries) {
        await firebaseService.deleteEntity('entries', entry.id);
      }
      const gamePayouts = await firebaseService.listEntities('payouts', { gameId });
      for (const payout of gamePayouts) {
        await firebaseService.deleteEntity('payouts', payout.id);
      }
      await firebaseService.deleteEntity('games', gameId);
      await loadAdminGames();
      await loadActiveGameweek();
      await loadUserData();
      setIsLoading(false);
      setLoadingMessage('');
      setTimeout(() => alert(`Gameweek ${gameweekNumber} has been completely deleted.`), 100);
    } catch (error) {
      console.error('Error deleting specific gameweek:', error);
      setIsLoading(false);
      setLoadingMessage('');
      setTimeout(() => alert('An error occurred while deleting the gameweek.'), 100);
    }
  };
  const addPlayerToTeam = player => {
    const { canAdd, reason } = canAddPlayer(player);
    if (!canAdd) {
      setToast({ title: 'SELECTION ERROR', message: reason });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setSelectedTeam([...selectedTeam, player]);
    setTeamBudget(teamBudget - player.now_cost);
  };
  const removePlayerFromTeam = player => {
    setSelectedTeam(selectedTeam.filter(p => p.id !== player.id));
    setTeamBudget(teamBudget + player.now_cost);
    if (captain && captain.id === player.id) {
      setCaptain(null);
    }
  };
  const isFormationValid = () => {
    const counts = getFormationCounts();
    const requirements = getFormationRequirements(selectedFormation);
    return counts[1] === requirements[1] && counts[2] === requirements[2] && counts[3] === requirements[3] && counts[4] === requirements[4] && selectedTeam.length === 11;
  };
  const resetTeam = () => {
    setSelectedTeam([]);
    setTeamBudget(700);
    setCaptain(null);
  };
  const getFormationRequirements = formation => {
    const [def, mid, att] = formation.split('-').map(Number);
    return {
      1: 1,
      2: def,
      3: mid,
      4: att
    };
  };
  const calculateLiveLeaderboard = (entries, players, livePointsMap = {}) => {
    if (!entries || !players || players.length === 0) return [];
    if (!isGameweekStarted) {
      return entries.map(entry => ({
        ...entry,
        points: 0,
        isLiveCalculated: false
      })).sort((a, b) => (b.points || 0) - (a.points || 0));
    }
    const updatedEntries = entries.map(entry => {
      try {
        const teamIds = JSON.parse(entry.team);
        const captainId = entry.captain;
        let gameweekPoints = 0;
        teamIds.forEach(playerId => {
          const player = players.find(p => p.id === playerId);
          if (player) {
            const points = livePointsMap[player.id] !== undefined ? livePointsMap[player.id] : (player.event_points || 0);
            if (player.id.toString() === captainId) {
              gameweekPoints += points * 2;
            } else {
              gameweekPoints += points;
            }
          }
        });
        return {
          ...entry,
          points: gameweekPoints,
          isLiveCalculated: true
        };
      } catch (e) {
        console.error("Error calculating gameweek points for entry:", entry.id, e);
        return {
          ...entry,
          points: 0,
          isLiveCalculated: false
        };
      }
    });
    return updatedEntries.sort((a, b) => (b.points || 0) - (a.points || 0));
  };
  const getPlayerScore = player => {
    const baseValue = player.total_points / (player.now_cost / 10);
    const nextOpponent = getNextOpponent(player.team);
    if (!nextOpponent) return baseValue;
    const difficulty = getDifficultyLevel(nextOpponent.team);
    let difficultyMultiplier = 1;
    if (difficulty.level === 'Easy') {
      difficultyMultiplier = 1.3;
    } else if (difficulty.level === 'Medium') {
      difficultyMultiplier = 1.1;
    } else if (difficulty.level === 'Hard') {
      difficultyMultiplier = 0.8;
    }
    const homeMultiplier = nextOpponent.isHome ? 1.05 : 1;
    return baseValue * difficultyMultiplier * homeMultiplier;
  };
  const getAITeamStrategy = async () => {
    try {
      const response = await fetch('https://chat.dev.fun/inference/543405b7d79724fbb83d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{
            role: 'system',
            content: `You are an expert Fantasy Premier League manager. Generate a unique team-building strategy for this gameweek. Return ONLY a JSON object with this exact structure:
{
  "strategy": "one of: attacking, defensive, balanced, differential, premium_heavy, budget_focused, youth_focused, form_based",
  "formation_preference": "one of: 343, 352, 442, 433, 541, 532",
  "budget_allocation": {
    "goalkeeper": "one of: budget, mid, premium",
    "defense": "one of: budget, mid, premium", 
    "midfield": "one of: budget, mid, premium",
    "attack": "one of: budget, mid, premium"
  },
  "focus_teams": ["list of 2-4 team short names to prioritize"],
  "avoid_teams": ["list of 1-3 team short names to avoid"],
  "captain_type": "one of: safe, differential, form, fixture"
}
Be creative and generate different strategies each time. Consider fixture difficulty, recent form, and tactical variety.`
          }, {
            role: 'user',
            content: `Generate a unique FPL team strategy for gameweek ${activeGameweek?.gameweek || 1}. Make it different from typical strategies.`
          }]
        })
      });
      const data = await response.json();
      let jsonText = data.text;
      const jsonMatch = jsonText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
      return JSON.parse(jsonText);
    } catch (error) {
      console.error('Error getting AI strategy:', error);
      const strategies = ['attacking', 'defensive', 'balanced', 'differential'];
      const formations = ['343', '352', '442', '433'];
      const budgetTypes = ['budget', 'mid', 'premium'];
      return {
        strategy: strategies[Math.floor(Math.random() * strategies.length)],
        formation_preference: formations[Math.floor(Math.random() * formations.length)],
        budget_allocation: {
          goalkeeper: budgetTypes[Math.floor(Math.random() * budgetTypes.length)],
          defense: budgetTypes[Math.floor(Math.random() * budgetTypes.length)],
          midfield: budgetTypes[Math.floor(Math.random() * budgetTypes.length)],
          attack: budgetTypes[Math.floor(Math.random() * budgetTypes.length)]
        },
        focus_teams: [],
        avoid_teams: [],
        captain_type: 'safe'
      };
    }
  };
  const getFormationCounts = () => {
    return {
      1: selectedTeam.filter(p => p.element_type === 1).length,
      2: selectedTeam.filter(p => p.element_type === 2).length,
      3: selectedTeam.filter(p => p.element_type === 3).length,
      4: selectedTeam.filter(p => p.element_type === 4).length
    };
  };
  const canAddPlayer = player => {
    if (selectedTeam.length >= 11) return {
      canAdd: false,
      reason: 'Team is full (11 players maximum)'
    };
    if (selectedTeam.find(p => p.id === player.id)) return {
      canAdd: false,
      reason: 'Player already selected'
    };
    if (teamBudget < player.now_cost) return {
      canAdd: false,
      reason: 'Insufficient budget'
    };
    const playersFromSameTeam = selectedTeam.filter(p => p.team === player.team).length;
    if (playersFromSameTeam >= 3) return {
      canAdd: false,
      reason: 'Maximum 3 players from same team allowed'
    };
    const counts = getFormationCounts();
    const requirements = getFormationRequirements(selectedFormation);
    const position = player.element_type;
    if (position === 1 && counts[1] >= requirements[1]) return {
      canAdd: false,
      reason: 'Goalkeeper position filled'
    };
    if (position === 2 && counts[2] >= requirements[2]) return {
      canAdd: false,
      reason: 'All defender positions filled'
    };
    if (position === 3 && counts[3] >= requirements[3]) return {
      canAdd: false,
      reason: 'All midfielder positions filled'
    };
    if (position === 4 && counts[4] >= requirements[4]) return {
      canAdd: false,
      reason: 'All forward positions filled'
    };
    return {
      canAdd: true,
      reason: ''
    };
  };
  const autoCompleteTeam = async () => {
    if (selectedTeam.length >= 11) return;
    setIsLoading(true);
    setLoadingMessage('AI building your dream team...');
    try {
      const aiStrategy = await getAITeamStrategy();
      const counts = getFormationCounts();
      let currentBudget = teamBudget;
      let newTeam = [...selectedTeam];
      const requirements = getFormationRequirements(selectedFormation);
      const needed = {
        1: Math.max(0, requirements[1] - counts[1]),
        2: Math.max(0, requirements[2] - counts[2]),
        3: Math.max(0, requirements[3] - counts[3]),
        4: Math.max(0, requirements[4] - counts[4])
      };
      for (let position = 1; position <= 4; position++) {
        for (let i = 0; i < needed[position]; i++) {
          let availablePlayers = players.filter(player => {
            if (newTeam.find(p => p.id === player.id)) return false;
            if (player.element_type !== position) return false;
            if (player.now_cost > currentBudget) return false;
            const playersFromSameTeam = newTeam.filter(p => p.team === player.team).length;
            if (playersFromSameTeam >= 3) return false;
            const playerTeam = teams.find(t => t.id === player.team);
            if (aiStrategy.avoid_teams.includes(playerTeam?.short_name)) return false;
            return true;
          });
          availablePlayers = availablePlayers.sort((a, b) => {
            const aTeam = teams.find(t => t.id === a.team);
            const bTeam = teams.find(t => t.id === b.team);
            let aScore = getPlayerScore(a);
            let bScore = getPlayerScore(b);
            if (aiStrategy.focus_teams.includes(aTeam?.short_name)) aScore *= 1.2;
            if (aiStrategy.focus_teams.includes(bTeam?.short_name)) bScore *= 1.2;
            const positionMap = {
              1: 'goalkeeper',
              2: 'defense',
              3: 'midfield',
              4: 'attack'
            };
            const budgetPref = aiStrategy.budget_allocation[positionMap[position]];
            if (budgetPref === 'premium') {
              aScore += a.now_cost / 100;
              bScore += b.now_cost / 100;
            } else if (budgetPref === 'budget') {
              aScore -= a.now_cost / 200;
              bScore -= b.now_cost / 200;
            }
            return bScore - aScore;
          });
          if (availablePlayers.length > 0) {
            const selectionRange = Math.min(5 + Math.floor(Math.random() * 5), availablePlayers.length);
            const topOptions = availablePlayers.slice(0, selectionRange);
            const randomIndex = Math.floor(Math.random() * topOptions.length);
            const player = topOptions[randomIndex];
            newTeam.push(player);
            currentBudget -= player.now_cost;
          }
        }
      }
      const remainingSlotsToFill = 11 - newTeam.length;
      for (let i = 0; i < remainingSlotsToFill; i++) {
        const currentCounts = {
          1: newTeam.filter(p => p.element_type === 1).length,
          2: newTeam.filter(p => p.element_type === 2).length,
          3: newTeam.filter(p => p.element_type === 3).length,
          4: newTeam.filter(p => p.element_type === 4).length
        };
        const requirements = getFormationRequirements(selectedFormation);
        const availablePlayers = players.filter(player => {
          if (newTeam.find(p => p.id === player.id)) return false;
          if (player.now_cost > currentBudget) return false;
          const playersFromSameTeam = newTeam.filter(p => p.team === player.team).length;
          if (playersFromSameTeam >= 3) return false;
          const pos = player.element_type;
          if (pos === 1 && currentCounts[1] >= requirements[1]) return false;
          if (pos === 2 && currentCounts[2] >= requirements[2]) return false;
          if (pos === 3 && currentCounts[3] >= requirements[3]) return false;
          if (pos === 4 && currentCounts[4] >= requirements[4]) return false;
          return true;
        }).sort(() => Math.random() - 0.5);
        if (availablePlayers.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(7, availablePlayers.length));
          const player = availablePlayers[randomIndex];
          newTeam.push(player);
          currentBudget -= player.now_cost;
        }
      }
      setSelectedTeam(newTeam);
      setTeamBudget(currentBudget);
      if (newTeam.length > 0) {
        const randomCaptain = newTeam[Math.floor(Math.random() * newTeam.length)];
        setCaptain(randomCaptain);
      }
    } catch (error) {
      console.error('Error auto completing team:', error);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  const intelligentAutoComplete = async () => {
    setIsLoading(true);
    setLoadingMessage('Generating new tactical formation...');
    try {
      const aiStrategy = await getAITeamStrategy();
      const counts = getFormationCounts();
      let currentBudget = teamBudget;
      let newTeam = [...selectedTeam];
      const requirements = getFormationRequirements(selectedFormation);
      const needed = {
        1: Math.max(0, requirements[1] - counts[1]),
        2: Math.max(0, requirements[2] - counts[2]),
        3: Math.max(0, requirements[3] - counts[3]),
        4: Math.max(0, requirements[4] - counts[4])
      };
      for (let position = 1; position <= 4; position++) {
        for (let i = 0; i < needed[position]; i++) {
          let availablePlayers = players.filter(player => {
            if (newTeam.find(p => p.id === player.id)) return false;
            if (player.element_type !== position) return false;
            if (player.now_cost > currentBudget) return false;
            const playersFromSameTeam = newTeam.filter(p => p.team === player.team).length;
            if (playersFromSameTeam >= 3) return false;
            return true;
          });
          if (aiStrategy.strategy === 'attacking') {
            availablePlayers.sort((a, b) => {
              if (position >= 3) return b.total_points - a.total_points;
              return a.total_points / a.now_cost - b.total_points / b.now_cost;
            });
          } else if (aiStrategy.strategy === 'defensive') {
            availablePlayers.sort((a, b) => {
              if (position <= 2) return b.total_points - a.total_points;
              return b.total_points / b.now_cost - a.total_points / a.now_cost;
            });
          } else if (aiStrategy.strategy === 'differential') {
            availablePlayers.sort((a, b) => {
              const aOwnership = a.selected_by_percent || 0;
              const bOwnership = b.selected_by_percent || 0;
              return aOwnership - bOwnership;
            });
          }
          if (availablePlayers.length > 0) {
            const variance = Math.floor(Math.random() * 8) + 3;
            const topOptions = availablePlayers.slice(0, Math.min(variance, availablePlayers.length));
            const randomIndex = Math.floor(Math.random() * topOptions.length);
            const player = topOptions[randomIndex];
            newTeam.push(player);
            currentBudget -= player.now_cost;
          }
        }
      }
      const remainingSlotsToFill = 11 - newTeam.length;
      for (let i = 0; i < remainingSlotsToFill; i++) {
        const currentCounts = {
          1: newTeam.filter(p => p.element_type === 1).length,
          2: newTeam.filter(p => p.element_type === 2).length,
          3: newTeam.filter(p => p.element_type === 3).length,
          4: newTeam.filter(p => p.element_type === 4).length
        };
        let availablePlayers = players.filter(player => {
          if (newTeam.find(p => p.id === player.id)) return false;
          if (player.now_cost > currentBudget) return false;
          const playersFromSameTeam = newTeam.filter(p => p.team === player.team).length;
          if (playersFromSameTeam >= 3) return false;
          const pos = player.element_type;
          const requirements = getFormationRequirements(selectedFormation);
          if (pos === 1 && currentCounts[1] >= requirements[1]) return false;
          if (pos === 2 && currentCounts[2] >= requirements[2]) return false;
          if (pos === 3 && currentCounts[3] >= requirements[3]) return false;
          if (pos === 4 && currentCounts[4] >= requirements[4]) return false;
          return true;
        });
        if (Math.random() > 0.6) {
          availablePlayers = availablePlayers.filter(p => {
            const nextOpponent = getNextOpponent(p.team);
            if (!nextOpponent) return true;
            const difficulty = getDifficultyLevel(nextOpponent.team);
            return difficulty.level === 'Easy' || difficulty.level === 'Medium';
          });
        }
        availablePlayers = availablePlayers.sort(() => Math.random() - 0.5);
        if (availablePlayers.length > 0) {
          const selectionIndex = Math.floor(Math.random() * Math.min(10, availablePlayers.length));
          const player = availablePlayers[selectionIndex];
          newTeam.push(player);
          currentBudget -= player.now_cost;
        }
      }
      setSelectedTeam(newTeam);
      setTeamBudget(currentBudget);
      if (newTeam.length > 0) {
        const randomCaptain = newTeam[Math.floor(Math.random() * newTeam.length)];
        setCaptain(randomCaptain);
      }
    } catch (error) {
      console.error('Error generating team:', error);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  const shareTeamOnX = async () => {
    try {
      const goalkeepers = getPlayersByPosition(1);
      const defenders = getPlayersByPosition(2);
      const midfielders = getPlayersByPosition(3);
      const forwards = getPlayersByPosition(4);
      let teamText = "My Squad:\n";
      if (goalkeepers.length > 0) {
        teamText += `🥅 GK: ${goalkeepers.map(p => `${p.first_name} ${p.second_name}`).join(', ')}\n`;
      }
      if (defenders.length > 0) {
        teamText += `🛡️ DEF: ${defenders.map(p => `${p.first_name} ${p.second_name}`).join(', ')}\n`;
      }
      if (midfielders.length > 0) {
        teamText += `⚽ MID: ${midfielders.map(p => `${p.first_name} ${p.second_name}`).join(', ')}\n`;
      }
      if (forwards.length > 0) {
        teamText += `🎯 FWD: ${forwards.map(p => `${p.first_name} ${p.second_name}`).join(', ')}\n`;
      }
      if (captain) {
        teamText += `👑 Captain: ${captain.first_name} ${captain.second_name}\n`;
      }
      const shareText = `⚽ My fpl.sol Gameweek ${activeGameweek?.gameweek} team is locked in! 🚀\n\n${teamText}\n💎 ${currentUserEntry.points || 0} points so far\n💰 ${formatPrice(currentUserEntry.teamValue)} team value\n\nJoin the crypto fantasy revolution: https://dev.fun/p/543405b7d79724fbb83d\n\n@fpl_sol #FPL #Robinhood Chain #Fantasy`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
      window.open(twitterUrl, '_blank');
    } catch (error) {
      console.error('Error sharing team:', error);
      alert('Error preparing team share. Please try again.');
    }
  };
  const generateShareMessage = async () => {
    setIsGeneratingMessage(true);
    try {
      const appContext = {
        currentGameweek: activeGameweek?.gameweek || 'N/A',
        gameweekStatus: activeGameweek?.status || 'none',
        totalEntries: entriesCount,
        prizePool: activeGameweek?.prizePool || 0,
        isGameweekStarted: isGameweekStarted,
        deadline: gameweekDeadline ? formatDeadline(gameweekDeadline) : 'N/A',
        isAfterDeadline: isAfterDeadline,
        topPlayerName: leaderboard.length > 0 ? `${leaderboard[0].userId.slice(0, 8)}...` : 'N/A',
        topPlayerPoints: leaderboard.length > 0 ? leaderboard[0].points || 0 : 0,
        onlineUsers: onlineUsers,
        upcomingFixtures: selectedGameweekFixtures.length,
        totalUsers: new Set(leaderboard.map(entry => entry.userId)).size
      };
      let systemPrompt = `You are a social media manager for fpl.sol, a crypto fantasy football app on Robinhood Chain. Create engaging, hype-building posts for X.com (Twitter).

Key guidelines:
- Keep posts under 280 characters
- Use relevant emojis 
- Include hashtags: #FPL #Robinhood Chain #Fantasy #Crypto
- Mention @fpl_sol
- Create FOMO and excitement
- Include the app link: https://dev.fun/p/543405b7d79724fbb83d
- Be energetic and fun
- Use football/crypto terminology appropriately

Current app data:
- Gameweek: ${appContext.currentGameweek}
- Status: ${appContext.gameweekStatus}
- Entries: ${appContext.totalEntries}
- Prize Pool: ${appContext.prizePool} $FPLS
- Online Users: ${appContext.onlineUsers}
- Top Player: ${appContext.topPlayerName} (${appContext.topPlayerPoints} pts)
- Deadline: ${appContext.deadline}
- Gameweek Started: ${appContext.isGameweekStarted}`;
      let userPrompt = '';
      switch (selectedShareTopic) {
        case 'deadline':
          userPrompt = `Create a post about the gameweek deadline. ${appContext.isAfterDeadline ? 'Deadline has passed, focus on live action' : 'Create urgency about the approaching deadline'}`;
          break;
        case 'squad':
          userPrompt = 'Create a post encouraging users to build their dream squad and share strategies';
          break;
        case 'leaderboard':
          userPrompt = `Create a post about the current leaderboard competition. Top player has ${appContext.topPlayerPoints} points`;
          break;
        case 'fixtures':
          userPrompt = `Create a post about Premier League fixtures and how they affect fantasy choices. ${appContext.upcomingFixtures} fixtures this gameweek`;
          break;
        case 'players':
          userPrompt = 'Create a post about player performances and who to watch in fantasy';
          break;
        case 'gameweek':
          userPrompt = `Create a post about Gameweek ${appContext.currentGameweek}. Status: ${appContext.gameweekStatus}`;
          break;
        case 'prize pool':
          userPrompt = `Create a post highlighting the current prize pool of ${appContext.prizePool} $FPLS and potential winnings`;
          break;
        case 'entries':
          userPrompt = `Create a post about the ${appContext.totalEntries} managers who have entered and the growing competition`;
          break;
        default:
          userPrompt = 'Create a general hype post about the app';
      }
      const response = await fetch('https://chat.dev.fun/inference/543405b7d79724fbb83d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{
            role: 'system',
            content: systemPrompt
          }, {
            role: 'user',
            content: userPrompt
          }]
        })
      });
      const data = await response.json();
      setGeneratedShareMessage(data.text);
    } catch (error) {
      console.error('Error generating share message:', error);
      setGeneratedShareMessage('🔥 The crypto fantasy revolution is here! Build your Premier League dream team and win $FPLS rewards on @fpl_sol ⚽💰 #FPL #RobinhoodChain #Fantasy https://dev.fun/p/543405b7d79724fbb83d');
    } finally {
      setIsGeneratingMessage(false);
    }
  };
  const shareOnX = () => {
    if (!generatedShareMessage) return;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(generatedShareMessage)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleRequestScore = async () => {
    if (!userWallet || !activeGameweek) return;
    setIsLoading(true);
    setLoadingMessage('Requesting score from Chainlink Oracle...');
    try {
      const tx = await writeContractAsync({
        address: FPLGAME_ADDRESS,
        abi: FPLGAME_ABI,
        functionName: 'requestTeamScore',
        args: [["123456", activeGameweek.gameweek.toString()]] // Using mock managerId "123456" for demo
      });
      console.log('Score request sent:', tx);
      alert('Score request sent to Chainlink Oracle! TX: ' + tx);
    } catch (error) {
      console.error(error);
      alert('Failed to request score. ' + (error.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const submitTeam = async () => {
    if (!activeGameweek || !isFormationValid() || !userWallet || !captain) return;
    if (isAfterDeadline && !isAdmin) {
      alert('Team submission deadline has passed! You cannot submit teams after the deadline.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Submitting team & processing payment...');
    let teamSubmissionSuccess = false;
    try {
      console.log('--- submitTeam START ---');
      console.log('Active Gameweek ID:', activeGameweek.id);
      console.log('Entry Fee:', activeGameweek.entryFee);
      
      setLoadingMessage('Burning 100,000 $test to enter Gameweek...');
      const playerIds = selectedTeam.map(p => p.id);
      const enterTx = await writeContractAsync({
        address: FPLS_ADDRESS,
        abi: FPLS_ABI,
        functionName: 'transfer',
        args: ['0x000000000000000000000000000000000000dEaD', BigInt('100000000000000000000000')], // 100,000 $test
      });
      console.log('Burn Tx Hash:', enterTx);
      refetchBalance(); // Update user's balance after burn
      
      setLoadingMessage('Recording entry to database...');
      await firebaseService.createEntity('entries', {
        gameId: activeGameweek.id,
        team: JSON.stringify(playerIds),
        captain: captain.id.toString(),
        teamValue: 700 - teamBudget,
        points: 0,
        txHash: enterTx
      });
      console.log('Entry created successfully.');
      teamSubmissionSuccess = true;
      try {
        const currentGame = await firebaseService.getEntity('games', activeGameweek.id);
        console.log('Fetched current game prizePool from Devbase:', currentGame.prizePool);
        const updatedPrizePool = (currentGame.prizePool || 0) + 100000;
        console.log('Calculated new prizePool:', updatedPrizePool);
        await firebaseService.updateEntity('games', activeGameweek.id, {
          prizePool: updatedPrizePool
        });
        console.log('Successfully updated game prizePool in Devbase to:', updatedPrizePool);
      } catch (prizePoolError) {
        console.warn('Prize pool update failed, but team submission was successful:', prizePoolError);
      }
      await loadUserData();
      await loadActiveGameweek();
      if (activeGameweek?.id) {
        await loadLeaderboard(activeGameweek.id);
      }
      if (!userInviteCode && userEntries.length === 0) {
        await generateNewInviteCode();
      }

      console.log('--- submitTeam END ---');
      alert('🎉 Team submitted successfully! You have entered Gameweek ' + activeGameweek.gameweek + '!');
    } catch (error) {
      console.error('Error submitting team:', error);
      if (!teamSubmissionSuccess) {
        alert('Error submitting team: ' + (error.message || 'Please try again.'));
      } else {
        alert('🎉 Team submitted successfully! Some data may take a moment to update.');
        try {
          await loadUserData();
          await loadActiveGameweek();
        } catch (refreshError) {
          console.warn('Failed to refresh data after successful submission:', refreshError);
        }
      }
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  const shareSquadOnX = () => {
    if (!selectedTeam || selectedTeam.length === 0) return;
    const formationStr = selectedFormation;
    const captainName = captain ? `${captain.first_name} ${captain.second_name}` : 'None';
    const teamValue = ((700 - teamBudget) / 10).toFixed(1);
    const playerLines = selectedTeam.map(p => {
      const pos = positions.find(pt => pt.id === p.element_type)?.singular_name_short || '?';
      const isCap = captain && captain.id === p.id;
      return `${isCap ? '©️ ' : ''}${p.second_name} (${pos})`;
    }).join(' | ');
    const shareText = `⚽ My fpl.stock Squad (${formationStr})\n\n${playerLines}\n\n👑 Captain: ${captainName}\n💰 Team Value: £${teamValue}M\n\nBuild yours & compete for the prize pool 👇\nhttps://dev.fun/p/543405b7d79724fbb83d\n\n#FPL #fplstock #RobinhoodChain`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank');
  };
  const formatPrice = price => `£${(price / 10).toFixed(1)}M`;
  const getFilteredPlayers = () => {
    let filteredPlayers = players.filter(player => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const playerName = `${player.first_name} ${player.second_name}`.toLowerCase();
        if (!playerName.includes(searchTerm)) {
          return false;
        }
      }
      if (filters.club && player.team !== parseInt(filters.club)) {
        return false;
      }
      if (filters.position && player.element_type !== parseInt(filters.position)) {
        return false;
      }
      if (filters.minPrice && player.now_cost < parseFloat(filters.minPrice) * 10) {
        return false;
      }
      if (filters.maxPrice && player.now_cost > parseFloat(filters.maxPrice) * 10) {
        return false;
      }
      return true;
    });
    filteredPlayers.sort((a, b) => {
      let aValue, bValue;
      switch (sortOption.field) {
        case 'now_cost':
          aValue = a.now_cost;
          bValue = b.now_cost;
          break;
        case 'total_points':
          aValue = a.total_points;
          bValue = b.total_points;
          break;
        case 'selected_by_percent':
          aValue = parseFloat(a.selected_by_percent) || 0;
          bValue = parseFloat(b.selected_by_percent) || 0;
          break;
        default:
          aValue = a.total_points;
          bValue = b.total_points;
      }
      if (sortOption.direction === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
    return filteredPlayers;
  };
  const resetFilters = () => {
    setFilters({
      search: '',
      club: '',
      position: '',
      minPrice: '',
      maxPrice: ''
    });
    setSortOption({
      field: 'total_points',
      direction: 'desc'
    });
  };
  const getPlayersByPosition = position => {
    return selectedTeam.filter(player => player.element_type === position);
  };
  const getTeamLogo = teamId => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return null;
    return `https://resources.premierleague.com/premierleague/badges/50/t${team.code}.png`;
  };
  const formatKickoffTime = kickoffTime => {
    if (!kickoffTime) return 'TBD';
    const date = new Date(kickoffTime);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const getNextOpponent = teamId => {
    if (!activeGameweek || !fixtures.length) return null;
    const nextFixture = fixtures.find(fixture => fixture.gameweek === activeGameweek.gameweek && (fixture.homeTeam === teamId || fixture.awayTeam === teamId) && !fixture.finished);
    if (!nextFixture) return null;
    const opponentId = nextFixture.homeTeam === teamId ? nextFixture.awayTeam : nextFixture.homeTeam;
    const isHome = nextFixture.homeTeam === teamId;
    const opponent = teams.find(t => t.id === opponentId);
    return {
      team: opponent,
      isHome,
      fixture: nextFixture
    };
  };
  const getDifficultyLevel = opponentTeam => {
    if (!opponentTeam) return {
      level: 'Unknown',
      color: 'gray',
      rating: 0
    };
    const teamStrength = opponentTeam.strength || 3;
    if (teamStrength >= 5) {
      return {
        level: 'Hard',
        color: 'red',
        rating: 5
      };
    } else if (teamStrength >= 4) {
      return {
        level: 'Medium',
        color: 'yellow',
        rating: 3
      };
    } else {
      return {
        level: 'Easy',
        color: 'green',
        rating: 2
      };
    }
  };
  const FixturesDisplay = ({
    gameweekFixtures,
    gameweek
  }) => {
    if (gameweekFixtures.length === 0) {
      return <div className="text-center py-8">
        <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-4" />
        <p className="text-green-100">No fixtures available for gameweek {gameweek}</p>
      </div>;
    }
    const fixturesByDate = gameweekFixtures.reduce((groups, fixture) => {
      if (!fixture.kickoffTime) return groups;
      const date = new Date(fixture.kickoffTime);
      const dateKey = date.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(fixture);
      return groups;
    }, {});
    const sortedDates = Object.keys(fixturesByDate).sort((a, b) => {
      return new Date(a) - new Date(b);
    });
    sortedDates.forEach(dateKey => {
      fixturesByDate[dateKey].sort((a, b) => {
        if (!a.kickoffTime || !b.kickoffTime) return 0;
        return new Date(a.kickoffTime) - new Date(b.kickoffTime);
      });
    });
    return <div className="space-y-6">
      {sortedDates.map(dateKey => {
        const date = new Date(dateKey);
        const fixtures = fixturesByDate[dateKey];
        return <div key={dateKey} className="space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-green-700/30 pb-2" >
            {date.toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fixtures.map(fixture => {
              const homeTeam = teams.find(t => t.id === fixture.homeTeam);
              const awayTeam = teams.find(t => t.id === fixture.awayTeam);
              return <SpotlightCard key={fixture.fixtureId} className="bg-black/30 backdrop-blur-sm rounded-lg p-4 border border-green-700/20" glowColor="blue" size="sm" intensity={0.8}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img src={getTeamLogo(fixture.homeTeam)} alt={homeTeam?.name || 'Home Team'} className="w-8 h-8 object-contain" onError={e => {
                      e.target.style.display = 'none';
                    }} />
                    <span className="text-white font-semibold text-sm">{homeTeam?.short_name || 'HOME'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {fixture.finished && fixture.homeScore !== null && fixture.awayScore !== null ? <div className="text-center">
                      <div className="text-white font-bold text-lg bg-green-600 px-3 py-1 rounded border border-black shadow-lg" >
                        {fixture.homeScore} - {fixture.awayScore}
                      </div>
                      <div className="text-green-300 text-xs mt-1 font-bold">
                        FINAL
                      </div>
                    </div> : <span className="text-green-100 text-sm font-bold">VS</span>}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-semibold text-sm">{awayTeam?.short_name || 'AWAY'}</span>
                    <img src={getTeamLogo(fixture.awayTeam)} alt={awayTeam?.name || 'Away Team'} className="w-8 h-8 object-contain" onError={e => {
                      e.target.style.display = 'none';
                    }} />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-green-100 text-xs">{formatKickoffTime(fixture.kickoffTime)}</p>
                  {fixture.finished ? <span className="inline-block bg-green-600 text-white text-xs px-2 py-1 rounded mt-1">
                    Full Time
                  </span> : <span className="inline-block bg-yellow-600 text-white text-xs px-2 py-1 rounded mt-1">
                    {new Date(fixture.kickoffTime) > new Date() ? 'Upcoming' : 'Live'}
                  </span>}
                </div>
              </SpotlightCard>;
            })}
          </div>
        </div>;
      })}
    </div>;
  };
  const FormationDisplay = ({
    isTeamSubmitted
  }) => {
    const goalkeepers = getPlayersByPosition(1);
    const defenders = getPlayersByPosition(2);
    const midfielders = getPlayersByPosition(3);
    const forwards = getPlayersByPosition(4);
    const requirements = getFormationRequirements(selectedFormation);
    const PlayerCard = ({
      player,
      position
    }) => {
      const isCaptain = captain && captain.id === player.id;
      return <div 
          className="relative group p-[1px] rounded-xl"
        >
        <div className="bg-black/40 backdrop-blur-md text-white rounded-xl p-1 md:p-2 text-center min-w-[70px] md:min-w-[90px] h-full" style={{
          background: 'linear-gradient(145deg, var(--carbon-surface) 0%, var(--carbon-base) 100%)',
          border: '1px solid var(--border-light)'
        }}>
          {isCaptain && <div className="absolute -top-2 -left-2 bg-[#00FF00] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center font-mono z-10">C</div>}
          <div className="mb-1 md:mb-2 rounded-lg overflow-hidden border border-[#1A1A1A] bg-white/5">
            <img 
              src={`https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.code}.png`} 
              alt={`${player.first_name} ${player.second_name}`} 
              onError={(e) => { e.target.src = "/pixel_footballer.jpg"; }}
              className="w-8 h-10 md:w-12 md:h-14 mx-auto object-cover" 
            />
          </div>
          <div className="text-[9px] font-bold truncate text-white/90 uppercase tracking-widest leading-tight">{player.first_name}</div>
          <div className="text-[10px] font-bold truncate text-white uppercase tracking-widest leading-tight">{player.second_name}</div>
          <div className="flex justify-between items-center text-[9px] mt-1 px-1 font-mono">
            <span className="text-[#8b9a90]">{formatPrice(player.now_cost)}</span>
            {isTeamSubmitted && <span className="text-white font-bold opacity-70">
              {isGameweekStarted ? player.event_points || 0 : 0} pts
            </span>}
          </div>
          {isCaptain && <div className="text-[8px] text-[#00FF00] font-bold mt-1 uppercase tracking-widest">Captain</div>}
        </div>
        {!isTeamSubmitted && <>
          <button onClick={() => removePlayerFromTeam(player)} className="absolute -top-2 -right-2 bg-black border border-[#1A1A1A] text-white rounded-full w-5 h-5 text-xs md:opacity-0 md:group-hover:opacity-100 transition-all hover:bg-red-900/50 hover:text-white z-10 flex items-center justify-center">
            ×
          </button>
          <button onClick={() => setCaptain(player)} className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${isCaptain ? 'bg-[#00FF00] text-black' : 'bg-black border border-[#1A1A1A] text-white'} rounded-full w-5 h-5 text-xs md:opacity-0 md:group-hover:opacity-100 transition-all font-mono font-bold z-10 flex items-center justify-center`}>
            {isCaptain ? '✓' : 'C'}
          </button>
        </>}
      </div>;
    };
    const EmptySlot = ({
      position,
      count
    }) => <div className="bg-[#050505] text-[#333] rounded-xl p-1 md:p-2 text-center min-w-[70px] md:min-w-[90px] border border-[#1A1A1A] border-dashed opacity-70 flex flex-col items-center justify-center h-24 md:h-28">
        <div className="text-[9px] uppercase tracking-widest font-mono">Empty</div>
        <div className="text-[10px] text-[#666] uppercase tracking-widest mt-1 font-bold">{position}</div>
      </div>;
    return <div className="border border-[#1A1A1A] p-2 relative overflow-hidden bg-black mt-4">
      {/* Pitch Lines */}
      <div className="absolute inset-4 border border-[#333] opacity-50">
        <div className="absolute inset-x-0 top-1/2 h-0 border-t border-[#333]"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-0 border-l border-[#333]"></div>
        <div className="absolute left-1/2 top-1/2 w-32 h-32 border border-[#333] rounded-full transform -translate-x-1/2 -translate-y-1/2 "></div>
      </div>
      <div className="relative z-10 space-y-4 md:space-y-8">
        { }
        <div className="flex justify-center items-center space-x-2 md:space-x-4 flex-wrap">
          {forwards.map((player, index) => <PlayerCard key={player.id} player={player} position="FWD" />)}
          {!isTeamSubmitted && Array(Math.max(0, requirements[4] - forwards.length)).fill(0).map((_, index) => <EmptySlot key={`fwd-empty-${index}`} position="FWD" count={index} />)}
        </div>
        { }
        <div className="flex justify-center items-center space-x-1 md:space-x-4 flex-wrap">
          {midfielders.map((player, index) => <PlayerCard key={player.id} player={player} position="MID" />)}
          {!isTeamSubmitted && Array(Math.max(0, requirements[3] - midfielders.length)).fill(0).map((_, index) => <EmptySlot key={`mid-empty-${index}`} position="MID" count={index} />)}
        </div>
        { }
        <div className="flex justify-center items-center space-x-1 md:space-x-4 flex-wrap">
          {defenders.map((player, index) => <PlayerCard key={player.id} player={player} position="DEF" />)}
          {!isTeamSubmitted && Array(Math.max(0, requirements[2] - defenders.length)).fill(0).map((_, index) => <EmptySlot key={`def-empty-${index}`} position="DEF" count={index} />)}
        </div>
        { }
        <div className="flex justify-center items-center">
          {goalkeepers.map((player, index) => <PlayerCard key={player.id} player={player} position="GK" />)}
          {!isTeamSubmitted && goalkeepers.length === 0 && <EmptySlot position="GK" count={0} />}
        </div>
      </div>
    </div>;
  };
  // The main layout
  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col font-sans">
      {toast && (
        <div className="fixed bottom-4 right-4 z-[100] bg-black/90 backdrop-blur-xl border border-green-500/50 p-4 rounded-xl shadow-[0_0_20px_rgba(74,222,128,0.2)] animate-fade-in-up flex items-center space-x-3">
          <div className="bg-green-500/20 p-2 rounded-full">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 className="text-green-400 font-bold text-xs tracking-widest uppercase">{toast.title}</h4>
            <p className="text-gray-200 text-sm mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}

      {/* New Header */}
      <header className="flex justify-between items-center px-6 py-5 border-b border-gray-900 w-full relative z-10 bg-black">
        <div className="flex items-center space-x-4">
          <div className="font-bold text-2xl tracking-tighter text-white font-sans">
            fpl.<span className="text-green-500">stock</span>
          </div>
          <div className="text-[9px] tracking-[0.2em] uppercase border border-gray-800 px-3 py-1.5 rounded-full text-gray-500 font-mono">
            Robinhood Chain
          </div>
        </div>
        
        <div className="flex items-center space-x-6 md:space-x-10">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[9px] text-gray-600 uppercase tracking-widest font-mono">Treasury Balance</span>
            <span className="text-sm font-bold text-green-500 font-mono">{(entriesCount * 100000).toFixed(2)} $FPLS</span>
          </div>
          {authenticated ? (
            <button onClick={logout} className="flex items-center space-x-3 bg-gray-900/40 border border-gray-800 px-5 py-2 rounded-full hover:border-green-500/50 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#00ff00]"></div>
              <span className="text-xs font-mono text-gray-300">{userWallet.slice(0,6)}...{userWallet.slice(-4)}</span>
            </button>
          ) : (
            <button onClick={login} className="flex items-center space-x-3 bg-gray-900/40 border border-gray-800 px-5 py-2 rounded-full hover:border-green-500/50 transition-colors">
              <span className="text-xs font-mono text-gray-300">Connect Wallet</span>
            </button>
          )}
        </div>
      </header>

      {/* Navigation */}
      <div className="w-full border-b border-gray-900/50 bg-black relative z-10">
        <LimelightNav currentView={currentView} setCurrentView={setCurrentView} isAdmin={isAdmin} />
      </div>
    <main className="flex-1 w-full flex flex-col">
      {currentView === 'home' && <LandingHero setCurrentView={setCurrentView} activeGameweek={activeGameweek} />}
      {currentView === 'dashboard' && <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 w-full">
        { }
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Countdown, Stats, & Fixtures */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <SpotlightCard className={`${theme === 'dark' ? 'bg-black/30' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-4 border ${theme === 'dark' ? 'border-red-900/50' : 'border-red-300/50'}`} glowColor="red" size="sm" intensity={0.5}>
                <div className="text-center">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 font-mono">FPLS BURNED 🔥</h3>
                  <div className="text-lg md:text-xl font-mono font-black text-red-500 cinematic-text drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
                    {(entriesCount * 100000).toLocaleString()}
                  </div>
                </div>
              </SpotlightCard>
              <SpotlightCard className={`${theme === 'dark' ? 'bg-black/30' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-4 border ${theme === 'dark' ? 'border-green-900/50' : 'border-green-300/50'}`} glowColor="green" size="sm" intensity={0.5}>
                <div className="text-center">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 font-mono">TOTAL REWARDS</h3>
                  <div className="text-lg md:text-xl font-mono font-black text-green-400 cinematic-text drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]">
                    {(entriesCount * 100000).toFixed(2)} $FPLS
                  </div>
                </div>
              </SpotlightCard>
            </div>
            <SpotlightCard className={`${theme === 'dark' ? 'bg-black/30' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-6 border ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-300/50'}`} glowColor="blue" size="lg" intensity={0.8}>
              <div className="text-center">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Gameweek 1 Kicks Off In</h3>
                <div className="text-2xl md:text-3xl font-mono font-black text-white bg-black/50 p-4 rounded-xl cinematic-text border border-gray-800 tracking-wider">
                  {gw1Countdown}
                </div>
              </div>
            </SpotlightCard>
            
            <SpotlightCard className={`${theme === 'dark' ? 'bg-black/30' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-6 border ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-300/50'}`} glowColor="yellow" size="md" intensity={0.5}>
              <h2 className="text-sm font-mono font-black text-black bg-white px-3 py-1 rounded-lg mb-4 cinematic-text inline-block">OPENING FIXTURES</h2>
              <div className="space-y-3 font-mono text-xs">
                {liveFixtures.length > 0 ? liveFixtures.map((fixture) => (
                  <div key={fixture.id} className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-gray-800">
                    <div className="flex items-center space-x-2 w-1/3 justify-end">
                      <span className="text-gray-300 font-bold text-right">{fplTeams[fixture.team_h]?.name || fixture.team_h}</span>
                      <img src={`https://resources.premierleague.com/premierleague/badges/t${fplTeams[fixture.team_h]?.code}.png`} className="w-5 h-5 object-contain" alt="home team" />
                    </div>
                    <span className="text-yellow-500 font-bold px-1 text-[9px] w-auto text-center">VS</span>
                    <div className="flex items-center space-x-2 w-1/3 justify-start">
                      <img src={`https://resources.premierleague.com/premierleague/badges/t${fplTeams[fixture.team_a]?.code}.png`} className="w-5 h-5 object-contain" alt="away team" />
                      <span className="text-gray-300 font-bold text-left">{fplTeams[fixture.team_a]?.name || fixture.team_a}</span>
                    </div>
                    <span className="text-gray-500 text-xs ml-auto">
                      {new Date(fixture.kickoff_time).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )) : (
                  <div className="text-gray-500 text-center py-4">Loading real-time fixtures...</div>
                )}
              </div>
            </SpotlightCard>
          </div>

          {/* Right Column: RWAs on Robinhood Chain */}
          <div className="space-y-6">
            <SpotlightCard className={`${theme === 'dark' ? 'bg-black/30' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-6 border ${theme === 'dark' ? 'border-green-700/30' : 'border-green-300/50'} h-full`} glowColor="green" size="lg" intensity={0.7}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-sm font-mono font-black text-green-400 cinematic-text">RWAs ON ROBINHOOD CHAIN</h2>
              </div>
              <div className="space-y-4">
                <div className="bg-black/40 p-4 rounded-xl border border-green-900/50">
                  <h3 className="text-[10px] font-mono text-green-500 uppercase tracking-widest mb-2">The Engine</h3>
                  <p className="text-[var(--text-secondary)] text-xs font-mono leading-relaxed">
                    fpl.stock bridges Fantasy Premier League data with DeFi tokenomics. 
                    The protocol operates on a deflationary cycle synced with the official English Premier League schedule.
                  </p>
                </div>
                
                <div className="bg-black/40 p-4 rounded-xl border border-green-900/50">
                  <h3 className="text-[10px] font-mono text-green-500 uppercase tracking-widest mb-2">The Defi Loop</h3>
                  <ul className="text-[var(--text-secondary)] text-xs font-mono space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">›</span>
                      3% tax on $FPLS transfers buys real-world Robinhood Stocks (e.g. AAPL, GME).
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">›</span>
                      100,000 $test burned per gameweek entry, reducing total supply forever.
                    </li>
                    <li className="flex items-start">
                      <span className="text-yellow-500 mr-2">›</span>
                      90% of creator rewards distributed to ALL players. 10% to treasury.
                    </li>
                  </ul>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </div>
        {activeGameweek ? <SpotlightCard className={`${theme === 'dark' ? 'bg-black/30' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-8 border ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-300/50'}`} glowColor="yellow" size="md" intensity={1}>
          <h2 className="text-lg md:text-lg font-black text-black bg-white px-6 py-4 rounded-2xl mb-4 cinematic-text text-center" >
            GAMEWEEK {activeGameweek.gameweek}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm body-text`}>Status</p>
              <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} cinematic-text capitalize`}>{activeGameweek.status}</p>
            </div>
            <div>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm body-text`}>Entry Fee</p>
              <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} cinematic-text`}>100,000 $test</p>
            </div>
            <div>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm body-text`}>Entries</p>
              <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} cinematic-text`}>{entriesCount}</p>
            </div>
            <div>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm body-text`}>Prize Pool</p>
              <p className={`text-lg font-semibold ${theme === 'dark' ? 'text-yellow-600 gold-glow' : 'text-yellow-700'} cinematic-text`}>{activeGameweek.prizePool} $FPLS</p>
            </div>
          </div>
          { }
          {gameweekDeadline && activeGameweek.status === 'active' && (
            <CountdownTimer deadlineTime={gameweekDeadline} />
          )}
          {activeGameweek.status === 'finished' && activeGameweek.winnerId && <div className="mt-6 p-4 bg-yellow-600/20 rounded-lg border border-yellow-600/50">
            <h3 className="text-yellow-600 font-bold mb-2 cinematic-text gold-glow" >🏆 GAMEWEEK WINNER</h3>
            <p className="text-gray-300 body-text">
              Winner: {activeGameweek.winnerId.slice(0, 8)}...{activeGameweek.winnerId.slice(-4)}
            </p>
            <p className="text-gray-300 body-text">Prize: {(activeGameweek.prizePool * 0.95).toFixed(3)} $FPLS</p>
            {activeGameweek.winnerId === userWallet && <AnimatedButton onClick={claimPrize} className="mt-4" color="yellow" hoverText="Claim Now!">
              🎉 CLAIM YOUR PRIZE! 🎉
            </AnimatedButton>}
          </div>}
          {activeGameweek.status === 'active' && <>
            {userEntries.find(e => e.gameId === activeGameweek.id) ? <div className="mt-6 p-4 bg-yellow-600/20 rounded-lg">
              <p className="text-gray-100 body-text">✅ You have entered this gameweek!</p>
            </div> : isAfterDeadline && !isAdmin ? <div className="mt-6 p-4 bg-red-700/30 rounded-lg border border-red-500/50">
              <p className="text-red-200 font-bold cinematic-text">🚫 TEAM SUBMISSION DEADLINE HAS PASSED</p>
              <p className="text-red-100 text-sm mt-1 body-text">You can no longer submit teams for this gameweek.</p>
            </div> : <AnimatedButton onClick={() => setCurrentView('team')} className="mt-6" color="yellow" hoverText="Let's Go!">
              BUILD TEAM & ENTER
            </AnimatedButton>}
            {isAdmin && <div className="mt-4 space-y-2">
              <AnimatedButton onClick={syncGameweekWithFPL} className="w-full" color="orange" hoverText="Sync Now">
                🔄 Sync Gameweek with FPL (Admin Only)
              </AnimatedButton>
              <AnimatedButton onClick={finalizeGameweek} className="w-full" color="red" hoverText="Finalize Now">
                🔒 Finalize Gameweek (Admin Only)
              </AnimatedButton>
              <AnimatedButton onClick={deleteGameweek} className="w-full" color="red" hoverText="Delete Gameweek">
                🗑️ Delete Current Gameweek (Admin Only)
              </AnimatedButton>
              <AnimatedButton onClick={clearAndRepopulateFixtures} className="w-full" color="purple" hoverText="Clear & Reload">
                🔄 Clear & Repopulate Fixtures (Admin Only)
              </AnimatedButton>
            </div>}
          </>}
        </SpotlightCard> : <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700/30 text-center" glowColor="yellow" size="md" intensity={0.7}>
          <Clock className="w-10 h-10 text-gray-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-100 mb-2 cinematic-text">NO ACTIVE GAMEWEEK</h2>
          <p className="text-gray-300 mb-4 body-text">Waiting for the next gameweek to begin...</p>
          {isAdmin && <AnimatedButton onClick={createGameweek} color="yellow" hoverText="Create Now">
            CREATE GAMEWEEK (ADMIN)
          </AnimatedButton>}
        </SpotlightCard>}
        {activeGameweek && players.length > 0 && isGameweekStarted && <SpotlightCard className={`${theme === 'dark' ? 'bg-black/30' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-4 border ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-300/50'}`} glowColor="green" size="lg" intensity={0.9}>
          <h2 className={`text-lg font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} mb-4 text-center cinematic-text ${theme === 'dark' ? 'gold-glow' : ''}`} >
            🔥 TOP PERFORMERS - GAMEWEEK {activeGameweek.gameweek}
          </h2>
          <div className="relative overflow-hidden">
            <motion.div className="flex space-x-4" animate={{
              x: [0, -1600]
            }} transition={{
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }} style={{
              width: 'max-content'
            }}>
              {[...players].filter(player => (player.event_points || 0) > 0).sort((a, b) => (b.event_points || 0) - (a.event_points || 0)).slice(0, 20).concat([...players].filter(player => (player.event_points || 0) > 0).sort((a, b) => (b.event_points || 0) - (a.event_points || 0)).slice(0, 20)).map((player, index) => {
                const playerTeam = teams.find(t => t.id === player.team);
                const playerPosition = positions.find(p => p.id === player.element_type);
                return <div key={`${player.id}-${index}`} className={`flex-shrink-0 w-40 ${theme === 'dark' ? 'bg-black/40' : 'bg-white/60'} backdrop-blur-sm rounded-lg p-4 border ${theme === 'dark' ? 'border-green-700/30' : 'border-green-400/50'}`} >
                  <div className="text-center">
                    <img src="/pixel_footballer.jpg" alt={`${player.first_name} ${player.second_name}`} className="w-10 h-10 rounded-none mx-auto mb-2 object-cover border-4 border-black"  onError={e => {
                      e.target.style.display = 'none';
                    }} />
                    <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} truncate pixel-text`}>
                      {player.first_name}
                    </h3>
                    <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} truncate cinematic-text`}>
                      {player.second_name}
                    </h4>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} body-text`}>
                      {playerTeam?.short_name} • {playerPosition?.singular_name_short}
                    </p>
                    <div className="mt-2 bg-green-600/20 rounded-lg p-2 border border-green-500/30">
                      <p className="text-green-400 font-bold text-lg cinematic-text gold-glow" >
                        {player.event_points || 0} PTS
                      </p>
                    </div>
                  </div>
                </div>;
              })}
            </motion.div>
          </div>
          <div className="text-center mt-4">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} body-text`}>
              Live gameweek points • Updates automatically during matches
            </p>
          </div>
        </SpotlightCard>}
        {fixtures.length > 0 && <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700/30" glowColor="yellow" size="lg" intensity={0.9}>
          <div className="flex items-center justify-between mb-4 cursor-pointer hover:bg-gray-700/10 transition-colors rounded p-4" onClick={() => setShowFixtures(!showFixtures)}>
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-yellow-600" />
              <h2 className="text-lg font-bold text-gray-100 cinematic-text">
                PREMIER LEAGUE FIXTURES
              </h2>
            </div>
            <span className="text-yellow-600 hover:text-yellow-500 transition-colors text-lg font-bold cinematic-text gold-glow" >
              {showFixtures ? '↑' : '↓'}
            </span>
          </div>
          {showFixtures && <div className="space-y-6">
            <div className="flex items-center justify-between bg-black/60 rounded-lg p-4 border border-gray-700/30">
              <button onClick={() => {
                const availableGameweeks = getAvailableGameweeks();
                const currentIndex = availableGameweeks.indexOf(selectedFixtureGameweek);
                if (currentIndex > 0) {
                  setSelectedFixtureGameweek(availableGameweeks[currentIndex - 1]);
                }
              }} disabled={selectedFixtureGameweek <= Math.min(...getAvailableGameweeks())} className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-black p-2 rounded-lg transition-colors cinematic-text" >
                ← PREVIOUS
              </button>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-100 mb-2 cinematic-text gold-glow" >
                  GAMEWEEK {selectedFixtureGameweek}
                </h3>
                <p className="text-gray-400 text-sm body-text">
                  {selectedGameweekFixtures.length} fixtures
                </p>
              </div>
              <button onClick={() => {
                const availableGameweeks = getAvailableGameweeks();
                const currentIndex = availableGameweeks.indexOf(selectedFixtureGameweek);
                if (currentIndex < availableGameweeks.length - 1) {
                  setSelectedFixtureGameweek(availableGameweeks[currentIndex + 1]);
                }
              }} disabled={selectedFixtureGameweek >= Math.max(...getAvailableGameweeks())} className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-black p-2 rounded-lg transition-colors cinematic-text" >
                NEXT →
              </button>
            </div>
            <FixturesDisplay gameweekFixtures={selectedGameweekFixtures} gameweek={selectedFixtureGameweek} />
          </div>}
        </SpotlightCard>}
      </div>}
      {currentView === 'profile' && <div className="space-y-8">
        <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-green-700/30" glowColor="purple" size="lg" intensity={1.1}>
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-8 h-8 text-purple-400" style={{
              filter: 'drop-shadow(2px 2px 0px #000)'
            }} />
            <h2 className="text-lg md:text-lg font-black text-black bg-white px-6 py-4 rounded-2xl cinematic-text" >YOUR PROFILE</h2>
          </div>
          { }
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
            <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-4 md:p-4 border border-green-700/30" glowColor="yellow" size="sm" intensity={0.8}>
              <div className="flex items-center space-x-2 md:space-x-3">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" style={{
                  filter: 'drop-shadow(2px 2px 0px #000)'
                }} />
                <div>
                  <p className="text-white text-xs md:text-sm" >Wins</p>
                  <p className="text-lg md:text-lg font-bold text-white" >{userStats?.wins || 0}</p>
                </div>
              </div>
            </SpotlightCard>
            <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-4 md:p-4 border border-green-700/30" glowColor="red" size="sm" intensity={0.8}>
              <div className="flex items-center space-x-2 md:space-x-3">
                <Medal className="w-6 h-6 md:w-8 md:h-8 text-red-400" style={{
                  filter: 'drop-shadow(2px 2px 0px #000)'
                }} />
                <div>
                  <p className="text-white text-xs md:text-sm" >GW {activeGameweek?.gameweek || '-'} Rank</p>
                  <p className="text-lg md:text-lg font-bold text-white" >
                    {(() => {
                      if (!activeGameweek || !userWallet || leaderboard.length === 0) return 'N/A';
                      const userIndex = leaderboard.findIndex(entry => entry.userId === userWallet);
                      return userIndex !== -1 ? `#${userIndex + 1}` : 'Not Entered';
                    })()}
                  </p>
                </div>
              </div>
            </SpotlightCard>
            <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-4 md:p-4 border border-green-700/30" glowColor="green" size="sm" intensity={0.8}>
              <div className="flex items-center space-x-2 md:space-x-3">
                <Target className="w-6 h-6 md:w-8 md:h-8 text-green-400" style={{
                  filter: 'drop-shadow(2px 2px 0px #000)'
                }} />
                <div>
                  <p className="text-white text-xs md:text-sm" >Entries</p>
                  <p className="text-lg md:text-lg font-bold text-white" >{userEntries.length}</p>
                </div>
              </div>
            </SpotlightCard>
          </div>
          { }
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            { }
            <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-green-700/30" glowColor="blue" size="sm" intensity={0.8}>
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-6 h-6 text-blue-400" style={{
                  filter: 'drop-shadow(2px 2px 0px #000)'
                }} />
                <h3 className="text-lg font-bold text-white" >Performance Stats</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-100" style={{
                    fontFamily: 'Inter, sans-serif'
                  }}>Games Played:</span>
                  <span className="text-white font-bold">{userEntries.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100" style={{
                    fontFamily: 'Inter, sans-serif'
                  }}>Wins:</span>
                  <span className="text-green-400 font-bold">{userStats?.wins || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100" style={{
                    fontFamily: 'Inter, sans-serif'
                  }}>Losses:</span>
                  <span className="text-red-400 font-bold">{userStats?.losses || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100" style={{
                    fontFamily: 'Inter, sans-serif'
                  }}>Win Rate:</span>
                  <span className="text-yellow-400 font-bold">
                    {userEntries.length > 0 ? Math.round((userStats?.wins || 0) / userEntries.length * 100) : 0}%
                  </span>
                </div>
              </div>
            </SpotlightCard>
            { }
            {claimableWinnings.length > 0 && <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-green-700/30" glowColor="yellow" size="sm" intensity={1.0}>
              <div className="flex items-center space-x-3 mb-4">
                <Trophy className="w-6 h-6 text-yellow-400" style={{
                  filter: 'drop-shadow(2px 2px 0px #000)'
                }} />
                <h3 className="text-lg font-bold text-white" >🎉 Claimable Winnings</h3>
              </div>
              <div className="space-y-4">
                {claimableWinnings.map(game => <div key={game.id} className="bg-yellow-700/20 border border-yellow-500/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-yellow-400 font-bold text-lg" >
                        Gameweek {game.gameweek} Winner! 🏆
                      </h4>
                      <p className="text-green-100 text-sm" style={{
                        fontFamily: 'Inter, sans-serif'
                      }}>
                        Prize: {(game.prizePool * 0.95).toFixed(3)} $FPLS
                      </p>
                    </div>
                    <AnimatedButton onClick={() => claimSpecificPrize(game.id)} color="yellow" hoverText="Claim Now!" className="py-2 px-4">
                      💰 Claim Prize
                    </AnimatedButton>
                  </div>
                  <p className="text-yellow-200 text-xs" style={{
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    Total Prize Pool: {game.prizePool} $FPLS • You get 95%
                  </p>
                </div>)}
              </div>
            </SpotlightCard>}
            { }
            {userInviteCode && <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-green-700/30" glowColor="yellow" size="sm" intensity={0.8}>
              <div className="flex items-center space-x-3 mb-4">
                <Medal className="w-6 h-6 text-yellow-400" style={{
                  filter: 'drop-shadow(2px 2px 0px #000)'
                }} />
                <h3 className="text-lg font-bold text-white" >Achievements</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-green-700/20 border border-green-500/50 rounded-lg p-4">
                  <p className="text-green-100 text-sm mb-2" style={{
                    fontFamily: 'Inter, sans-serif'
                  }}>Share this code with friends:</p>
                  <div className="flex items-center space-x-2">
                    <code className="bg-black/50 text-green-300 px-3 py-2 rounded text-lg font-bold border border-green-700/50 select-all cursor-pointer" >
                      {userInviteCode.code}
                    </code>
                  </div>
                </div>
                <p className="text-green-200 text-xs" style={{
                  fontFamily: 'Inter, sans-serif'
                }}>
                  Each code can only be used once. You'll get a new code when someone uses yours!
                </p>
              </div>
            </SpotlightCard>}
            { }
            <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-green-700/30" glowColor="yellow" size="sm" intensity={0.8}>
              <div className="flex items-center space-x-3 mb-4">
                <Medal className="w-6 h-6 text-yellow-400" style={{
                  filter: 'drop-shadow(2px 2px 0px #000)'
                }} />
                <h3 className="text-lg font-bold text-white" >Achievements</h3>
              </div>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${userEntries.length > 0 ? 'bg-green-700/30' : 'bg-gray-700/30'}`}>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-sm font-semibold">First Entry</span>
                  </div>
                  <p className="text-green-100 text-xs mt-1">Submit your first team</p>
                </div>
                <div className={`p-3 rounded-lg ${(userStats?.wins || 0) > 0 ? 'bg-green-700/30' : 'bg-gray-700/30'}`}>
                  <div className="flex items-center space-x-2">
                    <Medal className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-sm font-semibold">First Victory</span>
                  </div>
                  <p className="text-green-100 text-xs mt-1">Win your first gameweek</p>
                </div>
                <div className={`p-3 rounded-lg ${userEntries.length >= 5 ? 'bg-green-700/30' : 'bg-gray-700/30'}`}>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-sm font-semibold">Consistent Player</span>
                  </div>
                  <p className="text-green-100 text-xs mt-1">Enter 5 gameweeks</p>
                </div>
              </div>
            </SpotlightCard>
          </div>
          { }
          {userEntries.length > 0 && <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-green-700/30 mt-6" glowColor="green" size="md" intensity={0.8}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white" >Game History</h3>
              <button onClick={loadUserData} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded transition-colors flex items-center space-x-2" >
                <RotateCcw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {userEntries.slice(0, 10).map((entry, index) => {
                return <div key={entry.id} className="bg-black/30 p-4 rounded-lg border border-green-700/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">Entry #{index + 1}</p>
                      <p className="text-green-100 text-sm">{formatPrice(entry.teamValue)} team value</p>
                      <p className="text-gray-400 text-xs">Created: {new Date(entry.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold text-lg">{entry.points || 0} pts</p>
                      <p className="text-green-100 text-sm">Game: {entry.gameId.slice(0, 8)}...</p>
                      {entry.points > 0 && <p className="text-green-300 text-xs">✓ Final Score</p>}
                    </div>
                  </div>
                </div>;
              })}
            </div>
          </SpotlightCard>}
        </SpotlightCard>
      </div>}
      {currentView === 'team' && <div className="flex flex-col lg:flex-row h-screen max-h-[85vh] w-full bg-black border-t border-[#1A1A1A] text-white">
        {/* Left Column: SQUAD SELECTION & PITCH */}
        <div className="w-full lg:w-[45%] border-r border-[#1A1A1A] flex flex-col p-6 overflow-y-auto">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-[#8b9a90] text-[10px] font-mono tracking-[0.2em] mb-1">SQUAD SELECTION ({selectedTeam.length}/11)</h2>
            </div>
            <div className="text-right flex items-center space-x-4">
              {teamBudget < 100 && selectedTeam.length < 11 && (
                <div className="text-red-500 text-[10px] font-mono uppercase border border-red-500 px-2 py-0.5 animate-pulse">Low Budget!</div>
              )}
              <div>
                <h2 className="text-white text-xl font-bold font-sans">£{(teamBudget / 10).toFixed(1)}<span className="text-[#8b9a90] text-sm">M</span></h2>
                <p className="text-[#8b9a90] text-[9px] font-mono tracking-widest uppercase">Budget</p>
              </div>
            </div>
          </div>
          
          {/* Captain Reminder */}
          <div className="bg-[#0a0a0a] border border-[#1A1A1A] p-3 mb-6 text-center">
            <span className="text-[#666] text-[10px] font-mono tracking-widest uppercase"><span className="text-white">Tip:</span> Click a player on the pitch below to make them Captain (2x Pts)</span>
          </div>

          <div className="flex-1 flex flex-col justify-start relative">
            <div className="transform scale-[0.65] sm:scale-75 lg:scale-[0.6] origin-top md:origin-top-left -mx-10 lg:-mx-20">
              <FormationDisplay isTeamSubmitted={false} />
            </div>
          </div>
          
          {/* Formation Dock and Auto-Complete */}
          <div className="mt-2 space-y-4">
            <FormationDock selectedFormation={selectedFormation} setSelectedFormation={setSelectedFormation} />
            
            <div className="grid grid-cols-3 gap-2">
              <button onClick={resetTeam} className="border border-[#1A1A1A] text-[#666] py-2 font-mono text-[9px] tracking-widest hover:border-[#333] hover:text-white transition-colors">RESET</button>
              <button onClick={autoCompleteTeam} className="border border-[#1A1A1A] text-[#666] py-2 font-mono text-[9px] tracking-widest hover:border-yellow-900 hover:text-yellow-500 transition-colors">AUTO FILL</button>
              <button onClick={intelligentAutoComplete} className="border border-green-900/50 text-green-500 py-2 font-mono text-[9px] tracking-widest hover:border-green-500 hover:bg-green-900/20 transition-colors">AI OPTIMIZE</button>
            </div>
          </div>
          
          {/* Submit button at bottom */}
          <div className="mt-6 pt-4 border-t border-[#1A1A1A]">
             {isTeamSubmitted ? (
                <div className="space-y-2">
                  <div className="text-center text-green-500 text-[10px] font-mono tracking-widest uppercase mb-2">✓ SQUAD SUBMITTED</div>
                  <button onClick={shareSquadOnX} className="w-full border border-[#1DA1F2] text-[#1DA1F2] py-3 font-mono text-xs tracking-widest hover:bg-[#1DA1F2] hover:text-black transition-colors flex items-center justify-center space-x-2">
                    <span>SHARE SQUAD ON 𝕏</span>
                  </button>
                </div>
             ) : selectedTeam.length === 11 ? (
                <button onClick={submitTeam} className="w-full border border-white text-white py-3 font-mono text-xs tracking-widest hover:bg-white hover:text-black transition-colors">SUBMIT TEAM (100,000 $test)</button>
             ) : (
                <button className="w-full border border-[#333] text-[#333] py-3 font-mono text-[10px] tracking-widest cursor-not-allowed">SELECT {11 - selectedTeam.length} MORE PLAYERS</button>
             )}
          </div>
        </div>

        {/* Right Column: PLAYER ROSTER */}
        <div className="w-full lg:w-[55%] flex flex-col bg-black overflow-hidden h-full">
          {/* Filter Bar */}
          <div className="flex border-b border-[#1A1A1A] p-4 justify-between items-center">
            <div className="flex space-x-2 overflow-x-auto pb-1 lg:pb-0">
              {['ALL', 'GK', 'DEF', 'MID', 'FWD'].map(pos => {
                const posStr = pos === 'GK' ? 'GKP' : pos;
                const posId = pos === 'ALL' ? '' : positions.find(p => p.singular_name_short === posStr)?.id;
                const isActive = (pos === 'ALL' && !filters.position) || (pos !== 'ALL' && filters.position == posId);
                return (
                  <button 
                    key={pos}
                    onClick={() => setFilters({...filters, position: posId})}
                    className={`px-3 py-1 border font-mono text-[10px] tracking-widest transition-colors ${
                      isActive 
                        ? 'bg-white text-black border-white' 
                        : 'border-[#1A1A1A] text-[#666] hover:border-[#333] hover:text-white'
                    }`}
                  >
                    {pos}
                  </button>
                );
              })}
            </div>
            <div className="relative w-48 ml-4">
              <input 
                type="text" 
                placeholder="Search..."
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
                className="w-full bg-transparent border border-[#1A1A1A] rounded-none py-1 px-3 text-xs text-white placeholder-[#333] focus:outline-none focus:border-[#333] font-mono transition-colors"
              />
            </div>
          </div>
          
          {/* Table Headers */}
          <div className="flex px-4 py-2 border-b border-[#1A1A1A] font-mono text-[9px] tracking-[0.2em] text-[#666]">
            <div className="w-[50%]">PLAYER</div>
            <div className="w-[15%] text-center">POS</div>
            <div className="w-[15%] text-center cursor-pointer hover:text-white transition-colors" onClick={() => setSortOption({ field: 'total_points', direction: sortOption.direction === 'desc' ? 'asc' : 'desc' })}>PTS {sortOption.field === 'total_points' ? (sortOption.direction === 'desc' ? '↓' : '↑') : ''}</div>
            <div className="w-[20%] text-right cursor-pointer hover:text-white transition-colors" onClick={() => setSortOption({ field: 'now_cost', direction: sortOption.direction === 'desc' ? 'asc' : 'desc' })}>PRICE {sortOption.field === 'now_cost' ? (sortOption.direction === 'desc' ? '↓' : '↑') : ''}</div>
          </div>

          {/* Player List */}
          <div className="flex-1 overflow-y-auto px-2 lg:px-4 py-1 pb-20 lg:pb-0">
            {getFilteredPlayers().slice(0, 100).map((player) => {
              const playerPos = positions.find(p => p.id === player.element_type)?.singular_name_short;
              const playerTeam = teams.find(t => t.id === player.team)?.short_name;
              const isAdded = selectedTeam.some(p => p.id === player.id);
              
              return (
                <div 
                  key={player.id} 
                  onClick={() => addPlayerToTeam(player)}
                  className={`flex items-center py-3 px-2 border-b border-[#1A1A1A]/50 transition-colors cursor-pointer group ${
                    isAdded ? 'opacity-30 pointer-events-none' : 'hover:bg-[#0a0a0a]'
                  }`}
                >
                  <div className="w-[50%] flex flex-col">
                    <span className="text-white font-bold text-sm truncate group-hover:text-green-500 transition-colors">{player.first_name} {player.second_name}</span>
                    <span className="text-[#666] text-[10px] uppercase tracking-wider mt-0.5">{playerTeam}</span>
                  </div>
                  <div className="w-[15%] text-center">
                    <span className="text-[#00FF00] font-mono text-[10px]">{playerPos}</span>
                  </div>
                  <div className="w-[15%] text-center text-white font-mono text-xs">
                    {player.total_points}
                  </div>
                  <div className="w-[20%] text-right">
                    <span className="text-[#8b9a90] font-mono text-sm">{(player.now_cost / 10).toFixed(1)}M</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>}
      {currentView === 'admin' && isAdmin && <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-white font-mono text-sm tracking-widest uppercase mb-8 border-b border-[#1A1A1A] pb-4">ADMIN CONTROL PANEL</h1>
        
        {/* Gameweek Management */}
        <div className="space-y-6">
          <div className="border border-[#1A1A1A] p-6 bg-[#050505]">
            <h2 className="text-white font-mono text-[10px] tracking-widest uppercase mb-4">GAMEWEEK MANAGEMENT</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-[#1A1A1A] p-4 bg-black">
                <span className="text-[#666] font-mono text-[9px] tracking-widest uppercase">Active Gameweek</span>
                <div className="text-white font-mono text-lg mt-1">{activeGameweek ? `GW ${activeGameweek.gameweek}` : 'NONE'}</div>
                <div className="text-[#666] font-mono text-[9px] mt-1">{activeGameweek ? `Status: ${activeGameweek.status}` : 'No gameweek active'}</div>
              </div>
              <div className="border border-[#1A1A1A] p-4 bg-black">
                <span className="text-[#666] font-mono text-[9px] tracking-widest uppercase">Prize Pool</span>
                <div className="text-green-500 font-mono text-lg mt-1">{activeGameweek ? `${activeGameweek.prizePool} $FPLS` : '0'}</div>
                <div className="text-[#666] font-mono text-[9px] mt-1">Entries: {activeGameweek?.entries?.length || entriesCount || 0}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <button onClick={createGameweek} className="border border-green-900 text-green-500 py-3 font-mono text-[9px] tracking-widest hover:bg-green-900/20 transition-colors">
                ACTIVATE GW
              </button>
              <button onClick={syncGameweekWithFPL} className="border border-yellow-900 text-yellow-500 py-3 font-mono text-[9px] tracking-widest hover:bg-yellow-900/20 transition-colors">
                SYNC FPL
              </button>
              <button onClick={finalizeGameweek} className="border border-red-900 text-red-500 py-3 font-mono text-[9px] tracking-widest hover:bg-red-900/20 transition-colors">
                FINALIZE GW
              </button>
              <button onClick={deleteGameweek} className="border border-red-900 text-red-500 py-3 font-mono text-[9px] tracking-widest hover:bg-red-900/20 transition-colors">
                DELETE GW
              </button>
            </div>
            <button onClick={clearAndRepopulateFixtures} className="w-full mt-3 border border-[#1A1A1A] text-[#666] py-2 font-mono text-[9px] tracking-widest hover:border-[#333] hover:text-white transition-colors">
              CLEAR & REPOPULATE FIXTURES
            </button>
          </div>
          
          {/* Smart Contract Info */}
          <div className="border border-[#1A1A1A] p-6 bg-[#050505]">
            <h2 className="text-white font-mono text-[10px] tracking-widest uppercase mb-4">SMART CONTRACTS</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-[#0a0a0a] pb-2">
                <span className="text-[#666] font-mono text-[9px] uppercase">$FPLS Token</span>
                <span className="text-white font-mono text-[9px]">{FPLS_ADDRESS.slice(0,10)}...{FPLS_ADDRESS.slice(-6)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#0a0a0a] pb-2">
                <span className="text-[#666] font-mono text-[9px] uppercase">Chain</span>
                <span className="text-white font-mono text-[9px]">Robinhood Chain Mainnet (4663)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#666] font-mono text-[9px] uppercase">Admin Wallet</span>
                <span className="text-green-500 font-mono text-[9px]">{userWallet?.slice(0,10)}...{userWallet?.slice(-6)}</span>
              </div>
            </div>
          </div>

          {/* Test Run Checklist */}
          <div className="border border-[#1A1A1A] p-6 bg-[#050505]">
            <h2 className="text-white font-mono text-[10px] tracking-widest uppercase mb-4">TEST RUN CHECKLIST</h2>
            <div className="space-y-2">
              {[
                { label: 'Gameweek activated', done: !!activeGameweek },
                { label: 'Players loaded from FPL API', done: players.length > 0 },
                { label: 'Wallet connected', done: !!userWallet },
                { label: 'Admin verified', done: isAdmin },
                { label: 'Fixtures populated', done: true },
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <span className={`font-mono text-xs ${item.done ? 'text-green-500' : 'text-red-500'}`}>{item.done ? '✓' : '✗'}</span>
                  <span className="text-[#666] font-mono text-[9px] tracking-widest uppercase">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Historical Games */}
          {adminGames && adminGames.length > 0 && <div className="border border-[#1A1A1A] p-6 bg-[#050505]">
            <h2 className="text-white font-mono text-[10px] tracking-widest uppercase mb-4">HISTORICAL GAMEWEEKS</h2>
            <div className="space-y-2">
              {adminGames.map((game, i) => (
                <div key={i} className="flex justify-between items-center border-b border-[#0a0a0a] pb-2 text-[9px] font-mono">
                  <span className="text-white">GW {game.gameweek}</span>
                  <span className={`${game.status === 'active' ? 'text-green-500' : game.status === 'finished' ? 'text-yellow-500' : 'text-[#666]'}`}>{game.status?.toUpperCase()}</span>
                  <span className="text-[#666]">{game.prizePool || 0} $FPLS</span>
                </div>
              ))}
            </div>
          </div>}
        </div>
      </div>}
    </main>
    { }
    <footer className={`${theme === 'dark' ? 'bg-black/80' : 'bg-gray-100/90'} backdrop-blur-md border-t ${theme === 'dark' ? 'border-green-900/50' : 'border-gray-300'} py-12 mt-12`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-black text-green-500 mb-4 cinematic-text">FPL.STOCKS</h3>
            <p className="text-sm text-gray-500 font-mono">
              The premier fantasy football experience powered by Real World Assets on the Robinhood Chain.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-300 mb-4 font-mono">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-500 font-mono">
              <li><a href="#" className="hover:text-green-400 transition-colors">Terms and Conditions</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Risk Disclaimer</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-300 mb-4 font-mono">Community</h4>
            <div className="flex items-center space-x-3">
              <a href="https://x.com/kasperwtrcolor" target="_blank" rel="noopener noreferrer" className="bg-green-900/30 hover:bg-green-800/50 text-green-400 p-3 rounded-lg transition-all duration-200 border border-green-700/30">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-xs text-gray-600 font-mono">&copy; {new Date().getFullYear()} FPL.STOCKS on Robinhood Chain. All rights reserved.</p>
        </div>
      </div>
    </footer>
    { }
    { }
    {isLoading && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <SpotlightCard className="bg-black/90 backdrop-blur-md rounded-xl border border-yellow-700/50 p-12 text-center" glowColor="yellow" size="lg" intensity={1.5}>
        <div className="space-y-6">
          <LoadingWave bars={8} message={loadingMessage || "Processing..."} messagePosition="bottom" size="lg" color="yellow" />
          <div className="space-y-2">
            <p className="text-yellow-100 text-sm" >
              Please wait, this may take a moment...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent"></div>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </div>}

  </div>);
}
export default App;