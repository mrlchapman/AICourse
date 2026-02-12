/**
 * Timeline Activity
 * Vertical timeline for displaying chronological content
 */

import { TimelineActivity } from './types';

export function renderTimeline(activity: TimelineActivity): string {
    const safeId = sanitizeId(activity.id);

    const eventsHtml = (activity.events || [])
        .map((event, index) => `
      <div class="timeline-event" data-index="${index}">
        <div class="timeline-marker">
          <div class="timeline-dot">
            ${event.icon ? `<span class="timeline-icon">${escapeHtml(event.icon)}</span>` : `<span class="timeline-number">${index + 1}</span>`}
          </div>
          ${index < (activity.events || []).length - 1 ? '<div class="timeline-line"></div>' : ''}
        </div>
        <div class="timeline-content">
          ${event.date ? `<div class="timeline-date">${escapeHtml(event.date)}</div>` : ''}
          <h4 class="timeline-title">${escapeHtml(event.title)}</h4>
          <div class="timeline-description">${event?.content || ''}</div>
          ${event.image ? `<img src="${escapeHtml(event.image)}" alt="${escapeHtml(event.title)}" class="timeline-image">` : ''}
        </div>
      </div>
    `)
        .join('');

    return `
<div class="activity timeline-activity" id="activity-${activity.id}" data-activity-type="timeline">
  ${activity.title ? `<h3 class="timeline-heading">${escapeHtml(activity.title)}</h3>` : ''}
  <div class="timeline-container" id="timeline-${safeId}">
    ${eventsHtml}
  </div>
</div>

<style>
  .timeline-activity {
    margin: 24px 0;
  }

  .timeline-heading {
    font-size: 1.4rem;
    font-weight: 700;
    margin-bottom: 32px;
    color: var(--text);
  }

  .timeline-container {
    position: relative;
    padding-left: 0;
  }

  .timeline-event {
    display: flex;
    gap: 24px;
    margin-bottom: 0;
    opacity: 0;
    transform: translateX(-20px);
    animation: slideInTimeline 0.6s ease forwards;
  }

  .timeline-event:nth-child(1) { animation-delay: 0.1s; }
  .timeline-event:nth-child(2) { animation-delay: 0.2s; }
  .timeline-event:nth-child(3) { animation-delay: 0.3s; }
  .timeline-event:nth-child(4) { animation-delay: 0.4s; }
  .timeline-event:nth-child(5) { animation-delay: 0.5s; }
  .timeline-event:nth-child(n+6) { animation-delay: 0.6s; }

  @keyframes slideInTimeline {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .timeline-marker {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  .timeline-dot {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), #a855f7);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 1rem;
    box-shadow: 0 4px 20px var(--primary-glow);
    position: relative;
    z-index: 2;
  }

  .timeline-dot::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), #a855f7);
    opacity: 0.3;
    z-index: -1;
  }

  .timeline-icon {
    font-size: 1.3rem;
  }

  .timeline-number {
    font-size: 1rem;
  }

  .timeline-line {
    width: 3px;
    flex: 1;
    min-height: 40px;
    background: linear-gradient(to bottom, var(--primary), var(--primary-light));
    margin: 8px 0;
  }

  .timeline-content {
    flex: 1;
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 16px;
    border: 1px solid var(--card-border);
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: var(--card-shadow);
    transition: all 0.3s ease;
  }

  .timeline-content:hover {
    border-color: var(--primary-light);
    transform: translateX(8px);
  }

  .timeline-date {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--primary);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .timeline-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text);
    margin: 0 0 12px 0;
  }

  .timeline-description {
    color: var(--text-muted);
    line-height: 1.7;
  }

  .timeline-description p:last-child {
    margin-bottom: 0;
  }

  .timeline-image {
    margin-top: 16px;
    border-radius: 12px;
    max-width: 100%;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 768px) {
    .timeline-event {
      gap: 16px;
    }

    .timeline-dot {
      width: 40px;
      height: 40px;
      font-size: 0.9rem;
    }

    .timeline-content {
      padding: 20px;
    }

    .timeline-title {
      font-size: 1.05rem;
    }
  }
</style>
`;
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
