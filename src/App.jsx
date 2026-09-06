import { useState, useEffect, useRef, useCallback } from 'react';
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { FPLS_ABI, FPLGAME_ABI, FPLS_ADDRESS, FPLGAME_ADDRESS, TREASURY_ADDRESS, RWA_GME_ADDRESS, ERC20_ABI } from './config/contracts';
import { injected } from 'wagmi/connectors';
import { Users, Clock, TrendingUp, Calendar, Trophy, ArrowRight, User, BarChart3, Medal, Target, Home, Target as TeamIcon, Info, Sun, Moon, RotateCcw, Zap, LogIn, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import * as firebaseService from './firebaseService';
import { VectorKit } from './components/VectorKit';
import { TeamShield } from './components/TeamShield';
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
    }} className="text-3xl md:text-gray-500xl font-black text-transparent bg-clip-text relative z-10 text-center uppercase" style={{
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
          <span className="bg-transparent/50 px-3 py-2 rounded-md border border-[var(--border-light)]">{days.toString().padStart(2, '0')}</span>
          <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Days</span>
        </div>
        <span className="py-2 text-gray-600">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-transparent/50 px-3 py-2 rounded-md border border-[var(--border-light)]">{hours.toString().padStart(2, '0')}</span>
          <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Hrs</span>
        </div>
        <span className="py-2 text-gray-600">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-transparent/50 px-3 py-2 rounded-md border border-[var(--border-light)]">{minutes.toString().padStart(2, '0')}</span>
          <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Min</span>
        </div>
        <span className="py-2 text-gray-600">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-transparent/50 px-3 py-2 rounded-md border border-[var(--border-light)]">{seconds.toString().padStart(2, '0')}</span>
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
    { id: 'team', label: 'Team Builder', icon: TeamIcon },
    { id: 'leaderboard', label: 'Leaderboard & Rewards', icon: Trophy },
    { id: 'fixtures', label: 'Fixtures & Live', icon: Calendar },
    { id: 'profile', label: 'Manager Profile', icon: User },
    { id: 'rules', label: 'How It Works', icon: Info },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Zap }] : [])
  ];

  return (
    <nav className="flex items-center gap-1.5 md:gap-2 px-4 py-2.5 overflow-x-auto w-full justify-start md:justify-center border-b border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
      {navItems.map(item => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button 
            key={item.id} 
            onClick={() => setCurrentView(item.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
              isActive 
                ? 'bg-emerald-600 text-white shadow-emerald-glow' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
            <span>{item.label}</span>
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
const FormationDock = ({ selectedFormation, setSelectedFormation }) => {
  const formations = [
    { value: '4-4-2', label: 'Balanced' },
    { value: '4-3-3', label: 'Attacking' },
    { value: '3-5-2', label: 'Midfield Heavy' },
    { value: '3-4-3', label: 'Ultra Attack' },
    { value: '5-3-2', label: 'Defensive' },
    { value: '5-4-1', label: 'Ultra Defensive' }
  ];
  return (
    <div className="flex items-center justify-center gap-1.5 md:gap-2 flex-wrap">
      {formations.map(f => {
        const isActive = selectedFormation === f.value;
        return (
          <button
            key={f.value}
            onClick={() => setSelectedFormation(f.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-150 cursor-pointer ${
              isActive 
                ? 'bg-emerald-600 text-white shadow-emerald-glow' 
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-subtle'
            }`}
          >
            <span>{f.value}</span>
            <span className="ml-1 text-[10px] opacity-70 hidden sm:inline font-sans font-normal">{f.label}</span>
          </button>
        );
      })}
    </div>
  );
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

        <h1 className="text-6xl md:text-[110px] leading-[0.85] font-black text-black dark:text-white tracking-tighter text-center mb-8 font-hand">
          WINNER<br/>TAKES ALL
        </h1>
        
        <p className="text-gray-500 font-mono text-[10px] md:text-xs uppercase tracking-[0.25em] text-center max-w-lg leading-relaxed mb-12">
          The world's first deflationary fantasy premier league game powered by Robinhood Chain.
        </p>
        
        <button onClick={() => setCurrentView('team')} className="btn-brutal px-12 py-4 text-xl mb-6">
        
          BUILD SQUAD
        </button>

        {activeGameweek && (
          <div className="flex items-center gap-3 bg-gray-100 dark:bg-zinc-800 border border-[#1a1a1a] px-4 py-2 rounded-full">
            <div className="w-2 h-2 rounded-full bg-[var(--emerald-glow)] animate-pulse"></div>
            <span className="text-black dark:text-white font-mono font-bold text-[10px] uppercase tracking-widest">Gameweek {activeGameweek.gameweek} Active</span>
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
            <h2 className="text-black dark:text-white font-bold font-mono text-xs tracking-[0.2em] uppercase">01 / The Entry</h2>
            <h3 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter uppercase leading-none font-hand">Stake to Play</h3>
            <p className="text-gray-600 dark:text-gray-400 font-mono text-xs leading-relaxed max-w-md">
              Pay the 100,000 $FPLS entry fee to join the gameweek. 90% goes to the winner-takes-all Prize Pool, and 10% is burned forever to create a deflationary ecosystem.
            </p>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-[var(--emerald-glow)] opacity-10 blur-2xl rounded-full"></div>
            <img src="/fpl_entry.jpg" alt="Terminal Entry" className="relative z-10 w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl opacity-90 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
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
            <h3 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter uppercase leading-none font-hand">Manage £70M</h3>
            <p className="text-gray-600 dark:text-gray-400 font-mono text-xs leading-relaxed max-w-md">
              You have exactly £70.0M to build your dream team of 11 players. Player prices match the official Fantasy Premier League data. Spend wisely to maximize your point potential.
            </p>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-yellow-500 opacity-10 blur-2xl rounded-full"></div>
            <img src="/fpl_budget.jpg" alt="Budget Terminal" className="relative z-10 w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl opacity-90 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
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
            <h2 className="text-black dark:text-white font-bold font-mono text-xs tracking-[0.2em] uppercase">03 / Tactics</h2>
            <h3 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tighter uppercase leading-none font-hand">Formations & Captains</h3>
            <p className="text-gray-600 dark:text-gray-400 font-mono text-xs leading-relaxed max-w-md">
              Choose from 6 dynamic formations (e.g. 3-4-3, 4-4-2). Select your Captain carefully—they score double points for the gameweek based on their real-life performance via Chainlink Oracle data.
            </p>
          </div>
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-[var(--emerald-glow)] opacity-10 blur-2xl rounded-full"></div>
            <img src="/fpl_pitch.jpg" alt="Pitch Terminal" className="relative z-10 w-full border border-gray-300 dark:border-gray-700 rounded-lg shadow-2xl opacity-90 hover:opacity-100 transition-opacity grayscale hover:grayscale-0" />
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
  const [currentView, setCurrentView] = useState('team');
  const [activeGameweek, setActiveGameweek] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [hasEnteredApp, setHasEnteredApp] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [allGames, setAllGames] = useState([]);
  const [selectedLeaderboardGw, setSelectedLeaderboardGw] = useState(null);
  const [selectedLeaderboardGame, setSelectedLeaderboardGame] = useState(null);
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
  const [theme, setTheme] = useState('light');
  const [showRosterModal, setShowRosterModal] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [selectedFormation, setSelectedFormation] = useState('4-3-3');
  const [, setHasAccess] = useState(false);
  const [userInviteCode, setUserInviteCode] = useState(null);
  const [adminInviteCodes, setAdminInviteCodes] = useState([]);
  const [generateCount, setGenerateCount] = useState(5);
  const [gameweekDeadline, setGameweekDeadline] = useState(null);
  const [isAfterDeadline, setIsAfterDeadline] = useState(false);
  const [gw1Countdown, setGw1Countdown] = useState('Loading...');
  const [liveFixtures, setLiveFixtures] = useState([]);
  const [allFplFixtures, setAllFplFixtures] = useState([]);
  const [browsingFixtureGw, setBrowsingFixtureGw] = useState(3);
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
          teamsMap[t.id] = { id: t.id, name: t.name, short_name: t.short_name, code: t.code };
        });
        setFplTeams(teamsMap);

        const nextGw = bootstrapData.events.find(e => e.is_next) || bootstrapData.events.find(e => e.id === 1) || bootstrapData.events[0];
        if (nextGw) {
          setTargetDate(new Date(nextGw.deadline_time).getTime());
          
          const fixturesRes = await fetch('/api/fpl?path=fixtures/');
          const fixturesData = await fixturesRes.json();
          if (Array.isArray(fixturesData)) {
            setAllFplFixtures(fixturesData);
            setBrowsingFixtureGw(nextGw ? nextGw.id : 3);
          }
          const nextGwFixtures = Array.isArray(fixturesData) ? fixturesData.filter(f => f.event === nextGw.id).slice(0, 3) : [];
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
  
  // Calculate active gameweek submission window & deadline
  const activeGwNumber = activeGameweek?.gameweek || 3;
  const currentGwFixtures = allFplFixtures.filter(f => f.event === activeGwNumber);

  let firstKickoff = null;
  let lastKickoff = null;
  let activeGwDeadline = null;
  let estimatedReopenTime = null;
  let isSubmissionOpen = true;

  if (currentGwFixtures.length > 0) {
    const validKickoffs = currentGwFixtures
      .filter(f => f.kickoff_time)
      .map(f => new Date(f.kickoff_time).getTime())
      .sort((a, b) => a - b);

    if (validKickoffs.length > 0) {
      firstKickoff = new Date(validKickoffs[0]);
      lastKickoff = new Date(validKickoffs[validKickoffs.length - 1]);
      activeGwDeadline = new Date(firstKickoff.getTime() - 60 * 60 * 1000); // 1 hour before first kickoff
      estimatedReopenTime = new Date(lastKickoff.getTime() + 115 * 60 * 1000); // ~2 hours after last kickoff
      isSubmissionOpen = new Date() < activeGwDeadline;
    }
  }

  const currentUserEntry = activeGameweek ? userEntries.find(e => e.gameId === activeGameweek.id) : null;
  const isTeamSubmitted = !!currentUserEntry;
  useEffect(() => {
    if (currentUserEntry && players.length > 0) {
      try {
        const teamIds = JSON.parse(currentUserEntry.team);
        const submittedTeam = teamIds.map(id => players.find(p => p.id === id)).filter(Boolean);
        setSelectedTeam(submittedTeam);
        
        const cap = players.find(p => p.id.toString() === currentUserEntry.captain);
        if (cap) setCaptain(cap);
        
        const actualCost = submittedTeam.reduce((sum, p) => sum + p.now_cost, 0);
        setTeamBudget(700 - actualCost);
      } catch (error) {
        console.error('Error parsing user entry:', error);
      }
    }
  }, [currentUserEntry, players]);
  // Real-time Firestore listeners (replaces socket.io)
  useEffect(() => {
    setIsConnected(true);
    // Listen for active game changes
    const unsubGames = firebaseService.subscribeToCollection('games', {}, (games) => {
      if (games.length > 0) {
        const sorted = [...games].sort((a, b) => b.gameweek - a.gameweek);
        setAllGames(sorted);
        const activeGame = sorted.find(g => g.status === 'active') || sorted[0];
        if (activeGame) {
          activeGame.entryFee = 100000;
          setActiveGameweek(prev => {
            if (!prev || prev.id !== activeGame.id || prev.prizePool !== activeGame.prizePool || prev.status !== activeGame.status) {
              return activeGame;
            }
            return prev;
          });
        }
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
    if (!rawLeaderboard || rawLeaderboard.length === 0) {
      setLeaderboard([]);
      return;
    }
    const isFinished = selectedLeaderboardGame?.status === 'finished' || activeGameweek?.status === 'finished';
    if (players.length > 0 && isGameweekStarted && !isFinished) {
      const liveLeaderboard = calculateLiveLeaderboard(rawLeaderboard, players, livePoints);
      setLeaderboard(liveLeaderboard);
      setUserEntries(prevEntries => {
        return prevEntries.map(entry => {
          const liveEntry = liveLeaderboard.find(le => le.id === entry.id);
          return liveEntry ? liveEntry : entry;
        });
      });
    } else {
      const entriesWithPoints = rawLeaderboard.map(entry => ({
        ...entry,
        points: entry.points || 0
      })).sort((a, b) => (b.points || 0) - (a.points || 0));
      setLeaderboard(entriesWithPoints);
    }
  }, [rawLeaderboard, players, activeGameweek?.status, selectedLeaderboardGame?.status, isGameweekStarted]);
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
        walletAddress: userWallet
      });
      setUserStats(stats[0] || null);
      const entries = await firebaseService.listEntities('entries', {
        walletAddress: userWallet
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
      const finishedWinnerGames = allGames.filter(game => game.status === 'finished' && game.winnerId && userWallet && game.winnerId.toLowerCase() === userWallet.toLowerCase());
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
    setLoadingMessage('Securing Oracle Signature...');
    try {
      const gameToClaim = claimableWinnings.find(g => g.id === gameId);
      if (!gameToClaim) throw new Error("Game not found in claimable winnings");

      // 1. Fetch Signature from Oracle
      const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameweek: gameToClaim.gameweek,
          winner: userWallet,
          totalPrizePool: gameToClaim.prizePool.toString()
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get oracle signature');
      
      setLoadingMessage('Please confirm the transaction in MetaMask...');
      
      // 2. Submit Transaction
      const { PRIZE_POOL_ADDRESS, PRIZE_POOL_ABI } = await import('./config/contracts.js');
      
      const txHash = await writeContractAsync({
        address: PRIZE_POOL_ADDRESS,
        abi: PRIZE_POOL_ABI,
        functionName: 'claimPrize',
        args: [
           BigInt(gameToClaim.gameweek),
           BigInt(gameToClaim.prizePool),
           data.signature
        ],
      });
      
      console.log('Claim tx:', txHash);
      setLoadingMessage('Waiting for confirmation...');
      
      // 3. Record in DB
      await firebaseService.createEntity('payouts', {
        gameId: gameId,
        winnerId: userWallet,
        txHash: txHash
      });
      
      alert('Prize claimed successfully on-chain!');
      await loadClaimableWinnings();
      await loadUserData();
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
      const data = await fetchFplJson('https://fantasy.premierleague.com/api/bootstrap-static/');
      const fixturesData = await fetchFplJson('https://fantasy.premierleague.com/api/fixtures/');
      
      let currentFplEvent = data.events.find(event => event.is_current === true) || data.events.find(event => event.is_next === true);
      
      if (!currentFplEvent) {
        console.log('No current or next event found in FPL API');
        return;
      }
      
      let currentGameweekNumber = currentFplEvent.id;
      let isFplFinished = currentFplEvent.finished && currentFplEvent.data_checked;

      // Smart progression: If the current gameweek's fixtures are all finished, move to the next one
      const gameweekFixtures = fixturesData.filter(fixture => fixture.event === currentGameweekNumber && fixture.kickoff_time !== null);
      if (gameweekFixtures.length > 0) {
        const allFixturesFinished = gameweekFixtures.every(fixture => fixture.finished === true);
        if (allFixturesFinished && !isFplFinished) {
           isFplFinished = true;
        }
        
        if (allFixturesFinished) {
          const nextEvent = data.events.find(event => event.id === currentGameweekNumber + 1);
          if (nextEvent) {
             currentGameweekNumber = nextEvent.id;
             isFplFinished = false; // Next one hasn't finished yet
          }
        }
      }

      // Reusable Auto-Finalize Logic
      const autoFinalizeGame = async (gameDoc) => {
        try {
          const existingEntries = await firebaseService.listEntities('entries', { gameId: gameDoc.id });
          if (existingEntries.length === 0) {
            return await firebaseService.updateEntity('games', gameDoc.id, { 
              status: 'finished',
              prizePool: 0 
            });
          }
          
          // Sort by points (highest first)
          const sortedEntries = existingEntries.sort((a, b) => (b.points || 0) - (a.points || 0));
          const winner = sortedEntries[0];
          const calculatedPool = existingEntries.length * (gameDoc.entryFee || 100000);
          
          console.log(`Auto-finalizing GW ${gameDoc.gameweek}: Winner ${winner.walletAddress} with ${winner.points || 0} pts`);

          return await firebaseService.updateEntity('games', gameDoc.id, {
            status: 'finished',
            winnerId: winner.walletAddress,
            prizePool: calculatedPool
          });
        } catch (e) {
          console.error("Auto finalize failed for game", gameDoc.id, e);
          return gameDoc;
        }
      };

      // 1. Check and automatically finalize any prior gameweeks that are still active
      const allExistingGames = await firebaseService.listEntities('games');
      for (const g of allExistingGames) {
        if (g.gameweek < currentGameweekNumber && g.status === 'active') {
          console.log(`Automatically marking prior Gameweek ${g.gameweek} as finished`);
          await autoFinalizeGame(g);
        }
      }

      // Refresh games list after potential finalizations
      const refreshedGames = await firebaseService.listEntities('games');
      setAllGames(refreshedGames.sort((a, b) => b.gameweek - a.gameweek));

      // 2. Fetch or create active game for currentGameweekNumber
      let games = refreshedGames.filter(g => g.gameweek === currentGameweekNumber);
      let activeGame;
      
      if (games.length === 0) {
        console.log('Auto-creating gameweek', currentGameweekNumber);
        activeGame = await firebaseService.createEntity('games', {
          gameweek: currentGameweekNumber,
          status: isFplFinished ? 'finished' : 'active',
          prizePool: 0,
          entryFee: 100000
        });
      } else {
        activeGame = games[0];
        if (isFplFinished && activeGame.status === 'active') {
          activeGame = await autoFinalizeGame(activeGame);
        } else if (!isFplFinished && activeGame.status !== 'active') {
          activeGame = await firebaseService.updateEntity('games', activeGame.id, {
            status: 'active'
          });
        }
      }
      
      activeGame.entryFee = 100000;
      const entries = await firebaseService.listEntities('entries', {
        gameId: activeGame.id
      });
      activeGame.prizePool = entries.length * 100000;
      
      setActiveGameweek(prev => {
        if (!prev || prev.id !== activeGame.id || prev.prizePool !== activeGame.prizePool || prev.status !== activeGame.status) {
          return activeGame;
        }
        return prev;
      });
    } catch (error) {
      console.error('Error in loadActiveGameweek:', error);
    }
  };
    const loadLeaderboardForGameweek = async (gwNumber) => {
    try {
      let games = allGames;
      if (games.length === 0) {
        games = await firebaseService.listEntities('games');
        setAllGames(games.sort((a, b) => b.gameweek - a.gameweek));
      }
      let targetGame = games.find(g => g.gameweek === gwNumber);
      if (!targetGame) {
        const matching = await firebaseService.listEntities('games', { gameweek: gwNumber });
        if (matching.length > 0) targetGame = matching[0];
      }
      setSelectedLeaderboardGame(targetGame || null);
      if (targetGame) {
        await loadLeaderboard(targetGame.id);
      } else {
        setRawLeaderboard([]);
        setLeaderboard([]);
      }
    } catch (err) {
      console.error('Error loading leaderboard for gameweek:', gwNumber, err);
      setRawLeaderboard([]);
      setLeaderboard([]);
    }
  };

  useEffect(() => {
    if (activeGameweek?.gameweek && selectedLeaderboardGw === null) {
      setSelectedLeaderboardGw(activeGameweek.gameweek);
      setSelectedLeaderboardGame(activeGameweek);
    }
  }, [activeGameweek?.gameweek, selectedLeaderboardGw]);

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
        winnerId: winner.walletAddress,
        prizePool: totalPrizePool
      });
      setLoadingMessage('Updating user statistics...');
      for (const entry of entries) {
        try {
          let userStatsRecords = await firebaseService.listEntities('user_stats', {
            walletAddress: entry.walletAddress
          });
          let userStatsRecord;
          if (userStatsRecords.length === 0) {
            userStatsRecord = await firebaseService.createEntity('user_stats', {
              walletAddress: entry.walletAddress
            });
          } else {
            userStatsRecord = userStatsRecords[0];
          }
          const isWinner = entry.walletAddress === winner.walletAddress;
          const updatedStats = {
            wins: (userStatsRecord.wins || 0) + (isWinner ? 1 : 0),
            losses: (userStatsRecord.losses || 0) + (isWinner ? 0 : 1),
            totalEarnings: (userStatsRecord.totalEarnings || 0) + (isWinner ? totalPrizePool * 0.95 : 0)
          };
          await firebaseService.updateEntity('user_stats', userStatsRecord.id, updatedStats);
        } catch (statError) {
          console.error(`Error updating stats for user ${entry.walletAddress}:`, statError);
        }
      }

      await loadActiveGameweek();
      await loadLeaderboard(activeGameweek.id);
      await loadUserData();
      await loadActiveGameweek();
      if (activeGameweek?.id) {
        await loadLeaderboard(activeGameweek.id);
      }

      alert(`Gameweek finalized! Winner: ${winner.walletAddress.slice(0, 8)}... with ${winner.points || 0} points`);
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
      const shareText = `⚽ My fpl.sol Gameweek ${activeGameweek?.gameweek} team is locked in! 🚀\n\n${teamText}\n💎 ${currentUserEntry.points || 0} points so far\n💰 ${formatPrice(currentUserEntry.teamValue)} team value\n\nJoin the crypto fantasy revolution: fplstocks.com\n\n@fpl_sol #FPL #Robinhood Chain #Fantasy`;
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
- Include the app link: fplstocks.com
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
      setGeneratedShareMessage('🔥 The crypto fantasy revolution is here! Build your Premier League dream team and win $FPLS rewards on @fpl_sol ⚽💰 #FPL #RobinhoodChain #Fantasy fplstocks.com');
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
    if (!isSubmissionOpen && !isAdmin) {
      alert(`Team submission deadline has passed! Submissions closed 1 hour before the first match kick-off. Submissions for Gameweek ${activeGwNumber + 1} will open when current gameweek matches finish.`);
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Submitting team & processing payment...');
    let teamSubmissionSuccess = false;
    try {
      console.log('--- submitTeam START ---');
      console.log('Active Gameweek ID:', activeGameweek.id);
      console.log('Entry Fee:', activeGameweek.entryFee);
      
      setLoadingMessage('Sending 100,000 $FPLS to Prize Pool...');
      const playerIds = selectedTeam.map(p => p.id);
      const enterTx = await writeContractAsync({
        address: FPLS_ADDRESS,
        abi: FPLS_ABI,
        functionName: 'transfer',
        args: [TREASURY_ADDRESS, BigInt('100000000000000000000000')], // 100,000 $FPLS to treasury
      });
      console.log('Transfer Tx Hash:', enterTx);
      refetchBalance(); // Update user's balance after transfer
      
      setLoadingMessage('Recording entry to database...');
      await firebaseService.createEntity('entries', {
        walletAddress: userWallet,
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
    const downloadSocialCard = async () => {
    const pitchElement = document.getElementById('squad-pitch-container');
    if (!pitchElement) return;
    try {
      setLoadingMessage('Generating social card...');
      setIsLoading(true);
      
      // We will temporarily add a watermark before capturing
      const watermark = document.createElement('div');
      watermark.id = 'watermark-overlay';
      watermark.innerHTML = '<div style="position: absolute; bottom: 10px; right: 20px; font-family: monospace; font-weight: bold; font-size: 16px; color: rgba(255, 255, 255, 0.9); text-shadow: 0px 0px 4px rgba(0,0,0,0.8); z-index: 100;">fpl.stocks</div>';
      pitchElement.appendChild(watermark);

      const canvas = await html2canvas(pitchElement, {
        backgroundColor: '#050505',
        scale: 2,
        useCORS: true, // For images from premierleague.com
        logging: false
      });
      
      pitchElement.removeChild(watermark);
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = 'fpl_squad.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error capturing social card:", err);
      alert("Failed to generate social card image.");
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  const getShareSquadUrl = () => {
    if (!selectedTeam || selectedTeam.length === 0) return '#';
    const formationStr = selectedFormation;
    const captainName = captain ? `${captain.first_name} ${captain.second_name}` : 'None';
    const teamValue = ((700 - teamBudget) / 10).toFixed(1);
    const playerLines = selectedTeam.map(p => {
      const pos = positions.find(pt => pt.id === p.element_type)?.singular_name_short || '?';
      const isCap = captain && captain.id === p.id;
      return `${isCap ? '©️ ' : ''}${p.second_name} (${pos})`;
    }).join(' | ');
    const shareText = `⚽ My fpl.stock Squad (${formationStr})\n\n${playerLines}\n\n👑 Captain: ${captainName}\n💰 Team Value: £${teamValue}M\n\nBuild yours & compete for the prize pool 👇\nfplstocks.com\n\n#FPL #fplstock #RobinhoodChain`;
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
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
    const shareText = `⚽ My fpl.stock Squad (${formationStr})\n\n${playerLines}\n\n👑 Captain: ${captainName}\n💰 Team Value: £${teamValue}M\n\nBuild yours & compete for the prize pool 👇\nfplstocks.com\n\n#FPL #fplstock #RobinhoodChain`;
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
              return <SpotlightCard key={fixture.fixtureId} className="bg-transparent/30 backdrop-blur-sm rounded-lg p-4 border border-green-700/20" glowColor="blue" size="sm" intensity={0.8}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <TeamShield teamId={fixture.homeTeam} shortName={homeTeam?.short_name} teamCode={homeTeam?.code} className="w-8 h-8" />
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
                    <TeamShield teamId={fixture.awayTeam} shortName={awayTeam?.short_name} teamCode={awayTeam?.code} className="w-8 h-8" />
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
  const FormationDisplay = ({ isTeamSubmitted }) => {
    const goalkeepers = getPlayersByPosition(1);
    const defenders = getPlayersByPosition(2);
    const midfielders = getPlayersByPosition(3);
    const forwards = getPlayersByPosition(4);
    const requirements = getFormationRequirements(selectedFormation);

    const PlayerCard = ({ player, position }) => {
      const isCaptain = captain && captain.id === player.id;
      return (
        <div 
          className="relative group p-0.5" 
          onClick={() => !isTeamSubmitted && setCaptain(player)}
        >
          <div className="bg-slate-900/90 text-white rounded-xl p-1.5 md:p-2 text-center min-w-[76px] md:min-w-[96px] border border-emerald-500/40 shadow-lg hover:border-emerald-400 transition-all">
            {isCaptain && (
              <div className="absolute -top-2 -left-1 bg-amber-400 text-slate-950 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center font-mono shadow-md border border-amber-200 z-10">
                C
              </div>
            )}
            <div className="mb-1 py-0.5 flex justify-center items-center">
              <VectorKit 
                player={player} 
                shortName={fplTeams[player.team]?.short_name}
                className="w-10 h-12 md:w-12 md:h-14 mx-auto" 
              />
            </div>
            <div className="text-[10px] font-bold truncate text-slate-100 leading-tight">
              {player.second_name || player.first_name}
            </div>
            <div className="flex justify-between items-center text-[9px] mt-1 px-0.5 font-mono text-slate-400">
              <span>{formatPrice(player.now_cost)}</span>
              {isTeamSubmitted && (
                <span className="text-emerald-400 font-bold text-[10px]">
                  {isGameweekStarted ? player.event_points || 0 : 0} PTS
                </span>
              )}
            </div>
          </div>
          {!isTeamSubmitted && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); removePlayerFromTeam(player); }} 
                className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow-md hover:bg-rose-500 transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer z-10"
                title="Remove player"
              >
                ×
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setCaptain(player); }} 
                className={`absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 ${isCaptain ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300 border border-slate-600'} rounded-full px-2 py-0.5 text-[9px] font-mono shadow-md hover:bg-amber-400 hover:text-slate-950 transition-all cursor-pointer z-10`}
                title="Make Captain (2x PTS)"
              >
                {isCaptain ? 'Captain' : 'Make C'}
              </button>
            </>
          )}
        </div>
      );
    };

    const EmptySlot = ({ position, posId }) => (
      <button 
        type="button"
        onClick={() => {
          if (!isTeamSubmitted) {
            setFilters(prev => ({ ...prev, position: posId || '' }));
            setShowRosterModal(true);
          }
        }}
        className="group bg-slate-900/50 hover:bg-emerald-950/60 text-slate-400 hover:text-emerald-300 rounded-xl p-2 text-center min-w-[76px] md:min-w-[96px] border-2 border-dashed border-emerald-500/30 hover:border-emerald-400 transition-all flex flex-col items-center justify-center h-24 md:h-28 cursor-pointer"
      >
        <span className="text-xl font-light group-hover:scale-125 transition-transform">+</span>
        <span className="text-[10px] font-mono uppercase tracking-wider font-bold mt-0.5">{position}</span>
        <span className="text-[8px] text-slate-500 group-hover:text-emerald-400">Add</span>
      </button>
    );

    return (
      <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-800/60 dark:border-emerald-500/30 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 shadow-2xl p-6 md:p-10 w-full max-w-4xl mx-auto">
        {/* Pitch Tactical Markings */}
        <div className="absolute inset-4 rounded-2xl border border-white/20 pointer-events-none">
          <div className="absolute inset-x-0 top-1/2 h-0 border-t border-white/20"></div>
          <div className="absolute left-1/2 top-1/2 w-32 h-32 border border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-b border-x border-white/20"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-t border-x border-white/20"></div>
        </div>

        {/* Squad Tactical Lines */}
        <div className="relative z-10 space-y-6 md:space-y-10">
          {/* Forwards */}
          <div className="flex justify-center items-center gap-3 md:gap-6 flex-wrap">
            {forwards.map(player => <PlayerCard key={player.id} player={player} position="FWD" />)}
            {!isTeamSubmitted && Array(Math.max(0, requirements[4] - forwards.length)).fill(0).map((_, i) => (
              <EmptySlot key={`fwd-empty-${i}`} position="FWD" posId={positions.find(p => p.singular_name_short === 'FWD')?.id} />
            ))}
          </div>

          {/* Midfielders */}
          <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap">
            {midfielders.map(player => <PlayerCard key={player.id} player={player} position="MID" />)}
            {!isTeamSubmitted && Array(Math.max(0, requirements[3] - midfielders.length)).fill(0).map((_, i) => (
              <EmptySlot key={`mid-empty-${i}`} position="MID" posId={positions.find(p => p.singular_name_short === 'MID')?.id} />
            ))}
          </div>

          {/* Defenders */}
          <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap">
            {defenders.map(player => <PlayerCard key={player.id} player={player} position="DEF" />)}
            {!isTeamSubmitted && Array(Math.max(0, requirements[2] - defenders.length)).fill(0).map((_, i) => (
              <EmptySlot key={`def-empty-${i}`} position="DEF" posId={positions.find(p => p.singular_name_short === 'DEF')?.id} />
            ))}
          </div>

          {/* Goalkeeper */}
          <div className="flex justify-center items-center">
            {goalkeepers.map(player => <PlayerCard key={player.id} player={player} position="GK" />)}
            {!isTeamSubmitted && goalkeepers.length === 0 && (
              <EmptySlot position="GK" posId={positions.find(p => p.singular_name_short === 'GKP')?.id} />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Main UI Render
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900/95 text-white border border-emerald-500/50 p-4 rounded-2xl shadow-xl flex items-center space-x-3 max-w-md animate-in slide-in-from-bottom-5">
          <div className="bg-emerald-500/20 p-2 rounded-xl">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-wider">{toast.title}</h4>
            <p className="text-slate-200 text-xs mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Modern Top Header */}
      <header className="flex justify-between items-center px-4 md:px-8 py-3.5 border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-emerald-glow">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base md:text-lg tracking-tight text-slate-900 dark:text-white">
                FPL<span className="text-emerald-600 dark:text-emerald-400">.STOCK</span>
              </span>
              <span className="hidden sm:inline px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                Robinhood Chain
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase">
              Powered by $FPLS
            </p>
          </div>
        </div>

        {/* Status Pill & Wallet Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Live Gameweek Pill */}
          {activeGameweek && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">GW {activeGameweek.gameweek}</span>
              <span className="text-slate-400 text-[10px]">•</span>
              <span className="text-slate-500 dark:text-slate-400 capitalize">{activeGameweek.status}</span>
            </div>
          )}

          {/* Prize Pool Ticker */}
          <div className="hidden sm:flex flex-col items-end px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-right">
            <span className="text-[9px] uppercase tracking-wider font-semibold text-emerald-700 dark:text-emerald-400">Prize Pool</span>
            <span className="text-xs md:text-sm font-mono font-bold text-emerald-900 dark:text-emerald-200">
              {((activeGameweek?.prizePool || entriesCount * 100000) * 0.9).toLocaleString()} $FPLS
            </span>
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Web3 Connect */}
          {authenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden md:flex flex-col items-end px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-right font-mono">
                <span className="text-[9px] text-slate-500 uppercase">Balance</span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {fplsBalanceRaw ? (Number(fplsBalanceRaw) / 1e18).toLocaleString(undefined, {maximumFractionDigits: 0}) : '0'} $FPLS
                </span>
              </div>
              <button 
                onClick={logout} 
                className="btn-secondary text-xs font-mono py-2"
                title="Click to disconnect"
              >
                <span>{userWallet.slice(0, 6)}...{userWallet.slice(-4)}</span>
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          ) : (
            <button onClick={login} className="btn-primary py-2 text-xs">
              <LogIn className="w-3.5 h-3.5" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </header>

      {/* Primary Navigation Tabs */}
      <LimelightNav currentView={currentView} setCurrentView={setCurrentView} isAdmin={isAdmin} />

      {/* Global Winner Claim Banner */}
      {claimableWinnings.length > 0 && (
        <div className="w-full bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-teal-500/20 border-b border-amber-500/40 px-4 py-3 z-30 animate-in fade-in">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <span className="text-2xl">🏆</span>
              <div>
                <div className="font-bold text-sm text-amber-700 dark:text-amber-300">
                  Congratulations! You won Gameweek {claimableWinnings[0].gameweek}!
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Your 90% share of the prize pool is ready for instant on-chain release.
                </div>
              </div>
            </div>
            <button 
              onClick={() => claimSpecificPrize(claimableWinnings[0].id)} 
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              CLAIM {(claimableWinnings[0].prizePool * 0.9).toLocaleString()} $FPLS
            </button>
          </div>
        </div>
      )}

      {/* Main Content Areas */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col">
        {/* VIEW 1: TEAM BUILDER */}
        {currentView === 'team' && (
          <div className="w-full flex flex-col items-center space-y-6">
            {/* Submission Status Alert Banner */}
            <div className={`w-full max-w-4xl card-modern p-4 border flex flex-col sm:flex-row items-center justify-between gap-3 ${
              isSubmissionOpen
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}>
              <div className="flex items-center gap-3 text-left">
                <div className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${isSubmissionOpen ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                <div>
                  <div className="font-bold text-sm flex items-center gap-2">
                    <span>{isSubmissionOpen ? '🟢 SQUAD SUBMISSIONS OPEN' : '🔒 SQUAD SUBMISSIONS CLOSED'}</span>
                    <span className="text-xs font-mono font-normal opacity-80">
                      • Gameweek {activeGwNumber}
                    </span>
                  </div>
                  <div className="text-xs opacity-80 mt-0.5">
                    {isSubmissionOpen ? (
                      <span>
                        Deadline: {activeGwDeadline ? activeGwDeadline.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '1 hour before kickoff'} (Strict 1hr cutoff before first game)
                      </span>
                    ) : (
                      <span>
                        Locked for active matches. Reopens for Gameweek {activeGwNumber + 1} when current gameweek finishes{estimatedReopenTime ? ` (estimated: ${estimatedReopenTime.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })})` : ''}.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right whitespace-nowrap">
                {isSubmissionOpen ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm font-mono">
                    OPEN
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-sm font-mono">
                    LOCKED
                  </span>
                )}
              </div>
            </div>

            {/* Top Control Bar */}
            <div className="w-full max-w-4xl card-modern p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white">
                  Squad Builder <span className="text-sm font-normal text-slate-500">({selectedTeam.length}/11 Players)</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pick your formation, build within £70.0M, and select your Captain for 2x points.
                </p>
              </div>

              {/* Budget Tracker Gauge */}
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-xl text-center border ${
                  teamBudget < 70 && selectedTeam.length < 11
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900'
                }`}>
                  <div className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">Remaining Budget</div>
                  <div className={`text-lg font-mono font-bold ${
                    teamBudget < 70 && selectedTeam.length < 11
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-700 dark:text-emerald-300'
                  }`}>
                    £{(teamBudget / 10).toFixed(1)}M
                  </div>
                </div>
              </div>
            </div>

            {/* Tactical Pitch (Center Stage) */}
            <div className="w-full flex flex-col items-center">
              {/* Formation Selector & Quick Actions */}
              <div className="w-full max-w-4xl mb-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <FormationDock selectedFormation={selectedFormation} setSelectedFormation={setSelectedFormation} />
                
                {!isTeamSubmitted && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={resetTeam} 
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      Reset
                    </button>
                    <button 
                      onClick={autoCompleteTeam} 
                      className="btn-secondary text-xs px-3 py-1.5 text-amber-600 dark:text-amber-400"
                    >
                      Auto-Fill
                    </button>
                    <button 
                      onClick={intelligentAutoComplete} 
                      className="btn-primary text-xs px-3.5 py-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>AI Optimize</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Pitch Component */}
              <FormationDisplay isTeamSubmitted={isTeamSubmitted} />

              {/* Captain Reminder */}
              {!isTeamSubmitted && (
                <div className="mt-4 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs text-center">
                  💡 <strong>Captain Rule:</strong> Click the <strong>C</strong> button on any player to make them Captain (they score double points).
                </div>
              )}

              {/* Action Buttons Below Pitch */}
              <div className="w-full max-w-md mt-6">
                {isTeamSubmitted ? (
                  <div className="card-modern p-6 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                      ✓ SQUAD LOCKED FOR GAMEWEEK {activeGameweek?.gameweek}
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase font-mono">Live Gameweek Points</div>
                      <div className="text-5xl font-mono font-black text-emerald-600 dark:text-emerald-400 mt-1">
                        {currentUserEntry?.points || 0}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                      <button onClick={downloadSocialCard} className="btn-secondary w-full">
                        Download Squad Image
                      </button>
                      <a href={getShareSquadUrl()} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
                        Share Squad on 𝕏
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => setShowRosterModal(true)} 
                      className="btn-secondary w-full py-3"
                    >
                      🔍 Browse All Players
                    </button>
                    {!isSubmissionOpen ? (
                      <button 
                        disabled 
                        className="btn-secondary w-full py-3.5 opacity-60 cursor-not-allowed text-xs font-mono"
                        title="Submissions closed while gameweek matches are active"
                      >
                        🔒 SUBMISSIONS CLOSED (Reopens when GW {activeGwNumber} finishes)
                      </button>
                    ) : selectedTeam.length === 11 ? (
                      <button 
                        onClick={submitTeam} 
                        className="btn-primary w-full py-3.5 text-base"
                      >
                        ENTER GAMEWEEK (100,000 $FPLS)
                      </button>
                    ) : (
                      <button 
                        disabled 
                        className="btn-secondary w-full py-3 opacity-50 cursor-not-allowed text-xs font-mono"
                      >
                        SELECT {11 - selectedTeam.length} MORE PLAYERS TO SUBMIT
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: LEADERBOARD & REWARDS */}
        {currentView === 'leaderboard' && (
          <div className="w-full max-w-5xl mx-auto space-y-6">
            {/* Gameweek Selector & Status Bar */}
            <div className="card-modern p-4 md:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Gameweek {selectedLeaderboardGw || activeGameweek?.gameweek || 3} Standings
                    {selectedLeaderboardGw === activeGameweek?.gameweek ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                        Current • Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Historical
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedLeaderboardGw === activeGameweek?.gameweek 
                      ? 'Live match performance and current gameweek prize pool'
                      : 'Historical gameweek results, final scores, and prize payouts'}
                  </p>
                </div>
              </div>

              {/* Gameweek Switcher Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Select Gameweek:</span>
                <select
                  value={selectedLeaderboardGw || activeGameweek?.gameweek || 3}
                  onChange={(e) => {
                    const gw = Number(e.target.value);
                    setSelectedLeaderboardGw(gw);
                    loadLeaderboardForGameweek(gw);
                  }}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs font-semibold px-3 py-2 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {allGames.length > 0 ? (
                    allGames.map(g => (
                      <option key={g.id || g.gameweek} value={g.gameweek}>
                        Gameweek {g.gameweek} {g.gameweek === activeGameweek?.gameweek ? '(Current)' : `(${g.status || 'Finished'})`}
                      </option>
                    ))
                  ) : (
                    <option value={activeGameweek?.gameweek || 3}>
                      Gameweek {activeGameweek?.gameweek || 3} (Current)
                    </option>
                  )}
                </select>
              </div>
            </div>

            {/* Prize Metrics Header for Selected Gameweek */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card-modern p-5 text-center">
                <div className="text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">Total Gameweek Staked</div>
                <div className="text-2xl font-mono font-black text-slate-900 dark:text-white mt-1">
                  {(leaderboard.length * 100000).toLocaleString()} <span className="text-xs text-slate-400">$FPLS</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">{leaderboard.length} Total Entries</div>
              </div>

              <div className="card-modern p-5 text-center bg-gradient-to-b from-amber-500/10 to-transparent border-amber-300 dark:border-amber-800">
                <div className="text-xs uppercase font-semibold text-amber-700 dark:text-amber-400">1st Place Winner Pool (90%)</div>
                <div className="text-2xl font-mono font-black text-amber-600 dark:text-amber-300 mt-1">
                  {(leaderboard.length * 100000 * 0.9).toLocaleString()} <span className="text-xs">$FPLS</span>
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">Winner-Takes-All</div>
              </div>

              <div className="card-modern p-5 text-center">
                <div className="text-xs uppercase font-semibold text-rose-500">Deflationary Burn (10%) 🔥</div>
                <div className="text-2xl font-mono font-black text-rose-600 dark:text-rose-400 mt-1">
                  {(leaderboard.length * 100000 * 0.1).toLocaleString()} <span className="text-xs text-rose-400">$FPLS</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Burned forever on-chain</div>
              </div>
            </div>

            {/* Rankings Table */}
            <div className="card-modern overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Standings • Gameweek {selectedLeaderboardGw || activeGameweek?.gameweek || 3}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {leaderboard.length} {leaderboard.length === 1 ? 'manager' : 'managers'} competing
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {selectedLeaderboardGame?.status?.toUpperCase() || (selectedLeaderboardGw === activeGameweek?.gameweek ? 'ACTIVE' : 'FINISHED')}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-mono border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="px-6 py-3.5">Rank</th>
                      <th className="px-6 py-3.5">Manager</th>
                      <th className="px-6 py-3.5 text-center">Points</th>
                      <th className="px-6 py-3.5 text-right">Prize Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                    {leaderboard.map((entry, index) => {
                      const isCurrentUser = entry.walletAddress?.toLowerCase() === userWallet?.toLowerCase();
                      const isWinner = index === 0;
                      return (
                        <tr 
                          key={entry.id || entry.walletAddress || index} 
                          className={`transition-colors ${isCurrentUser ? 'bg-emerald-50/60 dark:bg-emerald-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                        >
                          <td className="px-6 py-4">
                            <span className={`font-bold ${index === 0 ? 'text-amber-500 text-base' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : 'text-slate-500'}`}>
                              #{index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {entry.walletAddress?.slice(0, 6)}...{entry.walletAddress?.slice(-4)}
                              </span>
                              {isCurrentUser && (
                                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold font-sans">
                                  YOU
                                </span>
                              )}
                              {isWinner && (
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold font-sans">
                                  🏆 1ST PLACE
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-base text-slate-900 dark:text-white">
                            {entry.points || 0}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {isWinner ? (
                              <span className="font-bold text-amber-600 dark:text-amber-400">
                                {(leaderboard.length * 100000 * 0.9).toLocaleString()} $FPLS
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {leaderboard.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-14 text-center font-sans">
                          <div className="max-w-md mx-auto space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                              <Trophy className="w-6 h-6" />
                            </div>
                            <div className="font-bold text-base text-slate-900 dark:text-white">
                              No Squad Entries for Gameweek {selectedLeaderboardGw || activeGameweek?.gameweek || 3}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {selectedLeaderboardGw === activeGameweek?.gameweek
                                ? 'No managers have entered this active gameweek yet. Build your team and claim the lead!'
                                : 'No squads were entered for this historical gameweek.'}
                            </p>
                            {selectedLeaderboardGw === activeGameweek?.gameweek && (
                              <button 
                                onClick={() => setCurrentView('team')}
                                className="btn-primary text-xs px-5 py-2.5 mt-2"
                              >
                                Build Squad & Enter
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {currentView === 'fixtures' && (() => {
          const displayedFixtures = allFplFixtures.filter(f => f.event === browsingFixtureGw);
          const allGwFinished = displayedFixtures.length > 0 && displayedFixtures.every(f => f.finished);
          const hasLiveMatch = displayedFixtures.some(f => f.started && !f.finished);

          return (
            <div className="w-full max-w-5xl mx-auto space-y-6">
              {/* Gameweek Browser Header */}
              <div className="card-modern p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      Premier League Fixtures
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        hasLiveMatch
                          ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 animate-pulse'
                          : allGwFinished
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                      }`}>
                        {hasLiveMatch ? '● LIVE' : allGwFinished ? 'FINISHED' : 'SCHEDULED'}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Browse official match results, live scores, and upcoming schedules across all 38 gameweeks
                    </p>
                  </div>
                </div>

                {/* Gameweek Selector & Controls */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    disabled={browsingFixtureGw <= 1}
                    onClick={() => setBrowsingFixtureGw(prev => Math.max(1, prev - 1))}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Previous Gameweek"
                  >
                    ←
                  </button>

                  <select
                    value={browsingFixtureGw}
                    onChange={(e) => setBrowsingFixtureGw(Number(e.target.value))}
                    className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs font-semibold px-3 py-2 rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {Array.from({ length: 38 }, (_, i) => i + 1).map(gw => (
                      <option key={gw} value={gw}>
                        Gameweek {gw} {gw === activeGwNumber ? '(Current)' : ''}
                      </option>
                    ))}
                  </select>

                  <button
                    disabled={browsingFixtureGw >= 38}
                    onClick={() => setBrowsingFixtureGw(prev => Math.min(38, prev + 1))}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Next Gameweek"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Countdown Banner if viewing current gameweek and not started */}
              {browsingFixtureGw === activeGwNumber && gw1Countdown !== 'GAMEWEEK STARTED' && (
                <div className="card-modern p-5 text-center">
                  <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                    Gameweek {activeGwNumber} Deadline Countdown (1hr before kickoff)
                  </div>
                  <div className="text-3xl font-mono font-black text-slate-900 dark:text-white mt-1.5">
                    {gw1Countdown}
                  </div>
                </div>
              )}

              {/* Match Fixtures List */}
              <div className="card-modern p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Gameweek {browsingFixtureGw} Fixtures ({displayedFixtures.length} Matches)
                  </h3>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    Official EPL Feed
                  </span>
                </div>

                <div className="space-y-3">
                  {displayedFixtures.length > 0 ? displayedFixtures.map((fixture) => (
                    <div 
                      key={fixture.id} 
                      className="flex flex-col sm:flex-row justify-between items-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 gap-3"
                    >
                      {/* Home Team */}
                      <div className="flex items-center gap-3 w-full sm:w-2/5 justify-end">
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 text-right">
                          {fplTeams[fixture.team_h]?.name || `Team ${fixture.team_h}`}
                        </span>
                        <TeamShield 
                          teamId={fixture.team_h} 
                          shortName={fplTeams[fixture.team_h]?.short_name} 
                          teamCode={fplTeams[fixture.team_h]?.code}
                          teamName={fplTeams[fixture.team_h]?.name}
                          className="w-6 h-7" 
                        />
                      </div>

                      {/* Score / Status Pill */}
                      <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                        {fixture.started ? (
                          <div className="flex items-center gap-1.5">
                            <span>{fixture.team_h_score ?? 0} - {fixture.team_a_score ?? 0}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              fixture.finished 
                                ? 'bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200' 
                                : 'bg-rose-500 text-white animate-pulse'
                            }`}>
                              {fixture.finished ? 'FT' : 'LIVE'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">VS</span>
                        )}
                      </div>

                      {/* Away Team */}
                      <div className="flex items-center gap-3 w-full sm:w-2/5 justify-start">
                        <TeamShield 
                          teamId={fixture.team_a} 
                          shortName={fplTeams[fixture.team_a]?.short_name} 
                          teamCode={fplTeams[fixture.team_a]?.code}
                          teamName={fplTeams[fixture.team_a]?.name}
                          className="w-6 h-7" 
                        />
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 text-left">
                          {fplTeams[fixture.team_a]?.name || `Team ${fixture.team_a}`}
                        </span>
                      </div>

                      {/* Kickoff Time */}
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono text-center sm:text-right min-w-[130px]">
                        {fixture.kickoff_time ? new Date(fixture.kickoff_time).toLocaleDateString('en-GB', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : 'TBD'}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 text-slate-400 text-sm">
                      No fixtures found for Gameweek {browsingFixtureGw}.
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {currentView === 'profile' && (
          <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Profile Overview Card */}
            <div className="card-modern p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-emerald-glow">
                  ⚽
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Manager Profile</h2>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    {userWallet || 'Wallet Not Connected'}
                  </p>
                </div>
              </div>
            </div>

            {/* 4-Stat Career Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card-modern p-4 text-center">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Gameweek Entries</div>
                <div className="text-xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                  {userEntries.length}
                </div>
              </div>
              <div className="card-modern p-4 text-center">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">$FPLS Contributed</div>
                <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {(userEntries.length * 100000).toLocaleString()}
                </div>
              </div>
              <div className="card-modern p-4 text-center">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">Current Balance</div>
                <div className="text-xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                  {fplsBalanceRaw ? (Number(fplsBalanceRaw) / 1e18).toLocaleString(undefined, {maximumFractionDigits: 0}) : '0'}
                </div>
              </div>
              <div className="card-modern p-4 text-center">
                <div className="text-[10px] font-semibold text-slate-500 uppercase">All-Time Wins</div>
                <div className="text-xl font-mono font-bold text-amber-500 mt-1">
                  {userStats?.wins || 0}
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="card-modern p-6 space-y-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Manager Achievements</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className={`p-4 rounded-xl border ${userEntries.length > 0 ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'}`}>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">First Entry</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Submit your first squad to enter</div>
                </div>
                <div className={`p-4 rounded-xl border ${(userStats?.wins || 0) > 0 ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'}`}>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">Gameweek Champion</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Finish #1 and win the prize pool</div>
                </div>
                <div className={`p-4 rounded-xl border ${userEntries.length >= 5 ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-800' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'}`}>
                  <div className="font-bold text-xs text-slate-800 dark:text-slate-200">Veteran Tactician</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Enter 5 different gameweeks</div>
                </div>
              </div>

              {/* Share to X */}
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just entered Fantasy Premier League Stock on Robinhood Chain! ⚽️📈\n\nTotal Wins: ${userStats?.wins || 0}\n\nJoin and build your squad: https://fpl.stocks\n#FPL #FPLStocks #RobinhoodChain`)}`}
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-primary w-full mt-4"
              >
                Share Stats on 𝕏
              </a>
            </div>
          </div>
        )}

        {/* VIEW 5: HOW IT WORKS */}
        {currentView === 'rules' && (
          <div className="w-full max-w-5xl mx-auto space-y-8 py-4">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">How Fantasy Premier League Stock Works</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                Official Premier League performance data meets decentralized on-chain prize pool tokenomics.
              </p>
            </div>

            {/* 3 Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-modern p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  01
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Stake to Enter</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Pay the 100,000 $FPLS entry fee to submit your team for the gameweek. 90% enters the Winner-Takes-All Prize Pool, and 10% is burned permanently on-chain.
                </p>
              </div>

              <div className="card-modern p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  02
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Manage £70.0M Cap</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Select 11 real Premier League players matching official market valuations. Balance heavy hitters with value picks to build the optimal squad under £70.0M.
                </p>
              </div>

              <div className="card-modern p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  03
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Tactics & 2x Captain</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Choose from 6 dynamic formations and designate your Captain for double points. At the end of the gameweek, the highest point scorer claims the prize pool!
                </p>
              </div>
            </div>

            {/* Strict 1-Hour Submission Deadline Banner */}
            <div className="card-modern p-6 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border-amber-300 dark:border-amber-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
                  ⏰
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Strict Submission Deadline: 1 Hour Before First Kick-Off
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Squads must be submitted and confirmed at least 60 minutes before the first fixture starts.
                  </p>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                To guarantee fairness and eliminate any unfair advantage from early lineup leaks, squad submissions lock automatically exactly 1 hour prior to the earliest kickoff in the gameweek. Once locked, submissions stay closed while matches are in progress, and automatically re-open for the next gameweek as soon as the current gameweek concludes.
              </p>
            </div>

            {/* How Points are Calculated - Points Matrix */}
            <div className="card-modern p-6 space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>📊</span> How Points are Calculated
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Points are synced directly in real-time from official Premier League match events.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Playing Time */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    ⏱️ Playing Time
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 font-mono">
                    <li className="flex justify-between"><span>Playing up to 59 mins:</span> <strong className="text-emerald-600">+1 pt</strong></li>
                    <li className="flex justify-between"><span>Playing 60+ mins:</span> <strong className="text-emerald-600">+2 pts</strong></li>
                  </ul>
                </div>

                {/* Goals Scored */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    ⚽ Goals Scored
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 font-mono">
                    <li className="flex justify-between"><span>Goalkeeper / Defender:</span> <strong className="text-emerald-600">+6 pts</strong></li>
                    <li className="flex justify-between"><span>Midfielder:</span> <strong className="text-emerald-600">+5 pts</strong></li>
                    <li className="flex justify-between"><span>Forward:</span> <strong className="text-emerald-600">+4 pts</strong></li>
                  </ul>
                </div>

                {/* Assists */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    🎯 Assists & Saves
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 font-mono">
                    <li className="flex justify-between"><span>Goal Assist (Any pos):</span> <strong className="text-emerald-600">+3 pts</strong></li>
                    <li className="flex justify-between"><span>Penalty Saved (GK):</span> <strong className="text-emerald-600">+5 pts</strong></li>
                    <li className="flex justify-between"><span>Every 3 Saves (GK):</span> <strong className="text-emerald-600">+1 pt</strong></li>
                  </ul>
                </div>

                {/* Clean Sheets */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    🛡️ Clean Sheets
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 font-mono">
                    <li className="flex justify-between"><span>GK / Defender (60+ mins):</span> <strong className="text-emerald-600">+4 pts</strong></li>
                    <li className="flex justify-between"><span>Midfielder (60+ mins):</span> <strong className="text-emerald-600">+1 pt</strong></li>
                  </ul>
                </div>

                {/* Deductions */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-rose-500">
                    ⚠️ Deductions
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300 font-mono">
                    <li className="flex justify-between"><span>Yellow Card:</span> <strong className="text-rose-500">-1 pt</strong></li>
                    <li className="flex justify-between"><span>Red Card:</span> <strong className="text-rose-500">-3 pts</strong></li>
                    <li className="flex justify-between"><span>Own Goal:</span> <strong className="text-rose-500">-2 pts</strong></li>
                    <li className="flex justify-between"><span>Penalty Miss:</span> <strong className="text-rose-500">-2 pts</strong></li>
                    <li className="flex justify-between"><span>Every 2 Goals Conceded:</span> <strong className="text-rose-500">-1 pt</strong></li>
                  </ul>
                </div>

                {/* Captain Multiplier */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 space-y-2">
                  <div className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    👑 Captain Multiplier
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    Your selected Captain scores <strong>2x Double Points</strong> for the entire gameweek!
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2 font-mono">
                    Plus match Bonus Points (BPS: 1 to 3 pts) for top performers.
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="card-modern p-6 text-center space-y-4">
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Ready to pick your squad?</h4>
              <button 
                onClick={() => setCurrentView('team')} 
                className="btn-primary text-base px-8 py-3"
              >
                Go to Team Builder
              </button>
            </div>
          </div>
        )}{currentView === 'admin' && isAdmin && (
          <div className="w-full max-w-4xl mx-auto space-y-6">
            <div className="card-modern p-6 space-y-4">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white">Admin Protocol Dashboard</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-500 uppercase">Active Gameweek</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    GW {activeGameweek ? activeGameweek.gameweek : 'None'}
                  </div>
                  <div className="text-slate-400 mt-0.5">Status: {activeGameweek?.status || 'N/A'}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                  <div className="text-slate-500 uppercase">Prize Pool / Entries</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {activeGameweek ? activeGameweek.prizePool : 0} $FPLS
                  </div>
                  <div className="text-slate-400 mt-0.5">Entries: {activeGameweek?.entries?.length || entriesCount}</div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={finalizeGameweek} 
                  className="btn-secondary text-rose-500 border-rose-200 dark:border-rose-900"
                >
                  Finalize Gameweek
                </button>
                <button 
                  onClick={clearAndRepopulateFixtures} 
                  className="btn-secondary"
                >
                  Sync & Reload Fixtures
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modern Player Selection Drawer / Modal */}
      {showRosterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-3xl rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Player Roster</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Remaining Budget: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">£{(teamBudget / 10).toFixed(1)}M</span> • Squad: {selectedTeam.length}/11
                </p>
              </div>
              <button 
                onClick={() => setShowRosterModal(false)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {['ALL', 'GK', 'DEF', 'MID', 'FWD'].map(pos => {
                  const posStr = pos === 'GK' ? 'GKP' : pos;
                  const posId = pos === 'ALL' ? '' : positions.find(p => p.singular_name_short === posStr)?.id;
                  const isActive = (pos === 'ALL' && !filters.position) || (pos !== 'ALL' && filters.position == posId);
                  return (
                    <button
                      key={pos}
                      onClick={() => setFilters(prev => ({ ...prev, position: posId }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-emerald-600 text-white shadow-sm' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {pos}
                    </button>
                  );
                })}
              </div>
              <div className="relative w-full sm:w-64">
                <input 
                  type="text"
                  placeholder="Search player or team..."
                  value={filters.search}
                  onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Player List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2">
              {getFilteredPlayers().slice(0, 100).map(player => {
                const playerPos = positions.find(p => p.id === player.element_type)?.singular_name_short;
                const playerTeam = teams.find(t => t.id === player.team)?.short_name;
                const isAdded = selectedTeam.some(p => p.id === player.id);
                const canAfford = teamBudget >= player.now_cost;

                return (
                  <div 
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                      isAdded ? 'opacity-40 bg-slate-50 dark:bg-slate-800/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <VectorKit 
                        player={player} 
                        shortName={fplTeams[player.team]?.short_name}
                        className="w-10 h-12 flex-shrink-0" 
                      />
                      <div>
                        <div className="font-semibold text-sm text-slate-900 dark:text-white">
                          {player.first_name} {player.second_name}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-mono font-medium">{playerTeam}</span>
                          <span>•</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono">{playerPos}</span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{player.total_points} pts</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono font-bold text-sm text-slate-900 dark:text-white">
                        £{(player.now_cost / 10).toFixed(1)}M
                      </div>
                      <button
                        disabled={isAdded || (!isAdded && !canAfford) || selectedTeam.length >= 11}
                        onClick={() => {
                          addPlayerToTeam(player);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          isAdded 
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                            : !canAfford
                            ? 'bg-rose-100 text-rose-500 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        }`}
                      >
                        {isAdded ? 'Added' : !canAfford ? 'No Budget' : '+ Add'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modern Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">FPL.STOCK</span>
            <span>•</span>
            <span>Robinhood Chain Mainnet</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://ponsfamily.com" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">
              Pons Family Platform
            </a>
            <a href="https://x.com/kasperwtrcolor" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-500 transition-colors">
              Follow on 𝕏
            </a>
          </div>
          <div>
            &copy; {new Date().getFullYear()} Fantasy Premier League Stock. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Loading Modal */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in">
          <div className="card-modern p-8 text-center max-w-sm w-full mx-4 shadow-2xl">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{loadingMessage || 'Processing...'}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please wait a moment</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
