import { Activity } from '../types';

export function renderMemoryMatch(activity: Extract<Activity, { type: 'gamification' }>): string {
    const pairs = activity.config?.pairs || [];
    const penaltyShuffle = activity.config?.penaltyShuffle || false;
    const required = activity.config?.required || false;

    // Add interactive-card class if required, so tracking logic knows to block progression
    const trackingClass = required ? 'interactive-card' : '';

    // Transform pairs into game cards (2 cards per pair)
    const gameCards = pairs.flatMap(pair => [
        {
            id: `${pair.id}-1`,
            pairId: pair.id,
            type: pair.item1?.type || 'text',
            content: pair.item1?.content || '',
            info: pair.info
        },
        {
            id: `${pair.id}-2`,
            pairId: pair.id,
            type: pair.item2?.type || 'text',
            content: pair.item2?.content || '',
            info: pair.info
        }
    ]);

    const uniqueId = activity.id.replace(/-/g, '_');
    const gameCardsJson = JSON.stringify(gameCards);

    // Zener-style symbols for card backs
    const symbols = ['◯', '✚', '∿', '☆', '■'];

    return `
    <div class="activity gamification-activity ${trackingClass}" id="activity-${activity.id}">
        <div class="psi-lab" id="game-${activity.id}">
            <!-- Fullscreen Toggle -->
            <button class="psi-fullscreen-btn" id="fullscreen-btn-${activity.id}" onclick="togglePsiFullscreen_${uniqueId}()" title="Toggle Fullscreen">
                <span class="psi-fs-expand" id="fs-expand-${activity.id}">⛶</span>
                <span class="psi-fs-collapse" id="fs-collapse-${activity.id}">⛶</span>
            </button>

            <!-- Atmospheric Effects -->
            <div class="psi-noise"></div>
            <div class="psi-vignette"></div>
            <div class="psi-scanlines"></div>

            <!-- Header Panel -->
            <div class="psi-header">
                <div class="psi-header-left">
                    <div class="psi-logo">
                        <div class="psi-logo-icon">◎</div>
                        <div class="psi-logo-text">
                            <span class="psi-logo-main">PARAPSYCHOLOGY RESEARCH DIVISION</span>
                            <span class="psi-logo-sub">COGNITIVE PATTERN RECOGNITION TEST</span>
                        </div>
                    </div>
                    ${required ? '<div class="psi-required"><span class="psi-req-dot"></span>MANDATORY EVALUATION</div>' : ''}
                </div>
                <div class="psi-header-right">
                    <div class="psi-classification">◆ CONFIDENTIAL ◆</div>
                    <div class="psi-date">TEST DATE: <span id="test-date-${activity.id}"></span></div>
                </div>
            </div>

            <!-- Status Bar -->
            <div class="psi-status-bar">
                <div class="psi-status-left">
                    <div class="psi-indicator">
                        <div class="psi-indicator-light" id="status-light-${activity.id}"></div>
                        <span class="psi-indicator-text" id="status-text-${activity.id}">AWAITING INPUT</span>
                    </div>
                </div>
                <div class="psi-meters">
                    <div class="psi-meter">
                        <div class="psi-meter-label">ATTEMPTS</div>
                        <div class="psi-meter-display">
                            <span class="psi-meter-value" id="moves-${activity.id}">000</span>
                        </div>
                    </div>
                    <div class="psi-meter">
                        <div class="psi-meter-label">MATCHES</div>
                        <div class="psi-meter-display">
                            <span class="psi-meter-value" id="matches-${activity.id}">0</span>
                            <span class="psi-meter-slash">/</span>
                            <span class="psi-meter-total">${pairs.length}</span>
                        </div>
                    </div>
                    <div class="psi-meter psi-psi-meter">
                        <div class="psi-meter-label">PSI INDEX</div>
                        <div class="psi-psi-bar">
                            <div class="psi-psi-fill" id="psi-fill-${activity.id}"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Testing Area -->
            <div class="psi-main">
                <div class="psi-instructions">
                    <span class="psi-inst-icon">☛</span>
                    <span class="psi-inst-text">SELECT TWO CARDS TO REVEAL HIDDEN ASSOCIATIONS</span>
                </div>

                <div class="psi-grid-container">
                    <div class="psi-grid" id="grid-${activity.id}">
                        <!-- Cards injected here -->
                    </div>
                </div>

                <div class="psi-warning" id="warning-${activity.id}">
                    <div class="psi-warning-icon">⚠</div>
                    <div class="psi-warning-text">PATTERN DISRUPTION IMMINENT — NEURAL INTERFERENCE DETECTED</div>
                </div>
            </div>

            <!-- Footer -->
            <div class="psi-footer">
                <div class="psi-footer-left">
                    <span class="psi-form">FORM PSI-7A</span>
                    <span class="psi-serial">SERIAL: ${activity.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div class="psi-footer-center">
                    <div class="psi-wave" id="wave-${activity.id}"></div>
                </div>
                <div class="psi-footer-right">
                    <span class="psi-copyright">© INSTITUTE FOR ADVANCED COGNITION</span>
                </div>
            </div>

            <!-- Win Overlay -->
            <div class="psi-overlay" id="overlay-${activity.id}">
                <div class="psi-overlay-content">
                    <div class="psi-success-icon">✧</div>
                    <div class="psi-success-title">TEST COMPLETE</div>
                    <div class="psi-success-subtitle">COGNITIVE PATTERN RECOGNITION: VERIFIED</div>
                    <div class="psi-results">
                        <div class="psi-result-item">
                            <span class="psi-result-label">Total Attempts</span>
                            <span class="psi-result-value" id="final-moves-${activity.id}">0</span>
                        </div>
                        <div class="psi-result-item">
                            <span class="psi-result-label">PSI Rating</span>
                            <span class="psi-result-value psi-rating" id="final-rating-${activity.id}">--</span>
                        </div>
                    </div>
                    <div class="psi-stamp">◆ SUBJECT CLEARED ◆</div>
                    <button class="psi-button" onclick="initGame_${uniqueId}('${activity.id}')">
                        <span class="psi-button-text">INITIATE NEW TEST</span>
                    </button>
                </div>
            </div>

            <!-- Info Modal (inside psi-lab for fullscreen support) -->
            <div class="psi-modal" id="modal-${activity.id}">
                <div class="psi-modal-content">
                    <div class="psi-modal-header">
                        <div class="psi-modal-icon">◉</div>
                        <span>ASSOCIATION CONFIRMED</span>
                    </div>
                    <div class="psi-modal-body" id="modal-body-${activity.id}"></div>
                    <div class="psi-modal-footer">
                        <button class="psi-button psi-button-modal" onclick="closeGameModal('${activity.id}')">
                            <span class="psi-button-text">ACKNOWLEDGE</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Store game cards data safely -->
    <script type="application/json" id="cards-data-${activity.id}">${gameCardsJson.replace(/</g, '\\u003c').replace(/>/g, '\\u003e')}</script>

    <script>
        (function() {
            const gameId = '${activity.id}';
            const cardsEl = document.getElementById('cards-data-' + gameId);
            const rawData = cardsEl ? JSON.parse(cardsEl.textContent || '[]') : [];
            const penaltyShuffle = ${penaltyShuffle};
            const totalPairs = ${pairs.length};
            const symbols = ${JSON.stringify(symbols)};
            let cards = [];
            let flippedCards = [];
            let matchedCount = 0;
            let moves = 0;
            let mistakes = 0;
            let locked = false;
            let isFullscreen = false;

            // Set date
            const dateEl = document.getElementById('test-date-' + gameId);
            if (dateEl) {
                const now = new Date();
                dateEl.textContent = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).toUpperCase();
            }

            // Brainwave animation
            function animateWave() {
                const wave = document.getElementById('wave-' + gameId);
                if (!wave) return;
                let phase = 0;
                setInterval(() => {
                    phase += 0.08;
                    let path = 'M0,15';
                    for (let x = 0; x <= 120; x += 2) {
                        const y = 15 + Math.sin((x * 0.15) + phase) * 8 * Math.sin(x * 0.03 + phase * 0.5);
                        path += ' L' + x + ',' + y;
                    }
                    wave.innerHTML = '<svg viewBox="0 0 120 30" preserveAspectRatio="none"><path d="' + path + '" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>';
                }, 60);
            }
            animateWave();

            // Fullscreen toggle - use CSS fullscreen for reliability in iframes
            window['togglePsiFullscreen_' + '${uniqueId}'] = function() {
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
                container.classList.add('psi-maximized');
                activity.classList.add('psi-activity-maximized');
                document.body.style.overflow = 'hidden';
                isFullscreen = true;
                updateFullscreenButton();
            }

            function disableCssFullscreen() {
                const container = document.getElementById('game-' + gameId);
                const activity = document.getElementById('activity-' + gameId);
                if (!container || !activity) return;
                container.classList.remove('psi-maximized');
                activity.classList.remove('psi-activity-maximized');
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

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && isFullscreen) {
                    disableCssFullscreen();
                }
            });

            function shuffle(array) {
                let currentIndex = array.length, randomIndex;
                while (currentIndex != 0) {
                    randomIndex = Math.floor(Math.random() * currentIndex);
                    currentIndex--;
                    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
                }
                return array;
            }

            function getRandomSymbol() {
                return symbols[Math.floor(Math.random() * symbols.length)];
            }

            function createCardElement(card, index) {
                const el = document.createElement('div');
                el.className = 'psi-card';
                el.dataset.id = card.id;
                el.dataset.pairId = card.pairId;
                el.style.animationDelay = (index * 0.05) + 's';

                const inner = document.createElement('div');
                inner.className = 'psi-card-inner';

                const front = document.createElement('div');
                front.className = 'psi-card-front';
                front.innerHTML = '<span class="psi-card-symbol">' + getRandomSymbol() + '</span><span class="psi-card-number">' + String(index + 1).padStart(2, '0') + '</span>';

                const back = document.createElement('div');
                back.className = 'psi-card-back';

                if (card.type === 'image') {
                    const img = document.createElement('img');
                    img.src = card.content;
                    img.alt = 'Match';
                    back.appendChild(img);
                } else {
                    const text = document.createElement('span');
                    text.className = 'psi-card-text';
                    text.textContent = card.content;
                    back.appendChild(text);
                }

                inner.appendChild(front);
                inner.appendChild(back);
                el.appendChild(inner);

                el.addEventListener('click', () => flipCard(card.id));
                return el;
            }

            function renderGrid() {
                const grid = document.getElementById('grid-' + gameId);
                grid.innerHTML = '';
                cards.forEach((card, index) => {
                    grid.appendChild(createCardElement(card, index));
                });
            }

            function updateStatus(text, type) {
                const statusText = document.getElementById('status-text-' + gameId);
                const statusLight = document.getElementById('status-light-' + gameId);
                if (statusText) statusText.textContent = text;
                if (statusLight) {
                    statusLight.className = 'psi-indicator-light';
                    if (type) statusLight.classList.add('psi-light-' + type);
                }
            }

            function updatePsiIndex() {
                const fill = document.getElementById('psi-fill-' + gameId);
                if (!fill) return;
                // PSI index: ratio of matches to moves (higher = better)
                const efficiency = moves > 0 ? (matchedCount / moves) : 0;
                const percentage = Math.min(100, efficiency * 100);
                fill.style.width = percentage + '%';
            }

            function flipCard(id) {
                if (locked) return;
                const cardIndex = cards.findIndex(c => c.id === id);
                const cardEl = document.querySelector('#grid-' + gameId + ' .psi-card[data-id="' + id + '"]');

                if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

                cardEl.classList.add('flipped');
                flippedCards.push({ ...cards[cardIndex], el: cardEl });
                updateStatus('ANALYZING SELECTION', 'active');

                if (flippedCards.length === 2) {
                    moves++;
                    document.getElementById('moves-' + gameId).innerText = String(moves).padStart(3, '0');
                    checkForMatch();
                }
            }

            function checkForMatch() {
                locked = true;
                const [c1, c2] = flippedCards;
                const isMatch = c1.pairId === c2.pairId;

                if (isMatch) {
                    handleMatch(c1);
                } else {
                    handleMismatch();
                }
            }

            function handleMatch(card) {
                setTimeout(() => {
                    flippedCards.forEach(c => {
                        c.el.classList.add('matched');
                        c.el.classList.add('match-pulse');
                    });
                    matchedCount++;
                    mistakes = 0;
                    document.getElementById('matches-' + gameId).innerText = matchedCount;
                    updatePsiIndex();
                    updateStatus('PATTERN MATCH CONFIRMED', 'success');

                    const warning = document.getElementById('warning-' + gameId);
                    if (warning) warning.classList.remove('visible');

                    if (card.info) {
                        showModal(card.info);
                    } else {
                        flippedCards = [];
                        locked = false;
                        checkWin();
                    }
                }, 600);
            }

            function handleMismatch() {
                mistakes++;
                updateStatus('NO CORRELATION DETECTED', 'error');

                if (penaltyShuffle && mistakes === 2) {
                    const warning = document.getElementById('warning-' + gameId);
                    if (warning) warning.classList.add('visible');
                }

                setTimeout(() => {
                    flippedCards.forEach(c => c.el.classList.remove('flipped'));
                    flippedCards = [];
                    updatePsiIndex();

                    if (penaltyShuffle && mistakes >= 3) {
                        const warning = document.getElementById('warning-' + gameId);
                        if (warning) warning.classList.remove('visible');
                        triggerPenalty();
                    } else {
                        locked = false;
                        updateStatus('AWAITING INPUT', '');
                    }
                }, 1800);
            }

            function triggerPenalty() {
                updateStatus('NEURAL INTERFERENCE — RESHUFFLING', 'warning');
                const grid = document.getElementById('grid-' + gameId);
                grid.classList.add('psi-shake');
                setTimeout(() => {
                    grid.classList.remove('psi-shake');
                    for (let i = grid.children.length; i >= 0; i--) {
                        grid.appendChild(grid.children[Math.random() * i | 0]);
                    }
                    mistakes = 0;
                    locked = false;
                    updateStatus('AWAITING INPUT', '');
                }, 800);
            }

            function showModal(info) {
                const modal = document.getElementById('modal-' + gameId);
                document.getElementById('modal-body-' + gameId).textContent = info;
                modal.classList.add('visible');
            }

            window.closeGameModal = function(id) {
                document.getElementById('modal-' + id).classList.remove('visible');
                flippedCards = [];
                locked = false;
                checkWin();
            };

            function calculateRating() {
                const optimalMoves = totalPairs;
                const ratio = optimalMoves / moves;
                if (ratio >= 0.9) return 'EXCEPTIONAL';
                if (ratio >= 0.7) return 'SUPERIOR';
                if (ratio >= 0.5) return 'NOMINAL';
                if (ratio >= 0.3) return 'ADEQUATE';
                return 'BASELINE';
            }

            function checkWin() {
                if (matchedCount === totalPairs) {
                    updateStatus('TEST COMPLETE', 'success');
                    document.getElementById('final-moves-' + gameId).textContent = moves;
                    document.getElementById('final-rating-' + gameId).textContent = calculateRating();
                    setTimeout(() => {
                        document.getElementById('overlay-' + gameId).classList.add('visible');
                    }, 500);
                    if (window.completeGamificationActivity) {
                        window.completeGamificationActivity(gameId);
                    }
                }
            }

            window.initGame_${uniqueId} = function(id) {
                if (id !== gameId) return;
                moves = 0;
                mistakes = 0;
                matchedCount = 0;
                locked = false;
                flippedCards = [];
                document.getElementById('moves-' + gameId).innerText = '000';
                document.getElementById('matches-' + gameId).innerText = '0';
                document.getElementById('overlay-' + gameId).classList.remove('visible');
                updateStatus('AWAITING INPUT', '');
                updatePsiIndex();

                const warning = document.getElementById('warning-' + gameId);
                if (warning) warning.classList.remove('visible');

                cards = shuffle([...rawData]);
                renderGrid();
            }

            window.initGame_${uniqueId}(gameId);
        })();
    </script>

    <style>
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Playfair+Display:wght@400;700&display=swap');

        .psi-lab {
            position: relative;
            max-width: 900px;
            margin: 30px auto;
            background: linear-gradient(145deg, #1a2a2e 0%, #0f1a1c 50%, #162224 100%);
            border-radius: 4px;
            overflow: hidden;
            font-family: 'IBM Plex Mono', monospace;
            color: #c4d4d6;
            border: 2px solid #2a3a3e;
            box-shadow:
                inset 0 1px 0 rgba(255, 255, 255, 0.05),
                inset 0 0 60px rgba(0, 0, 0, 0.4),
                0 10px 40px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(0, 0, 0, 0.3);
        }

        /* Fullscreen Button */
        .psi-fullscreen-btn {
            position: absolute;
            top: 12px;
            right: 12px;
            z-index: 150;
            width: 32px;
            height: 32px;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid #3a4a4e;
            border-radius: 3px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            color: #8fa4a8;
            font-size: 1rem;
        }

        .psi-fullscreen-btn:hover {
            background: rgba(212, 175, 55, 0.15);
            border-color: #d4af37;
            color: #d4af37;
        }

        .psi-fs-collapse { display: none; transform: rotate(45deg); }

        /* CSS Fullscreen Mode */
        .psi-activity-maximized {
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
            background: #0a1214;
        }

        .psi-maximized, .psi-native-fullscreen {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            border-radius: 0 !important;
            border: none !important;
            z-index: 999999 !important;
            display: flex;
            flex-direction: column;
        }

        .psi-maximized .psi-main,
        .psi-native-fullscreen .psi-main {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .psi-maximized .psi-grid-container,
        .psi-native-fullscreen .psi-grid-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .psi-maximized .psi-grid,
        .psi-native-fullscreen .psi-grid {
            max-width: 1000px;
        }

        .psi-maximized .psi-card,
        .psi-native-fullscreen .psi-card {
            min-width: 120px;
            min-height: 160px;
        }

        /* Atmospheric Effects */
        .psi-noise {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
            opacity: 0.03;
            pointer-events: none;
            z-index: 1;
        }

        .psi-vignette {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.4) 100%);
            pointer-events: none;
            z-index: 2;
        }

        .psi-scanlines {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0, 0, 0, 0.1) 2px,
                rgba(0, 0, 0, 0.1) 4px
            );
            pointer-events: none;
            z-index: 3;
            opacity: 0.3;
        }

        /* Header */
        .psi-header {
            position: relative;
            z-index: 10;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 20px 24px 16px;
            border-bottom: 1px solid #2a3a3e;
            background: linear-gradient(180deg, rgba(42, 58, 62, 0.3) 0%, transparent 100%);
        }

        .psi-header-left { display: flex; flex-direction: column; gap: 8px; }

        .psi-logo {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .psi-logo-icon {
            font-size: 1.8rem;
            color: #d4af37;
            text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
            animation: psi-pulse 3s ease-in-out infinite;
        }

        @keyframes psi-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }

        .psi-logo-text {
            display: flex;
            flex-direction: column;
        }

        .psi-logo-main {
            font-family: 'Playfair Display', serif;
            font-size: 0.95rem;
            font-weight: 700;
            letter-spacing: 2px;
            color: #e8d5a3;
        }

        .psi-logo-sub {
            font-size: 0.65rem;
            letter-spacing: 3px;
            color: #6a7a7e;
            margin-top: 2px;
        }

        .psi-required {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.65rem;
            letter-spacing: 2px;
            color: #c9a227;
            background: rgba(201, 162, 39, 0.1);
            border: 1px solid rgba(201, 162, 39, 0.3);
            padding: 4px 10px;
            border-radius: 2px;
            width: fit-content;
        }

        .psi-req-dot {
            width: 6px;
            height: 6px;
            background: #c9a227;
            border-radius: 50%;
            animation: psi-blink 1s ease-in-out infinite;
        }

        @keyframes psi-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        .psi-header-right {
            text-align: right;
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .psi-classification {
            font-size: 0.7rem;
            letter-spacing: 3px;
            color: #8b4513;
            background: linear-gradient(90deg, transparent, rgba(139, 69, 19, 0.15), transparent);
            padding: 4px 12px;
        }

        .psi-date {
            font-size: 0.65rem;
            color: #5a6a6e;
            letter-spacing: 1px;
        }

        /* Status Bar */
        .psi-status-bar {
            position: relative;
            z-index: 10;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 24px;
            background: rgba(0, 0, 0, 0.2);
            border-bottom: 1px solid #2a3a3e;
        }

        .psi-indicator {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .psi-indicator-light {
            width: 10px;
            height: 10px;
            background: #4a5a5e;
            border-radius: 50%;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.5);
            transition: all 0.3s ease;
        }

        .psi-light-active {
            background: #d4af37;
            box-shadow: 0 0 10px rgba(212, 175, 55, 0.6), inset 0 1px 2px rgba(255,255,255,0.3);
        }

        .psi-light-success {
            background: #4ade80;
            box-shadow: 0 0 10px rgba(74, 222, 128, 0.6), inset 0 1px 2px rgba(255,255,255,0.3);
        }

        .psi-light-error {
            background: #ef4444;
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.6), inset 0 1px 2px rgba(255,255,255,0.3);
        }

        .psi-light-warning {
            background: #f59e0b;
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.6), inset 0 1px 2px rgba(255,255,255,0.3);
            animation: psi-blink 0.5s ease-in-out infinite;
        }

        .psi-indicator-text {
            font-size: 0.7rem;
            letter-spacing: 2px;
            color: #8fa4a8;
        }

        .psi-meters {
            display: flex;
            gap: 24px;
        }

        .psi-meter {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }

        .psi-meter-label {
            font-size: 0.6rem;
            letter-spacing: 2px;
            color: #5a6a6e;
        }

        .psi-meter-display {
            display: flex;
            align-items: baseline;
            gap: 2px;
        }

        .psi-meter-value {
            font-size: 1.1rem;
            font-weight: 600;
            color: #d4af37;
            font-family: 'IBM Plex Mono', monospace;
        }

        .psi-meter-slash {
            color: #4a5a5e;
            font-size: 0.9rem;
        }

        .psi-meter-total {
            color: #6a7a7e;
            font-size: 0.9rem;
        }

        .psi-psi-meter { min-width: 100px; }

        .psi-psi-bar {
            width: 100%;
            height: 8px;
            background: #1a2a2e;
            border-radius: 2px;
            border: 1px solid #2a3a3e;
            overflow: hidden;
        }

        .psi-psi-fill {
            height: 100%;
            width: 0%;
            background: linear-gradient(90deg, #d4af37, #e8d5a3);
            transition: width 0.5s ease;
            box-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
        }

        /* Main Area */
        .psi-main {
            position: relative;
            z-index: 10;
            padding: 20px 24px;
        }

        .psi-instructions {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
            padding: 10px 20px;
            background: rgba(212, 175, 55, 0.05);
            border: 1px dashed rgba(212, 175, 55, 0.2);
            border-radius: 2px;
        }

        .psi-inst-icon {
            color: #d4af37;
            font-size: 1rem;
        }

        .psi-inst-text {
            font-size: 0.7rem;
            letter-spacing: 2px;
            color: #8fa4a8;
        }

        .psi-grid-container {
            display: flex;
            justify-content: center;
        }

        .psi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
            gap: 12px;
            width: 100%;
            max-width: 700px;
            perspective: 1000px;
        }

        @media (min-width: 640px) {
            .psi-grid {
                grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
                gap: 16px;
            }
        }

        /* Cards */
        .psi-card {
            aspect-ratio: 3/4;
            position: relative;
            cursor: pointer;
            animation: psi-card-appear 0.4s ease backwards;
        }

        @keyframes psi-card-appear {
            from {
                opacity: 0;
                transform: scale(0.8) rotateX(-10deg);
            }
            to {
                opacity: 1;
                transform: scale(1) rotateX(0);
            }
        }

        .psi-card-inner {
            position: relative;
            width: 100%;
            height: 100%;
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            transform-style: preserve-3d;
        }

        .psi-card.flipped .psi-card-inner {
            transform: rotateY(180deg);
        }

        .psi-card-front, .psi-card-back {
            position: absolute;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            box-sizing: border-box;
        }

        .psi-card-front {
            background: linear-gradient(145deg, #1e3035 0%, #152528 100%);
            border: 2px solid #2a4045;
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,0.05),
                inset 0 -2px 10px rgba(0,0,0,0.3),
                0 4px 12px rgba(0,0,0,0.3);
        }

        .psi-card-front::before {
            content: '';
            position: absolute;
            top: 8px; left: 8px; right: 8px; bottom: 8px;
            border: 1px solid #2a4045;
            border-radius: 2px;
            pointer-events: none;
        }

        .psi-card-symbol {
            font-size: 2rem;
            color: #3a5055;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        }

        .psi-card:hover .psi-card-symbol {
            color: #d4af37;
            text-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
        }

        .psi-card-number {
            position: absolute;
            bottom: 12px;
            font-size: 0.6rem;
            letter-spacing: 2px;
            color: #3a5055;
        }

        .psi-card-back {
            background: linear-gradient(145deg, #f5f0e1 0%, #e8e0cc 100%);
            border: 2px solid #c9b896;
            transform: rotateY(180deg);
            padding: 12px;
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,0.8),
                inset 0 -2px 10px rgba(0,0,0,0.1),
                0 4px 12px rgba(0,0,0,0.3);
        }

        .psi-card-back::before {
            content: '';
            position: absolute;
            top: 6px; left: 6px; right: 6px; bottom: 6px;
            border: 1px solid #d4c4a8;
            border-radius: 2px;
            pointer-events: none;
        }

        .psi-card-text {
            font-family: 'Playfair Display', serif;
            font-size: 0.85rem;
            color: #2a3a3e;
            text-align: center;
            line-height: 1.4;
            word-break: break-word;
            overflow: hidden;
        }

        .psi-card-back img {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 2px;
        }

        .psi-card.matched .psi-card-inner {
            box-shadow: 0 0 0 3px #d4af37, 0 0 30px rgba(212, 175, 55, 0.4);
            border-radius: 4px;
        }

        .psi-card.match-pulse {
            animation: psi-match-pulse 0.6s ease;
        }

        @keyframes psi-match-pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        /* Warning */
        .psi-warning {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-top: 20px;
            padding: 14px 20px;
            background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.1), transparent);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 2px;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
            pointer-events: none;
        }

        .psi-warning.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .psi-warning-icon {
            color: #ef4444;
            font-size: 1.2rem;
            animation: psi-blink 0.5s ease-in-out infinite;
        }

        .psi-warning-text {
            font-size: 0.7rem;
            letter-spacing: 2px;
            color: #ef4444;
        }

        @keyframes psi-shake {
            0%, 100% { transform: translateX(0) rotate(0); }
            20% { transform: translateX(-8px) rotate(-1deg); }
            40% { transform: translateX(8px) rotate(1deg); }
            60% { transform: translateX(-8px) rotate(-1deg); }
            80% { transform: translateX(8px) rotate(1deg); }
        }

        .psi-shake { animation: psi-shake 0.6s ease; }

        /* Footer */
        .psi-footer {
            position: relative;
            z-index: 10;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 24px;
            border-top: 1px solid #2a3a3e;
            background: rgba(0, 0, 0, 0.2);
            font-size: 0.6rem;
            letter-spacing: 1px;
            color: #4a5a5e;
        }

        .psi-footer-left, .psi-footer-right {
            display: flex;
            gap: 16px;
        }

        .psi-footer-center {
            flex: 1;
            display: flex;
            justify-content: center;
            padding: 0 20px;
        }

        .psi-wave {
            width: 120px;
            height: 30px;
            color: #3a5055;
        }

        .psi-wave svg {
            width: 100%;
            height: 100%;
        }

        /* Overlay */
        .psi-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 26, 28, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.5s ease;
            z-index: 100;
        }

        .psi-overlay.visible {
            opacity: 1;
            pointer-events: auto;
        }

        .psi-overlay-content {
            text-align: center;
            padding: 40px;
            max-width: 400px;
        }

        .psi-success-icon {
            font-size: 3rem;
            color: #d4af37;
            text-shadow: 0 0 40px rgba(212, 175, 55, 0.6);
            animation: psi-pulse 2s ease-in-out infinite;
            margin-bottom: 16px;
        }

        .psi-success-title {
            font-family: 'Playfair Display', serif;
            font-size: 1.8rem;
            font-weight: 700;
            letter-spacing: 4px;
            color: #e8d5a3;
            margin-bottom: 8px;
        }

        .psi-success-subtitle {
            font-size: 0.7rem;
            letter-spacing: 3px;
            color: #6a7a7e;
            margin-bottom: 30px;
        }

        .psi-results {
            display: flex;
            justify-content: center;
            gap: 40px;
            margin-bottom: 30px;
        }

        .psi-result-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .psi-result-label {
            font-size: 0.6rem;
            letter-spacing: 2px;
            color: #5a6a6e;
        }

        .psi-result-value {
            font-size: 1.5rem;
            font-weight: 600;
            color: #d4af37;
        }

        .psi-rating {
            font-size: 1rem !important;
            letter-spacing: 2px;
        }

        .psi-stamp {
            font-size: 0.8rem;
            letter-spacing: 4px;
            color: #4ade80;
            padding: 10px 20px;
            border: 2px solid #4ade80;
            display: inline-block;
            margin-bottom: 30px;
            transform: rotate(-3deg);
            box-shadow: 0 0 20px rgba(74, 222, 128, 0.2);
        }

        .psi-button {
            background: transparent;
            border: 2px solid #d4af37;
            color: #d4af37;
            padding: 14px 32px;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 0.75rem;
            letter-spacing: 3px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .psi-button::before {
            content: '';
            position: absolute;
            top: 0; left: -100%; right: 100%; bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent);
            transition: all 0.5s ease;
        }

        .psi-button:hover::before {
            left: 100%;
            right: -100%;
        }

        .psi-button:hover {
            background: rgba(212, 175, 55, 0.1);
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
        }

        /* Modal */
        .psi-modal {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            z-index: 200;
            transition: opacity 0.3s ease;
        }

        .psi-modal.visible {
            opacity: 1;
            pointer-events: auto;
        }

        .psi-modal-content {
            background: linear-gradient(145deg, #1a2a2e 0%, #0f1a1c 100%);
            border: 2px solid #2a3a3e;
            border-radius: 4px;
            max-width: 420px;
            width: 90%;
            overflow: hidden;
            box-shadow:
                0 20px 60px rgba(0, 0, 0, 0.6),
                inset 0 1px 0 rgba(255, 255, 255, 0.05);
            animation: psi-modal-appear 0.3s ease;
        }

        @keyframes psi-modal-appear {
            from {
                opacity: 0;
                transform: scale(0.9) translateY(20px);
            }
            to {
                opacity: 1;
                transform: scale(1) translateY(0);
            }
        }

        .psi-modal-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            background: rgba(74, 222, 128, 0.1);
            border-bottom: 1px solid #2a3a3e;
            font-size: 0.8rem;
            letter-spacing: 2px;
            color: #4ade80;
        }

        .psi-modal-icon {
            font-size: 1.2rem;
            animation: psi-pulse 1.5s ease-in-out infinite;
        }

        .psi-modal-body {
            padding: 24px 20px;
            font-family: 'Playfair Display', serif;
            font-size: 1rem;
            line-height: 1.6;
            color: #c4d4d6;
            text-align: center;
        }

        .psi-modal-footer {
            padding: 16px 20px;
            border-top: 1px solid #2a3a3e;
            display: flex;
            justify-content: center;
        }

        .psi-button-modal {
            padding: 10px 24px;
            font-size: 0.7rem;
        }

        /* Responsive */
        @media (max-width: 600px) {
            .psi-header {
                flex-direction: column;
                gap: 12px;
            }

            .psi-header-right {
                text-align: left;
            }

            .psi-logo-main {
                font-size: 0.8rem;
            }

            .psi-status-bar {
                flex-direction: column;
                gap: 12px;
            }

            .psi-meters {
                width: 100%;
                justify-content: space-around;
            }

            .psi-inst-text {
                font-size: 0.6rem;
                letter-spacing: 1px;
            }

            .psi-footer {
                flex-direction: column;
                gap: 8px;
                text-align: center;
            }

            .psi-footer-left, .psi-footer-right {
                justify-content: center;
            }
        }
    </style>
    `;
}
