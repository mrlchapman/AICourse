/**
 * Knowledge Tetris Game Module
 *
 * A Tetris-style game with quiz questions.
 * Themed with a Soviet-constructivist aesthetic.
 *
 * Structure:
 * - engine.ts: Pure game logic
 * - renderer.ts: HTML generation
 * - styles/: Theme definitions
 */

import { Activity } from '../../types';
import { GamificationActivity } from '../core/types';
import { renderKnowledgeTetrisWithTheme } from './renderer';
import { arcadeTheme } from './styles';

// Re-export for theme customization
export { arcadeTheme } from './styles';
export { renderKnowledgeTetrisWithTheme } from './renderer';
export type { KnowledgeTetrisConfig, TetrisQuestion, TetrisAnswer } from './engine';

/**
 * Main render function for Knowledge Tetris
 * Uses the default Arcade theme
 */
export function renderKnowledgeTetris(activity: Extract<Activity, { type: 'gamification' }>): string {
  return renderKnowledgeTetrisWithTheme(activity as GamificationActivity, arcadeTheme);
}
