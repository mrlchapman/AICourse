/**
 * Jeopardy Renderer
 * Generates HTML using the selected theme
 */

import { GamificationActivity, createRenderContext, GameTheme } from '../core/types';
import { extractConfig, generateGameScript } from './engine';
import { classicTvTheme } from './styles';

/**
 * Renders the Jeopardy game HTML
 */
export function renderJeopardyWithTheme(
  activity: GamificationActivity,
  theme: GameTheme = classicTvTheme
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
  config: { timerSeconds: number; required: boolean },
  prefix: string,
  trackingClass: string
): string {
  return `
    <div class="activity jeopardy-activity ${trackingClass}" id="activity-${gameId}">
        <div class="${prefix}-container" id="jep-container-${gameId}">
            <!-- Fullscreen Toggle -->
            <button class="${prefix}-fullscreen-btn" id="fullscreen-btn-${gameId}" onclick="toggleJepFullscreen_${uniqueId}()" title="Toggle Fullscreen">
                <span class="${prefix}-fs-expand" id="fs-expand-${gameId}">\u26F6</span>
                <span class="${prefix}-fs-collapse" id="fs-collapse-${gameId}">\u26F6</span>
            </button>

            <!-- Start Screen -->
            <div class="${prefix}-start active" id="start-${gameId}">
                <div class="${prefix}-start-content">
                    <h1 class="${prefix}-logo">JEOPARDY!</h1>
                    <p class="${prefix}-tagline">Select a category and point value to reveal the clue</p>
                    <div class="${prefix}-rules">
                        <div class="${prefix}-rule"><span class="${prefix}-rule-icon">\uD83D\uDCCA</span> Choose clues from the board</div>
                        <div class="${prefix}-rule"><span class="${prefix}-rule-icon">\u2753</span> Clues are statements - pick the correct "What is...?" response</div>
                        <div class="${prefix}-rule"><span class="${prefix}-rule-icon">\u2B50</span> Watch out for Daily Doubles - wager your score!</div>
                        <div class="${prefix}-rule"><span class="${prefix}-rule-icon">\u23F1\uFE0F</span> ${config.timerSeconds} seconds per clue</div>
                    </div>
                    <button class="${prefix}-btn primary" onclick="startJepGame_${uniqueId}()">START GAME</button>
                </div>
            </div>

            <!-- Game Screen -->
            <div class="${prefix}-game" id="game-${gameId}">
                <!-- HUD -->
                <div class="${prefix}-hud">
                    <div class="${prefix}-score" id="score-${gameId}">$0</div>
                    <div class="${prefix}-clues-left" id="clues-left-${gameId}"></div>
                </div>

                <!-- Board -->
                <div class="${prefix}-board" id="board-${gameId}"></div>

                <!-- Clue Overlay -->
                <div class="${prefix}-clue-overlay" id="clue-overlay-${gameId}">
                    <div class="${prefix}-dd-banner" id="dd-banner-${gameId}" style="display:none">DAILY DOUBLE!</div>

                    <div class="${prefix}-wager-section" id="wager-section-${gameId}" style="display:none">
                        <div class="${prefix}-wager-label">How much will you wager?</div>
                        <input type="number" class="${prefix}-wager-input" id="wager-input-${gameId}" min="5" />
                        <br><br>
                        <button class="${prefix}-btn primary" id="wager-btn-${gameId}">WAGER</button>
                    </div>

                    <div class="${prefix}-clue-category" id="clue-cat-${gameId}"></div>
                    <div class="${prefix}-clue-value" id="clue-val-${gameId}"></div>
                    <div class="${prefix}-clue-text" id="clue-text-${gameId}"></div>

                    <div class="${prefix}-options" id="clue-options-${gameId}"></div>

                    <div class="${prefix}-timer-wrap" id="timer-wrap-${gameId}">
                        <div class="${prefix}-timer-bar" id="timer-bar-${gameId}"></div>
                    </div>

                    <div class="${prefix}-feedback" id="clue-feedback-${gameId}">
                        <div class="${prefix}-feedback-result" id="fb-result-${gameId}"></div>
                        <div class="${prefix}-feedback-explanation" id="fb-explanation-${gameId}"></div>
                        <div class="${prefix}-feedback-points" id="fb-points-${gameId}"></div>
                    </div>
                </div>

                <!-- Final Jeopardy Overlay -->
                <div class="${prefix}-final-overlay" id="final-overlay-${gameId}">
                    <div class="${prefix}-final-title">FINAL JEOPARDY!</div>
                    <div class="${prefix}-clue-category" id="final-cat-${gameId}"></div>

                    <div class="${prefix}-wager-section" id="final-wager-section-${gameId}">
                        <div class="${prefix}-wager-label">Place your Final Jeopardy wager</div>
                        <input type="number" class="${prefix}-wager-input" id="final-wager-input-${gameId}" min="0" />
                        <br><br>
                        <button class="${prefix}-btn primary" id="final-wager-btn-${gameId}">WAGER</button>
                    </div>

                    <div class="${prefix}-clue-text" id="final-clue-${gameId}"></div>
                    <div class="${prefix}-options" id="final-options-${gameId}"></div>

                    <div class="${prefix}-feedback" id="final-feedback-${gameId}">
                        <div class="${prefix}-feedback-result" id="final-fb-result-${gameId}"></div>
                        <div class="${prefix}-feedback-explanation" id="final-fb-explanation-${gameId}"></div>
                    </div>
                </div>
            </div>

            <!-- End Screen -->
            <div class="${prefix}-end" id="end-${gameId}">
                <div class="${prefix}-end-title" id="end-title-${gameId}">Game Over</div>
                <div class="${prefix}-final-score" id="end-score-${gameId}">$0</div>
                <div class="${prefix}-end-stats">
                    <div class="${prefix}-stat">
                        <div class="${prefix}-stat-value" id="stat-correct-${gameId}">0</div>
                        <div class="${prefix}-stat-label">Correct</div>
                    </div>
                    <div class="${prefix}-stat">
                        <div class="${prefix}-stat-value" id="stat-wrong-${gameId}">0</div>
                        <div class="${prefix}-stat-label">Wrong</div>
                    </div>
                    <div class="${prefix}-stat">
                        <div class="${prefix}-stat-value" id="stat-accuracy-${gameId}">0%</div>
                        <div class="${prefix}-stat-label">Accuracy</div>
                    </div>
                </div>
                <div class="${prefix}-review" id="review-${gameId}"></div>
                <div class="${prefix}-end-actions">
                    <button class="${prefix}-btn primary" onclick="playJepAgain_${uniqueId}()">PLAY AGAIN</button>
                </div>
            </div>
        </div>
    </div>
  `;
}
