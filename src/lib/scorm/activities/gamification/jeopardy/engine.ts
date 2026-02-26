/**
 * Jeopardy Game Engine
 * Pure game logic separated from rendering
 */

import { GamificationActivity, safeJsonEmbed } from '../core/types';

export interface JeopardyClue {
  id: string;
  pointValue: number;
  answer: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  isDailyDouble?: boolean;
}

export interface JeopardyCategory {
  name: string;
  clues: JeopardyClue[];
}

export interface FinalJeopardyData {
  category: string;
  answer: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface JeopardyConfig {
  categories: JeopardyCategory[];
  finalJeopardy: FinalJeopardyData | null;
  timerSeconds: number;
  required: boolean;
}

export const POINT_VALUES = [200, 400, 600, 800, 1000];

/**
 * Extracts game configuration from activity
 */
export function extractConfig(activity: GamificationActivity): JeopardyConfig {
  const categories = (activity.config?.jeopardyCategories || []) as JeopardyCategory[];
  const finalJeopardy = (activity.config?.finalJeopardy as FinalJeopardyData) || null;

  return {
    categories: categories.filter(
      (c) => c && c.name && Array.isArray(c.clues) && c.clues.length > 0
    ),
    finalJeopardy:
      finalJeopardy && finalJeopardy.answer && Array.isArray(finalJeopardy.options)
        ? finalJeopardy
        : null,
    timerSeconds: activity.config?.jeopardyTimerSeconds || 20,
    required: activity.config?.required || false,
  };
}

/**
 * Generates the client-side game script
 */
export function generateGameScript(
  gameId: string,
  uniqueId: string,
  config: JeopardyConfig,
  classPrefix: string
): string {
  const categoriesJson = safeJsonEmbed(config.categories);
  const finalJson = safeJsonEmbed(config.finalJeopardy);

  return `
    <script type="application/json" id="jep-categories-${gameId}">${categoriesJson}</script>
    <script type="application/json" id="jep-final-${gameId}">${finalJson}</script>

    <script>
    (function() {
        const gameId = '${gameId}';
        const uniqueId = '${uniqueId}';
        const prefix = '${classPrefix}';
        const TIME_PER_Q = ${config.timerSeconds};

        const catEl = document.getElementById('jep-categories-' + gameId);
        const CATEGORIES = catEl ? JSON.parse(catEl.textContent || '[]') : [];
        const finalEl = document.getElementById('jep-final-' + gameId);
        const FINAL = finalEl ? JSON.parse(finalEl.textContent || 'null') : null;

        const numCats = CATEGORIES.length;
        const numCluesPerCat = CATEGORIES[0] ? CATEGORIES[0].clues.length : 5;

        // State
        let score = 0;
        let correctCount = 0;
        let wrongCount = 0;
        let cluesAnswered = 0;
        let totalClues = 0;
        let usedCells = {};
        let timerInterval = null;
        let timerRemaining = 0;
        let wrongAnswers = [];
        let currentWager = 0;
        let isFullscreen = false;
        let answerLocked = false;

        // Calculate total clues
        CATEGORIES.forEach(function(cat) { totalClues += cat.clues.length; });

        // DOM helpers
        function $(id) { return document.getElementById(id); }

        // Fullscreen
        window['toggleJepFullscreen_' + uniqueId] = function() {
            var container = $('jep-container-' + gameId);
            var activity = $('activity-' + gameId);
            if (!container || !activity) return;
            if (!isFullscreen) {
                container.classList.add(prefix + '-maximized');
                activity.classList.add(prefix + '-activity-maximized');
                document.body.style.overflow = 'hidden';
            } else {
                container.classList.remove(prefix + '-maximized');
                activity.classList.remove(prefix + '-activity-maximized');
                document.body.style.overflow = '';
            }
            isFullscreen = !isFullscreen;
            var exp = $('fs-expand-' + gameId);
            var col = $('fs-collapse-' + gameId);
            if (exp && col) {
                exp.style.display = isFullscreen ? 'none' : 'block';
                col.style.display = isFullscreen ? 'block' : 'none';
            }
        };

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isFullscreen) {
                window['toggleJepFullscreen_' + uniqueId]();
            }
        });

        // Show/hide screens
        function showScreen(name) {
            ['start', 'game', 'end'].forEach(function(s) {
                var el = $(s + '-' + gameId);
                if (el) el.classList.toggle('active', s === name);
            });
        }

        // Build board
        function buildBoard() {
            var board = $('board-' + gameId);
            if (!board) return;
            board.style.gridTemplateColumns = 'repeat(' + numCats + ', 1fr)';
            board.innerHTML = '';

            // Category headers
            CATEGORIES.forEach(function(cat) {
                var hdr = document.createElement('div');
                hdr.className = prefix + '-cat-header';
                hdr.textContent = cat.name;
                board.appendChild(hdr);
            });

            // Clue cells
            for (var r = 0; r < numCluesPerCat; r++) {
                (function(row) {
                    CATEGORIES.forEach(function(cat, c) {
                        var clue = cat.clues[row];
                        if (!clue) return;
                        var cell = document.createElement('div');
                        cell.className = prefix + '-cell';
                        cell.textContent = '$' + clue.pointValue;
                        cell.dataset.cat = c;
                        cell.dataset.clue = row;
                        cell.onclick = function() { openClue(c, row); };
                        cell.id = 'cell-' + gameId + '-' + c + '-' + row;
                        board.appendChild(cell);
                    });
                })(r);
            }
        }

        // Update HUD
        function updateHUD() {
            var scoreEl = $('score-' + gameId);
            var leftEl = $('clues-left-' + gameId);
            if (scoreEl) scoreEl.textContent = '$' + score;
            if (leftEl) leftEl.textContent = (totalClues - cluesAnswered) + ' clues remaining';
        }

        // Open clue
        function openClue(catIdx, clueIdx) {
            var key = catIdx + '-' + clueIdx;
            if (usedCells[key]) return;

            var cat = CATEGORIES[catIdx];
            var clue = cat.clues[clueIdx];
            if (!clue) return;

            // Mark used
            usedCells[key] = true;
            var cell = $('cell-' + gameId + '-' + catIdx + '-' + clueIdx);
            if (cell) cell.classList.add('used');

            var overlay = $('clue-overlay-' + gameId);
            if (!overlay) return;

            // Category & value
            var catLabel = $('clue-cat-' + gameId);
            var valLabel = $('clue-val-' + gameId);
            if (catLabel) catLabel.textContent = cat.name;
            if (valLabel) valLabel.textContent = '$' + clue.pointValue;

            // Daily Double?
            var ddBanner = $('dd-banner-' + gameId);
            var wagerSection = $('wager-section-' + gameId);
            var wagerInput = $('wager-input-' + gameId);
            var wagerBtn = $('wager-btn-' + gameId);
            var optionsEl = $('clue-options-' + gameId);
            var timerWrap = $('timer-wrap-' + gameId);

            if (clue.isDailyDouble) {
                if (ddBanner) ddBanner.style.display = 'block';
                if (wagerSection) wagerSection.style.display = 'block';
                if (optionsEl) optionsEl.style.display = 'none';
                if (timerWrap) timerWrap.style.display = 'none';
                currentWager = 0;
                var maxWager = Math.max(score, 1000);
                if (wagerInput) {
                    wagerInput.value = '';
                    wagerInput.max = maxWager;
                    wagerInput.placeholder = 'Max: $' + maxWager;
                }
                if (wagerBtn) {
                    wagerBtn.onclick = function() {
                        var wv = parseInt(wagerInput.value, 10) || 0;
                        if (wv < 5) wv = 5;
                        if (wv > maxWager) wv = maxWager;
                        currentWager = wv;
                        if (wagerSection) wagerSection.style.display = 'none';
                        if (ddBanner) ddBanner.style.display = 'none';
                        showOptions(catIdx, clueIdx, wv);
                    };
                }
            } else {
                if (ddBanner) ddBanner.style.display = 'none';
                if (wagerSection) wagerSection.style.display = 'none';
                var pts = Number(clue.pointValue) || 0;
                currentWager = pts;
                showOptions(catIdx, clueIdx, pts);
            }

            // Clue text
            var clueText = $('clue-text-' + gameId);
            if (clueText) clueText.textContent = clue.answer;

            // Hide feedback
            var fb = $('clue-feedback-' + gameId);
            if (fb) fb.classList.remove('active');

            overlay.classList.add('active');
        }

        function showOptions(catIdx, clueIdx, wager) {
            var cat = CATEGORIES[catIdx];
            var clue = cat.clues[clueIdx];
            var optionsEl = $('clue-options-' + gameId);
            var timerWrap = $('timer-wrap-' + gameId);
            if (!optionsEl) return;

            optionsEl.style.display = 'grid';
            optionsEl.innerHTML = '';

            clue.options.forEach(function(opt, i) {
                var btn = document.createElement('button');
                btn.className = prefix + '-option';
                btn.textContent = opt;
                btn.onclick = function() { handleAnswer(catIdx, clueIdx, i, wager); };
                optionsEl.appendChild(btn);
            });

            // Start timer
            if (timerWrap) timerWrap.style.display = 'block';
            startTimer(function() { handleAnswer(catIdx, clueIdx, -1, wager); });
        }

        // Handle answer
        function handleAnswer(catIdx, clueIdx, selectedIdx, wager) {
            if (answerLocked) return;
            answerLocked = true;
            clearTimer();
            var w = Number(wager) || 0;
            var cat = CATEGORIES[catIdx];
            var clue = cat.clues[clueIdx];
            var correctIdx = Number(clue.correctIndex) || 0;
            var isCorrect = selectedIdx === correctIdx;

            // Disable options
            var optionsEl = $('clue-options-' + gameId);
            if (optionsEl) {
                var btns = optionsEl.querySelectorAll('.' + prefix + '-option');
                for (var b = 0; b < btns.length; b++) {
                    btns[b].classList.add('disabled');
                    if (b === correctIdx) btns[b].classList.add('correct');
                    if (b === selectedIdx && !isCorrect) btns[b].classList.add('wrong');
                }
            }

            // Update score
            if (isCorrect) {
                score = score + w;
                correctCount++;
            } else {
                score = score - w;
                wrongCount++;
                wrongAnswers.push({
                    answer: clue.answer,
                    correct: clue.options[correctIdx] || clue.question,
                    explanation: clue.explanation
                });
            }
            cluesAnswered++;

            // Show feedback
            var fb = $('clue-feedback-' + gameId);
            var fbResult = $('fb-result-' + gameId);
            var fbExpl = $('fb-explanation-' + gameId);
            var fbPoints = $('fb-points-' + gameId);
            if (fb) fb.classList.add('active');
            if (fbResult) {
                fbResult.textContent = isCorrect ? 'Correct!' : (selectedIdx === -1 ? "Time's Up!" : 'Incorrect');
                fbResult.className = prefix + '-feedback-result ' + (isCorrect ? 'correct' : 'wrong');
            }
            if (fbExpl) fbExpl.textContent = clue.explanation || '';
            if (fbPoints) fbPoints.textContent = (isCorrect ? '+' : '-') + '$' + w;

            updateHUD();

            // Auto-close after delay
            setTimeout(function() {
                var overlay = $('clue-overlay-' + gameId);
                if (overlay) overlay.classList.remove('active');
                answerLocked = false;

                // Check if board is cleared
                if (cluesAnswered >= totalClues) {
                    if (FINAL) {
                        startFinalJeopardy();
                    } else {
                        endGame();
                    }
                }
            }, 2500);
        }

        // Timer
        function startTimer(onExpire) {
            timerRemaining = TIME_PER_Q;
            var bar = $('timer-bar-' + gameId);
            if (bar) {
                bar.style.width = '100%';
                bar.classList.remove('warning');
            }
            clearTimer();
            timerInterval = setInterval(function() {
                timerRemaining -= 0.1;
                if (timerRemaining <= 0) {
                    clearTimer();
                    if (bar) bar.style.width = '0%';
                    onExpire();
                    return;
                }
                var pct = (timerRemaining / TIME_PER_Q) * 100;
                if (bar) {
                    bar.style.width = pct + '%';
                    if (pct < 30) bar.classList.add('warning');
                }
            }, 100);
        }
        function clearTimer() {
            if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
        }

        // Final Jeopardy
        function startFinalJeopardy() {
            var overlay = $('final-overlay-' + gameId);
            if (!overlay) { endGame(); return; }

            var finalCat = $('final-cat-' + gameId);
            var finalClue = $('final-clue-' + gameId);
            var finalOptions = $('final-options-' + gameId);
            var finalFb = $('final-feedback-' + gameId);
            var finalWagerSection = $('final-wager-section-' + gameId);
            var finalWagerInput = $('final-wager-input-' + gameId);
            var finalWagerBtn = $('final-wager-btn-' + gameId);

            if (finalCat) finalCat.textContent = FINAL.category;
            if (finalClue) finalClue.textContent = FINAL.answer;
            if (finalFb) finalFb.classList.remove('active');

            // Wager phase
            var maxWager = Math.max(score, 0);
            if (finalWagerSection) finalWagerSection.style.display = 'block';
            if (finalOptions) finalOptions.style.display = 'none';
            if (finalWagerInput) {
                finalWagerInput.value = '';
                finalWagerInput.max = maxWager;
                finalWagerInput.placeholder = 'Max: $' + maxWager;
            }
            if (finalWagerBtn) {
                finalWagerBtn.onclick = function() {
                    var w = parseInt(finalWagerInput.value) || 0;
                    if (w < 0) w = 0;
                    if (w > maxWager) w = maxWager;
                    currentWager = w;
                    if (finalWagerSection) finalWagerSection.style.display = 'none';
                    showFinalOptions(w);
                };
            }

            overlay.classList.add('active');
        }

        function showFinalOptions(wager) {
            var finalOptions = $('final-options-' + gameId);
            if (!finalOptions) return;
            finalOptions.style.display = 'grid';
            finalOptions.innerHTML = '';

            FINAL.options.forEach(function(opt, i) {
                var btn = document.createElement('button');
                btn.className = prefix + '-option';
                btn.textContent = opt;
                btn.onclick = function() { handleFinalAnswer(i, wager); };
                finalOptions.appendChild(btn);
            });
        }

        function handleFinalAnswer(selectedIdx, wager) {
            var w = Number(wager) || 0;
            var correctIdx = Number(FINAL.correctIndex) || 0;
            var isCorrect = selectedIdx === correctIdx;

            var finalOptions = $('final-options-' + gameId);
            if (finalOptions) {
                var btns = finalOptions.querySelectorAll('.' + prefix + '-option');
                for (var b = 0; b < btns.length; b++) {
                    btns[b].classList.add('disabled');
                    if (b === correctIdx) btns[b].classList.add('correct');
                    if (b === selectedIdx && !isCorrect) btns[b].classList.add('wrong');
                }
            }

            if (isCorrect) {
                score = score + w;
                correctCount++;
            } else {
                score = score - w;
                wrongCount++;
                wrongAnswers.push({
                    answer: FINAL.answer,
                    correct: FINAL.options[correctIdx] || FINAL.question,
                    explanation: FINAL.explanation
                });
            }

            var finalFb = $('final-feedback-' + gameId);
            var finalFbResult = $('final-fb-result-' + gameId);
            var finalFbExpl = $('final-fb-explanation-' + gameId);
            if (finalFb) finalFb.classList.add('active');
            if (finalFbResult) {
                finalFbResult.textContent = isCorrect ? 'Correct!' : 'Incorrect';
                finalFbResult.className = prefix + '-feedback-result ' + (isCorrect ? 'correct' : 'wrong');
            }
            if (finalFbExpl) finalFbExpl.textContent = FINAL.explanation || '';

            setTimeout(function() {
                var overlay = $('final-overlay-' + gameId);
                if (overlay) overlay.classList.remove('active');
                endGame();
            }, 2500);
        }

        // End game
        function endGame() {
            showScreen('end');
            var total = correctCount + wrongCount;
            var accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

            var titleEl = $('end-title-' + gameId);
            if (titleEl) {
                titleEl.textContent = accuracy >= 50 ? 'Congratulations!' : 'Game Over';
                titleEl.className = prefix + '-end-title ' + (accuracy >= 50 ? 'win' : 'lose');
            }

            var finalScore = $('end-score-' + gameId);
            if (finalScore) finalScore.textContent = '$' + score;

            var correctStat = $('stat-correct-' + gameId);
            var wrongStat = $('stat-wrong-' + gameId);
            var accStat = $('stat-accuracy-' + gameId);
            if (correctStat) correctStat.textContent = correctCount;
            if (wrongStat) wrongStat.textContent = wrongCount;
            if (accStat) accStat.textContent = accuracy + '%';

            // Wrong answers review
            var review = $('review-' + gameId);
            if (review) {
                if (wrongAnswers.length > 0) {
                    review.innerHTML = '<div class="' + prefix + '-review-title">Review Wrong Answers</div>';
                    wrongAnswers.forEach(function(wa) {
                        review.innerHTML += '<div class="' + prefix + '-review-item">' +
                            '<div class="' + prefix + '-review-q">' + wa.answer + '</div>' +
                            '<div class="' + prefix + '-review-a">' + wa.correct + '</div>' +
                            '</div>';
                    });
                } else {
                    review.innerHTML = '';
                }
            }

            // Completion tracking
            if (accuracy >= 50 && typeof window.completeGamificationActivity === 'function') {
                window.completeGamificationActivity(gameId);
            }
        }

        // Start game
        window['startJepGame_' + uniqueId] = function() {
            score = 0;
            correctCount = 0;
            wrongCount = 0;
            cluesAnswered = 0;
            usedCells = {};
            wrongAnswers = [];
            answerLocked = false;
            buildBoard();
            updateHUD();
            showScreen('game');
        };

        // Play again
        window['playJepAgain_' + uniqueId] = function() {
            window['startJepGame_' + uniqueId]();
        };

    })();
    </script>
  `;
}
