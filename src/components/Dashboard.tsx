/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { PlayerProfile, Achievement } from '../types';
import { generateAchievements } from '../utils/achievements';
import { THEMES, AVATARS } from '../utils/themes';
import { audio } from '../utils/audio';
import { 
  BarChart, Bar, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Award, BarChart3, Palette, ShieldAlert, Cpu, Trophy, Clock, Target, Zap, Flame, ShoppingBag, 
  TrendingUp, Compass, ChevronLeft, Calendar 
} from 'lucide-react';

interface DashboardProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  onUpdateProfile,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'shop' | 'avatar'>('stats');
  const [achFilter, setAchFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  
  const allAchievements = useMemo(() => generateAchievements(), []);
  
  // Calculate general aggregate metrics
  const totalSolved = profile.stats.totalPuzzlesSolved || 0;
  const bestStreak = profile.stats.bestStreak || 0;
  const totalHours = ((profile.stats.totalPlayTime || 0) / 3600).toFixed(1);
  const averageAccuracy = useMemo(() => {
    const keys = Object.keys(profile.stats.accuracy || {});
    if (keys.length === 0) return '100%';
    let totalAttempts = 0;
    let totalCorrect = 0;
    keys.forEach((key) => {
      const entry = profile.stats.accuracy[key];
      totalAttempts += entry.attempts;
      totalCorrect += entry.correct;
    });
    return totalAttempts > 0 ? `${Math.round((totalCorrect / totalAttempts) * 100)}%` : '100%';
  }, [profile.stats.accuracy]);

  // Transform radar statistics data
  const radarData = useMemo(() => {
    const types = [
      'PATTERN_HUNTER', 'LASER_REDIRECT', 'MIRROR_REFLEX', 'GRID_BALANCE', 
      'SYMBOL_CIPHER', 'MEMORY_MATRIX', 'PATH_OPTIMIZER', 'LOGIC_CONTRADICTION', 
      'CLOCK_SYNCHRONIZER', 'BINARY_MATRIX', 'COLOR_CIRCUIT', 'SHAPE_ROTATOR'
    ];
    return types.map((type) => {
      const cleanName = type.replace('_', ' ');
      const accuracyEntry = profile.stats.accuracy[type];
      const accVal = accuracyEntry && accuracyEntry.attempts > 0 
        ? Math.round((accuracyEntry.correct / accuracyEntry.attempts) * 100) 
        : 75; // default benchmark value if unplayed
      return {
        subject: cleanName,
        A: accVal,
        fullMark: 100,
      };
    });
  }, [profile.stats.accuracy]);

  // Timeline performance chart
  const timelineData = useMemo(() => {
    const history = profile.stats.history || [];
    return history.map((item, idx) => ({
      name: `P${idx + 1}`,
      score: item.score,
      time: item.timeTaken,
      level: item.level,
    })).slice(-15); // Show last 15 solves
  }, [profile.stats.history]);

  // Handle unlocks in the virtual shop
  const handleUnlockTheme = (themeId: string, cost: number) => {
    if (profile.coins >= cost) {
      const updated = {
        ...profile,
        coins: profile.coins - cost,
        unlockedThemes: [...profile.unlockedThemes, themeId],
      };
      onUpdateProfile(updated);
      audio.playAchievement();
    } else {
      audio.playFailure();
    }
  };

  const handleUnlockAvatar = (avatarId: string, cost: number) => {
    if (profile.coins >= cost) {
      const updated = {
        ...profile,
        coins: profile.coins - cost,
        unlockedAvatars: [...profile.unlockedAvatars, avatarId],
      };
      onUpdateProfile(updated);
      audio.playAchievement();
    } else {
      audio.playFailure();
    }
  };

  const handleSelectTheme = (themeId: string) => {
    onUpdateProfile({
      ...profile,
      activeTheme: themeId,
    });
    audio.playClick(800, 'sine');
  };

  const handleSelectAvatar = (avatarId: string) => {
    onUpdateProfile({
      ...profile,
      activeAvatar: avatarId,
    });
    audio.playClick(800, 'sine');
  };

  // Filtered achievements lists
  const filteredAchievements = useMemo(() => {
    return allAchievements.filter((ach) => {
      const isUnlocked = !!profile.achievements[ach.id];
      if (achFilter === 'unlocked') return isUnlocked;
      if (achFilter === 'locked') return !isUnlocked;
      return true;
    });
  }, [allAchievements, profile.achievements, achFilter]);

  const unlockedCount = useMemo(() => {
    return Object.values(profile.achievements).filter(Boolean).length;
  }, [profile.achievements]);

  // Find active theme properties for dynamic styling
  const activeThemeProps = useMemo(() => {
    return THEMES.find(t => t.id === profile.activeTheme) || THEMES[0];
  }, [profile.activeTheme]);

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto h-full p-6 md:p-8 text-zinc-100 animate-fade-in font-sans" id="dashboard_screen">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-center justify-between w-full gap-5 mb-8 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition text-zinc-400 hover:text-white cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-4xl select-none">{AVATARS.find(a => a.id === profile.activeAvatar)?.icon || '🧠'}</span>
            <div className="select-none">
              <h1 className="text-2xl font-light tracking-tighter text-white">
                {profile.username.toUpperCase()}
              </h1>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono tracking-wider mt-0.5">
                <span>XP: {profile.xp}</span>
                <span>•</span>
                <span className="font-bold" style={{ color: activeThemeProps.glowColor }}>⚡ TOKENS: {profile.coins}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level stats badge */}
        <div className="flex items-center gap-5 bg-white/[0.03] border border-white/10 px-5 py-4 rounded-2xl backdrop-blur-md shadow-sm select-none">
          <div className="flex flex-col text-center">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">COGNITIVE LEVEL</span>
            <span className="text-xl font-black mt-0.5" style={{ color: activeThemeProps.glowColor }}>{profile.level}</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col text-center">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">SOLVED</span>
            <span className="text-xl font-black text-white mt-0.5">{totalSolved}</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col text-center">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">STREAK</span>
            <span className="text-xl font-black text-orange-400 flex items-center gap-1 justify-center mt-0.5">
              <Flame className="w-4 h-4 fill-current animate-pulse text-orange-500" />
              {profile.dailyStreak.count}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs navigation panel */}
      <div className="flex flex-wrap md:flex-nowrap gap-2 bg-white/5 p-1 rounded-full border border-white/10 mb-8 select-none">
        <button
          onClick={() => { setActiveTab('stats'); audio.playTap(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === 'stats' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'
          }`}
          style={activeTab === 'stats' ? { color: activeThemeProps.glowColor } : undefined}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Statistics
        </button>
        <button
          onClick={() => { setActiveTab('achievements'); audio.playTap(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === 'achievements' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'
          }`}
          style={activeTab === 'achievements' ? { color: activeThemeProps.glowColor } : undefined}
        >
          <Award className="w-3.5 h-3.5" />
          Achievements ({unlockedCount}/{allAchievements.length})
        </button>
        <button
          onClick={() => { setActiveTab('shop'); audio.playTap(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === 'shop' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'
          }`}
          style={activeTab === 'shop' ? { color: activeThemeProps.glowColor } : undefined}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Shop Themes
        </button>
        <button
          onClick={() => { setActiveTab('avatar'); audio.playTap(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === 'avatar' ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'
          }`}
          style={activeTab === 'avatar' ? { color: activeThemeProps.glowColor } : undefined}
        >
          <Compass className="w-3.5 h-3.5" />
          Avatars
        </button>
      </div>

      {/* Tab Panels Contents */}
      <div className="flex-1 overflow-y-auto pr-1">
        
        {/* TAB 1: STATISTICS */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="stats_panel">
            
            {/* Aggregate Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-sm">
                <div className="flex justify-between text-slate-500">
                  <span className="text-[10px] uppercase font-bold tracking-widest">Playtime</span>
                  <Clock className="w-4 h-4 opacity-60" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-light tracking-tight">{totalHours}</span>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest ml-1.5">hours</span>
                </div>
              </div>

              <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-sm">
                <div className="flex justify-between text-slate-500">
                  <span className="text-[10px] uppercase font-bold tracking-widest">Avg Accuracy</span>
                  <Target className="w-4 h-4 opacity-60" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-light tracking-tight text-emerald-400">{averageAccuracy}</span>
                </div>
              </div>

              <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-sm">
                <div className="flex justify-between text-slate-500">
                  <span className="text-[10px] uppercase font-bold tracking-widest">Best Streak</span>
                  <Trophy className="w-4 h-4 text-amber-500/80" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-light tracking-tight text-amber-400">{bestStreak}</span>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest ml-1.5">solves</span>
                </div>
              </div>

              <div className="bg-white/[0.03] p-5 rounded-2xl border border-white/10 flex flex-col justify-between shadow-sm">
                <div className="flex justify-between text-slate-500">
                  <span className="text-[10px] uppercase font-bold tracking-widest">Hints Used</span>
                  <Cpu className="w-4 h-4 opacity-60" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-light tracking-tight">{profile.stats.hintsUsed || 0}</span>
                </div>
              </div>
            </div>

            {/* Radar cognitive index mapping */}
            <div className="bg-white/[0.03] border border-white/10 p-5 rounded-2xl flex flex-col items-center shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 self-start">Cognitive Skill Balance</span>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#2e2e33" />
                    <PolarAngleAxis dataKey="subject" stroke="#71717a" fontSize={8} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#2e2e33" />
                    <Radar name="Cognitive" dataKey="A" stroke={activeThemeProps.glowColor} fill={activeThemeProps.glowColor} fillOpacity={0.15} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Area solve history scale chart */}
            <div className="bg-white/[0.03] border border-white/10 p-5 rounded-2xl col-span-1 md:col-span-2 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Timeline: Solved Difficulty & Scores</span>
              {timelineData.length === 0 ? (
                <div className="text-slate-500 text-center py-10 font-mono text-xs tracking-wider uppercase">NO HISTORIC RUNS FOUND. COMPLETE PUZZLES IN ENDLESS OR SPEEDRUN TO SEED GRAPHS!</div>
              ) : (
                <div className="w-full h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={activeThemeProps.glowColor} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={activeThemeProps.glowColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                      <XAxis dataKey="name" stroke="#52525b" fontSize={10} />
                      <YAxis stroke="#52525b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#050608', borderColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="score" stroke={activeThemeProps.glowColor} fillOpacity={1} fill="url(#colorScore)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: ACHIEVEMENTS LEDGER */}
        {activeTab === 'achievements' && (
          <div className="flex flex-col space-y-5" id="achievements_panel">
            {/* Filter Pills */}
            <div className="flex gap-2">
              {(['all', 'unlocked', 'locked'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => { setAchFilter(filter); audio.playTap(); }}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                    achFilter === filter 
                      ? 'text-black shadow-md' 
                      : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                  }`}
                  style={achFilter === filter ? { backgroundColor: activeThemeProps.glowColor } : undefined}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Achievement Grid scrolling list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto pr-2">
              {filteredAchievements.map((ach) => {
                const isUnlocked = !!profile.achievements[ach.id];
                return (
                  <div 
                    key={ach.id} 
                    className={`p-5 rounded-2xl border backdrop-blur-md flex gap-4 items-center transition-all ${
                      isUnlocked 
                        ? 'bg-white/[0.03] border-white/10 shadow-sm' 
                        : 'bg-white/[0.01] border-white/5 opacity-50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                      isUnlocked ? 'bg-white/5 border-white/10 text-amber-400' : 'bg-transparent border-white/5 text-zinc-600'
                    }`}
                      style={isUnlocked ? { color: activeThemeProps.glowColor } : undefined}
                    >
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className={`font-semibold text-sm ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}>{ach.title}</span>
                      <span className="text-zinc-400 text-xs mt-0.5">{ach.description}</span>
                      {isUnlocked && (
                        <span className="text-[9px] font-mono mt-1 tracking-widest uppercase font-bold" style={{ color: activeThemeProps.glowColor }}>UNLOCKED</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SHOP FOR THEMES */}
        {activeTab === 'shop' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="shop_panel">
            {THEMES.map((theme) => {
              const isUnlocked = profile.unlockedThemes.includes(theme.id);
              const isActive = profile.activeTheme === theme.id;
              const canAfford = profile.coins >= theme.cost;

              return (
                <div 
                  key={theme.id} 
                  className="p-6 rounded-2xl border flex flex-col justify-between backdrop-blur-md transition-all duration-300 shadow-sm bg-white/[0.03]"
                  style={{ 
                    borderColor: isActive ? activeThemeProps.glowColor : 'rgba(255,255,255,0.1)',
                    boxShadow: isActive ? `0 0 20px ${activeThemeProps.glowColor}20` : undefined
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-base text-white tracking-tight">{theme.name}</h3>
                      <p className="text-[9px] text-slate-500 font-mono mt-1 uppercase tracking-widest">Lab Skins Palette</p>
                    </div>
                    <div className="flex gap-1.5 opacity-80">
                      <div className="w-4 h-4 rounded-full border border-white/10" style={{ backgroundColor: theme.glowColor }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    {isUnlocked ? (
                      <button
                        onClick={() => handleSelectTheme(theme.id)}
                        className={`px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                          isActive 
                            ? 'text-black cursor-default font-black' 
                            : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
                        }`}
                        style={isActive ? { backgroundColor: activeThemeProps.glowColor } : undefined}
                      >
                        {isActive ? 'ACTIVE SKIN' : 'SELECT SKIN'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnlockTheme(theme.id, theme.cost)}
                        disabled={!canAfford}
                        className={`px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                          canAfford 
                            ? 'bg-amber-500 hover:bg-amber-600 text-black shadow-lg shadow-amber-500/15' 
                            : 'bg-black/40 text-zinc-600 border border-white/5 cursor-not-allowed'
                        }`}
                      >
                        UNLOCK FOR ⚡ {theme.cost}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 4: PROFILE AVATARS */}
        {activeTab === 'avatar' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="avatars_panel">
            {AVATARS.map((avatar) => {
              const isUnlocked = profile.unlockedAvatars.includes(avatar.id);
              const isActive = profile.activeAvatar === avatar.id;
              const canAfford = profile.coins >= avatar.cost;

              return (
                <div 
                  key={avatar.id} 
                  className="p-5 rounded-2xl border flex flex-col items-center justify-between text-center transition-all duration-300 shadow-sm bg-white/[0.03]"
                  style={{ 
                    borderColor: isActive ? activeThemeProps.glowColor : 'rgba(255,255,255,0.1)'
                  }}
                >
                  <span className="text-4xl my-4 select-none">{avatar.icon}</span>
                  <div className="flex flex-col items-center select-none">
                    <span className="font-semibold text-sm text-white tracking-tight">{avatar.name}</span>
                    <span className="text-slate-500 text-[9px] uppercase tracking-widest font-mono mt-0.5">Profile Avatar</span>
                  </div>

                  <div className="w-full mt-5">
                    {isUnlocked ? (
                      <button
                        onClick={() => handleSelectAvatar(avatar.id)}
                        className={`w-full py-2 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                          isActive 
                            ? 'text-black cursor-default font-black' 
                            : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'
                        }`}
                        style={isActive ? { backgroundColor: activeThemeProps.glowColor } : undefined}
                      >
                        {isActive ? 'SELECTED' : 'SELECT'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnlockAvatar(avatar.id, avatar.cost)}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer ${
                          canAfford 
                            ? 'bg-amber-500 hover:bg-amber-600 text-black' 
                            : 'bg-black/40 text-zinc-600 border border-white/5 cursor-not-allowed'
                        }`}
                      >
                        ⚡ {avatar.cost}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
