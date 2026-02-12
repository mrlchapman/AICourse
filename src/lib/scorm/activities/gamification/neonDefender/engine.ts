/**
 * Synth Defender Game Engine
 * Pure game logic separated from rendering
 * This can be used with any theme/style
 */

import { GamificationActivity, safeJsonEmbed } from '../core/types';

/** Configuration for Synth Defender game */
export interface NeonDefenderConfig {
  questions: NeonDefenderQuestion[];
  required: boolean;
  startingLives: number;
  passMarkPercent: number;
}

/** A question in the Synth Defender game */
export interface NeonDefenderQuestion {
  id: string;
  question: string;
  explanation: string;
  answers: NeonDefenderAnswer[];
}

/** An answer option */
export interface NeonDefenderAnswer {
  text: string;
  correct: boolean;
}

/**
 * Extracts game configuration from activity
 */
export function extractConfig(activity: GamificationActivity): NeonDefenderConfig {
  return {
    questions: activity.config?.questions || [],
    required: activity.config?.required || false,
    startingLives: activity.config?.startingLives || 3,
    passMarkPercent: activity.config?.passMarkPercent || 75,
  };
}

/**
 * Generates the client-side game script
 * This is the JavaScript that runs in the browser
 */
export function generateGameScript(
  gameId: string,
  uniqueId: string,
  config: NeonDefenderConfig,
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
        const levelData = questionsEl ? JSON.parse(questionsEl.textContent || '[]') : [];

        const canvas = document.getElementById('canvas-' + gameId);
        const ctx = canvas.getContext('2d');

        const questionDisplay = document.getElementById('question-text-' + gameId);
        const scoreDisplay = document.getElementById('score-' + gameId);
        const scoreBar = document.getElementById('score-bar-' + gameId);
        const livesDisplay = document.getElementById('lives-' + gameId);
        const reflectionBanner = document.getElementById('reflection-banner-' + gameId);
        const reflectionText = document.getElementById('reflection-text-' + gameId);
        const endFeedback = document.getElementById('end-feedback-' + gameId);

        let gameActive = false;
        let isFullscreen = false;
        let score = 0;
        const STARTING_LIVES = ${config.startingLives};
        const PASS_MARK_PERCENT = ${config.passMarkPercent};
        const MAX_SCORE = levelData.length * 100;
        const PASS_THRESHOLD = Math.ceil(MAX_SCORE * (PASS_MARK_PERCENT / 100));
        let lives = STARTING_LIVES;

        let levelOrder = [];
        let currentLevelIndex = 0;
        let attemptsThisQuestion = 0;
        let hitStopFrames = 0;
        let reflectionFrames = 0;

        let fallingObjects = [];
        let bullets = [];
        let particles = [];
        let popups = [];
        let wavePhase = 0;

        let shakeTime = 0;
        let shakeMag = 0;
        let flashTime = 0;

        const player = {
            x: 0,
            y: 0,
            width: 50,
            height: 30,
            speed: 7
        };

        const keys = {};
        let runStats = [];

        // Oscilloscope animation
        function animateOscilloscope() {
            const scope = document.querySelector('#game-' + gameId + ' .${classPrefix}-scope-wave');
            if (!scope) return;
            let phase = 0;
            setInterval(() => {
                phase += 0.12;
                const amplitude = gameActive ? 12 : 6;
                const freq = gameActive ? 0.25 : 0.15;
                let path = 'M0,20';
                for (let x = 0; x <= 100; x += 2) {
                    const y = 20 + Math.sin((x * freq) + phase) * amplitude;
                    path += ' L' + x + ',' + y;
                }
                scope.innerHTML = '<svg viewBox="0 0 100 40" preserveAspectRatio="none"><path d="' + path + '" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
            }, 50);
        }
        animateOscilloscope();

        // Fullscreen - use CSS fullscreen for reliability in iframes
        window['toggle${classPrefix.charAt(0).toUpperCase() + classPrefix.slice(1)}Fullscreen_' + uniqueId] = function() {
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
            resize();
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
            resize();
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

        function handleKeydown(e) {
            if(!document.getElementById('canvas-' + gameId)) return;
            if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code) && gameActive) {
                e.preventDefault();
            }
            keys[e.code] = true;
            if (e.code === 'Space' && gameActive && reflectionFrames === 0) shoot();
        }
        function handleKeyup(e) {
            keys[e.code] = false;
        }

        window.addEventListener('keydown', handleKeydown);
        window.addEventListener('keyup', handleKeyup);

        function resize() {
            const container = document.getElementById('game-' + gameId);
            const displayFrame = container.querySelector('.${classPrefix}-display-frame');
            if (!displayFrame) return;
            canvas.width = displayFrame.clientWidth - 20;
            canvas.height = displayFrame.clientHeight - 20;
            player.y = canvas.height - 50;
            if(player.x === 0) player.x = canvas.width / 2;
        }

        function shuffleArray(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        function calcPointsForAttempt(attempts) {
            const points = 100 - (attempts * 25);
            return Math.max(25, points);
        }

        function showReflection(explanation) {
            reflectionText.textContent = explanation;
            reflectionBanner.style.display = "block";
            reflectionFrames = 120;
        }

        function tickReflection() {
            if (reflectionFrames > 0) {
                reflectionFrames--;
                if (reflectionFrames === 0) {
                    reflectionBanner.style.display = "none";
                }
            }
        }

        window.startGame_${uniqueId} = function() {
            resize();

            document.getElementById('start-' + gameId).classList.remove('active');
            document.getElementById('end-' + gameId).classList.remove('active');

            gameActive = true;
            score = 0;
            lives = STARTING_LIVES;
            fallingObjects = [];
            bullets = [];
            particles = [];
            popups = [];
            runStats = [];

            levelOrder = shuffleArray([...Array(levelData.length).keys()]);
            currentLevelIndex = 0;
            attemptsThisQuestion = 0;
            hitStopFrames = 0;
            reflectionFrames = 0;

            reflectionBanner.style.display = "none";
            updateHUD();
            startLevel(currentLevelIndex);

            requestAnimationFrame(loop);
        };

        function startLevel(index) {
            if (index >= levelOrder.length) {
                endGame(true);
                return;
            }

            fallingObjects = [];
            bullets = [];

            const level = levelData[levelOrder[index]];
            const questionTextEl = questionDisplay.querySelector('.${classPrefix}-question-text');
            if (questionTextEl) questionTextEl.textContent = level.question;

            const answers = level.answers;
            const zoneWidth = canvas.width / answers.length;
            let positions = answers.map((_, i) => (zoneWidth * i) + (zoneWidth / 2));
            positions = shuffleArray(positions);

            answers.forEach((ans, i) => {
                fallingObjects.push({
                    x: positions[i],
                    y: -80 - (i * 30),
                    width: Math.min(180, zoneWidth - 20),
                    height: 50,
                    text: ans.text,
                    isCorrect: ans.correct,
                    speed: 0.8 + (index * 0.12),
                    hitGlowTime: 0,
                    hitGlowColour: null,
                    freq: 100 + (i * 50)
                });
            });
        }

        function shoot() {
            bullets.push({ x: player.x, y: player.y - 10, speed: 12, width: 4, height: 20 });
        }

        function addPopup(text, x, y, colour) {
            popups.push({ text, x, y, dy: -1.5, life: 50, colour });
        }

        function registerAttemptAndRespawn(reason) {
            attemptsThisQuestion++;
            takeDamage(reason);
            respawnLevel();
        }

        function takeDamage(reason) {
            lives--;
            updateHUD();
            shakeTime = 15;
            shakeMag = 12;
            flashTime = 12;
            if (lives <= 0) endGame(false);
        }

        function respawnLevel() {
            fallingObjects = [];
            bullets = [];
            setTimeout(() => {
                if(gameActive) startLevel(currentLevelIndex);
            }, 600);
        }

        function update() {
            if (!gameActive) return;
            tickReflection();
            if (reflectionFrames > 0) return;
            if (hitStopFrames > 0) { hitStopFrames--; return; }

            wavePhase += 0.05;

            if (keys['ArrowLeft'] && player.x > 30) player.x -= player.speed;
            if (keys['ArrowRight'] && player.x < canvas.width - 30) player.x += player.speed;

            for (let i = bullets.length - 1; i >= 0; i--) {
                let b = bullets[i];
                b.y -= b.speed;
                if (b.y < 0) bullets.splice(i, 1);
            }

            for (let i = fallingObjects.length - 1; i >= 0; i--) {
                let obj = fallingObjects[i];
                obj.y += obj.speed;

                if (obj.hitGlowTime > 0) obj.hitGlowTime--;

                if (obj.y > canvas.height) {
                    fallingObjects.splice(i, 1);
                    if (obj.isCorrect) {
                        registerAttemptAndRespawn("Frequency escaped!");
                        return;
                    }
                }

                if (
                    player.x < obj.x + obj.width / 2 &&
                    player.x > obj.x - obj.width / 2 &&
                    player.y < obj.y + obj.height &&
                    player.y > obj.y - obj.height
                ) {
                    registerAttemptAndRespawn("Signal collision!");
                    return;
                }

                for (let j = bullets.length - 1; j >= 0; j--) {
                    let b = bullets[j];
                    const left = obj.x - (obj.width / 2);
                    const right = obj.x + (obj.width / 2);
                    const top = obj.y;
                    const bottom = obj.y + obj.height;

                    if (b.x > left && b.x < right && b.y > top && b.y < bottom) {
                        flashTime = 8;
                        obj.hitGlowTime = 20;
                        obj.hitGlowColour = obj.isCorrect ? "#84cc16" : "#ef4444";

                        const hitX = obj.x;
                        const hitY = obj.y + obj.height / 2;
                        createExplosion(hitX, hitY, obj.isCorrect ? '#84cc16' : '#ef4444');

                        bullets.splice(j, 1);
                        fallingObjects.splice(i, 1);

                        const qIndex = levelOrder[currentLevelIndex];
                        const q = levelData[qIndex];

                        if (obj.isCorrect) {
                            hitStopFrames = 8;
                            const points = calcPointsForAttempt(attemptsThisQuestion);
                            score += points;
                            addPopup('+' + points, hitX, hitY, "#84cc16");
                            updateHUD();

                            runStats.push({
                                qIndex,
                                question: q.question,
                                attempts: attemptsThisQuestion,
                                correctAnswer: obj.text,
                                explanation: q.explanation
                            });

                            showReflection(q.explanation);
                            currentLevelIndex++;
                            attemptsThisQuestion = 0;

                            setTimeout(() => {
                                if (gameActive) startLevel(currentLevelIndex);
                            }, 2000);
                        } else {
                            hitStopFrames = 4;
                            addPopup("DISSONANCE", hitX, hitY, "#ef4444");
                            registerAttemptAndRespawn("Wrong frequency");
                        }
                        return;
                    }
                }
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.x += p.dx;
                p.y += p.dy;
                p.life--;
                if (p.life <= 0) particles.splice(i, 1);
            }

            for (let i = popups.length - 1; i >= 0; i--) {
                let s = popups[i];
                s.y += s.dy;
                s.life--;
                if (s.life <= 0) popups.splice(i, 1);
            }
        }

        function draw() {
            if(shakeTime > 0) {
                shakeTime--;
                ctx.save();
                ctx.translate((Math.random()-0.5)*shakeMag, (Math.random()-0.5)*shakeMag);
            }

            drawBackground();

            if(gameActive) drawPlayer(player.x, player.y);

            for (const b of bullets) drawBullet(b);
            for (const obj of fallingObjects) drawFrequencyModule(obj);

            for (const p of particles) {
                ctx.save();
                ctx.globalAlpha = Math.max(0, p.life / 35);
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
                ctx.restore();
            }

            drawPopups();

            if(shakeTime > 0) ctx.restore();

            if (flashTime > 0) {
                flashTime--;
                ctx.save();
                ctx.globalAlpha = flashTime / 15;
                ctx.fillStyle = "rgba(255, 200, 100, 0.3)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
            }
        }

        function drawBackground() {
            // Dark warm gradient
            const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
            g.addColorStop(0, "#1a1410");
            g.addColorStop(1, "#0d0a08");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Grid lines (oscilloscope style)
            ctx.strokeStyle = "rgba(212, 165, 116, 0.08)";
            ctx.lineWidth = 1;

            const gridSize = 40;
            for (let x = 0; x < canvas.width; x += gridSize) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Center crosshair
            ctx.strokeStyle = "rgba(212, 165, 116, 0.15)";
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.moveTo(0, canvas.height / 2);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();

            // Sine wave background decoration
            ctx.strokeStyle = "rgba(245, 158, 11, 0.1)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = 0; x < canvas.width; x += 3) {
                const y = canvas.height / 2 + Math.sin((x * 0.02) + wavePhase) * 50;
                if (x === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        function drawPlayer(px, py) {
            ctx.save();
            ctx.translate(px, py);

            // Glow
            ctx.shadowColor = "#f59e0b";
            ctx.shadowBlur = 20;

            // Main waveform emitter shape
            ctx.fillStyle = "#f59e0b";
            ctx.beginPath();
            ctx.moveTo(0, -15);
            ctx.lineTo(-20, 10);
            ctx.lineTo(-8, 10);
            ctx.lineTo(-8, 15);
            ctx.lineTo(8, 15);
            ctx.lineTo(8, 10);
            ctx.lineTo(20, 10);
            ctx.closePath();
            ctx.fill();

            // Inner detail
            ctx.fillStyle = "#fbbf24";
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.lineTo(-10, 6);
            ctx.lineTo(10, 6);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        function drawFrequencyModule(obj) {
            const x = obj.x - (obj.width/2);
            const y = obj.y;
            const w = obj.width;
            const h = obj.height;

            ctx.save();

            // Module shadow
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.fillRect(x + 3, y + 3, w, h);

            // Module body
            const grad = ctx.createLinearGradient(x, y, x, y + h);
            grad.addColorStop(0, "#3d3429");
            grad.addColorStop(0.5, "#2a2520");
            grad.addColorStop(1, "#1f1b18");
            ctx.fillStyle = grad;
            ctx.fillRect(x, y, w, h);

            // Border
            ctx.strokeStyle = obj.hitGlowTime > 0 ? obj.hitGlowColour : "#5c4d3d";
            ctx.lineWidth = obj.hitGlowTime > 0 ? 3 : 2;
            ctx.strokeRect(x, y, w, h);

            // Top accent line (same color for all - don't reveal answer!)
            ctx.fillStyle = "#d97706";
            ctx.globalAlpha = 0.6;
            ctx.fillRect(x + 2, y + 2, w - 4, 3);
            ctx.globalAlpha = 1;

            // Frequency indicator dots
            ctx.fillStyle = "#f59e0b";
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(x + 10 + (i * 8), y + h - 8, 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Text
            ctx.fillStyle = "#e8e0d0";
            ctx.font = "bold 13px 'Courier New', monospace";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Truncate text if needed
            let text = obj.text;
            if (ctx.measureText(text).width > w - 16) {
                while (ctx.measureText(text + '...').width > w - 16 && text.length > 0) {
                    text = text.slice(0, -1);
                }
                text += '...';
            }
            ctx.fillText(text, obj.x, obj.y + h/2);

            ctx.restore();
        }

        function drawBullet(b) {
            ctx.save();
            ctx.shadowColor = "#fbbf24";
            ctx.shadowBlur = 15;

            // Energy beam
            const grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.height);
            grad.addColorStop(0, "#fbbf24");
            grad.addColorStop(1, "#f59e0b");
            ctx.fillStyle = grad;
            ctx.fillRect(b.x - b.width/2, b.y, b.width, b.height);

            // Core
            ctx.fillStyle = "#fff";
            ctx.fillRect(b.x - 1, b.y + 2, 2, b.height - 4);

            ctx.restore();
        }

        function drawPopups() {
            for (const s of popups) {
                ctx.save();
                ctx.globalAlpha = Math.min(1, s.life / 20);
                ctx.fillStyle = s.colour;
                ctx.font = "bold 18px 'Courier New', monospace";
                ctx.textAlign = "center";
                ctx.fillText(s.text, s.x, s.y);
                ctx.restore();
            }
        }

        function createExplosion(x, y, color) {
            for (let i = 0; i < 20; i++) {
                const angle = (Math.PI * 2 / 20) * i;
                const speed = 2 + Math.random() * 4;
                particles.push({
                    x: x, y: y,
                    dx: Math.cos(angle) * speed,
                    dy: Math.sin(angle) * speed,
                    life: 30 + Math.random() * 15,
                    color: color
                });
            }
        }

        function loop() {
            if(!document.getElementById('canvas-' + gameId)) {
                gameActive = false;
                return;
            }
            update();
            draw();
            if(gameActive) requestAnimationFrame(loop);
        }

        function updateHUD() {
            scoreDisplay.innerText = score;
            const percentage = MAX_SCORE > 0 ? (score / MAX_SCORE) * 100 : 0;
            scoreBar.style.width = percentage + '%';

            // Update LED lives display
            const ledsContainer = livesDisplay.querySelector('.${classPrefix}-leds');
            if (ledsContainer) {
                let ledsHtml = '';
                for (let i = 0; i < STARTING_LIVES; i++) {
                    ledsHtml += '<div class="${classPrefix}-led ' + (i < lives ? 'active' : '') + '"></div>';
                }
                ledsContainer.innerHTML = ledsHtml;
            }
        }

        function endGame(completedAllQuestions) {
            gameActive = false;
            const screen = document.getElementById('end-' + gameId);
            const title = document.getElementById('end-title-' + gameId);
            screen.classList.add('active');

            const passed = score >= PASS_THRESHOLD;

            if (passed) {
                title.innerText = "CALIBRATION COMPLETE";
                title.classList.add('success');
                title.classList.remove('failed');
            } else if (completedAllQuestions) {
                title.innerText = "RECALIBRATION NEEDED";
                title.classList.add('failed');
                title.classList.remove('success');
            } else {
                title.innerText = "SIGNAL LOST";
                title.classList.add('failed');
                title.classList.remove('success');
            }

            document.getElementById('end-score-value-' + gameId).textContent = score;

            let passInfo;
            if (passed) {
                passInfo = '<div class="${classPrefix}-pass-info success">Threshold reached: ' + score + ' / ' + PASS_THRESHOLD + '</div>';
            } else {
                passInfo = '<div class="${classPrefix}-pass-info failed">Below threshold: ' + score + ' / ' + PASS_THRESHOLD + '</div>';
            }

            document.getElementById('end-score-' + gameId).innerHTML = passInfo;

            const list = runStats.map(s =>
                '<div class="${classPrefix}-stat-item">' +
                    '<div class="${classPrefix}-stat-q">' + s.question + '</div>' +
                    '<div class="${classPrefix}-stat-a">' + s.correctAnswer + ' <span class="${classPrefix}-stat-attempts">(' + s.attempts + ' errors)</span></div>' +
                '</div>'
            ).join('');

            document.getElementById('end-feedback-' + gameId).innerHTML =
                '<div class="${classPrefix}-stats-list">' + list + '</div>';

            if (passed && window.completeGamificationActivity) {
                window.completeGamificationActivity(gameId);
            }
        }

        resize();
        drawBackground();

    })();
    </script>
  `;
}
