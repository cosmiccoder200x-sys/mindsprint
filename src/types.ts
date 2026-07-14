/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameMode =
  | 'QUICK_CHALLENGE'
  | 'ENDLESS'
  | 'DAILY_PUZZLE'
  | 'WEEKLY_CHALLENGE'
  | 'SPEED_RUN'
  | 'ZEN'
  | 'HARDCORE'
  | 'BLIND'
  | 'MEMORY'
  | 'IMPOSSIBLE';

export type GameRank =
  | 'Beginner'
  | 'Thinker'
  | 'Strategist'
  | 'Mastermind'
  | 'Genius'
  | 'Legend'
  | 'Mythic Mind';

export type PuzzleType =
  | 'PATTERN_HUNTER'
  | 'LASER_REDIRECT'
  | 'MIRROR_REFLEX'
  | 'GRID_BALANCE'
  | 'SYMBOL_CIPHER'
  | 'MEMORY_MATRIX'
  | 'PATH_OPTIMIZER'
  | 'LOGIC_CONTRADICTION'
  | 'CLOCK_SYNCHRONIZER'
  | 'BINARY_MATRIX'
  | 'COLOR_CIRCUIT'
  | 'SHAPE_ROTATOR';

export interface ThemeConfig {
  id: string;
  name: string;
  background: string; // Tailwind bg class
  primary: string; // Tailwind text/border/bg color
  accent: string;
  cardBg: string; // Glassmorphism backdrop-blur, etc.
  textColor: string;
  glowColor: string; // Hex color for canvas glows or shadows
  cssVariables?: Record<string, string>;
  cost: number; // Cost in coins to unlock
}

export interface PlayerStats {
  totalPlayTime: number; // seconds
  totalPuzzlesSolved: number;
  fastestSolve: Record<string, number>; // puzzleType -> seconds
  averageSolveTime: Record<string, number>; // puzzleType -> cumulative list or running average
  accuracy: Record<string, { attempts: number; correct: number }>; // puzzleType -> stats
  bestStreak: number;
  currentStreak: number;
  hardestPuzzleSolved: number; // Level
  hintsUsed: number;
  reactionSpeed: number; // ms average
  history: Array<{
    date: string; // YYYY-MM-DD
    level: number;
    score: number;
    timeTaken: number;
    puzzleType: PuzzleType;
  }>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'progression' | 'speed' | 'accuracy' | 'stamina' | 'special';
  unlockedAt: string | null; // ISO string if unlocked, else null
  threshold: number;
}

export interface PlayerProfile {
  username: string;
  level: number; // Current Endless Level
  xp: number;
  coins: number;
  activeTheme: string;
  activeAvatar: string;
  unlockedThemes: string[];
  unlockedAvatars: string[];
  achievements: Record<string, string | null>; // id -> unlocked timestamp or null
  stats: PlayerStats;
  dailyStreak: {
    count: number;
    lastPlayDate: string; // YYYY-MM-DD
  };
}

export interface LaserMirror {
  row: number;
  col: number;
  direction: '/' | '\\' | '|' | '-' | 'empty'; // mirror diagonals, or plain blocks
}

export interface PuzzleState {
  id: string;
  type: PuzzleType;
  title: string;
  instructions: string;
  level: number;
  difficulty: number; // 1 to 10
  seed: string;
  
  // Generic state containers for puzzle contents
  gridSize?: { rows: number; cols: number };
  grid?: any[][];
  targetValue?: any;
  currentValue?: any;
  elements?: any[];
  hints: string[]; // Progressive hint list [General, Clue, Reveal action]
  solution: any;
  
  // Custom states depending on type
  laserSource?: { row: number; col: number; dir: 'N' | 'E' | 'S' | 'W' };
  laserTarget?: { row: number; col: number };
  mirrors?: LaserMirror[];
  timeLimit?: number; // In seconds
}

export interface GameSessionState {
  mode: GameMode;
  levelIndex: number; // Level sequence in active run (e.g. 1-10 in speed run, or infinite)
  currentLevel: number; // The logic level of the puzzle
  puzzle: PuzzleState;
  startTime: number; // Date.now()
  movesTaken: number;
  incorrectAttempts: number;
  hintsUsed: number;
  livesRemaining?: number; // For Hardcore Mode
  scoreCumulative: number;
  isBlindFaded?: boolean;
}
