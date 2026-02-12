/**
 * Course Builder
 * Combines activities, sections, and templates into a complete SCORM package
 */

import { CourseContent, CourseSection, CourseThemeConfig, Activity } from './activities/types';
import { renderActivity } from './activities/renderer';
import { generateCourseHtml, DEFAULT_THEME } from './templates/courseTemplate';
import { createScormPackage } from './scormService';

/**
 * Builds a complete SCORM package from course content
 */
export function buildScormCourse(
  content: CourseContent,
  theme: CourseThemeConfig = DEFAULT_THEME,
  masteryScore: number = 80
): Record<string, string> {
  const effectiveTheme = content.theme || theme;

  // Generate HTML content from sections and activities
  const htmlContent = generateCourseContent(content);

  // Wrap in course template
  const fullHtml = generateCourseHtml(content.title, htmlContent, effectiveTheme);

  // Create SCORM package with manifest
  return createScormPackage(fullHtml, content.title, masteryScore);
}

/**
 * Generates HTML content from course sections and activities
 */
export function generateCourseContent(content: CourseContent): string {
  let html = '';

  // Sort sections by order
  const sortedSections = [...content.sections].sort((a, b) => a.order - b.order);

  // Build header content (Title + Description)
  let headerHtml = `<h1>${escapeHtml(content.title)}</h1>`;
  if (content.description) {
    headerHtml += `<p class="course-description">${escapeHtml(content.description)}</p>`;
  }

  // Render each section
  sortedSections.forEach((section, index) => {
    const isLastSection = index === sortedSections.length - 1;
    const isFirstSection = index === 0;
    const sectionHeader = isFirstSection ? headerHtml : '';
    html += renderSection(section, isLastSection, sectionHeader);
  });

  return html;
}

/**
 * Renders a single section with all its activities
 */
function renderSection(section: CourseSection, isLastSection: boolean = false, headerContent: string = ''): string {
  let html = `<div class="course-section" id="${section.id}" data-section-order="${section.order}" data-section-title="${escapeHtml(section.title)}" data-start-label="${escapeHtml((section as any).paginatedStartLabel || 'Start')}">`;

  html += headerContent;
  html += `<h2>${escapeHtml(section.title)}</h2>`;

  const sortedActivities = [...(section.activities || [])]
    .filter(a => a && a.type)
    .sort((a, b) => a.order - b.order);

  const lastActivity = sortedActivities[sortedActivities.length - 1];
  const endsWithPageBreak = lastActivity &&
    lastActivity.type === 'divider' &&
    (lastActivity as any).clickToContinue === true;

  html += `<div class="subsection-content subsection-first" data-subsection="true">`;

  sortedActivities.forEach(activity => {
    html += renderActivity(activity);
  });

  if (isLastSection) {
    html += `
      <div class="section-navigation" style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
        <button class="btn btn-success" onclick="completeCourse()">
          ✓ Complete Course
        </button>
      </div>
      <script>
        function completeCourse() {
          if (!window.isSectionComplete || !window.isSectionComplete(window.currentSectionIndex)) {
            window.showCourseToast(
              'warning',
              'Activities Incomplete',
              'Please complete all activities in this section before finishing the course.',
              5000
            );
            return;
          }
          if (typeof window.markSectionComplete === 'function') {
            window.markSectionComplete(window.currentSectionIndex);
          }
          if (typeof setComplete === 'function') {
            setComplete();
          }
          if (typeof window.updateScore === 'function') {
            window.updateScore();
          }
          var progressPercentageEl = document.getElementById('progress-percentage');
          var progressBarFill = document.getElementById('progress-bar-fill');
          if (progressPercentageEl) progressPercentageEl.textContent = '100%';
          if (progressBarFill) progressBarFill.style.width = '100%';
          setTimeout(function() {
            window.showCourseCompletionToast();
          }, 300);
        }
      </script>
    `;
  } else if (!endsWithPageBreak) {
    html += `
      <div class="section-navigation" style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
        <button class="btn next-section-btn" onclick="showNextSection()">
          Continue to Next Section →
        </button>
      </div>
    `;
  }

  html += `</div>`;
  html += `</div>`;

  return html;
}

/**
 * Creates a blank course template
 */
export function createBlankCourse(title: string = 'Untitled Course'): CourseContent {
  return {
    title,
    description: '',
    language: 'en',
    sections: [
      {
        id: generateId(),
        title: 'Introduction',
        order: 0,
        activities: [
          {
            id: generateId(),
            type: 'text_content',
            order: 0,
            content: '<p>Welcome to your new course! Start adding content here.</p>',
          },
        ],
      },
    ],
  };
}

/**
 * Validates course content structure
 */
export function validateCourseContent(content: CourseContent): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!content.title || content.title.trim() === '') {
    errors.push('Course title is required');
  }

  if (!content.sections || content.sections.length === 0) {
    errors.push('Course must have at least one section');
  }

  content.sections.forEach((section, index) => {
    if (!section.title || section.title.trim() === '') {
      errors.push(`Section ${index + 1} is missing a title`);
    }

    if (!section.activities || section.activities.length === 0) {
      errors.push(`Section "${section.title}" has no activities`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
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
