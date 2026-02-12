/**
 * Battleships Renderer
 * Generates HTML using the selected theme
 */

import { GamificationActivity, createRenderContext, GameTheme } from '../core/types';
import { extractConfig, generateGameScript, BattleshipsConfig } from './engine';
import { coldWarTheme } from './styles';

/**
 * Renders the Battleships game HTML
 * @param activity - The gamification activity
 * @param theme - Optional theme override (defaults to coldWarTheme)
 */
export function renderBattleshipsWithTheme(
  activity: GamificationActivity,
  theme: GameTheme = coldWarTheme
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
  config: BattleshipsConfig,
  prefix: string,
  trackingClass: string
): string {
  return `
    <div class="activity battleships-activity ${trackingClass}" id="activity-${gameId}">
        <div class="${prefix}-console" id="game-${gameId}">
            <!-- Fullscreen Toggle -->
            <button class="${prefix}-fullscreen-btn" id="fullscreen-btn-${gameId}" onclick="toggleFullscreen_${uniqueId}()" title="Toggle Fullscreen">
                <span class="${prefix}-fs-expand" id="fs-expand-${gameId}">⛶</span>
                <span class="${prefix}-fs-collapse" id="fs-collapse-${gameId}">⛶</span>
            </button>

            <!-- CRT Effects Overlay -->
            <div class="${prefix}-crt-overlay"></div>
            <div class="${prefix}-scanlines"></div>
            <div class="${prefix}-flicker"></div>

            <!-- Start Screen -->
            <div class="${prefix}-screen ${prefix}-start active" id="start-${gameId}">
                <div class="${prefix}-start-inner">
                    <div class="${prefix}-logo">
                        <div class="${prefix}-logo-icon">⚓</div>
                        <div class="${prefix}-logo-text">SUBSURFACE<br>COMMAND</div>
                    </div>
                    <div class="${prefix}-classification">◆ CLASSIFIED: OPERATION DEEP STRIKE ◆</div>
                    <div class="${prefix}-terminal">
                        <div class="${prefix}-terminal-line">> INITIALIZING SONAR ARRAY...</div>
                        <div class="${prefix}-terminal-line">> WEAPONS SYSTEMS: ONLINE</div>
                        <div class="${prefix}-terminal-line">> ENEMY FLEET DETECTED: ${config.shipCount} VESSELS</div>
                        <div class="${prefix}-terminal-line">> AWAITING COMMANDER AUTHORIZATION_</div>
                    </div>
                    <div class="${prefix}-orders">
                        <div class="${prefix}-orders-title">STANDING ORDERS</div>
                        <div class="${prefix}-order"><span class="${prefix}-order-num">01</span>STANDARD TORPEDO — Direct strike, single coordinate</div>
                        <div class="${prefix}-order"><span class="${prefix}-order-num">02</span>DEPTH CHARGE — 5-cell radius, requires targeting solution</div>
                        <div class="${prefix}-order"><span class="${prefix}-order-num">03</span>INTEL STREAK — 3 correct solutions unlocks sonar ping</div>
                    </div>
                    <button class="${prefix}-button ${prefix}-button-primary" onclick="startGame_${uniqueId}()">
                        <span class="${prefix}-button-inner">BEGIN OPERATION</span>
                    </button>
                    <div class="${prefix}-warning-strip">⚠ INCORRECT TARGETING SOLUTION = WEAPON MALFUNCTION</div>
                </div>
            </div>

            <!-- Deployment Screen -->
            <div class="${prefix}-screen ${prefix}-deploy" id="deploy-screen-${gameId}">
                <div class="${prefix}-deploy-container">
                    <div class="${prefix}-deploy-header">
                        <div class="${prefix}-deploy-title">FLEET DEPLOYMENT</div>
                        <div class="${prefix}-deploy-subtitle">Position your vessels before engagement</div>
                    </div>
                    <div class="${prefix}-deploy-main">
                        <div class="${prefix}-deploy-grid-area">
                            <div class="${prefix}-deploy-grid-wrapper">
                                <div class="${prefix}-sonar-screen">
                                    <div class="${prefix}-sonar-grid" id="deploy-grid-${gameId}"></div>
                                </div>
                            </div>
                        </div>
                        <div class="${prefix}-deploy-controls">
                            <div class="${prefix}-deploy-instructions">
                                <div class="${prefix}-instruction-item"><span class="${prefix}-key">CLICK</span> ship to select</div>
                                <div class="${prefix}-instruction-item"><span class="${prefix}-key">CLICK</span> grid to place</div>
                                <div class="${prefix}-instruction-item"><span class="${prefix}-key">R</span> or button to rotate</div>
                            </div>
                            <div class="${prefix}-ship-selector" id="ship-selector-${gameId}"></div>
                            <button class="${prefix}-rotate-btn" id="rotate-btn-${gameId}" onclick="rotateShip_${uniqueId}()">
                                <span class="${prefix}-rotate-icon">↻</span> ROTATE SHIP
                            </button>
                            <button class="${prefix}-button ${prefix}-button-primary ${prefix}-deploy-confirm" id="confirm-deploy-${gameId}" onclick="confirmDeploy_${uniqueId}()">
                                <span class="${prefix}-button-inner">CONFIRM DEPLOYMENT</span>
                            </button>
                            <button class="${prefix}-randomize-btn" onclick="randomizePlacement_${uniqueId}()">
                                ⟳ RANDOMIZE
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Game Screen -->
            <div class="${prefix}-screen ${prefix}-game" id="game-screen-${gameId}">
                <!-- Top Status Bar -->
                <div class="${prefix}-topbar">
                    <div class="${prefix}-status-lamp" id="lamp-${gameId}">
                        <div class="${prefix}-lamp-glow"></div>
                    </div>
                    <div class="${prefix}-commander-status" id="turn-${gameId}">COMMANDER ON DECK</div>
                    <div class="${prefix}-teletype" id="status-${gameId}">
                        <span class="${prefix}-teletype-text">SYSTEMS NOMINAL</span>
                    </div>
                    <div class="${prefix}-gauges">
                        <div class="${prefix}-gauge">
                            <div class="${prefix}-gauge-label">TURN</div>
                            <div class="${prefix}-gauge-value" id="turn-count-${gameId}">000</div>
                        </div>
                        <div class="${prefix}-gauge">
                            <div class="${prefix}-gauge-label">ACC%</div>
                            <div class="${prefix}-gauge-value" id="accuracy-${gameId}">100</div>
                        </div>
                    </div>
                </div>

                <!-- Main Operations Area -->
                <div class="${prefix}-operations">
                    <!-- Left: Player Fleet Display -->
                    <div class="${prefix}-display ${prefix}-display-left">
                        <div class="${prefix}-display-frame">
                            <div class="${prefix}-display-header">
                                <span class="${prefix}-display-title">OUR FLEET</span>
                                <span class="${prefix}-display-count" id="player-fleet-${gameId}">●●●●</span>
                            </div>
                            <div class="${prefix}-sonar-screen">
                                <div class="${prefix}-sonar-grid" id="player-grid-${gameId}"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Center: Control Panel -->
                    <div class="${prefix}-control-panel">
                        <div class="${prefix}-panel-section">
                            <div class="${prefix}-section-label">ORDNANCE SELECT</div>
                            <div class="${prefix}-weapon-rack">
                                <button class="${prefix}-weapon active" id="btn-std-${gameId}" onclick="selectWeapon_${uniqueId}('standard')">
                                    <div class="${prefix}-weapon-indicator"></div>
                                    <div class="${prefix}-weapon-body">
                                        <div class="${prefix}-weapon-icon">▶</div>
                                        <div class="${prefix}-weapon-info">
                                            <div class="${prefix}-weapon-name">TORPEDO</div>
                                            <div class="${prefix}-weapon-desc">SINGLE TARGET</div>
                                        </div>
                                    </div>
                                </button>
                                <button class="${prefix}-weapon" id="btn-cluster-${gameId}" onclick="selectWeapon_${uniqueId}('cluster')">
                                    <div class="${prefix}-weapon-indicator"></div>
                                    <div class="${prefix}-weapon-body">
                                        <div class="${prefix}-weapon-icon">✦</div>
                                        <div class="${prefix}-weapon-info">
                                            <div class="${prefix}-weapon-name">DEPTH CHARGE</div>
                                            <div class="${prefix}-weapon-desc">SOLUTION REQ.</div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div class="${prefix}-panel-section ${prefix}-intel-section">
                            <div class="${prefix}-section-label">INTEL UPLINK</div>
                            <div class="${prefix}-intel-meter">
                                <div class="${prefix}-intel-pip" id="pip1-${gameId}"></div>
                                <div class="${prefix}-intel-pip" id="pip2-${gameId}"></div>
                                <div class="${prefix}-intel-pip" id="pip3-${gameId}"></div>
                            </div>
                            <div class="${prefix}-intel-ready" id="uplink-${gameId}">◉ SONAR PING READY</div>
                        </div>

                        <div class="${prefix}-oscilloscope">
                            <div class="${prefix}-wave" id="wave-${gameId}"></div>
                        </div>
                    </div>

                    <!-- Right: Enemy Radar Display -->
                    <div class="${prefix}-display ${prefix}-display-right">
                        <div class="${prefix}-display-frame ${prefix}-radar-frame">
                            <div class="${prefix}-display-header">
                                <span class="${prefix}-display-title">HOSTILE SECTOR</span>
                                <span class="${prefix}-display-count" id="enemy-fleet-${gameId}">◆◆◆◆</span>
                            </div>
                            <div class="${prefix}-sonar-screen ${prefix}-hostile">
                                <div class="${prefix}-radar-sweep" id="sweep-${gameId}"></div>
                                <div class="${prefix}-sonar-grid" id="enemy-grid-${gameId}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quiz Modal -->
            <div class="${prefix}-screen ${prefix}-modal" id="quiz-modal-${gameId}">
                <div class="${prefix}-modal-console">
                    <div class="${prefix}-modal-border">
                        <div class="${prefix}-modal-header">
                            <div class="${prefix}-modal-lamp"></div>
                            <span id="quiz-header-${gameId}">TARGETING SOLUTION REQUIRED</span>
                        </div>
                        <div class="${prefix}-modal-body">
                            <div class="${prefix}-question-display">
                                <div class="${prefix}-question-text" id="quiz-question-${gameId}"></div>
                            </div>
                            <div class="${prefix}-options-grid" id="quiz-options-${gameId}"></div>
                            <div class="${prefix}-feedback-panel" id="quiz-feedback-${gameId}">
                                <div class="${prefix}-feedback-content" id="feedback-msg-${gameId}"></div>
                                <button class="${prefix}-button ${prefix}-button-confirm" id="feedback-btn-${gameId}" onclick="resolveQuiz_${uniqueId}()">CONFIRM</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- End Screen -->
            <div class="${prefix}-screen ${prefix}-end" id="end-${gameId}">
                <div class="${prefix}-end-console">
                    <div class="${prefix}-end-header" id="end-title-${gameId}">OPERATION COMPLETE</div>
                    <div class="${prefix}-end-stats">
                        <div class="${prefix}-stat-dial">
                            <div class="${prefix}-dial-ring"></div>
                            <div class="${prefix}-dial-value" id="stat-turns-${gameId}">0</div>
                            <div class="${prefix}-dial-label">TURNS</div>
                        </div>
                        <div class="${prefix}-stat-dial">
                            <div class="${prefix}-dial-ring"></div>
                            <div class="${prefix}-dial-value" id="stat-acc-${gameId}">0%</div>
                            <div class="${prefix}-dial-label">ACCURACY</div>
                        </div>
                        <div class="${prefix}-stat-dial">
                            <div class="${prefix}-dial-ring"></div>
                            <div class="${prefix}-dial-value" id="stat-clusters-${gameId}">0</div>
                            <div class="${prefix}-dial-label">DEPTH CH.</div>
                        </div>
                        <div class="${prefix}-stat-dial">
                            <div class="${prefix}-dial-ring"></div>
                            <div class="${prefix}-dial-value" id="stat-rating-${gameId}">--</div>
                            <div class="${prefix}-dial-label">RATING</div>
                        </div>
                    </div>
                    <div class="${prefix}-debrief">
                        <div class="${prefix}-debrief-header">◆ MISSION DEBRIEF ◆</div>
                        <div class="${prefix}-debrief-list" id="intel-log-${gameId}"></div>
                    </div>
                    <button class="${prefix}-button ${prefix}-button-primary" onclick="startGame_${uniqueId}()">
                        <span class="${prefix}-button-inner">NEW OPERATION</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
  `;
}
