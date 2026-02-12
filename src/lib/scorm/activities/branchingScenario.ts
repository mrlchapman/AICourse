/**
 * Branching Scenario Activity
 * Choose-your-own-adventure style interactive learning
 */

import { BranchingScenarioActivity, ScenarioDecisionNode, ScenarioOutcomeNode, ScenarioNode } from './types';

export function renderBranchingScenario(activity: BranchingScenarioActivity): string {
  const safeId = sanitizeId(activity.id);
  const nodes = activity.nodes || [];
  const startNodeId = activity.startNodeId || nodes[0]?.id;

  // Generate nodes JSON for the scenario engine
  const nodesJson = JSON.stringify(nodes).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

  return `
<div class="activity branching-scenario-activity" id="activity-${activity.id}" data-activity-type="branching_scenario" data-required="${activity.required || false}">
  <div class="scenario-container">
    <div class="scenario-header">
      <h3 class="scenario-title">${escapeHtml(activity.title || 'Branching Scenario')}</h3>
      ${activity.description ? `<p class="scenario-desc">${escapeHtml(activity.description)}</p>` : ''}
    </div>

    <div class="scenario-progress">
      <div class="progress-bar">
        <div class="progress-fill" id="scenario-progress-${safeId}"></div>
      </div>
      <div class="progress-text" id="scenario-progress-text-${safeId}">Step 1</div>
    </div>

    <div class="scenario-content" id="scenario-content-${safeId}">
      <!-- Content will be dynamically rendered -->
    </div>

    <div class="scenario-choices" id="scenario-choices-${safeId}">
      <!-- Choices will be dynamically rendered -->
    </div>

    <div class="scenario-outcome hidden" id="scenario-outcome-${safeId}">
      <!-- Outcome will be shown at the end -->
    </div>

    <div class="scenario-nav">
      <button class="btn btn-outline" id="scenario-restart-${safeId}" onclick="restartScenario_${safeId}()" style="display:none;">
        ↺ Start Over
      </button>
    </div>
  </div>
</div>

<style>
  .branching-scenario-activity {
    margin: 24px 0;
  }

  .scenario-container {
    background: var(--surface, #f1f5f9);
    border: 1px solid var(--card-border, #e2e8f0);
    border-radius: var(--radius-lg, 14px);
    padding: 32px;
    max-width: 800px;
    margin: 0 auto;
  }

  .scenario-header {
    text-align: center;
    margin-bottom: 24px;
  }



  .scenario-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 8px 0;
    color: var(--text, #1e293b);
  }

  .scenario-desc {
    color: var(--text-muted);
    margin: 0;
    font-size: 0.95rem;
  }

  .scenario-progress {
    margin-bottom: 24px;
  }

  .progress-bar {
    height: 4px;
    background: var(--border, #e2e8f0);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .progress-fill {
    height: 100%;
    background: var(--primary, #6366f1);
    border-radius: 2px;
    width: 10%;
    transition: width 0.5s ease;
  }

  .progress-text {
    text-align: center;
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .scenario-content {
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--card-border, #e2e8f0);
    border-radius: var(--radius-lg, 14px);
    padding: 24px;
    margin-bottom: 24px;
    min-height: 120px;
  }

  .scenario-content h4 {
    margin: 0 0 12px 0;
    font-size: 1.2rem;
    color: var(--text-primary);
  }

  .scenario-content .node-content {
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .scenario-choices {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .choice-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: var(--surface, #f1f5f9);
    border: 1px solid var(--border, #e2e8f0);
    border-radius: var(--radius-md, 10px);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
    font-size: 1rem;
    color: var(--text, #1e293b);
  }

  .choice-btn:hover {
    background: var(--primary-light, rgba(99, 102, 241, 0.1));
    border-color: var(--primary, #6366f1);
  }

  .choice-btn .choice-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--primary, #6366f1);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    flex-shrink: 0;
  }

  .choice-btn .choice-text {
    flex: 1;
  }

  .choice-btn .choice-arrow {
    opacity: 0;
    transform: translateX(-8px);
    transition: all 0.3s ease;
  }

  .choice-btn:hover .choice-arrow {
    opacity: 1;
    transform: translateX(0);
  }

  .scenario-outcome {
    text-align: center;
    padding: 32px;
    border-radius: 16px;
    margin-top: 24px;
  }

  .scenario-outcome.hidden {
    display: none;
  }

  .scenario-outcome.success {
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2));
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .scenario-outcome.partial {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(251, 191, 36, 0.2));
    border: 1px solid rgba(245, 158, 11, 0.3);
  }

  .scenario-outcome.failure {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(248, 113, 113, 0.2));
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .scenario-outcome.retry {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(96, 165, 250, 0.2));
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .outcome-icon {
    font-size: 3rem;
    margin-bottom: 16px;
  }

  .outcome-message {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .outcome-message p {
    margin-bottom: 12px;
    line-height: 1.6;
  }

  .outcome-message strong {
    font-weight: 700;
    color: var(--text-primary);
  }

  .outcome-message ul, .outcome-message ol {
    text-align: left;
    margin: 12px 0 12px 20px;
  }

  .outcome-message li {
    margin-bottom: 6px;
  }

  .outcome-points {
    color: var(--text-muted);
    font-size: 0.95rem;
  }

  .scenario-nav {
    margin-top: 24px;
    text-align: center;
  }

  .feedback-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    z-index: 9999;
    backdrop-filter: blur(2px);
    animation: fadeIn 0.2s ease;
  }

  .feedback-toast {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--card-bg, #ffffff);
    border: 1px solid var(--card-border, #e2e8f0);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.06);
    color: var(--text, #1e293b);
    padding: 32px;
    border-radius: var(--radius-lg, 14px);
    font-size: 1.1rem;
    z-index: 10000;
    animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    max-width: 500px;
    width: 90%;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    border-top: 3px solid var(--primary, #6366f1);
  }

  .feedback-icon {
    font-size: 2rem;
    margin-bottom: 4px;
  }

  .feedback-content {
    line-height: 1.6;
    color: var(--text-muted, #64748b);
  }

  .feedback-close-btn {
    background: var(--primary, #6366f1);
    color: white;
    border: none;
    padding: 10px 28px;
    border-radius: var(--radius-md, 10px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .feedback-close-btn:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }
  
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  @media (max-width: 768px) {
    .scenario-container {
      padding: 20px;
      border-radius: 16px;
    }

    .scenario-content {
      padding: 16px;
    }

    .choice-btn {
      padding: 14px 16px;
    }
  }
</style>

<script>
(function() {
  var nodes_${safeId} = ${nodesJson};
  var startNodeId_${safeId} = '${startNodeId}';
  var currentNodeId_${safeId} = startNodeId_${safeId};
  var history_${safeId} = [];
  var totalSteps_${safeId} = 0;
  var completed_${safeId} = false;

  function findNode(nodeId) {
    return nodes_${safeId}.find(function(n) { return n.id === nodeId; });
  }

  // Calculate generic max depth for progress bar
  function calculateMaxDepth(startId) {
    var maxDepth = 0;
    var stack = [{ id: startId, depth: 1, visited: [] }];
    
    while (stack.length > 0) {
      var item = stack.pop();
      var id = item.id;
      var depth = item.depth;
      var visited = item.visited;
      
      if (visited.indexOf(id) !== -1) continue;
      if (depth > maxDepth) maxDepth = depth;
      
      var node = findNode(id);
      if (!node || node.type === 'outcome') continue;
      
      var newVisited = visited.concat([id]);
      
      if (node.type === 'decision' && node.choices) {
        node.choices.forEach(function(c) {
          if (c.targetNodeId) {
            stack.push({ id: c.targetNodeId, depth: depth + 1, visited: newVisited });
          }
        });
      } else {
        var idx = nodes_${safeId}.findIndex(function(n) { return n.id === id; });
        if (idx < nodes_${safeId}.length - 1) {
          stack.push({ id: nodes_${safeId}[idx + 1].id, depth: depth + 1, visited: newVisited });
        }
      }
    }
    return maxDepth || 1;
  }

  var totalLevels_${safeId} = calculateMaxDepth(startNodeId_${safeId});

  // Initialize scenario
  renderNode_${safeId}(currentNodeId_${safeId});

  function renderNode_${safeId}(nodeId) {
    var node = findNode(nodeId);
    if (!node) return;

    currentNodeId_${safeId} = nodeId;
    history_${safeId}.push(nodeId);
    totalSteps_${safeId}++;

    // Update progress
    var progressPct = Math.min((totalSteps_${safeId} / totalLevels_${safeId}) * 100, 100);
    var progressEl = document.getElementById('scenario-progress-${safeId}');
    var progressText = document.getElementById('scenario-progress-text-${safeId}');
    if (progressEl) progressEl.style.width = progressPct + '%';
    if (progressText) progressText.textContent = 'Step ' + totalSteps_${safeId};

    // Render content
    var contentEl = document.getElementById('scenario-content-${safeId}');
    var choicesEl = document.getElementById('scenario-choices-${safeId}');
    var outcomeEl = document.getElementById('scenario-outcome-${safeId}');

    if (node.type === 'outcome') {
      // Show outcome
      contentEl.style.display = 'none';
      choicesEl.style.display = 'none';
      outcomeEl.classList.remove('hidden');

      // Force progress to 100%
      var progressEl = document.getElementById('scenario-progress-${safeId}');
      if (progressEl) progressEl.style.width = '100%';

      var outcome = node.outcome || { type: 'success', message: 'Completed!' };
      outcomeEl.className = 'scenario-outcome ' + outcome.type;

      var icon = '✅';
      if (outcome.type === 'partial') icon = '⚠️';
      if (outcome.type === 'failure') icon = '❌';
      if (outcome.type === 'retry') icon = '🔄';

      outcomeEl.innerHTML = 
        '<div class="outcome-icon">' + icon + '</div>' +
        '<div class="outcome-message">' + (outcome.message || 'Scenario completed!') + '</div>' +
        (outcome.points ? '<div class="outcome-points">+' + outcome.points + ' points</div>' : '');

      document.getElementById('scenario-restart-${safeId}').style.display = 'inline-flex';
      
      // Mark as complete
      if (!completed_${safeId}) {
        completed_${safeId} = true;
        var activityEl = document.getElementById('activity-${activity.id}');
        if (activityEl) {
          activityEl.setAttribute('data-completed', 'true');
          activityEl.setAttribute('data-score', outcome.points || 0);
          // Dispatch completion event
          var event = new CustomEvent('activityComplete', {
            detail: { id: '${activity.id}', score: outcome.points || 0 }
          });
          document.dispatchEvent(event);
        }
      }
    } else {
      // Show content and choices
      contentEl.style.display = 'block';
      choicesEl.style.display = 'flex';
      outcomeEl.classList.add('hidden');

      contentEl.innerHTML = 
        '<h4>' + escapeHtml_${safeId}(node.title) + '</h4>' +
        '<div class="node-content">' + (node.content || '') + '</div>';

      // Render choices for decision nodes
      if (node.type === 'decision' && node.choices) {
        var choicesHtml = '';
        // Create a copy and shuffle choices
        var shuffledChoices = node.choices.slice().sort(function() { return 0.5 - Math.random(); });
        
        shuffledChoices.forEach(function(choice, idx) {
          choicesHtml += 
            '<button class="choice-btn" onclick="selectChoice_${safeId}(\\'' + choice.id + '\\', \\'' + choice.targetNodeId + '\\', \\'' + escapeHtml_${safeId}(choice.feedback || '').replace(/'/g, "\\\\'") + '\\')">' +
              '<span class="choice-icon">' + String.fromCharCode(65 + idx) + '</span>' +
              '<span class="choice-text">' + escapeHtml_${safeId}(choice.text) + '</span>' +
              '<span class="choice-arrow">→</span>' +
            '</button>';
        });
        choicesEl.innerHTML = choicesHtml;
      } else {
        // For start/content nodes, find next linked node or show continue
        choicesEl.innerHTML = 
          '<button class="choice-btn" onclick="continueScenario_${safeId}()">' +
            '<span class="choice-icon">→</span>' +
            '<span class="choice-text">Continue</span>' +
            '</button>';
      }
    }
  }

  window.selectChoice_${safeId} = function(choiceId, targetNodeId, feedback) {
    if (feedback) {
      showFeedback_${safeId}(feedback, targetNodeId);
      return; 
    }
    
    if (targetNodeId) {
      renderNode_${safeId}(targetNodeId);
    }
  };

  window.continueScenario_${safeId} = function() {
    // Find next node (first decision or outcome after current)
    var currentIndex = nodes_${safeId}.findIndex(function(n) { return n.id === currentNodeId_${safeId}; });
    if (currentIndex < nodes_${safeId}.length - 1) {
      var nextNode = nodes_${safeId}[currentIndex + 1];
      renderNode_${safeId}(nextNode.id);
    }
  };

  window.restartScenario_${safeId} = function() {
    history_${safeId} = [];
    totalSteps_${safeId} = 0;
    completed_${safeId} = false;
    document.getElementById('scenario-restart-${safeId}').style.display = 'none';
    renderNode_${safeId}(startNodeId_${safeId});
  };

  function showFeedback_${safeId}(message, nextNodeId) {
    // Create overlay
    var overlay = document.createElement('div');
    overlay.className = 'feedback-overlay';
    document.body.appendChild(overlay);

    // Create modal
    var toast = document.createElement('div');
    toast.className = 'feedback-toast';
    
    // Icon (optional visual cue)
    var icon = document.createElement('div');
    icon.className = 'feedback-icon';
    icon.textContent = '💡'; // Lightbulb as generic feedback icon, or could use ℹ️
    
    var msg = document.createElement('div');
    msg.className = 'feedback-content';
    msg.textContent = message;
    
    var btn = document.createElement('button');
    btn.className = 'feedback-close-btn';
    btn.innerHTML = 'Continue';
    
    btn.onclick = function() {
      // Animate out
      toast.style.opacity = '0';
      overlay.style.opacity = '0';
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        
        // Advance only after closing
        if (nextNodeId) {
           renderNode_${safeId}(nextNodeId);
        }
      }, 200);
    };
    
    toast.appendChild(icon);
    toast.appendChild(msg);
    toast.appendChild(btn);
    
    document.body.appendChild(toast);
    
    // Focus button for accessibility
    setTimeout(function() { btn.focus(); }, 50);
  }

  function escapeHtml_${safeId}(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
</script>
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
