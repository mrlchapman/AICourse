/**
 * Knowledge Tetris Game Engine
 * Pure game logic separated from rendering
 * This can be used with any theme/style
 */

import { GamificationActivity, safeJsonEmbed } from '../core/types';

/** Configuration for Knowledge Tetris game */
export interface KnowledgeTetrisConfig {
  questions: TetrisQuestion[];
  startingLevel: number;
  garbageRows: number;
  passMarkPercent: number;
  required: boolean;
}

/** A question in the game */
export interface TetrisQuestion {
  id: string;
  question: string;
  explanation?: string;
  answers: TetrisAnswer[];
}

/** An answer option for a question */
export interface TetrisAnswer {
  text: string;
  correct: boolean;
}

/** Tetris piece definitions */
export const TETRIS_PIECES = {
  I: { shape: [[1, 1, 1, 1]], color: '#c41e3a' },      // Soviet red
  O: { shape: [[1, 1], [1, 1]], color: '#d4a574' },    // Ochre/gold
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#8b4513' }, // Brown
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#2d5a27' }, // Dark green
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#8b0000' }, // Dark red
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#4a4a4a' }, // Charcoal
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#b8860b' }  // Dark gold
};

/** Speed settings for each level */
export const LEVEL_SPEEDS = [1000, 850, 700, 550, 400, 300, 220, 150, 100, 60];

/**
 * Extracts game configuration from activity
 */
export function extractConfig(activity: GamificationActivity): KnowledgeTetrisConfig {
  return {
    questions: activity.config?.questions || [],
    startingLevel: activity.config?.startingLevel || 1,
    garbageRows: activity.config?.garbageRows || 2,
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
  config: KnowledgeTetrisConfig,
  classPrefix: string
): string {
  const questionsJson = safeJsonEmbed(config.questions);

  return `
    <script type="application/json" id="questions-data-${gameId}">${questionsJson}</script>

    <script>
    (function() {
        const gameId = '${gameId}';
        const uniqueId = '${uniqueId}';
        const questionsEl = document.getElementById('questions-data-' + gameId);
        const questions = questionsEl ? JSON.parse(questionsEl.textContent || '[]') : [];
        const STARTING_LEVEL = ${config.startingLevel};
        const GARBAGE_ROWS = ${config.garbageRows};
        const PASS_PERCENT = ${config.passMarkPercent};

        const COLS = 10;
        const ROWS = 20;
        const BASE_blockSize = 24;
        let blockSize = BASE_blockSize;
        const BLOCKS_PER_QUESTION = 5;

        // Soviet-inspired color palette for pieces
        const PIECES = {
            I: { shape: [[1,1,1,1]], color: '#c41e3a' },
            O: { shape: [[1,1],[1,1]], color: '#d4a574' },
            T: { shape: [[0,1,0],[1,1,1]], color: '#8b4513' },
            S: { shape: [[0,1,1],[1,1,0]], color: '#2d5a27' },
            Z: { shape: [[1,1,0],[0,1,1]], color: '#8b0000' },
            J: { shape: [[1,0,0],[1,1,1]], color: '#4a4a4a' },
            L: { shape: [[0,0,1],[1,1,1]], color: '#b8860b' }
        };
        const PIECE_NAMES = Object.keys(PIECES);

        const canvas = document.getElementById('canvas-' + gameId);
        const ctx = canvas.getContext('2d');
        const nextCanvas = document.getElementById('next-' + gameId);
        const nextCtx = nextCanvas.getContext('2d');

        let grid = [];
        let currentPiece = null;
        let nextPiece = null;
        let score = 0;
        let level = STARTING_LEVEL;
        let lines = 0;
        let blocksPlaced = 0;
        let questionIndex = 0;
        let correctAnswers = 0;
        let gameActive = false;
        let dropInterval = null;
        let questionActive = false;
        let shuffledQuestions = [];
        let isFullscreen = false;

        const SPEEDS = [1000, 850, 700, 550, 400, 300, 220, 150, 100, 60];

        // Fullscreen functions
        window['toggleBlokFullscreen_' + uniqueId] = function() {
            const container = document.getElementById('${classPrefix}-' + gameId);
            const activity = document.getElementById('activity-' + gameId);
            if (!container || !activity) return;
            if (!isFullscreen) {
                enableCssFullscreen();
            } else {
                disableCssFullscreen();
            }
        };

        function enableCssFullscreen() {
            const container = document.getElementById('${classPrefix}-' + gameId);
            const activity = document.getElementById('activity-' + gameId);
            if (!container || !activity) return;
            container.classList.add('${classPrefix}-maximized');
            activity.classList.add('${classPrefix}-activity-maximized');
            document.body.style.overflow = 'hidden';
            isFullscreen = true;
            updateFullscreenButton();
            setTimeout(resizeCanvas, 50);
        }

        function disableCssFullscreen() {
            const container = document.getElementById('${classPrefix}-' + gameId);
            const activity = document.getElementById('activity-' + gameId);
            if (!container || !activity) return;
            container.classList.remove('${classPrefix}-maximized');
            activity.classList.remove('${classPrefix}-activity-maximized');
            document.body.style.overflow = '';
            isFullscreen = false;
            updateFullscreenButton();
            setTimeout(resizeCanvas, 50);
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

        function calculateBlockSize() {
            if (isFullscreen) {
                const container = document.getElementById('${classPrefix}-' + gameId);
                const main = container.querySelector('.${classPrefix}-main');
                if (main) {
                    const mainRect = main.getBoundingClientRect();
                    const availableWidth = mainRect.width - 400;
                    const availableHeight = mainRect.height - 60;
                    const maxBlockByWidth = Math.floor(availableWidth / COLS);
                    const maxBlockByHeight = Math.floor(availableHeight / ROWS);
                    blockSize = Math.min(maxBlockByWidth, maxBlockByHeight, 48);
                    blockSize = Math.max(blockSize, BASE_blockSize);
                }
            } else {
                blockSize = BASE_blockSize;
            }
        }

        function resizeCanvas() {
            calculateBlockSize();
            canvas.width = COLS * blockSize;
            canvas.height = ROWS * blockSize;
            nextCanvas.width = 4 * blockSize;
            nextCanvas.height = 4 * blockSize;
            draw();
            drawNextPiece();
        }

        function init() {
            calculateBlockSize();
            canvas.width = COLS * blockSize;
            canvas.height = ROWS * blockSize;
            nextCanvas.width = 4 * blockSize;
            nextCanvas.height = 4 * blockSize;
        }

        function resetGame() {
            grid = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
            score = 0;
            level = STARTING_LEVEL;
            lines = 0;
            blocksPlaced = 0;
            questionIndex = 0;
            correctAnswers = 0;
            shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
            updateHUD();
        }

        function createPiece(name) {
            const p = PIECES[name];
            return {
                name: name,
                shape: p.shape.map(row => [...row]),
                color: p.color,
                x: Math.floor(COLS / 2) - Math.ceil(p.shape[0].length / 2),
                y: 0
            };
        }

        function randomPiece() {
            return createPiece(PIECE_NAMES[Math.floor(Math.random() * PIECE_NAMES.length)]);
        }

        function rotate(piece) {
            const rows = piece.shape.length;
            const cols = piece.shape[0].length;
            const rotated = [];
            for (let c = 0; c < cols; c++) {
                rotated.push([]);
                for (let r = rows - 1; r >= 0; r--) {
                    rotated[c].push(piece.shape[r][c]);
                }
            }
            return rotated;
        }

        function collision(piece, nx, ny, shape) {
            shape = shape || piece.shape;
            for (let r = 0; r < shape.length; r++) {
                for (let c = 0; c < shape[r].length; c++) {
                    if (shape[r][c]) {
                        const x = nx + c;
                        const y = ny + r;
                        if (x < 0 || x >= COLS || y >= ROWS) return true;
                        if (y >= 0 && grid[y][x]) return true;
                    }
                }
            }
            return false;
        }

        function lockPiece() {
            for (let r = 0; r < currentPiece.shape.length; r++) {
                for (let c = 0; c < currentPiece.shape[r].length; c++) {
                    if (currentPiece.shape[r][c]) {
                        const y = currentPiece.y + r;
                        const x = currentPiece.x + c;
                        if (y >= 0) grid[y][x] = currentPiece.color;
                    }
                }
            }
            blocksPlaced++;
            clearLines();

            if (blocksPlaced % BLOCKS_PER_QUESTION === 0 && questionIndex < shuffledQuestions.length) {
                showQuestion();
            } else {
                spawnPiece();
            }
        }

        function clearLines() {
            let cleared = 0;
            let clearedRows = [];
            for (let r = ROWS - 1; r >= 0; r--) {
                if (grid[r].every(cell => cell !== 0)) {
                    clearedRows.push(r);
                    cleared++;
                }
            }
            if (cleared > 0) {
                flashRows(clearedRows, () => {
                    clearedRows.forEach(() => {
                        for (let r = ROWS - 1; r >= 0; r--) {
                            if (grid[r].every(cell => cell !== 0 && cell !== 'flash')) {
                                grid.splice(r, 1);
                                grid.unshift(Array(COLS).fill(0));
                                break;
                            }
                        }
                    });
                    lines += cleared;
                    const points = [0, 100, 300, 500, 800][Math.min(cleared, 4)] * level;
                    score += points;
                    if (lines >= level * 10 && level < 10) {
                        level++;
                        setSpeed();
                    }
                    updateHUD();
                });
            }
        }

        function flashRows(rows, callback) {
            let flashCount = 0;
            const flashInterval = setInterval(() => {
                flashCount++;
                rows.forEach(r => {
                    for (let c = 0; c < COLS; c++) {
                        if (flashCount % 2 === 1) {
                            grid[r][c] = '#f5f0e1';
                        } else {
                            grid[r][c] = '#c41e3a';
                        }
                    }
                });
                draw();
                if (flashCount >= 6) {
                    clearInterval(flashInterval);
                    callback();
                }
            }, 50);
        }

        function addGarbage(count) {
            for (let i = 0; i < count; i++) {
                grid.shift();
                const garbageRow = Array(COLS).fill('#3d3d3d');
                garbageRow[Math.floor(Math.random() * COLS)] = 0;
                grid.push(garbageRow);
            }
        }

        function spawnPiece() {
            currentPiece = nextPiece || randomPiece();
            nextPiece = randomPiece();
            drawNext();

            if (collision(currentPiece, currentPiece.x, currentPiece.y)) {
                endGame(false);
            }
        }

        function drop() {
            if (!gameActive || questionActive) return;
            if (!collision(currentPiece, currentPiece.x, currentPiece.y + 1)) {
                currentPiece.y++;
            } else {
                lockPiece();
            }
            draw();
        }

        function hardDrop() {
            while (!collision(currentPiece, currentPiece.x, currentPiece.y + 1)) {
                currentPiece.y++;
                score += 2;
            }
            lockPiece();
            draw();
        }

        function move(dir) {
            if (!collision(currentPiece, currentPiece.x + dir, currentPiece.y)) {
                currentPiece.x += dir;
                draw();
            }
        }

        function rotatePiece() {
            const rotated = rotate(currentPiece);
            if (!collision(currentPiece, currentPiece.x, currentPiece.y, rotated)) {
                currentPiece.shape = rotated;
                draw();
            }
        }

        function getGhostY() {
            let ghostY = currentPiece.y;
            while (!collision(currentPiece, currentPiece.x, ghostY + 1)) {
                ghostY++;
            }
            return ghostY;
        }

        function draw() {
            // Background - cream/ivory
            ctx.fillStyle = '#f5f0e1';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Grid lines
            ctx.strokeStyle = '#d4c4a8';
            ctx.lineWidth = 1;
            for (let r = 0; r <= ROWS; r++) {
                ctx.beginPath();
                ctx.moveTo(0, r * blockSize);
                ctx.lineTo(canvas.width, r * blockSize);
                ctx.stroke();
            }
            for (let c = 0; c <= COLS; c++) {
                ctx.beginPath();
                ctx.moveTo(c * blockSize, 0);
                ctx.lineTo(c * blockSize, canvas.height);
                ctx.stroke();
            }

            // Draw placed blocks
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (grid[r][c]) {
                        drawBlock(ctx, c, r, grid[r][c]);
                    }
                }
            }

            if (currentPiece) {
                // Draw ghost
                const ghostY = getGhostY();
                for (let r = 0; r < currentPiece.shape.length; r++) {
                    for (let c = 0; c < currentPiece.shape[r].length; c++) {
                        if (currentPiece.shape[r][c]) {
                            ctx.fillStyle = 'rgba(196, 30, 58, 0.2)';
                            ctx.fillRect(
                                (currentPiece.x + c) * blockSize + 2,
                                (ghostY + r) * blockSize + 2,
                                blockSize - 4,
                                blockSize - 4
                            );
                            ctx.strokeStyle = 'rgba(196, 30, 58, 0.4)';
                            ctx.strokeRect(
                                (currentPiece.x + c) * blockSize + 2,
                                (ghostY + r) * blockSize + 2,
                                blockSize - 4,
                                blockSize - 4
                            );
                        }
                    }
                }

                // Draw current piece
                for (let r = 0; r < currentPiece.shape.length; r++) {
                    for (let c = 0; c < currentPiece.shape[r].length; c++) {
                        if (currentPiece.shape[r][c] && currentPiece.y + r >= 0) {
                            drawBlock(ctx, currentPiece.x + c, currentPiece.y + r, currentPiece.color);
                        }
                    }
                }
            }
        }

        function drawBlock(context, x, y, color) {
            const px = x * blockSize;
            const py = y * blockSize;

            // Main block
            context.fillStyle = color;
            context.fillRect(px + 1, py + 1, blockSize - 2, blockSize - 2);

            // Constructivist-style bevels
            context.fillStyle = 'rgba(255,255,255,0.3)';
            context.fillRect(px + 2, py + 2, blockSize - 4, 3);
            context.fillRect(px + 2, py + 2, 3, blockSize - 4);

            context.fillStyle = 'rgba(0,0,0,0.3)';
            context.fillRect(px + 2, py + blockSize - 5, blockSize - 4, 3);
            context.fillRect(px + blockSize - 5, py + 2, 3, blockSize - 4);

            // Inner detail line
            context.strokeStyle = 'rgba(0,0,0,0.2)';
            context.lineWidth = 1;
            context.strokeRect(px + 4, py + 4, blockSize - 8, blockSize - 8);
        }

        function drawNext() {
            nextCtx.fillStyle = '#2a2a2a';
            nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

            // Border pattern
            nextCtx.strokeStyle = '#c41e3a';
            nextCtx.lineWidth = 2;
            nextCtx.strokeRect(2, 2, nextCanvas.width - 4, nextCanvas.height - 4);

            if (nextPiece) {
                const offsetX = (4 - nextPiece.shape[0].length) / 2;
                const offsetY = (4 - nextPiece.shape.length) / 2;
                for (let r = 0; r < nextPiece.shape.length; r++) {
                    for (let c = 0; c < nextPiece.shape[r].length; c++) {
                        if (nextPiece.shape[r][c]) {
                            drawBlock(nextCtx, offsetX + c, offsetY + r, nextPiece.color);
                        }
                    }
                }
            }
        }

        function drawNextPiece() {
            drawNext();
        }

        function updateHUD() {
            document.getElementById('score-' + gameId).textContent = score;
            document.getElementById('level-' + gameId).textContent = level;
            document.getElementById('lines-' + gameId).textContent = lines;
            document.getElementById('correct-' + gameId).textContent = correctAnswers;

            // Update score bar
            const maxScore = questions.length * 200 + 5000;
            const percentage = Math.min(100, (score / maxScore) * 100);
            const scoreFill = document.getElementById('score-fill-' + gameId);
            if (scoreFill) scoreFill.style.width = percentage + '%';
        }

        function setSpeed() {
            if (dropInterval) clearInterval(dropInterval);
            const speed = SPEEDS[Math.min(level - 1, SPEEDS.length - 1)];
            dropInterval = setInterval(drop, questionActive ? speed * 10 : speed);
        }

        function showQuestion() {
            questionActive = true;
            setSpeed();

            const q = shuffledQuestions[questionIndex];
            document.getElementById('q-text-' + gameId).textContent = q.question;

            const answersDiv = document.getElementById('answers-' + gameId);
            answersDiv.innerHTML = '';

            const shuffledAnswers = [...q.answers].sort(() => Math.random() - 0.5);
            shuffledAnswers.forEach(ans => {
                const btn = document.createElement('button');
                btn.className = '${classPrefix}-answer-btn';
                btn.textContent = ans.text;
                btn.onclick = () => handleAnswer(ans.correct, q.explanation);
                answersDiv.appendChild(btn);
            });

            document.getElementById('question-' + gameId).classList.add('active');
        }

        function handleAnswer(correct, explanation) {
            questionIndex++;
            document.getElementById('question-' + gameId).classList.remove('active');

            if (correct) {
                correctAnswers++;
                score += 200;
                document.getElementById('explanation-' + gameId).textContent = explanation;
                document.getElementById('feedback-' + gameId).classList.add('active');
            } else {
                addGarbage(GARBAGE_ROWS);
                if (level < 10) level++;
                updateHUD();
                questionActive = false;
                setSpeed();
                if (questionIndex >= shuffledQuestions.length) {
                    endGame(true);
                } else {
                    spawnPiece();
                }
            }
        }

        window.closeFeedback_${uniqueId} = function() {
            document.getElementById('feedback-' + gameId).classList.remove('active');
            updateHUD();
            questionActive = false;
            setSpeed();

            if (questionIndex >= shuffledQuestions.length) {
                endGame(true);
            } else {
                spawnPiece();
            }
        };

        function endGame(survived) {
            gameActive = false;
            if (dropInterval) clearInterval(dropInterval);

            const passThreshold = Math.ceil(questions.length * PASS_PERCENT / 100);
            const passed = correctAnswers >= passThreshold;

            const title = document.getElementById('end-title-' + gameId);
            const emblem = document.getElementById('end-emblem-' + gameId);

            if (passed) {
                title.textContent = 'CONSTRUCTION COMPLETE';
                title.classList.add('success');
                title.classList.remove('failed');
                emblem.classList.add('success');
                emblem.classList.remove('failed');
            } else if (survived) {
                title.textContent = 'RECONSTRUCTION NEEDED';
                title.classList.add('failed');
                title.classList.remove('success');
                emblem.classList.add('failed');
                emblem.classList.remove('success');
            } else {
                title.textContent = 'STRUCTURE COLLAPSED';
                title.classList.add('failed');
                title.classList.remove('success');
                emblem.classList.add('failed');
                emblem.classList.remove('success');
            }

            const stats = document.getElementById('end-stats-' + gameId);
            stats.innerHTML =
                '<div class="${classPrefix}-end-stat"><span class="${classPrefix}-end-stat-label">SCORE</span><span class="${classPrefix}-end-stat-value">' + score + '</span></div>' +
                '<div class="${classPrefix}-end-stat"><span class="${classPrefix}-end-stat-label">LINES</span><span class="${classPrefix}-end-stat-value">' + lines + '</span></div>' +
                '<div class="${classPrefix}-end-stat"><span class="${classPrefix}-end-stat-label">CORRECT</span><span class="${classPrefix}-end-stat-value">' + correctAnswers + ' / ' + questions.length + '</span></div>' +
                (passed
                    ? '<div class="${classPrefix}-pass-badge success">★ CERTIFIED ★</div>'
                    : '<div class="${classPrefix}-pass-badge failed">REQUIRE ' + passThreshold + ' CORRECT</div>');

            document.getElementById('end-' + gameId).classList.add('active');

            if (passed && window.completeGamificationActivity) {
                window.completeGamificationActivity(gameId);
            }
        }

        function handleKey(e) {
            if (!gameActive || questionActive) return;
            if (!document.getElementById('canvas-' + gameId)) return;
            if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space'].includes(e.code)) {
                e.preventDefault();
            }
            switch(e.code) {
                case 'ArrowLeft': move(-1); break;
                case 'ArrowRight': move(1); break;
                case 'ArrowUp': rotatePiece(); break;
                case 'ArrowDown': drop(); break;
                case 'Space': rotatePiece(); break;
            }
        }

        window.startTetris_${uniqueId} = function() {
            document.getElementById('start-' + gameId).classList.remove('active');
            document.getElementById('end-' + gameId).classList.remove('active');

            resetGame();
            gameActive = true;
            spawnPiece();
            setSpeed();
            draw();
        };

        init();
        window.addEventListener('keydown', handleKey);
        draw();

    })();
    </script>
  `;
}
