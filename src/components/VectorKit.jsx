import React from 'react';

// Comprehensive Premier League club specifications (Non-copyrightable public color palettes)
export const TEAMS_BY_SHORT = {
  ARS: { primary: "#EF0107", secondary: "#FFFFFF", sleeves: "#FFFFFF", text: "#FFFFFF", name: "ARS", fullName: "Arsenal" },
  AVL: { primary: "#670E36", secondary: "#95BFE5", sleeves: "#95BFE5", text: "#FFFFFF", name: "AVL", fullName: "Aston Villa" },
  BOU: { primary: "#DA291C", secondary: "#101010", sleeves: "#101010", text: "#FFFFFF", striped: true, name: "BOU", fullName: "Bournemouth" },
  BRE: { primary: "#E30613", secondary: "#FFFFFF", sleeves: "#E30613", text: "#FFFFFF", striped: true, name: "BRE", fullName: "Brentford" },
  BHA: { primary: "#0057B8", secondary: "#FFFFFF", sleeves: "#0057B8", text: "#FFFFFF", striped: true, name: "BHA", fullName: "Brighton" },
  CHE: { primary: "#034694", secondary: "#FFFFFF", sleeves: "#034694", text: "#FFFFFF", name: "CHE", fullName: "Chelsea" },
  COV: { primary: "#41B6E6", secondary: "#0C2340", sleeves: "#41B6E6", text: "#0C2340", name: "COV", fullName: "Coventry City" },
  CRY: { primary: "#1B458F", secondary: "#C4122E", sleeves: "#1B458F", text: "#FFFFFF", striped: true, name: "CRY", fullName: "Crystal Palace" },
  EVE: { primary: "#003399", secondary: "#FFFFFF", sleeves: "#003399", text: "#FFFFFF", name: "EVE", fullName: "Everton" },
  FUL: { primary: "#FFFFFF", secondary: "#111111", sleeves: "#111111", text: "#111111", name: "FUL", fullName: "Fulham" },
  HUL: { primary: "#FFA500", secondary: "#111111", sleeves: "#111111", text: "#FFFFFF", striped: true, name: "HUL", fullName: "Hull City" },
  IPS: { primary: "#004488", secondary: "#FFFFFF", sleeves: "#004488", text: "#FFFFFF", name: "IPS", fullName: "Ipswich Town" },
  LEE: { primary: "#FFFFFF", secondary: "#1D428A", sleeves: "#FFFFFF", text: "#1D428A", name: "LEE", fullName: "Leeds" },
  LIV: { primary: "#C8102E", secondary: "#FFFFFF", sleeves: "#C8102E", text: "#FFFFFF", name: "LIV", fullName: "Liverpool" },
  MCI: { primary: "#6CABDD", secondary: "#FFFFFF", sleeves: "#6CABDD", text: "#1C2C5B", name: "MCI", fullName: "Man City" },
  MUN: { primary: "#DA291C", secondary: "#101010", sleeves: "#DA291C", text: "#FFFFFF", name: "MUN", fullName: "Man Utd" },
  NEW: { primary: "#1A1A1A", secondary: "#FFFFFF", sleeves: "#1A1A1A", text: "#FFFFFF", striped: true, name: "NEW", fullName: "Newcastle" },
  NFO: { primary: "#DD0000", secondary: "#FFFFFF", sleeves: "#DD0000", text: "#FFFFFF", name: "NFO", fullName: "Nott'm Forest" },
  TOT: { primary: "#FFFFFF", secondary: "#132257", sleeves: "#FFFFFF", text: "#132257", name: "TOT", fullName: "Spurs" },
  SUN: { primary: "#EB172B", secondary: "#FFFFFF", sleeves: "#EB172B", text: "#111111", striped: true, name: "SUN", fullName: "Sunderland" },
  SOU: { primary: "#D71920", secondary: "#FFFFFF", sleeves: "#D71920", text: "#FFFFFF", striped: true, name: "SOU", fullName: "Southampton" },
  WHU: { primary: "#7A263A", secondary: "#1BB1E7", sleeves: "#1BB1E7", text: "#FFFFFF", name: "WHU", fullName: "West Ham" },
  WOL: { primary: "#FDB913", secondary: "#231F20", sleeves: "#FDB913", text: "#231F20", name: "WOL", fullName: "Wolves" },
  LEI: { primary: "#003090", secondary: "#FDBE11", sleeves: "#003090", text: "#FFFFFF", name: "LEI", fullName: "Leicester" },
};

// Official Premier League Team Codes mapping
export const TEAMS_BY_CODE = {
  3: TEAMS_BY_SHORT.ARS,
  7: TEAMS_BY_SHORT.AVL,
  91: TEAMS_BY_SHORT.BOU,
  94: TEAMS_BY_SHORT.BRE,
  36: TEAMS_BY_SHORT.BHA,
  8: TEAMS_BY_SHORT.CHE,
  9: TEAMS_BY_SHORT.COV,
  31: TEAMS_BY_SHORT.CRY,
  11: TEAMS_BY_SHORT.EVE,
  54: TEAMS_BY_SHORT.FUL,
  88: TEAMS_BY_SHORT.HUL,
  40: TEAMS_BY_SHORT.IPS,
  2: TEAMS_BY_SHORT.LEE,
  14: TEAMS_BY_SHORT.LIV,
  43: TEAMS_BY_SHORT.MCI,
  1: TEAMS_BY_SHORT.MUN,
  4: TEAMS_BY_SHORT.NEW,
  17: TEAMS_BY_SHORT.NFO,
  6: TEAMS_BY_SHORT.TOT,
  56: TEAMS_BY_SHORT.SUN,
  20: TEAMS_BY_SHORT.SOU,
  21: TEAMS_BY_SHORT.WHU,
  39: TEAMS_BY_SHORT.WOL,
  13: TEAMS_BY_SHORT.LEI,
};

// Current season index mapping (1..20 from FPL API bootstrap-static)
export const TEAMS_BY_ID = {
  1: TEAMS_BY_SHORT.ARS,
  2: TEAMS_BY_SHORT.AVL,
  3: TEAMS_BY_SHORT.BOU,
  4: TEAMS_BY_SHORT.BRE,
  5: TEAMS_BY_SHORT.BHA,
  6: TEAMS_BY_SHORT.CHE,
  7: TEAMS_BY_SHORT.COV,
  8: TEAMS_BY_SHORT.CRY,
  9: TEAMS_BY_SHORT.EVE,
  10: TEAMS_BY_SHORT.FUL,
  11: TEAMS_BY_SHORT.HUL,
  12: TEAMS_BY_SHORT.IPS,
  13: TEAMS_BY_SHORT.LEE,
  14: TEAMS_BY_SHORT.LIV,
  15: TEAMS_BY_SHORT.MCI,
  16: TEAMS_BY_SHORT.MUN,
  17: TEAMS_BY_SHORT.NEW,
  18: TEAMS_BY_SHORT.NFO,
  19: TEAMS_BY_SHORT.TOT,
  20: TEAMS_BY_SHORT.SUN,
};

export const DEFAULT_TEAM_CONFIG = {
  primary: "#334155",
  secondary: "#94A3B8",
  sleeves: "#475569",
  text: "#FFFFFF",
  name: "FPL",
  fullName: "Premier League"
};

// Default Goalkeeper Kit (Bright Emerald Neon)
export const GK_KIT_CONFIG = {
  primary: "#10B981",
  secondary: "#047857",
  sleeves: "#059669",
  text: "#FFFFFF",
  striped: false,
  name: "GK",
  fullName: "Goalkeeper"
};

const findByName = (name) => {
  if (!name || typeof name !== 'string') return null;
  const norm = name.toLowerCase().replace(/[^a-z]/g, '');
  for (const key of Object.keys(TEAMS_BY_SHORT)) {
    const cfg = TEAMS_BY_SHORT[key];
    const cfgNorm = cfg.fullName.toLowerCase().replace(/[^a-z]/g, '');
    if (norm.includes(cfgNorm) || cfgNorm.includes(norm)) {
      return cfg;
    }
  }
  return null;
};

// Infallible team lookup helper
export const getTeamKitConfig = ({ teamId, teamCode, shortName, teamName, player } = {}) => {
  // 1. If player object is provided
  if (player) {
    if (player.team_code && TEAMS_BY_CODE[player.team_code]) {
      return TEAMS_BY_CODE[player.team_code];
    }
    if (player.team && TEAMS_BY_ID[player.team]) {
      return TEAMS_BY_ID[player.team];
    }
    if (player.team_name) {
      const match = findByName(player.team_name);
      if (match) return match;
    }
  }

  // 2. Lookup by shortName (e.g., 'MCI', 'LIV', 'ARS')
  if (shortName && typeof shortName === 'string') {
    const clean = shortName.trim().toUpperCase();
    if (TEAMS_BY_SHORT[clean]) {
      return TEAMS_BY_SHORT[clean];
    }
  }

  // 3. Lookup by official teamCode
  if (teamCode && TEAMS_BY_CODE[teamCode]) {
    return TEAMS_BY_CODE[teamCode];
  }

  // 4. Lookup by teamId (1..20 index)
  if (teamId && TEAMS_BY_ID[teamId]) {
    return TEAMS_BY_ID[teamId];
  }

  // 5. Lookup by full teamName
  if (teamName && typeof teamName === 'string') {
    const match = findByName(teamName);
    if (match) return match;
  }

  // 6. Direct check if teamId itself was passed as a shortName string
  if (typeof teamId === 'string' && TEAMS_BY_SHORT[teamId.toUpperCase()]) {
    return TEAMS_BY_SHORT[teamId.toUpperCase()];
  }

  return DEFAULT_TEAM_CONFIG;
};

// Backwards compatibility export
export const TEAM_KIT_CONFIG = { ...TEAMS_BY_ID, ...TEAMS_BY_SHORT };

export const VectorKit = ({ 
  player, 
  teamId, 
  teamCode,
  shortName,
  teamName,
  className = "w-12 h-14",
  showName = true,
  showNumber = true
}) => {
  const isGK = player?.element_type === 1;
  const kit = isGK ? GK_KIT_CONFIG : getTeamKitConfig({ player, teamId, teamCode, shortName, teamName });

  const kitKey = isGK ? 'GK' : (kit.name || 'PL');
  const number = player?.squad_number || ((player?.id ? (player.id % 25) + 1 : 10));
  const rawName = player?.web_name || player?.second_name || kit.name || "";
  const displayName = rawName.length > 9 ? rawName.slice(0, 8) + '.' : rawName;

  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg 
        viewBox="0 0 80 90" 
        className="w-full h-full drop-shadow-md overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle 3D Fold Linear Gradient */}
          <linearGradient id={`fold-${kitKey}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.15" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.0" />
            <stop offset="75%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
          </linearGradient>

          {/* Pattern for striped kits */}
          {kit.striped && (
            <pattern id={`stripes-${kitKey}`} width="10" height="10" patternUnits="userSpaceOnUse">
              <rect width="5" height="10" fill={kit.primary} />
              <rect x="5" width="5" height="10" fill={kit.secondary} />
            </pattern>
          )}
        </defs>

        {/* Left Sleeve */}
        <path 
          d="M 28 16 L 8 32 L 18 46 L 28 36 Z" 
          fill={kit.sleeves || kit.primary} 
          stroke="#000000" 
          strokeWidth="1.2" 
          strokeLinejoin="round"
          opacity="0.95"
        />
        {/* Left Sleeve Cuff */}
        <path 
          d="M 8 32 L 18 46" 
          stroke={kit.secondary} 
          strokeWidth="2.5" 
          strokeLinecap="round"
        />

        {/* Right Sleeve */}
        <path 
          d="M 52 16 L 72 32 L 62 46 L 52 36 Z" 
          fill={kit.sleeves || kit.primary} 
          stroke="#000000" 
          strokeWidth="1.2" 
          strokeLinejoin="round"
          opacity="0.95"
        />
        {/* Right Sleeve Cuff */}
        <path 
          d="M 72 32 L 62 46" 
          stroke={kit.secondary} 
          strokeWidth="2.5" 
          strokeLinecap="round"
        />

        {/* Jersey Main Body */}
        <path 
          d="M 28 16 L 52 16 L 56 36 L 56 82 L 24 82 L 24 36 Z" 
          fill={kit.striped ? `url(#stripes-${kitKey})` : kit.primary} 
          stroke="#000000" 
          strokeWidth="1.2" 
          strokeLinejoin="round"
        />

        {/* Fold Overlay for realism */}
        <path 
          d="M 28 16 L 52 16 L 56 36 L 56 82 L 24 82 L 24 36 Z" 
          fill={`url(#fold-${kitKey})`} 
        />

        {/* Collar */}
        <path 
          d="M 33 16 C 33 24 47 24 47 16 Z" 
          fill={kit.secondary} 
          stroke="#000000" 
          strokeWidth="1.2"
        />

        {/* Player Shirt Name (Back of Jersey) */}
        {showName && (
          <text 
            x="40" 
            y="33" 
            textAnchor="middle" 
            fill={kit.text} 
            fontSize="6.5" 
            fontWeight="800" 
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="0.4"
            className="select-none"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
          >
            {displayName.toUpperCase()}
          </text>
        )}

        {/* Player Squad Number */}
        {showNumber && (
          <text 
            x="40" 
            y="60" 
            textAnchor="middle" 
            fill={kit.text} 
            fontSize="21" 
            fontWeight="900" 
            fontFamily="JetBrains Mono, monospace"
            className="select-none"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}
          >
            {number}
          </text>
        )}
      </svg>
    </div>
  );
};

export default VectorKit;
