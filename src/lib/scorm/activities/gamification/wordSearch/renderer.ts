/**
 * Word Search Renderer
 * Generates HTML using the selected theme
 */

import { GamificationActivity, createRenderContext, GameTheme } from '../core/types';
import { extractConfig, generateGameScript } from './engine';
import { newspaperTheme } from './styles';

/**
 * Renders the Word Search game HTML
 * @param activity - The gamification activity
 * @param theme - Optional theme override (defaults to newspaperTheme)
 */
export function renderWordSearchWithTheme(
  activity: GamificationActivity,
  theme: GameTheme = newspaperTheme
): string {
  const ctx = createRenderContext(activity);
  const config = extractConfig(activity);
  const prefix = theme.classPrefix;

  const html = generateHTML(ctx.activityId, ctx.uniqueId, config, prefix, ctx.trackingClass);
  const script = generateGameScript(ctx.activityId, ctx.uniqueId, config, prefix);
  const styles = `<style>${theme.css}</style>`;

  return `
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
    ${html}${script}${styles}
  `;
}

/**
 * Generates the HTML structure for the game
 */
function generateHTML(
  gameId: string,
  uniqueId: string,
  config: {
    words: { word: string }[];
    gridSize: number;
    timeLimit: number;
    passMarkPercent: number;
    required: boolean;
  },
  prefix: string,
  trackingClass: string
): string {
  const timerDisplay = config.timeLimit > 0
    ? `${Math.floor(config.timeLimit / 60)}:${(config.timeLimit % 60).toString().padStart(2, '0')}`
    : '';

  return `
    <div class="activity ${prefix}-activity ${trackingClass}" id="activity-${gameId}">
        <div class="${prefix}-cabinet" id="${prefix}-${gameId}">
            <!-- Fullscreen Toggle -->
            <button class="${prefix}-fullscreen-btn" id="fullscreen-btn-${gameId}" onclick="toggle${prefix.charAt(0).toUpperCase() + prefix.slice(1)}Fullscreen_${uniqueId}()" title="Toggle Fullscreen">
                <span class="${prefix}-fs-expand" id="fs-expand-${gameId}">&#x2B1C;</span>
                <span class="${prefix}-fs-collapse" id="fs-collapse-${gameId}">&#x25A3;</span>
            </button>

            <!-- Decorative Corners -->
            <div class="${prefix}-corner ${prefix}-corner-tl"></div>
            <div class="${prefix}-corner ${prefix}-corner-tr"></div>
            <div class="${prefix}-corner ${prefix}-corner-bl"></div>
            <div class="${prefix}-corner ${prefix}-corner-br"></div>

            <!-- Start Screen -->
            <div class="${prefix}-overlay ${prefix}-start active" id="start-${gameId}">
                <div class="${prefix}-start-content">
                    <div class="${prefix}-emblem">
                        <div class="${prefix}-emblem-wreath">&#x275B;</div>
                    </div>
                    <div class="${prefix}-start-title">THE LEXICON</div>
                    <div class="${prefix}-start-subtitle">A Collection of Hidden Words</div>
                    <div class="${prefix}-divider">
                        <span class="${prefix}-divider-leaf">&#x2766;</span>
                    </div>
                    <div class="${prefix}-start-rules">
                        <div class="${prefix}-rule">
                            <span class="${prefix}-rule-icon">&#x25C8;</span>
                            <span>Discover ${config.words.length} specimens hidden within the grid</span>
                        </div>
                        <div class="${prefix}-rule">
                            <span class="${prefix}-rule-icon">&#x25C8;</span>
                            <span>Answer the question for each discovery</span>
                        </div>
                        <div class="${prefix}-rule">
                            <span class="${prefix}-rule-icon">&#x25C8;</span>
                            <span>Achieve ${config.passMarkPercent}% accuracy to complete</span>
                        </div>
                        ${config.timeLimit > 0 ? `
                        <div class="${prefix}-rule">
                            <span class="${prefix}-rule-icon">&#x25C8;</span>
                            <span>Time allotted: ${timerDisplay}</span>
                        </div>
                        ` : ''}
                    </div>
                    <button class="${prefix}-button" onclick="startWordSearch_${uniqueId}()">
                        <span class="${prefix}-button-text">BEGIN EXPEDITION</span>
                    </button>
                </div>
            </div>

            <!-- Game Screen -->
            <div class="${prefix}-game" id="game-screen-${gameId}" style="display:none;">
                <!-- Header -->
                <div class="${prefix}-header">
                    <div class="${prefix}-title-small">THE LEXICON</div>
                    <div class="${prefix}-stats">
                        <div class="${prefix}-stat">
                            <span class="${prefix}-stat-label">Discovered</span>
                            <span class="${prefix}-stat-value" id="found-count-${gameId}">0 / ${config.words.length}</span>
                        </div>
                        <div class="${prefix}-stat">
                            <span class="${prefix}-stat-label">Score</span>
                            <span class="${prefix}-stat-value" id="score-${gameId}">0</span>
                        </div>
                        ${config.timeLimit > 0 ? `
                        <div class="${prefix}-stat ${prefix}-stat-timer">
                            <span class="${prefix}-stat-label">Remaining</span>
                            <span class="${prefix}-stat-value" id="timer-${gameId}">${timerDisplay}</span>
                        </div>
                        ` : ''}
                    </div>
                    ${config.required ? `<div class="${prefix}-required">&#x25C6; REQUIRED &#x25C6;</div>` : ''}
                </div>

                <!-- Main Game Area -->
                <div class="${prefix}-main">
                    <!-- Grid Area -->
                    <div class="${prefix}-grid-area">
                        <div class="${prefix}-grid-frame">
                            <div class="${prefix}-grid" id="grid-${gameId}" style="--grid-size: ${config.gridSize};"></div>
                        </div>
                        <div class="${prefix}-grid-label">SPECIMEN FIELD &#xB7; ${config.gridSize}&#xD7;${config.gridSize}</div>
                    </div>

                    <!-- Word List -->
                    <div class="${prefix}-specimens">
                        <div class="${prefix}-specimens-header">
                            <span class="${prefix}-specimens-title">CATALOGUE</span>
                            <span class="${prefix}-specimens-subtitle">Specimens to Locate</span>
                        </div>
                        <div class="${prefix}-specimens-list" id="word-list-${gameId}">
                            ${config.words.map((w, i) => `
                                <div class="${prefix}-specimen-item" id="word-item-${gameId}-${i}" data-word="${w.word.toUpperCase()}">
                                    <span class="${prefix}-specimen-number">${(i + 1).toString().padStart(2, '0')}</span>
                                    <span class="${prefix}-specimen-word">${w.word.toUpperCase()}</span>
                                    <span class="${prefix}-specimen-status">&#x25CB;</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="${prefix}-footer">
                    <div class="${prefix}-footer-text">NATURAL HISTORY COLLECTION &#xB7; EST. MDCCCXLII</div>
                </div>
            </div>

            <!-- Question Modal -->
            <div class="${prefix}-modal" id="question-modal-${gameId}">
                <div class="${prefix}-modal-content">
                    <div class="${prefix}-modal-header">
                        <div class="${prefix}-discovery-badge">SPECIMEN DISCOVERED</div>
                        <h2 class="${prefix}-found-word" id="found-word-${gameId}"></h2>
                    </div>
                    <div class="${prefix}-modal-body">
                        <p class="${prefix}-question" id="question-text-${gameId}"></p>
                        <div class="${prefix}-answers" id="answers-${gameId}"></div>
                        <div class="${prefix}-feedback" id="feedback-${gameId}"></div>
                    </div>
                </div>
            </div>

            <!-- End Screen -->
            <div class="${prefix}-overlay ${prefix}-end" id="end-${gameId}">
                <div class="${prefix}-end-content">
                    <div class="${prefix}-end-emblem" id="end-emblem-${gameId}">&#x2766;</div>
                    <h1 class="${prefix}-end-title" id="result-${gameId}">EXPEDITION COMPLETE</h1>
                    <div class="${prefix}-final-score">
                        <span class="${prefix}-final-label">Final Score</span>
                        <span class="${prefix}-final-value" id="final-score-${gameId}">0</span>
                    </div>
                    <div class="${prefix}-divider">
                        <span class="${prefix}-divider-leaf">&#x2766;</span>
                    </div>
                    <div class="${prefix}-breakdown" id="breakdown-${gameId}"></div>
                    <button class="${prefix}-button" onclick="startWordSearch_${uniqueId}()">
                        <span class="${prefix}-button-text">NEW EXPEDITION</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  `;
}
