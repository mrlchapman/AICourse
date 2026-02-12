/**
 * Audio Activity
 * Audio player with custom styling and controls
 */

import { AudioActivity } from './types';

export function renderAudio(activity: AudioActivity): string {
  const safeId = sanitizeId(activity.id);
  const isRequired = activity.required === true;
  const trackingClass = isRequired ? 'interactive-card' : '';

  // Guard against undefined src
  if (!activity.src) {
    return `<div class="activity audio-activity" id="activity-${activity.id}">
      <div class="audio-error" style="padding: 40px; text-align: center; color: #6b7280; background: var(--card-bg, #f3f4f6); border-radius: 20px; border: 1px solid var(--card-border, #e5e7eb);">
        <p>🎵 No audio source configured.</p>
      </div>
    </div>`;
  }

  // Check if this is a Google Drive link
  const googleIdMatch = activity.src.match(/id=([a-zA-Z0-9_-]+)/) || activity.src.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const isGoogleDrive = googleIdMatch && (activity.src.includes('drive.google.com') || activity.src.includes('docs.google.com'));

  let playerHtml = '';

  if (isGoogleDrive) {
    // Use Google Drive Embed Player for maximum reliability
    const fileId = googleIdMatch![1];
    playerHtml = `
            <div class="audio-player google-drive-embed">
                <iframe 
                    src="https://drive.google.com/file/d/${fileId}/preview" 
                    width="100%" 
                    height="100" 
                    frameborder="0"
                    allow="autoplay"
                    style="border-radius: 12px;"
                ></iframe>
                
                ${activity.downloadable ? `
                    <div style="margin-top: 10px; text-align: right;">
                        <a href="${escapeHtml(activity.src)}" target="_blank" class="audio-download-link" style="color: var(--primary); text-decoration: none; font-size: 0.9rem; font-weight: 500;">
                            ⬇ Download Audio
                        </a>
                    </div>
                ` : ''}
            </div>
        `;
  } else {
    // Use Custom Player for direct links (or proxy links in preview)
    playerHtml = `
            <div class="audio-player" id="player-${safeId}">
              <audio id="audio-${safeId}" src="${escapeHtml(activity.src)}" preload="metadata" crossorigin="anonymous" referrerpolicy="no-referrer"></audio>
              
              <div class="audio-controls">
                <button class="audio-play-btn" id="play-btn-${safeId}" onclick="togglePlay_${safeId}()">
                  <span class="play-icon" id="play-icon-${safeId}">▶</span>
                </button>
                
                <div class="audio-progress-container">
                  <span class="audio-time" id="current-time-${safeId}">0:00</span>
                  <div class="audio-progress" id="progress-container-${safeId}" onclick="seek_${safeId}(event)">
                    <div class="audio-progress-bar" id="progress-bar-${safeId}"></div>
                    <div class="audio-progress-handle" id="progress-handle-${safeId}"></div>
                  </div>
                  <span class="audio-time" id="duration-${safeId}">0:00</span>
                </div>
                
                <div class="audio-volume-container">
                  <button class="audio-volume-btn" onclick="toggleMute_${safeId}()">
                    <span id="volume-icon-${safeId}">🔊</span>
                  </button>
                  <input 
                    type="range" 
                    class="audio-volume-slider" 
                    id="volume-${safeId}" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value="1"
                    onchange="setVolume_${safeId}(this.value)"
                  >
                </div>
        
                ${activity.downloadable ? `
                  <a href="${escapeHtml(activity.src)}" download class="audio-download-btn" title="Download">
                    ⬇
                  </a>
                ` : ''}
              </div>
            </div>
        `;
  }

  const viewedButton = isRequired ? `
    <div class="audio-listened-container">
      <button class="mark-viewed-btn audio-mark-listened" id="mark-viewed-${activity.id}" onclick="markAudioListened_${safeId}()">
        <span class="btn-icon">🎧</span> Mark as Listened
      </button>
    </div>
  ` : '';

  const trackingScript = isRequired ? `
    window.markAudioListened_${safeId} = function() {
      var btn = document.getElementById('mark-viewed-${activity.id}');
      var activityEl = document.getElementById('activity-${activity.id}');
      if (!btn || !activityEl) return;
      
      btn.classList.add('viewed');
      btn.innerHTML = '<span class="btn-icon">✓</span> Listened';
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
<div class="activity audio-activity ${trackingClass}" id="activity-${activity.id}" data-activity-type="audio">
  <div class="audio-container">
    ${activity.title ? `<h4 class="audio-title">${escapeHtml(activity.title)}${isRequired ? ' <span class="required-badge">Required</span>' : ''}</h4>` : ''}
    ${activity.description ? `<p class="audio-description">${escapeHtml(activity.description)}</p>` : ''}
    
    ${playerHtml}
    
    ${viewedButton}

    ${activity.transcript ? `
        <details class="audio-transcript">
          <summary>View Transcript</summary>
          <div class="transcript-content">${activity.transcript}</div>
        </details>
      ` : ''}
  </div>
</div>

<style>
  .audio-activity {
    margin: 24px 0;
  }

  .audio-container {
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid var(--card-border);
    padding: 28px;
    box-shadow: var(--card-shadow);
  }

  .audio-title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text);
    margin: 0 0 8px 0;
  }

  .audio-description {
    color: var(--text-muted);
    margin: 0 0 20px 0;
    font-size: 0.95rem;
  }

  .audio-player {
    background: var(--surface);
    border-radius: 16px;
    padding: 20px;
  }
  
  .google-drive-embed iframe {
      border: 1px solid var(--border);
      background: #000;
  }

  .audio-controls {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .audio-play-btn {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), #a855f7);
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 20px var(--primary-glow);
    flex-shrink: 0;
  }

  .audio-play-btn:hover {
    transform: scale(1.08);
    box-shadow: 0 6px 25px var(--primary-glow);
  }

  .audio-play-btn:active {
    transform: scale(0.98);
    display: flex; /* Ensure it stays flex */
  }

  .play-icon {
    margin-left: 3px;
    display: inline-block; /* Ensure icon behaves */
  }

  .audio-progress-container {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .audio-time {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-muted);
    min-width: 40px;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }

  .audio-progress {
    flex: 1;
    height: 8px;
    background: var(--border);
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    overflow: visible;
  }

  .audio-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), #a855f7);
    border-radius: 4px;
    width: 0%;
    transition: width 0.1s linear;
  }

  .audio-progress-handle {
    position: absolute;
    top: 50%;
    left: 0%;
    transform: translate(-50%, -50%);
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .audio-progress:hover .audio-progress-handle {
    opacity: 1;
  }

  .audio-volume-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .audio-volume-btn {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 4px;
    opacity: 0.8;
    transition: opacity 0.2s;
  }

  .audio-volume-btn:hover {
    opacity: 1;
  }

  .audio-volume-slider {
    width: 80px;
    height: 6px;
    -webkit-appearance: none;
    background: var(--border);
    border-radius: 3px;
    outline: none;
  }

  .audio-volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 14px;
    background: var(--primary);
    border-radius: 50%;
    cursor: pointer;
  }

  .audio-download-btn {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--surface-solid);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    text-decoration: none;
    transition: all 0.2s;
  }

  .audio-download-btn:hover {
    background: var(--primary-light);
    border-color: var(--primary);
  }

  .audio-transcript {
    margin-top: 20px;
    border-top: 1px solid var(--border);
    padding-top: 16px;
  }

  .audio-transcript summary {
    cursor: pointer;
    font-weight: 600;
    color: var(--primary);
    padding: 8px 0;
  }

  .audio-transcript summary:hover {
    text-decoration: underline;
  }

  .transcript-content {
    margin-top: 12px;
    padding: 16px;
    background: var(--surface-solid);
    border-radius: 12px;
    font-size: 0.95rem;
    line-height: 1.7;
    color: var(--text-muted);
    max-height: 200px;
    overflow-y: auto;
  }

  @media (max-width: 768px) {
    .audio-controls {
      flex-wrap: wrap;
    }

    .audio-progress-container {
      order: 2;
      width: 100%;
      margin-top: 12px;
    }

    .audio-volume-container {
      display: none;
    }
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

  .audio-listened-container {
    margin-top: 16px;
    text-align: center;
  }

  .audio-mark-listened {
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

  .audio-mark-listened:hover:not(.viewed) {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(16, 185, 129, 0.4);
  }

  .audio-mark-listened.viewed {
    background: linear-gradient(135deg, #059669, #0d9488);
    cursor: default;
  }
</style>

<script>
  (function() {
    ${trackingScript}
    
    var audio_${safeId} = document.getElementById('audio-${safeId}');
    // Only initialize custom controls if the custom audio element exists
    if (!audio_${safeId}) return;

    var playBtn_${safeId} = document.getElementById('play-btn-${safeId}');
    var playIcon_${safeId} = document.getElementById('play-icon-${safeId}');
    var progressBar_${safeId} = document.getElementById('progress-bar-${safeId}');
    var progressHandle_${safeId} = document.getElementById('progress-handle-${safeId}');
    var currentTime_${safeId} = document.getElementById('current-time-${safeId}');
    var duration_${safeId} = document.getElementById('duration-${safeId}');
    var volumeIcon_${safeId} = document.getElementById('volume-icon-${safeId}');
    var volumeSlider_${safeId} = document.getElementById('volume-${safeId}');
    
    audio_${safeId}.addEventListener('loadedmetadata', function() {
      duration_${safeId}.textContent = formatTime(audio_${safeId}.duration);
    });
    
    audio_${safeId}.addEventListener('timeupdate', function() {
      var progress = (audio_${safeId}.currentTime / audio_${safeId}.duration) * 100;
      progressBar_${safeId}.style.width = progress + '%';
      progressHandle_${safeId}.style.left = progress + '%';
      currentTime_${safeId}.textContent = formatTime(audio_${safeId}.currentTime);
    });
    
    audio_${safeId}.addEventListener('ended', function() {
      playIcon_${safeId}.textContent = '▶';
    });
    
    window.togglePlay_${safeId} = function() {
      if (audio_${safeId}.paused) {
        audio_${safeId}.play();
        playIcon_${safeId}.textContent = '⏸';
      } else {
        audio_${safeId}.pause();
        playIcon_${safeId}.textContent = '▶';
      }
    };
    
    window.seek_${safeId} = function(e) {
      var container = document.getElementById('progress-container-${safeId}');
      var rect = container.getBoundingClientRect();
      var percent = (e.clientX - rect.left) / rect.width;
      audio_${safeId}.currentTime = percent * audio_${safeId}.duration;
    };
    
    window.setVolume_${safeId} = function(value) {
      audio_${safeId}.volume = value;
      updateVolumeIcon_${safeId}();
    };
    
    window.toggleMute_${safeId} = function() {
      audio_${safeId}.muted = !audio_${safeId}.muted;
      updateVolumeIcon_${safeId}();
    };
    
    function updateVolumeIcon_${safeId}() {
      if (audio_${safeId}.muted || audio_${safeId}.volume === 0) {
        volumeIcon_${safeId}.textContent = '🔇';
      } else if (audio_${safeId}.volume < 0.5) {
        volumeIcon_${safeId}.textContent = '🔉';
      } else {
        volumeIcon_${safeId}.textContent = '🔊';
      }
    }
    
    function formatTime(seconds) {
      var mins = Math.floor(seconds / 60);
      var secs = Math.floor(seconds % 60);
      return mins + ':' + (secs < 10 ? '0' : '') + secs;
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
