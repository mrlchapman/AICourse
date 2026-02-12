/**
 * Quiz Uno Renderer
 * Generates HTML using the selected theme
 */

import { GamificationActivity, createRenderContext, GameTheme } from '../core/types';
import { extractConfig, generateGameScript } from './engine';
import { cardGameTheme } from './styles';

/**
 * Renders the Quiz Uno game HTML
 * @param activity - The gamification activity
 * @param theme - Optional theme override (defaults to cardGameTheme)
 */
export function renderQuizUnoWithTheme(
  activity: GamificationActivity,
  theme: GameTheme = cardGameTheme
): string {
  const ctx = createRenderContext(activity);
  const config = extractConfig(activity);
  const prefix = theme.classPrefix;

  const html = generateHTML(ctx.activityId, ctx.uniqueId, config, prefix, ctx.trackingClass);
  const script = generateGameScript(ctx.activityId, ctx.uniqueId, config, prefix);
  const styles = `<style>${theme.css}</style>`;

  return `
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Josefin+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
    ${html}${script}${styles}
  `;
}

/**
 * Generates the HTML structure for the game
 */
function generateHTML(
  gameId: string,
  uniqueId: string,
  config: { passMarkPercent: number; required: boolean },
  prefix: string,
  trackingClass: string
): string {
  return `
    <div class="activity ${prefix}-activity ${trackingClass}" id="activity-${gameId}">
        <div class="${prefix}-cabinet" id="${prefix}-${gameId}">
            <!-- Fullscreen Toggle -->
            <button class="${prefix}-fullscreen-btn" id="fullscreen-btn-${gameId}" onclick="toggleCarteFullscreen_${uniqueId}()" title="Toggle Fullscreen">
                <span class="${prefix}-fs-expand" id="fs-expand-${gameId}">&#9671;</span>
                <span class="${prefix}-fs-collapse" id="fs-collapse-${gameId}">&#9670;</span>
            </button>

            <!-- Decorative Corners -->
            <div class="${prefix}-corner ${prefix}-corner-tl"></div>
            <div class="${prefix}-corner ${prefix}-corner-tr"></div>
            <div class="${prefix}-corner ${prefix}-corner-bl"></div>
            <div class="${prefix}-corner ${prefix}-corner-br"></div>

            <!-- Art Deco Border Lines -->
            <div class="${prefix}-deco-line ${prefix}-deco-top"></div>
            <div class="${prefix}-deco-line ${prefix}-deco-bottom"></div>

            <!-- Flash Overlay -->
            <div class="${prefix}-flash" id="flash-${gameId}"></div>

            <!-- Start Screen -->
            <div class="${prefix}-overlay ${prefix}-start active" id="start-${gameId}">
                <div class="${prefix}-start-content">
                    <div class="${prefix}-emblem">
                        <div class="${prefix}-emblem-diamond">&#9670;</div>
                        <div class="${prefix}-emblem-suits">&#9824; &#9829; &#9830; &#9827;</div>
                    </div>
                    <div class="${prefix}-start-title">CARTE ROYALE</div>
                    <div class="${prefix}-start-subtitle">THE GRAND GAME</div>
                    <div class="${prefix}-divider">
                        <span class="${prefix}-divider-line"></span>
                        <span class="${prefix}-divider-diamond">&#9670;</span>
                        <span class="${prefix}-divider-line"></span>
                    </div>
                    <div class="${prefix}-start-rules">
                        <p>Match colors or numbers to play cards</p>
                        <p>Answer questions to activate special cards</p>
                        <p class="${prefix}-pass-mark">Pass Mark: ${config.passMarkPercent}%</p>
                    </div>
                    <button class="${prefix}-button" onclick="startUnoGame_${uniqueId}()">
                        <span class="${prefix}-button-text">DEAL THE CARDS</span>
                    </button>
                </div>
            </div>

            <!-- Game Board -->
            <div class="${prefix}-board" id="board-${gameId}">
                <!-- Header -->
                <div class="${prefix}-header">
                    <div class="${prefix}-title-group">
                        <div class="${prefix}-title">CARTE ROYALE</div>
                    </div>
                    ${config.required ? `<div class="${prefix}-required">&#9670; MANDATORY &#9670;</div>` : ''}
                </div>

                <!-- Opponent Area -->
                <div class="${prefix}-player-area ${prefix}-opponent" id="bot-area-${gameId}">
                    <div class="${prefix}-player-label">
                        <span class="${prefix}-label-text">THE HOUSE</span>
                        <span class="${prefix}-card-count"><span id="bot-count-${gameId}">0</span> cards</span>
                    </div>
                    <div class="${prefix}-turn-indicator">HOUSE PLAYS</div>
                    <div class="${prefix}-hand" id="bot-hand-${gameId}"></div>
                </div>

                <!-- Play Area -->
                <div class="${prefix}-table">
                    <div class="${prefix}-table-felt">
                        <div class="${prefix}-deck" id="deck-${gameId}">
                            <div class="${prefix}-deck-label">DRAW</div>
                        </div>
                        <div class="${prefix}-discard-area">
                            <div class="${prefix}-card ${prefix}-discard" id="discard-${gameId}"></div>
                        </div>
                    </div>
                </div>

                <!-- Player Area -->
                <div class="${prefix}-player-area ${prefix}-you" id="player-area-${gameId}">
                    <div class="${prefix}-turn-indicator">YOUR TURN</div>
                    <div class="${prefix}-hand" id="player-hand-${gameId}"></div>
                    <div class="${prefix}-player-label">
                        <span class="${prefix}-label-text">YOUR HAND</span>
                    </div>
                </div>

                <!-- Footer -->
                <div class="${prefix}-footer">
                    <div class="${prefix}-footer-text">ESTABLISHED MDCCCCXX</div>
                </div>
            </div>

            <!-- Quiz Modal -->
            <div class="${prefix}-modal" id="quiz-modal-${gameId}">
                <div class="${prefix}-modal-content">
                    <div class="${prefix}-quiz-badge" id="quiz-badge-${gameId}">&#9876; ATTACK</div>
                    <h2 class="${prefix}-quiz-title" id="quiz-title-${gameId}">Question</h2>
                    <p class="${prefix}-quiz-question" id="quiz-question-${gameId}"></p>
                    <div class="${prefix}-options" id="quiz-options-${gameId}"></div>
                    <div class="${prefix}-feedback" id="quiz-feedback-${gameId}">
                        <div class="${prefix}-feedback-icon" id="feedback-icon-${gameId}">&#9670;</div>
                        <p class="${prefix}-feedback-msg" id="feedback-msg-${gameId}"></p>
                        <p class="${prefix}-feedback-exp" id="feedback-exp-${gameId}"></p>
                        <button class="${prefix}-button ${prefix}-button-small" onclick="closeUnoQuiz_${uniqueId}()">
                            <span class="${prefix}-button-text">CONTINUE</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Color Picker Modal -->
            <div class="${prefix}-modal" id="color-modal-${gameId}">
                <div class="${prefix}-modal-content ${prefix}-color-picker">
                    <h2 class="${prefix}-modal-title">SELECT YOUR COLOR</h2>
                    <div class="${prefix}-color-grid">
                        <button class="${prefix}-color-btn ${prefix}-color-ruby" onclick="pickUnoColor_${uniqueId}('red')">
                            <span class="${prefix}-color-gem">&#9830;</span>
                            <span class="${prefix}-color-name">RUBY</span>
                        </button>
                        <button class="${prefix}-color-btn ${prefix}-color-sapphire" onclick="pickUnoColor_${uniqueId}('blue')">
                            <span class="${prefix}-color-gem">&#9824;</span>
                            <span class="${prefix}-color-name">SAPPHIRE</span>
                        </button>
                        <button class="${prefix}-color-btn ${prefix}-color-emerald" onclick="pickUnoColor_${uniqueId}('green')">
                            <span class="${prefix}-color-gem">&#9827;</span>
                            <span class="${prefix}-color-name">EMERALD</span>
                        </button>
                        <button class="${prefix}-color-btn ${prefix}-color-gold" onclick="pickUnoColor_${uniqueId}('yellow')">
                            <span class="${prefix}-color-gem">&#9829;</span>
                            <span class="${prefix}-color-name">GOLD</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- End Screen -->
            <div class="${prefix}-overlay ${prefix}-end" id="end-${gameId}">
                <div class="${prefix}-end-content">
                    <div class="${prefix}-end-emblem" id="end-emblem-${gameId}">&#9670;</div>
                    <h1 class="${prefix}-end-title" id="end-title-${gameId}">GAME COMPLETE</h1>
                    <p class="${prefix}-end-score" id="end-score-${gameId}">Score: 0/0</p>
                    <div class="${prefix}-divider">
                        <span class="${prefix}-divider-line"></span>
                        <span class="${prefix}-divider-diamond">&#9670;</span>
                        <span class="${prefix}-divider-line"></span>
                    </div>
                    <div class="${prefix}-log" id="log-${gameId}"></div>
                    <button class="${prefix}-button" onclick="startUnoGame_${uniqueId}()">
                        <span class="${prefix}-button-text">PLAY AGAIN</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  `;
}
