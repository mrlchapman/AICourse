import { QuizActivity } from './types';

export function renderQuiz(activity: QuizActivity): string {
  // Ensure questions array exists
  if (!activity.questions) activity.questions = [];
  // We embed the quiz data directly into the client-side script
  // Sanitize JSON to be safe in a script tag
  const quizData = JSON.stringify(activity).replace(/<\/script>/gi, '<\\/script>');

  // Create a safe variable name for the quiz instance
  const safeId = activity.id.replace(/[^a-zA-Z0-9]/g, '_');
  const quizVarName = `QUIZ_${safeId}`;

  // Styling for the enhanced quiz
  const styles = `
      .quiz-activity {
        overflow: hidden;
        min-height: 420px;
        position: relative;
      }
      .quiz-screen {
        padding: 40px;
        animation: quizFadeIn 0.4s ease;
      }
      .quiz-header {
        text-align: center;
        margin-bottom: 32px;
      }
      .quiz-icon {
        font-size: 56px;
        margin-bottom: 20px;
        filter: drop-shadow(0 4px 20px rgba(0,0,0,0.2));
      }
      .quiz-header h3 {
        font-size: 1.75rem;
        margin: 0;
        color: var(--text);
        font-weight: 700;
      }
      .quiz-description {
        text-align: center;
        color: var(--text-muted);
        margin-bottom: 32px;
        font-size: 1.1em;
        line-height: 1.6;
      }
      .quiz-meta {
        display: flex;
        justify-content: center;
        gap: 40px;
        margin-bottom: 40px;
      }
      .meta-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 16px 24px;
        background: var(--surface);
        border-radius: 14px;
        border: 1px solid var(--border);
      }
      .meta-item .label {
        font-size: 0.8em;
        text-transform: uppercase;
        color: var(--text-muted);
        font-weight: 600;
        letter-spacing: 0.05em;
        margin-bottom: 4px;
      }
      .meta-item .value {
        font-size: 1.6em;
        font-weight: 700;
        color: var(--primary);
      }
      .btn {
        padding: 14px 28px;
        border-radius: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
        font-size: 1rem;
      }
      .btn-primary {
        background: linear-gradient(135deg, var(--primary), #a855f7);
        color: white;
        box-shadow: 0 4px 20px var(--primary-glow);
      }
      .btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px var(--primary-glow);
      }
      .btn-secondary {
        background: var(--surface);
        color: var(--text);
        border: 2px solid var(--border);
      }
      .btn-secondary:hover {
        background: var(--primary-light);
        border-color: var(--primary);
      }
      .btn-success {
        background: linear-gradient(135deg, #10b981, #14b8a6);
        color: white;
        box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
      }
      .btn-success:hover {
        box-shadow: 0 8px 30px rgba(16, 185, 129, 0.5);
      }
      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
      .start-btn {
        display: block;
        margin: 0 auto;
        min-width: 220px;
      }
      .question-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 28px;
        padding-bottom: 20px;
        border-bottom: 1px solid var(--border);
      }
      .q-counter, .current-score, .streak-counter {
        font-weight: 600;
        color: var(--text-muted);
        font-size: 0.95em;
      }
      .streak-counter {
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.15);
        padding: 4px 10px;
        border-radius: 8px;
      }
      .timer {
         font-family: 'Inter', monospace;
         font-size: 1.2em;
         font-weight: 700;
         color: #ef4444;
         background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(244, 63, 94, 0.1));
         padding: 6px 12px;
         border-radius: 10px;
         border: 1px solid rgba(239, 68, 68, 0.2);
      }
      .question-image-container {
        margin-bottom: 24px;
        border-radius: 16px;
        overflow: hidden;
        max-height: 400px;
        display: flex;
        justify-content: center;
        background: var(--surface);
        border: 1px solid var(--border);
      }
      .question-image {
        max-width: 100%;
        max-height: 400px;
        object-fit: contain;
      }
      .question-text {
        font-size: 1.3em;
        color: var(--text);
        margin-bottom: 28px;
        line-height: 1.5;
        font-weight: 600;
      }
      .options-list {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .quiz-option {
        display: flex;
        align-items: center;
        padding: 18px 20px;
        border: 2px solid var(--border);
        border-radius: 14px;
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        background: var(--surface);
      }
      .quiz-option:hover {
        border-color: var(--primary);
        transform: translateX(4px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      }
      .quiz-option.selected {
        border-color: var(--primary);
        background: var(--primary-light);
        box-shadow: 0 0 0 3px var(--primary-glow);
      }
      .quiz-option.correct-answer {
        border-color: #10b981;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.1));
        animation: correctPop 0.4s ease;
      }
      .quiz-option.wrong-answer {
        border-color: #ef4444;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(244, 63, 94, 0.1));
        animation: shake 0.5s ease;
      }
      @keyframes correctPop {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-6px); }
        40% { transform: translateX(6px); }
        60% { transform: translateX(-4px); }
        80% { transform: translateX(4px); }
      }
      .quiz-option input {
        appearance: none;
        -webkit-appearance: none;
        width: 24px;
        height: 24px;
        border: 2px solid var(--border);
        border-radius: 50%;
        margin-right: 16px;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
        flex-shrink: 0;
        background: var(--card-bg);
      }
      .quiz-option input:checked {
        border-color: var(--primary);
        background: var(--primary);
      }
      .quiz-option input:checked::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
      }
      .quiz-option.correct-answer input:checked {
        border-color: #10b981;
        background: #10b981;
      }
      .quiz-option.wrong-answer input:checked {
        border-color: #ef4444;
        background: #ef4444;
      }
      .quiz-option .opt-text {
        font-weight: 500;
        color: var(--text);
        line-height: 1.4;
      }
      
      .quiz-feedback-box {
        margin-top: 28px;
        padding: 20px 24px;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        animation: slideDown 0.3s ease-out;
      }
      .quiz-feedback-box.correct {
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.1));
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #10b981;
      }
      .quiz-feedback-box.incorrect {
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(244, 63, 94, 0.1));
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
      }
      .feedback-title {
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.1em;
      }
      .feedback-text {
        color: var(--text);
        line-height: 1.5;
      }
      
      .quiz-footer {
        margin-top: 36px;
        display: flex;
        justify-content: flex-end;
      }
      .quiz-progress-bar {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 5px;
        background: var(--surface);
      }
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--primary), #a855f7, #ec4899);
        transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* Results */
      .results-header {
         text-align: center;
         margin-bottom: 32px;
      }
      .results-header h3 {
         color: var(--text);
         font-size: 1.75rem;
         margin-bottom: 24px;
      }
      .score-circle {
         width: 160px;
         height: 160px;
         border-radius: 50%;
         border: 6px solid var(--border);
         display: flex;
         flex-direction: column;
         align-items: center;
         justify-content: center;
         margin: 24px auto;
         position: relative;
         background: var(--surface);
      }
      .score-circle.passed {
         border-color: #10b981;
         color: #10b981;
         box-shadow: 0 0 40px rgba(16, 185, 129, 0.3);
      }
      .score-circle.failed {
         border-color: #ef4444;
         color: #ef4444;
         box-shadow: 0 0 40px rgba(239, 68, 68, 0.2);
      }
      .score-value {
         font-size: 2.5rem;
         font-weight: 800;
         line-height: 1;
         white-space: nowrap;
      }
      .score-label {
         font-size: 0.85em;
         text-transform: uppercase;
         color: var(--text-muted);
         font-weight: 600;
         margin-top: 4px;
      }
      .results-message {
         text-align: center;
         margin-bottom: 32px;
         font-size: 1.1em;
         color: var(--text);
         line-height: 1.6;
      }
      .results-actions {
         display: flex;
         justify-content: center;
         gap: 16px;
         flex-wrap: wrap;
      }

      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes quizFadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;

  return `
    <div class="activity quiz-activity interactive-card" id="quiz-${activity.id}" data-activity-type="quiz" data-activity-id="${activity.id}">
      <!-- Start Screen -->
      <div id="quiz-start-${activity.id}" class="quiz-screen active">
        <div class="quiz-header">
          <div class="quiz-icon">🏆</div>
          <h3>${escapeHtml(activity.title)}</h3>
        </div>
        <div class="quiz-description">
          ${escapeHtml(activity.description || '')}
        </div>
        <div class="quiz-meta">
          <div class="meta-item">
            <span class="label">Questions:</span>
            <span class="value">${activity.questions.length}</span>
          </div>
          ${activity.timeLimit ? `
          <div class="meta-item">
            <span class="label">Time Limit:</span>
            <span class="value">${describeTime(activity.timeLimit)}</span>
          </div>
          ` : ''}
          <div class="meta-item">
            <span class="label">Passing Score:</span>
            <span class="value">${activity.passingScore}%</span>
          </div>
        </div>
        <button type="button" class="btn btn-primary start-btn" onclick="${quizVarName}.start()">Start Quiz</button>
      </div>

      <!-- Question Screen -->
      <div id="quiz-question-${activity.id}" class="quiz-screen" style="display: none;">
        <div class="quiz-progress-bar">
          <div class="progress-fill" id="progress-${activity.id}" style="width: 0%"></div>
        </div>
        <div class="question-header">
           <div class="header-left">
             <span class="q-counter">Q <span id="q-current-${activity.id}">1</span>/${activity.questions.length}</span>
           </div>
           <div class="header-center">
              <span class="current-score">Score: <span id="current-score-${activity.id}">0</span></span>
              <span class="streak-counter" id="streak-${activity.id}" style="display:none">🔥 0</span>
           </div>
           <div class="header-right">
             ${activity.timeLimit ? `<span class="timer" id="timer-${activity.id}"></span>` : ''}
           </div>
        </div>
        <div id="question-content-${activity.id}" class="question-content">
           <!-- Dynamic Question Content -->
        </div>
        <div class="quiz-footer">
           <button type="button" class="btn btn-primary next-btn" id="next-btn-${activity.id}" onclick="${quizVarName}.handleAction()" disabled>Check Answer</button>
        </div>
      </div>

      <!-- Results Screen -->
      <div id="quiz-results-${activity.id}" class="quiz-screen" style="display: none;">
         <div class="results-header">
            <h3 id="result-title-${activity.id}">Quiz Completed</h3>
            <div class="score-circle" id="score-circle-${activity.id}">
               <span class="score-value" id="final-score-${activity.id}">0%</span>
               <span class="score-label">Score</span>
            </div>
         </div>
         <div class="results-message" id="results-message-${activity.id}"></div>
         <div class="results-actions">
            <button type="button" class="btn btn-secondary" onclick="${quizVarName}.restart()">Retake Quiz</button>

         </div>
      </div>
    </div>

    <script>
      (function() {
        window['${quizVarName}'] = (function() {
          console.log('Initializing Quiz: ${quizVarName} for Activity: ${activity.id}');
          
          const data = ${quizData};
          let currentQuestionIndex = 0;
          let score = 0;
          let streak = 0;
          let timerInterval;
          let timeRemaining = data.timeLimit || 0;
          let state = 'answering'; // 'answering' | 'feedback'
          
          const els = {
            start: document.getElementById('quiz-start-${activity.id}'),
            question: document.getElementById('quiz-question-${activity.id}'),
            results: document.getElementById('quiz-results-${activity.id}'),
            qCurrent: document.getElementById('q-current-${activity.id}'),
            qContent: document.getElementById('question-content-${activity.id}'),
            nextBtn: document.getElementById('next-btn-${activity.id}'),
            progress: document.getElementById('progress-${activity.id}'),
            timer: document.getElementById('timer-${activity.id}'),
            finalScore: document.getElementById('final-score-${activity.id}'),
            scoreCircle: document.getElementById('score-circle-${activity.id}'),
            resultsMessage: document.getElementById('results-message-${activity.id}'),
            resultTitle: document.getElementById('result-title-${activity.id}'),
            currentScore: document.getElementById('current-score-${activity.id}'),
            streak: document.getElementById('streak-${activity.id}'),
            continueBtn: document.getElementById('continue-btn-${activity.id}')
          };

          function showScreen(screenName) {
             if (els.start) els.start.style.display = 'none';
             if (els.question) els.question.style.display = 'none';
             if (els.results) els.results.style.display = 'none';
             
             if (screenName === 'start' && els.start) els.start.style.display = 'block';
             if (screenName === 'question' && els.question) els.question.style.display = 'block';
             if (screenName === 'results' && els.results) els.results.style.display = 'block';
          }

          function formatTime(seconds) {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return m + ':' + (s < 10 ? '0' : '') + s;
          }

          function updateStats() {
             if (els.currentScore) els.currentScore.textContent = score;
             if (els.streak) {
                if (streak > 1) {
                  els.streak.style.display = 'inline';
                  els.streak.textContent = '🔥 ' + streak;
                } else {
                  els.streak.style.display = 'none';
                }
             }
          }

          function startTimer() {
            if (!data.timeLimit) return;
            timeRemaining = data.timeLimit;
            if (els.timer) els.timer.textContent = formatTime(timeRemaining);
            
            clearInterval(timerInterval);
            timerInterval = setInterval(() => {
              timeRemaining--;
              if (els.timer) els.timer.textContent = formatTime(timeRemaining);
              if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                finishQuiz();
              }
            }, 1000);
          }

          function renderQuestion(index) {
            state = 'answering';
            const q = data.questions[index];
            if (!q) return;

            if (els.qCurrent) els.qCurrent.textContent = index + 1;
            if (els.progress) els.progress.style.width = ((index / data.questions.length) * 100) + '%';
            
            if (els.nextBtn) {
                els.nextBtn.disabled = true;
                els.nextBtn.textContent = 'Check Answer';
                els.nextBtn.className = 'btn btn-primary next-btn'; // Reset classes
            }

            let html = '';
            
            // Image Support
            if (q.imageUrl) {
                html += \`<div class="question-image-container"><img src="\${escapeHtml(q.imageUrl)}" class="question-image" alt="Question Image"></div>\`;
            }

            html += '<h4 class="question-text">' + escapeHtml(q.text) + '</h4>';
            html += '<div class="options-list">';
            
            q.options.forEach(opt => {
               html += \`
                 <label class="quiz-option" id="opt-\${opt.id}">
                   <input type="checkbox" name="q-\${q.id}" value="\${opt.id}" onchange="${quizVarName}.handleSelect(this)">
                   <span class="opt-text">\${escapeHtml(opt.text)}</span>
                 </label>
               \`;
            });
            html += '</div>';
            
            // Feedback container
            html += '<div id="feedback-area-${activity.id}" class="quiz-feedback-box" style="display:none"></div>';

            if (els.qContent) els.qContent.innerHTML = html;
          }

          function escapeHtml(text) {
            if (!text) return '';
            return text
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
          }

          return {
            start: function() {
              currentQuestionIndex = 0;
              score = 0;
              streak = 0;
              updateStats();
              
              // Remove completion status if retaking
              if (window.completedInteractions) {
                 const el = document.getElementById('quiz-${activity.id}');
                 if (el) window.completedInteractions.delete(el);
              }
              
              showScreen('question');
              renderQuestion(0);
              startTimer();
            },

            handleSelect: function(input) {
              if (state !== 'answering') return; // Prevent changing after checked

              const checkboxes = els.qContent.querySelectorAll('input[type="checkbox"]');
              checkboxes.forEach(cb => {
                if (cb !== input) cb.checked = false; // Force single select behavior
                cb.parentElement.classList.remove('selected');
              });
              
              if (input.checked) {
                input.parentElement.classList.add('selected');
                if (els.nextBtn) els.nextBtn.disabled = false;
              } else {
                input.parentElement.classList.remove('selected');
                const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
                if (els.nextBtn) els.nextBtn.disabled = !anyChecked;
              }
            },

            handleAction: function() {
               if (state === 'answering') {
                   this.checkAnswer();
               } else {
                   this.nextQuestion();
               }
            },

            checkAnswer: function() {
               const q = data.questions[currentQuestionIndex];
               const checkboxes = els.qContent.querySelectorAll('input[type="checkbox"]');
               const checked = Array.from(checkboxes).filter(cb => cb.checked);
               const selectedId = checked.length > 0 ? checked[0].value : null;

               // Lock inputs
               checkboxes.forEach(cb => cb.disabled = true);
               state = 'feedback';

               const correctOpt = q.options.find(o => o.correct);
               const isCorrect = correctOpt && selectedId === correctOpt.id;

               // Update score
               if (isCorrect) {
                   score += (q.points || 1);
                   streak++;
               } else {
                   streak = 0;
               }
               updateStats();

               // Visual Feedback
               if (selectedId) {
                   const selectedLabel = document.getElementById('opt-' + selectedId);
                   if (selectedLabel) {
                       selectedLabel.classList.add(isCorrect ? 'correct-answer' : 'wrong-answer');
                   }
               }
               if (!isCorrect && correctOpt) {
                   const correctLabel = document.getElementById('opt-' + correctOpt.id);
                   if (correctLabel) correctLabel.classList.add('correct-answer');
               }

               // Show Feedback Box
               const feedbackEl = document.getElementById('feedback-area-${activity.id}');
               if (feedbackEl) {
                   feedbackEl.style.display = 'block';
                   feedbackEl.className = 'quiz-feedback-box ' + (isCorrect ? 'correct' : 'incorrect');
                   
                   let feedbackHtml = '';
                   if (isCorrect) {
                       feedbackHtml += '<div class="feedback-title">✅ Correct!</div>';
                   } else {
                       feedbackHtml += '<div class="feedback-title">❌ Incorrect</div>';
                   }
                   
                   if (q.feedback) {
                       feedbackHtml += '<div class="feedback-text">' + escapeHtml(q.feedback) + '</div>';
                   }

                   feedbackEl.innerHTML = feedbackHtml;
               }

               // Update Button
               if (els.nextBtn) {
                   els.nextBtn.textContent = currentQuestionIndex === data.questions.length - 1 ? 'Finish Quiz' : 'Next Question';
               }
            },

            nextQuestion: function() {
              currentQuestionIndex++;
              if (currentQuestionIndex < data.questions.length) {
                renderQuestion(currentQuestionIndex);
              } else {
                finishQuiz();
              }
            },
            
            restart: function() {
               this.start();
            },
            
            continue: function() {
               // Trigger global next section navigation
               if (window.showNextSection) {
                 window.showNextSection();
               } else {
                 const nextBtn = document.querySelector('.next-section-btn');
                 if (nextBtn) nextBtn.click();
               }
            }
          };

          function finishQuiz() {
             clearInterval(timerInterval);
             showScreen('results');
             
const totalPoints = data.questions.reduce((sum, q) => sum + (q.points || 1), 0);
             const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
             const passed = percentage >= (data.passingScore || 0);

             if (els.finalScore) els.finalScore.textContent = percentage + '%';
             
             if (els.scoreCircle) {
                 els.scoreCircle.classList.remove('passed', 'failed');
                 if (passed) els.scoreCircle.classList.add('passed');
                 else els.scoreCircle.classList.add('failed');
             }

             if (els.resultTitle) els.resultTitle.textContent = passed ? 'Congratulations!' : 'Keep Trying';
             if (els.resultsMessage) els.resultsMessage.textContent = passed 
                ? 'You have passed the quiz.' 
                : 'You did not match the passing score. Please review the material and try again.';
             
             // GLOBAL INTERACTION COMPLETE LOGIC
             const activityEl = document.getElementById('quiz-${activity.id}');
             if (!window.completedInteractions) window.completedInteractions = new Set();
             
             if (passed) {
                if (activityEl) window.completedInteractions.add(activityEl);
                if (els.continueBtn) els.continueBtn.style.display = 'inline-block';
             } else {
                if (activityEl) window.completedInteractions.delete(activityEl);
                if (els.continueBtn) els.continueBtn.style.display = 'none';
             }

             // Auto-update global score/progress check
             if (window.updateScore) window.updateScore();
             
             // Update the activity progress bar
             if (window.updateActivityProgress) window.updateActivityProgress();

             // SCORM reporting
             try {
                if (window.SetScore) window.SetScore(percentage, 100, 0);
                if (passed && window.SetPassed) window.SetPassed();
                if (!passed && window.SetFailed) window.SetFailed();
             } catch (e) { console.error('SCORM reporting error', e); }
          }
        })();
      })();
    </script>
    <style>${styles}</style>
  `;
}


function describeTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m > 0) return `${m}m ${s > 0 ? `${s}s` : ''}`;
  return `${s}s`;
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
