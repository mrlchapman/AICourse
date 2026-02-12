/**
 * Fill in the Blank Activity
 * Modern, engaging sentence completion with immediate feedback
 */

import { FillInBlankActivity } from './types';

export function renderFillInBlank(activity: FillInBlankActivity): string {
  const safeId = sanitizeId(activity.id);
  const blanks = activity.blanks || [];
  const config = activity.config || {};
  const useWordBank = config.useWordBank ?? false;
  const caseSensitive = config.caseSensitive ?? false;
  const shuffleWordBank = config.shuffleWordBank ?? true;
  const showHintAfterAttempts = config.showHintAfterAttempts ?? 2;

  // Parse text and replace {0}, {1}, etc. with input slots
  const textParts = parseTextWithBlanks(activity.text, blanks, safeId);

  // Build word bank if enabled
  const wordBankHtml = useWordBank ? buildWordBank(blanks, safeId, shuffleWordBank) : '';

  // Build blanks data for JS
  const blanksData = JSON.stringify(blanks.map((b, i) => ({
    id: b.id,
    index: i,
    answers: (b.answers || []).map(a => caseSensitive ? a : a.toLowerCase()),
    hint: b.hint || '',
    primaryAnswer: b.answers[0] || ''
  })));

  return `
<div class="activity fib-activity" id="activity-${activity.id}" data-activity-type="fill_in_blank" data-activity-id="${activity.id}">

  <style>
    .fib-activity {
      --fib-bg: var(--surface, #1e293b);
      --fib-card: var(--card-bg, rgba(30, 41, 59, 0.8));
      --fib-border: var(--border, rgba(148, 163, 184, 0.2));
      --fib-text: var(--text, #f1f5f9);
      --fib-text-muted: var(--text-muted, #94a3b8);
      --fib-primary: var(--primary, #8b5cf6);
      --fib-success: var(--success, #10b981);
      --fib-error: var(--error, #ef4444);
      --fib-warning: var(--warning, #f59e0b);

      max-width: 800px;
      margin: 0 auto;
      font-family: inherit;
    }

    .fib-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .fib-instruction {
      font-size: 0.9rem;
      color: var(--fib-text-muted);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .fib-instruction svg {
      width: 18px;
      height: 18px;
      opacity: 0.7;
    }

    .fib-stats {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .fib-progress-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .fib-progress-bar {
      width: 100px;
      height: 6px;
      background: var(--fib-bg);
      border-radius: 3px;
      overflow: hidden;
    }

    .fib-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--fib-primary), var(--fib-success));
      border-radius: 3px;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      width: 0%;
    }

    .fib-progress-text {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--fib-text-muted);
    }

    .fib-streak {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.1));
      border: 1px solid rgba(251, 191, 36, 0.3);
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      color: #fbbf24;
      opacity: 0;
      transform: scale(0.8);
      transition: all 0.3s ease;
    }

    .fib-streak.visible {
      opacity: 1;
      transform: scale(1);
    }

    .fib-streak.pulse {
      animation: streakPulse 0.4s ease;
    }

    @keyframes streakPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    /* Main content area */
    .fib-content {
      background: var(--fib-card);
      border: 1px solid var(--fib-border);
      border-radius: 16px;
      padding: 32px;
      line-height: 2.2;
      font-size: 1.15rem;
      color: var(--fib-text);
      position: relative;
      overflow: hidden;
    }

    .fib-content::before {
      content: '✏️';
      position: absolute;
      top: 16px;
      right: 20px;
      font-size: 1.5rem;
      opacity: 0.1;
      pointer-events: none;
    }

    /* Input slots */
    .fib-slot {
      display: inline-flex;
      align-items: center;
      position: relative;
      margin: 0 4px;
      vertical-align: middle;
    }

    .fib-input {
      min-width: 120px;
      width: auto;
      padding: 8px 16px;
      font-size: 1rem;
      font-weight: 500;
      font-family: inherit;
      color: var(--fib-text);
      background: var(--fib-bg);
      border: 2px solid var(--fib-border);
      border-radius: 10px;
      outline: none;
      transition: all 0.3s ease;
      text-align: center;
    }

    .fib-input::placeholder {
      color: var(--fib-text-muted);
      font-style: italic;
      font-weight: 400;
    }

    .fib-input:focus {
      border-color: var(--fib-primary);
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2), 0 0 20px rgba(139, 92, 246, 0.1);
    }

    .fib-input.correct {
      border-color: var(--fib-success);
      background: rgba(16, 185, 129, 0.1);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
      animation: correctPop 0.4s ease;
    }

    .fib-input.incorrect {
      border-color: var(--fib-error);
      background: rgba(239, 68, 68, 0.1);
      animation: shake 0.4s ease;
    }

    .fib-input.revealed {
      border-color: var(--fib-warning);
      background: rgba(245, 158, 11, 0.1);
      color: var(--fib-warning);
      font-style: italic;
    }

    .fib-input:disabled {
      cursor: default;
    }

    @keyframes correctPop {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-4px); }
      40% { transform: translateX(4px); }
      60% { transform: translateX(-4px); }
      80% { transform: translateX(4px); }
    }

    /* Feedback icon */
    .fib-feedback-icon {
      position: absolute;
      right: -28px;
      top: 50%;
      transform: translateY(-50%) scale(0);
      font-size: 1.2rem;
      transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .fib-feedback-icon.show {
      transform: translateY(-50%) scale(1);
    }

    /* Hint notification area - below the content */
    .fib-hint-area {
      margin-top: 16px;
      min-height: 0;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .fib-hint-notification {
      display: none;
      padding: 12px 16px;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.05));
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 12px;
      font-size: 0.9rem;
      color: var(--fib-warning);
      animation: hintSlideIn 0.3s ease;
    }

    .fib-hint-notification.visible {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .fib-hint-notification .hint-icon {
      font-size: 1.2rem;
    }

    .fib-hint-notification .hint-label {
      font-weight: 600;
      margin-right: 4px;
    }

    @keyframes hintSlideIn {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Word bank */
    .fib-word-bank {
      margin-top: 24px;
      padding: 20px;
      background: var(--fib-bg);
      border: 1px dashed var(--fib-border);
      border-radius: 12px;
    }

    .fib-word-bank-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--fib-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }

    .fib-word-bank-items {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .fib-word-chip {
      padding: 8px 16px;
      background: var(--fib-card);
      border: 1px solid var(--fib-border);
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--fib-text);
      cursor: pointer;
      transition: all 0.2s ease;
      user-select: none;
    }

    .fib-word-chip:hover:not(.used) {
      border-color: var(--fib-primary);
      background: rgba(139, 92, 246, 0.1);
      transform: translateY(-2px);
    }

    .fib-word-chip.used {
      opacity: 0.4;
      text-decoration: line-through;
      cursor: default;
    }

    .fib-word-chip.selected {
      border-color: var(--fib-primary);
      background: var(--fib-primary);
      color: white;
    }

    /* Actions */
    .fib-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .fib-btn {
      padding: 10px 20px;
      font-size: 0.9rem;
      font-weight: 600;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .fib-btn-secondary {
      background: var(--fib-bg);
      color: var(--fib-text-muted);
      border: 1px solid var(--fib-border);
    }

    .fib-btn-secondary:hover {
      background: var(--fib-card);
      color: var(--fib-text);
    }

    .fib-btn-primary {
      background: linear-gradient(135deg, var(--fib-primary), #7c3aed);
      color: white;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }

    .fib-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
    }

    .fib-btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* Completion state */
    .fib-complete {
      display: none;
      text-align: center;
      padding: 24px;
      margin-top: 20px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.1));
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 16px;
      animation: slideUp 0.4s ease;
    }

    .fib-complete.show {
      display: block;
    }

    .fib-complete-icon {
      font-size: 3rem;
      margin-bottom: 12px;
    }

    .fib-complete-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--fib-success);
      margin-bottom: 8px;
    }

    .fib-complete-subtitle {
      font-size: 0.9rem;
      color: var(--fib-text-muted);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Confetti */
    .fib-confetti {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
    }

    .fib-confetti-piece {
      position: absolute;
      width: 10px;
      height: 10px;
      opacity: 0;
    }

    /* Mobile adjustments */
    @media (max-width: 640px) {
      .fib-content {
        padding: 24px 20px;
        font-size: 1rem;
        line-height: 2;
      }

      .fib-input {
        min-width: 100px;
        padding: 6px 12px;
        font-size: 0.9rem;
      }

      .fib-feedback-icon {
        right: -24px;
        font-size: 1rem;
      }

      .fib-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .fib-progress-bar {
        width: 80px;
      }

      .fib-word-chip {
        padding: 6px 12px;
        font-size: 0.85rem;
      }
    }
  </style>

  <div class="fib-header">
    <div class="fib-instruction">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
      <span>${escapeHtml(activity.instruction || 'Fill in the blanks to complete the text')}</span>
    </div>
    <div class="fib-stats">
      <div class="fib-progress-wrap">
        <div class="fib-progress-bar">
          <div class="fib-progress-fill" id="fib-progress-${safeId}"></div>
        </div>
        <span class="fib-progress-text"><span id="fib-completed-${safeId}">0</span>/${blanks.length}</span>
      </div>
      <div class="fib-streak" id="fib-streak-${safeId}">
        🔥 <span id="fib-streak-count-${safeId}">0</span> streak
      </div>
    </div>
  </div>

  <div class="fib-content">
    ${textParts}
  </div>

  <!-- Hint notification area - shows below content when triggered -->
  <div class="fib-hint-area">
    <div class="fib-hint-notification" id="fib-hint-notification-${safeId}">
      <span class="hint-icon">💡</span>
      <span><span class="hint-label">Hint:</span> <span id="fib-hint-text-${safeId}"></span></span>
    </div>
  </div>

  ${wordBankHtml}

  <div class="fib-actions">
    <button class="fib-btn fib-btn-secondary" onclick="fibRevealAll_${safeId}()" id="fib-reveal-btn-${safeId}">
      👁️ Reveal All
    </button>
    <button class="fib-btn fib-btn-primary" onclick="fibCheckAll_${safeId}()" id="fib-check-btn-${safeId}">
      ✓ Check Answers
    </button>
  </div>

  <div class="fib-complete" id="fib-complete-${safeId}">
    <div class="fib-complete-icon">🎉</div>
    <div class="fib-complete-title">Excellent Work!</div>
    <div class="fib-complete-subtitle">You've completed all the blanks correctly.</div>
  </div>
</div>

<script>
(function() {
  var safeId = '${safeId}';
  var blanksData = ${blanksData};
  var totalBlanks = blanksData.length;
  var caseSensitive = ${caseSensitive};
  var useWordBank = ${useWordBank};
  var showHintAfterAttempts = ${showHintAfterAttempts};

  var state = {
    completed: new Set(),
    attempts: {},
    streak: 0,
    selectedWord: null,
    currentHintIndex: null
  };

  // Initialize attempts counter
  blanksData.forEach(function(b) {
    state.attempts[b.id] = 0;
  });

  // Show hint in notification area
  function showHint(hint, blankIndex) {
    var notification = document.getElementById('fib-hint-notification-' + safeId);
    var hintText = document.getElementById('fib-hint-text-' + safeId);
    if (notification && hintText && hint) {
      hintText.textContent = hint + ' (Blank ' + (blankIndex + 1) + ')';
      notification.classList.add('visible');
      state.currentHintIndex = blankIndex;
    }
  }

  // Hide hint notification
  function hideHint() {
    var notification = document.getElementById('fib-hint-notification-' + safeId);
    if (notification) {
      notification.classList.remove('visible');
    }
    state.currentHintIndex = null;
  }

  // Check a single blank
  window.fibCheckBlank_${safeId} = function(blankId, index) {
    var input = document.getElementById('fib-input-' + safeId + '-' + index);
    var feedbackIcon = document.getElementById('fib-icon-' + safeId + '-' + index);
    var blank = blanksData[index];

    if (!input || state.completed.has(blankId)) return;

    var value = input.value.trim();
    if (!value) return;

    var checkValue = caseSensitive ? value : value.toLowerCase();
    var isCorrect = blank.answers.includes(checkValue);

    input.classList.remove('correct', 'incorrect');
    feedbackIcon.classList.remove('show');

    if (isCorrect) {
      input.classList.add('correct');
      input.disabled = true;
      feedbackIcon.textContent = '✓';
      feedbackIcon.style.color = 'var(--fib-success)';
      feedbackIcon.classList.add('show');
      state.completed.add(blankId);
      state.streak++;
      updateProgress();
      updateStreak();
      hideHint();

      if (useWordBank) {
        markWordUsed(value);
      }

      // Check if all complete
      if (state.completed.size === totalBlanks) {
        showComplete();
      }
    } else {
      input.classList.add('incorrect');
      feedbackIcon.textContent = '✗';
      feedbackIcon.style.color = 'var(--fib-error)';
      feedbackIcon.classList.add('show');
      state.streak = 0;
      updateStreak();
      state.attempts[blankId]++;

      // Show hint after X attempts
      if (showHintAfterAttempts > 0 && state.attempts[blankId] >= showHintAfterAttempts && blank.hint) {
        showHint(blank.hint, index);
      }

      // Clear incorrect state after animation
      setTimeout(function() {
        input.classList.remove('incorrect');
        feedbackIcon.classList.remove('show');
      }, 1500);
    }
  };

  // Check all blanks
  window.fibCheckAll_${safeId} = function() {
    blanksData.forEach(function(blank, index) {
      if (!state.completed.has(blank.id)) {
        fibCheckBlank_${safeId}(blank.id, index);
      }
    });
  };

  // Reveal all answers
  window.fibRevealAll_${safeId} = function() {
    blanksData.forEach(function(blank, index) {
      if (!state.completed.has(blank.id)) {
        var input = document.getElementById('fib-input-' + safeId + '-' + index);
        var feedbackIcon = document.getElementById('fib-icon-' + safeId + '-' + index);
        if (input) {
          input.value = blank.primaryAnswer;
          input.disabled = true;
          input.classList.add('revealed');
          feedbackIcon.textContent = '💡';
          feedbackIcon.style.color = 'var(--fib-warning)';
          feedbackIcon.classList.add('show');
          state.completed.add(blank.id);

          if (useWordBank) {
            markWordUsed(blank.primaryAnswer);
          }
        }
      }
    });
    state.streak = 0;
    updateProgress();
    updateStreak();
    hideHint();
  };

  // Word bank selection
  window.fibSelectWord_${safeId} = function(word, chipEl) {
    if (chipEl.classList.contains('used')) return;

    // Deselect previous
    var chips = document.querySelectorAll('#fib-wordbank-${safeId} .fib-word-chip');
    chips.forEach(function(c) { c.classList.remove('selected'); });

    // Select this one
    chipEl.classList.add('selected');
    state.selectedWord = word;

    // Focus on first empty input
    for (var i = 0; i < blanksData.length; i++) {
      if (!state.completed.has(blanksData[i].id)) {
        var input = document.getElementById('fib-input-' + safeId + '-' + i);
        if (input && !input.value) {
          input.value = word;
          input.focus();
          break;
        }
      }
    }
  };

  function markWordUsed(word) {
    var chips = document.querySelectorAll('#fib-wordbank-${safeId} .fib-word-chip');
    chips.forEach(function(chip) {
      if (chip.textContent.toLowerCase() === word.toLowerCase()) {
        chip.classList.add('used');
        chip.classList.remove('selected');
      }
    });
    state.selectedWord = null;
  }

  function updateProgress() {
    var pct = (state.completed.size / totalBlanks) * 100;
    var progressBar = document.getElementById('fib-progress-' + safeId);
    var completedText = document.getElementById('fib-completed-' + safeId);
    if (progressBar) progressBar.style.width = pct + '%';
    if (completedText) completedText.textContent = state.completed.size;
  }

  function updateStreak() {
    var streakEl = document.getElementById('fib-streak-' + safeId);
    var streakCount = document.getElementById('fib-streak-count-' + safeId);
    if (!streakEl || !streakCount) return;

    streakCount.textContent = state.streak;

    if (state.streak >= 2) {
      streakEl.classList.add('visible');
      streakEl.classList.remove('pulse');
      void streakEl.offsetWidth; // Trigger reflow
      streakEl.classList.add('pulse');
    } else {
      streakEl.classList.remove('visible');
    }
  }

  function showComplete() {
    var completeEl = document.getElementById('fib-complete-' + safeId);
    if (completeEl) {
      completeEl.classList.add('show');
      hideHint();
      launchConfetti();
    }
  }

  function launchConfetti() {
    var colors = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
    var container = document.createElement('div');
    container.className = 'fib-confetti';
    document.body.appendChild(container);

    for (var i = 0; i < 50; i++) {
      var piece = document.createElement('div');
      piece.className = 'fib-confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      piece.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      container.appendChild(piece);

      animateConfetti(piece);
    }

    setTimeout(function() {
      container.remove();
    }, 3000);
  }

  function animateConfetti(piece) {
    var startY = -20;
    var endY = window.innerHeight + 20;
    var startX = parseFloat(piece.style.left);
    var drift = (Math.random() - 0.5) * 200;
    var duration = 2000 + Math.random() * 1000;
    var delay = Math.random() * 500;

    setTimeout(function() {
      piece.style.opacity = '1';
      piece.style.transition = 'transform ' + duration + 'ms ease-out, opacity 0.5s ease';
      piece.style.transform = 'translateY(' + endY + 'px) translateX(' + drift + 'px) rotate(' + (Math.random() * 720) + 'deg)';

      setTimeout(function() {
        piece.style.opacity = '0';
      }, duration - 500);
    }, delay);
  }

  // Enter key to check
  document.querySelectorAll('.fib-input').forEach(function(input) {
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var index = parseInt(this.dataset.index);
        var blankId = blanksData[index].id;
        fibCheckBlank_${safeId}(blankId, index);
      }
    });
  });
})();
</script>
`;
}

function parseTextWithBlanks(text: string, blanks: FillInBlankActivity['blanks'], safeId: string): string {
  let result = text;

  // Replace {0}, {1}, etc. with input slots
  blanks.forEach((blank, index) => {
    const placeholder = `{${index}}`;
    const hint = blank.hint || `blank ${index + 1}`;
    const inputHtml = `
      <span class="fib-slot">
        <input
          type="text"
          class="fib-input"
          id="fib-input-${safeId}-${index}"
          data-index="${index}"
          data-blank-id="${blank.id}"
          placeholder="${escapeHtml(hint)}"
          autocomplete="off"
          spellcheck="false"
        />
        <span class="fib-feedback-icon" id="fib-icon-${safeId}-${index}"></span>
      </span>`;
    result = result.replace(placeholder, inputHtml);
  });

  return result;
}

function buildWordBank(blanks: FillInBlankActivity['blanks'], safeId: string, shuffle: boolean): string {
  // Collect all primary answers
  let words = blanks.map(b => b.answers[0] || '');

  // Shuffle if enabled
  if (shuffle) {
    words = shuffleArray([...words]);
  }

  const chipsHtml = words.map(word =>
    `<span class="fib-word-chip" onclick="fibSelectWord_${safeId}('${escapeHtml(word)}', this)">${escapeHtml(word)}</span>`
  ).join('');

  return `
    <div class="fib-word-bank" id="fib-wordbank-${safeId}">
      <div class="fib-word-bank-title">Word Bank</div>
      <div class="fib-word-bank-items">
        ${chipsHtml}
      </div>
    </div>
  `;
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_');
}

function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
