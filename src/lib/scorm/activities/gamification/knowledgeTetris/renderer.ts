/**
 * Knowledge Tetris Renderer
 * Generates HTML using the selected theme
 */

import { GamificationActivity, createRenderContext, GameTheme } from '../core/types';
import { extractConfig, generateGameScript } from './engine';
import { arcadeTheme } from './styles';

/**
 * Renders the Knowledge Tetris game HTML
 * @param activity - The gamification activity
 * @param theme - Optional theme override (defaults to arcadeTheme)
 */
export function renderKnowledgeTetrisWithTheme(
  activity: GamificationActivity,
  theme: GameTheme = arcadeTheme
): string {
  const ctx = createRenderContext(activity);
  const config = extractConfig(activity);
  const prefix = theme.classPrefix;

  const html = generateHTML(ctx.activityId, ctx.uniqueId, config, prefix, ctx.trackingClass);
  const script = generateGameScript(ctx.activityId, ctx.uniqueId, config, prefix);
  const styles = `<style>${theme.css}</style>`;

  return `${html}${script}${styles}`;
}

/**
 * Generates the HTML structure for the game
 */
function generateHTML(
  gameId: string,
  uniqueId: string,
  config: { questions: { id: string }[]; startingLevel: number; required: boolean },
  prefix: string,
  trackingClass: string
): string {
  return `
    <div class="activity ${prefix}-activity ${trackingClass}" id="activity-${gameId}">
        <div class="${prefix}-cabinet" id="${prefix}-${gameId}">
            <!-- Fullscreen Toggle -->
            <button class="${prefix}-fullscreen-btn" id="fullscreen-btn-${gameId}" onclick="toggleBlokFullscreen_${uniqueId}()" title="Toggle Fullscreen">
                <span class="${prefix}-fs-expand" id="fs-expand-${gameId}">⛶</span>
                <span class="${prefix}-fs-collapse" id="fs-collapse-${gameId}">⛶</span>
            </button>

            <!-- Decorative Elements -->
            <div class="${prefix}-stripe ${prefix}-stripe-top"></div>
            <div class="${prefix}-stripe ${prefix}-stripe-bottom"></div>
            <div class="${prefix}-corner ${prefix}-corner-tl">★</div>
            <div class="${prefix}-corner ${prefix}-corner-tr">★</div>
            <div class="${prefix}-corner ${prefix}-corner-bl">★</div>
            <div class="${prefix}-corner ${prefix}-corner-br">★</div>

            <!-- Header -->
            <div class="${prefix}-header">
                <div class="${prefix}-title-group">
                    <div class="${prefix}-title">БЛОК</div>
                    <div class="${prefix}-subtitle">KNOWLEDGE BUILDER</div>
                </div>
                ${config.required ? `<div class="${prefix}-required">◆ MANDATORY ◆</div>` : ''}
            </div>

            <!-- Main Game Area -->
            <div class="${prefix}-main">
                <!-- Left Panel -->
                <div class="${prefix}-panel ${prefix}-panel-left">
                    <div class="${prefix}-stat">
                        <div class="${prefix}-stat-label">SCORE</div>
                        <div class="${prefix}-stat-value" id="score-${gameId}">0</div>
                        <div class="${prefix}-stat-bar">
                            <div class="${prefix}-stat-fill" id="score-fill-${gameId}"></div>
                        </div>
                    </div>
                    <div class="${prefix}-stat">
                        <div class="${prefix}-stat-label">LEVEL</div>
                        <div class="${prefix}-stat-value ${prefix}-level" id="level-${gameId}">${config.startingLevel}</div>
                    </div>
                    <div class="${prefix}-stat">
                        <div class="${prefix}-stat-label">LINES</div>
                        <div class="${prefix}-stat-value" id="lines-${gameId}">0</div>
                    </div>
                    <div class="${prefix}-propaganda">
                        <div class="${prefix}-slogan">BUILD</div>
                        <div class="${prefix}-slogan">LEARN</div>
                        <div class="${prefix}-slogan">ACHIEVE</div>
                    </div>
                </div>

                <!-- Game Canvas -->
                <div class="${prefix}-game-frame">
                    <div class="${prefix}-game-inner">
                        <canvas id="canvas-${gameId}" class="${prefix}-canvas"></canvas>
                    </div>
                </div>

                <!-- Right Panel -->
                <div class="${prefix}-panel ${prefix}-panel-right">
                    <div class="${prefix}-next-box">
                        <div class="${prefix}-stat-label">NEXT</div>
                        <div class="${prefix}-next-frame">
                            <canvas id="next-${gameId}" class="${prefix}-next-canvas"></canvas>
                        </div>
                    </div>
                    <div class="${prefix}-stat">
                        <div class="${prefix}-stat-label">PROGRESS</div>
                        <div class="${prefix}-progress">
                            <span class="${prefix}-progress-current" id="correct-${gameId}">0</span>
                            <span class="${prefix}-progress-divider">/</span>
                            <span class="${prefix}-progress-total" id="total-${gameId}">${config.questions.length}</span>
                        </div>
                    </div>
                    <div class="${prefix}-controls-info">
                        <div class="${prefix}-control-item">◄ ► MOVE</div>
                        <div class="${prefix}-control-item">▲ ROTATE</div>
                        <div class="${prefix}-control-item">▼ DROP</div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="${prefix}-footer">
                <div class="${prefix}-footer-text">EDUCATIONAL BLOCK CONSTRUCTION PROGRAM</div>
                <div class="${prefix}-footer-id">ID: ${gameId.substring(0, 8).toUpperCase()}</div>
            </div>

            <!-- Start Overlay -->
            <div class="${prefix}-overlay ${prefix}-start active" id="start-${gameId}">
                <div class="${prefix}-overlay-content">
                    <div class="${prefix}-start-emblem">
                        <div class="${prefix}-emblem-star">★</div>
                        <div class="${prefix}-emblem-blocks">
                            <span>▀</span><span>▄</span><span>█</span><span>▀</span>
                        </div>
                    </div>
                    <div class="${prefix}-start-title">БЛОК</div>
                    <div class="${prefix}-start-subtitle">KNOWLEDGE BUILDER</div>
                    <div class="${prefix}-start-instructions">
                        <p>CLEAR LINES • ANSWER QUESTIONS • BUILD KNOWLEDGE</p>
                    </div>
                    <div class="${prefix}-start-controls">
                        <span>◄ ► MOVE</span>
                        <span>▲ SPACE ROTATE</span>
                        <span>▼ DROP</span>
                    </div>
                    <button class="${prefix}-button" onclick="startTetris_${uniqueId}()">
                        <span class="${prefix}-button-text">▶ BEGIN CONSTRUCTION</span>
                    </button>
                </div>
            </div>

            <!-- Question Overlay -->
            <div class="${prefix}-overlay ${prefix}-question" id="question-${gameId}">
                <div class="${prefix}-question-box">
                    <div class="${prefix}-question-header">
                        <span class="${prefix}-question-icon">?</span>
                        <span>KNOWLEDGE CHECK</span>
                    </div>
                    <div class="${prefix}-question-text" id="q-text-${gameId}">Question?</div>
                    <div class="${prefix}-answers" id="answers-${gameId}"></div>
                </div>
            </div>

            <!-- Feedback Overlay -->
            <div class="${prefix}-overlay ${prefix}-feedback" id="feedback-${gameId}">
                <div class="${prefix}-feedback-box">
                    <div class="${prefix}-feedback-icon">★</div>
                    <div class="${prefix}-feedback-title">CORRECT!</div>
                    <div class="${prefix}-feedback-text" id="explanation-${gameId}">Explanation...</div>
                    <button class="${prefix}-button ${prefix}-button-small" onclick="closeFeedback_${uniqueId}()">
                        <span class="${prefix}-button-text">CONTINUE</span>
                    </button>
                </div>
            </div>

            <!-- End Overlay -->
            <div class="${prefix}-overlay ${prefix}-end" id="end-${gameId}">
                <div class="${prefix}-end-content">
                    <div class="${prefix}-end-emblem" id="end-emblem-${gameId}">★</div>
                    <div class="${prefix}-end-title" id="end-title-${gameId}">CONSTRUCTION COMPLETE</div>
                    <div class="${prefix}-end-stats" id="end-stats-${gameId}"></div>
                    <button class="${prefix}-button" onclick="startTetris_${uniqueId}()">
                        <span class="${prefix}-button-text">↺ REBUILD</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  `;
}
