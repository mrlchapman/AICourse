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
import { GamificationActivity } from '../core/types';
import { renderMemoryMatchWithTheme } from './renderer';
import { psiLabTheme } from './styles';

// Re-export for theme customization
export { psiLabTheme } from './styles';
export { renderMemoryMatchWithTheme } from './renderer';
export type { MemoryMatchConfig, MemoryMatchPair, MemoryMatchItem, GameCard } from './engine';

/**
 * Main render function for Memory Match
 * Uses the default PSI Lab theme
 */
export function renderMemoryMatch(activity: Extract<Activity, { type: 'gamification' }>): string {
  return renderMemoryMatchWithTheme(activity as GamificationActivity, psiLabTheme);
}
