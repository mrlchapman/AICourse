'use client';

import { useState, useEffect, useRef } from 'react';
import { updateProgress, completeCourse } from '@/app/actions/student';
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';
import Link from 'next/link';
import { generateCourseContent } from '@/lib/scorm/courseBuilder';
import { generateCourseHtml, DEFAULT_THEME } from '@/lib/scorm/templates/courseTemplate';

interface CoursePlayerProps {
  enrollment: any;
  courseContent: any;
}

const BRIDGE_SCRIPT = (initialStateJson: string) => `
<script>
  (function() {
    const initialState = ${initialStateJson};
    window.initialState = initialState;
    window.isCourseCompleted = initialState?.status === 'completed' || initialState?.status === 'passed';
    window.isReviewMode = window.isCourseCompleted;

    let suspendData = JSON.stringify(initialState.suspendData || {});
    const lessonStatus = initialState.status || 'incomplete';

    window.API = {
      LMSInitialize: function() { return "true"; },
      LMSFinish: function() { return "true"; },
      LMSGetValue: function(key) {
          if (key === 'cmi.suspend_data') return suspendData;
          if (key === 'cmi.core.lesson_status') return lessonStatus;
          return "";
      },
      LMSSetValue: function(key, val) {
          try {
              if (key === 'cmi.suspend_data') {
                  suspendData = val;
                  window.parent.postMessage({ type: 'SUSPEND_DATA', data: val }, '*');
              }
              if (key === 'cmi.core.score.raw') {
                   window.parent.postMessage({ type: 'UPDATE_SCORE', score: val }, '*');
              }
              if (key === 'cmi.core.lesson_status') {
                   if (val === 'completed' || val === 'passed') {
                       window.parent.postMessage({ type: 'COURSE_COMPLETE' }, '*');
                   }
              }
          } catch(e) { console.error('Bridge error', e); }
          return "true";
      },
      LMSCommit: function() { return "true"; },
      LMSGetLastError: function() { return "0"; },
      LMSGetErrorString: function() { return ""; },
      LMSGetDiagnostic: function() { return ""; },
      isHostedPlayer: true
    };
    window.isHostedPlayer = true;

    window.addEventListener('load', function() {
        const originalSetSectionProgress = window.setSectionProgress;
        window.setSectionProgress = function(sectionId, completed, score) {
            if (typeof originalSetSectionProgress === 'function') {
                originalSetSectionProgress(sectionId, completed, score);
            }
            window.parent.postMessage({ type: 'SECTION_COMPLETE', sectionId, completed, score }, '*');
        };
    });
  })();
</script>
`;

export default function CoursePlayer({ enrollment, courseContent }: CoursePlayerProps) {
  const [html, setHtml] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const htmlRef = useRef<string>('');
  const hasGeneratedRef = useRef(false);

  // Handle tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && htmlRef.current && !html) {
        setHtml(htmlRef.current);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [html]);

  // Generate the full SCORM HTML
  useEffect(() => {
    if (!courseContent) return;
    if (hasGeneratedRef.current && htmlRef.current) {
      if (!html) setHtml(htmlRef.current);
      return;
    }

    try {
      // Deep clone and process content for Drive URL proxying
      const processedContent = JSON.parse(JSON.stringify(courseContent));

      const transformDriveUrl = (url: string): string => {
        if (!url) return url;
        const isGoogleDriveUrl = url.includes('drive.google.com') || url.includes('docs.google.com');
        const isGoogleContentUrl = url.includes('lh3.googleusercontent.com/d/');
        if (!isGoogleDriveUrl && !isGoogleContentUrl) return url;
        const match = url.match(/id=([a-zA-Z0-9_-]+)/) ||
          url.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
          url.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
        if (!match) return url;
        return `${window.location.origin}/api/drive/proxy?fileId=${match[1]}`;
      };

      processedContent.sections?.forEach((section: any) => {
        section.activities?.forEach((activity: any) => {
          if (activity.type === 'pdf' && activity.pdfUrl) {
            const match = activity.pdfUrl.match(/id=([a-zA-Z0-9_-]+)/) ||
              activity.pdfUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
              activity.pdfUrl.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
            if (match) {
              activity.pdfUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
            }
          }
          if (activity.type === 'image' && activity.src) {
            activity.src = transformDriveUrl(activity.src);
          }
          if (activity.type === 'audio' && activity.src) {
            activity.src = transformDriveUrl(activity.src);
          }
          if (activity.type === 'gallery' && activity.images) {
            activity.images.forEach((img: any) => {
              if (img.src) img.src = transformDriveUrl(img.src);
            });
          }
          if (activity.content && typeof activity.content === 'string') {
            activity.content = activity.content.replace(
              /src="https:\/\/(drive|docs)\.google\.com\/[^"]*(?:id=|d\/)([a-zA-Z0-9_-]+)[^"]*"/g,
              `src="${window.location.origin}/api/drive/proxy?fileId=$2"`
            );
          }
        });
      });

      const innerHtml = generateCourseContent(processedContent);
      let fullHtml = generateCourseHtml(
        processedContent.title || 'Course',
        innerHtml,
        processedContent.theme || DEFAULT_THEME
      );

      // State synthesis for restoration
      const progressData = enrollment.progress || {};
      const responsesData = enrollment.responses || [];
      const isCourseCompleted = enrollment.status === 'completed' || enrollment.status === 'passed';

      let suspendData: any = null;
      if (progressData._suspend_data) {
        try {
          suspendData = typeof progressData._suspend_data === 'string'
            ? JSON.parse(progressData._suspend_data)
            : progressData._suspend_data;
        } catch (e) {
          console.error('Error parsing stored suspend_data', e);
        }
      }

      if (!suspendData) {
        const knowledgeCheckResults: Record<string, boolean> = {};
        responsesData.forEach((r: any) => {
          const key = r.activity_id?.startsWith('activity-') ? r.activity_id : `activity-${r.activity_id}`;
          knowledgeCheckResults[key] = r.is_correct || r.status === 'completed';
        });

        const sectionProgress = processedContent.sections?.map((s: any, idx: number) => {
          const isCompleted = progressData[s.id]?.status === 'completed';
          let isUnlocked = isCourseCompleted || isCompleted || idx === 0;
          if (!isUnlocked && idx > 0) {
            const prevSectionId = processedContent.sections[idx - 1].id;
            isUnlocked = progressData[prevSectionId]?.status === 'completed';
          }
          return { sectionId: s.id, completed: isCompleted, unlocked: isUnlocked };
        }) || [];

        suspendData = {
          knowledgeCheckResults,
          sectionProgress,
          currentSectionIndex: 0,
          completedInteractionIds: Object.keys(knowledgeCheckResults)
        };
      }

      const initialState = {
        suspendData,
        status: enrollment.status,
        score: enrollment.final_score
      };

      // Review mode restoration
      const RESTORE_SCRIPT = `
      <script>
        window.addEventListener('DOMContentLoaded', function() {
          try {
            const isCourseCompleted = ${isCourseCompleted};
            if (isCourseCompleted) {
              setTimeout(() => {
                if (window.sectionProgress) {
                  window.sectionProgress.forEach(p => {
                    p.unlocked = true;
                    p.completed = true;
                    p.maxPageIndex = 99;
                  });
                }
                if (window.courseSections) {
                  window.courseSections.forEach(s => {
                    s.unlocked = true;
                    s.completed = true;
                  });
                }
                document.querySelectorAll('[data-continue-divider="true"]').forEach(div => {
                  div.classList.add('divider-completed');
                  div.classList.remove('divider-hidden');
                });
                document.querySelectorAll('[data-subsection="true"]').forEach(sub => {
                  sub.classList.remove('subsection-hidden');
                  sub.classList.add('subsection-revealed');
                });
                if (typeof updateSidebarContent === 'function') updateSidebarContent();
                if (typeof updateActivityProgress === 'function') updateActivityProgress();
                var progressPercentageEl = document.getElementById('progress-percentage');
                var progressBarFill = document.getElementById('progress-bar-fill');
                var progressSummary = document.getElementById('progress-summary');
                if (progressPercentageEl) progressPercentageEl.textContent = '100%';
                if (progressBarFill) progressBarFill.style.width = '100%';
                if (progressSummary && window.courseSections) {
                  progressSummary.textContent = window.courseSections.length + ' of ' + window.courseSections.length + ' sections completed';
                }
              }, 500);

              var banner = document.createElement('div');
              banner.id = 'review-mode-banner';
              banner.innerHTML = '<span style="font-size:1.2rem">📚</span><span>Review Mode - Course Completed</span>';
              banner.style.cssText = 'position:fixed;bottom:20px;right:20px;background:linear-gradient(135deg,#10b981,#14b8a6);color:white;padding:12px 20px;border-radius:12px;font-weight:600;font-size:0.9rem;z-index:1000;box-shadow:0 4px 20px rgba(16,185,129,0.4);display:flex;align-items:center;gap:10px;';
              document.body.appendChild(banner);
            }
          } catch(e) { console.error('Restore UI error', e); }
        });
      </script>
      <script>
        if (${isCourseCompleted}) {
          document.documentElement.classList.add('course-completed');
        }
      </script>
      `;

      fullHtml = fullHtml.replace('</body>', `${BRIDGE_SCRIPT(JSON.stringify(initialState))}${RESTORE_SCRIPT}</body>`);

      htmlRef.current = fullHtml;
      hasGeneratedRef.current = true;
      setHtml(fullHtml);
      setGenerationError(null);
    } catch (e: any) {
      console.error('Failed to generate course HTML', e);
      setGenerationError(e.message || 'Failed to process course content');
    }
  }, [courseContent, enrollment]);

  // Handle messages from the iframe
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (!event.data || !event.data.type) return;
      try {
        switch (event.data.type) {
          case 'SECTION_COMPLETE':
            await updateProgress(enrollment.id, {
              sectionId: event.data.sectionId,
              completed: true,
              score: event.data.score,
            });
            break;
          case 'UPDATE_SCORE':
            if (event.data.score !== undefined) {
              await updateProgress(enrollment.id, {
                score: Number(event.data.score),
              });
            }
            break;
          case 'COURSE_COMPLETE':
            await completeCourse(enrollment.id, enrollment.final_score);
            break;
          case 'HEARTBEAT':
            await updateProgress(enrollment.id, {
              timeSpent: event.data.seconds,
            });
            break;
          case 'LOG_RESPONSE':
            await updateProgress(enrollment.id, {
              response: {
                activity_id: event.data.activityId,
                question_id: event.data.questionId,
                selected_id: event.data.selectedId,
                is_correct: event.data.isCorrect,
                points: event.data.points,
              },
            });
            break;
          case 'SUSPEND_DATA':
            await updateProgress(enrollment.id, {
              response: { _suspend_data: event.data.data },
            });
            break;
        }
      } catch (err) {
        console.error('Error handling course message:', err);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [enrollment.id, enrollment.final_score]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  // Keyboard shortcuts for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        // Browser handles Escape for fullscreen, but sync state
        setIsFullScreen(false);
      }
      if (e.key === 'f' && !e.metaKey && !e.ctrlKey && !e.altKey && document.activeElement === document.body) {
        e.preventDefault();
        toggleFullScreen();
      }
    };
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullScreen]);

  if (generationError) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background p-6" role="main">
        <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
        <h2 className="text-xl font-bold mb-2 text-foreground">Technical Difficulty</h2>
        <p className="text-foreground-muted mb-6" role="alert" aria-live="polite">{generationError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-surface hover:bg-surface-hover rounded-lg transition-colors border border-border text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  const displayHtml = html || htmlRef.current;

  if (!displayHtml) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background" role="main">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" aria-hidden="true" />
        <p className="text-foreground-muted animate-pulse" aria-live="polite">Initializing course player...</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col h-screen bg-background">
      {/* Minimal Header */}
      {!isFullScreen && (
        <nav className="h-12 bg-surface border-b border-border flex items-center justify-between px-4 shrink-0" aria-label="Course player navigation">
          <Link
            href="/my-courses"
            className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg px-2 py-1"
            aria-label="Back to my courses"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Courses
          </Link>

          <h1 className="text-foreground font-medium truncate max-w-md mx-4 hidden md:block text-sm">
            {courseContent.title}
          </h1>

          <button
            onClick={toggleFullScreen}
            className="p-2 text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </nav>
      )}

      {/* Iframe */}
      <div className="flex-1 w-full bg-white relative" role="main">
        <iframe
          srcDoc={displayHtml}
          className="absolute inset-0 w-full h-full border-0"
          title={`Course Content: ${courseContent.title || 'Course'}`}
          sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups allow-top-navigation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Floating Fullscreen Exit */}
      {isFullScreen && (
        <button
          onClick={toggleFullScreen}
          className="fixed top-4 right-4 z-50 p-3 bg-black/60 hover:bg-black/80 text-white rounded-full shadow-lg backdrop-blur-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label="Exit fullscreen"
        >
          <Minimize2 className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
