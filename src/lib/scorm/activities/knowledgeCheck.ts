/**
 * Knowledge Check Activity
 * Multiple choice quiz questions with feedback
 */

import { KnowledgeCheckActivity } from './types';

export function renderKnowledgeCheck(activity: KnowledgeCheckActivity): string {
  const optionsHtml = activity.options
    .map(
      (option) => `
    <div class="kc-option" data-option-id="${option.id}" data-correct="${option.correct === true}">
      <input type="radio" name="kc-${activity.id}" id="kc-${activity.id}-${option.id}" value="${option.id}">
      <label for="kc-${activity.id}-${option.id}">${escapeHtml(option.text)}</label>
    </div>
  `
    )
    .join('');

  return `
<div class="activity knowledge-check interactive-card" id="activity-${activity.id}" data-activity-type="knowledge_check" data-activity-id="${activity.id}">
  <div class="kc-question">
    <h3>${escapeHtml(activity.question)}</h3>
  </div>
  <div class="kc-options">
    ${optionsHtml}
  </div>
  <button class="btn kc-submit" onclick="window.checkKnowledgeCheck('${activity.id}')">Submit Answer</button>
  <div class="kc-feedback" id="kc-feedback-${activity.id}" style="display: none;"></div>
  ${activity.explanation ? `<div class="kc-explanation" id="kc-explanation-${activity.id}" style="display: none;">${escapeHtml(activity.explanation)}</div>` : ''}
</div>

<style>
  .knowledge-check {
    position: relative;
    overflow: hidden;
  }

  .knowledge-check::before {
    content: '❓';
    position: absolute;
    top: 20px;
    right: 24px;
    font-size: 2rem;
    opacity: 0.15;
    pointer-events: none;
  }
  
  .kc-question h3 {
    margin-top: 0;
    color: var(--text);
    font-size: 1.2rem;
    font-weight: 600;
    padding-right: 48px;
    line-height: 1.5;
  }
  
  .kc-options {
    margin: 24px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .kc-option {
    display: flex;
    align-items: center;
    padding: 16px 20px;
    background: var(--surface);
    border: 2px solid var(--border);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .kc-option::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, var(--primary-light), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .kc-option:hover {
    border-color: var(--primary);
    transform: translateX(4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .kc-option:hover::before {
    opacity: 1;
  }
  
  .kc-option.correct {
    border-color: var(--success);
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.1));
    animation: correctPulse 0.5s ease;
  }

  @keyframes correctPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }
  
  .kc-option.incorrect {
    border-color: var(--error);
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(244, 63, 94, 0.1));
    animation: shake 0.5s ease;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-6px); }
    40% { transform: translateX(6px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
  
  .kc-option input[type="radio"] {
    appearance: none;
    -webkit-appearance: none;
    width: 24px;
    height: 24px;
    border: 2px solid var(--border);
    border-radius: 50%;
    margin-right: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    flex-shrink: 0;
    background: var(--card-bg);
  }

  .kc-option input[type="radio"]:checked {
    border-color: var(--primary);
    background: var(--primary);
  }

  .kc-option input[type="radio"]:checked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    background: white;
    border-radius: 50%;
  }

  .kc-option.correct input[type="radio"]:checked {
    border-color: var(--success);
    background: var(--success);
  }

  .kc-option.incorrect input[type="radio"]:checked {
    border-color: var(--error);
    background: var(--error);
  }
  
  .kc-option label {
    cursor: pointer;
    flex: 1;
    font-weight: 500;
    line-height: 1.5;
    position: relative;
    z-index: 1;
    color: var(--text);
  }
  
  .kc-submit {
    margin-top: 20px;
  }
  
  .kc-feedback {
    margin-top: 20px;
    padding: 16px 20px;
    border-radius: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .kc-feedback.correct {
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(20, 184, 166, 0.15));
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }
  
  .kc-feedback.incorrect {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(244, 63, 94, 0.15));
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }
  
  .kc-explanation {
    margin-top: 16px;
    padding: 16px 20px;
    background: linear-gradient(135deg, var(--primary-light), rgba(99, 102, 241, 0.05));
    border-left: 4px solid var(--primary);
    border-radius: 0 14px 14px 0;
    color: var(--text);
    line-height: 1.6;
    animation: slideUp 0.3s ease 0.1s both;
  }
</style>


`;
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

