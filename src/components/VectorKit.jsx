import React from 'react';

// Premier League club color specifications (Non-copyrightable public color palettes)
export const TEAM_KIT_CONFIG = {
  1: { primary: "#EF0107", secondary: "#FFFFFF", sleeves: "#FFFFFF", text: "#FFFFFF", name: "ARS" }, // Arsenal
  2: { primary: "#670E36", secondary: "#95BFE5", sleeves: "#95BFE5", text: "#FFFFFF", name: "AVL" }, // Aston Villa
  3: { primary: "#DA291C", secondary: "#101010", sleeves: "#DA291C", text: "#FFFFFF", striped: true, name: "BOU" }, // Bournemouth
  4: { primary: "#E30613", secondary: "#FFFFFF", sleeves: "#E30613", text: "#FFFFFF", striped: true, name: "BRE" }, // Brentford
  5: { primary: "#0057B8", secondary: "#FFFFFF", sleeves: "#0057B8", text: "#FFFFFF", striped: true, name: "BHA" }, // Brighton
  6: { primary: "#034694", secondary: "#FFFFFF", sleeves: "#034694", text: "#FFFFFF", name: "CHE" }, // Chelsea
  7: { primary: "#1B458F", secondary: "#C4122E", sleeves: "#1B458F", text: "#FFFFFF", striped: true, name: "CRY" }, // Crystal Palace
  8: { primary: "#003399", secondary: "#FFFFFF", sleeves: "#003399", text: "#FFFFFF", name: "EVE" }, // Everton
  9: { primary: "#FFFFFF", secondary: "#101010", sleeves: "#101010", text: "#101010", name: "FUL" }, // Fulham
  10: { primary: "#004488", secondary: "#FFFFFF", sleeves: "#004488", text: "#FFFFFF", name: "IPS" }, // Ipswich
  11: { primary: "#003090", secondary: "#FDBE11", sleeves: "#003090", text: "#FFFFFF", name: "LEI" }, // Leicester
  12: { primary: "#C8102E", secondary: "#00B2A9", sleeves: "#C8102E", text: "#FFFFFF", name: "LIV" }, // Liverpool
  13: { primary: "#6CABDD", secondary: "#FFFFFF", sleeves: "#FFFFFF", text: "#FFFFFF", name: "MCI" }, // Man City
  14: { primary: "#DA291C", secondary: "#101010", sleeves: "#DA291C", text: "#FFFFFF", name: "MUN" }, // Man United
  15: { primary: "#1A1A1A", secondary: "#FFFFFF", sleeves: "#1A1A1A", text: "#FFFFFF", striped: true, name: "NEW" }, // Newcastle
  16: { primary: "#DD0000", secondary: "#FFFFFF", sleeves: "#DD0000", text: "#FFFFFF", name: "NFO" }, // Nott'm Forest
  17: { primary: "#D71920", secondary: "#FFFFFF", sleeves: "#D71920", text: "#FFFFFF", striped: true, name: "SOU" }, // Southampton
  18: { primary: "#FFFFFF", secondary: "#132257", sleeves: "#FFFFFF", text: "#132257", name: "TOT" }, // Tottenham
  19: { primary: "#7A263A", secondary: "#1BB1E7", sleeves: "#1BB1E7", text: "#FFFFFF", name: "WHU" }, // West Ham
  20: { primary: "#FDB913", secondary: "#231F20", sleeves: "#FDB913", text: "#231F20", name: "WOL" }, // Wolves
};

// Default Goalkeeper Kit (Bright Emerald or Fluorescent Yellow)
const GK_KIT_CONFIG = {
  primary: "#10B981", // Emerald Neon
  secondary: "#047857",
  sleeves: "#059669",
  text: "#FFFFFF",
  striped: false,
};

export const VectorKit = ({ 
  player, 
  teamId, 
  className = "w-12 h-14",
  showName = true,
  showNumber = true
}) => {
  const actualTeamId = player?.team || teamId || 1;
  const isGK = player?.element_type === 1;
  const kit = isGK ? GK_KIT_CONFIG : (TEAM_KIT_CONFIG[actualTeamId] || TEAM_KIT_CONFIG[1]);

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
          <linearGradient id={`fold-${actualTeamId}-${isGK}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.15" />
            <stop offset="25%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#000000" stopOpacity="0.0" />
            <stop offset="75%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.2" />
          </linearGradient>

          {/* Pattern for striped kits */}
          {kit.striped && (
            <pattern id={`stripes-${actualTeamId}`} width="10" height="10" patternUnits="userSpaceOnUse">
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
          fill={kit.striped ? `url(#stripes-${actualTeamId})` : kit.primary} 
          stroke="#000000" 
          strokeWidth="1.2" 
          strokeLinejoin="round"
        />

        {/* Fold Overlay for realism */}
        <path 
          d="M 28 16 L 52 16 L 56 36 L 56 82 L 24 82 L 24 36 Z" 
          fill={`url(#fold-${actualTeamId}-${isGK})`} 
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
