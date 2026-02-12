/**
 * Button/CTA Activity
 * Call-to-action buttons with customizable styling
 */

import { ButtonActivity } from './types';

export function renderButton(activity: ButtonActivity): string {
    const buttons = activity.buttons || [];
    const alignment = activity.alignment || 'center';

    const buttonsHtml = buttons
        .map((btn) => {
            const variant = btn.variant || 'primary';
            const size = btn.size || 'medium';
            const icon = btn.icon ? `<span class="btn-icon">${escapeHtml(btn.icon)}</span>` : '';
            const target = btn.openInNewTab ? 'target="_blank" rel="noopener noreferrer"' : '';

            return `
        <a 
          href="${escapeHtml(btn.url)}" 
          class="cta-button cta-${variant} cta-${size}"
          ${target}
        >
          ${icon}
          <span class="btn-text">${escapeHtml(btn.text)}</span>
          ${btn.openInNewTab ? '<span class="external-icon">↗</span>' : ''}
        </a>
      `;
        })
        .join('');

    return `
<div class="activity button-activity" id="activity-${activity.id}" data-activity-type="button">
  <div class="button-container align-${alignment}">
    ${buttonsHtml}
  </div>
</div>

<style>
  .button-activity {
    margin: 32px 0;
  }

  .button-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .button-container.align-left {
    justify-content: flex-start;
  }

  .button-container.align-center {
    justify-content: center;
  }

  .button-container.align-right {
    justify-content: flex-end;
  }

  .cta-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-weight: 600;
    text-decoration: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .cta-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  .cta-button:hover::before {
    left: 100%;
  }

  /* Sizes */
  .cta-small {
    padding: 10px 20px;
    font-size: 0.9rem;
    border-radius: 10px;
  }

  .cta-medium {
    padding: 14px 28px;
    font-size: 1rem;
  }

  .cta-large {
    padding: 18px 36px;
    font-size: 1.1rem;
    border-radius: 14px;
  }

  /* Variants */
  .cta-primary {
    background: linear-gradient(135deg, var(--primary), #a855f7);
    color: white;
    box-shadow: 0 4px 20px var(--primary-glow);
    border: none;
  }

  .cta-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px var(--primary-glow);
  }

  .cta-secondary {
    background: var(--surface);
    color: var(--text);
    border: 2px solid var(--border);
  }

  .cta-secondary:hover {
    background: var(--primary-light);
    border-color: var(--primary);
    color: var(--primary);
    transform: translateY(-3px);
  }

  .cta-outline {
    background: transparent;
    color: var(--primary);
    border: 2px solid var(--primary);
  }

  .cta-outline:hover {
    background: var(--primary);
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 8px 30px var(--primary-glow);
  }

  .cta-success {
    background: linear-gradient(135deg, #10b981, #14b8a6);
    color: white;
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
    border: none;
  }

  .cta-success:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(16, 185, 129, 0.5);
  }

  .cta-warning {
    background: linear-gradient(135deg, #f59e0b, #f97316);
    color: white;
    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
    border: none;
  }

  .cta-warning:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(245, 158, 11, 0.5);
  }

  .btn-icon {
    font-size: 1.2em;
  }

  .external-icon {
    font-size: 0.85em;
    opacity: 0.8;
    margin-left: 2px;
  }

  .cta-button:active {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    .button-container {
      flex-direction: column;
      align-items: stretch;
    }

    .button-container.align-center,
    .button-container.align-left,
    .button-container.align-right {
      align-items: stretch;
    }

    .cta-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>
`;
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
