/**
 * Tabs Activity
 * Tabbed content panels for organizing related information
 */

import { TabsActivity } from './types';

export function renderTabs(activity: TabsActivity): string {
    const safeId = sanitizeId(activity.id);

    const tabsHtml = (activity.tabs || [])
        .map((tab, index) => `
      <button 
        class="tab-button ${index === 0 ? 'active' : ''}" 
        data-tab-id="${tab.id}"
        onclick="switchTab_${safeId}('${tab.id}')"
      >
        ${tab.icon ? `<span class="tab-icon">${escapeHtml(tab.icon)}</span>` : ''}
        <span class="tab-label">${escapeHtml(tab.title)}</span>
      </button>
    `)
        .join('');

    const panelsHtml = (activity.tabs || [])
        .map((tab, index) => `
      <div 
        class="tab-panel ${index === 0 ? 'active' : ''}" 
        id="panel-${safeId}-${tab.id}"
      >
        <div class="tab-content">${tab?.content || ''}</div>
      </div>
    `)
        .join('');

    return `
<div class="activity tabs-activity" id="activity-${activity.id}" data-activity-type="tabs">
  <div class="tabs-container">
    <div class="tabs-header" id="tabs-header-${safeId}">
      ${tabsHtml}
      <div class="tab-indicator" id="indicator-${safeId}"></div>
    </div>
    <div class="tabs-content" id="tabs-content-${safeId}">
      ${panelsHtml}
    </div>
  </div>
</div>

<style>
  .tabs-activity {
    margin: 24px 0;
  }

  .tabs-container {
    background: var(--card-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid var(--card-border);
    overflow: hidden;
    box-shadow: var(--card-shadow);
  }

  .tabs-header {
    display: flex;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    position: relative;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .tabs-header::-webkit-scrollbar {
    display: none;
  }

  .tab-button {
    flex: 1;
    min-width: 120px;
    padding: 16px 24px;
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
    z-index: 1;
  }

  .tab-button:hover {
    color: var(--text);
    background: var(--primary-light);
  }

  .tab-button.active {
    color: var(--primary);
  }

  .tab-icon {
    font-size: 1.2rem;
  }

  .tab-indicator {
    position: absolute;
    bottom: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary), #a855f7);
    border-radius: 3px 3px 0 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .tabs-content {
    padding: 0;
  }

  .tab-panel {
    display: none;
    animation: fadeIn 0.4s ease;
  }

  .tab-panel.active {
    display: block;
  }

  .tab-content {
    padding: 28px;
    line-height: 1.7;
  }

  .tab-content h1, .tab-content h2, .tab-content h3, .tab-content h4 {
    margin-top: 0;
  }

  .tab-content p:last-child {
    margin-bottom: 0;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .tab-button {
      min-width: 100px;
      padding: 14px 16px;
      font-size: 0.85rem;
    }

    .tab-label {
      display: none;
    }

    .tab-icon {
      font-size: 1.4rem;
    }

    .tab-button:has(.tab-icon) .tab-label {
      display: none;
    }

    .tab-button:not(:has(.tab-icon)) .tab-label {
      display: block;
    }
  }
</style>

<script>
  (function() {
    var activeTabId_${safeId} = '${(activity.tabs || [])[0]?.id || ''}';
    
    // Position indicator initially
    updateIndicator_${safeId}();
    
    window.switchTab_${safeId} = function(tabId) {
      var header = document.getElementById('tabs-header-${safeId}');
      var content = document.getElementById('tabs-content-${safeId}');
      
      // Update buttons
      var buttons = header.querySelectorAll('.tab-button');
      buttons.forEach(function(btn) {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab-id') === tabId) {
          btn.classList.add('active');
        }
      });
      
      // Update panels
      var panels = content.querySelectorAll('.tab-panel');
      panels.forEach(function(panel) {
        panel.classList.remove('active');
      });
      
      var activePanel = document.getElementById('panel-${safeId}-' + tabId);
      if (activePanel) {
        activePanel.classList.add('active');
      }
      
      activeTabId_${safeId} = tabId;
      updateIndicator_${safeId}();
    };
    
    function updateIndicator_${safeId}() {
      var header = document.getElementById('tabs-header-${safeId}');
      var indicator = document.getElementById('indicator-${safeId}');
      var activeBtn = header.querySelector('.tab-button.active');
      
      if (activeBtn && indicator) {
        indicator.style.width = activeBtn.offsetWidth + 'px';
        indicator.style.left = activeBtn.offsetLeft + 'px';
      }
    }
    
    // Update indicator on resize
    window.addEventListener('resize', function() {
      updateIndicator_${safeId}();
    });
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
