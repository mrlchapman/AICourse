/**
 * The Chase Game Module
 *
 * A quiz race game where the player competes against an AI "Chaser".
 * Themed as a dramatic TV game show experience.
 *
 * Structure:
 * - engine.ts: Pure game logic
 * - renderer.ts: HTML generation
 * - styles/: Theme definitions
 */

import { Activity } from '../../types';
import { GamificationActivity } from '../core/types';
import { renderTheChaseWithTheme } from './renderer';
import { tvShowTheme } from './styles';

// Re-export for theme customization
export { tvShowTheme } from './styles';
export { renderTheChaseWithTheme } from './renderer';
export type { TheChaseConfig, ChaseQuestion } from './engine';

/**
 * Main render function for The Chase
 * Uses the default TV Show theme
 */
export function renderTheChase(activity: Extract<Activity, { type: 'gamification' }>): string {
  return renderTheChaseWithTheme(activity as GamificationActivity, tvShowTheme);
}
