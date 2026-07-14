/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameMode, PlayerProfile, GameRank } from '../types';
import { audio } from '../utils/audio';
import { 
  Play, Award, Settings, Flame, Trophy, Volume2, VolumeX, Eye, 
  Sparkles, Zap, Shield, Key, Compass, Cpu, HelpCircle, Keyboard, RefreshCw 
} from 'lucide-react';

interface MenuScreenProps {
  profile: PlayerProfile;
  onStartGame: (mode: GameMode) => void;
  onOpenDashboard: () => void;
  onUpdateProfile: (updated: PlayerProfile) => void;
  glowColor: string;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  profile,
  onStartGame,
  onOpenDashboard,
  onUpdateProfile,
  glowColor,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [colorblindMode, setColorblindMode] = useState(false);

  // Compute Game Rank Name based on Level
  const getRank = (level: number): GameRank => {
    if (level <= 5) return 'Beginner';
    if (level <= 15) return 'Thinker';
    if (level <= 30) return 'Strategist';
    if (level <= 60) return 'Mastermind';
    if (level <= 100) return 'Genius';
    if (level <= 200) return 'Legend';
    return 'Mythic Mind';
  };

  const currentRank = getRank(profile.level);

  const toggleMute = () => {
    const nextMuted = !audio.getMuted();
    audio.setMute(nextMuted);
    onUpdateProfile({ ...profile }); // force re-render
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    audio.setVolume(val);
    onUpdateProfile({ ...profile });
  };

  const modeDescriptions: Record<GameMode, { title: string; desc: string; icon: React.ReactNode; color: string }> = {
    QUICK_CHALLENGE: {
      title: 'Quick Sprint',
      desc: 'A sequence of 5 random puzzles of escalating difficulty.',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/20 hover:border-amber-500/50 bg-amber-950/5',
    },
    ENDLESS: {
      title: 'Endless Flow',
      desc: 'Climb infinitely. Difficulty scales dynamically based on speed.',
      icon: <Play className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/20 hover:border-cyan-500/50 bg-cyan-950/5',
    },
    DAILY_PUZZLE: {
      title: 'Daily Seed',
      desc: 'Solve today’s unique worldwide puzzle configuration. Compete on speed.',
      icon: <Flame className="w-5 h-5 text-rose-500" />,
      color: 'border-rose-500/20 hover:border-rose-500/50 bg-rose-950/5',
    },
    WEEKLY_CHALLENGE: {
      title: 'Weekly Gauntlet',
      desc: 'Extremely tricky sequence with composite multi-rule puzzles.',
      icon: <Trophy className="w-5 h-5 text-yellow-400" />,
      color: 'border-yellow-500/20 hover:border-yellow-500/50 bg-yellow-950/5',
    },
    SPEED_RUN: {
      title: 'Speed Clear',
      desc: 'Race through 10 standard levels as fast as humanly possible.',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      color: 'border-purple-500/20 hover:border-purple-500/50 bg-purple-950/5',
    },
    ZEN: {
      title: 'Zen Sanctuary',
      desc: 'No timers, no lives, no penalties. Complete with soothing ambient synth chords.',
      icon: <Compass className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/20 hover:border-emerald-500/50 bg-emerald-950/5',
    },
    HARDCORE: {
      title: 'Hardcore Matrix',
      desc: 'Strict timers, exactly 3 lives. Solve under absolute pressure.',
      icon: <Shield className="w-5 h-5 text-red-500" />,
      color: 'border-red-500/20 hover:border-red-500/50 bg-red-950/5',
    },
    BLIND: {
      title: 'Blind Recall',
      desc: 'Puzzle elements completely fade to black after 2 seconds. Memorize fast!',
      icon: <Eye className="w-5 h-5 text-indigo-400" />,
      color: 'border-indigo-500/20 hover:border-indigo-500/50 bg-indigo-950/5',
    },
    MEMORY: {
      title: 'Simon Focus',
      desc: 'Heavy cognitive workout focusing on memorizing matrices and dynamic spatial rotations.',
      icon: <Cpu className="w-5 h-5 text-blue-400" />,
      color: 'border-blue-500/20 hover:border-blue-500/50 bg-blue-950/5',
    },
    IMPOSSIBLE: {
      title: 'Impossible Lab',
      desc: 'Starts at Maximum Difficulty. Hidden rules, multi-layer ciphers, absolute trial.',
      icon: <Settings className="w-5 h-5 text-stone-400 animate-spin" />,
      color: 'border-stone-500/20 hover:border-stone-500/50 bg-stone-950/5',
    },
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto h-full p-6 md:p-8 text-zinc-100 animate-fade-in" id="menu_screen">
      
      {/* Title block */}
      <div className="text-center mb-10 flex flex-col items-center select-none">
        <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] border border-white/10 rounded-full text-[10px] font-bold tracking-[0.25em] text-zinc-400 uppercase mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" style={{ color: glowColor }} />
          <span>Cognitive Performance Suite</span>
        </div>
        <h1 
          className="text-4xl md:text-5xl font-light tracking-tighter text-white uppercase select-none relative"
        >
          MIND<span className="font-bold" style={{ color: glowColor }}>SPRINT</span>
        </h1>
        <p className="text-slate-500 font-mono text-[10px] tracking-[0.2em] uppercase mt-1.5">Adaptive Intelligence Puzzle Synthesis</p>
      </div>

      {/* Profile info preview / Rank ribbon */}
      <div className="w-full max-w-md bg-white/[0.03] border border-white/10 p-5 rounded-2xl backdrop-blur-md flex items-center justify-between mb-10 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">CURRENT RANK</div>
            <div className="font-semibold text-base flex items-center gap-1.5" style={{ color: glowColor }}>
              {currentRank}
              <span className="text-xs text-slate-500 font-normal">(Level {profile.level})</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold text-orange-400 text-xs tracking-wider uppercase">
            <Flame className="w-4 h-4 fill-current animate-pulse" />
            <span>{profile.dailyStreak.count} DAY STREAK</span>
          </div>
        </div>
      </div>

      {/* Main launch triggers */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mb-12">
        <button
          onClick={() => { onStartGame('ENDLESS'); audio.playSuccess(); }}
          className="flex-1 py-4 px-8 rounded-full text-black font-black text-xs tracking-widest uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition duration-300 cursor-pointer"
          style={{ 
            backgroundColor: glowColor,
            boxShadow: `0 0 25px ${glowColor}40`
          }}
        >
          <Play className="w-4 h-4 fill-current" />
          LAUNCH CORE RUN
        </button>
        <button
          onClick={() => { onOpenDashboard(); audio.playClick(800, 'sine'); }}
          className="flex-1 py-4 px-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-bold text-xs tracking-widest uppercase flex items-center justify-center gap-2 active:scale-[0.98] transition duration-300 cursor-pointer"
        >
          <Award className="w-4 h-4" />
          COGNITIVE LABS
        </button>
      </div>

      {/* Game Mode Panels Grid */}
      <div className="w-full">
        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 mb-6">CHALLENGE VARIATIONS</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Object.keys(modeDescriptions) as GameMode[]).map((mode) => {
            const m = modeDescriptions[mode];
            return (
              <button
                key={mode}
                onClick={() => { onStartGame(mode); audio.playClick(900, 'sine'); }}
                className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 text-left flex flex-col justify-between hover:scale-[1.01] hover:bg-white/[0.06] hover:border-white/20 backdrop-blur-sm transition duration-300 min-h-[140px] shadow-sm cursor-pointer"
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <span className="font-semibold text-sm text-white tracking-tight">{m.title}</span>
                  <div className="opacity-80 scale-95">{m.icon}</div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{m.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Settings floating trigger button */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 z-50">
        <button
          onClick={() => { setShowSettings(!showSettings); audio.playTap(); }}
          className="p-3.5 rounded-full bg-neutral-900/90 border border-white/10 text-zinc-400 hover:text-white hover:border-white/20 shadow-2xl backdrop-blur-md transition cursor-pointer"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Settings Panel Modal Overlay */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-sm bg-[#050608] border border-white/15 p-8 rounded-3xl shadow-2xl relative animate-fade-in backdrop-blur-xl">
            <h2 className="text-base font-bold tracking-[0.1em] uppercase text-white mb-6 flex items-center gap-2">
              <Settings className="w-4 h-4" style={{ color: glowColor }} />
              SYSTEM CONFIG
            </h2>

            <div className="space-y-6">
              {/* Audio switches */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase">MASTER AUDIO SFX</span>
                <button
                  onClick={toggleMute}
                  className={`p-2 rounded-xl border transition cursor-pointer ${
                    audio.getMuted() ? 'bg-red-950/20 border-red-900/40 text-red-400' : 'bg-white/5 border-white/10 text-white'
                  }`}
                >
                  {audio.getMuted() ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[10px] text-slate-500 font-mono tracking-wider">
                  <span>VOLUME LEVEL</span>
                  <span>{Math.round(audio.getVolume() * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={audio.getVolume()}
                  onChange={handleVolumeChange}
                  className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-white"
                  style={{ accentColor: glowColor }}
                />
              </div>

              <div className="h-px bg-white/5" />

              {/* Colorblindness config */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold tracking-wider text-zinc-300 uppercase block">COLORBLIND ASSIST</span>
                  <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider">Enables shapes / labels</span>
                </div>
                <button
                  onClick={() => { setColorblindMode(!colorblindMode); audio.playTap(); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] tracking-wider font-bold uppercase transition cursor-pointer ${
                    colorblindMode ? 'text-black font-black' : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white'
                  }`}
                  style={colorblindMode ? { backgroundColor: glowColor } : undefined}
                >
                  {colorblindMode ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

              <div className="h-px bg-white/5" />

              {/* Keyboard bindings */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                  <Keyboard className="w-4 h-4" style={{ color: glowColor }} />
                  KEYBOARD BINDINGS
                </span>
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-500 uppercase tracking-wide">
                  <div className="flex items-center gap-1"><span className="p-0.5 border border-white/5 rounded bg-white/5 px-1">▲▼◀▶</span> Nav path</div>
                  <div className="flex items-center gap-1"><span className="p-0.5 border border-white/5 rounded bg-white/5 px-1">H</span> Hint Clue</div>
                  <div className="flex items-center gap-1"><span className="p-0.5 border border-white/5 rounded bg-white/5 px-1">SPACE</span> Submit</div>
                  <div className="flex items-center gap-1"><span className="p-0.5 border border-white/5 rounded bg-white/5 px-1">ESC</span> Escape</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => { setShowSettings(false); audio.playTap(); }}
              className="w-full mt-8 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs tracking-widest uppercase transition cursor-pointer"
            >
              CLOSE SYSTEM CONFIG
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
