/**
 * Jeopardy Game Module
 *
 * A category-based quiz board game where clues are presented
 * as "answers" and players select the correct "What is...?" response.
 *
 * Structure:
 * - engine.ts: Pure game logic
 * - renderer.ts: HTML generation
 * - styles/: Theme definitions
 */

import { Activity } from '../../types';
import { GamificationActivity } from '../core/types';
import { renderJeopardyWithTheme } from './renderer';
import { classicTvTheme } from './styles';

// Re-export for theme customization
export { classicTvTheme } from './styles';
export { renderJeopardyWithTheme } from './renderer';
export type { JeopardyConfig, JeopardyCategory, JeopardyClue, FinalJeopardyData } from './engine';
export { POINT_VALUES } from './engine';

/**
 * Main render function for Jeopardy
 * Uses the default Classic TV theme
 */
export function renderJeopardy(activity: Extract<Activity, { type: 'gamification' }>): string {
  return renderJeopardyWithTheme(activity as GamificationActivity, classicTvTheme);
}
