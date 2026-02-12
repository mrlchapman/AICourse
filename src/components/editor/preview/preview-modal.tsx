'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Monitor, Tablet, Smartphone, Palette, ChevronDown } from 'lucide-react';
import { generateCourseContent } from '@/lib/scorm/courseBuilder';
import { generateCourseHtml, DEFAULT_THEME } from '@/lib/scorm/templates/courseTemplate';
import { THEME_PRESETS } from '@/components/editor/theme/theme-modal';
import type { CourseContent, CourseThemeConfig } from '@/types/activities';

interface PreviewModalProps {
  courseContent: CourseContent;
  onUpdateTheme: (theme: CourseThemeConfig) => void;
  onClose: () => void;
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const VIEWPORT_WIDTHS: Record<ViewportSize, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export function PreviewModal({ courseContent, onUpdateTheme, onClose }: PreviewModalProps) {
  const [html, setHtml] = useState('');
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<CourseThemeConfig | undefined>(courseContent.theme);
  const containerRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Close theme picker on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setShowThemePicker(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const applyTheme = (preset: typeof THEME_PRESETS[0]) => {
    const theme: CourseThemeConfig = {
      themePreset: preset.id,
      ...preset.config,
    };
    setPreviewTheme(theme);
    onUpdateTheme(theme);
  };

  useEffect(() => {
    try {
      const processedContent = JSON.parse(JSON.stringify(courseContent));
      if (previewTheme) processedContent.theme = previewTheme;
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
  }, [courseContent, previewTheme]);

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

            {/* Theme picker */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => setShowThemePicker((v) => !v)}
                className="flex items-center gap-1 px-2 py-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-hover rounded-md transition-colors text-xs font-medium"
                title="Change theme"
              >
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {THEME_PRESETS.find((p) => p.id === previewTheme?.themePreset)?.name || 'Theme'}
                </span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {showThemePicker && (
                <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-xl p-2 w-52 z-50">
                  <p className="text-[10px] font-semibold text-foreground-subtle uppercase tracking-wider px-2 py-1">
                    Theme
                  </p>
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        applyTheme(preset);
                        setShowThemePicker(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-colors ${
                        previewTheme?.themePreset === preset.id
                          ? 'bg-primary-light text-primary'
                          : 'text-foreground hover:bg-surface-hover'
                      }`}
                    >
                      <div className="flex gap-0.5 shrink-0">
                        <div className="w-3 h-3 rounded-full border border-border/50" style={{ backgroundColor: preset.preview.bg }} />
                        <div className="w-3 h-3 rounded-full border border-border/50" style={{ backgroundColor: preset.preview.primary }} />
                      </div>
                      <div>
                        <p className="text-xs font-medium">{preset.name}</p>
                        <p className="text-[10px] text-foreground-muted">{preset.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
