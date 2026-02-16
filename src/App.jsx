import { useState, useEffect, useRef, useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Users, Clock, TrendingUp, Calendar, Trophy, ArrowRight, User, BarChart3, Medal, Target, Home, Target as TeamIcon, Info, Sun, Moon, RotateCcw, Zap, LogIn, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import * as firebaseService from './firebaseService';
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Press+Start+2P&family=Bungee&family=Rubik+Mono+One&family=Luckiest+Guy&family=Inter:wght@400;500;600;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);
const styleElement = document.createElement('style');
styleElement.textContent = `
  .film-grain::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(circle, transparent 20%, rgba(0, 0, 0, 0.3) 100%),
      url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 1;
    mix-blend-mode: overlay;
  }
  .cinematic-text {
    font-family: 'Fredoka One', 'Luckiest Guy', cursive;
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }
  .pixel-text {
    font-family: 'Press Start 2P', 'Bungee', 'Rubik Mono One', monospace;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .body-text {
    font-family: 'Inter', sans-serif;
  }
  .gold-glow {
    text-shadow: 0 0 10px rgba(212, 175, 55, 0.5), 0 0 20px rgba(212, 175, 55, 0.3);
  }
`;
document.head.appendChild(styleElement);
const AnimatedTitle = ({
  title = "FPL.SOL",
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
    }} className="text-5xl md:text-9xl font-black text-black bg-white px-6 py-4 rounded-3xl relative z-10 cinematic-text text-center" style={{
      textShadow: '4px 4px 0px rgba(255,215,0,0.4), 8px 8px 0px rgba(0,0,0,0.2)',
      border: '4px solid #000',
      boxShadow: '8px 8px 0px rgba(0,0,0,0.8), 0 0 40px rgba(255,215,0,0.3)'
    }}>
      {title}
    </motion.h1>
    {subtitle && <motion.p initial={{
      opacity: 0,
      y: 10
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 1.5,
      duration: 0.6,
      ease: "easeOut"
    }} className="text-sm text-white bg-black px-3 py-1 rounded-full mt-3 pixel-text inline-block" style={{
      fontSize: '10px',
      border: '2px solid #fff',
      boxShadow: '3px 3px 0px rgba(255,255,255,0.5)'
    }}>
      {subtitle}
    </motion.p>}
  </div>;
};
const SpotlightCard = ({
  children,
  className = "",
  glowColor = "blue",
  size = "md",
  intensity = 1,
  retro = true,
  ...props
}) => {
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0
  });
  const [isHovered, setIsHovered] = useState(false);
  const colors = {
    blue: "59, 130, 246",
    purple: "168, 85, 247",
    green: "34, 197, 94",
    red: "239, 68, 68",
    orange: "249, 115, 22",
    yellow: "234, 179, 8"
  };
  const sizes = {
    sm: {
      width: 200,
      height: 200
    },
    md: {
      width: 300,
      height: 300
    },
    lg: {
      width: 400,
      height: 400
    }
  };
  const handleMouseMove = e => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  const glowSize = sizes[size];
  const colorRgb = colors[glowColor] || colors.blue;
  const cardStyle = {
    '--spotlight-x': `${mousePosition.x}px`,
    '--spotlight-y': `${mousePosition.y}px`,
    '--glow-color': colorRgb,
    '--glow-size': `${glowSize.width}px`,
    '--intensity': intensity,
    position: 'relative',
    overflow: 'hidden'
  };
  const beforeStyle = isHovered ? {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(${glowSize.width}px circle at var(--spotlight-x) var(--spotlight-y), 
      hsla(${getHue(glowColor)}, 70%, 60%, ${0.15 * intensity}), 
      hsla(${getHue(glowColor)}, 50%, 40%, ${0.05 * intensity}) 50%, 
      transparent 100%)`,
    borderRadius: 'inherit',
    opacity: isHovered ? 1 : 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
    zIndex: 1
  } : {};
  const afterStyle = isHovered ? {
    content: '""',
    position: 'absolute',
    inset: '-2px',
    background: `conic-gradient(from 0deg at var(--spotlight-x) var(--spotlight-y), 
      hsla(${getHue(glowColor)}, 100%, 70%, ${0.8 * intensity}), 
      hsla(${getHue(glowColor) + 60}, 100%, 70%, ${0.4 * intensity}), 
      hsla(${getHue(glowColor)}, 100%, 70%, ${0.8 * intensity}))`,
    borderRadius: 'inherit',
    opacity: isHovered ? 1 : 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
    zIndex: -1,
    filter: 'blur(4px)'
  } : {};
  const pixelBorderStyle = retro ? {
    border: '2px solid #000',
    boxShadow: '4px 4px 0px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,0,0.2)',
    transition: 'all 0.2s ease'
  } : {};
  const hoverPixelStyle = retro && isHovered ? {
    boxShadow: '4px 4px 0px rgba(0,0,0,0.8), 0 0 30px rgba(255,255,0,0.6)',
    transform: 'scale(1.02)'
  } : {};
  return <div ref={cardRef} className={`spotlight-card ${className}`} style={{
    ...cardStyle,
    ...pixelBorderStyle,
    ...hoverPixelStyle
  }} onMouseMove={handleMouseMove} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} {...props}>
    {isHovered && <>
      <div className="absolute inset-0 pointer-events-none z-[1]" style={beforeStyle} />
      <div className="absolute inset-[-2px] pointer-events-none z-[-1]" style={afterStyle} />
    </>}
    <div className="relative z-[2] h-full">
      {children}
    </div>
  </div>;
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
    }} className="text-white font-semibold" style={{
      fontFamily: 'VT323, monospace',
      textShadow: '2px 2px 0px #000'
    }}>
      {message}
    </motion.p>;
  };
  const BarsContainer = () => <div className="flex items-center space-x-1">
    {Array.from({
      length: bars
    }).map((_, index) => <motion.div key={index} className={`${currentSize.width} ${currentSize.height} ${currentColor} rounded-sm`} style={{
      boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
      border: '1px solid #000'
    }} animate={{
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
const LimelightNav = ({
  currentView,
  setCurrentView,
  onInfoClick,
  isAdmin
}) => {
  const navItems = [{
    id: 'home',
    label: 'Home',
    icon: Home
  }, {
    id: 'team',
    label: 'Build Team',
    icon: TeamIcon
  }, {
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: TrendingUp
  }, {
    id: 'profile',
    label: 'Profile',
    icon: User
  }, ...(isAdmin ? [{
    id: 'admin',
    label: 'Admin',
    icon: Users
  }] : []), {
    id: 'info',
    label: 'How it Works',
    icon: Info
  }];
  const handleItemClick = item => {
    if (item.id === 'info') {
      onInfoClick();
    } else {
      setCurrentView(item.id);
    }
  };
  return <motion.nav className="relative bg-black/40 backdrop-blur-md rounded-2xl p-2 border border-green-700/30" style={{
    boxShadow: '0 0 30px rgba(0,0,0,0.8), 0 0 60px rgba(34, 197, 94, 0.2)'
  }}>
    <div className="flex items-center space-x-2">
      {navItems.map(item => {
        const IconComponent = item.icon;
        const isActive = currentView === item.id && item.id !== 'info';
        return <motion.button key={item.id} onClick={() => handleItemClick(item)} className={`
              relative h-12 w-16 rounded-xl flex items-center justify-center 
              transition-all duration-200 group
              ${isActive ? 'text-white bg-green-600/50' : 'text-white hover:text-green-300'}
            `} style={{
            border: '2px solid #000',
            boxShadow: isActive ? '3px 3px 0px rgba(0,0,0,0.8), 0 0 20px rgba(34, 197, 94, 0.6)' : '2px 2px 0px rgba(0,0,0,0.6)'
          }} whileHover={{
            y: -4,
            scale: 1.05
          }} whileTap={{
            scale: 0.95,
            y: -2
          }}>
          <motion.div className="flex items-center justify-center" animate={{
            scale: isActive ? 1.2 : 1
          }} transition={{
            scale: {
              type: "spring",
              stiffness: 400,
              damping: 17
            }
          }}>
            <IconComponent className="w-5 h-5" style={{
              filter: 'drop-shadow(1px 1px 0px #000)'
            }} />
          </motion.div>
          <motion.div initial={{
            opacity: 0,
            y: 10,
            scale: 0.8
          }} whileHover={{
            opacity: 1,
            y: -40,
            scale: 1
          }} className="absolute pointer-events-none bg-black/90 text-white text-xs px-2 py-1 rounded border border-green-700/50" style={{
            fontFamily: 'VT323, monospace',
            textShadow: '1px 1px 0px #000',
            boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
            zIndex: 50
          }}>
            {item.label}
          </motion.div>
        </motion.button>;
      })}
    </div>
  </motion.nav>;
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
    fontFamily: 'VT323, monospace',
    fontSize: '18px',
    border: '2px solid #000',
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
      `} style={{
      border: '2px solid #000',
      boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.4)'
    }}>
    <motion.div className="absolute top-1 left-1 w-8 h-8 bg-white rounded-full flex items-center justify-center" layout transition={{
      type: 'spring',
      stiffness: 500,
      damping: 40
    }} style={{
      transform: theme === 'dark' ? 'translateX(0px)' : 'translateX(40px)',
      boxShadow: '2px 2px 0px rgba(0,0,0,0.8)'
    }}>
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
  return <motion.div className="flex justify-center items-center gap-2 md:gap-3 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-green-700/30" style={{
    boxShadow: '0 0 20px rgba(0,0,0,0.6)'
  }} initial={{
    y: 50,
    opacity: 0
  }} animate={{
    y: 0,
    opacity: 1
  }} transition={{
    delay: 0.2,
    type: 'spring',
    stiffness: 100
  }}>
    {formations.map(formation => {
      const isActive = selectedFormation === formation.value;
      return <motion.button key={formation.value} onClick={() => setSelectedFormation(formation.value)} className={`relative px-3 py-2 md:px-4 md:py-2 rounded-xl transition-colors duration-300 group`} style={{
        border: '2px solid #000',
        boxShadow: isActive ? '3px 3px 0px rgba(0,0,0,0.8), 0 0 20px rgba(34, 197, 94, 0.6)' : '2px 2px 0px rgba(0,0,0,0.6)'
      }} whileHover={{
        y: -5,
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} animate={{
        backgroundColor: isActive ? 'rgba(34, 197, 94, 0.5)' : 'rgba(0, 0, 0, 0.3)',
        color: isActive ? '#FFFFFF' : '#A3E635'
      }}>
        <span className="font-bold text-sm md:text-base" style={{
          fontFamily: 'VT323, monospace',
          textShadow: '1px 1px 0px #000'
        }}>
          {formation.value}
        </span>
        <motion.div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded border border-green-700/50 pointer-events-none" style={{
          fontFamily: 'VT323, monospace',
          textShadow: '1px 1px 0px #000',
          boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
          zIndex: 50
        }} initial={{
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
      </motion.button>;
    })}
  </motion.div>;
};
function App() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const userWallet = user?.wallet?.address || user?.id || null;
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
  const [teamBudget, setTeamBudget] = useState(800);
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
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [selectedFormation, setSelectedFormation] = useState('4-3-3');
  const [, setHasAccess] = useState(false);
  const [userInviteCode, setUserInviteCode] = useState(null);
  const [adminInviteCodes, setAdminInviteCodes] = useState([]);
  const [generateCount, setGenerateCount] = useState(5);
  const [gameweekDeadline, setGameweekDeadline] = useState(null);
  const [isAfterDeadline, setIsAfterDeadline] = useState(false);
  const [isGameweekStarted, setIsGameweekStarted] = useState(false);
  const [claimableWinnings, setClaimableWinnings] = useState([]);
  const [historicalGames, setHistoricalGames] = useState([]);
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
        activeGame.entryFee = 0.05;
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
    if (rawLeaderboard.length > 0 && activeGameweek?.status === 'active') {
      if (players.length > 0 && isGameweekStarted) {
        const liveLeaderboard = calculateLiveLeaderboard(rawLeaderboard, players);
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
        setTeamBudget(800 - teamCost);
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
        prizePool: data.count * (prev?.entryFee || 0.01)
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
      const adminStatus = walletString === '6SxLVfFovSjR2LAFcJ5wfT6RFjc8GxsscRekGnLq8BMe';
      console.log('Admin status result:', adminStatus);
      setIsAdmin(adminStatus);
      if (adminStatus) {
        loadAdminInviteCodes();
        loadHistoricalGames();
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
  const loadHistoricalGames = async () => {
    if (!userWallet || !isAdmin) return;
    try {
      const allGames = await firebaseService.listEntities('games');
      const finishedGames = allGames.filter(game => game.status === 'finished').sort((a, b) => b.gameweek - a.gameweek);
      const gamesWithPayouts = [];
      for (const game of finishedGames) {
        const payouts = await firebaseService.listEntities('payouts', {
          gameId: game.id
        });
        const hasClaimed = payouts.length > 0;
        let winnerScore = 0;
        if (game.winnerId) {
          const entries = await firebaseService.listEntities('entries', {
            gameId: game.id
          });
          const winnerEntry = entries.find(entry => entry.userId === game.winnerId);
          winnerScore = winnerEntry ? winnerEntry.points || 0 : 0;
        }
        gamesWithPayouts.push({
          ...game,
          hasClaimed,
          winnerScore,
          payout: payouts[0] || null
        });
      }
      setHistoricalGames(gamesWithPayouts);
    } catch (error) {
      console.error('Error loading historical games:', error);
    }
  };
  const autoStartNewGameweek = async () => {
    console.log("Attempting to auto-start new gameweek...");
    try {
      const response = await fetch('https://corsproxy.io/?https://fantasy.premierleague.com/api/bootstrap-static/');
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
        entryFee: 0.05
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
        activeGame.entryFee = 0.05;
        const entries = await firebaseService.listEntities('entries', {
          gameId: activeGame.id
        });
        const currentEntriesCount = entries.length;
        if (currentEntriesCount > 0) {
          activeGame.prizePool = currentEntriesCount * 0.05;
        }
        setActiveGameweek(activeGame);
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
        const calculatedPrizePool = entries.length * 0.05;
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
      const adminStatus = userWallet === '6SxLVfFovSjR2LAFcJ5wfT6RFjc8GxsscRekGnLq8BMe';
      console.log('Setting admin status to:', adminStatus);
      setIsAdmin(adminStatus);
      if (adminStatus) {
        loadAdminInviteCodes();
        loadHistoricalGames();
      }
    } else {
      setIsAdmin(false);
    }
  }, [userWallet]);
  const loadPlayers = async () => {
    try {
      const cachedPlayers = localStorage.getItem('fpl_players');
      const cachedTeams = localStorage.getItem('fpl_teams');
      const cachedPositions = localStorage.getItem('fpl_positions');
      const cacheTime = localStorage.getItem('fpl_players_timestamp');
      const now = Date.now();
      if (cachedPlayers && cachedTeams && cachedPositions && cacheTime && now - parseInt(cacheTime) < 3600000) {
        setPlayers(JSON.parse(cachedPlayers));
        setTeams(JSON.parse(cachedTeams));
        setPositions(JSON.parse(cachedPositions));
      } else {
        await fetchAndCachePlayers();
      }
    } catch (error) {
      console.error('Error loading players:', error);
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
      const response = await fetch('https://corsproxy.io/?https://fantasy.premierleague.com/api/bootstrap-static/');
      const data = await response.json();
      localStorage.setItem('fpl_players', JSON.stringify(data.elements));
      localStorage.setItem('fpl_teams', JSON.stringify(data.teams));
      localStorage.setItem('fpl_positions', JSON.stringify(data.element_types));
      localStorage.setItem('fpl_players_timestamp', Date.now().toString());
      setPlayers(data.elements);
      setTeams(data.teams);
      setPositions(data.element_types);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };
  const fetchAndCacheFixtures = async () => {
    try {
      const response = await fetch('https://corsproxy.io/?https://fantasy.premierleague.com/api/fixtures/');
      const data = await response.json();
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
      const response = await fetch('https://corsproxy.io/?https://fantasy.premierleague.com/api/fixtures/');
      const data = await response.json();
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
      const response = await fetch(`https://corsproxy.io/?https://fantasy.premierleague.com/api/event/${gameweek}/live/`);
      const data = await response.json();
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
      const response = await fetch('https://corsproxy.io/?https://fantasy.premierleague.com/api/bootstrap-static/');
      const data = await response.json();
      const currentFplEvent = data.events.find(event => event.is_current === true);
      if (!currentFplEvent) {
        alert('FPL API does not indicate a current gameweek. The season may be over or between gameweeks.');
        setIsLoading(false);
        return;
      }
      const currentGameweekNumber = currentFplEvent.id;
      const allGames = await firebaseService.listEntities('games');
      const gameExists = allGames.some(game => game.gameweek === currentGameweekNumber);
      if (gameExists) {
        alert(`Gameweek ${currentGameweekNumber} already exists. No new gameweek started.`);
        setIsLoading(false);
        return;
      }
      setLoadingMessage(`Starting Gameweek ${currentGameweekNumber}...`);
      const newGame = await firebaseService.createEntity('games', {
        gameweek: currentGameweekNumber,
        status: 'active',
        prizePool: 0,
        entryFee: 0.05
      });
      // Firestore onSnapshot handles real-time updates automatically
      alert(`Successfully started Gameweek ${currentGameweekNumber}!`);
      await loadActiveGameweek();
    } catch (error) {
      console.error('Error starting new gameweek:', error);
      alert('An error occurred while trying to start the new gameweek. Check the console for details.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  const syncGameweekWithFPL = async () => {
    if (!userWallet || !isAdmin) return;
    setIsLoading(true);
    setLoadingMessage('Syncing gameweek with FPL...');
    try {
      const fplResponse = await fetch('https://corsproxy.io/?https://fantasy.premierleague.com/api/bootstrap-static/');
      const fplData = await fplResponse.json();
      const currentFplEvent = fplData.events.find(event => event.is_current === true);
      if (!currentFplEvent) {
        alert('Could not determine current FPL gameweek. FPL API might be down or season ended.');
        return;
      }
      setLoadingMessage('Fetching fixture data...');
      const fixturesResponse = await fetch('https://corsproxy.io/?https://fantasy.premierleague.com/api/fixtures/');
      const fixturesData = await fixturesResponse.json();
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
        alert(`Gameweek ${currentFplGameweekNumber} is already active and synced.`);
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
          entryFee: 0.05
        });
        console.log(`New Gameweek ${currentFplGameweekNumber} created.`);
      }
      if (newActiveGame) {
        console.log('New active game set:', newActiveGame.id);
      }
      alert(`Gameweek synced successfully! Active Gameweek is now ${currentFplGameweekNumber}.`);
      await loadActiveGameweek();
    } catch (error) {
      console.error('Error syncing gameweek:', error);
      alert('An error occurred during gameweek sync. Please check console for details.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
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
        alert('No active gameweek found to delete.');
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

      alert(`Gameweek ${currentActiveGame.gameweek} has been completely deleted.`);
      setActiveGameweek(null);
      setRawLeaderboard([]);
      setLeaderboard([]);
      setEntriesCount(0);
      await loadActiveGameweek();
      await loadUserData();
    } catch (error) {
      console.error('Error deleting gameweek:', error);
      alert('An error occurred while deleting the gameweek. Please check console for details.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };
  const addPlayerToTeam = player => {
    const {
      canAdd
    } = canAddPlayer(player);
    if (!canAdd) return;
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
    setTeamBudget(800);
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
  const calculateLiveLeaderboard = (entries, players) => {
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
      const shareText = `⚽ My fpl.sol Gameweek ${activeGameweek?.gameweek} team is locked in! 🚀\n\n${teamText}\n💎 ${currentUserEntry.points || 0} points so far\n💰 ${formatPrice(currentUserEntry.teamValue)} team value\n\nJoin the crypto fantasy revolution: https://dev.fun/p/543405b7d79724fbb83d\n\n@fpl_sol #FPL #Solana #Fantasy`;
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
      let systemPrompt = `You are a social media manager for fpl.sol, a crypto fantasy football app on Solana. Create engaging, hype-building posts for X.com (Twitter).

Key guidelines:
- Keep posts under 280 characters
- Use relevant emojis 
- Include hashtags: #FPL #Solana #Fantasy #Crypto
- Mention @fpl_sol
- Create FOMO and excitement
- Include the app link: https://dev.fun/p/543405b7d79724fbb83d
- Be energetic and fun
- Use football/crypto terminology appropriately

Current app data:
- Gameweek: ${appContext.currentGameweek}
- Status: ${appContext.gameweekStatus}
- Entries: ${appContext.totalEntries}
- Prize Pool: ${appContext.prizePool} SOL
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
          userPrompt = `Create a post highlighting the current prize pool of ${appContext.prizePool} SOL and potential winnings`;
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
      setGeneratedShareMessage('🔥 The crypto fantasy revolution is here! Build your Premier League dream team and win SOL rewards on @fpl_sol ⚽💰 #FPL #Solana #Fantasy https://dev.fun/p/543405b7d79724fbb83d');
    } finally {
      setIsGeneratingMessage(false);
    }
  };
  const shareOnX = () => {
    if (!generatedShareMessage) return;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(generatedShareMessage)}`;
    window.open(twitterUrl, '_blank');
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
      await firebaseService.createEntity('entries', {
        gameId: activeGameweek.id,
        team: JSON.stringify(selectedTeam.map(p => p.id)),
        captain: captain.id.toString(),
        teamValue: 800 - teamBudget,
        points: 0
      });
      console.log('Entry created successfully.');
      teamSubmissionSuccess = true;
      try {
        const currentGame = await firebaseService.getEntity('games', activeGameweek.id);
        console.log('Fetched current game prizePool from Devbase:', currentGame.prizePool);
        const updatedPrizePool = (currentGame.prizePool || 0) + 0.05;
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
        alert('Error submitting team. Please try again.');
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
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
          <h3 className="text-xl font-bold text-white border-b border-green-700/30 pb-2" style={{
            fontFamily: 'VT323, monospace',
            textShadow: '2px 2px 0px #000'
          }}>
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
                      <div className="text-white font-bold text-lg bg-green-600 px-3 py-1 rounded border border-black shadow-lg" style={{
                        fontFamily: 'VT323, monospace',
                        textShadow: '1px 1px 0px #000',
                        boxShadow: '3px 3px 0px rgba(0,0,0,0.8)'
                      }}>
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
      return <SpotlightCard className="relative group" glowColor={isCaptain ? "yellow" : "green"} size="sm" intensity={isCaptain ? 1.2 : 0.6}>
        <div className="bg-black/40 backdrop-blur-md text-white rounded-lg p-3 text-center min-w-[100px] md:min-w-[120px] border border-white/30 shadow-2xl" style={{
          background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3))',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}>
          {isCaptain && <div className="absolute -top-2 -left-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center border-2 border-black" style={{
            fontFamily: 'VT323, monospace',
            boxShadow: '2px 2px 0px rgba(0,0,0,0.8)'
          }}>C</div>}
          <div className="mb-2 md:mb-3">
            <img src={`https://fantasy.premierleague.com/dist/img/shirts/standard/shirt_${player.team_code}-110.png`} alt={`${player.first_name} ${player.second_name}`} className="w-16 h-16 md:w-20 md:h-20 mx-auto object-contain" style={{
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
            }} onError={e => {
              e.target.src = getTeamLogo(player.team);
              e.target.className = 'w-12 h-12 md:w-16 md:h-16 mx-auto object-contain';
            }} />
          </div>
          <div className="text-xs font-bold truncate text-white/90">{player.first_name}</div>
          <div className="text-xs font-bold truncate text-white/90">{player.second_name}</div>
          <div className="flex justify-between items-center text-xs mt-2 px-1">
            <span className="text-green-200/80">{formatPrice(player.now_cost)}</span>
            {isTeamSubmitted && <span className="text-yellow-300 font-bold">
              {isGameweekStarted ? player.event_points || 0 : 0} pts
            </span>}
          </div>
          {isCaptain && <div className="text-xs text-yellow-200 font-bold mt-1">Captain (2x pts)</div>}
        </div>
        {!isTeamSubmitted && <>
          <button onClick={() => removePlayerFromTeam(player)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 md:w-5 md:h-5 text-xs md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            ×
          </button>
          <button onClick={() => setCaptain(player)} className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${isCaptain ? 'bg-yellow-500' : 'bg-blue-500'} text-white rounded-full w-6 h-6 text-xs md:opacity-0 md:group-hover:opacity-100 transition-opacity font-bold`}>
            {isCaptain ? '✓' : 'C'}
          </button>
        </>}
      </SpotlightCard>;
    };
    const EmptySlot = ({
      position,
      count
    }) => <div className="bg-gray-600 text-gray-300 rounded-lg p-2 text-center min-w-[80px] md:min-w-[100px] border-2 border-gray-400 border-dashed">
        <div className="text-xs">Empty</div>
        <div className="text-xs">{position}</div>
      </div>;
    return <div className="bg-gradient-to-b from-green-400 to-green-600 rounded-xl p-6 relative" style={{
      backgroundImage: `
          linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px),
          linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)
        `,
      backgroundSize: '20px 20px'
    }}>
      { }
      <div className="absolute inset-4 border-2 border-white rounded-lg opacity-60">
        <div className="absolute inset-x-0 top-1/2 h-0 border-t-2 border-white"></div>
        <div className="absolute left-1/2 top-0 bottom-0 w-0 border-l-2 border-white"></div>
        <div className="absolute left-1/2 top-1/2 w-16 h-16 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
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
  if (!hasEnteredApp) {
    return <div className={`min-h-screen flex items-center justify-center relative ${theme === 'dark' ? 'bg-gradient-to-br from-black via-gray-900 to-black film-grain' : 'bg-gradient-to-br from-blue-50 via-white to-blue-100'}`}>
      <div className="absolute top-4 right-4">
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>
      <SpotlightCard className="text-center space-y-6 p-8" glowColor="yellow" size="lg" intensity={1.2}>
        <Trophy className="w-20 h-20 text-black bg-yellow-400 p-4 rounded-full" style={{
          border: '4px solid #000',
          boxShadow: '6px 6px 0px rgba(0,0,0,0.8)'
        }} />
        <h1 className="text-6xl md:text-7xl font-black text-black bg-white px-8 py-6 rounded-3xl cinematic-text" style={{
          textShadow: '4px 4px 0px rgba(255,215,0,0.4)',
          border: '4px solid #000',
          boxShadow: '8px 8px 0px rgba(0,0,0,0.8)'
        }}>FPL.SOL</h1>
        <p className="text-lg text-black bg-yellow-400 px-6 py-3 rounded-2xl max-w-md pixel-text" style={{
          fontSize: '12px',
          border: '3px solid #000',
          boxShadow: '5px 5px 0px rgba(0,0,0,0.8)',
          lineHeight: '1.6'
        }}>
          FANTASY PREMIER LEAGUE MEETS CRYPTO REWARDS! BUILD YOUR DREAM TEAM AND COMPETE FOR SOL PRIZES!
        </p>
        <div className="bg-gray-800/20 border border-gray-600/50 rounded-lg p-4 max-w-md">
          <p className="text-gray-300 text-sm mb-3 body-text">
            Need an invite code? Follow us on X for codes and updates:
          </p>
          <a href="https://x.com/fpl_sol" target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 bg-yellow-600 hover:bg-yellow-700 text-black px-4 py-2 rounded-lg transition-all duration-200 group" style={{
            border: '2px solid #000',
            boxShadow: '3px 3px 0px rgba(0,0,0,0.8)'
          }}>
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor" style={{
              filter: 'drop-shadow(1px 1px 0px #000)'
            }}>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Follow @fpl_sol</span>
          </a>
        </div>
        <div className="space-y-3">
          <AnimatedButton onClick={() => setHasEnteredApp(true)} className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-4 px-8 rounded-lg cinematic-text" color="yellow" hoverText="Let's Play!" style={{
            fontSize: '20px',
            border: '2px solid #000',
            boxShadow: '4px 4px 0px rgba(0,0,0,0.8)',
            textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
          }}>
            PLAY FPL.SOL
          </AnimatedButton>
          {authenticated ? (
            <button onClick={logout} className="w-full bg-gray-700 hover:bg-gray-600 text-gray-100 font-bold py-3 px-6 rounded-lg cinematic-text flex items-center justify-center space-x-2" style={{
              fontSize: '18px',
              border: '2px solid #000',
              boxShadow: '4px 4px 0px rgba(0,0,0,0.8)',
              textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
            }}>
              <LogOut className="w-5 h-5" />
              <span>{userWallet ? `${userWallet.slice(0, 6)}...${userWallet.slice(-4)}` : 'Logout'}</span>
            </button>
          ) : (
            <button onClick={login} className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold py-3 px-6 rounded-lg cinematic-text flex items-center justify-center space-x-2" style={{
              fontSize: '18px',
              border: '2px solid #000',
              boxShadow: '4px 4px 0px rgba(0,0,0,0.8)',
              textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
            }}>
              <LogIn className="w-5 h-5" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </SpotlightCard>
    </div>;
  }
  return <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-black via-gray-900 to-black film-grain' : 'bg-gradient-to-br from-blue-50 via-white to-blue-100'}`}>
    <header className={`${theme === 'dark' ? 'bg-black/40' : 'bg-white/90'} backdrop-blur-sm border-b ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-300/50'}`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <AnimatedTitle title="FPL.SOL" />
            <div className="flex items-center space-x-2">
              {isConnected && <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" style={{
                boxShadow: '0 0 10px rgba(212, 175, 55, 0.8)'
              }} />}
              <div className="flex items-center space-x-1 text-gray-300 px-2 py-1 rounded body-text" style={{
                backgroundColor: 'rgba(0,0,0,0.7)',
                border: '1px solid #000',
                boxShadow: '2px 2px 0px rgba(0,0,0,0.6)'
              }}>
                <Users className="w-4 h-4" style={{
                  filter: 'drop-shadow(1px 1px 0px #000)'
                }} />
                <span className="text-sm font-medium">{onlineUsers}</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            {authenticated ? (
              <button onClick={logout} className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold cinematic-text px-4 py-2 rounded-lg flex items-center space-x-2" style={{
                fontSize: '16px',
                border: '2px solid #000',
                boxShadow: '3px 3px 0px rgba(0,0,0,0.8)',
                textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
              }}>
                <LogOut className="w-4 h-4" />
                <span>{userWallet ? `${userWallet.slice(0, 6)}...${userWallet.slice(-4)}` : 'Logout'}</span>
              </button>
            ) : (
              <button onClick={login} className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold cinematic-text px-4 py-2 rounded-lg flex items-center space-x-2" style={{
                fontSize: '16px',
                border: '2px solid #000',
                boxShadow: '3px 3px 0px rgba(0,0,0,0.8)',
                textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
              }}>
                <LogIn className="w-4 h-4" />
                <span>Connect</span>
              </button>
            )}
          </div>
        </div>
        { }
        { }
        <div className="flex justify-center">
          <LimelightNav currentView={currentView} setCurrentView={setCurrentView} onInfoClick={() => setShowInfoPopup(true)} isAdmin={isAdmin} />
        </div>
        { }
        <div className="md:hidden flex justify-center items-center mt-4 space-x-4">
          <ThemeToggle theme={theme} setTheme={setTheme} />
          {authenticated ? (
            <button onClick={logout} className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold text-sm px-4 py-2 cinematic-text rounded-lg flex items-center space-x-2" style={{
              fontSize: '14px',
              border: '2px solid #000',
              boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
              textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
            }}>
              <LogOut className="w-4 h-4" />
              <span>{userWallet ? `${userWallet.slice(0, 4)}...${userWallet.slice(-4)}` : 'Out'}</span>
            </button>
          ) : (
            <button onClick={login} className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold text-sm px-4 py-2 cinematic-text rounded-lg flex items-center space-x-2" style={{
              fontSize: '14px',
              border: '2px solid #000',
              boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
              textShadow: '1px 1px 0px rgba(0,0,0,0.5)'
            }}>
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
    <main className="max-w-7xl mx-auto px-4 py-4 md:py-8">
      {currentView === 'home' && <div className="space-y-8">
        { }
        <SpotlightCard className={`${theme === 'dark' ? 'bg-black/30' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-6 border ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-300/50'}`} glowColor="yellow" size="lg" intensity={0.9}>
          <h2 className="text-4xl md:text-5xl font-black text-black bg-white px-6 py-4 rounded-2xl mb-6 text-center cinematic-text" style={{
            textShadow: '3px 3px 0px rgba(255,215,0,0.4)',
            border: '4px solid #000',
            boxShadow: '6px 6px 0px rgba(0,0,0,0.8)'
          }}>HOW FPL.SOL WORKS</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center">
              <div className="bg-yellow-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-black text-xl mx-auto mb-3 cinematic-text" style={{
                border: '2px solid #000',
                boxShadow: '3px 3px 0px rgba(0,0,0,0.8)'
              }}>1</div>
              <h3 className="text-sm md:text-base font-black text-black bg-yellow-400 px-3 py-2 rounded-lg mb-2 pixel-text inline-block" style={{
                fontSize: '10px',
                border: '2px solid #000',
                boxShadow: '3px 3px 0px rgba(0,0,0,0.8)'
              }}>BUILD TEAM</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm body-text uppercase font-semibold`}>
                SELECT 11 PLAYERS WITH £80M BUDGET
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-black text-xl mx-auto mb-3 cinematic-text" style={{
                border: '2px solid #000',
                boxShadow: '3px 3px 0px rgba(0,0,0,0.8)'
              }}>2</div>
              <h3 className="text-sm md:text-base font-black text-black bg-yellow-400 px-3 py-2 rounded-lg mb-2 pixel-text inline-block" style={{
                fontSize: '10px',
                border: '2px solid #000',
                boxShadow: '3px 3px 0px rgba(0,0,0,0.8)'
              }}>STAKE & ENTER</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm body-text uppercase font-semibold`}>
                PAY 0.05 SOL TO JOIN GAMEWEEK
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-black text-xl mx-auto mb-3 cinematic-text" style={{
                border: '2px solid #000',
                boxShadow: '3px 3px 0px rgba(0,0,0,0.8)'
              }}>3</div>
              <h3 className="text-sm md:text-base font-black text-black bg-yellow-400 px-3 py-2 rounded-lg mb-2 pixel-text inline-block" style={{
                fontSize: '10px',
                border: '2px solid #000',
                boxShadow: '3px 3px 0px rgba(0,0,0,0.8)'
              }}>SCORE POINTS</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm body-text uppercase font-semibold`}>
                EARN FROM REAL PLAYER PERFORMANCE
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-black text-xl mx-auto mb-3 cinematic-text" style={{
                border: '2px solid #000',
                boxShadow: '3px 3px 0px rgba(0,0,0,0.8)'
              }}>4</div>
              <h3 className="text-sm md:text-base font-black text-black bg-yellow-400 px-3 py-2 rounded-lg mb-2 pixel-text inline-block" style={{
                fontSize: '10px',
                border: '2px solid #000',
                boxShadow: '3px 3px 0px rgba(0,0,0,0.8)'
              }}>WIN SOL</h3>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm body-text uppercase font-semibold`}>
                TOP PERFORMERS GET 95% OF PRIZE POOL
              </p>
            </div>
          </div>
        </SpotlightCard>
        {activeGameweek ? <SpotlightCard className={`${theme === 'dark' ? 'bg-black/30' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-8 border ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-300/50'}`} glowColor="yellow" size="md" intensity={1}>
          <h2 className="text-4xl md:text-5xl font-black text-black bg-white px-6 py-4 rounded-2xl mb-4 cinematic-text text-center" style={{
            textShadow: '3px 3px 0px rgba(255,215,0,0.4)',
            border: '4px solid #000',
            boxShadow: '6px 6px 0px rgba(0,0,0,0.8)'
          }}>
            GAMEWEEK {activeGameweek.gameweek}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm body-text`}>Status</p>
              <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} cinematic-text capitalize`}>{activeGameweek.status}</p>
            </div>
            <div>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm body-text`}>Entry Fee</p>
              <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} cinematic-text`}>0.05 SOL</p>
            </div>
            <div>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm body-text`}>Entries</p>
              <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} cinematic-text`}>{entriesCount}</p>
            </div>
            <div>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm body-text`}>Prize Pool</p>
              <p className={`text-xl font-semibold ${theme === 'dark' ? 'text-yellow-600 gold-glow' : 'text-yellow-700'} cinematic-text`}>{activeGameweek.prizePool} SOL</p>
            </div>
          </div>
          { }
          {gameweekDeadline && activeGameweek.status === 'active' && <div className="mt-6 p-4 bg-yellow-600/20 rounded-lg border border-yellow-600/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-yellow-600 font-bold mb-1 cinematic-text gold-glow" style={{
                  textShadow: '2px 2px 0px #000'
                }}>
                  ⏰ TEAM SUBMISSION DEADLINE
                </h4>
                <p className="text-gray-300 text-sm body-text">
                  Teams must be submitted 1 hour before first fixture
                </p>
              </div>
              <div className="text-right">
                {isAfterDeadline ? <div className="text-red-400 font-bold text-lg cinematic-text" style={{
                  textShadow: '2px 2px 0px #000'
                }}>
                  DEADLINE PASSED
                </div> : <div>
                  <div className="text-yellow-600 font-bold text-lg cinematic-text gold-glow" style={{
                    textShadow: '2px 2px 0px #000'
                  }}>
                    {formatDeadline(gameweekDeadline)}
                  </div>
                  <div className="text-gray-300 text-xs body-text">
                    remaining
                  </div>
                </div>}
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400 body-text">
              Deadline: {gameweekDeadline.toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>}
          {activeGameweek.status === 'finished' && activeGameweek.winnerId && <div className="mt-6 p-4 bg-yellow-600/20 rounded-lg border border-yellow-600/50">
            <h3 className="text-yellow-600 font-bold mb-2 cinematic-text gold-glow" style={{
              textShadow: '2px 2px 0px #000'
            }}>🏆 GAMEWEEK WINNER</h3>
            <p className="text-gray-300 body-text">
              Winner: {activeGameweek.winnerId.slice(0, 8)}...{activeGameweek.winnerId.slice(-4)}
            </p>
            <p className="text-gray-300 body-text">Prize: {(activeGameweek.prizePool * 0.95).toFixed(3)} SOL</p>
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
          <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-100 mb-2 cinematic-text">NO ACTIVE GAMEWEEK</h2>
          <p className="text-gray-300 mb-6 body-text">Waiting for the next gameweek to begin...</p>
          {isAdmin && <AnimatedButton onClick={createGameweek} color="yellow" hoverText="Create Now">
            CREATE GAMEWEEK (ADMIN)
          </AnimatedButton>}
        </SpotlightCard>}
        {activeGameweek && players.length > 0 && isGameweekStarted && <SpotlightCard className={`${theme === 'dark' ? 'bg-black/30' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-6 border ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-300/50'}`} glowColor="green" size="lg" intensity={0.9}>
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'} mb-6 text-center cinematic-text ${theme === 'dark' ? 'gold-glow' : ''}`} style={{
            textShadow: theme === 'dark' ? '3px 3px 0px #000' : 'none'
          }}>
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
                return <div key={`${player.id}-${index}`} className={`flex-shrink-0 w-40 ${theme === 'dark' ? 'bg-black/40' : 'bg-white/60'} backdrop-blur-sm rounded-lg p-4 border ${theme === 'dark' ? 'border-green-700/30' : 'border-green-400/50'}`} style={{
                  boxShadow: theme === 'dark' ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                  <div className="text-center">
                    <img src={`https://resources.premierleague.com/premierleague/photos/players/250x250/p${player.code}.png`} alt={`${player.first_name} ${player.second_name}`} className="w-16 h-16 rounded-full mx-auto mb-2 object-cover border-2 border-green-400/50" onError={e => {
                      e.target.style.display = 'none';
                    }} />
                    <h3 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} truncate cinematic-text`}>
                      {player.first_name}
                    </h3>
                    <h4 className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} truncate cinematic-text`}>
                      {player.second_name}
                    </h4>
                    <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} body-text`}>
                      {playerTeam?.short_name} • {playerPosition?.singular_name_short}
                    </p>
                    <div className="mt-2 bg-green-600/20 rounded-lg p-2 border border-green-500/30">
                      <p className="text-green-400 font-bold text-lg cinematic-text gold-glow" style={{
                        textShadow: '2px 2px 0px #000'
                      }}>
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
          <div className="flex items-center justify-between mb-6 cursor-pointer hover:bg-gray-700/10 transition-colors rounded p-4" onClick={() => setShowFixtures(!showFixtures)}>
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-yellow-600" />
              <h2 className="text-2xl font-bold text-gray-100 cinematic-text">
                PREMIER LEAGUE FIXTURES
              </h2>
            </div>
            <span className="text-yellow-600 hover:text-yellow-500 transition-colors text-2xl font-bold cinematic-text gold-glow" style={{
              textShadow: '2px 2px 0px #000'
            }}>
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
              }} disabled={selectedFixtureGameweek <= Math.min(...getAvailableGameweeks())} className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-black p-2 rounded-lg transition-colors cinematic-text" style={{
                border: '2px solid #000',
                boxShadow: '2px 2px 0px rgba(0,0,0,0.8)'
              }}>
                ← PREVIOUS
              </button>
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-100 mb-2 cinematic-text gold-glow" style={{
                  textShadow: '2px 2px 0px #000'
                }}>
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
              }} disabled={selectedFixtureGameweek >= Math.max(...getAvailableGameweeks())} className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-black p-2 rounded-lg transition-colors cinematic-text" style={{
                border: '2px solid #000',
                boxShadow: '2px 2px 0px rgba(0,0,0,0.8)'
              }}>
                NEXT →
              </button>
            </div>
            <FixturesDisplay gameweekFixtures={selectedGameweekFixtures} gameweek={selectedFixtureGameweek} />
          </div>}
        </SpotlightCard>}
      </div>}
      {currentView === 'profile' && <div className="space-y-8">
        <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-green-700/30" glowColor="purple" size="lg" intensity={1.1}>
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-8 h-8 text-purple-400" style={{
              filter: 'drop-shadow(2px 2px 0px #000)'
            }} />
            <h2 className="text-3xl md:text-4xl font-black text-black bg-white px-6 py-4 rounded-2xl cinematic-text" style={{
              textShadow: '3px 3px 0px rgba(255,215,0,0.4)',
              border: '4px solid #000',
              boxShadow: '6px 6px 0px rgba(0,0,0,0.8)'
            }}>YOUR PROFILE</h2>
          </div>
          { }
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 mb-8">
            <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-green-700/30" glowColor="yellow" size="sm" intensity={0.8}>
              <div className="flex items-center space-x-2 md:space-x-3">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" style={{
                  filter: 'drop-shadow(2px 2px 0px #000)'
                }} />
                <div>
                  <p className="text-white text-xs md:text-sm" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace',
                    textShadow: '1px 1px 0px #000'
                  }}>Wins</p>
                  <p className="text-lg md:text-2xl font-bold text-white" style={{
                    fontFamily: 'VT323, monospace',
                    textShadow: '2px 2px 0px #000'
                  }}>{userStats?.wins || 0}</p>
                </div>
              </div>
            </SpotlightCard>
            <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-green-700/30" glowColor="red" size="sm" intensity={0.8}>
              <div className="flex items-center space-x-2 md:space-x-3">
                <Medal className="w-6 h-6 md:w-8 md:h-8 text-red-400" style={{
                  filter: 'drop-shadow(2px 2px 0px #000)'
                }} />
                <div>
                  <p className="text-white text-xs md:text-sm" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace',
                    textShadow: '1px 1px 0px #000'
                  }}>GW {activeGameweek?.gameweek || '-'} Rank</p>
                  <p className="text-lg md:text-2xl font-bold text-white" style={{
                    fontFamily: 'VT323, monospace',
                    textShadow: '2px 2px 0px #000'
                  }}>
                    {(() => {
                      if (!activeGameweek || !userWallet || leaderboard.length === 0) return 'N/A';
                      const userIndex = leaderboard.findIndex(entry => entry.userId === userWallet);
                      return userIndex !== -1 ? `#${userIndex + 1}` : 'Not Entered';
                    })()}
                  </p>
                </div>
              </div>
            </SpotlightCard>
            <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-green-700/30" glowColor="green" size="sm" intensity={0.8}>
              <div className="flex items-center space-x-2 md:space-x-3">
                <Target className="w-6 h-6 md:w-8 md:h-8 text-green-400" style={{
                  filter: 'drop-shadow(2px 2px 0px #000)'
                }} />
                <div>
                  <p className="text-white text-xs md:text-sm" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace',
                    textShadow: '1px 1px 0px #000'
                  }}>Entries</p>
                  <p className="text-lg md:text-2xl font-bold text-white" style={{
                    fontFamily: 'VT323, monospace',
                    textShadow: '2px 2px 0px #000'
                  }}>{userEntries.length}</p>
                </div>
              </div>
            </SpotlightCard>
          </div>
          { }
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            { }
            <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-green-700/30" glowColor="blue" size="sm" intensity={0.8}>
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-6 h-6 text-blue-400" style={{
                  filter: 'drop-shadow(2px 2px 0px #000)'
                }} />
                <h3 className="text-xl font-bold text-white" style={{
                  fontFamily: 'VT323, monospace',
                  textShadow: '2px 2px 0px #000'
                }}>Performance Stats</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-100" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>Games Played:</span>
                  <span className="text-white font-bold">{userEntries.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>Wins:</span>
                  <span className="text-green-400 font-bold">{userStats?.wins || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>Losses:</span>
                  <span className="text-red-400 font-bold">{userStats?.losses || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>Win Rate:</span>
                  <span className="text-yellow-400 font-bold">
                    {userEntries.length > 0 ? Math.round((userStats?.wins || 0) / userEntries.length * 100) : 0}%
                  </span>
                </div>
              </div>
            </SpotlightCard>}
            { }
            {claimableWinnings.length > 0 && <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-green-700/30" glowColor="yellow" size="sm" intensity={1.0}>
              <div className="flex items-center space-x-3 mb-4">
                <Trophy className="w-6 h-6 text-yellow-400" style={{
                  filter: 'drop-shadow(2px 2px 0px #000)'
                }} />
                <h3 className="text-xl font-bold text-white" style={{
                  fontFamily: 'VT323, monospace',
                  textShadow: '2px 2px 0px #000'
                }}>🎉 Claimable Winnings</h3>
              </div>
              <div className="space-y-4">
                {claimableWinnings.map(game => <div key={game.id} className="bg-yellow-700/20 border border-yellow-500/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-yellow-400 font-bold text-lg" style={{
                        fontFamily: 'VT323, monospace',
                        textShadow: '2px 2px 0px #000'
                      }}>
                        Gameweek {game.gameweek} Winner! 🏆
                      </h4>
                      <p className="text-green-100 text-sm" style={{
                        fontFamily: 'Courier Prime, Monaco, monospace'
                      }}>
                        Prize: {(game.prizePool * 0.95).toFixed(3)} SOL
                      </p>
                    </div>
                    <AnimatedButton onClick={() => claimSpecificPrize(game.id)} color="yellow" hoverText="Claim Now!" className="py-2 px-4">
                      💰 Claim Prize
                    </AnimatedButton>
                  </div>
                  <p className="text-yellow-200 text-xs" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>
                    Total Prize Pool: {game.prizePool} SOL • You get 95%
                  </p>
                </div>)}
              </div>
            </SpotlightCard>}
            { }
            {userInviteCode && <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-green-700/30" glowColor="yellow" size="sm" intensity={0.8}>
              <div className="flex items-center space-x-3 mb-4">
                <Medal className="w-6 h-6 text-yellow-400" style={{
                  filter: 'drop-shadow(2px 2px 0px #000)'
                }} />
                <h3 className="text-xl font-bold text-white" style={{
                  fontFamily: 'VT323, monospace',
                  textShadow: '2px 2px 0px #000'
                }}>Achievements</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-green-700/20 border border-green-500/50 rounded-lg p-4">
                  <p className="text-green-100 text-sm mb-2" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>Share this code with friends:</p>
                  <div className="flex items-center space-x-2">
                    <code className="bg-black/50 text-green-300 px-3 py-2 rounded text-lg font-bold border border-green-700/50 select-all cursor-pointer" style={{
                      fontFamily: 'VT323, monospace',
                      textShadow: '1px 1px 0px #000'
                    }}>
                      {userInviteCode.code}
                    </code>
                  </div>
                </div>
                <p className="text-green-200 text-xs" style={{
                  fontFamily: 'Courier Prime, Monaco, monospace'
                }}>
                  Each code can only be used once. You'll get a new code when someone uses yours!
                </p>
              </div>
            </SpotlightCard>}
            { }
            <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-green-700/30" glowColor="yellow" size="sm" intensity={0.8}>
              <div className="flex items-center space-x-3 mb-4">
                <Medal className="w-6 h-6 text-yellow-400" style={{
                  filter: 'drop-shadow(2px 2px 0px #000)'
                }} />
                <h3 className="text-xl font-bold text-white" style={{
                  fontFamily: 'VT323, monospace',
                  textShadow: '2px 2px 0px #000'
                }}>Achievements</h3>
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
          {userEntries.length > 0 && <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-green-700/30 mt-6" glowColor="green" size="md" intensity={0.8}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white" style={{
                fontFamily: 'VT323, monospace',
                textShadow: '2px 2px 0px #000'
              }}>Game History</h3>
              <button onClick={loadUserData} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded transition-colors flex items-center space-x-2" style={{
                border: '2px solid #000',
                boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                fontFamily: 'VT323, monospace'
              }}>
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
      {currentView === 'team' && <div className="space-y-8">
        <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-green-700/30" glowColor="purple" size="lg" intensity={1.1}>
          <h2 className="text-3xl md:text-4xl font-black text-black bg-white px-6 py-4 rounded-2xl mb-4 cinematic-text text-center" style={{
            textShadow: '3px 3px 0px rgba(255,215,0,0.4)',
            border: '4px solid #000',
            boxShadow: '6px 6px 0px rgba(0,0,0,0.8)'
          }}>
            {isTeamSubmitted ? 'YOUR GAMEWEEK TEAM' : 'BUILD YOUR TEAM'}
          </h2>
          {isTeamSubmitted && <div className="bg-green-700/30 p-4 rounded-lg mb-6 text-center border border-green-500/50">
            <p className="text-green-100 font-bold text-lg" style={{
              fontFamily: 'VT323, monospace',
              textShadow: '2px 2px 0px #000'
            }}>
              Your team is locked in for Gameweek {activeGameweek?.gameweek}!
            </p>
            <p className="text-white mt-2">
              Total Points: <span className="font-bold text-yellow-400 text-xl">
                {isGameweekStarted ? currentUserEntry.points || 0 : 0}
              </span>
            </p>
            <div className="mt-4">
              <AnimatedButton onClick={shareTeamOnX} className="bg-blue-600 hover:bg-blue-700" color="blue" hoverText="Share on X!">
                🐦 Share Team on X
              </AnimatedButton>
            </div>
          </div>}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-2 sm:space-y-0">
            <p className="text-green-100 text-lg md:text-xl" style={{
              fontFamily: 'Courier Prime, Monaco, monospace',
              textShadow: '1px 1px 0px #000'
            }}>
              Budget Remaining: <span className="text-yellow-400 font-bold text-xl md:text-2xl" style={{
                fontFamily: 'VT323, monospace',
                textShadow: '2px 2px 0px #000'
              }}>{formatPrice(teamBudget)}</span>
            </p>
            <p className="text-green-100 text-lg md:text-xl" style={{
              fontFamily: 'Courier Prime, Monaco, monospace',
              textShadow: '1px 1px 0px #000'
            }}>
              Players Selected: <span className="text-white font-bold text-xl md:text-2xl" style={{
                fontFamily: 'VT323, monospace',
                textShadow: '2px 2px 0px #000'
              }}>{selectedTeam.length}/11</span>
            </p>
          </div>
          <div className="space-y-6 mb-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white" style={{
                fontFamily: 'VT323, monospace',
                textShadow: '2px 2px 0px #000'
              }}>Your Pitch</h3>
              {!isTeamSubmitted && <div className="flex justify-center space-x-3">
                <button onClick={resetTeam} className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors flex items-center justify-center" style={{
                  border: '2px solid #000',
                  boxShadow: '3px 3px 0px rgba(0,0,0,0.8)'
                }} title="Reset Team">
                  <RotateCcw className="w-5 h-5" />
                </button>
                {selectedTeam.length < 11 && <button onClick={autoCompleteTeam} className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg transition-colors flex items-center justify-center" style={{
                  border: '2px solid #000',
                  boxShadow: '3px 3px 0px rgba(0,0,0,0.8)'
                }} title="Auto Complete Team">
                  <Zap className="w-5 h-5" />
                </button>}
                {selectedTeam.length === 11 && <button onClick={() => {
                  resetTeam();
                  setTimeout(intelligentAutoComplete, 100);
                }} className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg transition-colors flex items-center justify-center" style={{
                  border: '2px solid #000',
                  boxShadow: '3px 3px 0px rgba(0,0,0,0.8)'
                }} title="Retry Auto Complete">
                  <Zap className="w-5 h-5" />
                </button>}
              </div>}
            </div>
            <div id="team-formation-capture">
              <FormationDisplay isTeamSubmitted={isTeamSubmitted} />
            </div>
            {!isTeamSubmitted && <FormationDock selectedFormation={selectedFormation} setSelectedFormation={setSelectedFormation} />}
          </div>
          {!isTeamSubmitted && <>
            { }
            {gameweekDeadline && activeGameweek?.status === 'active' && <div className={`mb-6 p-4 rounded-lg border ${isAfterDeadline ? 'bg-red-700/30 border-red-500/50' : 'bg-yellow-700/30 border-yellow-500/50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-bold mb-1 ${isAfterDeadline ? 'text-red-400' : 'text-yellow-400'}`} style={{
                    fontFamily: 'VT323, monospace',
                    textShadow: '2px 2px 0px #000'
                  }}>
                    {isAfterDeadline ? '🚫 Submission Deadline Passed' : '⏰ Submission Deadline'}
                  </h4>
                  <p className="text-green-100 text-sm" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>
                    {isAfterDeadline ? 'You can no longer submit teams for this gameweek' : 'Teams must be submitted before first fixture starts'}
                  </p>
                </div>
                {!isAfterDeadline && <div className="text-right">
                  <div className="text-yellow-400 font-bold text-lg" style={{
                    fontFamily: 'VT323, monospace',
                    textShadow: '2px 2px 0px #000'
                  }}>
                    {formatDeadline(gameweekDeadline)}
                  </div>
                  <div className="text-green-100 text-xs" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>
                    remaining
                  </div>
                </div>}
              </div>
            </div>}
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                {isFormationValid() && captain && activeGameweek && !isAfterDeadline && <AnimatedButton onClick={submitTeam} className="flex-1 py-3" color="yellow" hoverText="Enter Now!">
                  Submit Team & Pay 0.05 SOL
                </AnimatedButton>}
                {isFormationValid() && captain && activeGameweek && isAfterDeadline && !isAdmin && <div className="flex-1 py-3 px-6 bg-red-600 text-white rounded-lg text-center border-2 border-black opacity-75" style={{
                  fontFamily: 'VT323, monospace',
                  fontSize: '18px'
                }}>
                  Deadline Passed - Cannot Submit
                </div>}
                {isFormationValid() && captain && activeGameweek && isAfterDeadline && isAdmin && <AnimatedButton onClick={submitTeam} className="flex-1 py-3" color="red" hoverText="Admin Override!">
                  Submit Team (Admin Override)
                </AnimatedButton>}
                {isFormationValid() && !captain && <div className="flex-1 py-3 px-6 bg-gray-600 text-white rounded-lg text-center border-2 border-black opacity-50" style={{
                  fontFamily: 'VT323, monospace',
                  fontSize: '18px'
                }}>
                  Select a Captain First
                </div>}
              </div>
              <AnimatedButton onClick={() => setShowFilters(!showFilters)} className="py-3" color="gray" hoverText={showFilters ? "Hide Filters" : "Show Filters"}>
                {showFilters ? "Hide Player Filters" : "Show Player Filters"}
              </AnimatedButton>
            </div>
            {showFilters && <SpotlightCard className="bg-black/30 rounded-lg p-6 mb-6 border border-green-700/30" glowColor="blue" size="md" intensity={0.8}>
              <h4 className="text-white font-semibold mb-4 text-lg" style={{
                fontFamily: 'VT323, monospace',
                textShadow: '2px 2px 0px #000'
              }}>Filter Players</h4>
              <div className="mb-4">
                <label className="block text-green-100 text-sm mb-2" style={{
                  fontFamily: 'Courier Prime, Monaco, monospace'
                }}>Search Players</label>
                <input type="text" value={filters.search} onChange={e => setFilters({
                  ...filters,
                  search: e.target.value
                })} className="w-full bg-black/50 border-2 border-green-700/50 rounded px-3 py-2 text-white text-sm focus:border-green-400 transition-colors" style={{
                  fontFamily: 'Courier Prime, Monaco, monospace',
                  boxShadow: '2px 2px 0px rgba(0,0,0,0.5)'
                }} placeholder="Search by player name..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-green-100 text-sm mb-2" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>Club</label>
                  <select value={filters.club} onChange={e => setFilters({
                    ...filters,
                    club: e.target.value
                  })} className="w-full bg-black/50 border-2 border-green-700/50 rounded px-3 py-2 text-white text-sm focus:border-green-400 transition-colors" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace',
                    boxShadow: '2px 2px 0px rgba(0,0,0,0.5)'
                  }}>
                    <option value="">All Clubs</option>
                    {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-green-100 text-sm mb-2" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>Position</label>
                  <select value={filters.position} onChange={e => setFilters({
                    ...filters,
                    position: e.target.value
                  })} className="w-full bg-black/50 border-2 border-green-700/50 rounded px-3 py-2 text-white text-sm focus:border-green-400 transition-colors" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace',
                    boxShadow: '2px 2px 0px rgba(0,0,0,0.5)'
                  }}>
                    <option value="">All Positions</option>
                    {positions.map(position => <option key={position.id} value={position.id}>{position.singular_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-green-100 text-sm mb-2" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>Min Price (£M)</label>
                  <input type="number" step="0.1" value={filters.minPrice} onChange={e => setFilters({
                    ...filters,
                    minPrice: e.target.value
                  })} className="w-full bg-black/50 border-2 border-green-700/50 rounded px-3 py-2 text-white text-sm focus:border-green-400 transition-colors" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace',
                    boxShadow: '2px 2px 0px rgba(0,0,0,0.5)'
                  }} placeholder="e.g. 4.0" />
                </div>
                <div>
                  <label className="block text-green-100 text-sm mb-2" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>Max Price (£M)</label>
                  <input type="number" step="0.1" value={filters.maxPrice} onChange={e => setFilters({
                    ...filters,
                    maxPrice: e.target.value
                  })} className="w-full bg-black/50 border-2 border-green-700/50 rounded px-3 py-2 text-white text-sm focus:border-green-400 transition-colors" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace',
                    boxShadow: '2px 2px 0px rgba(0,0,0,0.5)'
                  }} placeholder="e.g. 15.0" />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-green-100 text-sm mb-2" style={{
                  fontFamily: 'Courier Prime, Monaco, monospace'
                }}>Sort Players</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <button onClick={() => setSortOption({
                    field: 'total_points',
                    direction: sortOption.field === 'total_points' && sortOption.direction === 'desc' ? 'asc' : 'desc'
                  })} className={`px-3 py-2 rounded text-sm font-semibold transition-colors ${sortOption.field === 'total_points' ? 'bg-green-600 text-white border-2 border-green-400' : 'bg-black/50 text-green-100 border-2 border-green-700/50 hover:border-green-400'}`} style={{
                    fontFamily: 'VT323, monospace',
                    boxShadow: '2px 2px 0px rgba(0,0,0,0.5)'
                  }}>
                    Points {sortOption.field === 'total_points' ? sortOption.direction === 'desc' ? '↓' : '↑' : ''}
                  </button>
                  <button onClick={() => setSortOption({
                    field: 'now_cost',
                    direction: sortOption.field === 'now_cost' && sortOption.direction === 'desc' ? 'asc' : 'desc'
                  })} className={`px-3 py-2 rounded text-sm font-semibold transition-colors ${sortOption.field === 'now_cost' ? 'bg-yellow-600 text-white border-2 border-yellow-400' : 'bg-black/50 text-green-100 border-2 border-green-700/50 hover:border-green-400'}`} style={{
                    fontFamily: 'VT323, monospace',
                    boxShadow: '2px 2px 0px rgba(0,0,0,0.5)'
                  }}>
                    Price {sortOption.field === 'now_cost' ? sortOption.direction === 'desc' ? '↓' : '↑' : ''}
                  </button>
                  <button onClick={() => setSortOption({
                    field: 'selected_by_percent',
                    direction: sortOption.field === 'selected_by_percent' && sortOption.direction === 'desc' ? 'asc' : 'desc'
                  })} className={`px-3 py-2 rounded text-sm font-semibold transition-colors ${sortOption.field === 'selected_by_percent' ? 'bg-purple-600 text-white border-2 border-purple-400' : 'bg-black/50 text-green-100 border-2 border-green-700/50 hover:border-green-400'}`} style={{
                    fontFamily: 'VT323, monospace',
                    boxShadow: '2px 2px 0px rgba(0,0,0,0.5)'
                  }}>
                    Popular {sortOption.field === 'selected_by_percent' ? sortOption.direction === 'desc' ? '↓' : '↑' : ''}
                  </button>
                </div>
                <p className="text-green-200 text-xs mt-2" style={{
                  fontFamily: 'Courier Prime, Monaco, monospace'
                }}>
                  Click sort buttons to toggle between highest/lowest first
                </p>
              </div>
              <AnimatedButton onClick={resetFilters} color="gray" hoverText="Reset All">
                Clear Filters
              </AnimatedButton>
            </SpotlightCard>}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-h-96 overflow-y-auto">
              {getFilteredPlayers().slice(0, 50).map((player, index) => {
                const playerTeam = teams.find(t => t.id === player.team);
                const playerPosition = positions.find(p => p.id === player.element_type);
                const nextOpponent = getNextOpponent(player.team);
                const difficulty = nextOpponent ? getDifficultyLevel(nextOpponent.team) : null;
                const {
                  canAdd,
                  reason
                } = canAddPlayer(player);
                const glowColors = ['blue', 'purple', 'green', 'red', 'orange'];
                const playerGlowColor = glowColors[index % glowColors.length];
                return <SpotlightCard key={player.id} className="bg-black/30 p-3 md:p-4 rounded-lg border border-green-700/20" glowColor={playerGlowColor} size="sm" intensity={0.7}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold text-sm md:text-base truncate pr-2">
                      {player.first_name} {player.second_name}
                    </h4>
                    <span className="text-yellow-400 font-bold text-sm md:text-base flex-shrink-0">
                      {formatPrice(player.now_cost)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-green-100 text-xs md:text-sm truncate">{playerTeam?.name}</p>
                    <p className="text-green-100 text-xs md:text-sm">{playerPosition?.singular_name}</p>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-green-100 text-xs md:text-sm">
                      GW Points: {isGameweekStarted ? player.event_points || 0 : 0} | Season: {player.total_points}
                    </p>
                    <p className="text-purple-300 text-xs md:text-sm">{parseFloat(player.selected_by_percent || 0).toFixed(1)}% own</p>
                  </div>
                  {nextOpponent && <div className="mb-2 p-2 bg-black/40 rounded border border-green-700/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <span className="text-green-100 text-xs">Next:</span>
                        <span className="text-white text-xs font-medium truncate">
                          {nextOpponent.isHome ? 'vs' : '@'} {nextOpponent.team?.short_name || 'TBD'}
                        </span>
                      </div>
                      {difficulty && <span className={`text-xs px-2 py-1 rounded font-medium ${difficulty.color === 'green' ? 'bg-green-600/80 text-green-100' : difficulty.color === 'yellow' ? 'bg-yellow-600/80 text-yellow-100' : 'bg-red-600/80 text-red-100'}`}>
                        {difficulty.level}
                      </span>}
                    </div>
                  </div>}
                  <button onClick={() => addPlayerToTeam(player)} disabled={!canAdd} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2 rounded transition-colors text-sm md:text-base" title={!canAdd ? reason : ''}>
                    {selectedTeam.find(p => p.id === player.id) ? 'Selected' : 'Add to Team'}
                  </button>
                  {!canAdd && reason && <p className="text-red-400 text-xs mt-1 truncate">{reason}</p>}
                </SpotlightCard>;
              })}
            </div>
          </>}
        </SpotlightCard>
      </div>}
      {currentView === 'leaderboard' && <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-green-700/30" glowColor="yellow" size="lg" intensity={1}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl md:text-4xl font-black text-black bg-white px-6 py-4 rounded-2xl cinematic-text" style={{
            textShadow: '3px 3px 0px rgba(255,215,0,0.4)',
            border: '4px solid #000',
            boxShadow: '6px 6px 0px rgba(0,0,0,0.8)'
          }}>LEADERBOARD</h2>
          {activeGameweek?.status === 'active' && <div className="text-right">
            <p className="text-green-400 text-sm font-bold" style={{
              fontFamily: 'VT323, monospace',
              textShadow: '1px 1px 0px #000'
            }}>
              {isGameweekStarted ? '🔴 LIVE' : '⏳ PENDING'} GAMEWEEK {activeGameweek.gameweek}
            </p>
            <p className="text-green-200 text-xs" style={{
              fontFamily: 'Courier Prime, Monaco, monospace'
            }}>
              {isGameweekStarted ? 'Points update live' : 'Waiting for first fixture'}
            </p>
          </div>}
        </div>
        {leaderboard.length > 0 ? <div className="space-y-4">
          {leaderboard.map((entry, index) => {
            const rankColors = ['yellow', 'blue', 'green', 'purple', 'orange'];
            const rankGlowColor = index === 0 ? 'yellow' : rankColors[index % rankColors.length];
            const isLivePoints = activeGameweek?.status === 'active' && entry.isLiveCalculated;
            return <SpotlightCard key={entry.id} className={`p-4 rounded-lg border ${index === 0 ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-black/30 border-green-700/30'}`} glowColor={rankGlowColor} size="sm" intensity={index === 0 ? 1.2 : 0.8}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`text-2xl font-bold ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                    #{index + 1}
                  </span>
                  {index === 0 && <Trophy className="w-6 h-6 text-yellow-400" />}
                  <span className="text-white font-semibold">
                    {entry.userId.slice(0, 8)}...{entry.userId.slice(-4)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <p className={`text-xl font-bold ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                      {entry.points || 0}
                    </p>
                    {isLivePoints && <span className="text-green-400 text-xs animate-pulse">●</span>}
                  </div>
                  <p className="text-green-100 text-sm">
                    {activeGameweek?.status === 'active' ? 'GW Points' : 'Final Points'} • {formatPrice(entry.teamValue)}
                  </p>
                </div>
              </div>
            </SpotlightCard>;
          })}
        </div> : <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-green-100">No entries yet for this gameweek</p>
        </div>}
      </SpotlightCard>}
      {currentView === 'admin' && isAdmin && <div className="space-y-8">
        <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-red-700/30" glowColor="red" size="lg" intensity={1.1}>
          <div className="flex items-center space-x-3 mb-6">
            <Users className="w-8 h-8 text-red-400" style={{
              filter: 'drop-shadow(2px 2px 0px #000)'
            }} />
            <h2 className="text-3xl md:text-4xl font-black text-black bg-red-500 px-6 py-4 rounded-2xl cinematic-text" style={{
              textShadow: '3px 3px 0px rgba(0,0,0,0.3)',
              border: '4px solid #000',
              boxShadow: '6px 6px 0px rgba(0,0,0,0.8)'
            }}>ADMIN DASHBOARD</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-red-700/30" glowColor="red" size="sm" intensity={0.8}>
              <div className="flex items-center space-x-3 mb-4">
                <Users className="w-6 h-6 text-red-400" style={{
                  filter: 'drop-shadow(2px 2px 0px #000)'
                }} />
                <h3 className="text-xl font-bold text-white" style={{
                  fontFamily: 'VT323, monospace',
                  textShadow: '2px 2px 0px #000'
                }}>Generate Invite Codes</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-red-700/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-100 text-sm mb-3" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>Generate new invite codes for distribution:</p>
                  <div className="flex items-center space-x-3 mb-3">
                    <label className="text-red-100 text-sm" style={{
                      fontFamily: 'Courier Prime, Monaco, monospace'
                    }}>Count:</label>
                    <input type="number" min="1" max="50" value={generateCount} onChange={e => setGenerateCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))} className="bg-black/50 border-2 border-red-700/50 rounded px-3 py-2 text-white text-sm w-24 focus:border-red-400 transition-colors" style={{
                      fontFamily: 'Courier Prime, Monaco, monospace',
                      boxShadow: '2px 2px 0px rgba(0,0,0,0.5)'
                    }} />
                    <AnimatedButton onClick={generateAdminInviteCodes} color="red" hoverText="Generate!" className="py-2 px-4">
                      Generate Codes
                    </AnimatedButton>
                  </div>
                </div>
              </div>
            </SpotlightCard>
            <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-green-700/30" glowColor="green" size="sm" intensity={0.8}>
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="w-6 h-6 text-green-400" style={{
                  filter: 'drop-shadow(2px 2px 0px #000)'
                }} />
                <h3 className="text-xl font-bold text-white" style={{
                  fontFamily: 'VT323, monospace',
                  textShadow: '2px 2px 0px #000'
                }}>Code Statistics</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-green-100" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>Total Generated:</span>
                  <span className="text-white font-bold text-xl">{adminInviteCodes.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>Available:</span>
                  <span className="text-green-400 font-bold text-xl">{adminInviteCodes.filter(code => !code.used).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>Used:</span>
                  <span className="text-red-400 font-bold text-xl">{adminInviteCodes.filter(code => code.used).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-green-100" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>Usage Rate:</span>
                  <span className="text-yellow-400 font-bold text-xl">
                    {adminInviteCodes.length > 0 ? Math.round(adminInviteCodes.filter(code => code.used).length / adminInviteCodes.length * 100) : 0}%
                  </span>
                </div>
              </div>
            </SpotlightCard>
          </div>
          <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-blue-700/30 mt-6" glowColor="blue" size="md" intensity={0.8}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white" style={{
                fontFamily: 'VT323, monospace',
                textShadow: '2px 2px 0px #000'
              }}>All Invite Codes ({adminInviteCodes.length})</h3>
              <div className="flex items-center space-x-2">
                {adminInviteCodes.filter(code => !code.used).length > 0 && <button onClick={async () => {
                  try {
                    const availableCodes = adminInviteCodes.filter(code => !code.used).map(code => code.code);
                    const codesList = availableCodes.join('\n');
                    await navigator.clipboard.writeText(codesList);
                    alert(`Copied ${availableCodes.length} available codes to clipboard!`);
                  } catch (err) {
                    console.error('Failed to copy codes:', err);
                    const availableCodes = adminInviteCodes.filter(code => !code.used).map(code => code.code);
                    const codesList = availableCodes.join('\n');
                    const textArea = document.createElement('textarea');
                    textArea.value = codesList;
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                    alert(`Copied ${availableCodes.length} available codes to clipboard!`);
                  }
                }} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors flex items-center space-x-2" style={{
                  border: '2px solid #000',
                  boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                  fontFamily: 'VT323, monospace'
                }}>
                  <span>📋</span>
                  <span>Copy All Available</span>
                </button>}
                <button onClick={loadAdminInviteCodes} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors flex items-center space-x-2" style={{
                  border: '2px solid #000',
                  boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                  fontFamily: 'VT323, monospace'
                }}>
                  <RotateCcw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {adminInviteCodes.map((code, index) => <div key={code.id} className={`p-4 rounded border transition-all hover:bg-black/40 ${code.used ? 'bg-gray-700/30 border-gray-600/50' : 'bg-blue-700/20 border-blue-500/50'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-bold text-lg" style={{
                      fontFamily: 'VT323, monospace'
                    }}>
                      #{adminInviteCodes.length - index}
                    </span>
                    <code className="bg-black/50 text-green-300 px-3 py-2 rounded text-lg font-bold border border-green-700/50" style={{
                      fontFamily: 'VT323, monospace',
                      textShadow: '1px 1px 0px #000'
                    }}>
                      {code.code}
                    </code>
                    <span className={`text-sm px-3 py-1 rounded font-medium ${code.used ? 'bg-gray-600/80 text-gray-200' : 'bg-green-600/80 text-green-100'}`}>
                      {code.used ? 'Used' : 'Available'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    {code.used && code.usedBy && <div className="text-right">
                      <p className="text-gray-300 text-sm" style={{
                        fontFamily: 'Courier Prime, Monaco, monospace'
                      }}>Used by:</p>
                      <p className="text-white font-medium">{code.usedBy.slice(0, 8)}...{code.usedBy.slice(-4)}</p>
                    </div>}
                    <button onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(code.code);
                        alert('Code copied to clipboard!');
                      } catch (err) {
                        console.error('Failed to copy code:', err);
                        const textArea = document.createElement('textarea');
                        textArea.value = code.code;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        alert('Code copied to clipboard!');
                      }
                    }} className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded transition-colors flex items-center space-x-2" style={{
                      border: '2px solid #000',
                      boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                      fontFamily: 'VT323, monospace'
                    }}>
                      <span>📋</span>
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
                {code.used && <div className="mt-3 pt-3 border-t border-gray-600/30">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Created: {new Date(code.createdAt).toLocaleDateString()}</span>
                    <span>Used: {new Date(code.updatedAt || code.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>}
              </div>)}
              {adminInviteCodes.length === 0 && <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-red-200 text-lg" style={{
                  fontFamily: 'Courier Prime, Monaco, monospace'
                }}>
                  No invite codes generated yet.
                </p>
                <p className="text-red-300 text-sm mt-2" style={{
                  fontFamily: 'Courier Prime, Monaco, monospace'
                }}>
                  Use the generator above to create your first batch of codes.
                </p>
              </div>}
            </div>
          </SpotlightCard>
          <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-yellow-700/30 mt-6" glowColor="yellow" size="md" intensity={0.8}>
            <div className="flex items-center space-x-3 mb-4">
              <svg className="w-6 h-6 text-yellow-400" viewBox="0 0 24 24" fill="currentColor" style={{
                filter: 'drop-shadow(2px 2px 0px #000)'
              }}>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <h3 className="text-xl font-bold text-white" style={{
                fontFamily: 'VT323, monospace',
                textShadow: '2px 2px 0px #000'
              }}>AI Social Media Hype Generator</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-yellow-100 text-sm mb-2" style={{
                  fontFamily: 'Courier Prime, Monaco, monospace'
                }}>Select Topic:</label>
                <select value={selectedShareTopic} onChange={e => setSelectedShareTopic(e.target.value)} className="w-full bg-black/50 border-2 border-yellow-700/50 rounded px-3 py-2 text-white text-sm focus:border-yellow-400 transition-colors" style={{
                  fontFamily: 'Courier Prime, Monaco, monospace',
                  boxShadow: '2px 2px 0px rgba(0,0,0,0.5)'
                }}>
                  <option value="gameweek">Gameweek Status</option>
                  <option value="deadline">Team Deadline</option>
                  <option value="squad">Squad Building</option>
                  <option value="leaderboard">Leaderboard Competition</option>
                  <option value="fixtures">Premier League Fixtures</option>
                  <option value="players">Player Performances</option>
                  <option value="prize pool">Prize Pool</option>
                  <option value="entries">Total Entries</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <AnimatedButton onClick={generateShareMessage} disabled={isGeneratingMessage} color="yellow" hoverText="Generate!" className="flex-1">
                  {isGeneratingMessage ? '🤖 Generating...' : '🤖 Generate Hype Post'}
                </AnimatedButton>
              </div>

              {generatedShareMessage && <div className="bg-yellow-700/20 border border-yellow-500/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-yellow-400 font-bold text-sm" style={{
                    fontFamily: 'VT323, monospace',
                    textShadow: '2px 2px 0px #000'
                  }}>Generated Post:</h4>
                  <span className="text-yellow-200 text-xs">
                    {generatedShareMessage.length}/280 chars
                  </span>
                </div>
                <div className="bg-black/50 border border-yellow-700/30 rounded p-3 mb-3">
                  <p className="text-white text-sm leading-relaxed" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>
                    {generatedShareMessage}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <AnimatedButton onClick={shareOnX} color="blue" hoverText="Post on X!" className="flex-1">
                    🐦 Share on X
                  </AnimatedButton>
                  <button onClick={() => {
                    navigator.clipboard.writeText(generatedShareMessage);
                    alert('Message copied to clipboard!');
                  }} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors flex items-center space-x-2" style={{
                    border: '2px solid #000',
                    boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                    fontFamily: 'VT323, monospace'
                  }}>
                    📋 Copy
                  </button>
                </div>
              </div>}
            </div>
          </SpotlightCard>

          <SpotlightCard className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-purple-700/30 mt-6" glowColor="purple" size="md" intensity={0.8}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white" style={{
                fontFamily: 'VT323, monospace',
                textShadow: '2px 2px 0px #000'
              }}>Historical Gameweeks ({historicalGames.length})</h3>
              <button onClick={loadHistoricalGames} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors flex items-center space-x-2" style={{
                border: '2px solid #000',
                boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                fontFamily: 'VT323, monospace'
              }}>
                <RotateCcw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {historicalGames.map((game, index) => <div key={game.id} className="p-4 rounded border bg-purple-700/20 border-purple-500/50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-purple-400 font-bold text-lg" style={{
                      fontFamily: 'VT323, monospace',
                      textShadow: '2px 2px 0px #000'
                    }}>
                      Gameweek {game.gameweek}
                    </h4>
                    <p className="text-green-100 text-sm" style={{
                      fontFamily: 'Courier Prime, Monaco, monospace'
                    }}>
                      Prize Pool: {game.prizePool.toFixed(3)} SOL
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm px-3 py-1 rounded font-medium ${game.hasClaimed ? 'bg-green-600/80 text-green-100' : 'bg-red-600/80 text-red-100'}`}>
                      {game.hasClaimed ? 'Prize Claimed' : 'Unclaimed Prize'}
                    </span>
                  </div>
                </div>
                {game.winnerId && <div className="bg-black/30 p-3 rounded border border-purple-700/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-400 font-bold text-sm mb-1" style={{
                        fontFamily: 'VT323, monospace'
                      }}>🏆 WINNER</p>
                      <p className="text-white font-medium text-sm" style={{
                        fontFamily: 'Courier Prime, Monaco, monospace'
                      }}>
                        {game.winnerId.slice(0, 8)}...{game.winnerId.slice(-4)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold text-lg" style={{
                        fontFamily: 'VT323, monospace',
                        textShadow: '1px 1px 0px #000'
                      }}>
                        {game.winnerScore} pts
                      </p>
                      <p className="text-yellow-400 text-sm" style={{
                        fontFamily: 'Courier Prime, Monaco, monospace'
                      }}>
                        Won: {(game.prizePool * 0.95).toFixed(3)} SOL
                      </p>
                    </div>
                  </div>
                  {game.hasClaimed && game.payout && <div className="mt-2 pt-2 border-t border-purple-700/30">
                    <p className="text-green-300 text-xs" style={{
                      fontFamily: 'Courier Prime, Monaco, monospace'
                    }}>
                      Claimed: {(game.payout.amount || 0).toFixed(3)} SOL
                    </p>
                  </div>}
                </div>}
              </div>)}
              {historicalGames.length === 0 && <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-purple-200 text-lg" style={{
                  fontFamily: 'Courier Prime, Monaco, monospace'
                }}>
                  No finished gameweeks yet.
                </p>
                <p className="text-purple-300 text-sm mt-2" style={{
                  fontFamily: 'Courier Prime, Monaco, monospace'
                }}>
                  Historical data will appear here once gameweeks are completed.
                </p>
              </div>}
            </div>
          </SpotlightCard>
        </SpotlightCard>
      </div>}
    </main>
    { }
    <footer className={`${theme === 'dark' ? 'bg-black/40' : 'bg-white/90'} backdrop-blur-sm border-t ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-300/50'} py-6 mt-12`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center">
          <SpotlightCard className={`${theme === 'dark' ? 'bg-black/60' : 'bg-white/80'} backdrop-blur-sm rounded-xl p-4 border ${theme === 'dark' ? 'border-gray-700/30' : 'border-gray-300/50'}`} glowColor="yellow" size="sm" intensity={0.8}>
            <div className="flex items-center space-x-3">
              <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm body-text`} style={{
                textShadow: theme === 'dark' ? '1px 1px 0px #000' : 'none'
              }}>
                Follow us on X:
              </span>
              <a href="https://x.com/fpl_sol" target="_blank" rel="noopener noreferrer" className="bg-yellow-600 hover:bg-yellow-700 text-black p-2 rounded-lg transition-all duration-200 group" style={{
                border: '2px solid #000',
                boxShadow: '3px 3px 0px rgba(0,0,0,0.8)'
              }}>
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor" style={{
                  filter: 'drop-shadow(1px 1px 0px #000)'
                }}>
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </SpotlightCard>
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
            <p className="text-yellow-100 text-sm" style={{
              fontFamily: 'Courier Prime, Monaco, monospace',
              textShadow: '1px 1px 0px #000'
            }}>
              Please wait, this may take a moment...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-400 border-t-transparent"></div>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </div>}
    {showInfoPopup && <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-hidden">
      <SpotlightCard className="bg-black/90 backdrop-blur-md rounded-xl border border-green-700/50 max-w-2xl max-h-[85vh] w-full flex flex-col overflow-hidden" glowColor="blue" size="lg" intensity={1.2}>
        <div className="p-6 md:p-8 overflow-y-auto flex-1" style={{
          maxHeight: 'calc(85vh - 2rem)'
        }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-5xl md:text-6xl font-black text-black bg-white px-8 py-6 rounded-3xl cinematic-text text-center" style={{
              textShadow: '4px 4px 0px rgba(255,215,0,0.4)',
              border: '4px solid #000',
              boxShadow: '8px 8px 0px rgba(0,0,0,0.8)'
            }}>HOW IT WORKS</h2>
            <button onClick={() => setShowInfoPopup(false)} className="text-white hover:text-red-400 transition-colors text-2xl font-bold bg-red-600/80 rounded-full w-8 h-8 flex items-center justify-center" style={{
              border: '2px solid #000',
              boxShadow: '2px 2px 0px rgba(0,0,0,0.8)'
            }}>
              ×
            </button>
          </div>
          <div className="space-y-6 text-white">
            <div className="bg-green-700/20 rounded-lg p-4 border border-green-700/30">
              <h3 className="text-xl font-bold text-yellow-400 mb-2" style={{
                fontFamily: 'VT323, monospace',
                textShadow: '2px 2px 0px #000'
              }}>🏆 Welcome to fpl.sol</h3>
              <p className="text-green-100" style={{
                fontFamily: 'Courier Prime, Monaco, monospace'
              }}>
                The future of fantasy football where your tactical genius meets crypto rewards! Build your dream Premier League squad and compete for SOL prizes.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-white text-lg flex-shrink-0" style={{
                  border: '2px solid #000',
                  boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                  fontFamily: 'VT323, monospace'
                }}>1</div>
                <div>
                  <h4 className="text-lg font-bold text-blue-400" style={{
                    fontFamily: 'VT323, monospace',
                    textShadow: '2px 2px 0px #000'
                  }}>Build Your Squad</h4>
                  <p className="text-green-100 text-sm" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>
                    Select 11 players with £80M budget. Choose 1 goalkeeper, 3-5 defenders, 2-5 midfielders, and 1-3 forwards. Pick a captain for double points!
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-purple-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-white text-lg flex-shrink-0" style={{
                  border: '2px solid #000',
                  boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                  fontFamily: 'VT323, monospace'
                }}>2</div>
                <div>
                  <h4 className="text-lg font-bold text-purple-400" style={{
                    fontFamily: 'VT323, monospace',
                    textShadow: '2px 2px 0px #000'
                  }}>Stake & Enter</h4>
                  <p className="text-green-100 text-sm" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>
                    Pay 0.05 SOL entry fee to join the gameweek. Your payment goes into the prize pool for winners to claim.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-white text-lg flex-shrink-0" style={{
                  border: '2px solid #000',
                  boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                  fontFamily: 'VT323, monospace'
                }}>3</div>
                <div>
                  <h4 className="text-lg font-bold text-green-400" style={{
                    fontFamily: 'VT323, monospace',
                    textShadow: '2px 2px 0px #000'
                  }}>Score Points</h4>
                  <p className="text-green-100 text-sm" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>
                    Earn points based on real Premier League player performances. Goals, assists, clean sheets, and more all count towards your total.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-yellow-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-black text-lg flex-shrink-0" style={{
                  border: '2px solid #000',
                  boxShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                  fontFamily: 'VT323, monospace'
                }}>4</div>
                <div>
                  <h4 className="text-lg font-bold text-yellow-400" style={{
                    fontFamily: 'VT323, monospace',
                    textShadow: '2px 2px 0px #000'
                  }}>Win SOL Rewards</h4>
                  <p className="text-green-100 text-sm" style={{
                    fontFamily: 'Courier Prime, Monaco, monospace'
                  }}>
                    Top performers split 95% of the prize pool. Climb the leaderboard and earn crypto rewards for your fantasy football skills!
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <button onClick={() => setShowInfoPopup(false)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors" style={{
                fontFamily: 'VT323, monospace',
                fontSize: '18px',
                border: '2px solid #000',
                boxShadow: '4px 4px 0px rgba(0,0,0,0.8)',
                textShadow: '1px 1px 0px #000'
              }}>
                Got It! Let's Play
              </button>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </div>}
  </div>;
}
export default App;