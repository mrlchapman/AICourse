/**
 * Millionaire Game Module
 *
 * A "Who Wants to Be a Millionaire" style quiz game
 * with prize ladder, lifelines, and timer functionality.
 *
 * Structure:
 * - engine.ts: Pure game logic
 * - renderer.ts: HTML generation
 * - styles/: Theme definitions
 */

import { Activity } from '../../types';
import { GamificationActivity } from '../core/types';
import { renderMillionaireWithTheme } from './renderer';
import { classicTvTheme } from './styles';

// Re-export for theme customization
export { classicTvTheme } from './styles';
export { renderMillionaireWithTheme } from './renderer';
export type { MillionaireConfig, MillionaireQuestion } from './engine';
export { PRIZE_LADDER, SAFE_POINTS } from './engine';

/**
 * Main render function for Millionaire
 * Uses the default TV Show theme
 */
export function renderMillionaire(activity: Extract<Activity, { type: 'gamification' }>): string {
  return renderMillionaireWithTheme(activity as GamificationActivity, classicTvTheme);
}
