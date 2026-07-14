/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameSessionState, PuzzleState, GameMode, PlayerProfile } from '../types';
import { generatePuzzle, makeSeed } from '../utils/generator';
import { PuzzleRenderer } from './PuzzleRenderer';
import { audio } from '../utils/audio';
import { 
  Zap, HelpCircle, Trophy, RefreshCw, ChevronRight, Eye, 
  EyeOff, Heart, Clock, Award, Star, Share2, CornerDownLeft, AlertTriangle 
} from 'lucide-react';

interface GameScreenProps {
  mode: GameMode;
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onExit: () => void;
  glowColor: string;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  mode,
  profile,
  onUpdateProfile,
  onExit,
  glowColor,
}) => {
  const [session, setSession] = useState<GameSessionState | null>(null);
  const [activeHintIndex, setActiveHintIndex] = useState(-1);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isJuiceActive, setIsJuiceActive] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [glowingMessage, setGlowingMessage] = useState<string | null>(null);

  // Time tracker for stats
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Start session
    initSession();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode]);

  const initSession = (forcedSeed?: string) => {
    // Determine level difficulty based on Player's Profile endless level
    const initialLevel = mode === 'IMPOSSIBLE' 
      ? 100 
      : mode === 'ZEN' 
        ? 1 
        : profile.level;

    const seed = forcedSeed || makeSeed();
    const puzzle = generatePuzzle(initialLevel, undefined, seed);
    
    // Hardcore mode starts with 3 lives and strict 45-second timers
    const initialLives = mode === 'HARDCORE' ? 3 : undefined;
    const timeLimit = (mode === 'HARDCORE' || mode === 'SPEED_RUN') ? 45 : undefined;

    setSession({
      mode,
      levelIndex: 1,
      currentLevel: initialLevel,
      puzzle,
      startTime: Date.now(),
      movesTaken: 0,
      incorrectAttempts: 0,
      hintsUsed: 0,
      livesRemaining: initialLives,
      scoreCumulative: 0,
      isBlindFaded: false,
    });

    setActiveHintIndex(-1);
    setShareCopied(false);
    setRemainingTime(timeLimit || null);

    // Setup timer if required
    if (timerRef.current) clearInterval(timerRef.current);
    if (timeLimit) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev !== null && prev <= 1) {
            handleTimeOut();
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }

    // Set blind mode fade trigger
    if (mode === 'BLIND') {
      setTimeout(() => {
        setSession((prev) => prev ? { ...prev, isBlindFaded: true } : null);
      }, 2500);
    }
  };

  const handleTimeOut = () => {
    audio.playFailure();
    setGlowingMessage('⏳ TIME EXPIRED!');
    setTimeout(() => {
      setGlowingMessage(null);
      handleIncorrectSolve();
    }, 1500);
  };

  // Triggered on any input interaction
  const handleMoveAction = () => {
    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        movesTaken: prev.movesTaken + 1,
      };
    });
  };

  // Called when the active puzzle is successfully solved
  const handleCorrectSolve = (metrics: { moves: number; incorrectAttempts: number; hintsUsed: number }) => {
    if (!session) return;

    // Calculate score
    // Score = Difficulty * Accuracy * Speed * Efficiency
    const solveTime = (Date.now() - session.startTime) / 1000;
    
    const difficultyFactor = session.currentLevel * 50;
    const accuracy = Math.max(0.2, 1 - (metrics.incorrectAttempts * 0.15));
    const speedFactor = Math.max(0.3, 1 - (solveTime / 120)); // baseline 2 mins
    const efficiency = Math.max(0.4, 1 - (metrics.hintsUsed * 0.2));

    const finalPuzzleScore = Math.round(difficultyFactor * accuracy * speedFactor * efficiency);

    // Dynamic Level Calibration (Adaptive Difficulty)
    let xpAwarded = 25 + finalPuzzleScore;
    let coinsEarned = Math.max(5, Math.floor(finalPuzzleScore / 10));

    // Combo streak multiplier
    const currentCombo = comboCount + 1;
    setComboCount(currentCombo);
    if (currentCombo >= 3) {
      xpAwarded = Math.round(xpAwarded * 1.25);
      coinsEarned = Math.round(coinsEarned * 1.2);
    }

    // Update Player Profile stats
    const updatedHistory = [
      ...(profile.stats.history || []),
      {
        date: new Date().toISOString().split('T')[0],
        level: session.currentLevel,
        score: finalPuzzleScore,
        timeTaken: Math.round(solveTime),
        puzzleType: session.puzzle.type,
      }
    ];

    const currentTypeAccuracy = profile.stats.accuracy[session.puzzle.type] || { attempts: 0, correct: 0 };
    const updatedAccuracy = {
      ...profile.stats.accuracy,
      [session.puzzle.type]: {
        attempts: currentTypeAccuracy.attempts + 1,
        correct: currentTypeAccuracy.correct + 1,
      }
    };

    const currentFastest = profile.stats.fastestSolve[session.puzzle.type] || 9999;
    const updatedFastest = {
      ...profile.stats.fastestSolve,
      [session.puzzle.type]: Math.min(currentFastest, solveTime),
    };

    // Level increase depending on solve speed (Adaptive Difficulty Scaling)
    let nextLevel = profile.level;
    let feedbackMsg = '';
    
    if (solveTime < 10 && metrics.incorrectAttempts === 0) {
      nextLevel += 3; // Dramatic jump
      feedbackMsg = '⚡ COGNITIVE SPRINT! +3 LEVELS';
    } else if (solveTime < 30) {
      nextLevel += 1; // Moderate increase
      feedbackMsg = '🧠 LOGIC STRIKE! +1 LEVEL';
    } else {
      // Very slow solve, keep same level or slightly higher
      nextLevel = Math.max(1, nextLevel);
    }

    // Achievements check triggers inside app
    const updatedProfile: PlayerProfile = {
      ...profile,
      level: mode === 'ENDLESS' ? nextLevel : profile.level,
      xp: profile.xp + xpAwarded,
      coins: profile.coins + coinsEarned,
      stats: {
        ...profile.stats,
        totalPuzzlesSolved: profile.stats.totalPuzzlesSolved + 1,
        totalPlayTime: profile.stats.totalPlayTime + Math.round(solveTime),
        accuracy: updatedAccuracy,
        fastestSolve: updatedFastest,
        history: updatedHistory,
        bestStreak: Math.max(profile.stats.bestStreak, currentCombo),
        currentStreak: currentCombo,
      }
    };

    onUpdateProfile(updatedProfile);

    // Visual juice explosion
    setIsJuiceActive(true);
    setGlowingMessage(`🎉 PERFECT SOLVE! +${xpAwarded} XP`);
    
    setTimeout(() => {
      setIsJuiceActive(false);
      setGlowingMessage(null);
      
      // Advance to next level or complete session
      if (mode === 'QUICK_CHALLENGE' && session.levelIndex >= 5) {
        setGlowingMessage('🏆 CHALLENGE WON!');
        setTimeout(() => {
          setGlowingMessage(null);
          onExit();
        }, 1500);
      } else if (mode === 'SPEED_RUN' && session.levelIndex >= 10) {
        setGlowingMessage('⚡ SPEED GAUNTLET ACED!');
        setTimeout(() => {
          setGlowingMessage(null);
          onExit();
        }, 1500);
      } else {
        // Generate next puzzle
        advanceNextPuzzle();
      }
    }, 1500);
  };

  const handleIncorrectSolve = () => {
    if (!session) return;
    
    audio.playFailure();
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 500);

    // Lose combo streak on errors
    setComboCount(0);

    if (mode === 'HARDCORE') {
      const remainingLives = (session.livesRemaining || 3) - 1;
      if (remainingLives <= 0) {
        setGlowingMessage('💀 MATRIX CRASHED! GAME OVER');
        setTimeout(() => {
          setGlowingMessage(null);
          onExit();
        }, 2000);
        return;
      }

      setSession((prev) => prev ? { ...prev, livesRemaining: remainingLives } : null);
    }

    // Track total error metrics
    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        incorrectAttempts: prev.incorrectAttempts + 1,
      };
    });

    // Reset current puzzle state cleanly
    initSession(session.puzzle.seed);
  };

  const advanceNextPuzzle = () => {
    if (!session) return;
    
    const nextIdx = session.levelIndex + 1;
    const nextLevel = mode === 'ENDLESS' ? profile.level : session.currentLevel;

    // Generate puzzle
    const puzzle = generatePuzzle(nextLevel, undefined, makeSeed());

    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        levelIndex: nextIdx,
        puzzle,
        startTime: Date.now(),
        movesTaken: 0,
        incorrectAttempts: 0,
        hintsUsed: 0,
        isBlindFaded: false,
      };
    });

    setActiveHintIndex(-1);
    setShareCopied(false);
    
    // Timer reset
    if (mode === 'HARDCORE' || mode === 'SPEED_RUN') {
      setRemainingTime(45);
    }

    // Bind Blind cover
    if (mode === 'BLIND') {
      setTimeout(() => {
        setSession((prev) => prev ? { ...prev, isBlindFaded: true } : null);
      }, 2500);
    }
  };

  const handleRevealHint = () => {
    if (!session) return;
    const nextHintIdx = activeHintIndex + 1;
    if (nextHintIdx < session.puzzle.hints.length) {
      setActiveHintIndex(nextHintIdx);
      setSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          hintsUsed: prev.hintsUsed + 1,
        };
      });
      audio.playClick(440, 'triangle');
    }
  };

  const handleRestartPuzzle = () => {
    if (!session) return;
    audio.playClick(800, 'sine');
    initSession(session.puzzle.seed);
  };

  const copyShareSeed = () => {
    if (!session) return;
    const shareUrl = `${window.location.origin}/?seed=${session.puzzle.seed}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true);
      audio.playAchievement();
      setTimeout(() => setShareCopied(false), 2000);
    });
  };

  if (!session) return null;

  return (
    <div 
      className={`flex flex-col w-full max-w-4xl mx-auto h-full p-6 md:p-8 text-zinc-100 select-none ${
        screenShake ? 'animate-shake' : ''
      }`} 
      id="game_screen"
    >
      
      {/* Session header layout */}
      <div className="flex justify-between items-center w-full mb-6 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-white/5 border border-white/10 font-bold text-zinc-300">
            {mode.replace('_', ' ')}
          </span>
          <span className="text-white/10">|</span>
          <span className="text-zinc-400 text-xs font-mono tracking-wider">PUZZLE {session.levelIndex}</span>
        </div>

        {/* HUD: Timer / Lives / Score */}
        <div className="flex items-center gap-4">
          
          {/* Remaining Lives (Hardcore) */}
          {mode === 'HARDCORE' && (
            <div className="flex items-center gap-1.5 bg-red-950/20 border border-red-900/30 px-3.5 py-1.5 rounded-full text-red-400 font-bold text-xs uppercase tracking-wider">
              <Heart className="w-3.5 h-3.5 fill-current animate-pulse text-red-500" />
              <span>LIVES: {session.livesRemaining}</span>
            </div>
          )}

          {/* Core countdown clock */}
          {remainingTime !== null && (
            <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border font-mono text-xs ${
              remainingTime <= 10 ? 'bg-red-950/30 border-red-800/40 text-red-400 animate-pulse' : 'bg-white/5 border-white/10 text-cyan-400'
            }`}
              style={remainingTime > 10 ? { color: glowColor } : undefined}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{remainingTime}s</span>
            </div>
          )}

          {/* Current combo streaks multiplier */}
          {comboCount >= 2 && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/25 px-3.5 py-1 rounded-full text-amber-500 text-xs font-bold tracking-wider uppercase animate-bounce">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{comboCount}X COMBO</span>
            </div>
          )}

          <button
            onClick={onExit}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest active:scale-95 transition duration-300 cursor-pointer"
          >
            QUIT RUN
          </button>
        </div>
      </div>

      {/* Main gaming stage container with Glassmorphism */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 items-start justify-center w-full relative">
        
        {/* Core Puzzle interactive board */}
        <div className="flex-1 bg-white/[0.03] border border-white/10 p-6 rounded-2xl backdrop-blur-md relative min-h-[460px] w-full flex flex-col justify-between items-center overflow-hidden shadow-lg shadow-black/20">
          
          {/* Dynamic full-screen message block overlay */}
          {glowingMessage && (
            <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-4">
              <h2 className="text-2xl md:text-3xl font-light text-white tracking-tighter uppercase select-none">
                {glowingMessage.split(' ')[0]} <span className="font-bold" style={{ color: glowColor }}>{glowingMessage.split(' ').slice(1).join(' ')}</span>
              </h2>
              {isJuiceActive && (
                <div className="flex gap-2 mt-4 text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-bounce">
                  <span>🧠 Neural synapse optimized</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">Tokens earned!</span>
                </div>
              )}
            </div>
          )}

          {/* Blind mode layout block */}
          {session.isBlindFaded && (
            <div className="absolute inset-0 bg-[#050608]/95 z-25 flex flex-col items-center justify-center text-center p-6 animate-fade-in backdrop-blur-sm">
              <EyeOff className="w-12 h-12 text-zinc-600 animate-pulse mb-3" />
              <h2 className="text-xl font-light text-white tracking-tight">BLIND MODE <span className="font-bold text-cyan-400" style={{ color: glowColor }}>FADE</span></h2>
              <p className="text-xs text-slate-500 font-mono mt-2 max-w-xs uppercase tracking-wide leading-relaxed">The puzzle details have been masked! Rely entirely on your recall synapse to click the coordinates.</p>
              <button 
                onClick={() => setSession((prev) => prev ? { ...prev, isBlindFaded: false } : null)}
                className="mt-6 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] tracking-widest uppercase font-bold rounded-full text-zinc-300 cursor-pointer"
              >
                PEEK DETAILS
              </button>
            </div>
          )}

          {/* Active Title & Instructions */}
          <div className="w-full text-center border-b border-white/5 pb-4 mb-4">
            <h2 className="text-xl md:text-2xl font-light text-white tracking-tight">{session.puzzle.title}</h2>
            <p className="text-[10px] text-zinc-500 font-mono uppercase mt-1 tracking-widest leading-relaxed">{session.puzzle.instructions}</p>
          </div>

          {/* Puzzle rendering matrix */}
          <PuzzleRenderer 
            puzzle={session.puzzle}
            onSolve={handleCorrectSolve}
            onMove={handleMoveAction}
            glowColor={glowColor}
          />

          {/* Bottom active toolbars */}
          <div className="flex gap-4 w-full mt-6 pt-4 border-t border-white/5 justify-between items-center text-[10px] tracking-widest text-slate-500 font-mono">
            <button
              onClick={handleRestartPuzzle}
              className="flex items-center gap-1.5 text-slate-500 hover:text-white transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>RESTART PUZZLE</span>
            </button>
            <button
              onClick={copyShareSeed}
              className="flex items-center gap-1.5 text-slate-500 hover:text-white transition active:scale-95 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{shareCopied ? 'SEED LINK COPIED!' : 'SHARE PUZZLE'}</span>
            </button>
          </div>
        </div>

        {/* Right sidebar: Hint system, statistics feedback */}
        <div className="w-full md:w-80 flex flex-col gap-4">
          <div className="bg-white/[0.03] border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col shadow-lg shadow-black/20">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" style={{ color: glowColor }} />
              PROGRESSIVE HINTS
            </span>

            <p className="text-slate-400 text-xs leading-relaxed mb-4">
              Requesting hints decreases the maximum potential solve score multiplier but guarantees step-by-step progress.
            </p>

            <button
              onClick={handleRevealHint}
              disabled={activeHintIndex >= session.puzzle.hints.length - 1}
              className={`w-full py-3 rounded-full font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-[0.98] transition cursor-pointer ${
                activeHintIndex >= session.puzzle.hints.length - 1
                  ? 'bg-black/40 text-zinc-600 border border-white/5 cursor-not-allowed'
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
              style={activeHintIndex < session.puzzle.hints.length - 1 ? { color: glowColor, borderColor: `${glowColor}30` } : undefined}
            >
              REVEAL STEP-BY-STEP HINT
            </button>

            {/* Revealed clues list */}
            {activeHintIndex >= 0 && (
              <div className="flex flex-col gap-3 mt-4">
                {session.puzzle.hints.slice(0, activeHintIndex + 1).map((clue, idx) => (
                  <div key={idx} className="bg-white/[0.02] p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] font-mono font-bold uppercase block mb-1" style={{ color: glowColor }}>HINT CLUE LEVEL {idx + 1}</span>
                    <p className="text-zinc-200 text-xs italic leading-relaxed">{clue}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
