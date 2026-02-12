/**
 * SCORM Interaction Logic
 * Handles all interactive elements, scoring, and section navigation
 */

export const INTERACTION_LOGIC_JS = `
(function() {
  // Global state
  window.knowledgeCheckResults = {};
  window.completedInteractions = new Set();
  window.currentSectionIndex = 0;
  window.courseSections = [];
  window.sectionProgress = [];

  window.completeGamificationActivity = function(activityId) {
    const activityEl = document.getElementById('activity-' + activityId);
    if (!activityEl) return;
    
    if (!window.knowledgeCheckResults) window.knowledgeCheckResults = {};
    if (!window.completedInteractions) window.completedInteractions = new Set();
    
    // Only track if it's actually marked as interactive-card (compulsory)
    if (activityEl.classList.contains('interactive-card')) {
        window.knowledgeCheckResults['activity-' + activityId] = true;
        window.completedInteractions.add(activityEl);
        
        saveStateToSCORM();
        if (typeof window.updateScore === 'function') {
           window.updateScore();
        }
        
        // Update the activity progress bar
        if (typeof window.updateActivityProgress === 'function') {
           window.updateActivityProgress();
        }
        
        console.log('Gamification completion recorded for:', activityId);
    }
  };

  // ============================================
  // ACTIVITY-LEVEL PROGRESS TRACKING
  // ============================================
  
  // ============================================
  // COMBINED PROGRESS TRACKING
  // ============================================
  
  // Calculate progress based on BOTH completed dividers and required activities completed
  window.updateActivityProgress = function() {
    // 1. Count Required Activities
    var allRequired = document.querySelectorAll('.interactive-card, .knowledge-check');
    var totalRequired = allRequired.length;
    var completedRequired = 0;
    
    allRequired.forEach(function(el) {
      if (window.completedInteractions.has(el)) {
        completedRequired++;
      }
    });

    // 2. Count Dividers (Page Turns)
    // We only track dividers with "click-to-continue" enabled
    var allContinueDividers = document.querySelectorAll('[data-continue-divider="true"]');
    var totalDividers = allContinueDividers.length;
    var completedDividers = 0;
    
    allContinueDividers.forEach(function(div) {
        if (div.classList.contains('divider-completed')) {
            completedDividers++;
        }
    });

    // 3. Calculate Combined Progress
    // We treat 1 Divider (Page Turn) and 1 Activity as equal "Units" of work
    var totalUnits = totalRequired + totalDividers;
    var completedUnits = completedRequired + completedDividers;

    // Special Case: If course has NO tracked items at all
    if (totalUnits === 0) {
        // If we have sections, maybe base it on section completion? 
        // Or just default to 0 until they finish? 
        // Let's check sections viewed.
        var totalSections = window.courseSections.length;
        if (totalSections > 0) {
            var completedSections = 0;
            window.sectionProgress.forEach(function(p) { if (p && p.completed) completedSections++; });
             // Use section completion if no granular content
             var p = Math.round((completedSections / totalSections) * 100);
             setProgressBar(p);
             return;
        }
        setProgressBar(0);
        return;
    }

    var overallProgress = Math.round((completedUnits / totalUnits) * 100);
    overallProgress = Math.min(100, overallProgress); // Cap at 100
    
    setProgressBar(overallProgress);
    console.log('Progress Update:', 
        'Activities:', completedRequired + '/' + totalRequired, 
        'Dividers:', completedDividers + '/' + totalDividers,
        'Total:', overallProgress + '%'
    );
  };

  // Helper to update the progress bar UI
  function setProgressBar(percentage) {
    var progressPercentageEl = document.getElementById('progress-percentage');
    var progressBarFill = document.getElementById('progress-bar-fill');
    
    if (progressPercentageEl) {
      progressPercentageEl.textContent = percentage + '%';
      progressPercentageEl.classList.remove('score-pop');
      void progressPercentageEl.offsetWidth; // Trigger reflow
      progressPercentageEl.classList.add('score-pop');
    }
    
    if (progressBarFill) {
      progressBarFill.style.width = percentage + '%';
    }
  }

  // Alias for backward compatibility if needed, but we essentially merged them
  window.updateSubsectionProgress = window.updateActivityProgress;

  
  // Initialize progress on page load and section changes
  window.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      if (typeof window.updateActivityProgress === 'function') {
        window.updateActivityProgress();
      }
    }, 500);
  });
  
  // Update sidebar after clicking Continue - needs to be a window function so divider can call it
  window.updateSidebarAfterContinue = function() {
    // Find and call the internal updateSidebarContent function
    // We trigger this by dispatching a custom event that the sidebar listens to
    var sectionList = document.getElementById('section-list');
    if (sectionList) {
      // Force re-render by triggering internal update
      window.dispatchEvent(new CustomEvent('subsectionChanged'));
    }
  };
  
  // Listen for subsection changes
  window.addEventListener('subsectionChanged', function() {
    // This will be picked up when the sidebar updates next
    setTimeout(function() {
      var sectionList = document.getElementById('section-list');
      if (!sectionList || window.courseSections.length === 0) return;
      
      // Re-render sidebar content (simplified inline version)
      if (typeof updateSidebarContent === 'function') {
        updateSidebarContent();
      }
    }, 50);
  });

  // ============================================
  // CUSTOM TOAST NOTIFICATION SYSTEM
  // ============================================
  
  // Create toast container
  function createToastContainer() {
    var existing = document.getElementById('course-toast-container');
    if (existing) return existing;
    
    var container = document.createElement('div');
    container.id = 'course-toast-container';
    container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 9999999; display: flex; flex-direction: column; gap: 12px; pointer-events: none;';
    document.body.appendChild(container);
    
    // Add toast styles
    var style = document.createElement('style');
    style.textContent = \`
      .course-toast {
        padding: 16px 24px;
        border-radius: 16px;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 320px;
        max-width: 480px;
        transform: translateX(120%);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: auto;
        font-family: inherit;
      }
      .course-toast.visible {
        transform: translateX(0);
      }
      .course-toast.warning {
        background: linear-gradient(135deg, rgba(251, 146, 60, 0.95), rgba(245, 158, 11, 0.95));
        border: 1px solid rgba(251, 191, 36, 0.5);
        color: #fff;
      }
      .course-toast.success {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(20, 184, 166, 0.95));
        border: 1px solid rgba(52, 211, 153, 0.5);
        color: #fff;
      }
      .course-toast.completion {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.98), rgba(168, 85, 247, 0.98));
        border: 1px solid rgba(139, 92, 246, 0.5);
        color: #fff;
        flex-direction: column;
        align-items: flex-start;
        padding: 24px;
      }
      .toast-icon {
        font-size: 24px;
        flex-shrink: 0;
      }
      .toast-content {
        flex: 1;
      }
      .toast-title {
        font-weight: 700;
        font-size: 1rem;
        margin-bottom: 4px;
      }
      .toast-message {
        font-size: 0.9rem;
        opacity: 0.9;
        line-height: 1.4;
      }
      .toast-close {
        background: rgba(255,255,255,0.2);
        border: none;
        color: inherit;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
        flex-shrink: 0;
        font-size: 16px;
      }
      .toast-close:hover {
        background: rgba(255,255,255,0.3);
      }
      .completion-buttons {
        display: flex;
        gap: 12px;
        margin-top: 16px;
        width: 100%;
      }
      .completion-btn {
        padding: 12px 20px;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        font-size: 0.9rem;
      }
      .completion-btn.primary {
        background: rgba(255,255,255,0.95);
        color: #6366f1;
      }
      .completion-btn.primary:hover {
        background: #fff;
        transform: translateY(-2px);
      }
      .completion-btn.secondary {
        background: rgba(255,255,255,0.15);
        color: #fff;
        border: 1px solid rgba(255,255,255,0.3);
      }
      .completion-btn.secondary:hover {
        background: rgba(255,255,255,0.25);
      }
      @keyframes confetti {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
      }
    \`;
    document.head.appendChild(style);
    
    return container;
  }
  
  // Show toast notification
  window.showCourseToast = function(type, title, message, duration, showClose) {
    var container = createToastContainer();
    
    var toast = document.createElement('div');
    toast.className = 'course-toast ' + type;
    
    var icons = {
      warning: '⚠️',
      success: '✅',
      completion: '🎉'
    };
    
    var html = '<span class="toast-icon">' + (icons[type] || '📢') + '</span>';
    html += '<div class="toast-content">';
    html += '<div class="toast-title">' + title + '</div>';
    html += '<div class="toast-message">' + message + '</div>';
    html += '</div>';
    
    if (showClose !== false) {
      html += '<button class="toast-close" onclick="this.parentElement.remove()">✕</button>';
    }
    
    toast.innerHTML = html;
    container.appendChild(toast);
    
    // Animate in
    setTimeout(function() {
      toast.classList.add('visible');
    }, 10);
    
    // Auto-dismiss
    if (duration !== 0) {
      setTimeout(function() {
        toast.classList.remove('visible');
        setTimeout(function() {
          if (toast.parentElement) toast.remove();
        }, 400);
      }, duration || 4000);
    }
    
    return toast;
  };
  
  // Show completion celebration
  window.showCourseCompletionToast = function() {
    var container = createToastContainer();
    
    var toast = document.createElement('div');
    toast.className = 'course-toast completion';
    toast.id = 'completion-toast';
    
    toast.innerHTML = \`
      <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
        <span class="toast-icon" style="font-size: 32px;">🎉</span>
        <div class="toast-content">
          <div class="toast-title" style="font-size: 1.2rem;">Congratulations!</div>
          <div class="toast-message">You've successfully completed this course. Great work!</div>
        </div>
      </div>
      <div class="completion-buttons">
        <button class="completion-btn secondary" onclick="document.getElementById('completion-toast').remove()">
          Review Course
        </button>
        <button class="completion-btn primary" onclick="window.close(); window.history.back();">
          Return to Blackboard
        </button>
      </div>
    \`;
    
    container.appendChild(toast);
    
    // Confetti effect (optional simple version)
    for (var i = 0; i < 15; i++) {
      (function(index) {
        setTimeout(function() {
          var confetti = document.createElement('div');
          confetti.textContent = ['🎊', '⭐', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)];
          confetti.style.cssText = 'position: fixed; bottom: 100px; right: ' + (50 + Math.random() * 350) + 'px; font-size: 24px; animation: confetti 2s ease-out forwards; z-index: 9999998;';
          document.body.appendChild(confetti);
          setTimeout(function() { confetti.remove(); }, 2000);
        }, index * 100);
      })(i);
    }
    
    // Animate in
    setTimeout(function() {
      toast.classList.add('visible');
    }, 10);
  };

  // ============================================
  // CELEBRATION & MICRO-INTERACTIONS
  // ============================================
  
  // Create and trigger confetti celebration
  window.celebrateCorrectAnswer = function(targetElement) {
    var container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);
    
    var colors = [
      '#10b981', // emerald
      '#14b8a6', // teal
      '#6366f1', // indigo
      '#a855f7', // purple
      '#ec4899', // pink
      '#f59e0b', // amber
      '#3b82f6', // blue
    ];
    
    var shapes = ['circle', 'square', 'triangle'];
    var particleCount = 25;
    
    // Get position from target element or center of screen
    var rect = targetElement ? targetElement.getBoundingClientRect() : null;
    var originX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    var originY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    
    for (var i = 0; i < particleCount; i++) {
      (function(index) {
        setTimeout(function() {
          var particle = document.createElement('div');
          var color = colors[Math.floor(Math.random() * colors.length)];
          var shape = shapes[Math.floor(Math.random() * shapes.length)];
          
          particle.className = 'confetti ' + shape;
          particle.style.backgroundColor = color;
          particle.style.color = color;
          particle.style.left = (originX + (Math.random() - 0.5) * 100) + 'px';
          particle.style.top = originY + 'px';
          particle.style.animationDuration = (2 + Math.random() * 2) + 's';
          particle.style.animationDelay = (Math.random() * 0.3) + 's';
          
          // Random horizontal movement
          var xMove = (Math.random() - 0.5) * 200;
          particle.style.setProperty('--x-move', xMove + 'px');
          
          container.appendChild(particle);
        }, index * 30);
      })(i);
    }
    
    // Clean up after animation
    setTimeout(function() {
      if (container.parentElement) {
        container.remove();
      }
    }, 4000);
  };
  
  // Trigger score pop animation
  window.animateScorePop = function(element) {
    if (!element) return;
    element.classList.remove('score-pop');
    void element.offsetWidth; // Force reflow
    element.classList.add('score-pop');
  };
  
  // Show points fly-up animation
  window.showPointsFlyup = function(points, targetElement) {
    if (!targetElement) return;
    
    var rect = targetElement.getBoundingClientRect();
    var flyup = document.createElement('div');
    flyup.className = 'points-flyup';
    flyup.textContent = '+' + points;
    flyup.style.left = (rect.left + rect.width / 2) + 'px';
    flyup.style.top = rect.top + 'px';
    
    document.body.appendChild(flyup);
    
    setTimeout(function() {
      if (flyup.parentElement) flyup.remove();
    }, 1000);
  };
  
  // Add ripple effect to buttons
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('.btn');
    if (!btn) return;
    
    var ripple = document.createElement('span');
    ripple.className = 'ripple';
    
    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    
    btn.appendChild(ripple);
    
    setTimeout(function() {
      ripple.remove();
    }, 600);
  });
  
  // Add sparkle effect to success elements
  window.addSparkleEffect = function(element) {
    if (!element) return;
    element.classList.add('sparkle-effect');
  };
  
  // ============================================
  // END CELEBRATION SYSTEM
  // ============================================

  // ============================================
  // END TOAST SYSTEM
  // ============================================

  // Initialize section tracking
  function initializeSectionTracking() {
    const sections = document.querySelectorAll('.course-section');
    window.courseSections = Array.from(sections).map((section, index) => {
      var title = section.getAttribute('data-section-title');
      if (!title) {
        var titleElement = section.querySelector('h1, h2, h3, h4, h5, h6');
        title = titleElement ? titleElement.textContent.trim() : 'Section ' + (index + 1);
      }
      
      return {
        id: section.id,
        element: section,
        title: title,
        order: index,
        completed: false,
        unlocked: index === 0,
        paginatedStartLabel: section.getAttribute('data-start-label') || 'Start'
      };
    });

    window.sectionProgress = window.courseSections.map(section => ({
      sectionId: section.id,
      completed: false,
      unlocked: section.unlocked,
      maxPageIndex: 0,
      completedAt: null
    }));

    // Show only first section
    sections.forEach((section, index) => {
      section.style.display = index === 0 ? 'block' : 'none';
    });
    
    window.currentSectionIndex = 0;
  }

  // Check if section is complete
  window.isSectionComplete = function(sectionIndex) {
    if (sectionIndex >= window.courseSections.length) return false;
    const section = window.courseSections[sectionIndex];
    const sectionElement = section.element;
    const interactiveElements = sectionElement.querySelectorAll('.interactive-card, .knowledge-check');

    if (interactiveElements.length === 0) return true;

    let allCompleted = true;
    interactiveElements.forEach(element => {
      if (!window.completedInteractions.has(element)) {
        allCompleted = false;
      }
    });

    return allCompleted;
  };

  // Mark section complete and calculate score
  window.markSectionComplete = function(sectionIndex) {
    if (sectionIndex >= window.courseSections.length) return;
    
    const section = window.courseSections[sectionIndex];
    const progress = window.sectionProgress[sectionIndex];
    
    if (!progress.completed) {
      progress.completed = true;
      progress.completedAt = new Date();
      section.completed = true;
      
      // Calculate section score
      let sectionScore = 100;
      const sectionElement = section.element;
      const interactiveElements = sectionElement.querySelectorAll('.interactive-card, .knowledge-check');
      
      if (interactiveElements.length > 0) {
        let correctAnswers = 0;
        let totalAnswers = 0;
        
        interactiveElements.forEach(element => {
          const checkId = element.id;
          if (window.knowledgeCheckResults[checkId] !== undefined) {
            totalAnswers++;
            if (window.knowledgeCheckResults[checkId] === true) {
              correctAnswers++;
            }
          }
        });
        
        if (totalAnswers > 0) {
          sectionScore = Math.round((correctAnswers / totalAnswers) * 100);
        }
      }
      
      // Save to SCORM
      if (typeof setSectionProgress === 'function') {
        setSectionProgress(section.id, true, sectionScore);
      }
      
      // Unlock next section
      if (sectionIndex + 1 < window.courseSections.length) {
        const nextSection = window.courseSections[sectionIndex + 1];
        const nextProgress = window.sectionProgress[sectionIndex + 1];
        nextSection.unlocked = true;
        nextProgress.unlocked = true;
      }

      // Update sidebar
      updateSidebarContent();

      console.log('Section completed:', section.title, 'Score:', sectionScore + '%');
    }
  }

  // Navigate to next section
  window.showNextSection = function() {
    if (!window.isSectionComplete(window.currentSectionIndex)) {
      window.showCourseToast(
        'warning',
        'Activities Incomplete',
        'Please complete all activities in this section before proceeding.',
        5000
      );
      return;
    }

    window.markSectionComplete(window.currentSectionIndex);

    // Check if this was the last section
    if (window.currentSectionIndex + 1 >= window.courseSections.length) {
      // All sections completed!
      var finalScore = calculateFinalScore();
      setScore(finalScore);
      setComplete();
      
      // Show completion celebration
      setTimeout(function() {
        window.showCourseCompletionToast();
      }, 500);
      return;
    }

    // Move to next section
    const currentSection = window.courseSections[window.currentSectionIndex].element;
    const nextSection = window.courseSections[window.currentSectionIndex + 1].element;

    currentSection.style.display = 'none';
    nextSection.style.display = 'block';
    window.currentSectionIndex++;

    nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    updateSidebarContent();
  };

  // Calculate final score
  function calculateFinalScore() {
    const totalChecks = Object.keys(window.knowledgeCheckResults).length;
    if (totalChecks === 0) return 100;
    
    let correctCount = 0;
    Object.values(window.knowledgeCheckResults).forEach(result => {
      if (result === true) correctCount++;
    });
    
    return Math.round((correctCount / totalChecks) * 100);
  }

  // Update score display and SCORM
  window.updateScore = function() {
    const score = calculateFinalScore();
    if (typeof setScore === 'function') {
      setScore(score);
    }
  };

  // Score calculation and display
  function calculateFinalScore() {
    var totalQuestions = 0;
    var correctAnswers = 0;

    // Count knowledge check results
    Object.keys(window.knowledgeCheckResults || {}).forEach(function(key) {
      totalQuestions++;
      if (window.knowledgeCheckResults[key] === true) {
        correctAnswers++;
      }
    });

    if (totalQuestions === 0) return 0;
    return Math.round((correctAnswers / totalQuestions) * 100);
  }

  function updateScoreDisplay(score) {
    var scoreDisplay = document.getElementById('score-display');
    if (!scoreDisplay) {
      scoreDisplay = document.createElement('div');
      scoreDisplay.id = 'score-display';
      scoreDisplay.style.cssText = 'position: fixed; top: 20px; right: 20px; background: linear-gradient(to right, #22d3ee, #a78bfa); color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.2);';
      document.body.appendChild(scoreDisplay);
    }

    // Count all interactive elements
    var totalQuestions = document.querySelectorAll('.knowledge-check').length;
    var answeredQuestions = Object.keys(window.knowledgeCheckResults || {}).length;

    // Only show if there are actual interactive elements
    if (totalQuestions > 0) {
      scoreDisplay.innerHTML =
        '<div style="font-size: 14px;">Current Score: ' + score + '%</div>' +
        '<div style="font-size: 12px; opacity: 0.9;">Answered: ' + answeredQuestions + '/' + totalQuestions + '</div>';
      scoreDisplay.style.display = 'block';
    } else {
      scoreDisplay.style.display = 'none';
    }
  }

  window.updateScore = function() {
    var currentScore = calculateFinalScore();
    if (typeof setScore === 'function') {
      setScore(currentScore);
    }
    updateScoreDisplay(currentScore);
  };

  // Global function to check knowledge check answers
  window.checkKnowledgeCheck = function(activityId) {
    const activityEl = document.getElementById('activity-' + activityId);
    if (!activityEl) {
      console.error('Knowledge check activity not found:', activityId);
      return;
    }
    
    // IMPORTANT: Scope the query to THIS activity to avoid cross-activity collisions
    const selected = activityEl.querySelector('input[name="kc-' + activityId + '"]:checked');

    if (!selected) {
      alert('Please select an answer');
      return;
    }

    // IMPORTANT: Scope to THIS activity to find the correct option
    const selectedOption = activityEl.querySelector('.kc-option[data-option-id="' + selected.value + '"]');
    if (!selectedOption) {
      console.error('Selected option not found:', selected.value);
      return;
    }
    
    const isCorrect = selectedOption.dataset.correct === 'true';
    const feedback = document.getElementById('kc-feedback-' + activityId);
    const explanation = document.getElementById('kc-explanation-' + activityId);

    // Store result globally
    if (!window.knowledgeCheckResults) window.knowledgeCheckResults = {};
    if (!window.completedInteractions) window.completedInteractions = new Set();

    window.knowledgeCheckResults['activity-' + activityId] = isCorrect;
    window.completedInteractions.add(activityEl);

    // Disable all options in this activity (scoped to activity)
    activityEl.querySelectorAll('.kc-option').forEach(function(opt) {
      opt.style.pointerEvents = 'none';
      if (opt.dataset.correct === 'true') {
        opt.classList.add('correct');
      } else if (opt === selectedOption && !isCorrect) {
        opt.classList.add('incorrect');
      }
    });

    // Show feedback
    feedback.style.display = 'block';
    feedback.className = 'kc-feedback ' + (isCorrect ? 'correct' : 'incorrect');
    feedback.textContent = isCorrect ? '✓ Correct!' : '✗ Incorrect. The correct answer is highlighted.';

    // Trigger celebration or shake animation
    if (isCorrect) {
      // Celebrate with confetti!
      if (typeof window.celebrateCorrectAnswer === 'function') {
        window.celebrateCorrectAnswer(selectedOption);
      }
      // Add sparkle effect to the correct answer
      if (typeof window.addSparkleEffect === 'function') {
        window.addSparkleEffect(feedback);
      }
    } else {
      // Add enhanced shake to incorrect answer
      selectedOption.classList.add('shake-enhanced');
      setTimeout(function() {
        selectedOption.classList.remove('shake-enhanced');
      }, 600);
    }

    // Show explanation if available
    if (explanation) {
      explanation.style.display = 'block';
    }

    // Hide submit button
    const submitBtn = document.querySelector('#activity-' + activityId + ' .kc-submit');
    if (submitBtn) {
      submitBtn.style.display = 'none';
    }

    // Save state to SCORM
    saveStateToSCORM();

    // Update score
    if (typeof window.updateScore === 'function') {
      window.updateScore();
    }

    // Update activity progress bar
    if (typeof window.updateActivityProgress === 'function') {
      window.updateActivityProgress();
    }

    console.log('Knowledge check completed:', activityId, 'Correct:', isCorrect);
  };

  // Check sorting activity
  window.checkSorting = function(activityId) {
    const activityEl = document.getElementById('activity-' + activityId);
    const items = activityEl.querySelectorAll('.draggable-item');
    let allCorrect = true;

    items.forEach(item => {
      const parentCategory = item.closest('.sorting-category');
      if (!parentCategory) {
        allCorrect = false;
        return;
      }

      const correctCategoryId = item.dataset.category;
      const currentCategoryId = parentCategory.dataset.id;

      if (correctCategoryId === currentCategoryId) {
        item.classList.add('correct');
        item.classList.remove('incorrect');
      } else {
        item.classList.add('incorrect');
        item.classList.remove('correct');
        allCorrect = false;
      }
    });

    // Store result
    if (!window.knowledgeCheckResults) window.knowledgeCheckResults = {};
    if (!window.completedInteractions) window.completedInteractions = new Set();

    if (allCorrect) {
      window.knowledgeCheckResults['activity-' + activityId] = true;
      window.completedInteractions.add(activityEl);
      
      const btn = activityEl.querySelector('.check-sorting-btn');
      if (btn) btn.style.display = 'none';
      
      // Celebrate with confetti!
      if (typeof window.celebrateCorrectAnswer === 'function') {
        window.celebrateCorrectAnswer(activityEl);
      }
      
      // Save and update score
      saveStateToSCORM();
      if (typeof window.updateScore === 'function') {
        window.updateScore();
      }
      // Update activity progress bar
      if (typeof window.updateActivityProgress === 'function') {
        window.updateActivityProgress();
      }
    }
  };


  // Matching Activity Logic
  window.handleMatchingClick = function(element, side) {
    const activityEl = element.closest('.matching-activity');
    const activityId = activityEl.id.replace('activity-', '');
    
    // Clear previous errors
    activityEl.querySelectorAll('.matching-item').forEach(el => el.classList.remove('error'));
    
    // If already matched, ignore
    if (element.classList.contains('matched')) return;
    
    // Select this item
    const currentSelected = activityEl.querySelector('.matching-item.' + side + '-item.selected');
    if (currentSelected) {
      currentSelected.classList.remove('selected');
    }
    element.classList.add('selected');
    
    // Check if we have both sides selected
    const leftSelected = activityEl.querySelector('.matching-item.left-item.selected');
    const rightSelected = activityEl.querySelector('.matching-item.right-item.selected');
    
    if (leftSelected && rightSelected) {
      // Check match
      const leftId = leftSelected.dataset.id;
      const rightId = rightSelected.dataset.matchId;
      
      if (leftId === rightId) {
        // Correct match
        leftSelected.classList.remove('selected');
        rightSelected.classList.remove('selected');
        leftSelected.classList.add('matched');
        rightSelected.classList.add('matched');
        
        // Check if all matched
        const allLeft = activityEl.querySelectorAll('.matching-item.left-item');
        const allMatched = activityEl.querySelectorAll('.matching-item.left-item.matched');
        
        if (allLeft.length === allMatched.length) {
           completeMatchingActivity(activityId);
        }
      } else {
        // Incorrect match - wait a bit then reset
        setTimeout(() => {
          leftSelected.classList.add('error');
          rightSelected.classList.add('error');
          setTimeout(() => {
             leftSelected.classList.remove('selected', 'error');
             rightSelected.classList.remove('selected', 'error');
          }, 500);
        }, 300);
      }
    }
  };

  window.resetMatching = function(activityId) {
    const activityEl = document.getElementById('activity-' + activityId);
    activityEl.querySelectorAll('.matching-item').forEach(el => {
      el.classList.remove('selected', 'matched', 'error');
    });
    const feedback = document.getElementById('feedback-' + activityId);
    if(feedback) feedback.innerHTML = '';
  };

  function completeMatchingActivity(activityId) {
    const activityEl = document.getElementById('activity-' + activityId);
    const feedback = document.getElementById('feedback-' + activityId);
    
    if (!window.knowledgeCheckResults) window.knowledgeCheckResults = {};
    if (!window.completedInteractions) window.completedInteractions = new Set();
    
    window.knowledgeCheckResults['activity-' + activityId] = true;
    window.completedInteractions.add(activityEl);
    
    if (feedback) {
      feedback.innerHTML = '<div class="kc-feedback correct" style="display:block">✓ All pairs matched correctly!</div>';
    }
    
    // Celebrate with confetti!
    if (typeof window.celebrateCorrectAnswer === 'function') {
      window.celebrateCorrectAnswer(activityEl);
    }
    
    saveStateToSCORM();
    if (typeof window.updateScore === 'function') {
      window.updateScore();
    }
    // Update activity progress bar
    if (typeof window.updateActivityProgress === 'function') {
      window.updateActivityProgress();
    }
  }

  // Sequence Activity Logic
  window.checkSequence = function(activityId) {
    const activityEl = document.getElementById('activity-' + activityId);
    const list = activityEl.querySelector('.sequence-list');
    const items = list.querySelectorAll('.sequence-item');
    const feedback = document.getElementById('feedback-' + activityId);
    
    let isCorrect = true;
    let currentOrder = 0;
    
    // Check order
    items.forEach((item, index) => {
      // The items are initially shuffled. The data-correct-order is 0, 1, 2...
      // So the first item in DOM should have data-correct-order="0"
      if (parseInt(item.dataset.correctOrder) !== index) {
        isCorrect = false;
        item.classList.add('incorrect');
        item.classList.remove('correct');
      } else {
        item.classList.add('correct');
        item.classList.remove('incorrect');
      }
    });

    if (isCorrect) {
       if (!window.knowledgeCheckResults) window.knowledgeCheckResults = {};
       if (!window.completedInteractions) window.completedInteractions = new Set();
       
       window.knowledgeCheckResults['activity-' + activityId] = true;
       window.completedInteractions.add(activityEl);
       
       if (feedback) {
         feedback.innerHTML = '<div class="kc-feedback correct" style="display:block">✓ Correct sequence!</div>';
       }
       
       // Celebrate with confetti!
       if (typeof window.celebrateCorrectAnswer === 'function') {
         window.celebrateCorrectAnswer(activityEl);
       }
       
       // Hide check button
       const btn = activityEl.querySelector('.check-btn');
       if (btn) btn.style.display = 'none';

       saveStateToSCORM();
       if (typeof window.updateScore === 'function') {
         window.updateScore();
       }
       // Update activity progress bar
       if (typeof window.updateActivityProgress === 'function') {
         window.updateActivityProgress();
       }
    } else {
       if (feedback) {
         feedback.innerHTML = '<div class="kc-feedback incorrect" style="display:block">✗ Incorrect order. Green items are in the correct place.</div>';
       }
       // Add shake effect
       list.classList.add('shake-enhanced');
       setTimeout(function() {
         list.classList.remove('shake-enhanced');
       }, 600);
    }
  };

  // Initialize Drag and Drop for Sorting
  function initDragAndDrop() {
    document.addEventListener('dragstart', function(e) {
      if (e.target.classList.contains('draggable-item') || e.target.classList.contains('sequence-item')) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
        // Effect allowed
        e.dataTransfer.effectAllowed = 'move';
      }
    });

    document.addEventListener('dragend', function(e) {
      if (e.target.classList.contains('draggable-item') || e.target.classList.contains('sequence-item')) {
        e.target.classList.remove('dragging');
      }
    });

    document.addEventListener('dragover', function(e) {
      const dropZone = e.target.closest('.drop-zone') || e.target.closest('.items-pool');
      const sequenceList = e.target.closest('.sequence-list');
      
      if (dropZone || sequenceList) {
        e.preventDefault();
        if (sequenceList) {
           const afterElement = getDragAfterElement(sequenceList, e.clientY);
           const draggable = document.querySelector('.dragging');
           if (draggable && draggable.classList.contains('sequence-item')) {
             if (afterElement == null) {
               sequenceList.appendChild(draggable);
             } else {
               sequenceList.insertBefore(draggable, afterElement);
             }
           }
        }
      }
    });

    // Helper to find position in list
    function getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll('.sequence-item:not(.dragging)')];
      
      return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    document.addEventListener('drop', function(e) {
      const dropZone = e.target.closest('.drop-zone') || e.target.closest('.items-pool');
      if (dropZone) {
        e.preventDefault();
        const draggable = document.querySelector('.dragging');
        if (draggable) {
          dropZone.appendChild(draggable);
        }
      }
    });
  }

  // Process Activity Navigation
  window.navigateProcess = function(activityId, direction) {
    const activityEl = document.getElementById('activity-' + activityId);
    const steps = activityEl.querySelectorAll('.process-step');
    const dots = activityEl.querySelectorAll('.step-dot');
    let currentIndex = -1;

    steps.forEach((step, index) => {
      if (step.classList.contains('active')) {
        currentIndex = index;
      }
    });

    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < steps.length) {
      updateProcessState(activityId, newIndex);
    }
  };

  window.jumpToProcessStep = function(activityId, stepIndex) {
    updateProcessState(activityId, stepIndex);
  };

  function updateProcessState(activityId, index) {
    const activityEl = document.getElementById('activity-' + activityId);
    const steps = activityEl.querySelectorAll('.process-step');
    const dots = activityEl.querySelectorAll('.step-dot');
    const prevBtn = activityEl.querySelector('.btn-prev');
    const nextBtn = activityEl.querySelector('.btn-next');

    // Update steps
    steps.forEach((step, i) => {
      if (i === index) step.classList.add('active');
      else step.classList.remove('active');
    });

    // Update dots
    dots.forEach((dot, i) => {
      if (i === index) dot.classList.add('active');
      else dot.classList.remove('active');
    });

    // Update buttons
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === steps.length - 1;

    // Mark as completed if last step reached
    if (index === steps.length - 1) {
      if (!window.completedInteractions) window.completedInteractions = new Set();
      window.completedInteractions.add(activityEl);
      
      // Save and update score
      saveStateToSCORM();
      if (typeof window.updateScore === 'function') {
        window.updateScore();
      }
    }
  }

  // Save all state to SCORM suspend_data
  function saveStateToSCORM() {
    if (typeof saveState !== 'function') return;

    var stateData = {
      knowledgeCheckResults: window.knowledgeCheckResults || {},
      currentSectionIndex: window.currentSectionIndex || 0,
      sectionProgress: window.sectionProgress || [],
      completedInteractionIds: Array.from(window.completedInteractions || []).map(function(el) {
        return el.id;
      })
    };

    saveState(stateData);
  }

  // Restore state from SCORM suspend_data
  function restoreStateFromSCORM() {
    if (typeof loadState !== 'function') return;

    var stateData = loadState();
    if (!stateData) return;

    // Restore quiz results
    if (stateData.knowledgeCheckResults) {
      window.knowledgeCheckResults = stateData.knowledgeCheckResults;

      // Restore UI state for each quiz
      Object.keys(stateData.knowledgeCheckResults).forEach(function(activityId) {
        var isCorrect = stateData.knowledgeCheckResults[activityId];
        var activityEl = document.getElementById(activityId);
        if (!activityEl) return;

        // Find the correct answer
        var correctOption = activityEl.querySelector('.kc-option[data-correct="true"]');
        if (!correctOption) return;

        // Mark as completed
        window.completedInteractions.add(activityEl);

        // Disable all options and show correct/incorrect
        activityEl.querySelectorAll('.kc-option').forEach(function(opt) {
          opt.style.pointerEvents = 'none';
          if (opt.dataset.correct === 'true') {
            opt.classList.add('correct');
          }
        });

        // Show feedback
        var feedback = activityEl.querySelector('.kc-feedback');
        if (feedback) {
          feedback.style.display = 'block';
          feedback.className = 'kc-feedback ' + (isCorrect ? 'correct' : 'incorrect');
          feedback.textContent = isCorrect ? '✓ Correct!' : '✗ Incorrect. The correct answer is highlighted.';
        }

        // Show explanation if available
        var explanation = activityEl.querySelector('.kc-explanation');
        if (explanation) {
          explanation.style.display = 'block';
        }

        // Hide submit button
        var submitBtn = activityEl.querySelector('.kc-submit');
        if (submitBtn) {
          submitBtn.style.display = 'none';
        }
      });
    }

    // Restore section progress
    if (stateData.currentSectionIndex !== undefined) {
      window.currentSectionIndex = stateData.currentSectionIndex;
    }

    if (stateData.sectionProgress) {
      window.sectionProgress = stateData.sectionProgress;
    }

    console.log('State restored from SCORM:', stateData);
  }

  // Progress Sidebar Creation
  function createProgressSidebar() {
    console.log('Creating progress sidebar with', window.courseSections.length, 'sections');

    if (window.courseSections.length === 0) {
      console.log('Skipping sidebar creation - no sections');
      return;
    }

    // Clean up any existing sidebar elements
    var existingSidebar = document.getElementById('progress-sidebar');
    var existingToggle = document.getElementById('mobile-toggle');
    var existingOverlay = document.getElementById('sidebar-overlay');

    if (existingSidebar) existingSidebar.remove();
    if (existingToggle) existingToggle.remove();
    if (existingOverlay) existingOverlay.remove();

    var sidebar = document.createElement('div');
    sidebar.className = 'progress-sidebar visible';
    sidebar.id = 'progress-sidebar';

    sidebar.innerHTML =
      '<div class="progress-sidebar-header">' +
        '<div class="progress-sidebar-title">' +
          'Course Progress' +
          '<button class="sidebar-toggle" onclick="toggleSidebar()" aria-label="Hide sidebar">' +
            '<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />' +
            '</svg>' +
          '</button>' +
        '</div>' +
        '<div class="progress-bar-container">' +
          '<div class="progress-bar-label">' +
            '<span>Overall Progress</span>' +
            '<span id="progress-percentage">0%</span>' +
          '</div>' +
          '<div class="progress-bar">' +
            '<div class="progress-bar-fill" id="progress-bar-fill"></div>' +
          '</div>' +
          '<div class="progress-summary" id="progress-summary">' +
            '0 of ' + window.courseSections.length + ' sections completed' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="progress-sidebar-content">' +
        '<div class="section-list" id="section-list"></div>' +
      '</div>' +
      '<div class="progress-sidebar-footer">' +
        '<div class="footer-text">Navigate through sections as you progress</div>' +
      '</div>';

    document.body.appendChild(sidebar);

    // Create mobile toggle button
    var mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-toggle';
    mobileToggle.id = 'mobile-toggle';
    mobileToggle.onclick = toggleSidebar;
    mobileToggle.setAttribute('aria-label', 'Toggle course navigation');
    mobileToggle.innerHTML =
      '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />' +
      '</svg>';
    document.body.appendChild(mobileToggle);

    // Create overlay for mobile
    var overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebar-overlay';
    overlay.onclick = hideSidebar;
    document.body.appendChild(overlay);

    // Add sidebar open class to body
    document.body.classList.add('sidebar-open');

    updateSidebarContent();
  }

  function updateSidebarContent() {
    var sectionList = document.getElementById('section-list');
    if (!sectionList) return;

    if (window.courseSections.length === 0) return;

    var completedCount = window.sectionProgress.filter(function(p) { return p.completed; }).length;
    var progressPercentage = Math.round((completedCount / window.courseSections.length) * 100);

    var progressPercentageEl = document.getElementById('progress-percentage');
    var progressBarFill = document.getElementById('progress-bar-fill');
    var progressSummary = document.getElementById('progress-summary');

    // Don't override progress if using subsection-based progress
    var hasContinueDividers = document.querySelectorAll('[data-continue-divider="true"]').length > 0;
    if (!hasContinueDividers) {
      if (progressPercentageEl) progressPercentageEl.textContent = progressPercentage + '%';
      if (progressBarFill) progressBarFill.style.width = progressPercentage + '%';
    }
    if (progressSummary) progressSummary.textContent = completedCount + ' of ' + window.courseSections.length + ' sections completed';

    sectionList.innerHTML = window.courseSections.map(function(section, index) {
      var progress = window.sectionProgress[index];
      var isCurrent = index === window.currentSectionIndex;
      var isCompleted = progress && progress.completed;
      var isUnlocked = progress && progress.unlocked;

      // Update basic status class
      var statusClass = 'locked';
      var iconContent = '<svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">' +
        '<path fill-rule="evenodd" d="M5 9V7a5 5 0 0 1 10 0v2a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2zm8-2v2H7V7a3 3 0 0 1 6 0z" clip-rule="evenodd" />' +
        '</svg>';

      if (isCompleted) {
        statusClass = 'completed';
        iconContent = '<svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">' +
          '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z" clip-rule="evenodd" />' +
          '</svg>';
      } else if (isCurrent || isUnlocked) {
        statusClass = 'unlocked';
        iconContent = '<svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">' +
          '<path d="M10 2a5 5 0 0 0-5 5v2a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H7V7a3 3 0 0 1 5.905-.75 1 1 0 0 0 1.937-.5A5.002 5.002 0 0 0 10 2z" />' +
          '</svg>';
      }

      var clickHandler = isUnlocked || isCompleted ? 'onclick="navigateToSectionFromSidebar(' + index + ')"' : '';

      var sectionHtml = '<div class="section-item ' + (isCurrent ? 'current ' : '') + statusClass + '" ' + clickHandler + '>' +
        '<div class="section-icon ' + statusClass + '">' + iconContent + '</div>' +
        '<div class="section-details">' +
          '<div class="section-title">' + section.title + '</div>' +
        '</div>' +
      '</div>';
      
      // Add sub-sections for current section if it has continue dividers
      if (isCurrent && section.element) {
        var subsections = section.element.querySelectorAll('[data-subsection="true"]');
        var continueDividers = section.element.querySelectorAll('[data-continue-divider="true"]');
        
        // Track max page reached
        var visibleIndex = 0;
        for(var j=0; j<subsections.length; j++) {
            if(!subsections[j].classList.contains('subsection-hidden')) {
                visibleIndex = j;
                break;
            }
        }
        if (progress.maxPageIndex === undefined) progress.maxPageIndex = 0;
        if (visibleIndex > progress.maxPageIndex) progress.maxPageIndex = visibleIndex;

        if (subsections.length > 1) {
          var subsectionHtml = '<div class="subsection-list">';
          
          for (var i = 0; i < subsections.length; i++) {
            var sub = subsections[i];
            
            // Is this the page currently on screen?
            var isCurrentPage = !sub.classList.contains('subsection-hidden');
            
            // Is this page unlocked/viewable?
            // Unlocked if we have reached this page index before (maxPageIndex) OR if section is fully complete
            var isViewed = (i <= (progress.maxPageIndex || 0)) || isCompleted;
            
            // Find the label for this subsection
            var pageLabel = 'Page ' + (i + 1);
            if (i > 0 && continueDividers[i-1]) {
              var labelEl = continueDividers[i-1].querySelector('.continue-divider-label');
              if (labelEl && labelEl.textContent) {
                pageLabel = labelEl.textContent;
              }
            } else if (i === 0) {
              pageLabel = section.paginatedStartLabel || 'Start';
            }
            
            var subStatusClass = isViewed ? (isCurrentPage ? 'current' : 'completed') : 'locked';
            var subClickHandler = isViewed ? 'onclick="navigateToSubsection(' + index + ',' + i + ')"' : '';
            
            subsectionHtml += '<div class="subsection-item ' + subStatusClass + '" ' + subClickHandler + '>' +
              '<span class="subsection-dot ' + subStatusClass + '"></span>' +
              '<span class="subsection-label">' + pageLabel + '</span>' +
            '</div>';
          }
          
          subsectionHtml += '</div>';
          sectionHtml += subsectionHtml;
        }
      }
      
      return sectionHtml;
    }).join('');
    
    // Add subsection navigation styles if not already present
    if (!document.getElementById('subsection-nav-styles')) {
      var style = document.createElement('style');
      style.id = 'subsection-nav-styles';
      style.textContent = 
        '.subsection-list { margin-left: 24px; margin-top: 8px; border-left: 2px solid var(--border); padding-left: 12px; }' +
        '.subsection-item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; font-size: 0.85rem; color: var(--text-muted); cursor: pointer; border-radius: 6px; transition: all 0.2s; }' +
        '.subsection-item:hover { background: rgba(99, 102, 241, 0.1); }' +
        '.subsection-item.current { color: var(--primary); font-weight: 600; background: rgba(99, 102, 241, 0.15); }' +
        '.subsection-item.completed { color: var(--text); }' +
        '.subsection-item.locked { opacity: 0.5; cursor: not-allowed; }' +
        '.subsection-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); flex-shrink: 0; }' +
        '.subsection-dot.current { background: var(--primary); box-shadow: 0 0 8px var(--primary-glow); }' +
        '.subsection-dot.completed { background: #10b981; }' +
        '.subsection-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }';
      document.head.appendChild(style);
    }
  }
  
  // Navigate to a specific subsection
  window.navigateToSubsection = function(sectionIndex, subsectionIndex) {
    if (sectionIndex !== window.currentSectionIndex) return;
    
    var section = window.courseSections[sectionIndex];
    if (!section || !section.element) return;
    
    var subsections = section.element.querySelectorAll('[data-subsection="true"]');
    var dividers = section.element.querySelectorAll('[data-continue-divider="true"]');
    
    // Hide all subsections
    subsections.forEach(function(sub, i) {
      if (i === subsectionIndex) {
        sub.classList.remove('subsection-hidden');
        sub.classList.add('subsection-revealed');
      } else {
        sub.classList.add('subsection-hidden');
        sub.classList.remove('subsection-revealed');
      }
    });
    
    // Show/hide dividers appropriately
    dividers.forEach(function(div, i) {
      if (i < subsectionIndex) {
        div.classList.add('divider-completed');
      } else {
        div.classList.remove('divider-completed');
      }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Update progress
    if (window.updateSubsectionProgress) {
      window.updateSubsectionProgress();
    }
    
    // Update sidebar
    updateSidebarContent();
  };

  window.navigateToSectionFromSidebar = function(sectionIndex) {
    if (sectionIndex < 0 || sectionIndex >= window.courseSections.length) return;

    var targetProgress = window.sectionProgress[sectionIndex];
    if (!targetProgress.unlocked && !targetProgress.completed) {
      alert('This section is locked. Complete previous sections first.');
      return;
    }

    // Hide current section
    var currentSection = window.courseSections[window.currentSectionIndex].element;
    currentSection.style.display = 'none';

    // Show target section
    var targetSection = window.courseSections[sectionIndex].element;
    targetSection.style.display = 'block';
    window.currentSectionIndex = sectionIndex;

    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    updateSidebarContent();
    saveStateToSCORM();
  };

  window.toggleSidebar = function() {
    var sidebar = document.getElementById('progress-sidebar');
    if (sidebar && sidebar.classList.contains('visible')) {
      hideSidebar();
    } else {
      showSidebar();
    }
  };

  function showSidebar() {
    var sidebar = document.getElementById('progress-sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    
    document.body.classList.add('sidebar-open');
    if (sidebar) sidebar.classList.add('visible');
    if (overlay) overlay.classList.add('visible');
  }

  function hideSidebar() {
    var sidebar = document.getElementById('progress-sidebar');
    var overlay = document.getElementById('sidebar-overlay');
    
    document.body.classList.remove('sidebar-open');
    if (sidebar) sidebar.classList.remove('visible');
    if (overlay) overlay.classList.remove('visible');
  }

  // Initialize on load
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize SCORM
    if (typeof initSCORM === 'function') {
      initSCORM();
    }

    // Restore saved state
    restoreStateFromSCORM();

    // Initialize section tracking
    initializeSectionTracking();

    // Create progress sidebar
    createProgressSidebar();

    // Initialize Drag and Drop
    initDragAndDrop();

    // Update score display
    if (typeof window.updateScore === 'function') {
      window.updateScore();
    }
  });

  // Save state before leaving
  window.addEventListener('beforeunload', function() {
    saveStateToSCORM();
    if (typeof termSCORM === 'function') {
      termSCORM();
    }
  });
})();
`;

