/**
 * The Chase Renderer
 * Generates HTML using the selected theme
 */

import { GamificationActivity, createRenderContext, GameTheme } from '../core/types';
import { extractConfig, generateGameScript, TheChaseConfig } from './engine';
import { tvShowTheme } from './styles';

/**
 * Renders The Chase game HTML
 * @param activity - The gamification activity
 * @param theme - Optional theme override (defaults to tvShowTheme)
 */
export function renderTheChaseWithTheme(
  activity: GamificationActivity,
  theme: GameTheme = tvShowTheme
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
  config: TheChaseConfig,
  prefix: string,
  trackingClass: string
): string {
  return `
    <div class="activity ${prefix}-activity ${trackingClass}" id="activity-${gameId}">
      <div class="${prefix}-container" id="game-${gameId}">
        <!-- Fullscreen Toggle -->
        <button class="${prefix}-fullscreen-btn" id="fullscreen-btn-${gameId}" onclick="toggleChaseFullscreen_${uniqueId}()" title="Toggle Fullscreen">
          <span class="${prefix}-fs-expand" id="fs-expand-${gameId}">⛶</span>
          <span class="${prefix}-fs-collapse" id="fs-collapse-${gameId}">⛶</span>
        </button>

        <!-- Start Screen -->
        <div class="${prefix}-start active" id="start-${gameId}">
          <div class="${prefix}-start-content">
            <h1 class="${prefix}-logo">BEAT THE<br><span>CHASER</span></h1>
            <p class="${prefix}-tagline">Race to the top before the Chaser catches you!</p>
            <div class="${prefix}-rules">
              <div class="${prefix}-rule"><span class="${prefix}-rule-icon">🎯</span> <strong>Goal:</strong> Reach the top to win!</div>
              <div class="${prefix}-rule"><span class="${prefix}-rule-icon">🏃</span> <strong>Head Start:</strong> You begin ${config.headStart} steps ahead.</div>
              <div class="${prefix}-rule"><span class="${prefix}-rule-icon">⚡</span> <strong>The Chaser:</strong> Has ${config.chaserAccuracy}% accuracy. If caught, you lose.</div>
              <div class="${prefix}-rule"><span class="${prefix}-rule-icon">📊</span> <strong>Mechanics:</strong> Correct = move up. Wrong = stay still.</div>
            </div>
            <button class="${prefix}-btn primary" onclick="startGame_${uniqueId}()">START THE CHASE</button>
          </div>
        </div>

        <!-- Game Screen -->
        <div class="${prefix}-game" id="game-screen-${gameId}">
          <div class="${prefix}-topbar">
            <div class="${prefix}-status">
              <div class="${prefix}-title">THE CHASE</div>
              <div class="${prefix}-sub" id="sub-${gameId}">Stay ahead to win!</div>
            </div>
            <div class="${prefix}-hud-right">
              <div class="${prefix}-timer-wrap">
                <div class="${prefix}-timer-bar" id="timer-bar-${gameId}"></div>
              </div>
              <div class="${prefix}-timer-text" id="timer-text-${gameId}">${config.timerSeconds}</div>
              <button class="${prefix}-timer-btn active" id="timer-toggle-${gameId}" onclick="toggleTimer_${uniqueId}()">⏱ ON</button>
            </div>
          </div>

          <div class="${prefix}-layout">
            <!-- Ladder -->
            <div class="${prefix}-ladder-col">
              <div class="${prefix}-ladder">
                <div class="${prefix}-steps" id="steps-${gameId}"></div>
              </div>
              <div class="${prefix}-accuracy">Chaser Accuracy: ${config.chaserAccuracy}%</div>
            </div>

            <!-- Game Panel -->
            <div class="${prefix}-panel">
              <div class="${prefix}-info-card">
                <div class="${prefix}-gap">
                  GAP: <span id="gap-${gameId}" class="${prefix}-gap-num">${config.headStart}</span> STEPS
                </div>
                <div class="${prefix}-pot">
                  <div class="${prefix}-pot-label">PRIZE</div>
                  <div class="${prefix}-pot-val">WIN!</div>
                </div>
              </div>

              <div class="${prefix}-question" id="question-${gameId}">Loading...</div>
              <div class="${prefix}-options" id="options-${gameId}"></div>
            </div>
          </div>
        </div>

        <!-- Confirm Modal -->
        <div class="${prefix}-modal" id="confirm-modal-${gameId}">
          <div class="${prefix}-modal-box">
            <h2 class="${prefix}-modal-title">Lock in answer?</h2>
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
            <h2 class="${prefix}-modal-title" id="fb-title-${gameId}">Result</h2>
            <div class="${prefix}-report">
              <div class="${prefix}-report-row">
                <span>You:</span>
                <span id="fb-you-${gameId}">...</span>
              </div>
              <div class="${prefix}-report-row">
                <span>The Chaser:</span>
                <span id="fb-chaser-${gameId}">...</span>
              </div>
            </div>
            <div class="${prefix}-modal-text" id="fb-msg-${gameId}"></div>
            <button class="${prefix}-btn primary" id="fb-btn-${gameId}" style="width:100%;">Continue</button>
          </div>
        </div>

        <!-- End Modal -->
        <div class="${prefix}-modal" id="end-modal-${gameId}">
          <div class="${prefix}-modal-box">
            <h2 class="${prefix}-modal-title" id="end-title-${gameId}">Game Over</h2>
            <div class="${prefix}-modal-text" id="end-text-${gameId}"></div>
            <button class="${prefix}-btn primary" onclick="startGame_${uniqueId}()">Play Again</button>
          </div>
        </div>
      </div>
    </div>
  `;
}
