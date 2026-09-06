import React from 'react';
import { getTeamKitConfig } from './VectorKit';

export const TeamShield = ({ teamId, teamCode, shortName, teamName, className = "w-7 h-7" }) => {
  const config = getTeamKitConfig({ teamId, teamCode, shortName, teamName });
  const label = shortName || config.name || "PL";
  const shieldId = config.name || label || teamId || "pl";

  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 select-none ${className}`}>
      <svg 
        viewBox="0 0 36 42" 
        className="w-full h-full drop-shadow-sm overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`shield-grad-${shieldId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={config.primary} />
            <stop offset="100%" stopColor={config.sleeves || config.primary} />
          </linearGradient>

          {config.striped && (
            <pattern id={`shield-stripes-${shieldId}`} width="6" height="6" patternUnits="userSpaceOnUse">
              <rect width="3" height="6" fill={config.primary} />
              <rect x="3" width="3" height="6" fill={config.secondary} />
            </pattern>
          )}
        </defs>

        {/* Shield Outer Shape */}
        <path 
          d="M 18 2 L 33 6 L 33 24 C 33 33 18 39 18 39 C 18 39 3 33 3 24 L 3 6 Z" 
          fill={config.striped ? `url(#shield-stripes-${shieldId})` : `url(#shield-grad-${shieldId})`} 
          stroke={config.secondary || "#FFFFFF"} 
          strokeWidth="1.8"
        />

        {/* Shield Accent Top Trim */}
        <path 
          d="M 3 6 L 18 2 L 33 6" 
          stroke={config.secondary || "#FFFFFF"} 
          strokeWidth="2.2"
        />

        {/* Shield Text Pill Background for striped shields so text is ultra-legible */}
        {config.striped && (
          <rect 
            x="5" 
            y="13" 
            width="26" 
            height="15" 
            rx="4" 
            fill="rgba(0,0,0,0.65)" 
          />
        )}

        {/* Club Abbreviation Text */}
        <text 
          x="18" 
          y="23" 
          textAnchor="middle" 
          fill={config.text || "#FFFFFF"} 
          fontSize="9.5" 
          fontWeight="900" 
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.2"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
        >
          {label.toUpperCase()}
        </text>
      </svg>
    </div>
  );
};

export default TeamShield;
