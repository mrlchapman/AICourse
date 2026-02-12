/**
 * Gamification Activities Module
 *
 * This module provides quiz-based educational games with
 * different themes and styles.
 *
 * Structure:
 * - core/: Shared types, utilities, and theme system
 * - [game]/: Individual game modules with styles
 *
 * Each game can have multiple themes that can be swapped
 * to provide different visual styles while maintaining
 * the same gameplay logic.
 */

import { Activity } from '../types';

// Import all game renderers from modular structure
import { renderMemoryMatch } from './memoryMatch/index';
import { renderNeonDefender } from './neonDefender/index';
import { renderBattleships } from './battleships/index';
import { renderMillionaire } from './millionaire/index';
import { renderTheChase } from './theChase/index';
import { renderQuizUno } from './quizUno/index';
import { renderKnowledgeTetris } from './knowledgeTetris/index';
import { renderWordSearch } from './wordSearch/index';

// Re-export core utilities for theme development
export * from './core';

// Re-export individual game modules for direct access
export * from './memoryMatch/index';
export * from './neonDefender/index';
export * from './battleships/index';
export * from './theChase/index';
export * from './millionaire/index';
export * from './quizUno/index';
export * from './knowledgeTetris/index';
export * from './wordSearch/index';

// Export theme files for customization
export { psiLabTheme } from './memoryMatch/styles';
export { synthwaveTheme } from './neonDefender/styles';
export { coldWarTheme } from './battleships/styles';
export { cardGameTheme } from './quizUno/styles';
export { arcadeTheme } from './knowledgeTetris/styles';
export { newspaperTheme } from './wordSearch/styles';
// tvShowTheme and classicTvTheme are exported via wildcard exports

/**
 * Type for game types
 */
export type GameType =
  | 'memory_match'
  | 'neon_defender'
  | 'knowledge_tetris'
  | 'quiz_uno'
  | 'word_search'
  | 'battleships'
  | 'millionaire'
  | 'the_chase';

/**
 * Render a gamification activity
 * Uses a switch statement for clarity and type safety
 */
export function renderGamification(activity: Extract<Activity, { type: 'gamification' }>): string {
  const gameType = (activity.gameType || 'memory_match') as GameType;

  switch (gameType) {
    case 'neon_defender':
      return renderNeonDefender(activity);

    case 'knowledge_tetris':
      return renderKnowledgeTetris(activity);

    case 'quiz_uno':
      return renderQuizUno(activity);

    case 'word_search':
      return renderWordSearch(activity);

    case 'battleships':
      return renderBattleships(activity);

    case 'millionaire':
      return renderMillionaire(activity);

    case 'the_chase':
      return renderTheChase(activity);

    case 'memory_match':
    default:
      return renderMemoryMatch(activity);
  }
}

/**
 * Get available game types
 */
export function getAvailableGameTypes(): GameType[] {
  return [
    'memory_match',
    'neon_defender',
    'knowledge_tetris',
    'quiz_uno',
    'word_search',
    'battleships',
    'millionaire',
    'the_chase',
  ];
}
