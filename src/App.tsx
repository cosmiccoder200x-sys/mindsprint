/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { PlayerProfile, GameMode, ThemeConfig } from './types';
import { getTheme } from './utils/themes';
import { checkAchievements } from './utils/achievements';
import { ParticleBackground } from './components/ParticleBackground';
import { MenuScreen } from './components/MenuScreen';
import { GameScreen } from './components/GameScreen';
import { Dashboard } from './components/Dashboard';
import { audio } from './utils/audio';
import { Sparkles, X } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'mindsprint_player_profile';

const DEFAULT_PROFILE: PlayerProfile = {
  username: 'Apex Sprinter',
  level: 1,
  xp: 0,
  coins: 50, // Starting tokens
  activeTheme: 'cyber',
  activeAvatar: 'avatar_brain',
  unlockedThemes: ['cyber'],
  unlockedAvatars: ['avatar_brain'],
  achievements: {},
  stats: {
    totalPlayTime: 0,
    totalPuzzlesSolved: 0,
    fastestSolve: {},
    averageSolveTime: {},
    accuracy: {},
    bestStreak: 0,
    currentStreak: 0,
    hardestPuzzleSolved: 1,
    hintsUsed: 0,
    reactionSpeed: 0,
    history: [],
  },
  dailyStreak: {
    count: 1,
    lastPlayDate: new Date().toISOString().split('T')[0],
  },
};

export default function App() {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [activeScreen, setActiveScreen] = useState<'menu' | 'game' | 'dashboard'>('menu');
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  // 1. Load Player profile on startup
  useEffect(() => {
    let saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    let playerProfile: PlayerProfile;

    if (saved) {
      try {
        playerProfile = JSON.parse(saved);
        // Ensure accuracy & history are initialized
        if (!playerProfile.stats.accuracy) playerProfile.stats.accuracy = {};
        if (!playerProfile.stats.history) playerProfile.stats.history = [];
        if (!playerProfile.unlockedThemes) playerProfile.unlockedThemes = ['cyber'];
        if (!playerProfile.unlockedAvatars) playerProfile.unlockedAvatars = ['avatar_brain'];
      } catch (e) {
        playerProfile = { ...DEFAULT_PROFILE };
      }
    } else {
      playerProfile = { ...DEFAULT_PROFILE };
    }

    // 2. Daily Streak Verification logic
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const lastDate = playerProfile.dailyStreak?.lastPlayDate;

    if (lastDate) {
      if (lastDate === yesterday) {
        // Play consecutive day, update streak count
        playerProfile.dailyStreak.count += 1;
        playerProfile.dailyStreak.lastPlayDate = today;
      } else if (lastDate !== today) {
        // Gap in playing days, reset streak to 1
        playerProfile.dailyStreak.count = 1;
        playerProfile.dailyStreak.lastPlayDate = today;
      }
    } else {
      playerProfile.dailyStreak = { count: 1, lastPlayDate: today };
    }

    setProfile(playerProfile);
    // Start subtle ambient track immediately
    audio.startAmbient();
  }, []);

  // 3. Save Player profile on updates & check achievements
  const handleUpdateProfile = (updated: PlayerProfile) => {
    // Audit achievements triggers
    const newlyUnlocked = checkAchievements(updated);
    if (newlyUnlocked.length > 0) {
      // Award achievements and XP
      const nowStr = new Date().toISOString();
      newlyUnlocked.forEach((id) => {
        updated.achievements[id] = nowStr;
        updated.xp += 75; // award bonus xp
        updated.coins += 15; // award bonus coins
      });

      // Track newly unlocked achievements for showing popup chimes
      setNewAchievements((prev) => [...prev, ...newlyUnlocked]);
      audio.playAchievement();
    }

    setProfile(updated);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleStartGame = (mode: GameMode) => {
    setSelectedMode(mode);
    setActiveScreen('game');
  };

  const activeTheme: ThemeConfig = profile ? getTheme(profile.activeTheme) : getTheme('cyber');

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-500 font-mono text-sm">
        INITIALIZING NEURAL CORES...
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen ${activeTheme.background} overflow-x-hidden flex flex-col justify-between transition-colors duration-1000 text-white font-sans`}>
      {/* Subtle Background Atmospheric Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-15"
          style={{ backgroundColor: activeTheme.glowColor }}
        ></div>
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-[100px]"></div>
        {/* Grid Overlay Effect */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', 
            backgroundSize: '30px 30px' 
          }}
        ></div>
      </div>

      {/* Dynamic interactive background synaptic particle canvas */}
      <ParticleBackground glowColor={activeTheme.glowColor} />

      {/* Floating Sparkle / Achievements award alert overlay */}
      {newAchievements.length > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-black/90 border border-white/10 p-4 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-md animate-bounce">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-amber-500 border border-white/10">
            <Sparkles className="w-5 h-5 animate-spin" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xs text-amber-400">ACHIEVEMENT UNLOCKED!</span>
            <span className="text-[10px] text-zinc-400 font-mono uppercase mt-0.5">Bonus XP & Tokens Synced</span>
          </div>
          <button 
            onClick={() => setNewAchievements([])} 
            className="p-1 text-zinc-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <header className="w-full max-w-5xl mx-auto p-6 md:px-8 md:py-8 flex justify-between items-center z-10">
        <div className="flex flex-col gap-0.5 select-none">
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: activeTheme.glowColor }}>Adaptive Intelligence Sandbox</div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tighter text-white">MIND<span className="font-bold" style={{ color: activeTheme.glowColor }}>SPRINT</span></h1>
        </div>
        
        {/* Quick ambient mute button */}
        <button
          onClick={() => { audio.toggleAmbient(); setProfile({ ...profile }); }}
          className={`px-4 py-2 rounded-full border text-xs font-bold uppercase tracking-widest transition duration-300 flex items-center gap-1.5 ${
            audio.getIsAmbientPlaying() 
              ? 'bg-white/10 border-white/25 text-white shadow-sm' 
              : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <span>🎵 {audio.getIsAmbientPlaying() ? 'Ambient ON' : 'Ambient Muted'}</span>
        </button>
      </header>

      {/* Main viewport area */}
      <main className="flex-1 flex items-center justify-center w-full z-10 py-6">
        {activeScreen === 'menu' && (
          <MenuScreen
            profile={profile}
            onStartGame={handleStartGame}
            onOpenDashboard={() => setActiveScreen('dashboard')}
            onUpdateProfile={handleUpdateProfile}
            glowColor={activeTheme.glowColor}
          />
        )}

        {activeScreen === 'game' && selectedMode && (
          <GameScreen
            mode={selectedMode}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onExit={() => setActiveScreen('menu')}
            glowColor={activeTheme.glowColor}
          />
        )}

        {activeScreen === 'dashboard' && (
          <Dashboard
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBack={() => setActiveScreen('menu')}
          />
        )}
      </main>

      {/* Humble Footer */}
      <footer className="w-full text-center py-4 text-[10px] text-zinc-600 font-mono uppercase tracking-widest z-10 select-none">
        MindSprint Lab v1.1.0 • Offline Sync Sandbox Mode
      </footer>
    </div>
  );
}
