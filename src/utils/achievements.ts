/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Achievement, PlayerStats, PlayerProfile } from '../types';

// Let's programmatically generate 150+ achievements to keep the code incredibly neat yet complete.
export function generateAchievements(): Achievement[] {
  const achievements: Achievement[] = [];

  // 1. PROGRESSION MILESTONES (Levels and Total Solves) - 40 Achievements
  const solveTiers = [1, 2, 3, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000];
  solveTiers.forEach((tier) => {
    achievements.push({
      id: `prog_solves_${tier}`,
      title: `Cognitive Core: ${tier}`,
      description: `Successfully solve ${tier} total puzzles.`,
      iconName: 'Zap',
      category: 'progression',
      unlockedAt: null,
      threshold: tier,
    });
  });

  const levelTiers = [2, 3, 5, 7, 10, 12, 15, 18, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 120, 140, 160, 180, 200, 250, 300, 400, 500];
  levelTiers.forEach((tier) => {
    achievements.push({
      id: `prog_level_${tier}`,
      title: `Ecliptic Height: Level ${tier}`,
      description: `Reach Level ${tier} in the Endless mind sprinters run.`,
      iconName: 'TrendingUp',
      category: 'progression',
      unlockedAt: null,
      threshold: tier,
    });
  });

  // 2. SPEED DEMON (Fast solves) - 30 Achievements
  const speeds = [3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20];
  speeds.forEach((sec) => {
    achievements.push({
      id: `speed_under_${sec}`,
      title: `Synaptic Strike: ${sec}s`,
      description: `Solve any puzzle in under ${sec} seconds.`,
      iconName: 'Flame',
      category: 'speed',
      unlockedAt: null,
      threshold: sec,
    });
  });

  const rapidStreak = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30];
  rapidStreak.forEach((cnt) => {
    achievements.push({
      id: `speed_streak_${cnt}`,
      title: `Blitz Sprint: ${cnt}`,
      description: `Resolve ${cnt} puzzles sequentially with average speed under 10 seconds.`,
      iconName: 'Gauge',
      category: 'speed',
      unlockedAt: null,
      threshold: cnt,
    });
  });

  // 3. ACCURACY & PERFECTS (No-hint solving, streak masteries) - 40 Achievements
  const noHintStreaks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 18, 20, 25, 30, 40, 50, 75, 100];
  noHintStreaks.forEach((strk) => {
    achievements.push({
      id: `acc_nohint_streak_${strk}`,
      title: `Pure Logic: ${strk}`,
      description: `Solve ${strk} puzzles in a row without using a single hint.`,
      iconName: 'Cpu',
      category: 'accuracy',
      unlockedAt: null,
      threshold: strk,
    });
  });

  const perfectSolves = [1, 2, 3, 5, 8, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 150, 200];
  perfectSolves.forEach((cnt) => {
    achievements.push({
      id: `acc_perfect_${cnt}`,
      title: `Flawless deduction: ${cnt}`,
      description: `Achieve ${cnt} perfect solves (zero incorrect actions, zero hints).`,
      iconName: 'Award',
      category: 'accuracy',
      unlockedAt: null,
      threshold: cnt,
    });
  });

  // 4. COGNITIVE STAMINA (Play Time) - 20 Achievements
  const timeTiers = [60, 180, 300, 600, 1200, 1800, 2400, 3600, 5400, 7200, 10800, 14400, 18000, 21600, 28800, 36000, 54000, 72000, 86400]; // in seconds
  timeTiers.forEach((sec) => {
    const minStr = sec >= 3600 ? `${(sec / 3600).toFixed(1)} hrs` : `${sec / 60} mins`;
    achievements.push({
      id: `stamina_time_${sec}`,
      title: `Deep Focus: ${minStr}`,
      description: `Accumulate ${minStr} of puzzle solving time.`,
      iconName: 'Clock',
      category: 'stamina',
      unlockedAt: null,
      threshold: sec,
    });
  });

  // 5. SPECIAL & COLLECTOR MASTERY (Daily streaks, Themes/Avatars, Custom modes) - 25 Achievements
  const streakTiers = [1, 2, 3, 4, 5, 7, 10, 14, 21, 30];
  streakTiers.forEach((days) => {
    achievements.push({
      id: `special_daily_streak_${days}`,
      title: `Mental Ritual: ${days} Days`,
      description: `Maintain a consecutive daily playing streak of ${days} days.`,
      iconName: 'Calendar',
      category: 'special',
      unlockedAt: null,
      threshold: days,
    });
  });

  const themesUnlockedTiers = [2, 3, 4, 5, 6, 7, 8, 10];
  themesUnlockedTiers.forEach((num) => {
    achievements.push({
      id: `special_themes_${num}`,
      title: `Visual Polymath: ${num}`,
      description: `Unlock ${num} visual themes from the memory lab store.`,
      iconName: 'Palette',
      category: 'special',
      unlockedAt: null,
      threshold: num,
    });
  });

  const avatarsUnlockedTiers = [2, 3, 4, 5, 6, 7, 8];
  avatarsUnlockedTiers.forEach((num) => {
    achievements.push({
      id: `special_avatars_${num}`,
      title: `Cognitive Avatars: ${num}`,
      description: `Unlock ${num} profile icons using intelligence tokens.`,
      iconName: 'UserCheck',
      category: 'special',
      unlockedAt: null,
      threshold: num,
    });
  });

  return achievements;
}

// Function to scan player state and see which achievements should unlock now
export function checkAchievements(profile: PlayerProfile): string[] {
  const achievements = generateAchievements();
  const unlockedIds: string[] = [];
  const currentUnlocked = profile.achievements || {};

  const stats: PlayerStats = profile.stats;
  const totalPlayTime = stats.totalPlayTime || 0;
  const totalSolved = stats.totalPuzzlesSolved || 0;
  const bestStreak = stats.bestStreak || 0;
  const dailyStreakCount = profile.dailyStreak?.count || 0;
  const unlockedThemesCount = profile.unlockedThemes?.length || 1;
  const unlockedAvatarsCount = profile.unlockedAvatars?.length || 1;

  // Let's count some custom aggregates from history
  // Calculate average solved times or perfect solves
  const history = stats.history || [];
  const perfectSolvedCount = history.filter(h => h.score > 0 && !stats.hintsUsed).length; // simple approximation

  // Fastest single solve
  let fastestSolveSeconds = 9999;
  Object.values(stats.fastestSolve || {}).forEach((t) => {
    if (t < fastestSolveSeconds) fastestSolveSeconds = t;
  });

  achievements.forEach((ach) => {
    // If already unlocked, skip
    if (currentUnlocked[ach.id]) return;

    let qualifies = false;

    if (ach.id.startsWith('prog_solves_')) {
      qualifies = totalSolved >= ach.threshold;
    } else if (ach.id.startsWith('prog_level_')) {
      qualifies = profile.level >= ach.threshold;
    } else if (ach.id.startsWith('speed_under_')) {
      qualifies = fastestSolveSeconds <= ach.threshold;
    } else if (ach.id.startsWith('speed_streak_')) {
      // average under 10 seconds over X puzzles
      if (history.length >= ach.threshold) {
        const lastX = history.slice(-ach.threshold);
        const avg = lastX.reduce((acc, curr) => acc + curr.timeTaken, 0) / ach.threshold;
        qualifies = avg < 10;
      }
    } else if (ach.id.startsWith('acc_nohint_streak_')) {
      qualifies = bestStreak >= ach.threshold;
    } else if (ach.id.startsWith('acc_perfect_')) {
      qualifies = perfectSolvedCount >= ach.threshold;
    } else if (ach.id.startsWith('stamina_time_')) {
      qualifies = totalPlayTime >= ach.threshold;
    } else if (ach.id.startsWith('special_daily_streak_')) {
      qualifies = dailyStreakCount >= ach.threshold;
    } else if (ach.id.startsWith('special_themes_')) {
      qualifies = unlockedThemesCount >= ach.threshold;
    } else if (ach.id.startsWith('special_avatars_')) {
      qualifies = unlockedAvatarsCount >= ach.threshold;
    }

    if (qualifies) {
      unlockedIds.push(ach.id);
    }
  });

  return unlockedIds;
}
