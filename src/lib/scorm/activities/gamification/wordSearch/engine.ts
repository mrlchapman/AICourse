/**
 * Word Search Game Engine
 * Pure game logic separated from rendering
 * This can be used with any theme/style
 */

import { GamificationActivity, safeJsonEmbed } from '../core/types';

/** Configuration for Word Search game */
export interface WordSearchConfig {
  words: WordSearchWord[];
  gridSize: number;
  timeLimit: number;
  passMarkPercent: number;
  required: boolean;
}

/** A word with associated question */
export interface WordSearchWord {
  word: string;
  question: string;
  explanation: string;
  answers: string[];
  correctIndex: number;
}

/** Directions for word placement */
export const DIRECTIONS = [
  { dr: 0, dc: 1 },   // right
  { dr: 1, dc: 0 },   // down
  { dr: 1, dc: 1 },   // diagonal down-right
  { dr: 1, dc: -1 },  // diagonal down-left
  { dr: 0, dc: -1 },  // left
  { dr: -1, dc: 0 },  // up
  { dr: -1, dc: -1 }, // diagonal up-left
  { dr: -1, dc: 1 },  // diagonal up-right
];

/**
 * Extracts game configuration from activity
 */
export function extractConfig(activity: GamificationActivity): WordSearchConfig {
  return {
    words: activity.config?.wordSearchWords || [],
    gridSize: activity.config?.wordSearchGridSize || 12,
    timeLimit: activity.config?.timeLimit || 0,
    passMarkPercent: activity.config?.passMarkPercent || 60,
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
  config: WordSearchConfig,
  classPrefix: string
): string {
  const wordsJson = safeJsonEmbed(config.words);

  return `
    <script>
    (function() {
        const activityId = '${gameId}';
        const uniqueId = '${uniqueId}';
        const GRID_SIZE = ${config.gridSize};
        const TIME_LIMIT = ${config.timeLimit};
        const PASS_MARK = ${config.passMarkPercent};
        const isRequired = ${config.required};
        const wordsData = ${wordsJson};

        let grid = [];
        let wordPositions = [];
        let selecting = false;
        let selectionStart = null;
        let selectionEnd = null;
        let selectedCells = [];
        let score = 0;
        let correctAnswers = 0;
        let totalAnswered = 0;
        let timerInterval = null;
        let timeRemaining = TIME_LIMIT;
        let gameActive = false;
        let isFullscreen = false;

        const DIRECTIONS = [
            {dr: 0, dc: 1},
            {dr: 1, dc: 0},
            {dr: 1, dc: 1},
            {dr: 1, dc: -1},
            {dr: 0, dc: -1},
            {dr: -1, dc: 0},
            {dr: -1, dc: -1},
            {dr: -1, dc: 1}
        ];

        // Fullscreen functions - use CSS fullscreen for reliability in iframes
        window['toggle${classPrefix.charAt(0).toUpperCase() + classPrefix.slice(1)}Fullscreen_' + uniqueId] = function() {
            const container = document.getElementById('${classPrefix}-' + activityId);
            const activity = document.getElementById('activity-' + activityId);
            if (!container || !activity) return;

            if (!isFullscreen) {
                // Use CSS fullscreen directly - more reliable in iframes
                enableCssFullscreen();
            } else {
                disableCssFullscreen();
            }
        };

        function enableCssFullscreen() {
            const container = document.getElementById('${classPrefix}-' + activityId);
            const activity = document.getElementById('activity-' + activityId);
            if (!container || !activity) return;
            container.classList.add('${classPrefix}-maximized');
            activity.classList.add('${classPrefix}-activity-maximized');
            document.body.style.overflow = 'hidden';
            isFullscreen = true;
            updateFullscreenButton();
        }

        function disableCssFullscreen() {
            const container = document.getElementById('${classPrefix}-' + activityId);
            const activity = document.getElementById('activity-' + activityId);
            if (!container || !activity) return;
            container.classList.remove('${classPrefix}-maximized');
            activity.classList.remove('${classPrefix}-activity-maximized');
            document.body.style.overflow = '';
            isFullscreen = false;
            updateFullscreenButton();
        }

        function updateFullscreenButton() {
            const expandIcon = document.getElementById('fs-expand-' + activityId);
            const collapseIcon = document.getElementById('fs-collapse-' + activityId);
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

        function createGrid() {
            grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
            wordPositions = [];

            for (let i = 0; i < wordsData.length; i++) {
                const word = wordsData[i].word.toUpperCase();
                placeWord(word, i);
            }

            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    if (grid[r][c] === '') {
                        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
                    }
                }
            }
        }

        function placeWord(word, dataIndex) {
            const attempts = 100;
            for (let i = 0; i < attempts; i++) {
                const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
                const startRow = Math.floor(Math.random() * GRID_SIZE);
                const startCol = Math.floor(Math.random() * GRID_SIZE);

                if (canPlaceWord(word, startRow, startCol, dir)) {
                    const cells = [];
                    for (let j = 0; j < word.length; j++) {
                        const r = startRow + j * dir.dr;
                        const c = startCol + j * dir.dc;
                        grid[r][c] = word[j];
                        cells.push({row: r, col: c});
                    }
                    wordPositions.push({word, cells, found: false, dataIndex});
                    return true;
                }
            }
            console.warn('Could not place word:', word);
            return false;
        }

        function canPlaceWord(word, startRow, startCol, dir) {
            for (let i = 0; i < word.length; i++) {
                const r = startRow + i * dir.dr;
                const c = startCol + i * dir.dc;
                if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
                if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
            }
            return true;
        }

        function renderGrid() {
            const gridEl = document.getElementById('grid-' + activityId);
            gridEl.innerHTML = '';
            for (let r = 0; r < GRID_SIZE; r++) {
                for (let c = 0; c < GRID_SIZE; c++) {
                    const cell = document.createElement('div');
                    cell.className = '${classPrefix}-cell';
                    cell.textContent = grid[r][c];
                    cell.dataset.row = r;
                    cell.dataset.col = c;
                    cell.addEventListener('mousedown', (e) => startSelection(r, c, e));
                    cell.addEventListener('mouseenter', () => updateSelection(r, c));
                    cell.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        startSelection(r, c, e);
                    }, {passive: false});
                    cell.addEventListener('touchmove', (e) => {
                        e.preventDefault();
                        const touch = e.touches[0];
                        const el = document.elementFromPoint(touch.clientX, touch.clientY);
                        if (el && el.classList.contains('${classPrefix}-cell')) {
                            updateSelection(parseInt(el.dataset.row), parseInt(el.dataset.col));
                        }
                    }, {passive: false});
                    gridEl.appendChild(cell);
                }
            }
            document.addEventListener('mouseup', endSelection);
            document.addEventListener('touchend', endSelection);
        }

        function startSelection(row, col, e) {
            if (!gameActive) return;
            selecting = true;
            selectionStart = {row, col};
            selectionEnd = {row, col};
            updateSelectedCells();
        }

        function updateSelection(row, col) {
            if (!selecting || !gameActive) return;
            selectionEnd = {row, col};
            updateSelectedCells();
        }

        function updateSelectedCells() {
            document.querySelectorAll('#grid-' + activityId + ' .${classPrefix}-cell.selecting').forEach(c => c.classList.remove('selecting'));
            selectedCells = [];

            if (!selectionStart || !selectionEnd) return;

            const dr = Math.sign(selectionEnd.row - selectionStart.row);
            const dc = Math.sign(selectionEnd.col - selectionStart.col);

            const rowDiff = Math.abs(selectionEnd.row - selectionStart.row);
            const colDiff = Math.abs(selectionEnd.col - selectionStart.col);
            if (rowDiff !== 0 && colDiff !== 0 && rowDiff !== colDiff) return;

            const length = Math.max(rowDiff, colDiff) + 1;
            for (let i = 0; i < length; i++) {
                const r = selectionStart.row + i * dr;
                const c = selectionStart.col + i * dc;
                if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
                    selectedCells.push({row: r, col: c});
                    const cell = document.querySelector('#grid-' + activityId + ' .${classPrefix}-cell[data-row="' + r + '"][data-col="' + c + '"]');
                    if (cell) cell.classList.add('selecting');
                }
            }
        }

        function endSelection() {
            if (!selecting || !gameActive) {
                selecting = false;
                return;
            }
            selecting = false;

            const selectedWord = selectedCells.map(c => grid[c.row][c.col]).join('');
            const reversedWord = selectedWord.split('').reverse().join('');

            for (let i = 0; i < wordPositions.length; i++) {
                const wp = wordPositions[i];
                if (wp.found) continue;

                if (wp.word === selectedWord || wp.word === reversedWord) {
                    wp.found = true;
                    markCellsAsFound(selectedCells);
                    showQuestion(wp.dataIndex);
                    return;
                }
            }

            document.querySelectorAll('#grid-' + activityId + ' .${classPrefix}-cell.selecting').forEach(c => c.classList.remove('selecting'));
            selectedCells = [];
        }

        function markCellsAsFound(cells) {
            cells.forEach(({row, col}) => {
                const cell = document.querySelector('#grid-' + activityId + ' .${classPrefix}-cell[data-row="' + row + '"][data-col="' + col + '"]');
                if (cell) {
                    cell.classList.remove('selecting');
                    cell.classList.add('found');
                }
            });
        }

        function showQuestion(wordIndex) {
            const wordData = wordsData[wordIndex];
            const modal = document.getElementById('question-modal-' + activityId);
            document.getElementById('found-word-' + activityId).textContent = wordData.word.toUpperCase();
            document.getElementById('question-text-' + activityId).textContent = wordData.question;

            const answersEl = document.getElementById('answers-' + activityId);
            answersEl.innerHTML = '';
            wordData.answers.forEach((answer, idx) => {
                const btn = document.createElement('button');
                btn.className = '${classPrefix}-answer-btn';
                btn.innerHTML = '<span class="${classPrefix}-answer-letter">' + 'ABCD'[idx] + '</span><span>' + answer + '</span>';
                btn.onclick = () => handleAnswer(wordIndex, idx);
                answersEl.appendChild(btn);
            });

            const feedbackEl = document.getElementById('feedback-' + activityId);
            feedbackEl.style.display = 'none';
            feedbackEl.className = '${classPrefix}-feedback';
            modal.classList.add('active');
        }

        function handleAnswer(wordIndex, answerIndex) {
            const wordData = wordsData[wordIndex];
            const correct = answerIndex === wordData.correctIndex;
            totalAnswered++;

            const buttons = document.querySelectorAll('#answers-' + activityId + ' .${classPrefix}-answer-btn');
            buttons.forEach((btn, idx) => {
                btn.disabled = true;
                if (idx === wordData.correctIndex) {
                    btn.classList.add('correct');
                } else if (idx === answerIndex && !correct) {
                    btn.classList.add('wrong');
                }
            });

            const feedbackEl = document.getElementById('feedback-' + activityId);
            feedbackEl.style.display = 'block';
            feedbackEl.className = '${classPrefix}-feedback active ' + (correct ? 'correct' : 'wrong');
            feedbackEl.innerHTML = '<p class="${classPrefix}-feedback-text">' + (correct ? '\\u2713 Correct. ' : '\\u2717 Incorrect. ') + wordData.explanation + '</p><button class="${classPrefix}-continue-btn" onclick="close${classPrefix.charAt(0).toUpperCase() + classPrefix.slice(1)}Question_' + uniqueId + '(' + wordIndex + ', ' + correct + ')">CONTINUE</button>';

            if (correct) {
                correctAnswers++;
                score += 100;
            }
            updateStats();
        }

        window['close${classPrefix.charAt(0).toUpperCase() + classPrefix.slice(1)}Question_' + uniqueId] = function(wordIndex, wasCorrect) {
            const modal = document.getElementById('question-modal-' + activityId);
            modal.classList.remove('active');

            const wordItem = document.getElementById('word-item-' + activityId + '-' + wordIndex);
            wordItem.classList.add('found');
            wordItem.querySelector('.${classPrefix}-specimen-status').textContent = wasCorrect ? '\\u25cf' : '\\u25cb';
            if (!wasCorrect) wordItem.classList.add('wrong');

            const allFound = wordPositions.every(wp => wp.found);
            if (allFound) {
                endGame();
            }
        };

        function updateStats() {
            document.getElementById('found-count-' + activityId).textContent =
                wordPositions.filter(wp => wp.found).length + ' / ' + wordsData.length;
            document.getElementById('score-' + activityId).textContent = score;
        }

        function startTimer() {
            if (TIME_LIMIT <= 0) return;
            timeRemaining = TIME_LIMIT;
            timerInterval = setInterval(() => {
                timeRemaining--;
                const mins = Math.floor(timeRemaining / 60);
                const secs = timeRemaining % 60;
                document.getElementById('timer-' + activityId).textContent =
                    mins + ':' + secs.toString().padStart(2, '0');
                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                    endGame();
                }
            }, 1000);
        }

        function endGame() {
            gameActive = false;
            if (timerInterval) clearInterval(timerInterval);

            const passed = wordsData.length > 0 &&
                (correctAnswers / wordsData.length * 100) >= PASS_MARK;

            document.getElementById('game-screen-' + activityId).style.display = 'none';
            const endScreen = document.getElementById('end-' + activityId);
            endScreen.classList.add('active');

            const resultEl = document.getElementById('result-' + activityId);
            const emblemEl = document.getElementById('end-emblem-' + activityId);

            if (passed) {
                resultEl.textContent = 'EXPEDITION SUCCESSFUL';
                emblemEl.textContent = '\\u2766';
                emblemEl.className = '${classPrefix}-end-emblem passed';
            } else {
                resultEl.textContent = 'EXPEDITION INCOMPLETE';
                emblemEl.textContent = '\\u2717';
                emblemEl.className = '${classPrefix}-end-emblem failed';
            }

            document.getElementById('final-score-' + activityId).textContent = score;

            const breakdownEl = document.getElementById('breakdown-' + activityId);
            breakdownEl.innerHTML = \`
                <div class="${classPrefix}-breakdown-item">
                    <span>Specimens Located</span>
                    <span class="${classPrefix}-breakdown-value">\${wordPositions.filter(wp => wp.found).length} / \${wordsData.length}</span>
                </div>
                <div class="${classPrefix}-breakdown-item">
                    <span>Correct Identifications</span>
                    <span class="${classPrefix}-breakdown-value">\${correctAnswers} / \${totalAnswered}</span>
                </div>
                <div class="${classPrefix}-breakdown-item">
                    <span>Accuracy</span>
                    <span class="${classPrefix}-breakdown-value">\${totalAnswered > 0 ? Math.round(correctAnswers / totalAnswered * 100) : 0}%</span>
                </div>
            \`;

            if (passed && typeof window.markActivityComplete === 'function') {
                window.markActivityComplete(activityId);
            }
        }

        window['startWordSearch_' + uniqueId] = function() {
            score = 0;
            correctAnswers = 0;
            totalAnswered = 0;
            timeRemaining = TIME_LIMIT;
            gameActive = true;

            document.getElementById('start-' + activityId).classList.remove('active');
            document.getElementById('end-' + activityId).classList.remove('active');
            document.getElementById('game-screen-' + activityId).style.display = 'flex';

            wordsData.forEach((w, i) => {
                const item = document.getElementById('word-item-' + activityId + '-' + i);
                item.classList.remove('found', 'wrong');
                item.querySelector('.${classPrefix}-specimen-status').textContent = '\\u25cb';
            });

            createGrid();
            renderGrid();
            updateStats();

            if (TIME_LIMIT > 0) {
                startTimer();
            }
        };
    })();
    <\/script>
  `;
}
