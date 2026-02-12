/**
 * Live Activity Logic (Supabase Integration)
 * Injected into the SCORM package to handle Polls and Open Questions
 */

export const LIVE_ACTIVITY_LOGIC = `
(function() {
  // Global Supabase client instance
  window.sbClient = null;

  // Initialize Supabase
  function initSupabase() {
    if (window.sbClient) return; // Already initialized?
    
    // Check if the CDN script loaded the global 'supabase' object
    // The CDN usually exposes 'supabase.createClient' or similar. 
    if (typeof window.createClient !== 'undefined') {
        try {
            window.sbClient = window.createClient(window.SUPABASE_URL, window.SUPABASE_KEY, {
              auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
              }
            });
            console.log('Supabase client initialized via createClient');
        } catch (e) {
            console.error('Failed to init Supabase:', e);
        }
    } else if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient !== 'undefined') {
        try {
             window.sbClient = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY, {
              auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false
              }
            });
            console.log('Supabase client initialized via window.supabase.createClient');
        } catch (e) {
            console.error('Failed to init Supabase:', e);
        }
    } else {
        console.error('Supabase SDK not found. Live activities will not work.');
    }
  }

  // Poll Activity Logic
  window.submitPollVote = async function(activityId, optionId) {
    if (!window.sbClient) initSupabase();
    if (!window.sbClient) return;

    const feedbackEl = document.getElementById('live-feedback-' + activityId);
    if (feedbackEl) feedbackEl.textContent = 'Submitting...';

    // Disable all buttons
    const buttons = document.querySelectorAll('#activity-' + activityId + ' .poll-option-btn');
    buttons.forEach(btn => btn.disabled = true);

    try {
      // 1. Submit vote
      const { error } = await window.sbClient
        .from('live_responses')
        .insert({
          activity_id: activityId,
          response: { optionId: optionId },
          student_id: window.params?.learner_id || 'anon' 
        });

      if (error) throw error;

      // 2. Mark as completed in local SCORM state (so they don't vote again on reload? 
      //    Actually we might want to let them change, but for now let's just show results)
      localStorage.setItem('voted_' + activityId, optionId);

      if (feedbackEl) {
        feedbackEl.textContent = 'Vote recorded!';
        feedbackEl.className = 'live-feedback success';
      }
      
      // 3. Mark activity as completed for course progress
      const activityEl = document.getElementById('activity-' + activityId);
      if (activityEl && window.completedInteractions) {
         window.completedInteractions.add(activityEl);
         if (window.updateActivityProgress) window.updateActivityProgress();
      }

      // 4. Fetch and show results
      await window.fetchPollResults(activityId);

    } catch (err) {
      console.error('Error submitting vote:', err);
      if (feedbackEl) {
        feedbackEl.textContent = 'Error submitting vote. Please try again.';
        feedbackEl.className = 'live-feedback error';
      }
      buttons.forEach(btn => btn.disabled = false);
    }
  };

  window.fetchPollResults = async function(activityId) {
    if (!window.sbClient) initSupabase();
    if (!window.sbClient) return;

    try {
      const { data, error } = await window.sbClient
        .from('live_responses')
        .select('response')
        .eq('activity_id', activityId);

      if (error) throw error;

      // Aggregation
      const counts = {}; // optionId -> count
      let total = 0;
      
      data.forEach(row => {
        const optId = row.response?.optionId;
        if (optId) {
          counts[optId] = (counts[optId] || 0) + 1;
          total++;
        }
      });

      // SELF-CORRECTION: If DB is empty (reset) but we thought we voted, reset local state.
      if (total === 0 && localStorage.getItem('voted_' + activityId)) {
          localStorage.removeItem('voted_' + activityId);
          const opts = document.getElementById('poll-options-' + activityId);
          if (opts) opts.style.display = 'flex';
          
          const results = document.getElementById('poll-results-' + activityId);
          if (results) results.style.display = 'none';
          return;
      }

      // Update UI
      const resultsContainer = document.getElementById('poll-results-' + activityId);
      if (!resultsContainer) return;
      
      resultsContainer.style.display = 'block';
      resultsContainer.innerHTML = ''; // Clear current

      // Create bars for all defined options (we need the options list from DOM)
      // We stored options in data-options attribute of the container as JSON
      const optionsData = JSON.parse(resultsContainer.getAttribute('data-options') || '[]');

      optionsData.forEach(opt => {
         const count = counts[opt.id] || 0;
         const pct = total > 0 ? Math.round((count / total) * 100) : 0;
         
         const row = document.createElement('div');
         row.className = 'poll-result-row';
         row.innerHTML = \`
           <div class="poll-result-label">\${opt.text}</div>
           <div class="poll-result-bar-container">
             <div class="poll-result-bar" style="width: \${pct}%"></div>
             <span class="poll-result-count">\${count} (\${pct}%)</span>
           </div>
         \`;
         resultsContainer.appendChild(row);
      });
      
      document.getElementById('poll-options-' + activityId).style.display = 'none';

    } catch (err) {
      console.error('Error fetching results:', err);
    }
  };

  // Open Question Logic
  window.submitOpenResponse = async function(activityId) {
    if (!window.sbClient) initSupabase();
    if (!window.sbClient) return;

    const input = document.getElementById('open-input-' + activityId);
    const feedbackEl = document.getElementById('live-feedback-' + activityId);
    const text = input ? input.value.trim() : '';

    if (!text) return;

    if (feedbackEl) feedbackEl.textContent = 'Submitting...';
    
    const btn = document.getElementById('open-submit-' + activityId);
    if(btn) btn.disabled = true;

    try {
      const { error } = await window.sbClient
        .from('live_responses')
        .insert({
          activity_id: activityId,
          response: { text: text },
          student_id: window.params?.learner_id || 'anon'
        });

      if (error) throw error;
      
      localStorage.setItem('responded_' + activityId, 'true');

      if (feedbackEl) {
        feedbackEl.textContent = 'Response posted!';
        feedbackEl.className = 'live-feedback success';
      }
      
      // Cleanup Input
      if(input) input.value = '';

      // Mark Complete
      const activityEl = document.getElementById('activity-' + activityId);
      if (activityEl && window.completedInteractions) {
         window.completedInteractions.add(activityEl);
         if (window.updateActivityProgress) window.updateActivityProgress();
      }

      // Fetch Results (Media Wall)
      await window.fetchOpenResults(activityId);

    } catch (err) {
      console.error('Error submitting response:', err);
      if (feedbackEl) {
        feedbackEl.textContent = 'Error submitting. Try again.';
        feedbackEl.className = 'live-feedback error';
      }
      if(btn) btn.disabled = false;
    }
  };

  window.fetchOpenResults = async function(activityId) {
    if (!window.sbClient) initSupabase();
    if (!window.sbClient) return;

    try {
      // Limit to last 50 responses to avoid overload
      const { data, error } = await window.sbClient
        .from('live_responses')
        .select('response, created_at')
        .eq('activity_id', activityId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const wall = document.getElementById('media-wall-' + activityId);
      if (!wall) return;
      
      wall.style.display = 'grid'; // REVEAL THE WALL
      wall.innerHTML = '';

      data.forEach(row => {
         if (!row.response?.text) return;
         
         const card = document.createElement('div');
         card.className = 'media-wall-card';
         // Simple random rotation for sticky note feel
         const rot = (Math.random() * 4 - 2).toFixed(1); 
         card.style.transform = \`rotate(\${rot}deg)\`;
         
         card.innerHTML = \`
           <div class="media-wall-text">\${escapeHtml(row.response.text)}</div>
         \`;
         wall.appendChild(card);
      });

    } catch (err) {
      console.error('Error fetching wall:', err);
    }
  };

  // Helper
  function escapeHtml(text) {
    if(!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
  }

  // Auto-init specific activities if already voted
  window.initLiveActivities = function() {
      // Find all live activities
      // Check localStorage for prior votes
      // If voted, show results immediately
      setTimeout(() => {
          initSupabase();
          // Polls
          document.querySelectorAll('.live-activity[data-live-type="poll"]').forEach(el => {
              const id = el.id.replace('activity-', '');
              const voted = localStorage.getItem('voted_' + id);
              if (voted) {
                  const opts = document.getElementById('poll-options-' + id);
                  if(opts) opts.style.display = 'none';
                  window.fetchPollResults(id);
                  // Mark complete
                  if (window.completedInteractions) window.completedInteractions.add(el);
              }
          });
          
          // Open Questions
          document.querySelectorAll('.live-activity[data-live-type="open_question"]').forEach(el => {
              const id = el.id.replace('activity-', '');
              const responded = localStorage.getItem('responded_' + id);
              if (responded) {
                  // User has answered, show results
                  window.fetchOpenResults(id);
              }
              // Else: do nothing, wall remains hidden via CSS/renderer default
          });
          
      }, 1000);
  };

  // Start up
  window.addEventListener('load', window.initLiveActivities);

})();
`;
