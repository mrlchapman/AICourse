/**
 * 3D Model Viewer Activity
 * Renders interactive 3D models using Google's model-viewer web component
 * Supports glTF/GLB, OBJ, and STL formats
 */

import { ModelViewerActivity } from './types';

export function renderModelViewer(activity: ModelViewerActivity): string {
    const safeId = sanitizeId(activity.id);
    const title = activity.title || '3D Model';
    const isRequired = activity.required === true;
    const trackingClass = isRequired ? 'interactive-card' : '';
    const backgroundColor = activity.backgroundColor || '#1a1a2e';

    const viewedButton = isRequired ? `
    <div class="model-viewed-container">
      <button class="mark-viewed-btn model-mark-viewed" id="mark-viewed-${activity.id}" onclick="markModelViewed_${safeId}()">
        <span class="btn-icon">🎲</span> Mark as Viewed
      </button>
    </div>
  ` : '';

    const trackingScript = isRequired ? `
    window.markModelViewed_${safeId} = function() {
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
  ` : '';

    return `
<!-- Load model-viewer web component -->
<script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"></script>

<div class="activity model-viewer-activity ${trackingClass}" id="activity-${activity.id}" data-activity-type="model_viewer">
  ${title ? `
    <div class="model-header">
      <h3 class="model-title">
        <span class="model-icon">🎲</span>
        ${escapeHtml(title)}
        ${isRequired ? '<span class="required-badge">Required</span>' : ''}
      </h3>
    </div>
  ` : ''}
  
  <div class="model-container" style="background-color: ${backgroundColor};">
    <model-viewer
      id="model-viewer-${safeId}"
      src="${escapeHtml(activity.modelUrl)}"
      alt="${escapeHtml(title)}"
      ${activity.autoRotate !== false ? 'auto-rotate' : ''}
      ${activity.cameraControls !== false ? 'camera-controls' : ''}
      ${activity.ar ? 'ar ar-modes="webxr scene-viewer quick-look"' : ''}
      ${activity.poster ? `poster="${escapeHtml(activity.poster)}"` : ''}
      shadow-intensity="1"
      exposure="1"
      environment-image="neutral"
      loading="lazy"
      touch-action="pan-y"
    >
      <div class="model-loading" slot="poster">
        <div class="model-loading-spinner"></div>
        <p>Loading 3D Model...</p>
      </div>
      
      ${activity.ar ? `
        <button slot="ar-button" class="ar-button">
          <span>📱</span> View in AR
        </button>
      ` : ''}
    </model-viewer>
  </div>
  
  ${activity.caption ? `<p class="model-caption">${escapeHtml(activity.caption)}</p>` : ''}
  
  <div class="model-controls-hint">
    <span>🖱️ Drag to rotate</span>
    <span>🔍 Scroll to zoom</span>
    <span>⇧ + Drag to pan</span>
  </div>
  
  ${viewedButton}
</div>

<style>
  .model-viewer-activity {
    margin: 24px 0;
    background: var(--surface);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: var(--card-shadow);
  }

  .model-header {
    padding: 20px 24px;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1));
    border-bottom: 1px solid var(--border);
  }

  .model-title {
    margin: 0;
    color: var(--text);
    font-size: 1.2rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .model-icon {
    font-size: 1.4rem;
  }

  .required-badge {
    font-size: 0.7rem;
    background: linear-gradient(135deg, #f59e0b, #f97316);
    color: white;
    padding: 3px 8px;
    border-radius: 12px;
    font-weight: 600;
    margin-left: auto;
  }

  .model-container {
    position: relative;
    width: 100%;
    height: 450px;
    background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  }

  model-viewer {
    width: 100%;
    height: 100%;
    --poster-color: transparent;
  }

  .model-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }

  .model-loading-spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #8b5cf6;
    border-radius: 50%;
    animation: model-spin 1s linear infinite;
    margin-bottom: 12px;
  }

  @keyframes model-spin {
    to { transform: rotate(360deg); }
  }

  .model-caption {
    padding: 12px 24px;
    margin: 0;
    font-style: italic;
    color: var(--text-muted);
    text-align: center;
    font-size: 0.9rem;
    border-top: 1px solid var(--border);
    background: rgba(0, 0, 0, 0.1);
  }

  .model-controls-hint {
    display: flex;
    justify-content: center;
    gap: 24px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.75rem;
  }

  .model-controls-hint span {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .ar-button {
    position: absolute;
    bottom: 16px;
    right: 16px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
    transition: all 0.3s ease;
  }

  .ar-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
  }

  .model-viewed-container {
    padding: 16px 24px;
    background: var(--surface);
    text-align: center;
    border-top: 1px solid var(--border);
  }

  .model-mark-viewed {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
  }

  .model-mark-viewed:hover:not(.viewed) {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(139, 92, 246, 0.4);
  }

  .model-mark-viewed.viewed {
    background: linear-gradient(135deg, #10b981, #14b8a6);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    cursor: default;
  }

  @media (max-width: 768px) {
    .model-container {
      height: 350px;
    }

    .model-controls-hint {
      flex-direction: column;
      gap: 8px;
      align-items: center;
    }
  }
</style>

<script>
  (function() {
    ${trackingScript}
    
    // Optional: Track when model is fully loaded
    var modelViewer = document.getElementById('model-viewer-${safeId}');
    if (modelViewer) {
      modelViewer.addEventListener('load', function() {
        console.log('3D Model loaded successfully');
      });
      
      modelViewer.addEventListener('error', function(event) {
        console.error('Error loading 3D model:', event);
      });
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
