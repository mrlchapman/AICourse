import { Activity } from '../types';

export function renderBattleships(activity: Extract<Activity, { type: 'gamification' }>): string {
    const questions = activity.config?.battleshipsQuestions || [];
    const required = activity.config?.required || false;
    const gridSize = activity.config?.gridSize || 8;
    const shipCount = activity.config?.shipCount || 4;
    const trackingClass = required ? 'interactive-card' : '';
    const uniqueId = activity.id.replace(/-/g, '_');
    const gameId = activity.id;
    const questionsJson = JSON.stringify(questions);

    return `
    <div class="activity battleships-activity ${trackingClass}" id="activity-${gameId}">
        <div class="bs-console" id="game-${gameId}">
            <!-- Fullscreen Toggle -->
            <button class="bs-fullscreen-btn" id="fullscreen-btn-${gameId}" onclick="toggleFullscreen_${uniqueId}()" title="Toggle Fullscreen">
                <span class="bs-fs-expand" id="fs-expand-${gameId}">⛶</span>
                <span class="bs-fs-collapse" id="fs-collapse-${gameId}">⛶</span>
            </button>

            <!-- CRT Effects Overlay -->
            <div class="bs-crt-overlay"></div>
            <div class="bs-scanlines"></div>
            <div class="bs-flicker"></div>

            <!-- Start Screen -->
            <div class="bs-screen bs-start active" id="start-${gameId}">
                <div class="bs-start-inner">
                    <div class="bs-logo">
                        <div class="bs-logo-icon">⚓</div>
                        <div class="bs-logo-text">SUBSURFACE<br>COMMAND</div>
                    </div>
                    <div class="bs-classification">◆ CLASSIFIED: OPERATION DEEP STRIKE ◆</div>
                    <div class="bs-terminal">
                        <div class="bs-terminal-line">> INITIALIZING SONAR ARRAY...</div>
                        <div class="bs-terminal-line">> WEAPONS SYSTEMS: ONLINE</div>
                        <div class="bs-terminal-line">> ENEMY FLEET DETECTED: ${shipCount} VESSELS</div>
                        <div class="bs-terminal-line">> AWAITING COMMANDER AUTHORIZATION_</div>
                    </div>
                    <div class="bs-orders">
                        <div class="bs-orders-title">STANDING ORDERS</div>
                        <div class="bs-order"><span class="bs-order-num">01</span>STANDARD TORPEDO — Direct strike, single coordinate</div>
                        <div class="bs-order"><span class="bs-order-num">02</span>DEPTH CHARGE — 5-cell radius, requires targeting solution</div>
                        <div class="bs-order"><span class="bs-order-num">03</span>INTEL STREAK — 3 correct solutions unlocks sonar ping</div>
                    </div>
                    <button class="bs-button bs-button-primary" onclick="startGame_${uniqueId}()">
                        <span class="bs-button-inner">BEGIN OPERATION</span>
                    </button>
                    <div class="bs-warning-strip">⚠ INCORRECT TARGETING SOLUTION = WEAPON MALFUNCTION</div>
                </div>
            </div>

            <!-- Deployment Screen -->
            <div class="bs-screen bs-deploy" id="deploy-screen-${gameId}">
                <div class="bs-deploy-container">
                    <div class="bs-deploy-header">
                        <div class="bs-deploy-title">FLEET DEPLOYMENT</div>
                        <div class="bs-deploy-subtitle">Position your vessels before engagement</div>
                    </div>
                    <div class="bs-deploy-main">
                        <div class="bs-deploy-grid-area">
                            <div class="bs-deploy-grid-wrapper">
                                <div class="bs-sonar-screen">
                                    <div class="bs-sonar-grid" id="deploy-grid-${gameId}"></div>
                                </div>
                            </div>
                        </div>
                        <div class="bs-deploy-controls">
                            <div class="bs-deploy-instructions">
                                <div class="bs-instruction-item"><span class="bs-key">CLICK</span> ship to select</div>
                                <div class="bs-instruction-item"><span class="bs-key">CLICK</span> grid to place</div>
                                <div class="bs-instruction-item"><span class="bs-key">R</span> or button to rotate</div>
                            </div>
                            <div class="bs-ship-selector" id="ship-selector-${gameId}"></div>
                            <button class="bs-rotate-btn" id="rotate-btn-${gameId}" onclick="rotateShip_${uniqueId}()">
                                <span class="bs-rotate-icon">↻</span> ROTATE SHIP
                            </button>
                            <button class="bs-button bs-button-primary bs-deploy-confirm" id="confirm-deploy-${gameId}" onclick="confirmDeploy_${uniqueId}()">
                                <span class="bs-button-inner">CONFIRM DEPLOYMENT</span>
                            </button>
                            <button class="bs-randomize-btn" onclick="randomizePlacement_${uniqueId}()">
                                ⟳ RANDOMIZE
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Game Screen -->
            <div class="bs-screen bs-game" id="game-screen-${gameId}">
                <!-- Top Status Bar -->
                <div class="bs-topbar">
                    <div class="bs-status-lamp" id="lamp-${gameId}">
                        <div class="bs-lamp-glow"></div>
                    </div>
                    <div class="bs-commander-status" id="turn-${gameId}">COMMANDER ON DECK</div>
                    <div class="bs-teletype" id="status-${gameId}">
                        <span class="bs-teletype-text">SYSTEMS NOMINAL</span>
                    </div>
                    <div class="bs-gauges">
                        <div class="bs-gauge">
                            <div class="bs-gauge-label">TURN</div>
                            <div class="bs-gauge-value" id="turn-count-${gameId}">000</div>
                        </div>
                        <div class="bs-gauge">
                            <div class="bs-gauge-label">ACC%</div>
                            <div class="bs-gauge-value" id="accuracy-${gameId}">100</div>
                        </div>
                    </div>
                </div>

                <!-- Main Operations Area -->
                <div class="bs-operations">
                    <!-- Left: Player Fleet Display -->
                    <div class="bs-display bs-display-left">
                        <div class="bs-display-frame">
                            <div class="bs-display-header">
                                <span class="bs-display-title">OUR FLEET</span>
                                <span class="bs-display-count" id="player-fleet-${gameId}">●●●●</span>
                            </div>
                            <div class="bs-sonar-screen">
                                <div class="bs-sonar-grid" id="player-grid-${gameId}"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Center: Control Panel -->
                    <div class="bs-control-panel">
                        <div class="bs-panel-section">
                            <div class="bs-section-label">ORDNANCE SELECT</div>
                            <div class="bs-weapon-rack">
                                <button class="bs-weapon active" id="btn-std-${gameId}" onclick="selectWeapon_${uniqueId}('standard')">
                                    <div class="bs-weapon-indicator"></div>
                                    <div class="bs-weapon-body">
                                        <div class="bs-weapon-icon">▶</div>
                                        <div class="bs-weapon-info">
                                            <div class="bs-weapon-name">TORPEDO</div>
                                            <div class="bs-weapon-desc">SINGLE TARGET</div>
                                        </div>
                                    </div>
                                </button>
                                <button class="bs-weapon" id="btn-cluster-${gameId}" onclick="selectWeapon_${uniqueId}('cluster')">
                                    <div class="bs-weapon-indicator"></div>
                                    <div class="bs-weapon-body">
                                        <div class="bs-weapon-icon">✦</div>
                                        <div class="bs-weapon-info">
                                            <div class="bs-weapon-name">DEPTH CHARGE</div>
                                            <div class="bs-weapon-desc">SOLUTION REQ.</div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div class="bs-panel-section bs-intel-section">
                            <div class="bs-section-label">INTEL UPLINK</div>
                            <div class="bs-intel-meter">
                                <div class="bs-intel-pip" id="pip1-${gameId}"></div>
                                <div class="bs-intel-pip" id="pip2-${gameId}"></div>
                                <div class="bs-intel-pip" id="pip3-${gameId}"></div>
                            </div>
                            <div class="bs-intel-ready" id="uplink-${gameId}">◉ SONAR PING READY</div>
                        </div>

                        <div class="bs-oscilloscope">
                            <div class="bs-wave" id="wave-${gameId}"></div>
                        </div>
                    </div>

                    <!-- Right: Enemy Radar Display -->
                    <div class="bs-display bs-display-right">
                        <div class="bs-display-frame bs-radar-frame">
                            <div class="bs-display-header">
                                <span class="bs-display-title">HOSTILE SECTOR</span>
                                <span class="bs-display-count" id="enemy-fleet-${gameId}">◆◆◆◆</span>
                            </div>
                            <div class="bs-sonar-screen bs-hostile">
                                <div class="bs-radar-sweep" id="sweep-${gameId}"></div>
                                <div class="bs-sonar-grid" id="enemy-grid-${gameId}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quiz Modal -->
            <div class="bs-screen bs-modal" id="quiz-modal-${gameId}">
                <div class="bs-modal-console">
                    <div class="bs-modal-border">
                        <div class="bs-modal-header">
                            <div class="bs-modal-lamp"></div>
                            <span id="quiz-header-${gameId}">TARGETING SOLUTION REQUIRED</span>
                        </div>
                        <div class="bs-modal-body">
                            <div class="bs-question-display">
                                <div class="bs-question-text" id="quiz-question-${gameId}"></div>
                            </div>
                            <div class="bs-options-grid" id="quiz-options-${gameId}"></div>
                            <div class="bs-feedback-panel" id="quiz-feedback-${gameId}">
                                <div class="bs-feedback-content" id="feedback-msg-${gameId}"></div>
                                <button class="bs-button bs-button-confirm" id="feedback-btn-${gameId}" onclick="resolveQuiz_${uniqueId}()">CONFIRM</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- End Screen -->
            <div class="bs-screen bs-end" id="end-${gameId}">
                <div class="bs-end-console">
                    <div class="bs-end-header" id="end-title-${gameId}">OPERATION COMPLETE</div>
                    <div class="bs-end-stats">
                        <div class="bs-stat-dial">
                            <div class="bs-dial-ring"></div>
                            <div class="bs-dial-value" id="stat-turns-${gameId}">0</div>
                            <div class="bs-dial-label">TURNS</div>
                        </div>
                        <div class="bs-stat-dial">
                            <div class="bs-dial-ring"></div>
                            <div class="bs-dial-value" id="stat-acc-${gameId}">0%</div>
                            <div class="bs-dial-label">ACCURACY</div>
                        </div>
                        <div class="bs-stat-dial">
                            <div class="bs-dial-ring"></div>
                            <div class="bs-dial-value" id="stat-clusters-${gameId}">0</div>
                            <div class="bs-dial-label">DEPTH CH.</div>
                        </div>
                        <div class="bs-stat-dial">
                            <div class="bs-dial-ring"></div>
                            <div class="bs-dial-value" id="stat-rating-${gameId}">--</div>
                            <div class="bs-dial-label">RATING</div>
                        </div>
                    </div>
                    <div class="bs-debrief">
                        <div class="bs-debrief-header">◆ MISSION DEBRIEF ◆</div>
                        <div class="bs-debrief-list" id="intel-log-${gameId}"></div>
                    </div>
                    <button class="bs-button bs-button-primary" onclick="startGame_${uniqueId}()">
                        <span class="bs-button-inner">NEW OPERATION</span>
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script type="application/json" id="questions-data-${gameId}">${questionsJson.replace(/</g, '\\u003c').replace(/>/g, '\\u003e')}</script>

    <script>
    (function() {
        const gameId = '${gameId}';
        const uniqueId = '${uniqueId}';
        const GRID_SIZE = ${gridSize};
        const SHIP_SIZES = ${JSON.stringify(Array.from({ length: shipCount }, (_, i) => Math.max(2, 5 - i)))};
        const questionsEl = document.getElementById('questions-data-' + gameId);
        const QUESTIONS = questionsEl ? JSON.parse(questionsEl.textContent || '[]') : [];

        let playerGrid = [], enemyGrid = [];
        let playerShips = [], enemyShips = [];
        let isPlayerTurn = false;
        let currentWeapon = 'standard';
        let streak = 0;
        let turns = 0;
        let clusterCount = 0;
        let correctAnswers = 0, totalQuestions = 0;
        let pendingTarget = null;
        let pendingAction = null;
        let intelLog = [];
        let botHuntStack = [];
        let qIdx = 0;
        let radarTarget = null;

        // Deployment phase state
        let deploymentShips = [];
        let selectedShipIndex = -1;
        let shipOrientation = 'horizontal'; // or 'vertical'

        // Fullscreen state
        let isFullscreen = false;

        // Fullscreen toggle - use CSS fullscreen for reliability in iframes
        window['toggleFullscreen_' + uniqueId] = function() {
            const container = document.getElementById('game-' + gameId);
            const activity = document.getElementById('activity-' + gameId);
            if (!container || !activity) return;
            if (!isFullscreen) {
                enableCssFullscreen();
            } else {
                disableCssFullscreen();
            }
        };

        function enableCssFullscreen() {
            const container = document.getElementById('game-' + gameId);
            const activity = document.getElementById('activity-' + gameId);
            if (!container || !activity) return;
            container.classList.add('bs-maximized');
            activity.classList.add('bs-activity-maximized');
            document.body.style.overflow = 'hidden';
            isFullscreen = true;
            updateFullscreenButton();
        }

        function disableCssFullscreen() {
            const container = document.getElementById('game-' + gameId);
            const activity = document.getElementById('activity-' + gameId);
            if (!container || !activity) return;
            container.classList.remove('bs-maximized');
            activity.classList.remove('bs-activity-maximized');
            document.body.style.overflow = '';
            isFullscreen = false;
            updateFullscreenButton();
        }

        function updateFullscreenButton() {
            const expandIcon = document.getElementById('fs-expand-' + gameId);
            const collapseIcon = document.getElementById('fs-collapse-' + gameId);
            if (expandIcon && collapseIcon) {
                expandIcon.style.display = isFullscreen ? 'none' : 'block';
                collapseIcon.style.display = isFullscreen ? 'block' : 'none';
            }
        }

        // ESC key to exit CSS fullscreen
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isFullscreen) {
                disableCssFullscreen();
            }
        });

        // Oscilloscope animation
        function animateWave() {
            const wave = document.getElementById('wave-' + gameId);
            if (!wave) return;
            let phase = 0;
            setInterval(() => {
                phase += 0.15;
                const amplitude = isPlayerTurn ? 20 : 8;
                const freq = isPlayerTurn ? 0.3 : 0.15;
                let path = 'M0,25';
                for (let x = 0; x <= 100; x += 2) {
                    const y = 25 + Math.sin((x * freq) + phase) * amplitude * Math.sin(x * 0.05);
                    path += ' L' + x + ',' + y;
                }
                wave.innerHTML = '<svg viewBox="0 0 100 50" preserveAspectRatio="none"><path d="' + path + '" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
            }, 50);
        }

        // Start deployment phase
        window['startGame_' + uniqueId] = function() {
            document.getElementById('start-' + gameId).classList.remove('active');
            document.getElementById('end-' + gameId).classList.remove('active');
            document.getElementById('game-screen-' + gameId).classList.remove('active');
            document.getElementById('deploy-screen-' + gameId).classList.add('active');

            initGrids();
            initDeployment();
        };

        function initDeployment() {
            // Initialize deployment ships with random placement
            deploymentShips = SHIP_SIZES.map((size, idx) => ({
                id: idx,
                size: size,
                placed: false,
                row: -1,
                col: -1,
                horizontal: true
            }));

            selectedShipIndex = -1;
            shipOrientation = 'horizontal';

            // Random initial placement
            randomizeDeployment();
            renderDeploymentGrid();
            renderShipSelector();

            // Keyboard listener for rotation
            document.addEventListener('keydown', handleDeployKeypress);
        }

        function handleDeployKeypress(e) {
            if (e.key === 'r' || e.key === 'R') {
                rotateShip_internal();
            }
        }

        function randomizeDeployment() {
            // Clear grid
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    playerGrid[r][c] = { hasShip: false, hit: false, shipId: -1 };
                }
            }

            // Place each ship randomly
            deploymentShips.forEach((ship, idx) => {
                let placed = false;
                let attempts = 0;
                while (!placed && attempts < 100) {
                    attempts++;
                    const r = Math.floor(Math.random() * GRID_SIZE);
                    const c = Math.floor(Math.random() * GRID_SIZE);
                    const horiz = Math.random() > 0.5;
                    if (canPlaceDeployShip(r, c, ship.size, horiz, idx)) {
                        placeDeployShip(idx, r, c, horiz);
                        placed = true;
                    }
                }
            });
        }

        window['randomizePlacement_' + uniqueId] = function() {
            randomizeDeployment();
            selectedShipIndex = -1;
            renderDeploymentGrid();
            renderShipSelector();
        };

        function canPlaceDeployShip(row, col, size, horizontal, excludeShipId) {
            if (horizontal && col + size > GRID_SIZE) return false;
            if (!horizontal && row + size > GRID_SIZE) return false;

            for (let i = 0; i < size; i++) {
                const r = horizontal ? row : row + i;
                const c = horizontal ? col + i : col;
                const cell = playerGrid[r][c];
                if (cell.hasShip && cell.shipId !== excludeShipId) return false;
            }
            return true;
        }

        function placeDeployShip(shipIdx, row, col, horizontal) {
            const ship = deploymentShips[shipIdx];

            // Clear old position
            if (ship.placed) {
                for (let r = 0; r < GRID_SIZE; r++) {
                    for (let c = 0; c < GRID_SIZE; c++) {
                        if (playerGrid[r][c].shipId === shipIdx) {
                            playerGrid[r][c] = { hasShip: false, hit: false, shipId: -1 };
                        }
                    }
                }
            }

            // Place at new position
            for (let i = 0; i < ship.size; i++) {
                const r = horizontal ? row : row + i;
                const c = horizontal ? col + i : col;
                playerGrid[r][c] = { hasShip: true, hit: false, shipId: shipIdx };
            }

            ship.placed = true;
            ship.row = row;
            ship.col = col;
            ship.horizontal = horizontal;
        }

        function renderDeploymentGrid() {
            const el = document.getElementById('deploy-grid-' + gameId);
            el.innerHTML = '';
            el.style.gridTemplateColumns = 'repeat(' + GRID_SIZE + ', 1fr)';

            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'bs-cell bs-deploy-cell';
                    const data = playerGrid[r][c];

                    if (data.hasShip) {
                        cell.classList.add('ship');
                        if (data.shipId === selectedShipIndex) {
                            cell.classList.add('selected');
                        }
                    }

                    cell.onclick = () => handleDeployClick(r, c);
                    cell.onmouseenter = () => handleDeployHover(r, c);
                    cell.onmouseleave = () => clearDeployHighlights();

                    cell.dataset.r = r;
                    cell.dataset.c = c;
                    el.appendChild(cell);
                }
            }
        }

        function handleDeployClick(r, c) {
            const cell = playerGrid[r][c];

            // If clicking on a ship, select it
            if (cell.hasShip) {
                selectedShipIndex = cell.shipId;
                shipOrientation = deploymentShips[cell.shipId].horizontal ? 'horizontal' : 'vertical';
                renderDeploymentGrid();
                renderShipSelector();
                return;
            }

            // If a ship is selected, try to place it
            if (selectedShipIndex >= 0) {
                const ship = deploymentShips[selectedShipIndex];
                const horiz = shipOrientation === 'horizontal';
                if (canPlaceDeployShip(r, c, ship.size, horiz, selectedShipIndex)) {
                    placeDeployShip(selectedShipIndex, r, c, horiz);
                    renderDeploymentGrid();
                    renderShipSelector();
                }
            }
        }

        function handleDeployHover(r, c) {
            clearDeployHighlights();
            if (selectedShipIndex < 0) return;

            const ship = deploymentShips[selectedShipIndex];
            const horiz = shipOrientation === 'horizontal';
            const canPlace = canPlaceDeployShip(r, c, ship.size, horiz, selectedShipIndex);

            for (let i = 0; i < ship.size; i++) {
                const hr = horiz ? r : r + i;
                const hc = horiz ? c + i : c;
                if (hr < GRID_SIZE && hc < GRID_SIZE) {
                    const cell = document.querySelector('#deploy-grid-' + gameId + ' .bs-cell[data-r="' + hr + '"][data-c="' + hc + '"]');
                    if (cell) {
                        cell.classList.add(canPlace ? 'preview-valid' : 'preview-invalid');
                    }
                }
            }
        }

        function clearDeployHighlights() {
            document.querySelectorAll('#deploy-grid-' + gameId + ' .bs-cell').forEach(c => {
                c.classList.remove('preview-valid', 'preview-invalid');
            });
        }

        function renderShipSelector() {
            const el = document.getElementById('ship-selector-' + gameId);
            el.innerHTML = '';

            deploymentShips.forEach((ship, idx) => {
                const btn = document.createElement('button');
                btn.className = 'bs-ship-btn' + (idx === selectedShipIndex ? ' selected' : '');

                let shipVisual = '';
                for (let i = 0; i < ship.size; i++) {
                    shipVisual += '<span class="bs-ship-segment"></span>';
                }

                btn.innerHTML = '<div class="bs-ship-visual">' + shipVisual + '</div><div class="bs-ship-label">Ship ' + (idx + 1) + ' (' + ship.size + ')</div>';
                btn.onclick = () => {
                    selectedShipIndex = idx;
                    shipOrientation = ship.horizontal ? 'horizontal' : 'vertical';
                    renderDeploymentGrid();
                    renderShipSelector();
                };
                el.appendChild(btn);
            });
        }

        function rotateShip_internal() {
            if (selectedShipIndex < 0) return;

            const ship = deploymentShips[selectedShipIndex];
            const newHoriz = !ship.horizontal;
            shipOrientation = newHoriz ? 'horizontal' : 'vertical';

            // If placed, try to rotate in place
            if (ship.placed) {
                if (canPlaceDeployShip(ship.row, ship.col, ship.size, newHoriz, selectedShipIndex)) {
                    placeDeployShip(selectedShipIndex, ship.row, ship.col, newHoriz);
                }
            }

            renderDeploymentGrid();
        }

        window['rotateShip_' + uniqueId] = rotateShip_internal;

        window['confirmDeploy_' + uniqueId] = function() {
            // Check all ships are placed
            const allPlaced = deploymentShips.every(s => s.placed);
            if (!allPlaced) return;

            // Remove keyboard listener
            document.removeEventListener('keydown', handleDeployKeypress);

            // Transfer deployment to actual game
            playerShips = deploymentShips.map(s => ({ size: s.size, hits: 0, sunk: false }));

            // Initialize enemy
            placeShips(enemyGrid, enemyShips);

            // Start the game
            document.getElementById('deploy-screen-' + gameId).classList.remove('active');
            document.getElementById('game-screen-' + gameId).classList.add('active');

            streak = 0;
            turns = 0;
            clusterCount = 0;
            correctAnswers = 0;
            totalQuestions = 0;
            intelLog = [];
            botHuntStack = [];
            currentWeapon = 'standard';
            radarTarget = null;

            renderGrids();
            updateUI();
            setTurn(true);
            setStatus('AWAITING TARGETING COORDINATES');
            animateWave();
        };

        function initGrids() {
            playerGrid = []; enemyGrid = [];
            playerShips = []; enemyShips = [];
            for(let r = 0; r < GRID_SIZE; r++) {
                playerGrid[r] = []; enemyGrid[r] = [];
                for(let c = 0; c < GRID_SIZE; c++) {
                    playerGrid[r][c] = { hasShip: false, hit: false, shipId: -1 };
                    enemyGrid[r][c] = { hasShip: false, hit: false, shipId: -1 };
                }
            }
        }

        function placeShips(grid, ships) {
            SHIP_SIZES.forEach((size, idx) => {
                let placed = false;
                let attempts = 0;
                while(!placed && attempts < 100) {
                    attempts++;
                    const r = Math.floor(Math.random() * GRID_SIZE);
                    const c = Math.floor(Math.random() * GRID_SIZE);
                    const horiz = Math.random() > 0.5;
                    if(canPlace(grid, r, c, size, horiz)) {
                        for(let i = 0; i < size; i++) {
                            if(horiz) grid[r][c + i] = { hasShip: true, hit: false, shipId: idx };
                            else grid[r + i][c] = { hasShip: true, hit: false, shipId: idx };
                        }
                        ships.push({ size, hits: 0, sunk: false });
                        placed = true;
                    }
                }
            });
        }

        function canPlace(grid, r, c, size, horiz) {
            if(horiz && c + size > GRID_SIZE) return false;
            if(!horiz && r + size > GRID_SIZE) return false;
            for(let i = 0; i < size; i++) {
                if(grid[horiz ? r : r + i][horiz ? c + i : c].hasShip) return false;
            }
            return true;
        }

        function renderGrids() {
            renderGrid('player-grid-' + gameId, playerGrid, true);
            renderGrid('enemy-grid-' + gameId, enemyGrid, false);
            updateFleetIndicators();
        }

        function updateFleetIndicators() {
            const pAlive = playerShips.filter(s => !s.sunk).length;
            const eAlive = enemyShips.filter(s => !s.sunk).length;

            let pIndicator = '';
            for (let i = 0; i < SHIP_SIZES.length; i++) {
                pIndicator += (i < pAlive) ? '●' : '○';
            }

            let eIndicator = '';
            for (let i = 0; i < SHIP_SIZES.length; i++) {
                eIndicator += (i < eAlive) ? '◆' : '◇';
            }

            document.getElementById('player-fleet-' + gameId).innerText = pIndicator;
            document.getElementById('enemy-fleet-' + gameId).innerText = eIndicator;
        }

        function renderGrid(elId, grid, isPlayer) {
            const el = document.getElementById(elId);
            el.innerHTML = '';
            el.style.gridTemplateColumns = 'repeat(' + GRID_SIZE + ', 1fr)';

            for(let r = 0; r < GRID_SIZE; r++) {
                for(let c = 0; c < GRID_SIZE; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'bs-cell';
                    const data = grid[r][c];

                    if(isPlayer && data.hasShip) cell.classList.add('ship');
                    if(!isPlayer) cell.classList.add('fog');

                    if(!isPlayer && radarTarget && radarTarget.r === r && radarTarget.c === c) {
                        cell.classList.add('pinged');
                    }

                    if(data.hit) {
                        cell.classList.remove('fog');
                        if(data.hasShip) {
                            cell.classList.add('hit');
                            const ships = isPlayer ? playerShips : enemyShips;
                            if(ships[data.shipId] && ships[data.shipId].sunk) cell.classList.add('sunk');
                        } else {
                            cell.classList.add('miss');
                        }
                    }

                    if(!isPlayer) {
                        cell.onclick = () => handleCellClick(r, c);
                        cell.onmouseenter = () => handleHover(r, c);
                        cell.onmouseleave = () => clearHighlights();
                    }

                    cell.dataset.r = r;
                    cell.dataset.c = c;
                    el.appendChild(cell);
                }
            }
        }

        function handleHover(r, c) {
            if(!isPlayerTurn || enemyGrid[r][c].hit) return;
            clearHighlights();

            const targets = currentWeapon === 'cluster' ? getClusterCoords(r, c) : [{r, c}];
            targets.forEach(t => {
                const cell = getEnemyCell(t.r, t.c);
                if(cell && !enemyGrid[t.r][t.c].hit) {
                    cell.classList.add(currentWeapon === 'cluster' ? 'target-cluster' : 'target');
                }
            });
        }

        function clearHighlights() {
            document.querySelectorAll('#enemy-grid-' + gameId + ' .bs-cell').forEach(c => {
                c.classList.remove('target', 'target-cluster');
            });
        }

        function getEnemyCell(r, c) {
            return document.querySelector('#enemy-grid-' + gameId + ' .bs-cell[data-r="' + r + '"][data-c="' + c + '"]');
        }

        function getClusterCoords(r, c) {
            return [{r, c}, {r: r-1, c}, {r: r+1, c}, {r, c: c-1}, {r, c: c+1}]
                .filter(p => p.r >= 0 && p.r < GRID_SIZE && p.c >= 0 && p.c < GRID_SIZE);
        }

        function handleCellClick(r, c) {
            if(!isPlayerTurn || enemyGrid[r][c].hit) return;

            if(currentWeapon === 'standard') {
                fireAt(r, c);
                endPlayerTurn();
            } else {
                pendingTarget = {r, c};
                showQuiz();
            }
        }

        function fireAt(r, c) {
            const cell = enemyGrid[r][c];
            if(cell.hit) return false;
            cell.hit = true;

            if(cell.hasShip) {
                const ship = enemyShips[cell.shipId];
                ship.hits++;
                if(ship.hits >= ship.size) {
                    ship.sunk = true;
                    setStatus('◉ HOSTILE VESSEL DESTROYED');
                }
                return true;
            }
            return false;
        }

        function fireCluster(r, c) {
            const coords = getClusterCoords(r, c);
            let anyHit = false;
            coords.forEach(t => {
                if(fireAt(t.r, t.c)) anyHit = true;
            });
            clusterCount++;
            return anyHit;
        }

        function endPlayerTurn() {
            clearHighlights();
            turns++;
            renderGrids();
            updateUI();

            if(checkWin()) return;

            if(streak >= 3) {
                triggerRadar();
            }

            setTurn(false);
            setTimeout(botTurn, 1000);
        }

        function setTurn(isPlayer) {
            isPlayerTurn = isPlayer;
            const indicator = document.getElementById('turn-' + gameId);
            const lamp = document.getElementById('lamp-' + gameId);
            const sweep = document.getElementById('sweep-' + gameId);

            if(isPlayer) {
                indicator.innerText = 'COMMANDER ON DECK';
                indicator.className = 'bs-commander-status player';
                lamp.className = 'bs-status-lamp player';
                if(sweep) sweep.style.animationPlayState = 'running';
            } else {
                indicator.innerText = '◆ ENEMY ACTION ◆';
                indicator.className = 'bs-commander-status enemy';
                lamp.className = 'bs-status-lamp enemy';
                if(sweep) sweep.style.animationPlayState = 'paused';
            }
        }

        function setStatus(msg) {
            const el = document.getElementById('status-' + gameId);
            el.querySelector('.bs-teletype-text').innerText = msg;
            el.classList.add('typing');
            setTimeout(() => el.classList.remove('typing'), 500);
        }

        window['selectWeapon_' + uniqueId] = function(type) {
            if(!isPlayerTurn) return;
            currentWeapon = type;
            document.getElementById('btn-std-' + gameId).className = 'bs-weapon' + (type === 'standard' ? ' active' : '');
            document.getElementById('btn-cluster-' + gameId).className = 'bs-weapon' + (type === 'cluster' ? ' active' : '');
            setStatus(type === 'cluster' ? '◉ DEPTH CHARGE ARMED — SELECT TARGET' : 'TORPEDO LOADED — SELECT TARGET');
        };

        function showQuiz() {
            const q = getQuestion();
            pendingAction = { qData: q, correct: false };

            document.getElementById('quiz-question-' + gameId).innerText = q.question;
            const opts = document.getElementById('quiz-options-' + gameId);
            opts.innerHTML = '';

            q.answers.forEach((ans, i) => {
                const btn = document.createElement('button');
                btn.className = 'bs-option';
                btn.innerHTML = '<span class="bs-option-letter">' + String.fromCharCode(65 + i) + '</span><span class="bs-option-text">' + ans + '</span>';
                btn.onclick = () => handleAnswer(i);
                opts.appendChild(btn);
            });

            document.getElementById('quiz-feedback-' + gameId).style.display = 'none';
            opts.style.display = 'grid';
            document.getElementById('quiz-modal-' + gameId).classList.add('active');
        }

        function getQuestion() {
            if(QUESTIONS.length === 0) {
                return { question: 'What is 2 + 2?', answers: ['3', '4', '5', '6'], correctIndex: 1, explanation: '2 + 2 = 4' };
            }
            const q = QUESTIONS[qIdx % QUESTIONS.length];
            qIdx++;
            return q;
        }

        function handleAnswer(idx) {
            totalQuestions++;
            const correct = idx === pendingAction.qData.correctIndex;
            pendingAction.correct = correct;

            const fb = document.getElementById('quiz-feedback-' + gameId);
            const msg = document.getElementById('feedback-msg-' + gameId);
            const btn = document.getElementById('feedback-btn-' + gameId);

            document.getElementById('quiz-options-' + gameId).style.display = 'none';
            fb.style.display = 'block';

            if(correct) {
                correctAnswers++;
                streak++;
                fb.className = 'bs-feedback-panel correct';
                msg.innerHTML = '<div class="bs-feedback-icon">◉</div><div class="bs-feedback-title">SOLUTION VERIFIED</div><div class="bs-feedback-detail">' + pendingAction.qData.explanation + '</div>';
                btn.innerText = 'FIRE DEPTH CHARGE';
            } else {
                streak = 0;
                intelLog.push({
                    q: pendingAction.qData.question,
                    user: pendingAction.qData.answers[idx],
                    correct: pendingAction.qData.answers[pendingAction.qData.correctIndex],
                    exp: pendingAction.qData.explanation
                });
                fb.className = 'bs-feedback-panel wrong';
                msg.innerHTML = '<div class="bs-feedback-icon">✕</div><div class="bs-feedback-title">SOLUTION REJECTED</div><div class="bs-feedback-detail">Correct: ' + pendingAction.qData.answers[pendingAction.qData.correctIndex] + '</div>';
                btn.innerText = 'ACKNOWLEDGE';
            }

            updateStreakUI();
        }

        window['resolveQuiz_' + uniqueId] = function() {
            document.getElementById('quiz-modal-' + gameId).classList.remove('active');

            if(pendingAction.correct && pendingTarget) {
                const hit = fireCluster(pendingTarget.r, pendingTarget.c);
                setStatus(hit ? '◉ DEPTH CHARGE IMPACT — TARGET HIT' : 'DEPTH CHARGE IMPACT — NO CONTACT');
            } else {
                setStatus('⚠ WEAPON MALFUNCTION — TURN LOST');
            }

            pendingTarget = null;
            pendingAction = null;
            endPlayerTurn();
        };

        function triggerRadar() {
            streak = 0;
            updateStreakUI();
            setStatus('◉ SATELLITE INTEL INCOMING...');

            const targets = [];
            for(let r = 0; r < GRID_SIZE; r++) {
                for(let c = 0; c < GRID_SIZE; c++) {
                    if(enemyGrid[r][c].hasShip && !enemyGrid[r][c].hit) targets.push({r, c});
                }
            }

            if(targets.length > 0) {
                radarTarget = targets[Math.floor(Math.random() * targets.length)];
                renderGrids();
                setTimeout(() => {
                    radarTarget = null;
                    renderGrids();
                }, 2500);
            }
        }

        function updateStreakUI() {
            for(let i = 1; i <= 3; i++) {
                const pip = document.getElementById('pip' + i + '-' + gameId);
                pip.className = 'bs-intel-pip' + (i <= streak ? ' filled' : '');
            }
            document.getElementById('uplink-' + gameId).style.display = streak >= 3 ? 'flex' : 'none';
        }

        function botTurn() {
            let r, c;

            if(botHuntStack.length > 0) {
                const t = botHuntStack.pop();
                r = t.r; c = t.c;
            } else {
                let attempts = 0;
                do {
                    r = Math.floor(Math.random() * GRID_SIZE);
                    c = Math.floor(Math.random() * GRID_SIZE);
                    attempts++;
                } while(playerGrid[r][c].hit && attempts < 100);
            }

            const cell = playerGrid[r][c];
            cell.hit = true;

            if(cell.hasShip) {
                const ship = playerShips[cell.shipId];
                ship.hits++;
                if(ship.hits >= ship.size) {
                    ship.sunk = true;
                    setStatus('⚠ HULL BREACH DETECTED');
                } else {
                    [{r: r-1, c}, {r: r+1, c}, {r, c: c-1}, {r, c: c+1}].forEach(adj => {
                        if(adj.r >= 0 && adj.r < GRID_SIZE && adj.c >= 0 && adj.c < GRID_SIZE && !playerGrid[adj.r][adj.c].hit) {
                            botHuntStack.push(adj);
                        }
                    });
                }
            }

            renderGrids();
            updateUI();

            if(checkWin()) return;

            setTimeout(() => {
                setTurn(true);
                setStatus('AWAITING ORDERS, COMMANDER');
            }, 800);
        }

        function updateUI() {
            const pAlive = playerShips.filter(s => !s.sunk).length;
            const eAlive = enemyShips.filter(s => !s.sunk).length;

            document.getElementById('turn-count-' + gameId).innerText = String(turns).padStart(3, '0');

            const acc = totalQuestions === 0 ? 100 : Math.round((correctAnswers / totalQuestions) * 100);
            document.getElementById('accuracy-' + gameId).innerText = acc;
        }

        function checkWin() {
            if(enemyShips.every(s => s.sunk)) {
                showEnd(true);
                return true;
            }
            if(playerShips.every(s => s.sunk)) {
                showEnd(false);
                return true;
            }
            return false;
        }

        function showEnd(won) {
            document.getElementById('game-screen-' + gameId).classList.remove('active');
            const screen = document.getElementById('end-' + gameId);
            screen.classList.add('active');

            const title = document.getElementById('end-title-' + gameId);
            title.innerText = won ? '◉ MISSION ACCOMPLISHED' : '✕ FLEET DESTROYED';
            title.className = 'bs-end-header ' + (won ? 'victory' : 'defeat');

            document.getElementById('stat-turns-' + gameId).innerText = turns;
            const acc = totalQuestions === 0 ? 100 : Math.round((correctAnswers / totalQuestions) * 100);
            document.getElementById('stat-acc-' + gameId).innerText = acc + '%';
            document.getElementById('stat-clusters-' + gameId).innerText = clusterCount;

            let rating = 'LOW';
            if (turns < 25) rating = 'ELITE';
            else if (turns < 35) rating = 'GOOD';
            else if (turns < 50) rating = 'STD';
            document.getElementById('stat-rating-' + gameId).innerText = rating;

            const log = document.getElementById('intel-log-' + gameId);
            if(intelLog.length === 0) {
                log.innerHTML = '<div class="bs-debrief-ok">◉ Zero targeting errors. Outstanding performance.</div>';
            } else {
                log.innerHTML = intelLog.map(i =>
                    '<div class="bs-debrief-item"><div class="bs-debrief-q">' + i.q + '</div><div class="bs-debrief-wrong">Your answer: ' + i.user + '</div><div class="bs-debrief-correct">Correct: ' + i.correct + '</div></div>'
                ).join('');
            }

            if(won && window.completeGamificationActivity) {
                window.completeGamificationActivity(gameId);
            }
        }
    })();
    </script>

    <style>
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');

        .battleships-activity {
            width: 100%;
            margin: 20px auto;
            max-width: 100%;
        }

        .bs-console {
            position: relative;
            background: #0a0c0f;
            border-radius: 16px;
            overflow: hidden;
            min-height: 520px;
            font-family: 'Share Tech Mono', monospace;
            color: #33ff77;
            border: 3px solid #1a1f28;
            box-shadow:
                inset 0 0 80px rgba(51, 255, 119, 0.03),
                0 0 40px rgba(0, 0, 0, 0.8),
                0 20px 60px rgba(0, 0, 0, 0.6);
        }

        /* Fullscreen Button */
        .bs-fullscreen-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 150;
            width: 36px;
            height: 36px;
            background: rgba(0, 0, 0, 0.6);
            border: 1px solid #2a4a35;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            color: #33ff77;
            font-size: 1.2rem;
        }

        .bs-fullscreen-btn:hover {
            background: rgba(51, 255, 119, 0.15);
            border-color: #33ff77;
            box-shadow: 0 0 15px rgba(51, 255, 119, 0.3);
        }

        .bs-fs-expand, .bs-fs-collapse {
            line-height: 1;
        }

        .bs-fs-collapse {
            display: none;
            transform: rotate(45deg);
        }

        /* CSS Fullscreen Mode (fallback for iframes/SCORM) */
        .bs-activity-maximized {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            z-index: 999999 !important;
            background: #000;
        }

        .bs-maximized {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            border-radius: 0 !important;
            border: none !important;
            z-index: 999999 !important;
        }

        .bs-maximized .bs-fullscreen-btn {
            top: 15px;
            right: 15px;
        }

        /* Native Fullscreen adjustments */
        .bs-native-fullscreen {
            border-radius: 0 !important;
            border: none !important;
        }

        .bs-console:fullscreen,
        .bs-console:-webkit-full-screen {
            border-radius: 0;
            border: none;
        }

        /* ===========================================
           FULLSCREEN ADAPTIVE LAYOUT
           =========================================== */

        /* Game screen in fullscreen */
        .bs-maximized .bs-game,
        .bs-native-fullscreen .bs-game,
        .bs-console:fullscreen .bs-game {
            padding: 20px 40px;
            height: 100vh;
            box-sizing: border-box;
        }

        /* Top bar scales up */
        .bs-maximized .bs-topbar,
        .bs-native-fullscreen .bs-topbar {
            padding: 15px 25px;
            margin-bottom: 20px;
        }

        .bs-maximized .bs-commander-status,
        .bs-native-fullscreen .bs-commander-status {
            font-size: 1rem;
            padding: 10px 20px;
        }

        .bs-maximized .bs-teletype,
        .bs-native-fullscreen .bs-teletype {
            font-size: 1rem;
            padding: 12px 20px;
        }

        .bs-maximized .bs-gauge-label,
        .bs-native-fullscreen .bs-gauge-label {
            font-size: 0.75rem;
        }

        .bs-maximized .bs-gauge-value,
        .bs-native-fullscreen .bs-gauge-value {
            font-size: 1.5rem;
        }

        .bs-maximized .bs-status-lamp,
        .bs-native-fullscreen .bs-status-lamp {
            width: 18px;
            height: 18px;
        }

        /* Operations area - fill height */
        .bs-maximized .bs-operations,
        .bs-native-fullscreen .bs-operations {
            flex: 1;
            gap: 20px;
            min-height: 0;
        }

        /* Display frames scale */
        .bs-maximized .bs-display-frame,
        .bs-native-fullscreen .bs-display-frame {
            padding: 20px;
        }

        .bs-maximized .bs-display-header,
        .bs-native-fullscreen .bs-display-header {
            padding-bottom: 15px;
            margin-bottom: 15px;
        }

        .bs-maximized .bs-display-title,
        .bs-native-fullscreen .bs-display-title {
            font-size: 1rem;
            letter-spacing: 3px;
        }

        .bs-maximized .bs-display-count,
        .bs-native-fullscreen .bs-display-count {
            font-size: 1.3rem;
            letter-spacing: 5px;
        }

        /* Display panels - equal width, don't overflow */
        .bs-maximized .bs-display,
        .bs-native-fullscreen .bs-display {
            flex: 1 1 0;
            min-width: 0;
        }

        /* Sonar screens */
        .bs-maximized .bs-sonar-screen,
        .bs-native-fullscreen .bs-sonar-screen {
            flex: 1;
        }

        /* Grids - width-based sizing, height follows */
        .bs-maximized .bs-sonar-grid,
        .bs-native-fullscreen .bs-sonar-grid,
        .bs-console:fullscreen .bs-sonar-grid {
            width: calc(100% - 20px);
            height: auto;
            aspect-ratio: 1;
            padding: 10px;
            max-width: calc(100% - 20px);
        }

        /* Grid cells get larger with gap */
        .bs-maximized .bs-cell,
        .bs-native-fullscreen .bs-cell {
            border-radius: 4px;
        }

        .bs-maximized .bs-sonar-grid,
        .bs-native-fullscreen .bs-sonar-grid {
            gap: 4px;
        }

        /* Control panel scales */
        .bs-maximized .bs-control-panel,
        .bs-native-fullscreen .bs-control-panel {
            width: 240px;
            min-width: 220px;
            padding: 20px;
            gap: 20px;
        }

        .bs-maximized .bs-section-label,
        .bs-native-fullscreen .bs-section-label {
            font-size: 0.8rem;
            letter-spacing: 3px;
            padding-bottom: 10px;
        }

        .bs-maximized .bs-weapon,
        .bs-native-fullscreen .bs-weapon {
            padding: 15px;
            border-radius: 10px;
        }

        .bs-maximized .bs-weapon-icon,
        .bs-native-fullscreen .bs-weapon-icon {
            font-size: 1.3rem;
        }

        .bs-maximized .bs-weapon-name,
        .bs-native-fullscreen .bs-weapon-name {
            font-size: 0.85rem;
        }

        .bs-maximized .bs-weapon-desc,
        .bs-native-fullscreen .bs-weapon-desc {
            font-size: 0.7rem;
        }

        .bs-maximized .bs-weapon-indicator,
        .bs-native-fullscreen .bs-weapon-indicator {
            width: 14px;
            height: 14px;
        }

        /* Intel section */
        .bs-maximized .bs-intel-pip,
        .bs-native-fullscreen .bs-intel-pip {
            height: 12px;
        }

        .bs-maximized .bs-intel-ready,
        .bs-native-fullscreen .bs-intel-ready {
            font-size: 0.8rem;
            padding: 12px;
        }

        /* Oscilloscope */
        .bs-maximized .bs-oscilloscope,
        .bs-native-fullscreen .bs-oscilloscope {
            height: 80px;
            border-radius: 10px;
        }

        /* Cell content scales */
        .bs-maximized .bs-cell.hit::after,
        .bs-native-fullscreen .bs-cell.hit::after {
            font-size: 1.5rem;
        }

        .bs-maximized .bs-cell.miss::after,
        .bs-native-fullscreen .bs-cell.miss::after {
            font-size: 2rem;
        }

        /* Start screen in fullscreen */
        .bs-maximized .bs-start-inner,
        .bs-native-fullscreen .bs-start-inner {
            max-width: 600px;
            padding: 40px;
        }

        .bs-maximized .bs-logo-icon,
        .bs-native-fullscreen .bs-logo-icon {
            font-size: 4rem;
        }

        .bs-maximized .bs-logo-text,
        .bs-native-fullscreen .bs-logo-text {
            font-size: 2.5rem;
            letter-spacing: 8px;
        }

        .bs-maximized .bs-classification,
        .bs-native-fullscreen .bs-classification {
            font-size: 0.85rem;
            letter-spacing: 5px;
            padding: 12px;
            margin-bottom: 30px;
        }

        .bs-maximized .bs-terminal,
        .bs-native-fullscreen .bs-terminal {
            font-size: 1rem;
            padding: 20px;
            margin-bottom: 20px;
        }

        .bs-maximized .bs-orders,
        .bs-native-fullscreen .bs-orders {
            padding: 20px;
            margin-bottom: 30px;
        }

        .bs-maximized .bs-orders-title,
        .bs-native-fullscreen .bs-orders-title {
            font-size: 0.9rem;
            margin-bottom: 15px;
        }

        .bs-maximized .bs-order,
        .bs-native-fullscreen .bs-order {
            font-size: 1rem;
            margin-bottom: 10px;
        }

        .bs-maximized .bs-button-inner,
        .bs-native-fullscreen .bs-button-inner {
            padding: 18px 40px;
            font-size: 1.1rem;
        }

        .bs-maximized .bs-warning-strip,
        .bs-native-fullscreen .bs-warning-strip {
            font-size: 0.85rem;
            margin-top: 25px;
        }

        /* Deployment screen in fullscreen */
        .bs-maximized .bs-deploy-container,
        .bs-native-fullscreen .bs-deploy-container {
            max-width: 1000px;
        }

        .bs-maximized .bs-deploy-title,
        .bs-native-fullscreen .bs-deploy-title {
            font-size: 2rem;
        }

        .bs-maximized .bs-deploy-subtitle,
        .bs-native-fullscreen .bs-deploy-subtitle {
            font-size: 1rem;
        }

        .bs-maximized .bs-deploy-main,
        .bs-native-fullscreen .bs-deploy-main {
            gap: 30px;
        }

        .bs-maximized .bs-deploy-grid-wrapper,
        .bs-native-fullscreen .bs-deploy-grid-wrapper {
            padding: 25px;
        }

        .bs-maximized .bs-deploy-grid-wrapper .bs-sonar-screen,
        .bs-native-fullscreen .bs-deploy-grid-wrapper .bs-sonar-screen {
            max-width: 500px;
        }

        .bs-maximized .bs-deploy-controls,
        .bs-native-fullscreen .bs-deploy-controls {
            width: 280px;
            gap: 20px;
        }

        .bs-maximized .bs-instruction-item,
        .bs-native-fullscreen .bs-instruction-item {
            font-size: 0.9rem;
            margin-bottom: 10px;
        }

        .bs-maximized .bs-key,
        .bs-native-fullscreen .bs-key {
            font-size: 0.75rem;
            padding: 4px 10px;
        }

        .bs-maximized .bs-ship-btn,
        .bs-native-fullscreen .bs-ship-btn {
            padding: 12px 15px;
        }

        .bs-maximized .bs-ship-segment,
        .bs-native-fullscreen .bs-ship-segment {
            width: 20px;
            height: 20px;
        }

        .bs-maximized .bs-ship-label,
        .bs-native-fullscreen .bs-ship-label {
            font-size: 0.85rem;
        }

        .bs-maximized .bs-rotate-btn,
        .bs-native-fullscreen .bs-rotate-btn {
            padding: 15px;
            font-size: 0.9rem;
        }

        .bs-maximized .bs-rotate-icon,
        .bs-native-fullscreen .bs-rotate-icon {
            font-size: 1.3rem;
        }

        .bs-maximized .bs-randomize-btn,
        .bs-native-fullscreen .bs-randomize-btn {
            padding: 12px;
            font-size: 0.9rem;
        }

        /* Quiz modal in fullscreen */
        .bs-maximized .bs-modal-console,
        .bs-native-fullscreen .bs-modal-console {
            max-width: 600px;
        }

        .bs-maximized .bs-modal-header,
        .bs-native-fullscreen .bs-modal-header {
            font-size: 1rem;
            padding: 20px 25px;
        }

        .bs-maximized .bs-modal-body,
        .bs-native-fullscreen .bs-modal-body {
            padding: 30px;
        }

        .bs-maximized .bs-question-display,
        .bs-native-fullscreen .bs-question-display {
            padding: 20px;
            margin-bottom: 20px;
        }

        .bs-maximized .bs-question-text,
        .bs-native-fullscreen .bs-question-text {
            font-size: 1.2rem;
        }

        .bs-maximized .bs-options-grid,
        .bs-native-fullscreen .bs-options-grid {
            gap: 15px;
        }

        .bs-maximized .bs-option,
        .bs-native-fullscreen .bs-option {
            padding: 18px;
            border-radius: 10px;
        }

        .bs-maximized .bs-option-letter,
        .bs-native-fullscreen .bs-option-letter {
            width: 36px;
            height: 36px;
            font-size: 1rem;
        }

        .bs-maximized .bs-option-text,
        .bs-native-fullscreen .bs-option-text {
            font-size: 1rem;
        }

        .bs-maximized .bs-feedback-panel,
        .bs-native-fullscreen .bs-feedback-panel {
            padding: 30px;
        }

        .bs-maximized .bs-feedback-icon,
        .bs-native-fullscreen .bs-feedback-icon {
            font-size: 3rem;
        }

        .bs-maximized .bs-feedback-title,
        .bs-native-fullscreen .bs-feedback-title {
            font-size: 1.1rem;
        }

        .bs-maximized .bs-feedback-detail,
        .bs-native-fullscreen .bs-feedback-detail {
            font-size: 1rem;
        }

        /* End screen in fullscreen */
        .bs-maximized .bs-end-console,
        .bs-native-fullscreen .bs-end-console {
            max-width: 650px;
            padding: 50px;
        }

        .bs-maximized .bs-end-header,
        .bs-native-fullscreen .bs-end-header {
            font-size: 2.5rem;
            margin-bottom: 40px;
        }

        .bs-maximized .bs-end-stats,
        .bs-native-fullscreen .bs-end-stats {
            gap: 20px;
            margin-bottom: 35px;
        }

        .bs-maximized .bs-stat-dial,
        .bs-native-fullscreen .bs-stat-dial {
            padding: 25px 15px;
            border-radius: 15px;
        }

        .bs-maximized .bs-dial-value,
        .bs-native-fullscreen .bs-dial-value {
            font-size: 2rem;
        }

        .bs-maximized .bs-dial-label,
        .bs-native-fullscreen .bs-dial-label {
            font-size: 0.8rem;
        }

        .bs-maximized .bs-debrief,
        .bs-native-fullscreen .bs-debrief {
            padding: 25px;
            margin-bottom: 30px;
        }

        .bs-maximized .bs-debrief-header,
        .bs-native-fullscreen .bs-debrief-header {
            font-size: 0.9rem;
        }

        .bs-maximized .bs-debrief-q,
        .bs-native-fullscreen .bs-debrief-q {
            font-size: 1rem;
        }

        /* CRT Effects */
        .bs-crt-overlay {
            position: absolute;
            inset: 0;
            background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 90%);
            pointer-events: none;
            z-index: 100;
        }

        .bs-scanlines {
            position: absolute;
            inset: 0;
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 0, 0, 0.15) 2px,
                rgba(0, 0, 0, 0.15) 4px
            );
            pointer-events: none;
            z-index: 101;
        }

        .bs-flicker {
            position: absolute;
            inset: 0;
            background: transparent;
            pointer-events: none;
            z-index: 102;
            animation: flicker 8s infinite;
        }

        @keyframes flicker {
            0%, 97%, 100% { opacity: 0; }
            97.5% { opacity: 0.02; background: #33ff77; }
        }

        /* Screens */
        .bs-screen {
            position: absolute;
            inset: 0;
            display: none;
            z-index: 50;
        }
        .bs-screen.active {
            display: flex;
        }

        /* Start Screen */
        .bs-start {
            background: radial-gradient(ellipse at 30% 20%, rgba(51, 255, 119, 0.08) 0%, transparent 50%),
                        linear-gradient(180deg, #080a0d 0%, #0a0c0f 100%);
            align-items: center;
            justify-content: center;
            overflow-y: auto;
            padding: 15px;
        }

        /* Hide scrollbar on start screen */
        .bs-start::-webkit-scrollbar {
            width: 0;
            display: none;
        }
        .bs-start {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        .bs-start-inner {
            text-align: center;
            max-width: 480px;
            padding: 15px;
        }

        .bs-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 10px;
        }

        .bs-logo-icon {
            font-size: 2.5rem;
            text-shadow: 0 0 30px #33ff77, 0 0 60px #33ff77;
            animation: pulse-glow 3s ease-in-out infinite;
        }

        .bs-logo-text {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.5rem;
            font-weight: 900;
            letter-spacing: 4px;
            line-height: 1.1;
            text-shadow: 0 0 20px rgba(51, 255, 119, 0.5);
        }

        @keyframes pulse-glow {
            0%, 100% { text-shadow: 0 0 30px #33ff77, 0 0 60px #33ff77; }
            50% { text-shadow: 0 0 40px #33ff77, 0 0 80px #33ff77, 0 0 120px #33ff77; }
        }

        .bs-classification {
            color: #ff9500;
            font-size: 0.65rem;
            letter-spacing: 3px;
            margin-bottom: 15px;
            padding: 6px;
            border-top: 1px solid rgba(255, 149, 0, 0.3);
            border-bottom: 1px solid rgba(255, 149, 0, 0.3);
        }

        .bs-terminal {
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid #1a2a1f;
            padding: 12px;
            text-align: left;
            margin-bottom: 12px;
            font-size: 0.8rem;
        }

        .bs-terminal-line {
            opacity: 0;
            animation: type-in 0.5s forwards;
            margin-bottom: 2px;
        }
        .bs-terminal-line:nth-child(1) { animation-delay: 0.2s; }
        .bs-terminal-line:nth-child(2) { animation-delay: 0.6s; }
        .bs-terminal-line:nth-child(3) { animation-delay: 1.0s; }
        .bs-terminal-line:nth-child(4) { animation-delay: 1.4s; }

        @keyframes type-in {
            from { opacity: 0; transform: translateX(-5px); }
            to { opacity: 1; transform: translateX(0); }
        }

        .bs-orders {
            background: rgba(51, 255, 119, 0.05);
            border-left: 3px solid #33ff77;
            padding: 12px;
            text-align: left;
            margin-bottom: 15px;
        }

        .bs-orders-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 0.7rem;
            color: #33ff77;
            letter-spacing: 2px;
            margin-bottom: 8px;
        }

        .bs-order {
            font-size: 0.75rem;
            color: #8fa;
            margin-bottom: 4px;
            display: flex;
            gap: 8px;
        }

        .bs-order-num {
            color: #ff9500;
            font-weight: bold;
        }

        .bs-warning-strip {
            color: #ff9500;
            font-size: 0.65rem;
            margin-top: 12px;
            animation: blink-warn 2s infinite;
        }

        @keyframes blink-warn {
            0%, 70%, 100% { opacity: 1; }
            85% { opacity: 0.4; }
        }

        /* Buttons */
        .bs-button {
            background: transparent;
            border: 2px solid #33ff77;
            color: #33ff77;
            padding: 0;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.9rem;
            font-weight: 700;
            letter-spacing: 3px;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .bs-button-inner {
            display: block;
            padding: 12px 28px;
            position: relative;
            z-index: 1;
        }

        .bs-button::before {
            content: '';
            position: absolute;
            inset: 0;
            background: #33ff77;
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.3s ease;
        }

        .bs-button:hover {
            color: #0a0c0f;
            box-shadow: 0 0 30px rgba(51, 255, 119, 0.4);
        }

        .bs-button:hover::before {
            transform: scaleX(1);
        }

        .bs-button-primary {
            background: rgba(51, 255, 119, 0.1);
        }

        /* Game Screen */
        .bs-game {
            flex-direction: column;
            padding: 12px;
            gap: 10px;
            background: linear-gradient(180deg, #0a0c0f 0%, #080a0d 100%);
        }

        /* Top Bar */
        .bs-topbar {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 15px;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid #1a2a1f;
            border-radius: 8px;
        }

        .bs-status-lamp {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #1a1f14;
            border: 2px solid #2a3524;
            position: relative;
        }

        .bs-status-lamp.player .bs-lamp-glow {
            background: #33ff77;
            box-shadow: 0 0 12px #33ff77, 0 0 24px #33ff77;
        }

        .bs-status-lamp.enemy .bs-lamp-glow {
            background: #ff4444;
            box-shadow: 0 0 12px #ff4444, 0 0 24px #ff4444;
            animation: alarm-pulse 0.5s infinite;
        }

        .bs-lamp-glow {
            position: absolute;
            inset: 2px;
            border-radius: 50%;
            background: #33ff77;
            box-shadow: 0 0 8px #33ff77;
        }

        @keyframes alarm-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }

        .bs-commander-status {
            font-family: 'Orbitron', sans-serif;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 2px;
            padding: 6px 12px;
            border: 1px solid;
            text-transform: uppercase;
        }

        .bs-commander-status.player {
            color: #33ff77;
            border-color: #33ff77;
            text-shadow: 0 0 10px rgba(51, 255, 119, 0.5);
        }

        .bs-commander-status.enemy {
            color: #ff4444;
            border-color: #ff4444;
            background: rgba(255, 68, 68, 0.1);
            animation: enemy-flash 0.8s infinite;
        }

        @keyframes enemy-flash {
            0%, 100% { background: rgba(255, 68, 68, 0.1); }
            50% { background: rgba(255, 68, 68, 0.2); }
        }

        .bs-teletype {
            flex: 1;
            background: #000;
            border: 1px solid #1a2a1f;
            padding: 8px 15px;
            font-size: 0.8rem;
            overflow: hidden;
        }

        .bs-teletype-text::after {
            content: '█';
            animation: cursor-blink 1s step-end infinite;
            margin-left: 2px;
        }

        @keyframes cursor-blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }

        .bs-teletype.typing .bs-teletype-text {
            animation: type-flash 0.1s;
        }

        @keyframes type-flash {
            50% { color: #fff; }
        }

        .bs-gauges {
            display: flex;
            gap: 15px;
        }

        .bs-gauge {
            text-align: center;
            min-width: 50px;
        }

        .bs-gauge-label {
            font-size: 0.6rem;
            color: #5a7a5a;
            letter-spacing: 1px;
        }

        .bs-gauge-value {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.1rem;
            font-weight: 700;
            color: #ff9500;
            text-shadow: 0 0 10px rgba(255, 149, 0, 0.5);
        }

        /* Operations Area */
        .bs-operations {
            display: flex;
            gap: 12px;
            flex: 1;
            min-height: 0;
        }

        .bs-display {
            flex: 1;
            min-width: 0;
        }

        .bs-display-frame {
            height: 100%;
            background: rgba(10, 20, 15, 0.7);
            border: 2px solid #2a4a35;
            border-radius: 12px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            box-shadow: inset 0 0 40px rgba(51, 255, 119, 0.06), 0 0 15px rgba(51, 255, 119, 0.05);
        }

        .bs-radar-frame {
            background: rgba(20, 12, 10, 0.7);
            border-color: #4a2a1f;
            box-shadow: inset 0 0 40px rgba(255, 100, 50, 0.04), 0 0 15px rgba(255, 100, 50, 0.03);
        }

        .bs-display-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 8px;
            margin-bottom: 8px;
            border-bottom: 1px solid rgba(51, 255, 119, 0.3);
        }

        .bs-radar-frame .bs-display-header {
            border-bottom-color: rgba(255, 102, 51, 0.3);
        }

        .bs-display-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 0.7rem;
            font-weight: 700;
            letter-spacing: 2px;
            color: #55ff99;
            text-shadow: 0 0 10px rgba(51, 255, 119, 0.4);
        }

        .bs-radar-frame .bs-display-title {
            color: #ff8855;
            text-shadow: 0 0 10px rgba(255, 102, 51, 0.4);
        }

        .bs-display-count {
            font-size: 0.9rem;
            letter-spacing: 3px;
            text-shadow: 0 0 8px currentColor;
        }

        .bs-radar-frame .bs-display-count {
            color: #ff8855;
        }

        .bs-sonar-screen {
            flex: 1;
            background:
                linear-gradient(90deg, rgba(51, 255, 119, 0.03) 1px, transparent 1px),
                linear-gradient(0deg, rgba(51, 255, 119, 0.03) 1px, transparent 1px),
                radial-gradient(ellipse at center, #0f1f15 0%, #0a150d 100%);
            background-size: 20px 20px, 20px 20px, 100% 100%;
            border: 1px solid #2a4a35;
            border-radius: 8px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            box-shadow: inset 0 0 40px rgba(51, 255, 119, 0.08);
        }

        .bs-sonar-screen.bs-hostile {
            background:
                linear-gradient(90deg, rgba(255, 102, 51, 0.03) 1px, transparent 1px),
                linear-gradient(0deg, rgba(255, 102, 51, 0.03) 1px, transparent 1px),
                radial-gradient(ellipse at center, #1a0f0a 0%, #100805 100%);
            background-size: 20px 20px, 20px 20px, 100% 100%;
            border-color: #4a2a1a;
            box-shadow: inset 0 0 40px rgba(255, 100, 50, 0.05);
        }

        .bs-radar-sweep {
            position: absolute;
            width: 100%;
            height: 100%;
            background: conic-gradient(
                from 0deg,
                transparent 0deg,
                rgba(255, 102, 51, 0.15) 30deg,
                transparent 60deg
            );
            animation: sweep 4s linear infinite;
            transform-origin: center;
            z-index: 5;
            pointer-events: none;
        }

        @keyframes sweep {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* Grid */
        .bs-sonar-grid {
            display: grid;
            gap: 2px;
            width: 100%;
            max-width: 280px;
            aspect-ratio: 1;
            padding: 8px;
            position: relative;
            z-index: 10;
        }

        .bs-cell {
            aspect-ratio: 1;
            background: rgba(51, 255, 119, 0.06);
            border: 1px solid rgba(51, 255, 119, 0.15);
            border-radius: 2px;
            cursor: default;
            position: relative;
            transition: all 0.2s ease;
        }

        .bs-hostile .bs-cell {
            background: rgba(255, 102, 51, 0.04);
            border-color: rgba(255, 102, 51, 0.12);
            cursor: crosshair;
        }

        .bs-cell.fog {
            background: rgba(255, 102, 51, 0.03);
        }

        .bs-cell.ship {
            background: linear-gradient(135deg, #3a6a4a 0%, #2a5a3a 100%);
            border-color: #55ff99;
            box-shadow: inset 0 0 12px rgba(51, 255, 119, 0.35), 0 0 6px rgba(51, 255, 119, 0.2);
        }

        .bs-cell.miss {
            background: rgba(100, 100, 100, 0.1);
        }

        .bs-cell.miss::after {
            content: '·';
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #4a5a4a;
            font-size: 1.5rem;
        }

        .bs-cell.hit {
            background: radial-gradient(circle, #ff4444 0%, #aa2222 100%);
            border-color: #ff4444;
            box-shadow: 0 0 15px rgba(255, 68, 68, 0.5);
            animation: hit-pulse 1s ease-out;
        }

        .bs-cell.hit::after {
            content: '×';
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 1rem;
            font-weight: bold;
        }

        @keyframes hit-pulse {
            0% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }

        .bs-cell.sunk {
            background: #1a1a1a;
            border-color: #333;
            opacity: 0.7;
        }

        .bs-cell.sunk::after {
            color: #666;
        }

        .bs-cell.target {
            background: rgba(255, 255, 255, 0.15);
            border-color: #fff;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
        }

        .bs-cell.target-cluster {
            background: rgba(255, 149, 0, 0.25);
            border-color: #ff9500;
            box-shadow: 0 0 12px rgba(255, 149, 0, 0.4);
        }

        .bs-cell.pinged {
            background: #33ff77 !important;
            border-color: #33ff77 !important;
            box-shadow: 0 0 20px #33ff77, 0 0 40px #33ff77;
            animation: ping-flash 0.5s ease-in-out infinite;
        }

        @keyframes ping-flash {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }

        /* Control Panel */
        .bs-control-panel {
            width: 180px;
            min-width: 160px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 10px;
            background: linear-gradient(180deg, rgba(20, 25, 20, 0.8) 0%, rgba(10, 15, 10, 0.9) 100%);
            border: 2px solid #1a2a1f;
            border-radius: 12px;
        }

        .bs-panel-section {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .bs-section-label {
            font-family: 'Orbitron', sans-serif;
            font-size: 0.6rem;
            font-weight: 700;
            letter-spacing: 2px;
            color: #5a8a5a;
            text-align: center;
            padding-bottom: 5px;
            border-bottom: 1px solid #1a2a1f;
        }

        .bs-weapon-rack {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .bs-weapon {
            background: rgba(0, 0, 0, 0.4);
            border: 2px solid #1a2a1f;
            border-radius: 8px;
            padding: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .bs-weapon:hover {
            border-color: #33ff77;
            background: rgba(51, 255, 119, 0.05);
        }

        .bs-weapon.active {
            border-color: #33ff77;
            background: rgba(51, 255, 119, 0.15);
            box-shadow: 0 0 15px rgba(51, 255, 119, 0.2);
        }

        .bs-weapon-indicator {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #1a1f14;
            border: 2px solid #2a3524;
            flex-shrink: 0;
        }

        .bs-weapon.active .bs-weapon-indicator {
            background: #33ff77;
            box-shadow: 0 0 8px #33ff77;
        }

        .bs-weapon-body {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
        }

        .bs-weapon-icon {
            font-size: 1rem;
            color: #5a8a5a;
        }

        .bs-weapon.active .bs-weapon-icon {
            color: #33ff77;
        }

        .bs-weapon-info {
            text-align: left;
        }

        .bs-weapon-name {
            font-family: 'Orbitron', sans-serif;
            font-size: 0.65rem;
            font-weight: 700;
            color: #8fa;
            letter-spacing: 1px;
        }

        .bs-weapon.active .bs-weapon-name {
            color: #33ff77;
        }

        .bs-weapon-desc {
            font-size: 0.55rem;
            color: #5a7a5a;
            margin-top: 2px;
        }

        /* Intel Section */
        .bs-intel-section {
            margin-top: auto;
        }

        .bs-intel-meter {
            display: flex;
            gap: 6px;
        }

        .bs-intel-pip {
            flex: 1;
            height: 8px;
            background: #1a1f14;
            border: 1px solid #2a3524;
            border-radius: 2px;
            transition: all 0.3s ease;
        }

        .bs-intel-pip.filled {
            background: linear-gradient(180deg, #33ff77 0%, #22aa55 100%);
            box-shadow: 0 0 8px #33ff77;
            border-color: #33ff77;
        }

        .bs-intel-ready {
            display: none;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 8px;
            margin-top: 8px;
            background: rgba(51, 255, 119, 0.15);
            border: 1px solid #33ff77;
            border-radius: 6px;
            font-size: 0.65rem;
            color: #33ff77;
            animation: ready-pulse 1.5s infinite;
        }

        @keyframes ready-pulse {
            0%, 100% { box-shadow: 0 0 10px rgba(51, 255, 119, 0.3); }
            50% { box-shadow: 0 0 20px rgba(51, 255, 119, 0.5); }
        }

        /* Oscilloscope */
        .bs-oscilloscope {
            height: 50px;
            background: #000;
            border: 1px solid #1a2a1f;
            border-radius: 6px;
            overflow: hidden;
            position: relative;
        }

        .bs-oscilloscope::before {
            content: '';
            position: absolute;
            inset: 0;
            background:
                linear-gradient(90deg, transparent 49.5%, rgba(51, 255, 119, 0.1) 50%, transparent 50.5%),
                linear-gradient(0deg, transparent 49.5%, rgba(51, 255, 119, 0.1) 50%, transparent 50.5%);
            background-size: 20% 20%;
        }

        .bs-wave {
            position: absolute;
            inset: 0;
            color: #33ff77;
            filter: drop-shadow(0 0 3px #33ff77);
        }

        .bs-wave svg {
            width: 100%;
            height: 100%;
        }

        /* Quiz Modal */
        .bs-modal {
            background: rgba(0, 0, 0, 0.9);
            align-items: center;
            justify-content: center;
            z-index: 200;
        }

        .bs-modal-console {
            width: 90%;
            max-width: 480px;
        }

        .bs-modal-border {
            background: linear-gradient(180deg, #0a0c0f 0%, #080a0d 100%);
            border: 2px solid #33ff77;
            border-radius: 12px;
            box-shadow: 0 0 40px rgba(51, 255, 119, 0.2);
            overflow: hidden;
        }

        .bs-modal-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 15px 20px;
            background: rgba(51, 255, 119, 0.1);
            border-bottom: 1px solid rgba(51, 255, 119, 0.3);
            font-family: 'Orbitron', sans-serif;
            font-size: 0.8rem;
            font-weight: 700;
            letter-spacing: 2px;
        }

        .bs-modal-lamp {
            width: 10px;
            height: 10px;
            background: #ff9500;
            border-radius: 50%;
            box-shadow: 0 0 10px #ff9500;
            animation: lamp-blink 1s infinite;
        }

        @keyframes lamp-blink {
            0%, 70%, 100% { opacity: 1; }
            80% { opacity: 0.3; }
        }

        .bs-modal-body {
            padding: 20px;
        }

        .bs-question-display {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid #1a2a1f;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 6px;
        }

        .bs-question-text {
            font-size: 1rem;
            line-height: 1.5;
            color: #cfc;
        }

        .bs-options-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .bs-option {
            background: rgba(0, 0, 0, 0.4);
            border: 2px solid #1a2a1f;
            border-radius: 8px;
            padding: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            text-align: left;
        }

        .bs-option:hover {
            border-color: #33ff77;
            background: rgba(51, 255, 119, 0.1);
        }

        .bs-option-letter {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(51, 255, 119, 0.1);
            border: 1px solid #33ff77;
            border-radius: 4px;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.8rem;
            font-weight: 700;
            color: #33ff77;
            flex-shrink: 0;
        }

        .bs-option:hover .bs-option-letter {
            background: #33ff77;
            color: #0a0c0f;
        }

        .bs-option-text {
            font-size: 0.85rem;
            color: #afc;
        }

        /* Feedback Panel */
        .bs-feedback-panel {
            display: none;
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            margin-top: 15px;
        }

        .bs-feedback-panel.correct {
            background: rgba(51, 255, 119, 0.1);
            border: 2px solid #33ff77;
        }

        .bs-feedback-panel.wrong {
            background: rgba(255, 68, 68, 0.1);
            border: 2px solid #ff4444;
        }

        .bs-feedback-icon {
            font-size: 2rem;
            margin-bottom: 10px;
        }

        .bs-feedback-panel.correct .bs-feedback-icon {
            color: #33ff77;
            text-shadow: 0 0 20px #33ff77;
        }

        .bs-feedback-panel.wrong .bs-feedback-icon {
            color: #ff4444;
            text-shadow: 0 0 20px #ff4444;
        }

        .bs-feedback-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 0.9rem;
            font-weight: 700;
            letter-spacing: 2px;
            margin-bottom: 10px;
        }

        .bs-feedback-panel.correct .bs-feedback-title {
            color: #33ff77;
        }

        .bs-feedback-panel.wrong .bs-feedback-title {
            color: #ff4444;
        }

        .bs-feedback-detail {
            font-size: 0.85rem;
            color: #8fa;
            margin-bottom: 15px;
        }

        .bs-button-confirm {
            padding: 10px 24px;
            font-size: 0.8rem;
        }

        /* End Screen */
        .bs-end {
            background: radial-gradient(ellipse at center, rgba(10, 12, 15, 0.98) 0%, #080a0d 100%);
            align-items: center;
            justify-content: center;
        }

        .bs-end-console {
            text-align: center;
            max-width: 500px;
            padding: 30px;
        }

        .bs-end-header {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.8rem;
            font-weight: 900;
            letter-spacing: 4px;
            margin-bottom: 30px;
        }

        .bs-end-header.victory {
            color: #33ff77;
            text-shadow: 0 0 30px rgba(51, 255, 119, 0.5);
        }

        .bs-end-header.defeat {
            color: #ff4444;
            text-shadow: 0 0 30px rgba(255, 68, 68, 0.5);
        }

        .bs-end-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 25px;
        }

        .bs-stat-dial {
            position: relative;
            padding: 15px 10px;
            background: rgba(0, 0, 0, 0.4);
            border: 2px solid #1a2a1f;
            border-radius: 10px;
        }

        .bs-dial-ring {
            position: absolute;
            top: 5px;
            left: 50%;
            transform: translateX(-50%);
            width: 8px;
            height: 8px;
            border: 2px solid #33ff77;
            border-radius: 50%;
        }

        .bs-dial-value {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.3rem;
            font-weight: 700;
            color: #ff9500;
            text-shadow: 0 0 10px rgba(255, 149, 0, 0.5);
            margin-bottom: 5px;
        }

        .bs-dial-label {
            font-size: 0.6rem;
            color: #5a7a5a;
            letter-spacing: 1px;
        }

        .bs-debrief {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid #1a2a1f;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            text-align: left;
        }

        .bs-debrief-header {
            font-family: 'Orbitron', sans-serif;
            font-size: 0.7rem;
            color: #5a8a5a;
            letter-spacing: 2px;
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #1a2a1f;
        }

        .bs-debrief-list {
            max-height: 120px;
            overflow-y: auto;
        }

        .bs-debrief-ok {
            color: #33ff77;
            text-align: center;
            padding: 10px;
        }

        .bs-debrief-item {
            padding: 10px;
            margin-bottom: 8px;
            background: rgba(255, 68, 68, 0.05);
            border-left: 3px solid #ff4444;
            border-radius: 0 6px 6px 0;
        }

        .bs-debrief-q {
            font-size: 0.85rem;
            color: #cfc;
            margin-bottom: 6px;
        }

        .bs-debrief-wrong {
            font-size: 0.75rem;
            color: #ff4444;
        }

        .bs-debrief-correct {
            font-size: 0.75rem;
            color: #33ff77;
        }

        /* Scrollbar */
        .bs-debrief-list::-webkit-scrollbar {
            width: 6px;
        }

        .bs-debrief-list::-webkit-scrollbar-track {
            background: #0a0c0f;
        }

        .bs-debrief-list::-webkit-scrollbar-thumb {
            background: #1a2a1f;
            border-radius: 3px;
        }

        /* Deployment Screen */
        .bs-deploy {
            background: radial-gradient(ellipse at 30% 30%, rgba(51, 255, 119, 0.06) 0%, transparent 50%),
                        linear-gradient(180deg, #080a0d 0%, #0a0c0f 100%);
            align-items: center;
            justify-content: center;
            padding: 15px;
        }

        .bs-deploy-container {
            width: 100%;
            max-width: 700px;
        }

        .bs-deploy-header {
            text-align: center;
            margin-bottom: 15px;
        }

        .bs-deploy-title {
            font-family: 'Orbitron', sans-serif;
            font-size: 1.4rem;
            font-weight: 900;
            letter-spacing: 4px;
            color: #33ff77;
            text-shadow: 0 0 20px rgba(51, 255, 119, 0.5);
            margin-bottom: 5px;
        }

        .bs-deploy-subtitle {
            font-size: 0.8rem;
            color: #5a8a5a;
            letter-spacing: 2px;
        }

        .bs-deploy-main {
            display: flex;
            gap: 20px;
            align-items: flex-start;
        }

        .bs-deploy-grid-area {
            flex: 1;
        }

        .bs-deploy-grid-wrapper {
            background: rgba(10, 20, 15, 0.7);
            border: 2px solid #2a4a35;
            border-radius: 12px;
            padding: 15px;
        }

        .bs-deploy-grid-wrapper .bs-sonar-screen {
            aspect-ratio: 1;
            max-width: 350px;
            margin: 0 auto;
        }

        .bs-deploy-grid-wrapper .bs-sonar-grid {
            max-width: 100%;
        }

        .bs-deploy-controls {
            width: 200px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .bs-deploy-instructions {
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid #1a2a1f;
            border-radius: 8px;
            padding: 10px;
        }

        .bs-instruction-item {
            font-size: 0.7rem;
            color: #8fa;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .bs-instruction-item:last-child {
            margin-bottom: 0;
        }

        .bs-key {
            background: rgba(51, 255, 119, 0.15);
            border: 1px solid #33ff77;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.6rem;
            font-weight: 700;
            color: #33ff77;
        }

        .bs-ship-selector {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .bs-ship-btn {
            background: rgba(0, 0, 0, 0.4);
            border: 2px solid #1a2a1f;
            border-radius: 8px;
            padding: 8px 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .bs-ship-btn:hover {
            border-color: #33ff77;
            background: rgba(51, 255, 119, 0.05);
        }

        .bs-ship-btn.selected {
            border-color: #33ff77;
            background: rgba(51, 255, 119, 0.15);
            box-shadow: 0 0 15px rgba(51, 255, 119, 0.2);
        }

        .bs-ship-visual {
            display: flex;
            gap: 2px;
        }

        .bs-ship-segment {
            width: 14px;
            height: 14px;
            background: linear-gradient(135deg, #3a6a4a 0%, #2a5a3a 100%);
            border: 1px solid #55ff99;
            border-radius: 2px;
        }

        .bs-ship-btn.selected .bs-ship-segment {
            background: linear-gradient(135deg, #55ff99 0%, #33dd77 100%);
            box-shadow: 0 0 6px #33ff77;
        }

        .bs-ship-label {
            font-size: 0.7rem;
            color: #8fa;
        }

        .bs-ship-btn.selected .bs-ship-label {
            color: #33ff77;
        }

        .bs-rotate-btn {
            background: rgba(255, 149, 0, 0.1);
            border: 2px solid #ff9500;
            border-radius: 8px;
            padding: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: 'Orbitron', sans-serif;
            font-size: 0.7rem;
            font-weight: 700;
            color: #ff9500;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .bs-rotate-btn:hover {
            background: rgba(255, 149, 0, 0.2);
            box-shadow: 0 0 15px rgba(255, 149, 0, 0.3);
        }

        .bs-rotate-icon {
            font-size: 1rem;
        }

        .bs-deploy-confirm {
            margin-top: 5px;
        }

        .bs-randomize-btn {
            background: transparent;
            border: 1px solid #5a8a5a;
            border-radius: 6px;
            padding: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: 'Share Tech Mono', monospace;
            font-size: 0.75rem;
            color: #5a8a5a;
        }

        .bs-randomize-btn:hover {
            border-color: #33ff77;
            color: #33ff77;
        }

        /* Deployment grid cell states */
        .bs-deploy-cell {
            cursor: pointer;
        }

        .bs-deploy-cell:hover {
            background: rgba(51, 255, 119, 0.1);
        }

        .bs-deploy-cell.ship.selected {
            background: linear-gradient(135deg, #55ff99 0%, #33dd77 100%);
            border-color: #88ffbb;
            box-shadow: 0 0 15px rgba(51, 255, 119, 0.5);
            animation: selected-pulse 1s ease-in-out infinite;
        }

        @keyframes selected-pulse {
            0%, 100% { box-shadow: 0 0 15px rgba(51, 255, 119, 0.5); }
            50% { box-shadow: 0 0 25px rgba(51, 255, 119, 0.7); }
        }

        .bs-deploy-cell.preview-valid {
            background: rgba(51, 255, 119, 0.25) !important;
            border-color: #33ff77 !important;
        }

        .bs-deploy-cell.preview-invalid {
            background: rgba(255, 68, 68, 0.25) !important;
            border-color: #ff4444 !important;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .bs-operations {
                flex-direction: column;
            }

            .bs-control-panel {
                width: 100%;
                flex-direction: row;
                flex-wrap: wrap;
            }

            .bs-panel-section {
                flex: 1;
                min-width: 140px;
            }

            .bs-oscilloscope {
                display: none;
            }

            .bs-end-stats {
                grid-template-columns: repeat(2, 1fr);
            }

            .bs-deploy-main {
                flex-direction: column;
            }

            .bs-deploy-controls {
                width: 100%;
                flex-direction: row;
                flex-wrap: wrap;
            }

            .bs-deploy-instructions {
                flex: 1;
                min-width: 150px;
            }

            .bs-ship-selector {
                flex: 1;
                min-width: 150px;
            }
        }
    </style>
    `;
}
