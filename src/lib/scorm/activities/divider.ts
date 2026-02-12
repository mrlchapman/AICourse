/**
 * Divider Activity
 * Visual separator with optional label and click-to-continue pagination
 */

import { DividerActivity } from './types';

export function renderDivider(activity: DividerActivity): string {
  const style = activity.style || 'line';
  const label = activity.label || '';
  const clickToContinue = activity.clickToContinue === true;
  const safeId = activity.id.replace(/[^a-zA-Z0-9]/g, '_');

  // Click to Continue mode - renders a page break with continue button
  if (clickToContinue) {
    return `
<!-- End of sub-section, start of continue divider -->
</div>
<div class="activity divider-activity divider-continue" id="activity-${activity.id}" data-activity-type="divider" data-continue-divider="true" data-subsection-index="">
  <div class="continue-divider-content">
    ${label ? `<div class="continue-divider-label">${escapeHtml(label)}</div>` : ''}
    <button class="continue-divider-btn" id="continue-btn-${safeId}" onclick="handleContinueDivider_${safeId}()">
      <span class="continue-text">Continue</span>
      <span class="continue-icon">→</span>
    </button>
  </div>
</div>
<div class="subsection-content subsection-hidden" id="subsection-after-${safeId}" data-subsection="true" data-subsection-order="">
<!-- Start of next sub-section -->

<script>
(function() {
  window.handleContinueDivider_${safeId} = function() {
    var btn = document.getElementById('continue-btn-${safeId}');
    var divider = document.getElementById('activity-${activity.id}');
    var nextSubsection = document.getElementById('subsection-after-${safeId}');
    
    if (!btn || !divider || !nextSubsection) return;
    
    // Find the previous subsection and hide it
    var prevSubsection = divider.previousElementSibling;
    while (prevSubsection && !prevSubsection.hasAttribute('data-subsection')) {
      prevSubsection = prevSubsection.previousElementSibling;
    }
    
    // Check for incomplete required activities in the current subsection
    if (prevSubsection) {
      var requiredItems = prevSubsection.querySelectorAll('.interactive-card, .knowledge-check');
      var incompleteCount = 0;
      
      for (var i = 0; i < requiredItems.length; i++) {
        var item = requiredItems[i];
        if (window.completedInteractions && !window.completedInteractions.has(item)) {
          incompleteCount++;
        }
      }
      
      if (incompleteCount > 0) {
        if (window.showCourseToast) {
          window.showCourseToast(
            'warning',
            'Activities Incomplete',
            'Please complete all required activities on this page before continuing.',
            4000
          );
        } else {
          alert('Please complete all required activities on this page before continuing.');
        }
        return;
      }
    }
    if (prevSubsection && prevSubsection.hasAttribute('data-subsection')) {
      prevSubsection.classList.add('subsection-hidden');
      prevSubsection.classList.remove('subsection-revealed');
    }
    
    // Hide the continue button/divider
    divider.classList.add('divider-completed');
    
    // Reveal the next subsection
    nextSubsection.classList.remove('subsection-hidden');
    nextSubsection.classList.add('subsection-revealed');
    
    // Scroll to top of the content area
    var mainContent = document.querySelector('.main-content') || document.body;
    mainContent.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update progress based on subsections viewed
    if (window.updateSubsectionProgress) {
      window.updateSubsectionProgress();
    }
    
    // Update sidebar to show sub-section navigation
    if (window.updateSidebarAfterContinue) {
      window.updateSidebarAfterContinue();
    }
  };
})();
</script>

${getClickToContinueStyles()}
`;
  }

  // Regular divider modes
  if (style === 'space') {
    return `
<div class="activity divider-activity divider-space" id="activity-${activity.id}" data-activity-type="divider">
  <div class="divider-spacer" style="height: ${activity.height || 48}px;"></div>
</div>`;
  }

  if (label) {
    return `
<div class="activity divider-activity divider-${style}" id="activity-${activity.id}" data-activity-type="divider">
  <div class="divider-labeled">
    <span class="divider-line"></span>
    <span class="divider-label">${escapeHtml(label)}</span>
    <span class="divider-line"></span>
  </div>
</div>
${getDividerStyles()}`;
  }

  return `
<div class="activity divider-activity divider-${style}" id="activity-${activity.id}" data-activity-type="divider">
  <div class="divider-simple"></div>
</div>
${getDividerStyles()}`;
}

function getDividerStyles(): string {
  return `<style>
.divider-activity { margin: 32px 0; }
.divider-simple { height: 1px; background: var(--border); }
.divider-line .divider-simple { background: linear-gradient(90deg, transparent, var(--border), transparent); }
.divider-dashed .divider-simple { height: 0; background: none; border-top: 2px dashed var(--border); }
.divider-dotted .divider-simple { height: 0; background: none; border-top: 2px dotted var(--border); }
.divider-gradient .divider-simple { height: 2px; background: linear-gradient(90deg, var(--primary), #a855f7, #ec4899); border-radius: 1px; }
.divider-labeled { display: flex; align-items: center; gap: 16px; }
.divider-label { color: var(--text-muted); font-size: 0.9rem; font-weight: 600; white-space: nowrap; padding: 4px 12px; background: var(--surface); border-radius: 20px; }
.divider-labeled .divider-line { flex: 1; height: 1px; background: var(--border); }
.divider-dashed .divider-labeled .divider-line { height: 0; background: none; border-top: 2px dashed var(--border); }
.divider-dotted .divider-labeled .divider-line { height: 0; background: none; border-top: 2px dotted var(--border); }
.divider-gradient .divider-labeled .divider-line { height: 2px; background: linear-gradient(90deg, var(--primary), #a855f7); }
</style>`;
}

function getClickToContinueStyles(): string {
  return `<style>
/* Click to Continue Divider Styles */
.divider-continue {
  margin: 40px 0;
  padding: 0;
}

.continue-divider-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px 24px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: 20px;
  border: 2px dashed var(--primary);
  position: relative;
  overflow: hidden;
}

.continue-divider-content::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent, rgba(255,255,255,0.05));
  pointer-events: none;
}

.continue-divider-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  text-align: center;
}

.continue-divider-btn {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.4);
  position: relative;
  overflow: hidden;
}

.continue-divider-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent, rgba(255,255,255,0.2));
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.continue-divider-btn:hover::before {
  transform: translateX(100%);
}

.continue-divider-btn:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 12px 40px rgba(99, 102, 241, 0.5);
}

.continue-divider-btn:active {
  transform: translateY(-2px) scale(0.98);
}

.continue-text {
  font-size: 1.1rem;
}

.continue-progress {
  font-size: 0.85rem;
  opacity: 0.9;
  font-weight: 600;
  background: rgba(255,255,255,0.2);
  padding: 4px 10px;
  border-radius: 12px;
}

.continue-icon {
  font-size: 1.3rem;
  transition: transform 0.3s ease;
}

.continue-divider-btn:hover .continue-icon {
  transform: translateX(4px);
}

/* Hidden/Revealed subsection states */
.subsection-content {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.subsection-hidden {
  display: none;
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

/* Hide dividers that immediately follow a hidden subsection.
   This ensures that when subsection N is hidden, divider N+1 is also hidden.
   Structure: subsection-hidden -> divider-continue -> subsection-hidden -> divider-continue...
   When on page 1, subsection 2 is hidden, so divider 2 (which follows subsection 2) should be hidden. */
.subsection-hidden + .divider-continue {
  display: none !important;
}

.subsection-revealed {
  display: block;
  opacity: 1;
  max-height: none;
  animation: subsectionReveal 0.6s ease-out;
}

@keyframes subsectionReveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hide the divider after clicking continue */
.divider-completed {
  display: none !important;
}

/* Responsive */
@media (max-width: 768px) {
  .continue-divider-btn {
    padding: 14px 24px;
    font-size: 1rem;
  }
  
  .continue-progress {
    display: none;
  }
}
</style>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
