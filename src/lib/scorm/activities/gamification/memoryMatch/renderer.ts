/**
 * Memory Match Renderer
 * Generates HTML using the selected theme
 */

import { GamificationActivity, createRenderContext, GameTheme } from '../core/types';
import { extractConfig, generateGameScript } from './engine';
import { psiLabTheme } from './styles';

/**
 * Renders the Memory Match game HTML
 * @param activity - The gamification activity
 * @param theme - Optional theme override (defaults to psiLabTheme)
 */
export function renderMemoryMatchWithTheme(
  activity: GamificationActivity,
  theme: GameTheme = psiLabTheme
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
  config: { pairs: { id: string }[]; required: boolean },
  prefix: string,
  trackingClass: string
): string {
  return `
    <div class="activity gamification-activity ${trackingClass}" id="activity-${gameId}">
      <div class="${prefix}-lab" id="game-${gameId}">
        <!-- Fullscreen Toggle -->
        <button class="${prefix}-fullscreen-btn" id="fullscreen-btn-${gameId}" onclick="togglePsiFullscreen_${uniqueId}()" title="Toggle Fullscreen">
          <span class="${prefix}-fs-expand" id="fs-expand-${gameId}">⛶</span>
          <span class="${prefix}-fs-collapse" id="fs-collapse-${gameId}">⛶</span>
        </button>

        <!-- Atmospheric Effects -->
        <div class="${prefix}-noise"></div>
        <div class="${prefix}-vignette"></div>
        <div class="${prefix}-scanlines"></div>

        <!-- Header Panel -->
        <div class="${prefix}-header">
          <div class="${prefix}-header-left">
            <div class="${prefix}-logo">
              <div class="${prefix}-logo-icon">◎</div>
              <div class="${prefix}-logo-text">
                <span class="${prefix}-logo-main">PARAPSYCHOLOGY RESEARCH DIVISION</span>
                <span class="${prefix}-logo-sub">COGNITIVE PATTERN RECOGNITION TEST</span>
              </div>
            </div>
            ${config.required ? `<div class="${prefix}-required"><span class="${prefix}-req-dot"></span>MANDATORY EVALUATION</div>` : ''}
          </div>
          <div class="${prefix}-header-right">
            <div class="${prefix}-classification">◆ CONFIDENTIAL ◆</div>
            <div class="${prefix}-date">TEST DATE: <span id="test-date-${gameId}"></span></div>
          </div>
        </div>

        <!-- Status Bar -->
        <div class="${prefix}-status-bar">
          <div class="${prefix}-status-left">
            <div class="${prefix}-indicator">
              <div class="${prefix}-indicator-light" id="status-light-${gameId}"></div>
              <span class="${prefix}-indicator-text" id="status-text-${gameId}">AWAITING INPUT</span>
            </div>
          </div>
          <div class="${prefix}-meters">
            <div class="${prefix}-meter">
              <div class="${prefix}-meter-label">ATTEMPTS</div>
              <div class="${prefix}-meter-display">
                <span class="${prefix}-meter-value" id="moves-${gameId}">000</span>
              </div>
            </div>
            <div class="${prefix}-meter">
              <div class="${prefix}-meter-label">MATCHES</div>
              <div class="${prefix}-meter-display">
                <span class="${prefix}-meter-value" id="matches-${gameId}">0</span>
                <span class="${prefix}-meter-slash">/</span>
                <span class="${prefix}-meter-total">${config.pairs.length}</span>
              </div>
            </div>
            <div class="${prefix}-meter ${prefix}-psi-meter">
              <div class="${prefix}-meter-label">PSI INDEX</div>
              <div class="${prefix}-psi-bar">
                <div class="${prefix}-psi-fill" id="${prefix}-fill-${gameId}"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Testing Area -->
        <div class="${prefix}-main">
          <div class="${prefix}-instructions">
            <span class="${prefix}-inst-icon">☛</span>
            <span class="${prefix}-inst-text">SELECT TWO CARDS TO REVEAL HIDDEN ASSOCIATIONS</span>
          </div>

          <div class="${prefix}-grid-container">
            <div class="${prefix}-grid" id="grid-${gameId}">
              <!-- Cards injected here -->
            </div>
          </div>

          <div class="${prefix}-warning" id="warning-${gameId}">
            <div class="${prefix}-warning-icon">⚠</div>
            <div class="${prefix}-warning-text">PATTERN DISRUPTION IMMINENT — NEURAL INTERFERENCE DETECTED</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="${prefix}-footer">
          <div class="${prefix}-footer-left">
            <span class="${prefix}-form">FORM PSI-7A</span>
            <span class="${prefix}-serial">SERIAL: ${gameId.substring(0, 8).toUpperCase()}</span>
          </div>
          <div class="${prefix}-footer-center">
            <div class="${prefix}-wave" id="wave-${gameId}"></div>
          </div>
          <div class="${prefix}-footer-right">
            <span class="${prefix}-copyright">© INSTITUTE FOR ADVANCED COGNITION</span>
          </div>
        </div>

        <!-- Win Overlay -->
        <div class="${prefix}-overlay" id="overlay-${gameId}">
          <div class="${prefix}-overlay-content">
            <div class="${prefix}-success-icon">✧</div>
            <div class="${prefix}-success-title">TEST COMPLETE</div>
            <div class="${prefix}-success-subtitle">COGNITIVE PATTERN RECOGNITION: VERIFIED</div>
            <div class="${prefix}-results">
              <div class="${prefix}-result-item">
                <span class="${prefix}-result-label">Total Attempts</span>
                <span class="${prefix}-result-value" id="final-moves-${gameId}">0</span>
              </div>
              <div class="${prefix}-result-item">
                <span class="${prefix}-result-label">PSI Rating</span>
                <span class="${prefix}-result-value ${prefix}-rating" id="final-rating-${gameId}">--</span>
              </div>
            </div>
            <div class="${prefix}-stamp">◆ SUBJECT CLEARED ◆</div>
            <button class="${prefix}-button" onclick="initGame_${uniqueId}('${gameId}')">
              <span class="${prefix}-button-text">INITIATE NEW TEST</span>
            </button>
          </div>
        </div>

        <!-- Info Modal (inside lab for fullscreen support) -->
        <div class="${prefix}-modal" id="modal-${gameId}">
          <div class="${prefix}-modal-content">
            <div class="${prefix}-modal-header">
              <div class="${prefix}-modal-icon">◉</div>
              <span>ASSOCIATION CONFIRMED</span>
            </div>
            <div class="${prefix}-modal-body" id="modal-body-${gameId}"></div>
            <div class="${prefix}-modal-footer">
              <button class="${prefix}-button ${prefix}-button-modal" onclick="closeGameModal('${gameId}')">
                <span class="${prefix}-button-text">ACKNOWLEDGE</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
