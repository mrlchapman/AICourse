import { LiveActivity } from './types';
import { escapeHtml } from './utils';

export function renderLiveActivity(activity: LiveActivity): string {
  const safeId = activity.id.replace(/[^a-zA-Z0-9]/g, '_');
  const type = activity.activityType || 'poll'; // default

  let contentHtml = '';

  if (type === 'poll') {
    const options = activity.options || [];
    const optionsJson = escapeHtml(JSON.stringify(options));

    contentHtml = `
      <div class="live-poll-container" id="poll-container-${safeId}">
        <div class="poll-options" id="poll-options-${safeId}">
          ${options.map(opt => `
            <button class="poll-option-btn btn" onclick="window.submitPollVote('${safeId}', '${opt.id}')">
              ${escapeHtml(opt.text)}
            </button>
          `).join('')}
        </div>
        
        <div class="poll-results" id="poll-results-${safeId}" style="display: none;" data-options="${optionsJson}">
          <!-- Results injected by JS -->
          <div class="loading-spinner">Loading results...</div>
        </div>
      </div>
    `;
  } else if (type === 'open_question') {
    contentHtml = `
      <div class="live-open-container" id="open-container-${safeId}">
        <div class="open-input-area">
          <textarea 
            id="open-input-${safeId}" 
            class="open-response-input" 
            placeholder="Type your answer here..."
            rows="3"
          ></textarea>
          <button 
            id="open-submit-${safeId}"
            class="open-submit-btn btn btn-primary" 
            onclick="window.submitOpenResponse('${safeId}')"
          >
            Submit Response
          </button>
        </div>

        <div class="media-wall-title">Class Responses</div>
        <div class="media-wall" id="media-wall-${safeId}" style="display: none;">
          <!-- Wall cards injected by JS -->
          <div class="loading-spinner">Waiting for responses...</div>
        </div>
      </div>
    `;
  }

  return `
    <div class="activity live-activity interactive-card" id="activity-${safeId}" data-live-type="${type}" data-activity-type="live">
      <div class="activity-header">
        <span class="activity-icon">${type === 'poll' ? '📊' : '💬'}</span>
        <h3>${type === 'poll' ? 'Live Poll' : 'Open Question'}</h3>
      </div>
      
      ${activity.imageUrl ? `<img src="${escapeHtml(activity.imageUrl)}" class="activity-image" alt="Question Image"/>` : ''}
      
      <div class="activity-question">
        ${activity.question}
      </div>
      
      ${activity.description ? `<p class="activity-description">${escapeHtml(activity.description)}</p>` : ''}
      
      <div class="live-interaction-area">
        ${contentHtml}
      </div>

      <div class="live-feedback" id="live-feedback-${safeId}"></div>

      <style>
        .live-activity {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border: 1px solid #334155;
        }
        .activity-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .activity-icon {
          font-size: 24px;
          background: rgba(99, 102, 241, 0.1);
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
        }
        .activity-question {
          font-size: 1.2rem;
          font-weight: 500;
          margin-bottom: 24px;
          line-height: 1.5;
        }
        .activity-description {
          color: #94a3b8;
          font-style: italic;
          margin-bottom: 20px;
        }

        /* Poll Styles */
        .poll-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .poll-option-btn {
          width: 100%;
          text-align: left;
          justify-content: flex-start;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.2);
          transition: all 0.2s;
        }
        .poll-option-btn:hover:not(:disabled) {
          background: rgba(99, 102, 241, 0.2);
          border-color: #6366f1;
        }
        .poll-option-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .poll-result-row {
          margin-bottom: 12px;
        }
        .poll-result-label {
          margin-bottom: 4px;
          font-size: 0.9rem;
          color: #cbd5e1;
        }
        .poll-result-bar-container {
          height: 24px;
          background: rgba(0,0,0,0.3);
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }
        .poll-result-bar {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          transition: width 1s ease-out;
        }
        .poll-result-count {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.75rem;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0,0,0,0.8);
        }

        /* Open Question Styles */
        .open-input-area {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }
        .open-response-input {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 12px;
          padding: 16px;
          color: white;
          font-family: inherit;
          resize: vertical;
        }
        .open-response-input:focus {
          outline: none;
          border-color: #6366f1;
          background: rgba(15, 23, 42, 0.8);
        }
        .media-wall-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 16px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.2);
          padding-bottom: 8px;
        }
        .media-wall {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          min-height: 200px;
        }
        .media-wall-card {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #1e293b; 
          padding: 16px;
          border-radius: 4px; /* Sticky note style */
          box-shadow: 0 4px 6px rgba(0,0,0,0.2);
          font-family: 'Comic Sans MS', 'Marker Felt', sans-serif; /* Playful font for sticky notes */
          font-size: 0.9rem;
          line-height: 1.4;
          transition: transform 0.2s;
        }
        .media-wall-card:hover {
          transform: scale(1.05) rotate(0deg) !important;
          z-index: 10;
          box-shadow: 0 10px 15px rgba(0,0,0,0.3);
        }

        .live-feedback {
          margin-top: 16px;
          min-height: 20px;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .live-feedback.success { color: #10b981; }
        .live-feedback.error { color: #ef4444; }
      </style>
    </div>
  `;
}
