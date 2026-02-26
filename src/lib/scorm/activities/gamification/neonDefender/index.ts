/**
 * Space Invaders Game Module
 *
 * A space shooter quiz game where players shoot asteroids to answer questions.
 * Themed as a vintage synthesizer/frequency calibration device.
 *
 * Structure:
 * - engine.ts: Pure game logic
 * - renderer.ts: HTML generation
 * - styles/: Theme definitions
 */

import { Activity } from '../../types';
import { GamificationActivity, GameTheme } from '../core/types';
import { renderNeonDefenderWithTheme } from './renderer';
import { synthwaveTheme, spaceInvadersTheme } from './styles';

// Re-export for theme customization
export { synthwaveTheme, spaceInvadersTheme } from './styles';
export { renderNeonDefenderWithTheme } from './renderer';
export type { NeonDefenderConfig, NeonDefenderQuestion, NeonDefenderAnswer } from './engine';

const NEON_DEFENDER_THEMES: Record<string, GameTheme> = {
  'synthwave': synthwaveTheme,
  'space-invaders': spaceInvadersTheme,
};

/**
 * Main render function for Space Invaders
 * Uses the configured theme or defaults to Space Invaders
 */
export function renderNeonDefender(activity: Extract<Activity, { type: 'gamification' }>): string {
  const themeId = (activity as GamificationActivity).config?.themeId || 'space-invaders';
  const theme = NEON_DEFENDER_THEMES[themeId] || spaceInvadersTheme;
  return renderNeonDefenderWithTheme(activity as GamificationActivity, theme);
}
