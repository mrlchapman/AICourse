/**
 * Battleships Game Engine
 * Pure game logic separated from rendering
 * This can be used with any theme/style
 */

import { GamificationActivity, safeJsonEmbed } from '../core/types';

/** Configuration for Battleships game */
export interface BattleshipsConfig {
  questions: BattleshipsQuestion[];
  required: boolean;
  gridSize: number;
  shipCount: number;
  shipSizes: number[];
}

/** A quiz question in the game */
export interface BattleshipsQuestion {
  question: string;
  answers: string[];
  correctIndex: number;
  explanation: string;
}

/**
 * Extracts game configuration from activity
 */
export function extractConfig(activity: GamificationActivity): BattleshipsConfig {
  const shipCount = activity.config?.shipCount || 4;
  return {
    questions: activity.config?.battleshipsQuestions || [],
    required: activity.config?.required || false,
    gridSize: activity.config?.gridSize || 8,
    shipCount,
    shipSizes: Array.from({ length: shipCount }, (_, i) => Math.max(2, 5 - i)),
  };
}

/**
 * Generates the client-side game script
 * This is the JavaScript that runs in the browser
 */
export function generateGameScript(
  gameId: string,
  uniqueId: string,
  config: BattleshipsConfig,
  classPrefix: string
): string {
  const questionsJson = safeJsonEmbed(config.questions);

  return `
    <script type="application/json" id="questions-data-${gameId}">${questionsJson}</script>

    <script>
    (function() {
        const gameId = '${gameId}';
        const uniqueId = '${uniqueId}';
        const GRID_SIZE = ${config.gridSize};
        const SHIP_SIZES = ${JSON.stringify(config.shipSizes)};
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
            container.classList.add('${classPrefix}-maximized');
            activity.classList.add('${classPrefix}-activity-maximized');
            document.body.style.overflow = 'hidden';
            isFullscreen = true;
            updateFullscreenButton();
        }

        function disableCssFullscreen() {
            const container = document.getElementById('game-' + gameId);
            const activity = document.getElementById('activity-' + gameId);
            if (!container || !activity) return;
            container.classList.remove('${classPrefix}-maximized');
            activity.classList.remove('${classPrefix}-activity-maximized');
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
                    cell.className = '${classPrefix}-cell ${classPrefix}-deploy-cell';
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
                    const cell = document.querySelector('#deploy-grid-' + gameId + ' .${classPrefix}-cell[data-r="' + hr + '"][data-c="' + hc + '"]');
                    if (cell) {
                        cell.classList.add(canPlace ? 'preview-valid' : 'preview-invalid');
                    }
                }
            }
        }

        function clearDeployHighlights() {
            document.querySelectorAll('#deploy-grid-' + gameId + ' .${classPrefix}-cell').forEach(c => {
                c.classList.remove('preview-valid', 'preview-invalid');
            });
        }

        function renderShipSelector() {
            const el = document.getElementById('ship-selector-' + gameId);
            el.innerHTML = '';

            deploymentShips.forEach((ship, idx) => {
                const btn = document.createElement('button');
                btn.className = '${classPrefix}-ship-btn' + (idx === selectedShipIndex ? ' selected' : '');

                let shipVisual = '';
                for (let i = 0; i < ship.size; i++) {
                    shipVisual += '<span class="${classPrefix}-ship-segment"></span>';
                }

                btn.innerHTML = '<div class="${classPrefix}-ship-visual">' + shipVisual + '</div><div class="${classPrefix}-ship-label">Ship ' + (idx + 1) + ' (' + ship.size + ')</div>';
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
                pIndicator += (i < pAlive) ? '\u25CF' : '\u25CB';
            }

            let eIndicator = '';
            for (let i = 0; i < SHIP_SIZES.length; i++) {
                eIndicator += (i < eAlive) ? '\u25C6' : '\u25C7';
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
                    cell.className = '${classPrefix}-cell';
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
            document.querySelectorAll('#enemy-grid-' + gameId + ' .${classPrefix}-cell').forEach(c => {
                c.classList.remove('target', 'target-cluster');
            });
        }

        function getEnemyCell(r, c) {
            return document.querySelector('#enemy-grid-' + gameId + ' .${classPrefix}-cell[data-r="' + r + '"][data-c="' + c + '"]');
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
                    setStatus('\u25C9 HOSTILE VESSEL DESTROYED');
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
                indicator.className = '${classPrefix}-commander-status player';
                lamp.className = '${classPrefix}-status-lamp player';
                if(sweep) sweep.style.animationPlayState = 'running';
            } else {
                indicator.innerText = '\u25C6 ENEMY ACTION \u25C6';
                indicator.className = '${classPrefix}-commander-status enemy';
                lamp.className = '${classPrefix}-status-lamp enemy';
                if(sweep) sweep.style.animationPlayState = 'paused';
            }
        }

        function setStatus(msg) {
            const el = document.getElementById('status-' + gameId);
            el.querySelector('.${classPrefix}-teletype-text').innerText = msg;
            el.classList.add('typing');
            setTimeout(() => el.classList.remove('typing'), 500);
        }

        window['selectWeapon_' + uniqueId] = function(type) {
            if(!isPlayerTurn) return;
            currentWeapon = type;
            document.getElementById('btn-std-' + gameId).className = '${classPrefix}-weapon' + (type === 'standard' ? ' active' : '');
            document.getElementById('btn-cluster-' + gameId).className = '${classPrefix}-weapon' + (type === 'cluster' ? ' active' : '');
            setStatus(type === 'cluster' ? '\u25C9 DEPTH CHARGE ARMED \u2014 SELECT TARGET' : 'TORPEDO LOADED \u2014 SELECT TARGET');
        };

        function showQuiz() {
            const q = getQuestion();
            pendingAction = { qData: q, correct: false };

            document.getElementById('quiz-question-' + gameId).innerText = q.question;
            const opts = document.getElementById('quiz-options-' + gameId);
            opts.innerHTML = '';

            q.answers.forEach((ans, i) => {
                const btn = document.createElement('button');
                btn.className = '${classPrefix}-option';
                btn.innerHTML = '<span class="${classPrefix}-option-letter">' + String.fromCharCode(65 + i) + '</span><span class="${classPrefix}-option-text">' + ans + '</span>';
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
                fb.className = '${classPrefix}-feedback-panel correct';
                msg.innerHTML = '<div class="${classPrefix}-feedback-icon">\u25C9</div><div class="${classPrefix}-feedback-title">SOLUTION VERIFIED</div><div class="${classPrefix}-feedback-detail">' + pendingAction.qData.explanation + '</div>';
                btn.innerText = 'FIRE DEPTH CHARGE';
            } else {
                streak = 0;
                intelLog.push({
                    q: pendingAction.qData.question,
                    user: pendingAction.qData.answers[idx],
                    correct: pendingAction.qData.answers[pendingAction.qData.correctIndex],
                    exp: pendingAction.qData.explanation
                });
                fb.className = '${classPrefix}-feedback-panel wrong';
                msg.innerHTML = '<div class="${classPrefix}-feedback-icon">\u2715</div><div class="${classPrefix}-feedback-title">SOLUTION REJECTED</div><div class="${classPrefix}-feedback-detail">Correct: ' + pendingAction.qData.answers[pendingAction.qData.correctIndex] + '</div>';
                btn.innerText = 'ACKNOWLEDGE';
            }

            updateStreakUI();
        }

        window['resolveQuiz_' + uniqueId] = function() {
            document.getElementById('quiz-modal-' + gameId).classList.remove('active');

            if(pendingAction.correct && pendingTarget) {
                const hit = fireCluster(pendingTarget.r, pendingTarget.c);
                setStatus(hit ? '\u25C9 DEPTH CHARGE IMPACT \u2014 TARGET HIT' : 'DEPTH CHARGE IMPACT \u2014 NO CONTACT');
            } else {
                setStatus('\u26A0 WEAPON MALFUNCTION \u2014 TURN LOST');
            }

            pendingTarget = null;
            pendingAction = null;
            endPlayerTurn();
        };

        function triggerRadar() {
            streak = 0;
            updateStreakUI();
            setStatus('\u25C9 SATELLITE INTEL INCOMING...');

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
                pip.className = '${classPrefix}-intel-pip' + (i <= streak ? ' filled' : '');
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
                    setStatus('\u26A0 HULL BREACH DETECTED');
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
            title.innerText = won ? '\u25C9 MISSION ACCOMPLISHED' : '\u2715 FLEET DESTROYED';
            title.className = '${classPrefix}-end-header ' + (won ? 'victory' : 'defeat');

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
                log.innerHTML = '<div class="${classPrefix}-debrief-ok">\u25C9 Zero targeting errors. Outstanding performance.</div>';
            } else {
                log.innerHTML = intelLog.map(i =>
                    '<div class="${classPrefix}-debrief-item"><div class="${classPrefix}-debrief-q">' + i.q + '</div><div class="${classPrefix}-debrief-wrong">Your answer: ' + i.user + '</div><div class="${classPrefix}-debrief-correct">Correct: ' + i.correct + '</div></div>'
                ).join('');
            }

            if(won && window.completeGamificationActivity) {
                window.completeGamificationActivity(gameId);
            }
        }
    })();
    </script>
  `;
}
