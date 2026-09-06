import React from 'react';
import { TEAM_KIT_CONFIG } from './VectorKit';

export const TeamShield = ({ teamId, shortName, className = "w-7 h-7" }) => {
  const config = TEAM_KIT_CONFIG[teamId] || { primary: "#334155", secondary: "#94A3B8", text: "#FFFFFF", name: shortName || "PL" };
  const label = shortName || config.name || "PL";

  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 select-none ${className}`}>
      <svg 
        viewBox="0 0 36 42" 
        className="w-full h-full drop-shadow-sm overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`shield-grad-${teamId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.primary} />
            <stop offset="100%" stopColor={config.sleeves || config.primary} />
          </linearGradient>
        </defs>

        {/* Shield Outer Shape */}
        <path 
          d="M 18 2 L 33 6 L 33 24 C 33 33 18 39 18 39 C 18 39 3 33 3 24 L 3 6 Z" 
          fill={`url(#shield-grad-${teamId})`} 
          stroke={config.secondary} 
          strokeWidth="1.8"
        />

        {/* Shield Accent Top Trim */}
        <path 
          d="M 3 6 L 18 2 L 33 6" 
          stroke={config.secondary} 
          strokeWidth="2.2"
        />

        {/* Club Abbreviation Text */}
        <text 
          x="18" 
          y="23" 
          textAnchor="middle" 
          fill={config.text} 
          fontSize="9.5" 
          fontWeight="900" 
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.2"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
        >
          {label.toUpperCase()}
        </text>
      </svg>
    </div>
  );
};

export default TeamShield;
