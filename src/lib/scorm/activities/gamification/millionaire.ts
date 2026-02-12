/**
 * Millionaire Game - Legacy Compatibility Export
 *
 * This file maintains backward compatibility with existing imports.
 * The game has been refactored into a modular structure in ./millionaire/
 *
 * For new imports, use:
 *   import { renderMillionaire } from './millionaire/index';
 *   import { renderMillionaireWithTheme, classicTvTheme } from './millionaire/index';
 */

export {
  renderMillionaire,
  renderMillionaireWithTheme,
  classicTvTheme,
  PRIZE_LADDER,
  SAFE_POINTS,
} from './millionaire/index';

export type { MillionaireConfig, MillionaireQuestion } from './millionaire/index';
