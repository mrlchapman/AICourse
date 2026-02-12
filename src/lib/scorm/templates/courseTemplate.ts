/**
 * Base HTML Template for SCORM Courses
 * Includes SCORM API, styling, and interactive functionality
 */

import { SCORM_API_WRAPPER, STANDALONE_API_WRAPPER } from './scormApi';
import { INTERACTION_LOGIC_JS } from './interactionLogic';
import { LIVE_ACTIVITY_LOGIC } from './liveLogic';
import { CourseThemeConfig } from '../activities/types';

export const DEFAULT_THEME: CourseThemeConfig = {
  themePreset: 'dark',
  primaryColor: '#6366f1',
  backgroundColor: '#0f172a',
  textColor: '#f1f5f9',
  fontFamily: 'Inter, sans-serif',
};

export const LIGHT_THEME: CourseThemeConfig = {
  themePreset: 'light',
  primaryColor: '#6366f1',
  backgroundColor: '#f8fafc',
  textColor: '#1e293b',
  fontFamily: 'Inter, sans-serif',
};

/**
 * Generates the complete HTML document for a SCORM course
 * @param standaloneMode - If true, uses localStorage for progress instead of SCORM API
 */
export function generateCourseHtml(
  title: string,
  content: string,
  theme: CourseThemeConfig = DEFAULT_THEME,
  standaloneMode: boolean = false
): string {
  const headerImageHtml = theme.headerImageUrl
    ? `<div class="header-image-wrapper"><img src="${escapeHtml(theme.headerImageUrl)}" alt="Course Header" class="course-header-image" style="object-position: center ${theme.headerImageVerticalPosition ?? 50}%"><div class="header-overlay"></div></div>`
    : '';

  // Font import based on selection - supports sans, serif, and editorial fonts
  let fontImport = '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");';
  if (theme.fontFamily.includes('Roboto')) {
    fontImport = '@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap");';
  } else if (theme.fontFamily.includes('DM Sans')) {
    fontImport = '@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap");';
  } else if (theme.fontFamily.includes('Source Sans')) {
    fontImport = '@import url("https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700&display=swap");';
  } else if (theme.fontFamily.includes('Libre Baskerville')) {
    fontImport = '@import url("https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap");';
  } else if (theme.fontFamily.includes('Playfair Display')) {
    fontImport = '@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500&display=swap");';
  } else if (theme.fontFamily.includes('Cormorant Garamond')) {
    fontImport = '@import url("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&display=swap");';
  } else if (theme.fontFamily.includes('Lora')) {
    fontImport = '@import url("https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap");';
  } else if (theme.fontFamily.includes('Merriweather')) {
    fontImport = '@import url("https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap");';
  } else if (theme.fontFamily.includes('Outfit')) {
    fontImport = '@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap");';
  }

  // Check if this is an editorial theme
  const isEditorialTheme = theme.themePreset === 'editorial' || theme.themePreset === 'editorial-dark';

  // Check if this is the accessible theme
  const isAccessibleTheme = theme.themePreset === 'accessible';

  // Check if this is the holographic theme
  const isHolographicTheme = theme.themePreset === 'holographic';

  // Determine if using dark or light theme - prefer themePreset
  const isDarkTheme = theme.themePreset === 'light' || theme.themePreset === 'editorial' || theme.themePreset === 'accessible' ? false : (
    theme.themePreset === 'dark' || theme.themePreset === 'editorial-dark' ? true : (
      theme.backgroundColor.startsWith('#0') ||
      theme.backgroundColor.startsWith('#1') ||
      theme.backgroundColor.startsWith('#2') ||
      theme.backgroundColor.includes('rgb(0') ||
      theme.backgroundColor.includes('rgb(1') ||
      theme.backgroundColor.includes('rgb(2')
    )
  );

  // Light theme specific colors
  const lightThemeVars = `
    --primary: ${theme.primaryColor};
    --primary-light: ${theme.primaryColor}15;
    --primary-glow: ${theme.primaryColor}40;
    --bg: ${theme.backgroundColor};
    --bg-gradient-1: #f8fafc;
    --bg-gradient-2: #eef2ff;
    --text: ${theme.textColor};
    --card-bg: #ffffff;
    --card-border: rgba(226, 232, 240, 1);
    --card-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    --text-muted: #64748b;
    --surface: rgba(241, 245, 249, 0.9);
    --surface-solid: #f1f5f9;
    --border: rgba(203, 213, 225, 0.8);
    --success: #10b981;
    --success-light: rgba(16, 185, 129, 0.12);
    --error: #ef4444;
    --error-light: rgba(239, 68, 68, 0.12);
    --warning: #f59e0b;
    --sidebar-bg: rgba(255, 255, 255, 0.9);
    --sidebar-hover: rgba(99, 102, 241, 0.1);
    --btn-bg: var(--primary);
    --btn-text: #ffffff;
  `;

  // Dark theme specific colors
  const darkThemeVars = `
    --primary: ${theme.primaryColor};
    --primary-light: ${theme.primaryColor}25;
    --primary-glow: ${theme.primaryColor}55;
    --bg: ${theme.backgroundColor};
    --bg-gradient-1: #0f172a;
    --bg-gradient-2: #1e1b4b;
    --text: ${theme.textColor};
    --card-bg: rgba(30, 41, 59, 0.9);
    --card-border: rgba(148, 163, 184, 0.15);
    --card-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    --text-muted: #94a3b8;
    --surface: rgba(51, 65, 85, 0.5);
    --surface-solid: #1e293b;
    --border: rgba(71, 85, 105, 0.5);
    --success: #10b981;
    --success-light: rgba(16, 185, 129, 0.2);
    --error: #ef4444;
    --error-light: rgba(239, 68, 68, 0.2);
    --warning: #f59e0b;
    --sidebar-bg: rgba(15, 23, 42, 0.85);
    --sidebar-hover: rgba(99, 102, 241, 0.15);
    --btn-bg: var(--primary);
    --btn-text: #ffffff;
  `;

  // Editorial Light theme - warm ivory magazine aesthetic
  const editorialLightThemeVars = `
    --primary: ${theme.primaryColor};
    --primary-light: ${theme.primaryColor}18;
    --primary-glow: ${theme.primaryColor}35;
    --bg: ${theme.backgroundColor};
    --bg-gradient-1: #FEFDFB;
    --bg-gradient-2: #FAF8F5;
    --text: ${theme.textColor};
    --card-bg: rgba(255, 255, 255, 0.92);
    --card-border: rgba(139, 115, 85, 0.12);
    --card-shadow: 0 2px 12px rgba(28, 25, 23, 0.06);
    --text-muted: #78716c;
    --surface: rgba(250, 248, 245, 0.95);
    --surface-solid: #FAF8F5;
    --border: rgba(214, 211, 209, 0.6);
    --success: #059669;
    --success-light: rgba(5, 150, 105, 0.1);
    --error: #dc2626;
    --error-light: rgba(220, 38, 38, 0.1);
    --warning: #d97706;
    --sidebar-bg: rgba(254, 253, 251, 0.95);
    --sidebar-hover: ${theme.primaryColor}12;
    --btn-bg: var(--primary);
    --btn-text: #ffffff;
    --editorial-rule: ${theme.primaryColor}30;
    --editorial-accent: ${theme.primaryColor};
  `;

  // Editorial Dark theme - luxury magazine aesthetic
  const editorialDarkThemeVars = `
    --primary: ${theme.primaryColor};
    --primary-light: ${theme.primaryColor}20;
    --primary-glow: ${theme.primaryColor}45;
    --bg: ${theme.backgroundColor};
    --bg-gradient-1: #0D0D0D;
    --bg-gradient-2: #141414;
    --text: ${theme.textColor};
    --card-bg: rgba(20, 20, 20, 0.85);
    --card-border: rgba(201, 169, 98, 0.15);
    --card-shadow: 0 4px 24px rgba(0, 0, 0, 0.5);
    --text-muted: #a8a29e;
    --surface: rgba(28, 28, 28, 0.9);
    --surface-solid: #1c1c1c;
    --border: rgba(64, 64, 64, 0.6);
    --success: #10b981;
    --success-light: rgba(16, 185, 129, 0.15);
    --error: #f87171;
    --error-light: rgba(248, 113, 113, 0.15);
    --warning: #fbbf24;
    --sidebar-bg: rgba(13, 13, 13, 0.95);
    --sidebar-hover: ${theme.primaryColor}18;
    --btn-bg: var(--primary);
    --btn-text: #0D0D0D;
    --editorial-rule: ${theme.primaryColor}40;
    --editorial-accent: ${theme.primaryColor};
  `;

  // Accessible theme - WCAG AAA compliant high contrast
  const accessibleThemeVars = `
    --primary: #003366;
    --primary-light: #00336615;
    --primary-glow: #00336640;
    --bg: #FFFFFF;
    --bg-gradient-1: #FFFFFF;
    --bg-gradient-2: #F5F5F5;
    --text: #0A0A0A;
    --card-bg: #FFFFFF;
    --card-border: #666666;
    --card-shadow: none;
    --text-muted: #424242;
    --surface: #F5F5F5;
    --surface-solid: #F5F5F5;
    --border: #666666;
    --success: #1B4D2E;
    --success-light: #1B4D2E15;
    --error: #8B0000;
    --error-light: #8B000015;
    --warning: #8B4513;
    --sidebar-bg: #FFFFFF;
    --sidebar-hover: #00336612;
    --btn-bg: #003366;
    --btn-text: #FFFFFF;
    --accessible-accent: #003366;
    --accessible-focus: #003366;
  `;

  // Holographic theme - iridescent rainbow shimmer
  const holographicThemeVars = `
    --primary: #9D6BFF;
    --primary-light: rgba(157, 107, 255, 0.15);
    --primary-glow: rgba(157, 107, 255, 0.4);
    --bg: #F8F9FC;
    --bg-gradient-1: #F8F9FC;
    --bg-gradient-2: #F0F1F5;
    --text: #1A1A2E;
    --card-bg: #FFFFFF;
    --card-border: rgba(157, 107, 255, 0.2);
    --card-shadow: 0 8px 32px rgba(157, 107, 255, 0.15);
    --text-muted: #4A4A6A;
    --surface: #F0F1F5;
    --surface-solid: #F0F1F5;
    --border: rgba(26, 26, 46, 0.1);
    --success: #4ADE80;
    --success-light: rgba(74, 222, 128, 0.15);
    --error: #FF6B6B;
    --error-light: rgba(255, 107, 107, 0.15);
    --warning: #FFD700;
    --sidebar-bg: rgba(255, 255, 255, 0.95);
    --sidebar-hover: rgba(157, 107, 255, 0.12);
    --btn-bg: var(--primary);
    --btn-text: #FFFFFF;
    /* Holographic spectrum colors */
    --holo-1: #FF6B9D;
    --holo-2: #FF8A80;
    --holo-3: #FFD700;
    --holo-4: #B8FF6B;
    --holo-5: #6BFFF8;
    --holo-6: #6BB8FF;
    --holo-7: #B86BFF;
    --holo-8: #FF6BEB;
  `;

  // Light theme background CSS
  const lightBgStyles = `
    /* Light theme: Clean flat gradient */
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
      pointer-events: none;
      z-index: -2;
    }
  `;

  // Dark theme background CSS
  const darkBgStyles = `
    /* Dark theme: Static subtle radial gradient */
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
        radial-gradient(ellipse 80% 50% at 50% 0%, ${theme.primaryColor}12, transparent 60%),
        linear-gradient(180deg, #0f172a 0%, #0f172a 100%);
      pointer-events: none;
      z-index: -1;
    }
  `;

  // Editorial Light background CSS - clean, minimal magazine aesthetic
  const editorialLightBgStyles = `
    /* Editorial Light: Warm paper texture with subtle grain */
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(180deg, #FEFDFB 0%, #FAF8F5 100%);
      pointer-events: none;
      z-index: -2;
    }

    /* Subtle paper texture overlay */
    body::after {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      opacity: 0.015;
      pointer-events: none;
      z-index: -1;
    }
  `;

  // Editorial Dark background CSS - luxury magazine aesthetic
  const editorialDarkBgStyles = `
    /* Editorial Dark: Deep black with subtle gold accents */
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
        radial-gradient(ellipse 100% 60% at 50% 0%, ${theme.primaryColor}08, transparent 50%),
        linear-gradient(180deg, #0D0D0D 0%, #141414 50%, #0D0D0D 100%);
      pointer-events: none;
      z-index: -2;
    }

    /* Subtle luxury texture */
    body::after {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      opacity: 0.03;
      pointer-events: none;
      z-index: -1;
    }
  `;

  // Accessible theme background CSS - minimal, solid white for maximum clarity
  const accessibleBgStyles = `
    /* Accessible: Pure solid white background - no decorative elements */
    body {
      background: #FFFFFF !important;
    }

    body::before,
    body::after {
      display: none !important;
    }
  `;

  // Holographic theme background CSS - iridescent floating blobs
  const holographicBgStyles = `
    /* Holographic: Animated gradient blobs with light refraction effect */
    body::before {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
        radial-gradient(ellipse 60% 40% at 10% 20%, rgba(255, 107, 157, 0.15), transparent 50%),
        radial-gradient(ellipse 50% 35% at 90% 30%, rgba(107, 255, 248, 0.12), transparent 50%),
        radial-gradient(ellipse 45% 30% at 50% 80%, rgba(184, 107, 255, 0.1), transparent 50%),
        radial-gradient(ellipse 40% 25% at 70% 60%, rgba(255, 215, 0, 0.08), transparent 50%),
        linear-gradient(135deg, #F8F9FC 0%, #F0F1F5 50%, #F8F9FC 100%);
      pointer-events: none;
      z-index: -2;
      animation: holoFloat1 20s ease-in-out infinite;
    }

    body::after {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background:
        radial-gradient(ellipse 55% 35% at 80% 10%, rgba(255, 107, 235, 0.1), transparent 50%),
        radial-gradient(ellipse 50% 30% at 20% 70%, rgba(107, 184, 255, 0.1), transparent 50%),
        radial-gradient(ellipse 40% 25% at 60% 40%, rgba(184, 255, 107, 0.08), transparent 50%);
      pointer-events: none;
      z-index: -1;
      animation: holoFloat2 25s ease-in-out infinite;
    }

    @keyframes holoFloat1 {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      25% { transform: translate(20px, 15px) rotate(2deg); }
      50% { transform: translate(-15px, 25px) rotate(-2deg); }
      75% { transform: translate(10px, -10px) rotate(1deg); }
    }

    @keyframes holoFloat2 {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      33% { transform: translate(-25px, -15px) rotate(-3deg); }
      66% { transform: translate(15px, 20px) rotate(2deg); }
    }
  `;

  // Editorial-specific CSS for typography and styling
  const editorialStyles = isEditorialTheme ? `
    /* Editorial Theme Enhancements */

    /* Refined heading typography */
    h1 {
      font-weight: 700 !important;
      letter-spacing: -0.03em !important;
      background: none !important;
      -webkit-background-clip: unset !important;
      -webkit-text-fill-color: var(--text) !important;
      background-clip: unset !important;
      text-shadow: none !important;
      animation: none !important;
      line-height: 1.1 !important;
    }

    /* Editorial rule under h1 */
    h1::after {
      content: '';
      display: block;
      width: 60px;
      height: 3px;
      background: var(--editorial-accent);
      margin-top: 20px;
      margin-bottom: 8px;
    }

    /* Section headers with editorial styling - prominent magazine chapter heading */
    .course-section > h2 {
      background: transparent !important;
      backdrop-filter: none !important;
      border: none !important;
      border-left: 4px solid var(--editorial-accent) !important;
      border-bottom: none !important;
      border-radius: 0 !important;
      padding: 8px 0 8px 20px !important;
      margin-bottom: 32px !important;
      box-shadow: none !important;
      font-weight: 700 !important;
      letter-spacing: -0.01em !important;
      text-transform: none !important;
      font-size: 1.5rem !important;
      color: var(--text) !important;
      line-height: 1.3 !important;
    }

    .course-section > h2::before {
      display: none !important;
    }

    .course-section > h2::after {
      content: '';
      display: block;
      width: 100%;
      height: 1px;
      background: var(--editorial-rule);
      margin-top: 16px;
    }

    /* Content cards with editorial styling */
    .activity {
      background: var(--card-bg) !important;
      backdrop-filter: none !important;
      border: 1px solid var(--card-border) !important;
      border-radius: 4px !important;
      box-shadow: var(--card-shadow) !important;
      padding: 32px 36px !important; /* More generous padding for editorial feel */
    }

    .activity:hover {
      border-color: var(--editorial-accent) !important;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important;
    }

    /* Text content - NO border, NO background, clean reading experience */
    .activity.text-content,
    .text-content {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
    }

    .activity.text-content:hover,
    .text-content:hover {
      border: none !important;
      box-shadow: none !important;
    }

    .text-content p,
    .text-content h2,
    .text-content h3,
    .text-content h4,
    .text-content ul,
    .text-content ol {
      max-width: 680px; /* Optimal reading width */
    }

    /* Refined button styling for editorial */
    .btn {
      background: var(--editorial-accent) !important;
      border-radius: 2px !important;
      box-shadow: none !important;
      text-transform: uppercase !important;
      letter-spacing: 0.1em !important;
      font-size: 0.8rem !important;
      font-weight: 600 !important;
      padding: 14px 32px !important;
    }

    .btn::before {
      display: none !important;
    }

    .btn:hover {
      transform: none !important;
      opacity: 0.9 !important;
      box-shadow: none !important;
    }

    /* Progress bar - refined editorial style */
    .progress-bar {
      border-radius: 0 !important;
      height: 3px !important;
    }

    .progress-bar-fill,
    .progress-fill {
      background: var(--editorial-accent) !important;
      animation: none !important;
    }

    /* Sidebar refinements */
    .progress-sidebar {
      border-right: 1px solid var(--border) !important;
      backdrop-filter: none !important;
    }

    .progress-sidebar-header {
      background: transparent !important;
    }

    .section-item {
      border-radius: 2px !important;
    }

    .section-icon {
      border-radius: 2px !important;
    }

    /* Image styling */
    img {
      border-radius: 2px !important;
    }

    /* Mobile toggle */
    .mobile-toggle {
      border-radius: 2px !important;
      backdrop-filter: none !important;
    }

    /* Description styling */
    .course-description {
      font-style: italic !important;
      border-bottom: 1px solid var(--editorial-rule) !important;
    }

    /* Blockquotes and pull quotes */
    blockquote {
      border-left: 3px solid var(--editorial-accent) !important;
      padding-left: 24px !important;
      margin: 32px 0 !important;
      font-style: italic !important;
      color: var(--text-muted) !important;
    }

    /* Links */
    a {
      color: var(--editorial-accent) !important;
      text-decoration: underline !important;
      text-underline-offset: 3px !important;
    }

    a:hover {
      opacity: 0.8 !important;
    }

    /* Section navigation / Continue button container */
    .section-navigation {
      border: 1px dashed var(--editorial-rule) !important;
      border-top: 1px solid var(--editorial-rule) !important;
      border-radius: 4px !important;
      background: transparent !important;
    }

    .section-navigation .btn,
    .next-section-btn {
      background: var(--editorial-accent) !important;
      color: var(--btn-text) !important;
    }

    /* Click-to-continue divider button - editorial style */
    .continue-divider-content {
      background: var(--primary-light) !important;
      border: 1px dashed var(--editorial-rule) !important;
      border-radius: 4px !important;
    }

    .continue-divider-btn {
      background: var(--editorial-accent) !important;
      color: var(--btn-text) !important;
      border-radius: 4px !important;
      box-shadow: none !important;
    }

    .continue-divider-btn:hover {
      transform: none !important;
      opacity: 0.9 !important;
      box-shadow: none !important;
    }

    .continue-divider-btn::before {
      display: none !important;
    }

    /* Knowledge check and quiz options */
    .kc-option,
    .quiz-option {
      border: 1px solid var(--border) !important;
      border-radius: 4px !important;
      background: var(--surface) !important;
    }

    .kc-option:hover,
    .quiz-option:hover {
      border-color: var(--editorial-accent) !important;
      background: var(--primary-light) !important;
    }

    .kc-option.selected,
    .quiz-option.selected {
      border-color: var(--editorial-accent) !important;
      background: var(--primary-light) !important;
    }

    /* Score panel - use editorial colors */
    .score-panel,
    .quiz-score-panel {
      background: var(--editorial-accent) !important;
      border-radius: 4px !important;
    }

    /* Flashcard refinements for editorial */
    .fc-activity {
      --fc-accent: var(--editorial-accent) !important;
      --fc-accent-secondary: var(--editorial-accent) !important;
    }

    .fc-face {
      border-radius: 4px !important;
    }

    .fc-btn {
      border-radius: 4px !important;
    }

    .fc-dot.active {
      background: var(--editorial-accent) !important;
      border-color: var(--editorial-accent) !important;
    }

    /* Gamification activities - transparent, let games have their own styling */
    .gamification-activity {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      padding: 0 !important;
    }

    .gamification-activity:hover {
      border: none !important;
      box-shadow: none !important;
    }

    /* Preserve game container and title styling - don't override with theme styles */
    .chase-container,
    .mill-container {
      color: #e0e6ed !important;
      -webkit-text-fill-color: #e0e6ed !important;
    }

    .chase-logo {
      color: #e0e8f0 !important;
      -webkit-text-fill-color: #e0e8f0 !important;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5) !important;
    }

    .chase-logo span {
      color: #ff6b6b !important;
      -webkit-text-fill-color: #ff6b6b !important;
      text-shadow: 0 0 30px rgba(255, 107, 107, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.5) !important;
    }

    .mill-logo {
      color: #e0e8f0 !important;
      -webkit-text-fill-color: #e0e8f0 !important;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5) !important;
    }

    .mill-logo span {
      color: #ffd700 !important;
      -webkit-text-fill-color: #ffd700 !important;
      text-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.5) !important;
    }
  ` : '';

  // Accessible theme-specific CSS for WCAG AAA compliance
  const accessibleStyles = isAccessibleTheme ? `
    /* Accessible Theme - WCAG AAA Compliant Overrides */

    /* Base typography - larger, more readable */
    body {
      font-size: 18px !important;
      line-height: 1.6 !important;
      letter-spacing: 0.02em !important;
      font-weight: 400 !important;
    }

    /* Remove all gradient text - use solid colors */
    h1 {
      background: none !important;
      -webkit-background-clip: unset !important;
      -webkit-text-fill-color: #0A0A0A !important;
      background-clip: unset !important;
      text-shadow: none !important;
      animation: none !important;
      font-size: 2.5rem !important;
      font-weight: 700 !important;
      letter-spacing: -0.02em !important;
    }

    /* High-contrast section headers */
    .course-section > h2 {
      background: #F5F5F5 !important;
      backdrop-filter: none !important;
      border: 2px solid #666666 !important;
      border-left: 4px solid #003366 !important;
      border-radius: 4px !important;
      box-shadow: none !important;
      color: #0A0A0A !important;
      font-weight: 700 !important;
    }

    /* Activity cards - visible borders, no shadows */
    .activity {
      background: #FFFFFF !important;
      backdrop-filter: none !important;
      border: 2px solid #666666 !important;
      border-radius: 4px !important;
      box-shadow: none !important;
      padding: 24px 28px !important;
    }

    .activity:hover {
      border-color: #003366 !important;
      box-shadow: none !important;
    }

    /* Text content - clean reading */
    .text-content {
      background: transparent !important;
      border: none !important;
      padding: 0 !important;
    }

    .text-content:hover {
      border: none !important;
    }

    /* Underlined links - not just color-differentiated */
    a {
      color: #003366 !important;
      text-decoration: underline !important;
      text-underline-offset: 3px !important;
      text-decoration-thickness: 2px !important;
    }

    a:hover {
      text-decoration-thickness: 3px !important;
    }

    /* Clear focus states - 3px solid outline */
    button:focus-visible,
    a:focus-visible,
    input:focus-visible,
    select:focus-visible,
    textarea:focus-visible,
    [tabindex]:focus-visible {
      outline: 3px solid #003366 !important;
      outline-offset: 2px !important;
    }

    /* Large touch targets - minimum 44px */
    .btn {
      min-height: 44px !important;
      min-width: 44px !important;
      padding: 12px 24px !important;
      background: #003366 !important;
      color: #FFFFFF !important;
      border-radius: 4px !important;
      box-shadow: none !important;
      font-weight: 600 !important;
      text-transform: none !important;
      letter-spacing: normal !important;
    }

    .btn::before {
      display: none !important;
    }

    .btn:hover {
      background: #002244 !important;
      transform: none !important;
      box-shadow: none !important;
    }

    /* Disable all decorative animations - respect reduced motion */
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }

    /* Keep functional transitions for focus indicators */
    button:focus-visible,
    a:focus-visible {
      transition-duration: 0ms !important;
    }

    /* Progress bar - simple, high contrast */
    .progress-bar {
      border: 1px solid #666666 !important;
      border-radius: 2px !important;
      height: 8px !important;
      background: #F5F5F5 !important;
    }

    .progress-bar-fill,
    .progress-fill {
      background: #003366 !important;
      animation: none !important;
    }

    /* Sidebar - high contrast */
    .progress-sidebar {
      background: #FFFFFF !important;
      backdrop-filter: none !important;
      border-right: 2px solid #666666 !important;
    }

    .section-item {
      border: 1px solid transparent !important;
      border-radius: 4px !important;
    }

    .section-item:hover:not(.locked) {
      background: #F5F5F5 !important;
      border-color: #666666 !important;
    }

    .section-item.current {
      background: #00336615 !important;
      border: 2px solid #003366 !important;
      box-shadow: none !important;
    }

    .section-icon {
      border-radius: 4px !important;
    }

    .section-icon.completed {
      background: #1B4D2E !important;
      box-shadow: none !important;
    }

    .section-icon.current,
    .section-icon.unlocked {
      background: #00336620 !important;
      border: 2px solid #003366 !important;
    }

    /* Knowledge check and quiz options - high contrast */
    .kc-option,
    .quiz-option {
      border: 2px solid #666666 !important;
      border-radius: 4px !important;
      background: #FFFFFF !important;
      min-height: 44px !important;
    }

    .kc-option:hover,
    .quiz-option:hover {
      border-color: #003366 !important;
      background: #F5F5F5 !important;
    }

    .kc-option.selected,
    .quiz-option.selected {
      border-color: #003366 !important;
      background: #00336615 !important;
    }

    /* Feedback - clear success/error states */
    .kc-feedback.correct {
      background: #1B4D2E15 !important;
      color: #1B4D2E !important;
      border: 2px solid #1B4D2E !important;
    }

    .kc-feedback.incorrect {
      background: #8B000015 !important;
      color: #8B0000 !important;
      border: 2px solid #8B0000 !important;
    }

    /* Info panels - high contrast variants */
    .info-panel {
      border: 2px solid #666666 !important;
      border-radius: 4px !important;
    }

    /* Mobile toggle */
    .mobile-toggle {
      border: 2px solid #666666 !important;
      border-radius: 4px !important;
      backdrop-filter: none !important;
      background: #FFFFFF !important;
      min-width: 44px !important;
      min-height: 44px !important;
    }

    /* Images - visible border */
    img {
      border: 1px solid #66666640 !important;
      border-radius: 4px !important;
    }

    img.course-header-image {
      border: none !important;
      border-radius: 0 !important;
    }

    /* Flashcard refinements */
    .fc-face {
      border: 2px solid #666666 !important;
      border-radius: 4px !important;
    }

    .fc-btn {
      min-height: 44px !important;
      border: 2px solid #666666 !important;
    }

    /* Section navigation */
    .section-navigation {
      border-top: 2px solid #666666 !important;
    }

    /* Scrollbar - visible */
    ::-webkit-scrollbar {
      width: 12px !important;
    }

    ::-webkit-scrollbar-track {
      background: #F5F5F5 !important;
      border: 1px solid #666666 !important;
    }

    ::-webkit-scrollbar-thumb {
      background: #666666 !important;
      border-radius: 2px !important;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #424242 !important;
    }

    /* Gamification activities - visible borders */
    .gamification-activity {
      background: #FFFFFF !important;
      border: 2px solid #666666 !important;
      border-radius: 4px !important;
      padding: 16px !important;
    }

    /* Preserve game container and title styling - games have their own dark backgrounds */
    .chase-container,
    .mill-container {
      color: #e0e6ed !important;
      -webkit-text-fill-color: #e0e6ed !important;
    }

    .chase-logo {
      color: #e0e8f0 !important;
      -webkit-text-fill-color: #e0e8f0 !important;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5) !important;
    }

    .chase-logo span {
      color: #ff6b6b !important;
      -webkit-text-fill-color: #ff6b6b !important;
      text-shadow: 0 0 30px rgba(255, 107, 107, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.5) !important;
    }

    .mill-logo {
      color: #e0e8f0 !important;
      -webkit-text-fill-color: #e0e8f0 !important;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5) !important;
    }

    .mill-logo span {
      color: #ffd700 !important;
      -webkit-text-fill-color: #ffd700 !important;
      text-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.5) !important;
    }

    /* Disable confetti and other visual effects */
    .confetti-container,
    .confetti {
      display: none !important;
    }

    /* Click-to-continue divider */
    .continue-divider-content {
      background: #F5F5F5 !important;
      border: 2px solid #666666 !important;
      border-radius: 4px !important;
    }

    .continue-divider-btn {
      background: #003366 !important;
      color: #FFFFFF !important;
      border-radius: 4px !important;
    }
  ` : '';

  // Holographic theme-specific CSS with rainbow effects
  const holographicStyles = isHolographicTheme ? `
    /* Holographic Theme Enhancements */

    /* Prismatic h1 with animated rainbow gradient */
    h1 {
      background: linear-gradient(
        90deg,
        #FF6B9D, #FFD700, #6BFFF8, #B86BFF, #FF6BEB, #FF6B9D
      ) !important;
      background-size: 300% 100% !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      background-clip: text !important;
      animation: holoShift 8s linear infinite !important;
      text-shadow: none !important;
    }

    @keyframes holoShift {
      0% { background-position: 0% 50%; }
      100% { background-position: 300% 50%; }
    }

    /* Rainbow border cards */
    .activity {
      position: relative !important;
      border: 2px solid transparent !important;
      background: linear-gradient(#fff, #fff) padding-box,
                  linear-gradient(90deg, #FF6B9D, #FFD700, #6BFFF8, #B86BFF, #FF6BEB) border-box !important;
      background-size: 100% 100%, 400% 100% !important;
      animation: holoBorder 6s linear infinite !important;
      border-radius: 16px !important;
    }

    @keyframes holoBorder {
      0% { background-position: 0% 0%, 0% 50%; }
      100% { background-position: 0% 0%, 400% 50%; }
    }

    .activity:hover {
      box-shadow: 0 12px 40px rgba(157, 107, 255, 0.25) !important;
    }

    /* Text content - clean, no border animation */
    .text-content {
      background: transparent !important;
      border: none !important;
      animation: none !important;
    }

    .text-content:hover {
      box-shadow: none !important;
    }

    /* Section headers with holographic styling */
    .course-section > h2 {
      background: linear-gradient(#fff, #fff) padding-box,
                  linear-gradient(90deg, var(--holo-1), var(--holo-3), var(--holo-5), var(--holo-7)) border-box !important;
      border: 2px solid transparent !important;
      background-size: 100% 100%, 300% 100% !important;
      animation: holoBorder 5s linear infinite !important;
      border-radius: 12px !important;
      border-left: none !important;
    }

    .course-section > h2::before {
      display: none !important;
    }

    /* Shimmer button hover effect */
    .btn {
      background: linear-gradient(135deg, var(--primary), #B86BFF) !important;
      position: relative !important;
      overflow: hidden !important;
    }

    .btn::after {
      content: '' !important;
      position: absolute !important;
      top: 0 !important;
      left: -100% !important;
      width: 100% !important;
      height: 100% !important;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,0.4),
        transparent
      ) !important;
      transition: left 0.5s !important;
    }

    .btn:hover::after {
      left: 100% !important;
    }

    /* Iridescent progress bar */
    .progress-bar-fill,
    .progress-fill {
      background: linear-gradient(
        90deg,
        #FF6B9D, #FFD700, #6BFFF8, #B86BFF, #FF6BEB
      ) !important;
      background-size: 200% 100% !important;
      animation: holoProgress 2s linear infinite !important;
    }

    @keyframes holoProgress {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }

    /* Sidebar with subtle holographic touch */
    .progress-sidebar {
      background: rgba(255, 255, 255, 0.95) !important;
      border-right: 2px solid transparent !important;
      background: linear-gradient(rgba(255,255,255,0.98), rgba(255,255,255,0.98)) padding-box,
                  linear-gradient(180deg, #FF6B9D40, #6BFFF840, #B86BFF40) border-box !important;
    }

    .section-item.current {
      background: linear-gradient(#fff, #fff) padding-box,
                  linear-gradient(90deg, var(--holo-1), var(--holo-5), var(--holo-7)) border-box !important;
      border: 2px solid transparent !important;
      box-shadow: 0 0 20px rgba(157, 107, 255, 0.2) !important;
    }

    .section-icon.completed {
      background: linear-gradient(135deg, #4ADE80, #6BFFF8) !important;
    }

    .section-icon.current,
    .section-icon.unlocked {
      background: linear-gradient(135deg, rgba(157, 107, 255, 0.15), rgba(107, 255, 248, 0.15)) !important;
      border: 2px solid var(--primary) !important;
    }

    /* Knowledge check and quiz options */
    .kc-option,
    .quiz-option {
      border: 2px solid var(--border) !important;
      transition: all 0.3s ease !important;
    }

    .kc-option:hover,
    .quiz-option:hover {
      border-color: transparent !important;
      background: linear-gradient(#fff, #fff) padding-box,
                  linear-gradient(90deg, var(--holo-1), var(--holo-3), var(--holo-5)) border-box !important;
    }

    /* Flashcard with holographic effect */
    .fc-face {
      background: linear-gradient(#fff, #fff) padding-box,
                  linear-gradient(90deg, #FF6B9D, #FFD700, #6BFFF8, #B86BFF) border-box !important;
      border: 2px solid transparent !important;
      background-size: 100% 100%, 300% 100% !important;
      animation: holoBorder 4s linear infinite !important;
    }

    .fc-dot.active {
      background: linear-gradient(135deg, var(--holo-7), var(--holo-5)) !important;
      border: none !important;
    }

    /* Info panels with holographic accents */
    .info-panel {
      border-left: 4px solid transparent !important;
      background: linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)) padding-box,
                  linear-gradient(180deg, var(--holo-7), var(--holo-5)) border-box !important;
      border-left-width: 4px !important;
      border-left-style: solid !important;
    }

    /* Score panels */
    .score-panel,
    .quiz-score-panel {
      background: linear-gradient(135deg, var(--primary), #B86BFF) !important;
    }

    /* Gamification activities */
    .gamification-activity {
      background: transparent !important;
      border: none !important;
      animation: none !important;
    }

    /* Section navigation */
    .section-navigation {
      border-top: 2px solid transparent !important;
      background: linear-gradient(transparent, transparent) padding-box,
                  linear-gradient(90deg, var(--holo-1)40, var(--holo-5)40, var(--holo-7)40) border-box !important;
      border-top-width: 2px !important;
      border-top-style: solid !important;
    }

    /* Click-to-continue divider */
    .continue-divider-content {
      background: linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)) padding-box,
                  linear-gradient(90deg, var(--holo-1), var(--holo-5), var(--holo-7)) border-box !important;
      border: 2px solid transparent !important;
      border-radius: 12px !important;
    }

    .continue-divider-btn {
      background: linear-gradient(135deg, var(--primary), #B86BFF) !important;
    }

    /* Mobile toggle with holographic border */
    .mobile-toggle {
      background: linear-gradient(#fff, #fff) padding-box,
                  linear-gradient(90deg, var(--holo-1), var(--holo-5), var(--holo-7)) border-box !important;
      border: 2px solid transparent !important;
    }
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <!-- Supabase JS -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <style>
    ${fontImport}
    
    :root {
      ${theme.themePreset === 'holographic' ? holographicThemeVars :
        theme.themePreset === 'accessible' ? accessibleThemeVars :
        theme.themePreset === 'editorial' ? editorialLightThemeVars :
        theme.themePreset === 'editorial-dark' ? editorialDarkThemeVars :
        isDarkTheme ? darkThemeVars : lightThemeVars}
      /* Design tokens */
      --space-xs: 4px;
      --space-sm: 8px;
      --space-md: 16px;
      --space-lg: 24px;
      --space-xl: 32px;
      --space-2xl: 48px;
      --radius-sm: 6px;
      --radius-md: 10px;
      --radius-lg: 14px;
      --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
      --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
      --transition-fast: 150ms ease;
      --transition-normal: 250ms ease;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: ${theme.fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
      padding: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    ${theme.themePreset === 'holographic' ? holographicBgStyles :
      theme.themePreset === 'accessible' ? accessibleBgStyles :
      theme.themePreset === 'editorial' ? editorialLightBgStyles :
      theme.themePreset === 'editorial-dark' ? editorialDarkBgStyles :
      isDarkTheme ? darkBgStyles : lightBgStyles}

    ${editorialStyles}

    ${accessibleStyles}

    ${holographicStyles}

    .course-container {
      max-width: 1100px;
      width: 90%;
      margin: 0 auto;
      background: transparent;
      padding: 48px 24px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin-bottom: var(--space-md);
      margin-top: var(--space-lg);
      font-weight: 700;
      letter-spacing: -0.025em;
    }

    /* Course Title */
    h1 {
      font-size: 2.25rem;
      font-weight: 700;
      color: var(--text);
      margin-top: 0;
      margin-bottom: var(--space-md);
      letter-spacing: -0.03em;
      line-height: 1.2;
    }
    
    /* Course description styling */
    .course-description {
      font-size: 1.1rem;
      font-weight: 400;
      color: var(--text-muted);
      margin-bottom: var(--space-2xl);
      padding-bottom: var(--space-xl);
      border-bottom: 1px solid var(--border);
      line-height: 1.8;
      max-width: 680px;
    }
    
    /* Section Title - Clean with bottom border */
    .course-section > h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
      background: transparent;
      padding: 0 0 var(--space-sm) 0;
      border: none;
      border-bottom: 2px solid var(--primary);
      border-radius: 0;
      margin-top: var(--space-2xl);
      margin-bottom: var(--space-xl);
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: none;
      letter-spacing: -0.025em;
    }
    
    /* First section shouldn't have as much top margin */
    .course-section:first-of-type > h2 {
      margin-top: 0;
    }
    
    /* Activity content h2 */
    .activity h2,
    .text-content h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text);
      background: none;
      padding: 0;
      border-radius: 0;
      border-left: none;
      margin-top: var(--space-xl);
      margin-bottom: var(--space-md);
    }

    /* Activity Title */
    h3, .activity-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
      margin-top: var(--space-lg);
      margin-bottom: var(--space-md);
    }

    /* Sub-headings within activities */
    h4 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text);
      margin-top: var(--space-lg);
    }
    
    h5, h6 {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-muted);
    }
    
    p {
      margin-bottom: 20px;
      font-size: 1.05rem;
    }
    
    ul, ol {
      margin-bottom: 20px;
      padding-left: 28px;
    }
    
    li {
      margin-bottom: 10px;
      line-height: 1.7;
    }

    /* Style for bullet points */
    ul li::marker {
      color: var(--primary);
    }

    ol li::marker {
      color: var(--primary);
      font-weight: 600;
    }
    
    img {
      max-width: 100%;
      height: auto;
      border-radius: var(--radius-md);
      margin: var(--space-lg) 0;
      box-shadow: var(--shadow-sm);
    }

    /* Header image styles */
    .header-image-wrapper {
      position: relative;
      width: 100%;
      overflow: hidden;
    }

    .header-overlay {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 120px;
      background: linear-gradient(to top, var(--bg), transparent);
    }

    img.course-header-image {
      margin: 0;
      border-radius: 0;
      max-width: none;
      width: 100%;
      height: 280px;
      object-fit: cover;
      display: block;
      box-shadow: none;
    }
    
    /* Button Styles */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--primary);
      color: white;
      text-decoration: none;
      border-radius: var(--radius-md);
      border: none;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: all var(--transition-normal);
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
      background: color-mix(in srgb, var(--primary) 85%, black);
    }

    .btn:active {
      transform: translateY(0);
    }

    .btn-success {
      background: #10b981;
      box-shadow: var(--shadow-sm);
    }

    .btn-success:hover {
      background: color-mix(in srgb, #10b981 85%, black);
      box-shadow: var(--shadow-md);
    }
    
    .progress-bar {
      width: 100%;
      height: 4px;
      background: var(--surface);
      border-radius: 2px;
      overflow: hidden;
      margin: 20px 0;
    }

    .progress-fill {
      height: 100%;
      background: var(--primary);
      transition: width 0.5s ease;
      border-radius: 2px;
    }
    
    /* Activity Card Base Style */
    .activity {
      background: var(--card-bg);
      border-radius: var(--radius-lg);
      border: 1px solid var(--card-border);
      padding: var(--space-lg);
      margin: var(--space-xl) 0;
      box-shadow: var(--card-shadow);
      transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
    }

    .activity:hover {
      border-color: color-mix(in srgb, var(--primary) 30%, transparent);
      box-shadow: var(--shadow-md);
    }

    /* Text content specific styling */
    .text-content {
      background: transparent;
      border: none;
      padding: 0;
      box-shadow: none;
      backdrop-filter: none;
    }

    .text-content:hover {
      border-color: transparent;
      box-shadow: none;
    }

    .section {
      margin-bottom: var(--space-xl);
      padding: var(--space-lg);
      background: var(--card-bg);
      border-radius: var(--radius-lg);
      border: 1px solid var(--card-border);
    }

    /* Course Section Styles - for multi-section navigation */
    .course-section {
      display: none;
      animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .course-section:first-child {
      display: block;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Section Navigation */
    .section-navigation {
      margin-top: 48px !important;
      padding-top: 32px !important;
      border-top: 1px solid var(--border) !important;
      text-align: center;
    }

    .next-section-btn {
      transition: all var(--transition-normal);
    }

    /* Progress Sidebar Styles */
    .progress-sidebar {
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      width: 260px;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--card-border);
      z-index: 999999;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }

    .progress-sidebar.visible {
      transform: translateX(0);
    }

    .progress-sidebar-header {
      padding: 20px var(--space-md);
      border-bottom: 1px solid var(--card-border);
      background: transparent;
    }

    .progress-sidebar-title {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-muted);
      margin: 0 0 var(--space-md) 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .sidebar-toggle {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text-muted);
      cursor: pointer;
      padding: 8px;
      border-radius: 10px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .sidebar-toggle:hover {
      background: var(--primary-light);
      color: var(--primary);
      border-color: var(--primary);
    }

    .progress-bar-container {
      margin-bottom: 8px;
    }

    .progress-bar-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 8px;
      font-weight: 500;
    }

    .progress-bar {
      width: 100%;
      height: 4px;
      background: var(--surface);
      border-radius: 2px;
      overflow: hidden;
      margin: 0;
    }

    .progress-bar-fill {
      height: 100%;
      background: var(--primary);
      border-radius: 2px;
      transition: width 0.5s ease;
      width: 0%;
    }

    .progress-summary {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 10px;
      font-weight: 500;
    }

    .progress-sidebar-content {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .section-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .section-item {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      transition: background var(--transition-fast);
      cursor: pointer;
      border: 1px solid transparent;
    }

    .section-item:hover:not(.locked) {
      background: var(--surface);
    }

    .section-item.current {
      background: var(--primary-light);
      border-color: var(--primary);
    }

    .section-item.locked {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .section-icon {
      width: 24px;
      height: 24px;
      border-radius: var(--radius-sm);
      margin-right: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 0.65rem;
      font-weight: 600;
      transition: all var(--transition-fast);
    }

    .section-icon.completed {
      background: #10b981;
      color: white;
    }

    .section-icon.current,
    .section-icon.unlocked {
      background: var(--primary-light);
      color: var(--primary);
      border: 2px solid var(--primary);
    }

    .section-icon.locked {
      background: var(--surface);
      color: var(--text-muted);
      border: 1px solid var(--border);
    }

    .section-details {
      flex: 1;
      cursor: pointer;
      min-width: 0;
    }

    .section-title {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .section-item.locked .section-title {
      color: var(--text-muted);
    }

    .progress-sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid var(--card-border);
      font-size: 0.75rem;
      color: var(--text-muted);
      text-align: center;
      background: var(--surface);
    }

    .footer-text {
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .mobile-toggle {
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 999998;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);
      padding: 12px;
      cursor: pointer;
      color: var(--text);
      transition: all var(--transition-fast);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-sm);
      opacity: 1;
      visibility: visible;
    }

    .mobile-toggle:hover {
      background: var(--surface);
      border-color: var(--primary);
      color: var(--primary);
    }

    /* Hide floating toggle when sidebar is open on desktop (since sidebar has its own close button) */
    @media (min-width: 769px) {
      body.sidebar-open .mobile-toggle {
        opacity: 0;
        visibility: hidden;
        transform: translateX(-20px);
        pointer-events: none;
      }

      /* Desktop: Sidebar pushes content instead of overlaying */
      body.sidebar-open {
        padding-left: 260px; /* Push content */
        overflow-y: auto !important; /* Enable scrolling */
      }

      /* Hide overlay on desktop */
      body.sidebar-open .sidebar-overlay {
        display: none !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    }

    /* Transition for body padding */
    body {
      transition: padding-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 999997;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
    }

    .sidebar-overlay.visible {
      opacity: 1;
      visibility: visible;
    }

    body.sidebar-open {
      padding-left: 260px;
    }

    body {
      transition: padding-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .course-header-image {
        height: 180px;
      }

      body.sidebar-open {
        padding-left: 0;
      }

      .course-container {
        padding: var(--space-lg) var(--space-md);
      }

      h1 {
        font-size: 1.75rem;
      }

      .course-section > h2 {
        font-size: 1.2rem;
        padding: 0 0 var(--space-sm) 0;
        margin-top: var(--space-xl);
      }

      h3, .activity-title {
        font-size: 1.1rem;
      }

      p {
        font-size: 1rem;
      }

      .course-description {
        font-size: 1rem;
        margin-bottom: var(--space-lg);
        padding-bottom: var(--space-md);
      }

      .progress-sidebar {
        width: 260px;
      }

      .mobile-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      body.sidebar-open .mobile-toggle {
        transform: translateX(260px);
      }

      .activity {
        padding: var(--space-md);
        border-radius: var(--radius-md);
        margin: var(--space-lg) 0;
      }

      .btn {
        padding: 10px 20px;
        font-size: 0.95rem;
      }
    }

    /* Phone breakpoint */
    @media (max-width: 480px) {
      .course-container {
        padding: var(--space-md) var(--space-sm);
      }

      h1 {
        font-size: 1.5rem;
      }

      .course-section > h2 {
        font-size: 1.1rem;
      }

      .activity {
        padding: var(--space-sm) var(--space-md);
        margin: var(--space-md) 0;
      }
    }

    /* Focus styles for accessibility */
    button:focus-visible,
    a:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    /* Smooth scrolling */
    html {
      scroll-behavior: smooth;
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: var(--surface);
    }

    ::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: var(--text-muted);
    }

    /* Instruction text for activities */
    .instruction-text {
      color: var(--text-muted);
      font-size: 0.95rem;
      margin-bottom: 20px;
      font-style: italic;
    }

    /* Feedback styles */
    .kc-feedback {
      padding: 16px 20px;
      border-radius: 12px;
      margin-top: 16px;
      font-weight: 600;
      display: none;
    }

    .kc-feedback.correct {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(20, 184, 166, 0.15));
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .kc-feedback.incorrect {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(244, 63, 94, 0.15));
      color: #ef4444;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    /* Controls container for activities */
    .controls {
      margin-top: 20px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .reset-btn {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
      box-shadow: none;
    }

    .reset-btn:hover {
      background: var(--border);
      box-shadow: none;
    }

    /* ========================================
       MICRO-INTERACTIONS (Simplified)
       ======================================== */

    /* Progress Bars - solid primary */
    .progress-fill,
    .progress-bar-fill,
    .quiz-progress .progress-fill {
      background: var(--primary);
    }

    /* Confetti Celebration for Correct Answers */
    .confetti-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
      overflow: hidden;
    }

    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      opacity: 0;
      animation: confettiFall 3s ease-in-out forwards;
    }

    .confetti.circle { border-radius: 50%; }
    .confetti.square { border-radius: 2px; }
    .confetti.triangle {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-bottom: 10px solid currentColor;
      background: none !important;
    }

    @keyframes confettiFall {
      0% { opacity: 1; transform: translateY(-10px) rotate(0deg) scale(1); }
      50% { opacity: 1; }
      100% { opacity: 0; transform: translateY(100vh) rotate(720deg) scale(0.3); }
    }

    /* Correct Answer - simple border-color transition */
    .correct-answer,
    .kc-option.correct,
    .quiz-option.correct-answer {
      border-color: var(--success) !important;
      transition: border-color var(--transition-normal);
    }

    /* Score Counter Animation */
    .score-pop {
      animation: scorePop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    @keyframes scorePop {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); color: var(--success); }
      100% { transform: scale(1); }
    }

    /* Shake Animation for Incorrect Answers */
    .shake-enhanced {
      animation: shakeEnhanced 0.5s cubic-bezier(.36,.07,.19,.97) both;
    }

    @keyframes shakeEnhanced {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-6px); }
      40% { transform: translateX(6px); }
      60% { transform: translateX(-3px); }
      80% { transform: translateX(3px); }
    }

    /* Ripple Effect for Buttons */
    .btn .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: scale(0);
      animation: rippleEffect 0.6s linear;
      pointer-events: none;
    }

    @keyframes rippleEffect {
      to { transform: scale(4); opacity: 0; }
    }

    /* Points Counter Fly-up Animation */
    .points-flyup {
      position: absolute;
      font-weight: 700;
      font-size: 1.2rem;
      color: var(--success);
      pointer-events: none;
      animation: flyUp 1s ease-out forwards;
    }

    @keyframes flyUp {
      0% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-40px); }
    }

    /* Interactive Card */
    .interactive-card {
      transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
    }

    /* Prefers Reduced Motion */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
  </style>
</head>
<body>
  ${headerImageHtml}
  <div class="course-container">
    ${content}
  </div>
  
  <script>
    ${standaloneMode ? STANDALONE_API_WRAPPER : SCORM_API_WRAPPER}
    ${INTERACTION_LOGIC_JS}
  </script>
  <script>
    // Supabase Config
    window.SUPABASE_URL = "${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}";
    window.SUPABASE_KEY = "${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}";
    
    // Live Activity Logic
    ${LIVE_ACTIVITY_LOGIC}
  </script>
</body>
</html>`;
}

/**
 * Escapes HTML special characters
 */
function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

