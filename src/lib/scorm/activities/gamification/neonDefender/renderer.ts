/**
 * Synth Defender Renderer
 * Generates HTML using the selected theme
 */

import { GamificationActivity, createRenderContext, GameTheme } from '../core/types';
import { extractConfig, generateGameScript } from './engine';
import { synthwaveTheme } from './styles';

/**
 * Renders the Synth Defender game HTML
 * @param activity - The gamification activity
 * @param theme - Optional theme override (defaults to synthwaveTheme)
 */
export function renderNeonDefenderWithTheme(
  activity: GamificationActivity,
  theme: GameTheme = synthwaveTheme
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
  config: { startingLives: number; required: boolean },
  prefix: string,
  trackingClass: string
): string {
  const fullscreenFunctionName = `toggle${prefix.charAt(0).toUpperCase() + prefix.slice(1)}Fullscreen`;

  // Generate initial LED indicators
  let ledsHtml = '';
  for (let i = 0; i < config.startingLives; i++) {
    ledsHtml += `<div class="${prefix}-led active"></div>`;
  }

  return `
    <div class="activity ${prefix}-defender-activity ${trackingClass}" id="activity-${gameId}">
      <div class="${prefix}-cabinet" id="game-${gameId}">
        <!-- Fullscreen Toggle -->
        <button class="${prefix}-fullscreen-btn" id="fullscreen-btn-${gameId}" onclick="${fullscreenFunctionName}_${uniqueId}()" title="Toggle Fullscreen">
          <span class="${prefix}-fs-expand" id="fs-expand-${gameId}">&#x26F6;</span>
          <span class="${prefix}-fs-collapse" id="fs-collapse-${gameId}">&#x26F6;</span>
        </button>

        <!-- Wood Side Panels -->
        <div class="${prefix}-wood-left"></div>
        <div class="${prefix}-wood-right"></div>

        <!-- Top Panel - Brand & Controls -->
        <div class="${prefix}-top-panel">
          <div class="${prefix}-brand">
            <div class="${prefix}-brand-logo">&#x25C8;</div>
            <div class="${prefix}-brand-text">
              <span class="${prefix}-brand-name">SYNTH DEFENDER</span>
              <span class="${prefix}-brand-model">MODEL SD-1977</span>
            </div>
          </div>
          <div class="${prefix}-top-meters">
            <div class="${prefix}-vu-meter">
              <div class="${prefix}-vu-label">SCORE</div>
              <div class="${prefix}-vu-display">
                <div class="${prefix}-vu-bar" id="score-bar-${gameId}"></div>
                <div class="${prefix}-vu-ticks">
                  <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                </div>
              </div>
              <div class="${prefix}-vu-value" id="score-${gameId}">0</div>
            </div>
            <div class="${prefix}-led-cluster" id="lives-${gameId}">
              <div class="${prefix}-led-label">SIGNAL</div>
              <div class="${prefix}-leds">${ledsHtml}</div>
            </div>
          </div>
        </div>

        <!-- Main Display Area -->
        <div class="${prefix}-display-frame">
          <div class="${prefix}-display-bezel">
            <div class="${prefix}-crt-overlay"></div>
            <div class="${prefix}-scanlines"></div>
            <canvas id="canvas-${gameId}" class="${prefix}-canvas"></canvas>
          </div>
        </div>

        <!-- Question Display -->
        <div class="${prefix}-question-strip">
          <div class="${prefix}-patch-left">&#x25CF;&#x2500;&#x2500;&#x2500;</div>
          <div class="${prefix}-question-display" id="question-text-${gameId}">
            <span class="${prefix}-question-label">FREQ:</span>
            <span class="${prefix}-question-text">INITIALIZING...</span>
          </div>
          <div class="${prefix}-patch-right">&#x2500;&#x2500;&#x2500;&#x25CF;</div>
        </div>

        <!-- Reflection Banner -->
        <div class="${prefix}-reflection" id="reflection-banner-${gameId}">
          <div class="${prefix}-reflection-header">
            <span class="${prefix}-reflection-icon">&#x25C9;</span>
            <span>FREQUENCY LOCKED</span>
          </div>
          <div class="${prefix}-reflection-body" id="reflection-text-${gameId}"></div>
        </div>

        <!-- Bottom Panel - Controls -->
        <div class="${prefix}-bottom-panel">
          <div class="${prefix}-control-group">
            <div class="${prefix}-knob-label">&#x25C4; MOVE &#x25BA;</div>
            <div class="${prefix}-control-hint">ARROW KEYS</div>
          </div>
          <div class="${prefix}-oscilloscope" id="oscilloscope-${gameId}">
            <div class="${prefix}-scope-wave"></div>
          </div>
          <div class="${prefix}-control-group">
            <div class="${prefix}-knob-label">&#x25CE; FIRE</div>
            <div class="${prefix}-control-hint">SPACEBAR</div>
          </div>
        </div>

        <!-- Start Screen -->
        <div class="${prefix}-screen ${prefix}-start active" id="start-${gameId}">
          <div class="${prefix}-start-content">
            <div class="${prefix}-start-logo">
              <div class="${prefix}-logo-waves">
                <span>&#x223F;</span><span>&#x223F;</span><span>&#x223F;</span>
              </div>
              <div class="${prefix}-logo-title">SYNTH DEFENDER</div>
              <div class="${prefix}-logo-subtitle">HARMONIC FREQUENCY TRAINER</div>
            </div>
            <div class="${prefix}-instructions">
              <div class="${prefix}-inst-item">
                <span class="${prefix}-inst-key">&#x25C4; &#x25BA;</span>
                <span class="${prefix}-inst-desc">Tune oscillator position</span>
              </div>
              <div class="${prefix}-inst-item">
                <span class="${prefix}-inst-key">SPACE</span>
                <span class="${prefix}-inst-desc">Fire resonance beam</span>
              </div>
              <div class="${prefix}-inst-item">
                <span class="${prefix}-inst-key">TARGET</span>
                <span class="${prefix}-inst-desc">Lock correct frequency</span>
              </div>
            </div>
            ${config.required ? `<div class="${prefix}-required-badge">&#x25C6; CALIBRATION REQUIRED &#x25C6;</div>` : ''}
            <button class="${prefix}-button" onclick="startGame_${uniqueId}()">
              <span class="${prefix}-button-text">&#x25B6; ENGAGE SYSTEM</span>
            </button>
          </div>
        </div>

        <!-- End Screen -->
        <div class="${prefix}-screen ${prefix}-end" id="end-${gameId}">
          <div class="${prefix}-end-content">
            <div class="${prefix}-end-status" id="end-title-${gameId}">SESSION COMPLETE</div>
            <div class="${prefix}-end-score">
              <div class="${prefix}-score-dial">
                <div class="${prefix}-dial-ring"></div>
                <div class="${prefix}-dial-value" id="end-score-value-${gameId}">0</div>
                <div class="${prefix}-dial-label">SCORE</div>
              </div>
              <div class="${prefix}-score-info" id="end-score-${gameId}"></div>
            </div>
            <div class="${prefix}-end-feedback" id="end-feedback-${gameId}"></div>
            <button class="${prefix}-button" onclick="startGame_${uniqueId}()">
              <span class="${prefix}-button-text">&#x21BA; RECALIBRATE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}
