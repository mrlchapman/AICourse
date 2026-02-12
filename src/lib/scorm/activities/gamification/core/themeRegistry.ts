/**
 * Theme Registry for Gamification Games
 *
 * This registry allows games to register multiple themes and
 * select which theme to use at render time.
 */

import { GameTheme } from './types';

type GameType = 'memory_match' | 'battleships' | 'neon_defender' | 'quiz_uno' |
                'knowledge_tetris' | 'word_search' | 'millionaire' | 'the_chase';

interface GameThemes {
  default: GameTheme;
  [key: string]: GameTheme;
}

const themeRegistry = new Map<GameType, GameThemes>();

/**
 * Register themes for a game type
 */
export function registerGameThemes(gameType: GameType, themes: GameThemes): void {
  themeRegistry.set(gameType, themes);
}

/**
 * Get a theme for a game type
 * @param gameType - The game type
 * @param themeId - Optional theme ID (defaults to 'default')
 * @returns The theme or undefined if not found
 */
export function getGameTheme(gameType: GameType, themeId: string = 'default'): GameTheme | undefined {
  const themes = themeRegistry.get(gameType);
  if (!themes) return undefined;
  return themes[themeId] || themes.default;
}

/**
 * Get all available themes for a game type
 */
export function getAvailableThemes(gameType: GameType): string[] {
  const themes = themeRegistry.get(gameType);
  if (!themes) return [];
  return Object.keys(themes);
}

/**
 * Check if a theme is available for a game type
 */
export function hasTheme(gameType: GameType, themeId: string): boolean {
  const themes = themeRegistry.get(gameType);
  if (!themes) return false;
  return themeId in themes;
}
