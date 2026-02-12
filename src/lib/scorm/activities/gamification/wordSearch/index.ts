/**
 * Word Search Game Module
 *
 * A word search puzzle game where players find hidden words and answer
 * related questions. Themed as "The Lexicon" - a natural history collection.
 *
 * Structure:
 * - engine.ts: Pure game logic
 * - renderer.ts: HTML generation
 * - styles/: Theme definitions
 */

import { Activity } from '../../types';
import { GamificationActivity } from '../core/types';
import { renderWordSearchWithTheme } from './renderer';
import { newspaperTheme } from './styles';

// Re-export for theme customization
export { newspaperTheme } from './styles';
export { renderWordSearchWithTheme } from './renderer';
export type { WordSearchConfig, WordSearchWord } from './engine';

/**
 * Main render function for Word Search
 * Uses the default Newspaper/Lexicon theme
 */
export function renderWordSearch(activity: Extract<Activity, { type: 'gamification' }>): string {
  return renderWordSearchWithTheme(activity as GamificationActivity, newspaperTheme);
}
