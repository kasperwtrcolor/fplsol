import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Sparkles, 
  Target, 
  Shield, 
  Coins, 
  Award, 
  Star, 
  Flame, 
  Zap, 
  Gem, 
  Users, 
  Lock, 
  CheckCircle2, 
  TrendingUp,
  Share2
} from 'lucide-react';

export const ManagerAchievements = ({
  userWallet,
  userStats,
  userEntries = [],
  fplsBalanceRaw,
  userInviteCode,
  claimableWinnings = []
}) => {
  const [filter, setFilter] = useState('all');

  // Compute player metrics
  const metrics = useMemo(() => {
    const isConnected = Boolean(userWallet);
    const entries = userEntries.length;
    const wins = Number(userStats?.wins) || 0;
    const losses = Number(userStats?.losses) || 0;
    const totalEarnings = Number(userStats?.totalEarnings) || 0;
    const fplsBalance = fplsBalanceRaw ? Number(fplsBalanceRaw) / 1e18 : 0;
    
    // Points analysis
    const pointsList = userEntries.map(e => Number(e.points) || 0);
    const maxPoints = pointsList.length > 0 ? Math.max(...pointsList) : 0;
    const totalPoints = pointsList.reduce((acc, p) => acc + p, 0);

    // Budget analysis (teamValue is tenths of million: 790 = £79.0M)
    const hasMaxBudget = userEntries.some(e => Number(e.teamValue) >= 790);
    const hasSavedBudget = userEntries.some(e => Number(e.teamValue) > 0 && Number(e.teamValue) <= 780);

    // Claims & podiums
    const hasClaimed = totalEarnings > 0 || claimableWinnings.some(c => c.claimed);
    const podiumCount = wins + (claimableWinnings.length > 0 ? claimableWinnings.length : 0);
    const hasInviteCode = Boolean(userInviteCode);

    return {
      isConnected,
      entries,
      wins,
      losses,
      totalEarnings,
      fplsBalance,
      maxPoints,
      totalPoints,
      hasMaxBudget,
      hasSavedBudget,
      hasClaimed,
      podiumCount,
      hasInviteCode
    };
  }, [userWallet, userStats, userEntries, fplsBalanceRaw, userInviteCode, claimableWinnings]);

  // Master Achievements Definition
  const achievements = useMemo(() => [
    // --- GLORY & PODIUM ---
    {
      id: 'gw_champ',
      title: 'Gameweek Champion',
      description: 'Finish #1 on the leaderboard and conquer the gameweek prize pool',
      category: 'glory',
      tier: 'Gold',
      icon: Trophy,
      unlocked: metrics.wins >= 1,
      progress: { current: Math.min(metrics.wins, 1), target: 1, label: `${metrics.wins}/1 Wins` }
    },
    {
      id: 'podium_finish',
      title: 'Podium Finisher',
      description: 'Finish in the Top 3 to earn on-chain prize pool rewards',
      category: 'glory',
      tier: 'Silver',
      icon: Medal,
      unlocked: metrics.podiumCount >= 1 || metrics.wins >= 1,
      progress: { 
        current: Math.min(Math.max(metrics.podiumCount, metrics.wins), 1), 
        target: 1, 
        label: `${Math.max(metrics.podiumCount, metrics.wins)}/1 Top 3` 
      }
    },
    {
      id: 'dynasty_mgr',
      title: 'Dynasty Builder',
      description: 'Secure 3 or more all-time gameweek championship titles',
      category: 'glory',
      tier: 'Diamond',
      icon: Crown,
      unlocked: metrics.wins >= 3,
      progress: { current: Math.min(metrics.wins, 3), target: 3, label: `${metrics.wins}/3 Wins` }
    },
    {
      id: 'bounty_hunter',
      title: 'Prize Claimer',
      description: 'Successfully withdraw or claim your podium payout on-chain',
      category: 'glory',
      tier: 'Gold',
      icon: Sparkles,
      unlocked: metrics.hasClaimed || metrics.wins > 0,
      progress: { 
        current: (metrics.hasClaimed || metrics.wins > 0) ? 1 : 0, 
        target: 1, 
        label: (metrics.hasClaimed || metrics.wins > 0) ? 'Claimed' : '0/1 Claims' 
      }
    },

    // --- SQUAD & TACTICAL ---
    {
      id: 'debut_entry',
      title: 'First XI Debut',
      description: 'Submit your inaugural fantasy lineup into a competitive gameweek',
      category: 'tactical',
      tier: 'Bronze',
      icon: Target,
      unlocked: metrics.entries >= 1,
      progress: { current: Math.min(metrics.entries, 1), target: 1, label: `${metrics.entries}/1 Entered` }
    },
    {
      id: 'squad_architect',
      title: 'Galáctico Assembler',
      description: 'Deploy a high-powered squad using £79.0M+ of the £80.0M salary cap',
      category: 'tactical',
      tier: 'Silver',
      icon: Shield,
      unlocked: metrics.hasMaxBudget,
      progress: { current: metrics.hasMaxBudget ? 1 : 0, target: 1, label: metrics.hasMaxBudget ? 'Completed' : 'Pending' }
    },
    {
      id: 'moneyball_master',
      title: 'Moneyball Tactician',
      description: 'Submit an efficient squad saving £2.0M+ under cap (team value ≤ £78.0M)',
      category: 'tactical',
      tier: 'Gold',
      icon: Coins,
      unlocked: metrics.hasSavedBudget,
      progress: { current: metrics.hasSavedBudget ? 1 : 0, target: 1, label: metrics.hasSavedBudget ? 'Completed' : 'Pending' }
    },
    {
      id: 'veteran_tactician',
      title: 'Veteran Tactician',
      description: 'Compete across 5 or more different gameweeks',
      category: 'tactical',
      tier: 'Silver',
      icon: Award,
      unlocked: metrics.entries >= 5,
      progress: { current: Math.min(metrics.entries, 5), target: 5, label: `${metrics.entries}/5 Gameweeks` }
    },
    {
      id: 'club_centurion',
      title: 'Club Centurion',
      description: 'Demonstrate season-long mastery by entering 10 gameweeks',
      category: 'tactical',
      tier: 'Diamond',
      icon: Star,
      unlocked: metrics.entries >= 10,
      progress: { current: Math.min(metrics.entries, 10), target: 10, label: `${metrics.entries}/10 Gameweeks` }
    },

    // --- POINTS & MATCHDAY PERFORMANCE ---
    {
      id: 'half_century',
      title: 'Half-Century Haul',
      description: 'Accumulate 50 or more points in a single gameweek fixture round',
      category: 'points',
      tier: 'Bronze',
      icon: Flame,
      unlocked: metrics.maxPoints >= 50,
      progress: { current: Math.min(metrics.maxPoints, 50), target: 50, label: `${metrics.maxPoints}/50 Pts` }
    },
    {
      id: 'tactical_masterclass',
      title: 'Tactical Masterclass',
      description: 'Produce an elite matchday haul of 75+ points in a single gameweek',
      category: 'points',
      tier: 'Silver',
      icon: Zap,
      unlocked: metrics.maxPoints >= 75,
      progress: { current: Math.min(metrics.maxPoints, 75), target: 75, label: `${metrics.maxPoints}/75 Pts` }
    },
    {
      id: 'century_club',
      title: 'Century Club (100+)',
      description: 'Shatter records with a legendary 100+ points single-gameweek haul',
      category: 'points',
      tier: 'Diamond',
      icon: Crown,
      unlocked: metrics.maxPoints >= 100,
      progress: { current: Math.min(metrics.maxPoints, 100), target: 100, label: `${metrics.maxPoints}/100 Pts` }
    },
    {
      id: 'captain_marvel',
      title: 'Captain Marvel',
      description: 'Armband perfection: Score 60+ points in a gameweek with your chosen captain',
      category: 'points',
      tier: 'Gold',
      icon: Star,
      unlocked: metrics.maxPoints >= 60,
      progress: { current: Math.min(metrics.maxPoints, 60), target: 60, label: `${metrics.maxPoints}/60 Pts` }
    },

    // --- WEB3 & WEALTH ---
    {
      id: 'robinhood_scout',
      title: 'Robinhood Chain Pioneer',
      description: 'Connect wallet and join the decentralized Premier League ecosystem',
      category: 'web3',
      tier: 'Bronze',
      icon: Shield,
      unlocked: metrics.isConnected,
      progress: { current: metrics.isConnected ? 1 : 0, target: 1, label: metrics.isConnected ? 'Connected' : '0/1' }
    },
    {
      id: 'fpls_holder',
      title: 'Diamond Hands Holder',
      description: 'Hold 100,000+ $FPLS in your connected wallet',
      category: 'web3',
      tier: 'Silver',
      icon: Gem,
      unlocked: metrics.fplsBalance >= 100000,
      progress: { 
        current: Math.min(metrics.fplsBalance, 100000), 
        target: 100000, 
        label: `${Math.floor(metrics.fplsBalance).toLocaleString()}/100K $FPLS` 
      }
    },
    {
      id: 'fpls_whale',
      title: 'Whale Investor Tier',
      description: 'Hold 1,000,000+ $FPLS tokens ready for GME stock yield dividends',
      category: 'web3',
      tier: 'Diamond',
      icon: Crown,
      unlocked: metrics.fplsBalance >= 1000000,
      progress: { 
        current: Math.min(metrics.fplsBalance, 1000000), 
        target: 1000000, 
        label: `${Math.floor(metrics.fplsBalance).toLocaleString()}/1M $FPLS` 
      }
    },
    {
      id: 'scout_director',
      title: 'Scout Network Director',
      description: 'Generate an exclusive manager referral code to invite fellow managers',
      category: 'web3',
      tier: 'Bronze',
      icon: Users,
      unlocked: metrics.hasInviteCode,
      progress: { current: metrics.hasInviteCode ? 1 : 0, target: 1, label: metrics.hasInviteCode ? 'Generated' : 'Pending' }
    }
  ], [metrics]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  // Manager Rank / Title
  const managerRank = useMemo(() => {
    if (unlockedCount >= 15) return { title: 'Legendary Mastermind', color: 'text-purple-400', badge: 'Diamond Tier' };
    if (unlockedCount >= 11) return { title: 'Elite Tactician', color: 'text-cyan-400', badge: 'Platinum Tier' };
    if (unlockedCount >= 7) return { title: 'Senior Strategist', color: 'text-amber-400', badge: 'Gold Tier' };
    if (unlockedCount >= 3) return { title: 'Rising Manager', color: 'text-slate-300', badge: 'Silver Tier' };
    return { title: 'Rookie Tactician', color: 'text-emerald-400', badge: 'Bronze Tier' };
  }, [unlockedCount]);

  // Filter achievements
  const filteredAchievements = useMemo(() => {
    if (filter === 'unlocked') return achievements.filter(a => a.unlocked);
    if (filter === 'locked') return achievements.filter(a => !a.unlocked);
    if (filter !== 'all') return achievements.filter(a => a.category === filter);
    return achievements;
  }, [achievements, filter]);

  const getTierStyles = (tier, isUnlocked) => {
    if (!isUnlocked) {
      return {
        badge: 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700',
        card: 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/70 opacity-65',
        iconBg: 'bg-slate-200/60 dark:bg-slate-800/60 text-slate-400',
      };
    }
    switch (tier) {
      case 'Diamond':
        return {
          badge: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40 font-bold',
          card: 'bg-gradient-to-br from-cyan-500/10 via-indigo-500/5 to-purple-500/10 border-cyan-400/50 shadow-lg shadow-cyan-500/10',
          iconBg: 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-cyan-500/30 shadow-md',
        };
      case 'Gold':
        return {
          badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 font-bold',
          card: 'bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-slate-900/40 border-amber-400/40 shadow-md shadow-amber-500/10',
          iconBg: 'bg-gradient-to-tr from-amber-500 to-yellow-500 text-slate-950 font-bold shadow-amber-500/30 shadow-md',
        };
      case 'Silver':
        return {
          badge: 'bg-slate-200 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 border-slate-400/40',
          card: 'bg-slate-50 dark:bg-slate-900/60 border-slate-300 dark:border-slate-700 shadow-sm',
          iconBg: 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-100',
        };
      case 'Bronze':
      default:
        return {
          badge: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
          card: 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300/40 dark:border-emerald-800/40 shadow-sm',
          iconBg: 'bg-emerald-600 text-white shadow-sm',
        };
    }
  };

  const shareText = `I've unlocked ${unlockedCount}/${totalCount} Manager Achievements as a ${managerRank.title} on Fantasy Premier League Stock! ⚽️📈\n\nWins: ${metrics.wins} | Best Haul: ${metrics.maxPoints} pts\n\nCompete on Robinhood Chain: https://fpl.stocks\n#FPL #FPLStock #RobinhoodChain #PremierLeague`;

  return (
    <div className="card-modern p-6 space-y-6">
      {/* Header with Rank & Overall Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              Manager Achievements
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
              {managerRank.badge}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Rank Status: <strong className={`font-semibold ${managerRank.color}`}>{managerRank.title}</strong>
          </p>
        </div>

        {/* Progress Bar & Counter */}
        <div className="w-full sm:w-64 space-y-1.5">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Career Progress</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {unlockedCount} / {totalCount} ({progressPercent}%)
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/60">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-emerald-glow"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: `All (${totalCount})` },
          { id: 'unlocked', label: `Unlocked (${unlockedCount})` },
          { id: 'glory', label: '🏆 Glory' },
          { id: 'tactical', label: '⚽ Tactical' },
          { id: 'points', label: '🔥 Points' },
          { id: 'web3', label: '💎 Web3' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              filter === cat.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredAchievements.map((item) => {
          const Icon = item.icon;
          const styles = getTierStyles(item.tier, item.unlocked);
          const percent = Math.min(100, Math.round((item.progress.current / item.progress.target) * 100));

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${styles.card}`}
            >
              <div>
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${styles.iconBg}`}>
                    {item.unlocked ? <Icon className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${styles.badge}`}>
                      {item.tier}
                    </span>
                    {item.unlocked && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Description */}
                <h4 className={`text-sm font-bold tracking-tight ${item.unlocked ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Progress Footer */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60">
                <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                  <span className="text-slate-500 dark:text-slate-400">
                    {item.unlocked ? 'Status' : 'Progress'}
                  </span>
                  <span className={`font-semibold ${item.unlocked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {item.unlocked ? 'Unlocked ✓' : item.progress.label}
                  </span>
                </div>
                {!item.unlocked && (
                  <div className="h-1.5 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-400 dark:bg-slate-600 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-10 text-slate-400 text-sm">
          No achievements found for this filter.
        </div>
      )}

      {/* Share Achievements to X CTA */}
      <div className="pt-2">
        <a 
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-bold shadow-emerald-glow cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Achievements & Stats on 𝕏</span>
        </a>
      </div>
    </div>
  );
};
