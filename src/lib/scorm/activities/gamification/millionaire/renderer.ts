/**
 * Millionaire Renderer
 * Generates HTML using the selected theme
 */

import { GamificationActivity, createRenderContext, GameTheme } from '../core/types';
import { extractConfig, generateGameScript } from './engine';
import { classicTvTheme } from './styles';

/**
 * Renders the Millionaire game HTML
 * @param activity - The gamification activity
 * @param theme - Optional theme override (defaults to classicTvTheme)
 */
export function renderMillionaireWithTheme(
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
    <div class="activity millionaire-activity ${trackingClass}" id="activity-${gameId}">
        <div class="${prefix}-container" id="game-${gameId}">
            <!-- Fullscreen Toggle -->
            <button class="${prefix}-fullscreen-btn" id="fullscreen-btn-${gameId}" onclick="toggleMillFullscreen_${uniqueId}()" title="Toggle Fullscreen">
                <span class="${prefix}-fs-expand" id="fs-expand-${gameId}">\u26F6</span>
                <span class="${prefix}-fs-collapse" id="fs-collapse-${gameId}">\u26F6</span>
            </button>

            <!-- Start Screen -->
            <div class="${prefix}-start active" id="start-${gameId}">
                <div class="${prefix}-start-content">
                    <h1 class="${prefix}-logo">WHO WANTS TO BE A<br><span>MILLIONAIRE?</span></h1>
                    <p class="${prefix}-tagline">Answer 15 questions to win the ultimate prize!</p>
                    <div class="${prefix}-rules">
                        <div class="${prefix}-rule"><span class="${prefix}-rule-icon">\uD83D\uDCB0</span> Each correct answer increases your prize</div>
                        <div class="${prefix}-rule"><span class="${prefix}-rule-icon">\uD83D\uDEE1\uFE0F</span> Safe points at Q5 and Q10 lock in winnings</div>
                        <div class="${prefix}-rule"><span class="${prefix}-rule-icon">\uD83C\uDFAF</span> Use lifelines wisely - you only get 3!</div>
                        <div class="${prefix}-rule"><span class="${prefix}-rule-icon">\uD83D\uDEB6</span> Walk away anytime to keep your prize</div>
                    </div>
                    <button class="${prefix}-btn primary" onclick="startGame_${uniqueId}()">START GAME</button>
                </div>
            </div>

            <!-- Game Screen -->
            <div class="${prefix}-game" id="game-screen-${gameId}">
                <div class="${prefix}-layout">
                    <!-- Ladder Panel -->
                    <div class="${prefix}-ladder" id="ladder-${gameId}"></div>

                    <!-- Main Game Area -->
                    <div class="${prefix}-main">
                        <!-- HUD -->
                        <div class="${prefix}-hud">
                            <div class="${prefix}-hud-info">
                                <div class="${prefix}-banked" id="banked-${gameId}">Banked: \u00A30</div>
                                <div class="${prefix}-playing" id="playing-${gameId}">Playing for: \u00A3100</div>
                            </div>
                            <div class="${prefix}-timer-wrap">
                                <div class="${prefix}-timer-bar" id="timer-bar-${gameId}"></div>
                            </div>
                            <div class="${prefix}-timer-text" id="timer-text-${gameId}">${config.timerSeconds}</div>
                            <button class="${prefix}-timer-toggle active" id="timer-toggle-${gameId}" onclick="toggleTimer_${uniqueId}()">\u23F1 ON</button>
                        </div>

                        <!-- Question Box -->
                        <div class="${prefix}-question" id="question-${gameId}">Loading...</div>

                        <!-- Options Grid -->
                        <div class="${prefix}-options" id="options-${gameId}"></div>

                        <!-- Controls -->
                        <div class="${prefix}-controls">
                            <div class="${prefix}-lifelines">
                                <button class="${prefix}-life" id="life-5050-${gameId}" onclick="useFiftyFifty_${uniqueId}()">
                                    <span>50:50</span>
                                </button>
                                <button class="${prefix}-life" id="life-hint-${gameId}" onclick="useHint_${uniqueId}()">
                                    <span>HINT</span>
                                </button>
                                <button class="${prefix}-life" id="life-skip-${gameId}" onclick="useSkip_${uniqueId}()">
                                    <span>SKIP</span>
                                </button>
                            </div>
                            <button class="${prefix}-walk" onclick="walkAway_${uniqueId}()">WALK AWAY</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Confirm Modal -->
            <div class="${prefix}-modal" id="confirm-modal-${gameId}">
                <div class="${prefix}-modal-box">
                    <h2 class="${prefix}-modal-title gold">Final Answer?</h2>
                    <div class="${prefix}-modal-text" id="confirm-text-${gameId}"></div>
                    <div class="${prefix}-modal-btns">
                        <button class="${prefix}-btn primary" id="confirm-yes-${gameId}">Confirm</button>
                        <button class="${prefix}-btn secondary" id="confirm-no-${gameId}">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- Feedback Modal -->
            <div class="${prefix}-modal" id="feedback-modal-${gameId}">
                <div class="${prefix}-modal-box">
                    <h2 class="${prefix}-modal-title" id="fb-title-${gameId}">Correct!</h2>
                    <div class="${prefix}-modal-text" id="fb-msg-${gameId}"></div>
                    <button class="${prefix}-btn primary" id="fb-btn-${gameId}">Continue</button>
                </div>
            </div>

            <!-- End Screen -->
            <div class="${prefix}-modal" id="end-modal-${gameId}">
                <div class="${prefix}-modal-box wide">
                    <h2 class="${prefix}-modal-title" id="end-title-${gameId}">GAME OVER</h2>
                    <div class="${prefix}-modal-text" id="end-subtitle-${gameId}">You walked away with...</div>
                    <div class="${prefix}-prize" id="end-prize-${gameId}">\u00A30</div>

                    <div class="${prefix}-stats">
                        <div class="${prefix}-stat"><span class="${prefix}-stat-val" id="stat-questions-${gameId}">0</span><span class="${prefix}-stat-lbl">Questions</span></div>
                        <div class="${prefix}-stat"><span class="${prefix}-stat-val" id="stat-acc-${gameId}">0%</span><span class="${prefix}-stat-lbl">Accuracy</span></div>
                        <div class="${prefix}-stat"><span class="${prefix}-stat-val" id="stat-lifelines-${gameId}">0/3</span><span class="${prefix}-stat-lbl">Lifelines</span></div>
                        <div class="${prefix}-stat"><span class="${prefix}-stat-val" id="stat-safe-${gameId}">\u00A30</span><span class="${prefix}-stat-lbl">Safe Prize</span></div>
                    </div>

                    <div class="${prefix}-review">
                        <div class="${prefix}-review-title">Review (Mistakes):</div>
                        <div class="${prefix}-review-list" id="review-list-${gameId}"></div>
                    </div>

                    <button class="${prefix}-btn primary" onclick="startGame_${uniqueId}()">Play Again</button>
                </div>
            </div>
        </div>
    </div>
  `;
}
