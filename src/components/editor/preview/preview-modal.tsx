'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Monitor, Tablet, Smartphone } from 'lucide-react';
import { generateCourseContent } from '@/lib/scorm/courseBuilder';
import { generateCourseHtml, DEFAULT_THEME } from '@/lib/scorm/templates/courseTemplate';
import type { CourseContent } from '@/types/activities';

interface PreviewModalProps {
  courseContent: CourseContent;
  onClose: () => void;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_WIDTHS: Record<ViewportSize, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export function PreviewModal({ courseContent, onClose }: PreviewModalProps) {
  const [html, setHtml] = useState('');
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const processedContent = JSON.parse(JSON.stringify(courseContent));
      const innerHtml = generateCourseContent(processedContent);
      const fullHtml = generateCourseHtml(
        processedContent.title || 'Preview',
        innerHtml,
        processedContent.theme || DEFAULT_THEME
      );

      // Add a mock SCORM API so the preview doesn't error
      const mockApi = `
<script>
  window.API = {
    LMSInitialize: function() { return "true"; },
    LMSFinish: function() { return "true"; },
    LMSGetValue: function() { return ""; },
    LMSSetValue: function() { return "true"; },
    LMSCommit: function() { return "true"; },
    LMSGetLastError: function() { return "0"; },
    LMSGetErrorString: function() { return ""; },
    LMSGetDiagnostic: function() { return ""; },
  };
</script>`;

      setHtml(fullHtml.replace('</head>', `${mockApi}</head>`));
    } catch (e: any) {
      console.error('Preview generation error:', e);
      setHtml(`<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#666;"><div><h2>Preview Error</h2><p>${e.message}</p></div></body></html>`);
    }
  }, [courseContent]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
      <div
        ref={containerRef}
        className="bg-background w-full h-full flex flex-col"
      >
        {/* Header */}
        <div className="h-12 bg-surface border-b border-border flex items-center justify-between px-4 shrink-0">
          <h2 className="text-sm font-semibold text-foreground">
            Preview: {courseContent.title}
          </h2>

          <div className="flex items-center gap-2">
            {/* Viewport switcher */}
            <div className="flex items-center gap-0.5 bg-surface-hover rounded-lg p-0.5">
              <button
                onClick={() => setViewport('desktop')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewport === 'desktop' ? 'bg-primary text-primary-foreground' : 'text-foreground-muted hover:text-foreground'
                }`}
                title="Desktop"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewport('tablet')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewport === 'tablet' ? 'bg-primary text-primary-foreground' : 'text-foreground-muted hover:text-foreground'
                }`}
                title="Tablet"
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewport('mobile')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewport === 'mobile' ? 'bg-primary text-primary-foreground' : 'text-foreground-muted hover:text-foreground'
                }`}
                title="Mobile"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={toggleFullScreen}
              className="p-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-md transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-md transition-colors"
              title="Close Preview"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-neutral-100 flex items-start justify-center overflow-auto p-4">
          <div
            className="bg-white shadow-lg transition-all duration-300 h-full"
            style={{
              width: VIEWPORT_WIDTHS[viewport],
              maxWidth: '100%',
            }}
          >
            {html ? (
              <iframe
                srcDoc={html}
                className="w-full h-full border-0"
                title="Course Preview"
                sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-popups"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
