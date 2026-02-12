/**
 * PDF Viewer Activity
 * Embeds PDF documents with fullscreen and new tab options
 */

import { PDFActivity } from './types';

export function renderPDF(activity: PDFActivity): string {
  const safeId = sanitizeId(activity.id);
  const title = activity.title || 'Document';
  const isRequired = activity.required === true;
  const trackingClass = isRequired ? 'interactive-card' : '';

  // Guard against undefined pdfUrl
  if (!activity.pdfUrl) {
    return `<div class="activity pdf-viewer-activity" id="activity-${activity.id}">
      <div class="pdf-error" style="padding: 40px; text-align: center; color: #6b7280; background: var(--surface, #f3f4f6); border-radius: 16px;">
        <p>📄 No PDF document configured.</p>
      </div>
    </div>`;
  }

  // Extract filename from URL for display
  const filename = activity.pdfUrl.split('/').pop() || 'document.pdf';

  const viewedButton = isRequired ? `
    <div class="pdf-viewed-container">
      <button class="mark-viewed-btn pdf-mark-read" id="mark-viewed-${activity.id}" onclick="markPDFRead_${safeId}()">
        <span class="btn-icon">📖</span> Mark as Read
      </button>
    </div>
  ` : '';

  const trackingScript = isRequired ? `
    window.markPDFRead_${safeId} = function() {
      var btn = document.getElementById('mark-viewed-${activity.id}');
      var activityEl = document.getElementById('activity-${activity.id}');
      if (!btn || !activityEl) return;
      
      btn.classList.add('viewed');
      btn.innerHTML = '<span class="btn-icon">✓</span> Read';
      btn.disabled = true;
      
      if (window.completedInteractions) {
        window.completedInteractions.add(activityEl);
      }
      if (window.updateActivityProgress) {
        window.updateActivityProgress();
      }
    };
  ` : '';

  return `
<div class="activity pdf-viewer-activity ${trackingClass}" id="activity-${activity.id}" data-activity-type="pdf">
  <div class="pdf-header">
    <h3 class="pdf-title">${escapeHtml(title)}${isRequired ? ' <span class="required-badge">Required</span>' : ''}</h3>
    <div class="pdf-controls">
      <button class="pdf-btn pdf-fullscreen" onclick="togglePDFFullscreen_${safeId}()" title="Toggle Fullscreen">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
        </svg>
        <span>Fullscreen</span>
      </button>
      <button class="pdf-btn pdf-newtab" onclick="openPDFNewTab_${safeId}()" title="Open in New Tab">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
        </svg>
        <span>Open in Tab</span>
      </button>
    </div>
  </div>
  
  <div class="pdf-container" id="pdf-container-${activity.id}">
    <iframe
      id="pdf-iframe-${activity.id}"
      src="${escapeHtml(activity.pdfUrl)}"
      type="application/pdf"
      class="pdf-iframe"
      title="${escapeHtml(title)}"
    ></iframe>
  </div>
  ${viewedButton}
</div>

<style>
  .pdf-viewer-activity {
    margin: 24px 0;
    background: var(--surface);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--card-shadow);
  }

  .pdf-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    background: linear-gradient(135deg, var(--primary-light), rgba(99, 102, 241, 0.05));
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
    gap: 12px;
  }

  .pdf-title {
    margin: 0;
    color: var(--text);
    font-size: 1.2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pdf-title::before {
    content: '📄';
    font-size: 1.5rem;
  }

  .required-badge {
    font-size: 0.7rem;
    background: linear-gradient(135deg, #f59e0b, #f97316);
    color: white;
    padding: 3px 8px;
    border-radius: 12px;
    font-weight: 600;
    margin-left: 8px;
  }

  .pdf-controls {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .pdf-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: var(--primary);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .pdf-btn:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .pdf-btn:active {
    transform: translateY(0);
  }

  .pdf-btn svg {
    flex-shrink: 0;
  }

  .pdf-container {
    position: relative;
    width: 100%;
    height: 600px;
    background: #525659;
  }

  .pdf-container.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
    background: #525659;
  }

  .pdf-iframe {
    width: 100%;
    height: 100%;
    border: none;
  }

  .pdf-viewed-container {
    padding: 16px 24px;
    background: var(--surface);
    text-align: center;
  }

  .pdf-mark-read {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #10b981, #14b8a6);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  }

  .pdf-mark-read:hover:not(.viewed) {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(16, 185, 129, 0.4);
  }

  .pdf-mark-read.viewed {
    background: linear-gradient(135deg, #059669, #0d9488);
    cursor: default;
  }

  @media (max-width: 768px) {
    .pdf-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .pdf-controls {
      width: 100%;
    }

    .pdf-btn {
      flex: 1;
      justify-content: center;
    }

    .pdf-container {
      height: 500px;
    }
  }
</style>

<script>
  (function() {
    var isFullscreen_${safeId} = false;
    
    ${trackingScript}
    
    window.togglePDFFullscreen_${safeId} = function() {
      var container = document.getElementById('pdf-container-${activity.id}');
      if (!container) return;
      
      isFullscreen_${safeId} = !isFullscreen_${safeId};
      
      if (isFullscreen_${safeId}) {
        container.classList.add('fullscreen');
        // Try native fullscreen API
        if (container.requestFullscreen) {
          container.requestFullscreen().catch(function(err) {
            console.log('Fullscreen request failed:', err);
          });
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        } else if (container.mozRequestFullScreen) {
          container.mozRequestFullScreen();
        } else if (container.msRequestFullscreen) {
          container.msRequestFullscreen();
        }
      } else {
        container.classList.remove('fullscreen');
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    };
    
    window.openPDFNewTab_${safeId} = function() {
      window.open('${escapeHtml(activity.pdfUrl)}', '_blank');
    };
    
    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange_${safeId});
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange_${safeId});
    document.addEventListener('mozfullscreenchange', handleFullscreenChange_${safeId});
    document.addEventListener('MSFullscreenChange', handleFullscreenChange_${safeId});
    
    function handleFullscreenChange_${safeId}() {
      var container = document.getElementById('pdf-container-${activity.id}');
      if (!container) return;
      
      var isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      
      if (!isCurrentlyFullscreen && isFullscreen_${safeId}) {
        isFullscreen_${safeId} = false;
        container.classList.remove('fullscreen');
      }
    }
  })();
</script>
`;
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, '_');
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

