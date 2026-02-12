/**
 * Knowledge Tetris - Legacy Re-export
 *
 * This file provides backwards compatibility for the
 * refactored modular structure.
 *
 * The game has been modularized into:
 * - knowledgeTetris/styles/arcade.ts - Theme definition
 * - knowledgeTetris/engine.ts - Game logic
 * - knowledgeTetris/renderer.ts - HTML generation
 * - knowledgeTetris/index.ts - Main exports
 *
 * @deprecated Import from './knowledgeTetris/index' instead
 */

export { renderKnowledgeTetris } from './knowledgeTetris/index';
export { arcadeTheme, renderKnowledgeTetrisWithTheme } from './knowledgeTetris/index';
export type { KnowledgeTetrisConfig, TetrisQuestion, TetrisAnswer } from './knowledgeTetris/index';
