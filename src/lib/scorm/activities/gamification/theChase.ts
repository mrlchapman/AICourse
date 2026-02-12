/**
 * The Chase Game - Re-export from modular structure
 *
 * This file maintains backward compatibility by re-exporting
 * from the new modular theChase/ folder structure.
 *
 * @see ./theChase/index.ts for the modular implementation
 */

export { renderTheChase, renderTheChaseWithTheme, tvShowTheme } from './theChase/index';
export type { TheChaseConfig, ChaseQuestion } from './theChase/index';
