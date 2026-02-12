/**
 * Quiz Uno Game Module
 *
 * A card game (UNO-style) with quiz questions.
 * Themed as "Carte Royale" - an art deco casino aesthetic.
 *
 * Structure:
 * - engine.ts: Pure game logic
 * - renderer.ts: HTML generation
 * - styles/: Theme definitions
 */

import { Activity } from '../../types';
import { GamificationActivity } from '../core/types';
import { renderQuizUnoWithTheme } from './renderer';
import { cardGameTheme } from './styles';

// Re-export for theme customization
export { cardGameTheme } from './styles';
export { renderQuizUnoWithTheme } from './renderer';
export type { QuizUnoConfig, QuizUnoQuestion } from './engine';

/**
 * Main render function for Quiz Uno
 * Uses the default Card Game (Carte Royale) theme
 */
export function renderQuizUno(activity: Extract<Activity, { type: 'gamification' }>): string {
  return renderQuizUnoWithTheme(activity as GamificationActivity, cardGameTheme);
}
