/**
 * Flashcard Activity - Modern Glass Edition
 * Sleek dark theme with glassmorphism and gradient accents
 */

import { FlashcardActivity } from './types';

export function renderFlashcard(activity: FlashcardActivity): string {
  const safeId = sanitizeId(activity.id);
  const totalCards = (activity.cards || []).length;

  const cardsHtml = (activity.cards || [])
    .map((card, index) => {
      const isActive = index === 0 ? ' active' : '';

      const renderContent = (content: string, type?: 'text' | 'image') => {
        if (type === 'image') {
          return `<div class="fc-content fc-image"><img src="${content}" alt="Flashcard image"></div>`;
        }
        return `<div class="fc-content">${escapeHtml(content)}</div>`;
      };

      return `
    <div class="fc-card${isActive}" data-index="${index}">
      <div class="fc-card-inner">
        <div class="fc-face fc-front">
          <div class="fc-label">Front</div>
          <div class="fc-body">
            ${renderContent(card.front, card.frontType)}
          </div>
          <div class="fc-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            <span>Tap to flip</span>
          </div>
        </div>
        <div class="fc-face fc-back">
          <div class="fc-label">Back</div>
          <div class="fc-body">
            ${renderContent(card.back, card.backType)}
          </div>
          <div class="fc-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
              <path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
            </svg>
            <span>Tap to flip</span>
          </div>
        </div>
      </div>
    </div>
  `;
    })
    .join('');

  return `
<div class="activity fc-activity" id="activity-${activity.id}" data-activity-type="flashcard" tabindex="0">

  <style>
    .fc-activity {
      /* Inherit from parent theme variables with fallbacks */
      --fc-bg: var(--bg, #0f172a);
      --fc-card: var(--surface-solid, #1e293b);
      --fc-card-hover: var(--surface, #334155);
      --fc-border: var(--card-border, rgba(148, 163, 184, 0.1));
      --fc-text: var(--text, #f1f5f9);
      --fc-text-muted: var(--text-muted, #94a3b8);
      --fc-accent: var(--primary, #a855f7);
      --fc-accent-secondary: var(--primary, #06b6d4);
      --fc-glow: var(--primary-glow, rgba(168, 85, 247, 0.15));
      --fc-card-bg: var(--card-bg, rgba(30, 41, 59, 0.6));

      font-family: inherit;
      max-width: 600px;
      margin: 24px auto;
      padding: 0 16px;
      outline: none;
    }

    /* Header */
    .fc-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .fc-progress {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .fc-counter {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--fc-text);
    }

    .fc-counter-current {
      color: var(--fc-accent);
    }

    .fc-progress-bar {
      width: 120px;
      height: 4px;
      background: var(--fc-card);
      border-radius: 2px;
      overflow: hidden;
    }

    .fc-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--fc-accent), var(--fc-accent-secondary));
      border-radius: 2px;
      transition: width 0.3s ease;
    }

    /* Deck */
    .fc-deck {
      position: relative;
      height: 420px;
      perspective: 1200px;
      margin-bottom: 24px;
    }

    /* Card */
    .fc-card {
      position: absolute;
      width: 100%;
      height: 100%;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateX(40px) scale(0.95);
    }

    .fc-card.active {
      opacity: 1;
      visibility: visible;
      transform: translateX(0) scale(1);
    }

    .fc-card.exit-left {
      opacity: 0;
      transform: translateX(-40px) scale(0.95);
    }

    .fc-card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
    }

    .fc-card.flipped .fc-card-inner {
      transform: rotateY(180deg);
    }

    /* Card Faces */
    .fc-face {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      border-radius: 20px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: var(--fc-card);
      border: 1px solid var(--fc-border);
      box-shadow:
        0 4px 6px -1px rgba(0, 0, 0, 0.1),
        0 2px 4px -2px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.05) inset;
    }

    .fc-front {
      background: var(--fc-card-bg);
    }

    .fc-front::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--fc-accent);
      pointer-events: none;
    }

    .fc-back {
      transform: rotateY(180deg);
      background: var(--fc-card-bg);
    }

    .fc-back::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--fc-accent-secondary);
      pointer-events: none;
    }

    /* Card hover effect */
    .fc-card:hover .fc-face {
      box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.2),
        0 4px 6px -4px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.08) inset,
        0 0 40px -10px var(--fc-glow);
    }

    /* Label */
    .fc-label {
      padding: 16px 24px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--fc-text-muted);
      border-bottom: 1px solid var(--fc-border);
    }

    .fc-front .fc-label {
      background: var(--primary-light, rgba(168, 85, 247, 0.1));
    }

    .fc-back .fc-label {
      background: var(--primary-light, rgba(6, 182, 212, 0.1));
      color: var(--fc-accent);
    }

    /* Body */
    .fc-body {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 32px;
    }

    .fc-content {
      font-size: 1.375rem;
      font-weight: 500;
      line-height: 1.5;
      color: var(--fc-text);
      text-align: center;
      max-width: 100%;
      word-wrap: break-word;
    }

    .fc-content img {
      max-width: 100%;
      max-height: 280px;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    /* Hint */
    .fc-hint {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      font-size: 0.8125rem;
      color: var(--fc-text-muted);
      border-top: 1px solid var(--fc-border);
      transition: color 0.2s ease;
    }

    .fc-card:hover .fc-hint {
      color: var(--fc-text);
    }

    .fc-hint svg {
      opacity: 0.7;
    }

    /* Navigation */
    .fc-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .fc-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--fc-text);
      background: var(--fc-card);
      border: 1px solid var(--fc-border);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .fc-btn:hover:not(:disabled) {
      background: var(--fc-card-hover);
      border-color: rgba(148, 163, 184, 0.2);
      transform: translateY(-1px);
    }

    .fc-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .fc-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .fc-btn svg {
      width: 18px;
      height: 18px;
    }

    .fc-dots {
      display: flex;
      gap: 6px;
      padding: 0 16px;
    }

    .fc-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--fc-card-hover);
      border: 1px solid var(--fc-border);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .fc-dot:hover {
      background: var(--fc-text-muted);
    }

    .fc-dot.active {
      background: var(--fc-accent);
      border-color: var(--fc-accent);
      box-shadow: 0 0 8px var(--fc-glow);
    }

    /* Keyboard hints */
    .fc-keys {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-top: 20px;
      font-size: 0.75rem;
      color: var(--fc-text-muted);
    }

    .fc-key {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 22px;
      padding: 0 6px;
      background: var(--fc-card);
      border: 1px solid var(--fc-border);
      border-radius: 4px;
      font-size: 0.6875rem;
      font-weight: 600;
      margin: 0 4px;
    }

    /* Focus state */
    .fc-activity:focus .fc-card.active .fc-face {
      box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.2),
        0 4px 6px -4px rgba(0, 0, 0, 0.1),
        0 0 0 2px var(--fc-accent),
        0 0 40px -10px var(--fc-glow);
    }

    /* Mobile */
    @media (max-width: 640px) {
      .fc-activity {
        margin: 16px auto;
      }

      .fc-deck {
        height: 360px;
      }

      .fc-content {
        font-size: 1.125rem;
      }

      .fc-content img {
        max-height: 220px;
      }

      .fc-body {
        padding: 20px 24px;
      }

      .fc-dots {
        display: none;
      }

      .fc-keys {
        display: none;
      }

      .fc-btn {
        padding: 10px 16px;
      }

      .fc-progress-bar {
        width: 80px;
      }
    }

    @media (max-width: 400px) {
      .fc-deck {
        height: 320px;
      }

      .fc-face {
        border-radius: 16px;
      }

      .fc-content {
        font-size: 1rem;
      }

      .fc-content img {
        max-height: 180px;
      }
    }
  </style>

  <div class="fc-header">
    <div class="fc-progress">
      <span class="fc-counter">
        <span class="fc-counter-current" id="fc-current-${activity.id}">1</span>
        <span> / ${totalCards}</span>
      </span>
      <div class="fc-progress-bar">
        <div class="fc-progress-fill" id="fc-progress-${activity.id}" style="width: ${totalCards > 0 ? (1 / totalCards) * 100 : 0}%"></div>
      </div>
    </div>
  </div>

  <div class="fc-deck" id="fc-deck-${activity.id}">
    ${cardsHtml}
  </div>

  <div class="fc-nav">
    <button class="fc-btn" onclick="fcPrev_${safeId}()" id="fc-prev-${activity.id}" aria-label="Previous card">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
      <span>Prev</span>
    </button>

    <div class="fc-dots" id="fc-dots-${activity.id}">
      ${(activity.cards || []).map((_, i) => `<div class="fc-dot${i === 0 ? ' active' : ''}" data-index="${i}"></div>`).join('')}
    </div>

    <button class="fc-btn" onclick="fcNext_${safeId}()" id="fc-next-${activity.id}" aria-label="Next card">
      <span>Next</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  </div>

  <div class="fc-keys">
    <span><span class="fc-key">←</span><span class="fc-key">→</span> Navigate</span>
    <span><span class="fc-key">Space</span> Flip</span>
  </div>
</div>

<script>
  (function() {
    var current_${safeId} = 0;
    var total_${safeId} = ${totalCards};
    var deck_${safeId} = document.getElementById('fc-deck-${activity.id}');
    var dots_${safeId} = document.getElementById('fc-dots-${activity.id}');
    var activity_${safeId} = document.getElementById('activity-${activity.id}');

    updateButtons_${safeId}();

    // Click to flip
    if (deck_${safeId}) {
      var cards = deck_${safeId}.querySelectorAll('.fc-card');
      for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener('click', function() {
          this.classList.toggle('flipped');
        });
      }
    }

    // Dot navigation
    if (dots_${safeId}) {
      var dotEls = dots_${safeId}.querySelectorAll('.fc-dot');
      for (var i = 0; i < dotEls.length; i++) {
        (function(index) {
          dotEls[index].addEventListener('click', function(e) {
            e.stopPropagation();
            goToCard_${safeId}(index);
          });
        })(i);
      }
    }

    // Keyboard
    if (activity_${safeId}) {
      activity_${safeId}.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          fcPrev_${safeId}();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          fcNext_${safeId}();
        } else if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          var activeCard = deck_${safeId}.querySelector('.fc-card.active');
          if (activeCard) activeCard.classList.toggle('flipped');
        }
      });
    }

    function goToCard_${safeId}(index) {
      if (index < 0 || index >= total_${safeId} || index === current_${safeId}) return;

      var cards = deck_${safeId}.children;
      var oldCard = cards[current_${safeId}];
      var newCard = cards[index];
      var goingForward = index > current_${safeId};

      oldCard.classList.remove('active', 'flipped');
      if (goingForward) oldCard.classList.add('exit-left');

      current_${safeId} = index;

      setTimeout(function() {
        oldCard.classList.remove('exit-left');
        newCard.classList.add('active');
      }, 50);

      document.getElementById('fc-current-${activity.id}').textContent = current_${safeId} + 1;
      document.getElementById('fc-progress-${activity.id}').style.width = ((current_${safeId} + 1) / total_${safeId} * 100) + '%';
      updateButtons_${safeId}();
      updateDots_${safeId}();
    }

    window.fcNext_${safeId} = function() {
      if (current_${safeId} < total_${safeId} - 1) goToCard_${safeId}(current_${safeId} + 1);
    };

    window.fcPrev_${safeId} = function() {
      if (current_${safeId} > 0) goToCard_${safeId}(current_${safeId} - 1);
    };

    function updateButtons_${safeId}() {
      var prevBtn = document.getElementById('fc-prev-${activity.id}');
      var nextBtn = document.getElementById('fc-next-${activity.id}');
      if (prevBtn) prevBtn.disabled = current_${safeId} === 0;
      if (nextBtn) nextBtn.disabled = current_${safeId} === total_${safeId} - 1;
    }

    function updateDots_${safeId}() {
      if (!dots_${safeId}) return;
      var dotEls = dots_${safeId}.querySelectorAll('.fc-dot');
      for (var i = 0; i < dotEls.length; i++) {
        dotEls[i].classList.toggle('active', i === current_${safeId});
      }
    }
  })();
</script>
`;
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_');
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
