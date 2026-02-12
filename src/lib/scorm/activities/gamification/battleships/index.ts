/**
 * Battleships Game Module
 *
 * A naval combat game with quiz integration.
 * Themed as a Cold War submarine command center.
 *
 * Structure:
 * - engine.ts: Pure game logic
 * - renderer.ts: HTML generation
 * - styles/: Theme definitions
 */

import { Activity } from '../../types';
import { GamificationActivity } from '../core/types';
import { renderBattleshipsWithTheme } from './renderer';
import { coldWarTheme } from './styles';

// Re-export for theme customization
export { coldWarTheme } from './styles';
export { renderBattleshipsWithTheme } from './renderer';
export type { BattleshipsConfig, BattleshipsQuestion } from './engine';

/**
 * Main render function for Battleships
 * Uses the default Cold War theme
 */
export function renderBattleships(activity: Extract<Activity, { type: 'gamification' }>): string {
  return renderBattleshipsWithTheme(activity as GamificationActivity, coldWarTheme);
}
