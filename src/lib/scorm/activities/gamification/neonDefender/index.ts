/**
 * Synth Defender Game Module
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
import { GamificationActivity } from '../core/types';
import { renderNeonDefenderWithTheme } from './renderer';
import { synthwaveTheme } from './styles';

// Re-export for theme customization
export { synthwaveTheme } from './styles';
export { renderNeonDefenderWithTheme } from './renderer';
export type { NeonDefenderConfig, NeonDefenderQuestion, NeonDefenderAnswer } from './engine';

/**
 * Main render function for Synth Defender
 * Uses the default Synthwave theme
 */
export function renderNeonDefender(activity: Extract<Activity, { type: 'gamification' }>): string {
  return renderNeonDefenderWithTheme(activity as GamificationActivity, synthwaveTheme);
}
