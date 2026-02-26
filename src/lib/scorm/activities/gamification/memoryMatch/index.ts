/**
 * Memory Match Game Module
 *
 * A memory matching game with pairs of items.
 * Themed as a PSI Lab cognitive pattern recognition test.
 *
 * Structure:
 * - engine.ts: Pure game logic
 * - renderer.ts: HTML generation
 * - styles/: Theme definitions
 */

import { Activity } from '../../types';
import { GamificationActivity, GameTheme } from '../core/types';
import { renderMemoryMatchWithTheme } from './renderer';
import { psiLabTheme, modernTheme } from './styles';

// Re-export for theme customization
export { psiLabTheme, modernTheme } from './styles';
export { renderMemoryMatchWithTheme } from './renderer';
export type { MemoryMatchConfig, MemoryMatchPair, MemoryMatchItem, GameCard } from './engine';

const MEMORY_MATCH_THEMES: Record<string, GameTheme> = {
  'psi-lab': psiLabTheme,
  'modern': modernTheme,
};

/**
 * Main render function for Memory Match
 * Uses the configured theme or defaults to Modern
 */
export function renderMemoryMatch(activity: Extract<Activity, { type: 'gamification' }>): string {
  const themeId = (activity as GamificationActivity).config?.themeId || 'modern';
  const theme = MEMORY_MATCH_THEMES[themeId] || modernTheme;
  return renderMemoryMatchWithTheme(activity as GamificationActivity, theme);
}
