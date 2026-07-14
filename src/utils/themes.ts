/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ThemeConfig } from '../types';

export const THEMES: ThemeConfig[] = [
  {
    id: 'cyber',
    name: 'Clean Minimalism',
    background: 'bg-[#050608]',
    primary: 'text-cyan-400 border-white/10 bg-white/[0.03] shadow-cyan-500/10 hover:bg-white/10 transition-colors',
    accent: '#22d3ee', // Cyan-400
    cardBg: 'bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md shadow-lg shadow-black/40',
    textColor: 'text-zinc-100',
    glowColor: '#22d3ee', // Cyan-400
    cost: 0, // Unlocked by default
  },
  {
    id: 'space',
    name: 'Deep Space',
    background: 'bg-[#05060a]',
    primary: 'text-blue-400 border-white/10 bg-white/[0.03] shadow-blue-500/10 hover:bg-white/10 transition-colors',
    accent: '#60a5fa', // Blue-400
    cardBg: 'bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md shadow-lg shadow-black/40',
    textColor: 'text-slate-100',
    glowColor: '#3b82f6', // Blue-500
    cost: 150,
  },
  {
    id: 'temple',
    name: 'Ancient Temple',
    background: 'bg-[#060504]',
    primary: 'text-amber-400 border-white/10 bg-white/[0.03] shadow-amber-500/10 hover:bg-white/10 transition-colors',
    accent: '#fbbf24', // Amber-400
    cardBg: 'bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md shadow-lg shadow-black/40',
    textColor: 'text-stone-100',
    glowColor: '#f59e0b', // Amber-500
    cost: 300,
  },
  {
    id: 'neon',
    name: 'Neon City',
    background: 'bg-[#070405]',
    primary: 'text-rose-400 border-white/10 bg-white/[0.03] shadow-rose-500/10 hover:bg-white/10 transition-colors',
    accent: '#fb7185', // Rose-400
    cardBg: 'bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md shadow-lg shadow-black/40',
    textColor: 'text-neutral-100',
    glowColor: '#f43f5e', // Rose-500
    cost: 450,
  },
  {
    id: 'ocean',
    name: 'Abyssal Ocean',
    background: 'bg-[#030605]',
    primary: 'text-emerald-400 border-white/10 bg-white/[0.03] shadow-emerald-500/10 hover:bg-white/10 transition-colors',
    accent: '#34d399', // Emerald-400
    cardBg: 'bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md shadow-lg shadow-black/40',
    textColor: 'text-emerald-50',
    glowColor: '#10b981', // Emerald-500
    cost: 600,
  },
  {
    id: 'jungle',
    name: 'Neon Jungle',
    background: 'bg-[#040604]',
    primary: 'text-green-400 border-white/10 bg-white/[0.03] shadow-green-500/10 hover:bg-white/10 transition-colors',
    accent: '#4ade80', // Green-400
    cardBg: 'bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md shadow-lg shadow-black/40',
    textColor: 'text-zinc-100',
    glowColor: '#22c55e', // Green-500
    cost: 750,
  },
  {
    id: 'matrix',
    name: 'The Matrix',
    background: 'bg-black',
    primary: 'text-lime-400 border-lime-500/20 bg-lime-950/10 shadow-lime-500/5 hover:bg-lime-950/20 font-mono transition-colors',
    accent: '#a3e635', // Lime-400
    cardBg: 'bg-black border border-lime-500/20 rounded-2xl backdrop-blur-sm shadow-lg shadow-black/60',
    textColor: 'text-lime-400',
    glowColor: '#84cc16', // Lime-500
    cost: 900,
  },
  {
    id: 'retro',
    name: 'Retro Arcade',
    background: 'bg-[#050407]',
    primary: 'text-yellow-400 border-white/10 bg-white/[0.03] shadow-yellow-500/10 hover:bg-white/10 transition-colors',
    accent: '#facc15', // Yellow-400
    cardBg: 'bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md shadow-lg shadow-black/40',
    textColor: 'text-yellow-100',
    glowColor: '#eab308', // Yellow-500
    cost: 1000,
  },
  {
    id: 'minimal',
    name: 'Pure Minimal',
    background: 'bg-[#050608]',
    primary: 'text-white border-white/10 bg-white/[0.03] shadow-white/5 hover:bg-white/10 transition-colors',
    accent: '#ffffff',
    cardBg: 'bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md shadow-lg shadow-black/40',
    textColor: 'text-neutral-200',
    glowColor: '#ffffff',
    cost: 1200,
  },
  {
    id: 'crystal',
    name: 'Crystal Prism',
    background: 'bg-[#050408]',
    primary: 'text-purple-400 border-white/10 bg-white/[0.03] shadow-purple-500/10 hover:bg-white/10 transition-colors',
    accent: '#c084fc', // Purple-400
    cardBg: 'bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md shadow-lg shadow-black/40',
    textColor: 'text-indigo-100',
    glowColor: '#a855f7', // Purple-500
    cost: 1500,
  }
];

export function getTheme(themeId: string): ThemeConfig {
  return THEMES.find((t) => t.id === themeId) || THEMES[0];
}

export const AVATARS = [
  { id: 'avatar_brain', name: 'Neural Core', icon: '🧠', cost: 0 },
  { id: 'avatar_lightning', name: 'Synapse Pulse', icon: '⚡', cost: 50 },
  { id: 'avatar_atom', name: 'Quantum Core', icon: '⚛️', cost: 100 },
  { id: 'avatar_star', name: 'Astral Mind', icon: '✨', cost: 200 },
  { id: 'avatar_fire', name: 'Ignited Logic', icon: '🔥', cost: 350 },
  { id: 'avatar_compass', name: 'Tactical Explorer', icon: '🧭', cost: 500 },
  { id: 'avatar_shield', name: 'Deduction Aegis', icon: '🛡️', cost: 750 },
  { id: 'avatar_crown', name: 'Mythic Sovereign', icon: '👑', cost: 1000 },
];
