
import { ScreenRecordingActivity } from './types';
import { escapeHtml } from './utils';

export function renderScreenRecording(activity: ScreenRecordingActivity): string {
  const isRequired = activity.required === true;
  const trackingClass = isRequired ? 'interactive-card' : '';
  const safeId = activity.id.replace(/[^a-zA-Z0-9]/g, '_');

  // Use the Google Drive preview link for embedding
  const videoSrc = `https://drive.google.com/file/d/${activity.driveFileId}/preview`;
  // Direct link for download/fallback if needed, but preview is better for streaming
  // const videoSrc = `https://drive.google.com/uc?export=download&id=${activity.driveFileId}`;

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

  return `<div class="activity screen-recording-activity ${trackingClass}" id="activity-${activity.id}" data-activity-type="screen_recording">
    ${activity.title ? `<h3 class="activity-title">${escapeHtml(activity.title)}</h3>` : ''}
    ${activity.description ? `<p class="activity-description">${escapeHtml(activity.description)}</p>` : ''}
    
    <div class="video-container">
      <iframe 
        src="${videoSrc}" 
        width="100%" 
        height="100%" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowfullscreen>
      </iframe>
    </div>
    
    ${viewedButton}
  </div>
  <style>
    .screen-recording-activity {
      margin: 24px 0;
      background: #1e1e2e;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .activity-title {
      margin-top: 0;
      margin-bottom: 8px;
      font-size: 1.25rem;
      font-weight: 600;
      color: #fff;
    }
    .activity-description {
      margin-bottom: 16px;
      color: #a0a0b0;
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .video-container {
      position: relative;
      width: 100%;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
      aspect-ratio: 16 / 9;
    }
    .video-container iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
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
  </style>
  ${trackingScript}`;
}
