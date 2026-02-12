/**
 * The Chase Game Engine
 * Pure game logic separated from rendering
 * This can be used with any theme/style
 */

import { GamificationActivity, safeJsonEmbed } from '../core/types';

/** Configuration for The Chase game */
export interface TheChaseConfig {
  questions: ChaseQuestion[];
  timerSeconds: number;
  chaserAccuracy: number;
  headStart: number;
  boardSize: number;
  required: boolean;
}

/** A question in The Chase game */
export interface ChaseQuestion {
  id: string;
  question: string;
  answers: string[];
  correctIndex: number;
  explanation?: string;
}

/**
 * Extracts game configuration from activity
 */
export function extractConfig(activity: GamificationActivity): TheChaseConfig {
  return {
    questions: activity.config?.chaseQuestions || [],
    timerSeconds: activity.config?.chaseTimerSeconds || 20,
    chaserAccuracy: activity.config?.chaserAccuracy || 80,
    headStart: activity.config?.headStart || 2,
    boardSize: activity.config?.boardSize || 7,
    required: activity.config?.required || false,
  };
}

/**
 * Generates the client-side game script
 * This is the JavaScript that runs in the browser
 */
export function generateGameScript(
  gameId: string,
  uniqueId: string,
  config: TheChaseConfig,
  classPrefix: string
): string {
  const questionsJson = safeJsonEmbed(config.questions);

  return `
    <!-- Store questions data safely -->
    <script type="application/json" id="questions-data-${gameId}">${questionsJson}</script>

    <script>
    (function() {
        const gameId = '${gameId}';
        const uniqueId = '${uniqueId}';
        // Safely parse questions from JSON data element
        const questionsEl = document.getElementById('questions-data-' + gameId);
        const QUESTIONS = questionsEl ? JSON.parse(questionsEl.textContent || '[]') : [];
        const BOARD_SIZE = ${config.boardSize};
        const HEAD_START = ${config.headStart};
        const TIME_PER_Q = ${config.timerSeconds};
        const CHASER_ACCURACY = ${config.chaserAccuracy} / 100;

        // State
        let qIdx = 0;
        let playerPos = HEAD_START;
        let chaserPos = 0;
        let timedMode = true;
        let timeLeft = TIME_PER_Q;
        let timerId = null;
        let inputLocked = false;
        let pendingPick = null;
        let isFullscreen = false;

        // === INIT ===
        window['startGame_' + uniqueId] = function() {
            qIdx = 0;
            playerPos = HEAD_START;
            chaserPos = 0;
            inputLocked = false;
            pendingPick = null;

            hideModal('start-' + gameId);
            hideModal('end-modal-' + gameId);
            showEl('game-screen-' + gameId);

            renderLadder();
            loadQuestion();
        };

        function showEl(id) { document.getElementById(id).classList.add('active'); }
        function hideModal(id) { document.getElementById(id).classList.remove('active'); }

        // === FULLSCREEN ===
        window['toggleChaseFullscreen_' + uniqueId] = function() {
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

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isFullscreen) {
                disableCssFullscreen();
            }
        });

        // === LADDER ===
        function renderLadder() {
            const el = document.getElementById('steps-' + gameId);
            el.innerHTML = '';

            for (let i = 0; i < BOARD_SIZE; i++) {
                const step = document.createElement('div');
                step.className = '${classPrefix}-step';
                step.id = 'step-' + gameId + '-' + i;

                // Taper effect
                const pct = 65 + (i / (BOARD_SIZE - 1)) * 35;
                step.style.width = pct + '%';

                // Markers
                const playerMarker = document.createElement('div');
                playerMarker.className = '${classPrefix}-marker player';
                const chaserMarker = document.createElement('div');
                chaserMarker.className = '${classPrefix}-marker chaser';

                step.appendChild(playerMarker);
                step.appendChild(chaserMarker);

                // Label
                const label = document.createElement('span');
                if (i === BOARD_SIZE - 1) {
                    label.innerHTML = 'WIN';
                    label.style.fontWeight = '900';
                } else {
                    label.innerText = i + 1;
                }
                step.appendChild(label);

                el.appendChild(step);
            }

            updatePositions();
        }

        function updatePositions() {
            for (let i = 0; i < BOARD_SIZE; i++) {
                const step = document.getElementById('step-' + gameId + '-' + i);
                step.classList.remove('has-player', 'has-chaser');
            }

            if (playerPos < BOARD_SIZE) {
                document.getElementById('step-' + gameId + '-' + playerPos).classList.add('has-player');
            }
            if (chaserPos < BOARD_SIZE) {
                document.getElementById('step-' + gameId + '-' + chaserPos).classList.add('has-chaser');
            }

            const gap = Math.max(0, playerPos - chaserPos);
            document.getElementById('gap-' + gameId).innerText = gap;
        }

        // === QUESTION ===
        function loadQuestion() {
            if (qIdx >= QUESTIONS.length) qIdx = 0;

            inputLocked = false;
            pendingPick = null;

            const q = QUESTIONS[qIdx];
            document.getElementById('question-' + gameId).innerText = q.question;

            const opts = document.getElementById('options-' + gameId);
            opts.innerHTML = '';

            const labels = ['A', 'B', 'C', 'D'];
            q.answers.forEach((txt, i) => {
                const btn = document.createElement('button');
                btn.className = '${classPrefix}-opt';
                btn.id = 'opt-' + gameId + '-' + i;
                btn.innerHTML = '<span class="${classPrefix}-opt-label">' + labels[i] + '</span> ' + txt;
                btn.onclick = () => selectAnswer(i);
                opts.appendChild(btn);
            });

            if (timedMode) startTimer();
            else {
                stopTimer();
                document.getElementById('timer-text-' + gameId).innerText = '--';
                document.getElementById('timer-bar-' + gameId).style.width = '100%';
            }
        }

        // === ANSWER FLOW ===
        function selectAnswer(idx) {
            if (inputLocked) return;

            inputLocked = true;
            pendingPick = idx;
            stopTimer();

            // Disable all buttons
            for (let i = 0; i < 4; i++) {
                const btn = document.getElementById('opt-' + gameId + '-' + i);
                if (btn) {
                    btn.disabled = true;
                    btn.classList.remove('selected');
                }
            }

            const btn = document.getElementById('opt-' + gameId + '-' + idx);
            btn.classList.add('selected');

            const q = QUESTIONS[qIdx];
            document.getElementById('confirm-text-' + gameId).innerHTML =
                '<span style="font-size:1.4rem; color:#00f0ff;">' + q.answers[idx] + '</span>';

            document.getElementById('confirm-modal-' + gameId).classList.add('active');

            document.getElementById('confirm-yes-' + gameId).onclick = () => {
                hideModal('confirm-modal-' + gameId);
                resolveTurn(idx);
            };

            document.getElementById('confirm-no-' + gameId).onclick = () => {
                hideModal('confirm-modal-' + gameId);
                pendingPick = null;
                inputLocked = false;

                // Re-enable buttons
                for (let i = 0; i < 4; i++) {
                    const btn = document.getElementById('opt-' + gameId + '-' + i);
                    if (btn) {
                        btn.disabled = false;
                        btn.classList.remove('selected');
                    }
                }

                if (timedMode) startTimer();
            };
        }

        function resolveTurn(playerPick) {
            const q = QUESTIONS[qIdx];
            const playerCorrect = playerPick === q.correctIndex;
            const chaserCorrect = Math.random() < CHASER_ACCURACY;

            // Show answer visuals
            if (playerPick >= 0) {
                const pickedBtn = document.getElementById('opt-' + gameId + '-' + playerPick);
                const correctBtn = document.getElementById('opt-' + gameId + '-' + q.correctIndex);

                if (playerCorrect) {
                    pickedBtn.classList.add('correct');
                } else {
                    pickedBtn.classList.add('wrong');
                    if (correctBtn) correctBtn.classList.add('correct');
                }
            } else {
                const correctBtn = document.getElementById('opt-' + gameId + '-' + q.correctIndex);
                if (correctBtn) correctBtn.classList.add('correct');
            }

            // Update player position
            if (playerCorrect) {
                playerPos = Math.min(playerPos + 1, BOARD_SIZE - 1);
                document.getElementById('fb-you-' + gameId).innerHTML = '<span style="color:#2ecc71">Correct</span>';
            } else {
                document.getElementById('fb-you-' + gameId).innerHTML = playerPick === -1
                    ? '<span style="color:#f39c12">Time Out</span>'
                    : '<span style="color:#ff4d4d">Wrong</span>';
            }

            // Show thinking state
            const fbBtn = document.getElementById('fb-btn-' + gameId);
            fbBtn.disabled = true;
            fbBtn.style.opacity = '0.5';
            fbBtn.innerText = 'Wait...';

            document.getElementById('fb-chaser-' + gameId).innerHTML = '<span style="color:#9aa8b6">Thinking...</span>';
            document.getElementById('fb-title-' + gameId).innerText = 'WAIT...';
            document.getElementById('fb-title-' + gameId).style.color = '#e0e6ed';
            document.getElementById('fb-msg-' + gameId).innerText = 'The Chaser is answering...';

            updatePositions();
            document.getElementById('feedback-modal-' + gameId).classList.add('active');

            // Delayed chaser reveal
            setTimeout(() => {
                if (chaserCorrect) {
                    chaserPos = Math.min(chaserPos + 1, BOARD_SIZE - 1);
                    document.getElementById('fb-chaser-' + gameId).innerHTML = '<span style="color:#ff4d4d">Correct (Moved Up)</span>';
                } else {
                    document.getElementById('fb-chaser-' + gameId).innerHTML = '<span style="color:#9aa8b6">Wrong (Stayed)</span>';
                }

                updatePositions();

                // Check game over
                let gameOver = false;
                let result = '';

                if (chaserPos >= playerPos) {
                    gameOver = true;
                    result = 'lose';
                    document.getElementById('fb-title-' + gameId).innerText = 'CAUGHT!';
                    document.getElementById('fb-title-' + gameId).style.color = '#ff4d4d';
                    document.getElementById('fb-msg-' + gameId).innerHTML = 'The Chaser caught you.<br>You go home with nothing.';
                } else if (playerPos >= BOARD_SIZE - 1) {
                    gameOver = true;
                    result = 'win';
                    document.getElementById('fb-title-' + gameId).innerText = 'ESCAPED!';
                    document.getElementById('fb-title-' + gameId).style.color = '#d4af37';
                    document.getElementById('fb-msg-' + gameId).innerHTML = 'You reached the top!<br>You beat the Chaser!';
                } else {
                    document.getElementById('fb-title-' + gameId).innerText = playerCorrect ? 'GOOD MOVE' : 'WATCH OUT';
                    document.getElementById('fb-title-' + gameId).style.color = playerCorrect ? '#2ecc71' : '#e0e6ed';
                    const gap = playerPos - chaserPos;
                    document.getElementById('fb-msg-' + gameId).innerHTML =
                        'You are <strong>' + gap + '</strong> step' + (gap === 1 ? '' : 's') + ' ahead.<br><br>' +
                        'Correct answer: <strong>' + q.answers[q.correctIndex] + '</strong>';
                }

                fbBtn.disabled = false;
                fbBtn.style.opacity = '1';
                fbBtn.innerText = 'Continue';

                fbBtn.onclick = () => {
                    hideModal('feedback-modal-' + gameId);
                    if (gameOver) endGame(result);
                    else {
                        qIdx++;
                        loadQuestion();
                    }
                };
            }, 1500);
        }

        function timeout() {
            if (inputLocked) return;
            inputLocked = true;

            for (let i = 0; i < 4; i++) {
                const btn = document.getElementById('opt-' + gameId + '-' + i);
                if (btn) btn.disabled = true;
            }

            resolveTurn(-1);
        }

        // === TIMER ===
        window['toggleTimer_' + uniqueId] = function() {
            timedMode = !timedMode;
            updateTimerUI();
            if (timedMode && !inputLocked) startTimer();
            else stopTimer();
        };

        function startTimer() {
            stopTimer();
            timeLeft = TIME_PER_Q;
            paintTimer();

            timerId = setInterval(() => {
                timeLeft--;
                paintTimer();
                if (timeLeft <= 0) {
                    stopTimer();
                    timeout();
                }
            }, 1000);
        }

        function stopTimer() {
            if (timerId) {
                clearInterval(timerId);
                timerId = null;
            }
        }

        function paintTimer() {
            const bar = document.getElementById('timer-bar-' + gameId);
            const txt = document.getElementById('timer-text-' + gameId);
            const pct = (timeLeft / TIME_PER_Q) * 100;

            bar.style.width = pct + '%';
            txt.innerText = timeLeft;

            if (timeLeft > 10) bar.className = '${classPrefix}-timer-bar';
            else if (timeLeft > 5) bar.className = '${classPrefix}-timer-bar warning';
            else bar.className = '${classPrefix}-timer-bar danger';
        }

        function updateTimerUI() {
            const btn = document.getElementById('timer-toggle-' + gameId);
            btn.className = '${classPrefix}-timer-btn' + (timedMode ? ' active' : '');
            btn.innerText = timedMode ? '\\u23F1 ON' : '\\u23F1 OFF';
        }

        // === END GAME ===
        function endGame(result) {
            stopTimer();

            const title = document.getElementById('end-title-' + gameId);
            const text = document.getElementById('end-text-' + gameId);

            if (result === 'win') {
                title.innerText = 'VICTORY';
                title.style.color = '#d4af37';
                text.innerHTML = 'You beat the Chaser!<br><br><span style="font-size:2rem; color:#d4af37;">\\u{1F3C6} WINNER!</span>';

                if (window.completeGamificationActivity) {
                    window.completeGamificationActivity(gameId);
                }
            } else {
                title.innerText = 'CAUGHT';
                title.style.color = '#ff4d4d';
                text.innerHTML = 'The Chaser caught you.<br>Better luck next time!';
            }

            hideModal('game-screen-' + gameId);
            document.getElementById('end-modal-' + gameId).classList.add('active');
        }
    })();
    </script>
  `;
}
