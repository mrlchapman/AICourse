/**
 * Memory Match Game Engine
 * Pure game logic separated from rendering
 * This can be used with any theme/style
 */

import { GamificationActivity, safeJsonEmbed } from '../core/types';

/** Configuration for Memory Match game */
export interface MemoryMatchConfig {
  pairs: MemoryMatchPair[];
  penaltyShuffle: boolean;
  required: boolean;
}

/** A pair of items to match */
export interface MemoryMatchPair {
  id: string;
  item1: MemoryMatchItem;
  item2: MemoryMatchItem;
  info?: string;
}

/** An individual item in a pair */
export interface MemoryMatchItem {
  type: 'text' | 'image';
  content: string;
}

/** A card in the game grid */
export interface GameCard {
  id: string;
  pairId: string;
  type: 'text' | 'image';
  content: string;
  info?: string;
}

/** Zener-style symbols for card backs */
export const CARD_SYMBOLS = ['◯', '✚', '∿', '☆', '■'];

/**
 * Extracts game configuration from activity
 */
export function extractConfig(activity: GamificationActivity): MemoryMatchConfig {
  // Defensive: if activity or config is missing, return safe defaults
  return {
    pairs: activity.config?.pairs || [],
    penaltyShuffle: activity.config?.penaltyShuffle || false,
    required: activity.config?.required || false,
  };
}

/**
 * Transforms pairs into game cards (2 cards per pair)
 */
export function createGameCards(pairs: MemoryMatchPair[]): GameCard[] {
  return pairs.flatMap(pair => [
    {
      id: `${pair.id}-1`,
      pairId: pair.id,
      type: pair.item1?.type || 'text',
      content: pair.item1?.content || '',
      info: pair.info,
    },
    {
      id: `${pair.id}-2`,
      pairId: pair.id,
      type: pair.item2?.type || 'text',
      content: pair.item2?.content || '',
      info: pair.info,
    },
  ]);
}

/**
 * Generates the client-side game script
 * This is the JavaScript that runs in the browser
 */
export function generateGameScript(
  gameId: string,
  uniqueId: string,
  config: MemoryMatchConfig,
  classPrefix: string
): string {
  const gameCards = createGameCards(config.pairs);
  const gameCardsJson = safeJsonEmbed(gameCards);

  return `
    <script type="application/json" id="cards-data-${gameId}">${gameCardsJson}</script>

    <script>
      (function() {
        const gameId = '${gameId}';
        const cardsEl = document.getElementById('cards-data-' + gameId);
        const rawData = cardsEl ? JSON.parse(cardsEl.textContent || '[]') : [];
        const penaltyShuffle = ${config.penaltyShuffle};
        const totalPairs = ${config.pairs.length};
        const symbols = ${JSON.stringify(CARD_SYMBOLS)};
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

        // Fullscreen toggle
        window['togglePsiFullscreen_${uniqueId}'] = function() {
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
          el.className = '${classPrefix}-card';
          el.dataset.id = card.id;
          el.dataset.pairId = card.pairId;
          el.style.animationDelay = (index * 0.05) + 's';

          const inner = document.createElement('div');
          inner.className = '${classPrefix}-card-inner';

          const front = document.createElement('div');
          front.className = '${classPrefix}-card-front';
          front.innerHTML = '<span class="${classPrefix}-card-symbol">' + getRandomSymbol() + '</span><span class="${classPrefix}-card-number">' + String(index + 1).padStart(2, '0') + '</span>';

          const back = document.createElement('div');
          back.className = '${classPrefix}-card-back';

          if (card.type === 'image') {
            const img = document.createElement('img');
            img.src = card.content;
            img.alt = 'Match';
            back.appendChild(img);
          } else {
            const text = document.createElement('span');
            text.className = '${classPrefix}-card-text';
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
            statusLight.className = '${classPrefix}-indicator-light';
            if (type) statusLight.classList.add('${classPrefix}-light-' + type);
          }
        }

        function updatePsiIndex() {
          const fill = document.getElementById('${classPrefix}-fill-' + gameId);
          if (!fill) return;
          const efficiency = moves > 0 ? (matchedCount / moves) : 0;
          const percentage = Math.min(100, efficiency * 100);
          fill.style.width = percentage + '%';
        }

        function flipCard(id) {
          if (locked) return;
          const cardIndex = cards.findIndex(c => c.id === id);
          const cardEl = document.querySelector('#grid-' + gameId + ' .${classPrefix}-card[data-id="' + id + '"]');

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
          grid.classList.add('${classPrefix}-shake');
          setTimeout(() => {
            grid.classList.remove('${classPrefix}-shake');
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

        window['initGame_${uniqueId}'] = function(id) {
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

        window['initGame_${uniqueId}'](gameId);
      })();
    </script>
  `;
}
