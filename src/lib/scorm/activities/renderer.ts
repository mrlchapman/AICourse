/**
 * Activity Renderer
 * Central renderer that delegates to specific activity renderers
 */

import { Activity } from './types';
import { renderKnowledgeCheck } from './knowledgeCheck';
import { renderFlashcard } from './flashcard';
import { renderQuiz } from './quiz';
import { renderPDF } from './pdf';
import { renderGamification } from './gamification';
import { renderTabs } from './tabs';
import { renderTimeline } from './timeline';
import { renderButton } from './button';
import { renderAudio } from './audio';
import { renderGallery } from './gallery';
import { renderLiveActivity } from './live';
import { renderDivider } from './divider';
import { renderEmbed } from './embed';
import { renderModelViewer } from './modelViewer';
import { renderBranchingScenario } from './branchingScenario';
import { renderScreenRecording } from './screenRecording';
import { renderFillInBlank } from './fillInBlank';
import { escapeHtml } from './utils';

/**
 * Renders any activity type to HTML
 */
export function renderActivity(activity: Activity): string {
  // Defensive: skip undefined/null activities or those missing a type
  if (!activity || !activity.type) {
    console.warn('[Renderer] Skipping activity with missing type:', activity);
    return '';
  }

  switch (activity.type) {
    case 'quiz':
      return renderQuiz(activity);

    case 'knowledge_check':
      return renderKnowledgeCheck(activity);

    case 'flashcard':
      return renderFlashcard(activity);

    case 'text_content':
      return renderTextContent(activity);

    case 'image':
      return renderImage(activity);

    case 'infographic':
      return renderInfographic(activity);

    case 'video':
      return renderVideo(activity);

    case 'youtube':
      return renderYouTube(activity);

    case 'interactive_video':
      return renderInteractiveVideo(activity);

    case 'accordion':
      return renderAccordion(activity);

    case 'info_panel':
      return renderInfoPanel(activity);

    case 'code_snippet':
      return renderCodeSnippet(activity);

    case 'hotspot':
      return renderHotspot(activity);

    case 'sorting':
      return renderSorting(activity);

    case 'process':
      return renderProcess(activity);

    // Placeholder for activities not yet implemented
    case 'gamification':
      return renderGamification(activity);

    case 'matching':
      return renderMatching(activity);

    case 'sequence':
      return renderSequence(activity);

    case 'document_viewer':
      return `<div class="activity activity-placeholder">
        <p><em>Activity type "${activity.type}" coming soon...</em></p>
      </div>`;

    case 'pdf':
      return renderPDF(activity);

    // New content blocks
    case 'tabs':
      return renderTabs(activity);

    case 'timeline':
      return renderTimeline(activity);

    case 'button':
      return renderButton(activity);

    case 'audio':
      return renderAudio(activity);

    case 'gallery':
      return renderGallery(activity);

    case 'divider':
      return renderDivider(activity);

    case 'embed':
      return renderEmbed(activity);

    case 'model_viewer':
      return renderModelViewer(activity);

    case 'branching_scenario':
      return renderBranchingScenario(activity);

    case 'screen_recording':
      return renderScreenRecording(activity);

    case 'live':
      return renderLiveActivity(activity);

    case 'fill_in_blank':
      return renderFillInBlank(activity);

    case 'discussion':
      return renderDiscussion(activity);

    default:
      return `<div class="activity activity-error">
        <p><em>Unknown activity type</em></p>
      </div>`;
  }
}

function renderHotspot(activity: Extract<Activity, { type: 'hotspot' }>): string {
  // Guard against undefined imageUrl
  if (!activity.imageUrl) {
    return `<div class="activity hotspot-activity" id="activity-${activity.id}">
      <div class="hotspot-error" style="padding: 20px; text-align: center; color: #ef4444;">
        <p>⚠️ No image configured for this hotspot activity.</p>
      </div>
    </div>`;
  }

  const hotspotsHtml = (activity.hotspots || []).filter(Boolean).map((hotspot, index) => `
    <div class="hotspot-marker" style="left: ${hotspot.x}%; top: ${hotspot.y}%;" data-id="${hotspot.id}">
      <div class="hotspot-dot">${index + 1}</div>
      <div class="hotspot-popup">
        <h5>${escapeHtml(hotspot.title)}</h5>
        <div class="hotspot-content">${escapeHtml(hotspot?.content || '')}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="activity hotspot-activity" id="activity-${activity.id}">
      <div class="hotspot-container">
        <img src="${escapeHtml(activity.imageUrl)}" alt="Interactive Image" class="hotspot-image" referrerpolicy="no-referrer" crossorigin="anonymous" />
        ${hotspotsHtml}
      </div>
    </div>
    <style>
      .hotspot-activity {
        display: flex;
        justify-content: center;
        width: 100%;
        margin: 24px 0;
      }
      .hotspot-container {
        position: relative;
        display: inline-block;
        max-width: 100%;
      }
      .hotspot-image {
        display: block;
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }
      .hotspot-marker {
        position: absolute;
        width: 32px;
        height: 32px;
        transform: translate(-50%, -50%);
        cursor: pointer;
        z-index: 10;
      }
      .hotspot-dot {
        width: 100%;
        height: 100%;
        background-color: rgba(59, 130, 246, 0.9);
        color: white;
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: transform 0.2s, background-color 0.2s;
      }
      .hotspot-marker:hover .hotspot-dot {
        transform: scale(1.1);
        background-color: #2563eb;
      }
      .hotspot-popup {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(-10px);
        background: white;
        padding: 12px;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        width: 250px;
        opacity: 0;
        visibility: hidden;
        transition: all 0.2s ease;
        pointer-events: none;
        z-index: 20;
        border: 1px solid #e5e7eb;
        text-align: left; /* Ensure text inside popup is readable */
      }
      .hotspot-popup::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -8px;
        border-width: 8px;
        border-style: solid;
        border-color: white transparent transparent transparent;
      }
      .hotspot-marker:hover .hotspot-popup {
        opacity: 1;
        visibility: visible;
        transform: translateX(-50%) translateY(-15px);
        pointer-events: auto; /* Allow interaction if needed, though they fade out */
      }
      /* Prevent popup from going off-screen on mobile */
      @media (max-width: 600px) {
        .hotspot-popup {
          width: 200px;
        }
      }
      .hotspot-popup h5 {
        margin: 0 0 8px 0;
        color: #111827;
        font-size: 16px;
        font-weight: 600;
      }
      .hotspot-content {
        color: #4b5563;
        font-size: 14px;
        line-height: 1.5;
      }
    </style>
  `;
}

// Simple activity renderers

function renderTextContent(activity: Extract<Activity, { type: 'text_content' }>): string {
  return `<div class="activity text-content" id="activity-${activity.id}">
    ${activity.content || ''}
  </div>`;
}

function renderImage(activity: Extract<Activity, { type: 'image' }>): string {
  // Guard against undefined src
  if (!activity.src) {
    return `<div class="activity image-activity" id="activity-${activity.id}">
      <div class="image-error" style="padding: 40px; text-align: center; color: #6b7280; background: #f3f4f6; border-radius: 8px;">
        <p>🖼️ No image source configured.</p>
      </div>
    </div>`;
  }

  const isRequired = activity.required === true;
  const trackingClass = isRequired ? 'interactive-card' : '';
  const safeId = activity.id.replace(/[^a-zA-Z0-9]/g, '_');

  const viewedButton = isRequired ? `
    <button class="mark-viewed-btn" id="mark-viewed-${activity.id}" onclick="markContentViewed_${safeId}()">
      <span class="btn-icon">👁️</span> Mark as Viewed
    </button>
  ` : '';

  const trackingScript = isRequired ? `
    <script>
      (function() {
        window.markContentViewed_${safeId} = function() {
          var btn = document.getElementById('mark-viewed-${activity.id}');
          var activityEl = document.getElementById('activity-${activity.id}');
          if (!btn || !activityEl) return;
          
          btn.classList.add('viewed');
          btn.innerHTML = '<span class="btn-icon">✓</span> Viewed';
          btn.disabled = true;
          
          if (window.completedInteractions) {
            window.completedInteractions.add(activityEl);
          }
          if (window.updateActivityProgress) {
            window.updateActivityProgress();
          }
        };
      })();
    </script>
  ` : '';

  return `<div class="activity image-activity ${trackingClass}" id="activity-${activity.id}" data-activity-type="image">
    <img src="${activity.src}" alt="${escapeHtml(activity.alt)}" style="max-width: 100%; height: auto; border-radius: 8px;" referrerpolicy="no-referrer" crossorigin="anonymous" />
    ${activity.caption ? `<p class="image-caption">${escapeHtml(activity.caption)}</p>` : ''}
    ${viewedButton}
  </div>
  <style>
    .image-activity {
      text-align: center;
      margin: 24px 0;
    }
    .image-activity img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
    .image-caption {
      margin-top: 8px;
      font-style: italic;
      color: #6b7280;
    }
    .mark-viewed-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      margin-top: 16px;
      background: linear-gradient(135deg, var(--primary), #8b5cf6);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    }
    .mark-viewed-btn:hover:not(.viewed) {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(99, 102, 241, 0.4);
    }
    .mark-viewed-btn.viewed {
      background: linear-gradient(135deg, #10b981, #14b8a6);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
      cursor: default;
    }
    .mark-viewed-btn .btn-icon {
      font-size: 1rem;
    }
  </style>
  ${trackingScript}`;
}

function renderInfographic(activity: Extract<Activity, { type: 'infographic' }>): string {
  // Guard against undefined src
  if (!activity.src) {
    return `<div class="activity infographic-activity" id="activity-${activity.id}">
      <div class="infographic-error" style="padding: 40px; text-align: center; color: #6b7280; background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05)); border-radius: 16px; border: 1px solid rgba(99, 102, 241, 0.2);">
        <p>📊 No infographic image configured.</p>
      </div>
    </div>`;
  }

  const isRequired = activity.required === true;
  const trackingClass = isRequired ? 'interactive-card' : '';
  const safeId = activity.id.replace(/[^a-zA-Z0-9]/g, '_');

  const viewedButton = isRequired ? `
    <button class="mark-viewed-btn" id="mark-viewed-${activity.id}" onclick="markContentViewed_${safeId}()">
      <span class="btn-icon">👁️</span> Mark as Viewed
    </button>
  ` : '';

  const trackingScript = isRequired ? `
    <script>
      (function() {
        window.markContentViewed_${safeId} = function() {
          var btn = document.getElementById('mark-viewed-${activity.id}');
          var activityEl = document.getElementById('activity-${activity.id}');
          if (!btn || !activityEl) return;

          btn.classList.add('viewed');
          btn.innerHTML = '<span class="btn-icon">✓</span> Viewed';
          btn.disabled = true;

          if (window.completedInteractions) {
            window.completedInteractions.add(activityEl);
          }
          if (window.updateActivityProgress) {
            window.updateActivityProgress();
          }
        };
      })();
    </script>
  ` : '';

  return `<div class="activity infographic-activity ${trackingClass}" id="activity-${activity.id}" data-activity-type="infographic">
    ${activity.title ? `<h3 class="infographic-title">${escapeHtml(activity.title)}</h3>` : ''}
    <div class="infographic-image-container">
      <img src="${activity.src}" alt="${escapeHtml(activity.alt)}" class="infographic-image" referrerpolicy="no-referrer" crossorigin="anonymous" />
    </div>
    ${activity.caption ? `<p class="infographic-caption">${escapeHtml(activity.caption)}</p>` : ''}
    ${viewedButton}
  </div>
  <style>
    .infographic-activity {
      text-align: center;
      margin: 24px 0;
      padding: 20px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
      border-radius: 16px;
      border: 1px solid rgba(99, 102, 241, 0.2);
    }
    .infographic-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 16px;
      color: inherit;
    }
    .infographic-image-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .infographic-image {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    }
    .infographic-caption {
      margin-top: 12px;
      font-style: italic;
      color: #6b7280;
      font-size: 0.9rem;
    }
    .infographic-activity .mark-viewed-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      margin-top: 16px;
      background: linear-gradient(135deg, var(--primary), #8b5cf6);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
    }
    .infographic-activity .mark-viewed-btn:hover:not(.viewed) {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(99, 102, 241, 0.4);
    }
    .infographic-activity .mark-viewed-btn.viewed {
      background: linear-gradient(135deg, #10b981, #14b8a6);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
      cursor: default;
    }
    .infographic-activity .mark-viewed-btn .btn-icon {
      font-size: 1rem;
    }
  </style>
  ${trackingScript}`;
}

function renderVideo(activity: Extract<Activity, { type: 'video' }>): string {
  return `<div class="activity video-activity" id="activity-${activity.id}">
    <video controls style="max-width: 100%; border-radius: 8px;">
      <source src="${escapeHtml(activity.src)}" type="video/mp4">
      Your browser does not support the video tag.
    </video>
    ${activity.caption ? `<p class="video-caption">${escapeHtml(activity.caption)}</p>` : ''}
  </div>
  <style>
    .video-activity {
      margin: 24px 0;
    }
    .video-caption {
      margin-top: 8px;
      font-style: italic;
      color: #6b7280;
    }
  </style>`;
}

function renderYouTube(activity: Extract<Activity, { type: 'youtube' }>): string {
  // Guard against undefined videoId
  if (!activity.videoId) {
    return `<div class="activity youtube-activity" id="activity-${activity.id}">
      <div class="youtube-error" style="padding: 40px; text-align: center; color: #6b7280; background: #1a1a2e; border-radius: 8px;">
        <p>📺 No YouTube video ID configured.</p>
      </div>
    </div>`;
  }

  const isRequired = activity.required === true;
  const trackingClass = isRequired ? 'interactive-card' : '';
  const safeId = activity.id.replace(/[^a-zA-Z0-9]/g, '_');

  const viewedButton = isRequired ? `
    <button class="mark-viewed-btn" id="mark-viewed-${activity.id}" onclick="markContentViewed_${safeId}()">
      <span class="btn-icon">▶️</span> Mark as Watched
    </button>
  ` : '';

  const trackingScript = isRequired ? `
    <script>
      (function() {
        window.markContentViewed_${safeId} = function() {
          var btn = document.getElementById('mark-viewed-${activity.id}');
          var activityEl = document.getElementById('activity-${activity.id}');
          if (!btn || !activityEl) return;
          
          btn.classList.add('viewed');
          btn.innerHTML = '<span class="btn-icon">✓</span> Watched';
          btn.disabled = true;
          
          if (window.completedInteractions) {
            window.completedInteractions.add(activityEl);
          }
          if (window.updateActivityProgress) {
            window.updateActivityProgress();
          }
        };
      })();
    </script>
  ` : '';

  return `<div class="activity youtube-activity ${trackingClass}" id="activity-${activity.id}" data-activity-type="youtube">
    <div class="youtube-container">
      <iframe 
        src="https://www.youtube.com/embed/${escapeHtml(activity.videoId)}" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    </div>
    ${activity.caption ? `<p class="youtube-caption">${escapeHtml(activity.caption)}</p>` : ''}
    ${viewedButton}
  </div>
  <style>
    .youtube-container {
      position: relative;
      padding-bottom: 56.25%;
      height: 0;
      overflow: hidden;
      border-radius: 8px;
    }
    .youtube-container iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }
    .youtube-caption {
      margin-top: 8px;
      font-style: italic;
      color: #6b7280;
    }
  </style>
  ${trackingScript}`;
}

function renderInteractiveVideo(activity: Extract<Activity, { type: 'interactive_video' }>): string {
  const safeId = activity.id.replace(/[^a-zA-Z0-9]/g, '_');
  const isRequired = activity.required === true;
  const preventSkipping = activity.preventSkipping === true;
  const trackingClass = isRequired ? 'interactive-card' : '';
  const checkpoints = activity.checkpoints || [];
  const totalCheckpoints = checkpoints.length;

  // Generate checkpoint modals HTML
  const checkpointModalsHtml = checkpoints.map((cp, index) => {
    if (cp.type === 'explanation') {
      return `
        <div class="iv-modal" id="iv-modal-${safeId}-${cp.id}" data-checkpoint-id="${cp.id}">
          <div class="iv-modal-content iv-explanation">
            <div class="iv-modal-header">
              <span class="iv-modal-icon">💡</span>
              <h3>${escapeHtml(cp.title || 'Explanation')}</h3>
            </div>
            <div class="iv-modal-body">
              ${cp.content || ''}
            </div>
            <button class="iv-continue-btn" onclick="closeIVCheckpoint_${safeId}('${cp.id}')">
              Continue <span>▶</span>
            </button>
          </div>
        </div>
      `;
    } else {
      // Knowledge check
      const optionsHtml = (cp.options || []).map((opt, optIdx) => `
        <button class="iv-option-btn" data-option-id="${opt.id}" data-correct="${opt.correct === true}"
                onclick="selectIVOption_${safeId}('${cp.id}', '${opt.id}', ${opt.correct === true})">
          <span class="iv-option-letter">${String.fromCharCode(65 + optIdx)}</span>
          <span class="iv-option-text">${escapeHtml(opt.text)}</span>
        </button>
      `).join('');

      return `
        <div class="iv-modal" id="iv-modal-${safeId}-${cp.id}" data-checkpoint-id="${cp.id}">
          <div class="iv-modal-content iv-question">
            <div class="iv-modal-header">
              <span class="iv-modal-icon">❓</span>
              <h3>Knowledge Check</h3>
            </div>
            <div class="iv-modal-body">
              <p class="iv-question-text">${escapeHtml(cp.question || '')}</p>
              <div class="iv-options">
                ${optionsHtml}
              </div>
              <div class="iv-feedback" id="iv-feedback-${safeId}-${cp.id}" style="display: none;">
                <p class="iv-feedback-text"></p>
              </div>
            </div>
            <button class="iv-continue-btn" id="iv-continue-${safeId}-${cp.id}" onclick="closeIVCheckpoint_${safeId}('${cp.id}')" style="display: none;">
              Continue <span>▶</span>
            </button>
          </div>
        </div>
      `;
    }
  }).join('');

  // Generate checkpoint markers for progress bar
  const checkpointMarkersHtml = checkpoints.map(cp => `
    <div class="iv-checkpoint-marker"
         id="iv-marker-${safeId}-${cp.id}"
         data-timestamp="${cp.timestamp}"
         data-type="${cp.type}"
         onclick="seekToCheckpoint_${safeId}('${cp.id}')"
         title="${cp.type === 'explanation' ? (cp.title || 'Explanation') : 'Question'} at ${Math.floor(cp.timestamp / 60)}:${(cp.timestamp % 60).toString().padStart(2, '0')}">
      ${cp.type === 'explanation' ? '💡' : '❓'}
    </div>
  `).join('');

  return `
    <div class="activity interactive-video-activity ${trackingClass}" id="activity-${activity.id}" data-activity-type="interactive_video">
      <div class="iv-container" id="iv-container-${safeId}">
        <div class="iv-video-wrapper">
          <div id="iv-player-${safeId}"></div>
        </div>
        <div class="iv-progress-bar" id="iv-progress-${safeId}">
          <div class="iv-progress-fill" id="iv-progress-fill-${safeId}"></div>
          <div class="iv-checkpoints-track">
            ${checkpointMarkersHtml}
          </div>
        </div>
        <div class="iv-status">
          <span class="iv-status-text">
            <span class="iv-checkpoint-count" id="iv-count-${safeId}">0</span> / ${totalCheckpoints} checkpoints completed
          </span>
          ${isRequired ? '<span class="iv-required-badge">Required</span>' : ''}
        </div>
      </div>
      ${activity.caption ? `<p class="iv-caption">${escapeHtml(activity.caption)}</p>` : ''}

      <!-- Checkpoint Modals -->
      <div class="iv-modals-container" id="iv-modals-${safeId}">
        ${checkpointModalsHtml}
      </div>

      ${isRequired ? `
        <div class="iv-completion-message" id="iv-complete-${safeId}" style="display: none;">
          <div class="completion-icon">🎬</div>
          <div class="completion-text">All checkpoints completed!</div>
        </div>
      ` : ''}
    </div>

    <style>
      .interactive-video-activity {
        margin: 24px 0;
      }
      .iv-container {
        border-radius: 12px;
        overflow: hidden;
        background: #1a1a2e;
      }
      .iv-video-wrapper {
        position: relative;
        padding-bottom: 56.25%;
        height: 0;
        background: #000;
      }
      .iv-video-wrapper iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      .iv-progress-bar {
        position: relative;
        height: 6px;
        background: #2d2d44;
        cursor: pointer;
      }
      .iv-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #6366f1, #8b5cf6);
        width: 0%;
        transition: width 0.1s linear;
      }
      .iv-checkpoints-track {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 100%;
        pointer-events: none;
      }
      .iv-checkpoint-marker {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 18px;
        height: 18px;
        background: #1a1a2e;
        border: 2px solid #6366f1;
        border-radius: 50%;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        z-index: 5;
        pointer-events: auto;
      }
      .iv-checkpoint-marker.completed {
        background: #22c55e;
        border-color: #22c55e;
      }
      .iv-checkpoint-marker:hover {
        transform: translate(-50%, -50%) scale(1.2);
      }
      .iv-status {
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #16162a;
        font-size: 14px;
        color: #a0a0b0;
      }
      .iv-required-badge {
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        color: white;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
      }
      .iv-caption {
        margin-top: 12px;
        font-style: italic;
        color: #6b7280;
      }

    </style>
    <script>
      (function() {
        // Move modals container to body to avoid z-index/clipping issues with parent containers
        // This is critical when the activity is inside a container with backdrop-filter or overflow:hidden
        var modalsContainer = document.getElementById('iv-modals-${safeId}');
        if (modalsContainer) {
          document.body.appendChild(modalsContainer);
        }
      })();
    </script>
    <style>
      .iv-modals-container {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        z-index: 9999;
      }
      .iv-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        display: none;
        align-items: center;
        justify-content: center;
        pointer-events: auto;
        animation: ivFadeIn 0.3s ease;
      }
      .iv-modal.active {
        display: flex;
      }
      @keyframes ivFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .iv-modal-content {
        background: linear-gradient(180deg, #1e1e3f 0%, #16162a 100%);
        border-radius: 16px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: ivSlideUp 0.3s ease;
      }
      @keyframes ivSlideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .iv-modal-header {
        padding: 20px 24px;
        border-bottom: 1px solid #2d2d44;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .iv-modal-header h3 {
        margin: 0;
        font-size: 18px;
        color: white;
      }
      .iv-modal-icon {
        font-size: 24px;
      }
      .iv-modal-body {
        padding: 24px;
      }
      .iv-question-text {
        font-size: 16px;
        color: white;
        margin-bottom: 20px;
        line-height: 1.5;
      }
      .iv-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .iv-option-btn {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        background: #2d2d44;
        border: 2px solid transparent;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s;
        text-align: left;
        color: white;
      }
      .iv-option-btn:hover:not(:disabled) {
        background: #3d3d54;
        border-color: #6366f1;
      }
      .iv-option-btn.selected {
        border-color: #6366f1;
        background: rgba(99, 102, 241, 0.2);
      }
      .iv-option-btn.correct {
        border-color: #22c55e;
        background: rgba(34, 197, 94, 0.2);
      }
      .iv-option-btn.incorrect {
        border-color: #ef4444;
        background: rgba(239, 68, 68, 0.2);
      }
      .iv-option-btn:disabled {
        cursor: not-allowed;
        opacity: 0.7;
      }
      .iv-option-letter {
        width: 28px;
        height: 28px;
        background: #16162a;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
      }
      .iv-option-text {
        flex: 1;
      }
      .iv-feedback {
        margin-top: 16px;
        padding: 16px;
        border-radius: 10px;
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.3);
      }
      .iv-feedback.correct {
        background: rgba(34, 197, 94, 0.1);
        border-color: rgba(34, 197, 94, 0.3);
      }
      .iv-feedback.incorrect {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.3);
      }
      .iv-feedback-text {
        margin: 0;
        color: #d0d0e0;
        font-size: 14px;
        line-height: 1.5;
      }
      .iv-continue-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: calc(100% - 48px);
        margin: 0 24px 24px;
        padding: 14px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border: none;
        border-radius: 10px;
        color: white;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .iv-continue-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
      }
      .iv-completion-message {
        margin-top: 16px;
        padding: 16px;
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
        border: 1px solid rgba(34, 197, 94, 0.3);
        border-radius: 12px;
        text-align: center;
      }
      .iv-completion-message .completion-icon {
        font-size: 32px;
        margin-bottom: 8px;
      }
      .iv-completion-message .completion-text {
        color: #22c55e;
        font-weight: 600;
      }
    </style>

    <script>
      (function() {
        var safeId = '${safeId}';
        var videoId = '${escapeHtml(activity.videoId)}';
        var checkpoints = ${JSON.stringify(checkpoints.map(cp => ({
    id: cp.id,
    timestamp: cp.timestamp,
    type: cp.type,
    explanation: cp.explanation || ''
  })))};
        var preventSkipping = ${preventSkipping};
        var isRequired = ${isRequired};
        var totalCheckpoints = ${totalCheckpoints};

        var player = null;
        var completedCheckpoints = new Set();
        var currentCheckpoint = null;
        var lastAllowedTime = 0;
        var checkInterval = null;
        var videoDuration = 0;

        // Load YouTube IFrame API
        if (!window.YT) {
          var tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/iframe_api';
          var firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        // Initialize player when API is ready
        function initPlayer() {
          player = new YT.Player('iv-player-' + safeId, {
            videoId: videoId,
            playerVars: {
              'playsinline': 1,
              'rel': 0,
              'modestbranding': 1
            },
            events: {
              'onReady': onPlayerReady,
              'onStateChange': onPlayerStateChange
            }
          });
        }

        function onPlayerReady(event) {
          videoDuration = player.getDuration();
          positionCheckpointMarkers();
          startTimeCheck();
        }

        function positionCheckpointMarkers() {
          checkpoints.forEach(function(cp) {
            var marker = document.getElementById('iv-marker-' + safeId + '-' + cp.id);
            if (marker && videoDuration > 0) {
              var percent = (cp.timestamp / videoDuration) * 100;
              marker.style.left = percent + '%';
            }
          });
        }

        function onPlayerStateChange(event) {
          if (event.data === YT.PlayerState.PLAYING) {
            startTimeCheck();
          } else {
            stopTimeCheck();
          }
        }

        function startTimeCheck() {
          if (checkInterval) return;
          checkInterval = setInterval(checkVideoTime, 250);
        }

        function stopTimeCheck() {
          if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
          }
        }

        function checkVideoTime() {
          if (!player || typeof player.getCurrentTime !== 'function') return;

          var currentTime = player.getCurrentTime();
          var duration = player.getDuration();

          // Update progress bar
          if (duration > 0) {
            var percent = (currentTime / duration) * 100;
            document.getElementById('iv-progress-fill-' + safeId).style.width = percent + '%';
          }

          // Check for checkpoint triggers
          for (var i = 0; i < checkpoints.length; i++) {
            var cp = checkpoints[i];
            if (!completedCheckpoints.has(cp.id) && currentTime >= cp.timestamp && currentTime < cp.timestamp + 1) {
              triggerCheckpoint(cp);
              break;
            }
          }

          // Prevent skipping if enabled
          if (preventSkipping) {
            var nextUncompletedCheckpoint = getNextUncompletedCheckpoint(currentTime);
            if (nextUncompletedCheckpoint && currentTime > nextUncompletedCheckpoint.timestamp + 0.5) {
              player.seekTo(nextUncompletedCheckpoint.timestamp, true);
              triggerCheckpoint(nextUncompletedCheckpoint);
            }
          }
        }

        function getNextUncompletedCheckpoint(currentTime) {
          for (var i = 0; i < checkpoints.length; i++) {
            var cp = checkpoints[i];
            if (!completedCheckpoints.has(cp.id) && cp.timestamp <= currentTime) {
              return cp;
            }
          }
          return null;
        }

        function triggerCheckpoint(cp) {
          if (currentCheckpoint === cp.id) return;
          currentCheckpoint = cp.id;

          player.pauseVideo();
          var modal = document.getElementById('iv-modal-' + safeId + '-' + cp.id);
          if (modal) {
            modal.classList.add('active');
          }
        }

        window['closeIVCheckpoint_' + safeId] = function(checkpointId) {
          var modal = document.getElementById('iv-modal-' + safeId + '-' + checkpointId);
          if (modal) {
            modal.classList.remove('active');
          }

          completedCheckpoints.add(checkpointId);
          currentCheckpoint = null;

          // Mark marker as completed
          var marker = document.getElementById('iv-marker-' + safeId + '-' + checkpointId);
          if (marker) {
            marker.classList.add('completed');
          }

          // Update count
          document.getElementById('iv-count-' + safeId).textContent = completedCheckpoints.size;

          // Check if all completed
          if (completedCheckpoints.size >= totalCheckpoints) {
            var activityEl = document.getElementById('activity-' + '${activity.id}');
            if (isRequired && activityEl) {
              var completeMsg = document.getElementById('iv-complete-' + safeId);
              if (completeMsg) completeMsg.style.display = 'block';

              if (window.completedInteractions) {
                window.completedInteractions.add(activityEl);
              }
              if (window.updateActivityProgress) {
                window.updateActivityProgress();
              }
            }
          }

          player.playVideo();
        };

        window['seekToCheckpoint_' + safeId] = function(checkpointId) {
          var cp = checkpoints.find(function(c) { return c.id === checkpointId; });
          if (!cp) return;
          
          if (player && typeof player.seekTo === 'function') {
            player.seekTo(cp.timestamp, true);
          }
          
          triggerCheckpoint(cp);
        };

        window['selectIVOption_' + safeId] = function(checkpointId, optionId, isCorrect) {
          var modal = document.getElementById('iv-modal-' + safeId + '-' + checkpointId);
          var feedback = document.getElementById('iv-feedback-' + safeId + '-' + checkpointId);
          var continueBtn = document.getElementById('iv-continue-' + safeId + '-' + checkpointId);

          // Find checkpoint for feedback text
          var cp = checkpoints.find(function(c) { return c.id === checkpointId; });

          // Disable all options
          var options = modal.querySelectorAll('.iv-option-btn');
          options.forEach(function(opt) {
            opt.disabled = true;
            if (opt.dataset.optionId === optionId) {
              opt.classList.add(isCorrect ? 'correct' : 'incorrect');
            }
            if (opt.dataset.correct === 'true') {
              opt.classList.add('correct');
            }
          });

          // Show feedback
          if (feedback) {
            feedback.style.display = 'block';
            feedback.className = 'iv-feedback ' + (isCorrect ? 'correct' : 'incorrect');
            var feedbackText = feedback.querySelector('.iv-feedback-text');
            if (feedbackText) {
              feedbackText.textContent = isCorrect
                ? '✓ Correct! ' + (cp && cp.explanation ? cp.explanation : '')
                : '✗ Not quite. ' + (cp && cp.explanation ? cp.explanation : '');
            }
          }

          // Show continue button
          if (continueBtn) {
            continueBtn.style.display = 'flex';
          }
        };

        // Initialize when YT API is ready
        if (window.YT && window.YT.Player) {
          initPlayer();
        } else {
          window.onYouTubeIframeAPIReady = window.onYouTubeIframeAPIReady || function() {};
          var originalCallback = window.onYouTubeIframeAPIReady;
          window.onYouTubeIframeAPIReady = function() {
            originalCallback();
            initPlayer();
          };
        }
      })();
    </script>
  `;
}

function renderAccordion(activity: Extract<Activity, { type: 'accordion' }>): string {
  const safeId = activity.id.replace(/[^a-zA-Z0-9]/g, '_');
  const totalSections = (activity.sections || []).length;
  const isRequired = activity.required !== false; // Default to required (for backward compat)
  const trackingClass = isRequired ? 'interactive-card' : '';

  const sectionsHtml = (activity.sections || []).map((section, index) => `
    <details class="accordion-item" data-section-index="${index}" id="accordion-section-${activity.id}-${index}">
      <summary>
        <span class="accordion-title-wrapper">
          <span class="accordion-read-indicator" id="read-indicator-${activity.id}-${index}">
            <span class="read-check">✓</span>
          </span>
          <span class="accordion-title-text">${escapeHtml(section.title)}</span>
        </span>
      </summary>
      <div class="details-content">
        ${section?.content || ''}
        <button class="mark-read-btn" onclick="markAccordionRead_${safeId}(${index})" id="mark-read-btn-${activity.id}-${index}">
          <span class="btn-icon">✓</span> Mark as Read
        </button>
      </div>
    </details>
  `).join('');

  return `<div class="activity accordion-activity ${trackingClass}" id="activity-${activity.id}" data-activity-type="accordion" data-activity-id="${activity.id}" data-required="${isRequired}">
    <div class="accordion-progress-header">
      <div class="accordion-progress-info">
        <span class="accordion-progress-icon">📖</span>
        <span class="accordion-progress-text">Reading Progress${isRequired ? ' (Required)' : ''}</span>
        <span class="accordion-progress-count" id="accordion-count-${activity.id}">0 / ${totalSections}</span>
      </div>
      <div class="accordion-progress-bar">
        <div class="accordion-progress-fill" id="accordion-progress-${activity.id}" style="width: 0%"></div>
      </div>
    </div>
    ${sectionsHtml}
    <div class="accordion-completion-message" id="accordion-complete-${activity.id}" style="display: none;">
      <div class="completion-icon">🎉</div>
      <div class="completion-text">All sections read!</div>
    </div>
  </div>
  <style>
    .accordion-activity {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Progress Header */
    .accordion-progress-header {
      background: var(--surface);
      border-radius: 14px;
      padding: 16px 20px;
      margin-bottom: 8px;
      border: 1px solid var(--border);
    }
    .accordion-progress-info {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    .accordion-progress-icon {
      font-size: 1.2rem;
    }
    .accordion-progress-text {
      font-weight: 600;
      color: var(--text);
      flex: 1;
    }
    .accordion-progress-count {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--primary);
      background: var(--primary-light);
      padding: 4px 12px;
      border-radius: 20px;
    }
    .accordion-progress-bar {
      height: 6px;
      background: var(--border);
      border-radius: 3px;
      overflow: hidden;
    }
    .accordion-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary), #a855f7, #ec4899, var(--primary));
      background-size: 200% 100%;
      animation: accordionGradientFlow 2s linear infinite;
      border-radius: 3px;
      transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    @keyframes accordionGradientFlow {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }

    /* Accordion Items */
    .accordion-item {
      background: var(--surface);
      border-radius: 14px;
      border: 1px solid var(--border);
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .accordion-item:hover {
      border-color: var(--primary);
    }
    .accordion-item.read {
      border-color: rgba(16, 185, 129, 0.4);
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), var(--surface));
    }
    .accordion-item.read:hover {
      border-color: #10b981;
    }
    .accordion-item summary {
      cursor: pointer;
      font-weight: 600;
      color: var(--text);
      padding: 18px 20px;
      list-style: none;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: all 0.2s;
    }
    .accordion-item summary:hover {
      background: var(--primary-light);
    }
    .accordion-item.read summary:hover {
      background: rgba(16, 185, 129, 0.1);
    }
    .accordion-item summary::-webkit-details-marker {
      display: none;
    }
    .accordion-title-wrapper {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    .accordion-read-indicator {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      flex-shrink: 0;
      background: var(--card-bg);
    }
    .accordion-read-indicator .read-check {
      opacity: 0;
      transform: scale(0);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .accordion-item.read .accordion-read-indicator {
      background: linear-gradient(135deg, #10b981, #14b8a6);
      border-color: #10b981;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
      animation: checkPop 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .accordion-item.read .accordion-read-indicator .read-check {
      opacity: 1;
      transform: scale(1);
    }
    @keyframes checkPop {
      0% { transform: scale(1); }
      50% { transform: scale(1.3); }
      100% { transform: scale(1); }
    }
    .accordion-item summary::after {
      content: '+';
      font-size: 1.4rem;
      font-weight: 300;
      color: var(--primary);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--primary-light);
    }
    .accordion-item.read summary::after {
      color: #10b981;
      background: rgba(16, 185, 129, 0.15);
    }
    .accordion-item[open] summary::after {
      transform: rotate(45deg);
    }
    .accordion-item[open] summary {
      border-bottom: 1px solid var(--border);
    }
    .accordion-item .details-content {
      padding: 20px;
      color: var(--text);
      line-height: 1.7;
      animation: accordionOpen 0.3s ease;
    }
    @keyframes accordionOpen {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Mark as Read Button */
    .mark-read-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      width: fit-content;
      padding: 10px 20px;
      margin-top: 20px;
      clear: both;
      background: linear-gradient(135deg, #10b981, #14b8a6);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }
    .mark-read-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(16, 185, 129, 0.4);
    }
    .mark-read-btn.read {
      background: var(--surface);
      color: var(--text-muted);
      box-shadow: none;
      cursor: default;
      pointer-events: none;
    }
    .mark-read-btn .btn-icon {
      font-size: 1rem;
    }

    /* Completion Message */
    .accordion-completion-message {
      text-align: center;
      padding: 24px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.1));
      border-radius: 14px;
      border: 1px solid rgba(16, 185, 129, 0.3);
      margin-top: 8px;
      animation: completionSlideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .completion-icon {
      font-size: 2.5rem;
      margin-bottom: 8px;
      animation: completionBounce 0.6s ease;
    }
    .completion-text {
      font-weight: 600;
      color: #10b981;
      font-size: 1.1rem;
    }
    @keyframes completionSlideIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes completionBounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
  </style>
  <script>
    (function() {
      var readSections_${safeId} = new Set();
      var totalSections_${safeId} = ${totalSections};
      var isRequired_${safeId} = ${isRequired};

      window.markAccordionRead_${safeId} = function(index) {
        if (readSections_${safeId}.has(index)) return;

        readSections_${safeId}.add(index);
        var sectionEl = document.getElementById('accordion-section-${activity.id}-' + index);
        var btnEl = document.getElementById('mark-read-btn-${activity.id}-' + index);

        if (sectionEl) {
          sectionEl.classList.add('read');
        }
        if (btnEl) {
          btnEl.classList.add('read');
          btnEl.innerHTML = '<span class="btn-icon">✓</span> Read';
        }

        updateProgress_${safeId}();
      };

      function updateProgress_${safeId}() {
        var readCount = readSections_${safeId}.size;
        var percentage = totalSections_${safeId} > 0 ? Math.round((readCount / totalSections_${safeId}) * 100) : 0;
        
        var countEl = document.getElementById('accordion-count-${activity.id}');
        var progressEl = document.getElementById('accordion-progress-${activity.id}');
        var completeEl = document.getElementById('accordion-complete-${activity.id}');
        var activityEl = document.getElementById('activity-${activity.id}');

        if (countEl) countEl.textContent = readCount + ' / ' + totalSections_${safeId};
        if (progressEl) progressEl.style.width = percentage + '%';

        if (readCount === totalSections_${safeId}) {
          if (completeEl) completeEl.style.display = 'block';
          
          // Mark activity as complete for SCORM tracking
          if (window.completedInteractions && activityEl) {
            window.completedInteractions.add(activityEl);
          }
          
          // Celebrate!
          if (typeof window.celebrateCorrectAnswer === 'function') {
            window.celebrateCorrectAnswer(activityEl);
          }
          
          // Update the main course progress bar
          if (typeof window.updateActivityProgress === 'function') {
            window.updateActivityProgress();
          }
        }
      }

      // Auto-mark as read when section is opened and viewed for a moment
      var accordionItems = document.querySelectorAll('#activity-${activity.id} .accordion-item');
      accordionItems.forEach(function(item, idx) {
        item.addEventListener('toggle', function() {
          if (item.open && !readSections_${safeId}.has(idx)) {
            // Auto-mark after 2 seconds of being open
            setTimeout(function() {
              if (item.open) {
                markAccordionRead_${safeId}(idx);
              }
            }, 2000);
          }
        });
      });
    })();
  </script>`;
}

function renderInfoPanel(activity: Extract<Activity, { type: 'info_panel' }>): string {
  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    success: '✅',
    error: '❌',
  };
  const icon = icons[activity.variant] || icons.info;

  return `<div class="activity info-panel info-panel-${activity.variant}" id="activity-${activity.id}">
    <div class="info-panel-icon">${icon}</div>
    <div class="info-panel-content">
      <h4>${escapeHtml(activity.title)}</h4>
      <div>${activity.content || ''}</div>
    </div>
  </div>
  <style>
    .info-panel {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      border-radius: 16px;
      padding: 20px 24px;
      border-left: 4px solid var(--primary);
    }
    .info-panel-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: var(--primary-light);
    }
    .info-panel-content {
      flex: 1;
    }
    .info-panel h4 {
      margin: 0 0 8px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text);
    }
    .info-panel-content > div {
      color: var(--text);
      line-height: 1.6;
    }
    .info-panel-info {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05));
      border-left-color: #6366f1;
    }
    .info-panel-info .info-panel-icon {
      background: rgba(99, 102, 241, 0.15);
    }
    .info-panel-warning {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(251, 191, 36, 0.05));
      border-left-color: #f59e0b;
    }
    .info-panel-warning .info-panel-icon {
      background: rgba(245, 158, 11, 0.15);
    }
    .info-panel-success {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.05));
      border-left-color: #10b981;
    }
    .info-panel-success .info-panel-icon {
      background: rgba(16, 185, 129, 0.15);
    }
    .info-panel-error {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.05));
      border-left-color: #ef4444;
    }
    .info-panel-error .info-panel-icon {
      background: rgba(239, 68, 68, 0.15);
    }
  </style>`;
}

function renderCodeSnippet(activity: Extract<Activity, { type: 'code_snippet' }>): string {
  return `<div class="activity code-snippet" id="activity-${activity.id}">
    ${activity.title ? `<h4>${escapeHtml(activity.title)}</h4>` : ''}
    <pre><code class="language-${escapeHtml(activity.language)}">${escapeHtml(activity.code)}</code></pre>
  </div>
  <style>
    .code-snippet pre {
      background: #1f2937;
      color: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
    }
  </style>`;
}

function renderSorting(activity: Extract<Activity, { type: 'sorting' }>): string {
  const categoriesHtml = (activity.categories || []).map(cat => `
    <div class="sorting-category" data-id="${cat.id}">
      <h4 class="category-title">${escapeHtml(cat.title)}</h4>
      <div class="drop-zone"></div>
    </div>
  `).join('');

  const itemsHtml = (activity.items || []).map(item => `
    <div class="draggable-item" draggable="true" data-id="${item.id}" data-category="${item.categoryId}">
      ${escapeHtml(item.text)}
    </div>
  `).join('');

  return `
    <div class="activity sorting-activity" id="activity-${activity.id}">
      <h3 class="activity-title">${escapeHtml(activity.title)}</h3>
      <p class="instruction-text">Drag items from the pool into the correct categories.</p>
      <div class="sorting-container">
        <div class="items-pool">
          ${itemsHtml}
        </div>
        <div class="categories-container">
          ${categoriesHtml}
        </div>
      </div>
      <div class="feedback-area"></div>
      <div class="controls">
        <button class="btn check-sorting-btn" onclick="checkSorting('${activity.id}')">Check Answers</button>
      </div>
    </div>
    <style>
      .sorting-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
        margin: 20px 0;
      }
      .items-pool {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        padding: 20px;
        background: var(--surface);
        border-radius: 16px;
        min-height: 70px;
        border: 2px dashed var(--border);
      }
      .draggable-item {
        background: var(--card-bg);
        padding: 10px 18px;
        border-radius: 24px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        cursor: grab;
        border: 2px solid var(--border);
        user-select: none;
        font-weight: 500;
        color: var(--text);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .draggable-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        border-color: var(--primary);
      }
      .draggable-item:active {
        cursor: grabbing;
        transform: scale(1.05);
      }
      .draggable-item.dragging {
        opacity: 0.5;
      }
      .draggable-item.correct {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(20, 184, 166, 0.15));
        border-color: #10b981;
        color: #10b981;
      }
      .draggable-item.incorrect {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(244, 63, 94, 0.15));
        border-color: #ef4444;
        color: #ef4444;
      }
      .categories-container {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 20px;
      }
      .sorting-category {
        background: var(--surface);
        border: 2px dashed var(--border);
        border-radius: 16px;
        padding: 20px;
        min-height: 160px;
        transition: all 0.2s;
      }
      .sorting-category:hover {
        border-color: var(--primary);
      }
      .category-title {
        text-align: center;
        margin-top: 0;
        margin-bottom: 16px;
        color: var(--text);
        font-weight: 600;
        font-size: 1rem;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--border);
      }
      .drop-zone {
        min-height: 100px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
    </style>
  `;
}

function renderProcess(activity: Extract<Activity, { type: 'process' }>): string {
  const stepsHtml = (activity.steps || []).map((step, index) => `
    <div class="process-step ${index === 0 ? 'active' : ''}" data-step="${index}">
      <div class="step-header">
        <div class="step-number">Step ${index + 1}</div>
        <h3 class="step-title">${escapeHtml(step.title)}</h3>
      </div>
      <div class="step-content">
        ${step?.content || ''}
      </div>
    </div>
  `).join('');

  return `
    <div class="activity process-activity" id="activity-${activity.id}">
      <div class="process-carousel">
        <div class="process-steps-container">
          ${stepsHtml}
        </div>
        
        <div class="process-navigation">
          <button class="btn-nav btn-prev" onclick="navigateProcess('${activity.id}', -1)" disabled>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          <div class="step-indicators">
            ${(activity.steps || []).map((_, i) => `
              <div class="step-dot ${i === 0 ? 'active' : ''}" onclick="jumpToProcessStep('${activity.id}', ${i})"></div>
            `).join('')}
          </div>
          
          <button class="btn-nav btn-next" onclick="navigateProcess('${activity.id}', 1)">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
    <style>
      .process-activity {
        margin: 32px 0;
      }
      .process-carousel {
        background: var(--surface);
        border-radius: 20px;
        box-shadow: var(--card-shadow);
        overflow: hidden;
        border: 1px solid var(--card-border);
      }
      .process-steps-container {
        position: relative;
        min-height: 320px;
      }
      .process-step {
        display: none;
        padding: 40px;
        animation: processSlide 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .process-step.active {
        display: block;
      }
      @keyframes processSlide {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
      .step-header {
        margin-bottom: 28px;
        border-bottom: 1px solid var(--border);
        padding-bottom: 20px;
      }
      .step-number {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        text-transform: uppercase;
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        color: var(--primary);
        margin-bottom: 12px;
        background: var(--primary-light);
        padding: 6px 12px;
        border-radius: 8px;
      }
      .step-title {
        font-size: 1.6rem;
        font-weight: 700;
        color: var(--text);
        margin: 0;
        line-height: 1.3;
      }
      .step-content {
        color: var(--text);
        line-height: 1.7;
        font-size: 1.1rem;
      }
      .step-content img {
        max-width: 100%;
        border-radius: 16px;
        margin: 20px 0;
        box-shadow: var(--card-shadow);
      }
      .process-navigation {
        background: var(--card-bg);
        padding: 20px 28px;
        border-top: 1px solid var(--border);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .btn-nav {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        border: 2px solid var(--border);
        background: var(--surface);
        color: var(--text);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .btn-nav:hover:not(:disabled) {
        background: var(--primary-light);
        border-color: var(--primary);
        color: var(--primary);
        transform: scale(1.05);
      }
      .btn-nav:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .step-indicators {
        display: flex;
        gap: 10px;
      }
      .step-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--border);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 2px solid transparent;
      }
      .step-dot.active {
        background: var(--primary);
        transform: scale(1.3);
        box-shadow: 0 0 16px var(--primary-glow);
      }
      .step-dot:hover:not(.active) {
        background: var(--text-muted);
        transform: scale(1.1);
        background: #9ca3af;
      }
    </style>
  `;
}


function renderMatching(activity: Extract<Activity, { type: 'matching' }>): string {
  const leftItemsHtml = (activity.pairs || []).map(pair => `
    <div class="matching-item left-item" data-id="${pair.id}" onclick="handleMatchingClick(this, 'left')">
      <div class="item-content">${escapeHtml(pair.left)}</div>
      <div class="connection-point"></div>
    </div>
  `).join('');

  // Shuffle right items for the game
  const shuffledPairs = [...(activity.pairs || [])].sort(() => Math.random() - 0.5);
  const rightItemsHtml = shuffledPairs.map(pair => `
    <div class="matching-item right-item" data-match-id="${pair.id}" onclick="handleMatchingClick(this, 'right')">
      <div class="connection-point"></div>
      <div class="item-content">${escapeHtml(pair.right)}</div>
    </div>
  `).join('');

  return `
    <div class="activity matching-activity" id="activity-${activity.id}">
      <h3 class="activity-title">${escapeHtml(activity.title)}</h3>
      <p class="instruction-text">Tap a left item then a right item to match them.</p>
      
      <div class="matching-container">
        <div class="column left-column">
          ${leftItemsHtml}
        </div>
        <div class="column right-column">
          ${rightItemsHtml}
        </div>
      </div>
      
      <div class="feedback-area" id="feedback-${activity.id}"></div>
      <div class="controls">
         <button class="btn reset-btn" onclick="resetMatching('${activity.id}')">Reset</button>
      </div>
    </div>
    <style>
      .matching-container {
        display: flex;
        justify-content: space-between;
        gap: 3rem;
        margin: 24px 0;
      }
      .column {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .matching-item {
        background: var(--surface);
        border: 2px solid var(--border);
        border-radius: 14px;
        padding: 16px 20px;
        cursor: pointer;
        position: relative;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        min-height: 56px;
      }
      .matching-item .item-content {
        font-weight: 500;
        color: var(--text);
      }
      .matching-item:hover {
        border-color: var(--primary);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.1);
      }
      .matching-item.selected {
        border-color: var(--primary);
        background: var(--primary-light);
        box-shadow: 0 0 0 3px var(--primary-glow);
        transform: scale(1.02);
      }
      .matching-item.matched {
        border-color: #10b981;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.1));
        cursor: default;
      }
      .matching-item.matched .item-content {
        color: #10b981;
      }
      .matching-item.error {
        border-color: #ef4444;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(244, 63, 94, 0.1));
        animation: matchShake 0.5s cubic-bezier(.36,.07,.19,.97) both;
      }
      .left-item {
        justify-content: flex-end;
        text-align: right;
        padding-right: 48px;
      }
      .right-item {
        justify-content: flex-start;
        text-align: left;
        padding-left: 48px;
      }
      .connection-point {
        position: absolute;
        width: 16px;
        height: 16px;
        background: var(--border);
        border-radius: 50%;
        top: 50%;
        transform: translateY(-50%);
        transition: all 0.3s;
        border: 2px solid var(--card-bg);
      }
      .left-item .connection-point {
        right: -8px;
      }
      .right-item .connection-point {
        left: -8px;
      }
      .matching-item.matched .connection-point {
        background: #10b981;
        box-shadow: 0 0 12px rgba(16, 185, 129, 0.5);
      }
      .matching-item.selected .connection-point {
        background: var(--primary);
        box-shadow: 0 0 12px var(--primary-glow);
        transform: translateY(-50%) scale(1.2);
      }
      @keyframes matchShake {
        10%, 90% { transform: translate3d(-2px, 0, 0); }
        20%, 80% { transform: translate3d(3px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-5px, 0, 0); }
        40%, 60% { transform: translate3d(5px, 0, 0); }
      }
    </style>
  `;
}

function renderSequence(activity: Extract<Activity, { type: 'sequence' }>): string {
  // We render items in the correct order in the DOM, but client-side logic should shuffle them?
  // Or we shuffle them here. Let's shuffle them here.
  const shuffledItems = [...(activity.items || [])].sort(() => Math.random() - 0.5);

  const itemsHtml = shuffledItems.map(item => `
    <div class="sequence-item" draggable="true" data-id="${item.id}" data-correct-order="${item.order}">
      <div class="drag-handle">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" /></svg>
      </div>
      <div class="item-content">${escapeHtml(item.text)}</div>
    </div>
  `).join('');

  return `
    <div class="activity sequence-activity" id="activity-${activity.id}">
      <h3 class="activity-title">${escapeHtml(activity.title)}</h3>
      <p class="instruction-text">Drag and drop the items to arrange them in the correct order.</p>
      
      <div class="sequence-list">
        ${itemsHtml}
      </div>
      
      <div class="feedback-area" id="feedback-${activity.id}"></div>
      <div class="controls">
         <button class="btn check-btn" onclick="checkSequence('${activity.id}')">Check Order</button>
      </div>
    </div>
    <style>
      .sequence-activity {
        margin: 30px 0;
      }
      .sequence-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin: 20px 0;
        background: var(--surface);
        padding: 24px;
        border-radius: 16px;
      }
      .sequence-item {
        display: flex;
        align-items: center;
        gap: 16px;
        background: var(--card-bg);
        padding: 18px 20px;
        border-radius: 14px;
        border: 2px solid var(--border);
        cursor: move;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      }
      .sequence-item:hover {
        border-color: var(--primary);
        transform: translateX(4px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.12);
      }
      .sequence-item.dragging {
        opacity: 0.5;
        background: var(--surface);
        border: 2px dashed var(--primary);
        transform: scale(1.02);
      }
      .drag-handle {
        color: var(--text-muted);
        cursor: move;
        transition: color 0.2s;
      }
      .sequence-item:hover .drag-handle {
        color: var(--primary);
      }
      .sequence-item .item-content {
        flex: 1;
        font-weight: 500;
        color: var(--text);
      }
      .sequence-item.correct {
        border-color: #10b981;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(20, 184, 166, 0.05));
      }
      .sequence-item.correct::before {
        content: '✓';
        color: #10b981;
        font-weight: bold;
        margin-right: 8px;
      }
      .sequence-item.incorrect {
        border-color: #ef4444;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(244, 63, 94, 0.05));
      }
      .sequence-item.incorrect::before {
        content: '✗';
        color: #ef4444;
        font-weight: bold;
        margin-right: 8px;
      }
    </style>
  `;
}

function renderDiscussion(activity: any): string {
  return `<div class="activity discussion-activity" id="activity-${activity.id}">
    <div class="discussion-header">
      <span class="discussion-icon">💬</span>
      <h3 class="discussion-title">${escapeHtml(activity.title || 'Discussion')}</h3>
    </div>
    <div class="discussion-prompt">
      <p>${escapeHtml(activity.prompt || '')}</p>
    </div>
    ${activity.description ? `<div class="discussion-description"><p>${escapeHtml(activity.description)}</p></div>` : ''}
    ${activity.guidelines ? `<div class="discussion-guidelines"><strong>Guidelines:</strong><p>${escapeHtml(activity.guidelines)}</p></div>` : ''}
    <div class="discussion-input-area">
      <textarea class="discussion-textarea" placeholder="Share your thoughts..." rows="4"></textarea>
      <button class="discussion-submit-btn">Post Response</button>
    </div>
  </div>
  <style>
    .discussion-activity {
      margin: 24px 0;
      background: var(--surface, #f8fafc);
      border-radius: 16px;
      border: 1px solid var(--border, #e2e8f0);
      overflow: hidden;
    }
    .discussion-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border, #e2e8f0);
      background: var(--primary-light, rgba(99,102,241,0.1));
    }
    .discussion-icon { font-size: 1.5rem; }
    .discussion-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }
    .discussion-prompt {
      padding: 20px 24px;
      font-size: 1rem;
      line-height: 1.6;
    }
    .discussion-description {
      padding: 0 24px 16px;
      color: #6b7280;
      font-size: 0.9rem;
    }
    .discussion-guidelines {
      padding: 16px;
      margin: 0 24px 16px;
      background: rgba(99, 102, 241, 0.05);
      border-radius: 10px;
      font-size: 0.85rem;
      color: #6b7280;
    }
    .discussion-input-area { padding: 0 24px 24px; }
    .discussion-textarea {
      width: 100%;
      padding: 14px 16px;
      border: 2px solid var(--border, #e2e8f0);
      border-radius: 12px;
      font-size: 0.95rem;
      resize: vertical;
      outline: none;
      font-family: inherit;
      box-sizing: border-box;
    }
    .discussion-textarea:focus { border-color: var(--primary, #6366f1); }
    .discussion-submit-btn {
      margin-top: 12px;
      padding: 10px 24px;
      background: linear-gradient(135deg, var(--primary, #6366f1), #8b5cf6);
      color: white;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
    }
  </style>`;
}
