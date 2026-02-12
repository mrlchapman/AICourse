/**
 * Millionaire Game Engine
 * Pure game logic separated from rendering
 * This can be used with any theme/style
 */

import { GamificationActivity, safeJsonEmbed } from '../core/types';

/** Configuration for Millionaire game */
export interface MillionaireConfig {
  questions: MillionaireQuestion[];
  timerSeconds: number;
  required: boolean;
}

/** A question in the millionaire game */
export interface MillionaireQuestion {
  id: string;
  question: string;
  answers: string[];
  correctIndex: number;
  hint?: string;
  explanation?: string;
}

/** Prize ladder for the game */
export const PRIZE_LADDER = [
  '\u00A3100', '\u00A3200', '\u00A3300', '\u00A3500', '\u00A31,000',
  '\u00A32,000', '\u00A34,000', '\u00A38,000', '\u00A316,000', '\u00A332,000',
  '\u00A364,000', '\u00A3125,000', '\u00A3250,000', '\u00A3500,000', '\u00A31 MILLION'
];

/** Safe points in the ladder (0-indexed) - Q5 and Q10 */
export const SAFE_POINTS = [4, 9];

/**
 * Extracts game configuration from activity
 */
export function extractConfig(activity: GamificationActivity): MillionaireConfig {
  // AI sometimes puts questions under "questions" instead of "millionaireQuestions"
  const questions = activity.config?.millionaireQuestions
    || activity.config?.questions
    || [];
  return {
    questions: (questions as MillionaireQuestion[]).filter((q: any) => q && q.question && Array.isArray(q.answers) && q.answers.length >= 2),
    timerSeconds: activity.config?.timerSeconds || 30,
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
  config: MillionaireConfig,
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
        const LADDER = ${JSON.stringify(PRIZE_LADDER)};
        const SAFE_POINTS = ${JSON.stringify(SAFE_POINTS)};
        const TIME_PER_Q = ${config.timerSeconds};

        // State
        let qIdx = 0;
        let prize = '\u00A30';
        let safePrize = '\u00A30';
        let correctCount = 0;
        let totalAnswered = 0;
        let lifelines = { fifty: true, hint: true, skip: true };
        let usedLifelines = { fifty: 0, hint: 0, skip: 0 };
        let timedMode = true;
        let timerLeft = TIME_PER_Q;
        let timerId = null;
        let inputLocked = false;
        let reviewWrong = [];
        let pendingAnswer = null;
        let isFullscreen = false;

        // === INIT ===
        window['startGame_' + uniqueId] = function() {
            qIdx = 0;
            prize = '\u00A30';
            safePrize = '\u00A30';
            correctCount = 0;
            totalAnswered = 0;
            lifelines = { fifty: true, hint: true, skip: true };
            usedLifelines = { fifty: 0, hint: 0, skip: 0 };
            reviewWrong = [];
            inputLocked = false;

            hideModal('start-' + gameId);
            hideModal('end-modal-' + gameId);
            showEl('game-screen-' + gameId);

            renderLadder();
            renderLifelines();
            loadQuestion();
        };

        function showEl(id) { document.getElementById(id).classList.add('active'); }
        function hideModal(id) { document.getElementById(id).classList.remove('active'); }

        // === FULLSCREEN ===
        window['toggleMillFullscreen_' + uniqueId] = function() {
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
            const el = document.getElementById('ladder-' + gameId);
            el.innerHTML = '';

            for (let i = LADDER.length - 1; i >= 0; i--) {
                const step = document.createElement('div');
                step.className = '${classPrefix}-step';
                if (i === qIdx) step.classList.add('current');
                if (i < qIdx) step.classList.add('passed');
                if (SAFE_POINTS.includes(i)) step.classList.add('safe');

                step.innerHTML = '<span>' + (i + 1) + '</span><span>' + LADDER[i] + '</span>';
                el.appendChild(step);
            }
        }

        // === LIFELINES ===
        function renderLifelines() {
            document.getElementById('life-5050-' + gameId).disabled = !lifelines.fifty;
            document.getElementById('life-hint-' + gameId).disabled = !lifelines.hint;
            document.getElementById('life-skip-' + gameId).disabled = !lifelines.skip;
        }

        window['useFiftyFifty_' + uniqueId] = function() {
            if (!lifelines.fifty || inputLocked) return;

            const q = QUESTIONS[qIdx];
            const wrongOpts = [0,1,2,3].filter(i => i !== q.correctIndex);
            const toRemove = shuffleArray(wrongOpts).slice(0, 2);

            toRemove.forEach(i => {
                const btn = document.getElementById('opt-' + gameId + '-' + i);
                if (btn) {
                    btn.classList.add('hidden');
                    btn.disabled = true;
                }
            });

            lifelines.fifty = false;
            usedLifelines.fifty++;
            renderLifelines();
        };

        window['useHint_' + uniqueId] = function() {
            if (!lifelines.hint || inputLocked) return;
            stopTimer();

            lifelines.hint = false;
            usedLifelines.hint++;
            renderLifelines();

            const hint = QUESTIONS[qIdx].hint || QUESTIONS[qIdx].explanation || 'Think carefully about this one!';
            showFeedback('Hint', hint, true, 'Back to Question', () => {
                if (timedMode && !inputLocked) startTimer();
            });
        };

        window['useSkip_' + uniqueId] = function() {
            if (!lifelines.skip || inputLocked) return;
            stopTimer();

            lifelines.skip = false;
            usedLifelines.skip++;

            // Award prize for the skipped level
            prize = LADDER[qIdx];

            // Check if we just skipped a safe point - secure it!
            if (SAFE_POINTS.includes(qIdx)) safePrize = prize;

            qIdx++;
            updateHUD();
            renderLifelines();
            loadQuestion();
        };

        window['walkAway_' + uniqueId] = function() {
            if (inputLocked) return;
            stopTimer();
            endGame('walked');
        };

        // === TIMER ===
        window['toggleTimer_' + uniqueId] = function() {
            if (inputLocked) return;
            timedMode = !timedMode;
            updateHUD();
            if (timedMode) startTimer();
            else stopTimer();
        };

        function startTimer() {
            stopTimer();
            timerLeft = TIME_PER_Q;
            updateTimerUI();

            timerId = setInterval(() => {
                timerLeft--;
                updateTimerUI();
                if (timerLeft <= 0) {
                    stopTimer();
                    handleWrong(-1);
                }
            }, 1000);
        }

        function stopTimer() {
            if (timerId) {
                clearInterval(timerId);
                timerId = null;
            }
        }

        function updateTimerUI() {
            const bar = document.getElementById('timer-bar-' + gameId);
            const txt = document.getElementById('timer-text-' + gameId);
            const pct = (timerLeft / TIME_PER_Q) * 100;

            bar.style.width = pct + '%';
            txt.innerText = timerLeft;

            if (timerLeft > 20) bar.className = '${classPrefix}-timer-bar';
            else if (timerLeft > 10) bar.className = '${classPrefix}-timer-bar warning';
            else bar.className = '${classPrefix}-timer-bar danger';
        }

        function updateHUD() {
            document.getElementById('banked-' + gameId).innerText = 'Banked: ' + safePrize;
            document.getElementById('playing-' + gameId).innerText = 'Playing for: ' + (LADDER[qIdx] || 'MAX');

            const toggle = document.getElementById('timer-toggle-' + gameId);
            toggle.className = '${classPrefix}-timer-toggle' + (timedMode ? ' active' : '');
            toggle.innerText = timedMode ? '\u23F1 ON' : '\u23F1 OFF';
        }

        // === QUESTION ===
        function loadQuestion() {
            if (qIdx >= QUESTIONS.length || qIdx >= LADDER.length) {
                endGame('won');
                return;
            }

            const q = QUESTIONS[qIdx];
            document.getElementById('question-' + gameId).innerText = q.question;

            const opts = document.getElementById('options-' + gameId);
            opts.innerHTML = '';
            inputLocked = false;
            pendingAnswer = null;

            const labels = ['A', 'B', 'C', 'D'];
            q.answers.forEach((txt, i) => {
                const btn = document.createElement('button');
                btn.className = '${classPrefix}-opt';
                btn.id = 'opt-' + gameId + '-' + i;
                btn.innerHTML = '<span class="${classPrefix}-opt-label">' + labels[i] + ':</span> ' + txt;
                btn.onclick = () => selectAnswer(i);
                opts.appendChild(btn);
            });

            updateHUD();
            renderLadder();

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

            clearSelected();
            const btn = document.getElementById('opt-' + gameId + '-' + idx);
            if (!btn || btn.classList.contains('hidden') || btn.disabled) return;

            btn.classList.add('selected');
            pendingAnswer = idx;
            stopTimer();

            openConfirmModal(idx);
        }

        function clearSelected() {
            for (let i = 0; i < 4; i++) {
                const btn = document.getElementById('opt-' + gameId + '-' + i);
                if (btn) btn.classList.remove('selected');
            }
        }

        function openConfirmModal(idx) {
            const q = QUESTIONS[qIdx];
            const label = ['A', 'B', 'C', 'D'][idx];

            document.getElementById('confirm-text-' + gameId).innerHTML =
                'You selected <strong>' + label + '</strong>:<br><br>' +
                '<span style="color:#00f0ff; font-size:1.2rem;">' + q.answers[idx] + '</span>';

            document.getElementById('confirm-modal-' + gameId).classList.add('active');

            document.getElementById('confirm-yes-' + gameId).onclick = () => {
                hideModal('confirm-modal-' + gameId);
                confirmAnswer(idx);
            };

            document.getElementById('confirm-no-' + gameId).onclick = () => {
                hideModal('confirm-modal-' + gameId);
                clearSelected();
                pendingAnswer = null;
                if (timedMode && !inputLocked) startTimer();
            };
        }

        function confirmAnswer(idx) {
            inputLocked = true;

            for (let i = 0; i < 4; i++) {
                const btn = document.getElementById('opt-' + gameId + '-' + i);
                if (btn) btn.disabled = true;
            }

            setTimeout(() => {
                const q = QUESTIONS[qIdx];
                const picked = document.getElementById('opt-' + gameId + '-' + idx);
                const correct = document.getElementById('opt-' + gameId + '-' + q.correctIndex);

                if (idx === q.correctIndex) {
                    picked.classList.remove('selected');
                    picked.classList.add('correct');
                    handleCorrect();
                } else {
                    picked.classList.remove('selected');
                    picked.classList.add('wrong');
                    if (correct) correct.classList.add('correct');
                    handleWrong(idx);
                }
            }, 1000);
        }

        function handleCorrect() {
            prize = LADDER[qIdx];
            correctCount++;
            totalAnswered++;

            if (SAFE_POINTS.includes(qIdx)) safePrize = prize;

            updateHUD();
            renderLadder();

            showFeedback('Correct!', 'That is the right answer!', true, 'Continue', () => {
                qIdx++;
                loadQuestion();
            });
        }

        function handleWrong(pickedIdx) {
            const q = QUESTIONS[qIdx];
            reviewWrong.push({
                q: q.question,
                user: pickedIdx === -1 ? 'Timeout' : q.answers[pickedIdx],
                correct: q.answers[q.correctIndex],
                exp: q.explanation,
                level: qIdx + 1
            });
            totalAnswered++;
            prize = safePrize;

            updateHUD();
            showFeedback('Wrong Answer', q.explanation, false, 'Continue', () => {
                endGame('lost');
            });
        }

        // === FEEDBACK MODAL ===
        function showFeedback(title, msg, isCorrect, btnText, onClose) {
            const modal = document.getElementById('feedback-modal-' + gameId);
            const titleEl = document.getElementById('fb-title-' + gameId);
            const msgEl = document.getElementById('fb-msg-' + gameId);
            const btn = document.getElementById('fb-btn-' + gameId);

            titleEl.innerText = title;
            titleEl.className = '${classPrefix}-modal-title ' + (isCorrect ? 'correct' : 'wrong');
            msgEl.innerHTML = msg;
            btn.innerText = btnText;

            modal.classList.add('active');

            btn.onclick = () => {
                modal.classList.remove('active');
                if (onClose) onClose();
            };
        }

        // === END GAME ===
        function endGame(status) {
            const titles = { won: 'MILLIONAIRE!', lost: 'GAME OVER', walked: 'SMART EXIT' };
            const subtitles = { won: 'Congratulations! You won:', lost: 'You leave with safe money:', walked: 'You walked away with:' };

            document.getElementById('end-title-' + gameId).innerText = titles[status];
            document.getElementById('end-title-' + gameId).className = '${classPrefix}-modal-title ' + (status === 'won' ? 'gold' : status === 'lost' ? 'wrong' : 'correct');
            document.getElementById('end-subtitle-' + gameId).innerText = subtitles[status];
            document.getElementById('end-prize-' + gameId).innerText = prize;

            document.getElementById('stat-questions-' + gameId).innerText = totalAnswered;
            const acc = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
            document.getElementById('stat-acc-' + gameId).innerText = acc + '%';

            const usedCount = usedLifelines.fifty + usedLifelines.hint + usedLifelines.skip;
            document.getElementById('stat-lifelines-' + gameId).innerText = usedCount + '/3';
            document.getElementById('stat-safe-' + gameId).innerText = safePrize;

            const list = document.getElementById('review-list-' + gameId);
            if (reviewWrong.length === 0) {
                list.innerHTML = '<div class="${classPrefix}-review-ok">No incorrect answers! Perfect run.</div>';
            } else {
                list.innerHTML = reviewWrong.map(item =>
                    '<div class="${classPrefix}-review-item">' +
                    '<div class="${classPrefix}-review-q">Q' + item.level + ': ' + item.q + '</div>' +
                    '<div class="${classPrefix}-review-ans">You: <span class="wrong">' + item.user + '</span></div>' +
                    '<div class="${classPrefix}-review-ans">Correct: <span class="correct">' + item.correct + '</span></div>' +
                    '<div class="${classPrefix}-review-exp">' + item.exp + '</div>' +
                    '</div>'
                ).join('');
            }

            hideModal('game-screen-' + gameId);
            document.getElementById('end-modal-' + gameId).classList.add('active');

            // Complete activity if won or walked with good progress
            if ((status === 'won' || (status === 'walked' && qIdx >= 5)) && window.completeGamificationActivity) {
                window.completeGamificationActivity(gameId);
            }
        }

        // === UTILS ===
        function shuffleArray(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }
    })();
    </script>
  `;
}
