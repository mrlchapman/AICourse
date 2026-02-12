/**
 * Core types for gamification activities
 * These types enable modular game development with swappable themes
 */

import { Activity } from '../../types';

/** Extract the gamification activity type */
export type GamificationActivity = Extract<Activity, { type: 'gamification' }>;

/** Base configuration shared by all games */
export interface BaseGameConfig {
  required?: boolean;
}

/** Style theme definition for games */
export interface GameTheme {
  /** Unique identifier for the theme */
  id: string;
  /** Display name for theme selection UI */
  name: string;
  /** CSS styles for the theme */
  css: string;
  /** CSS class prefix used in the theme */
  classPrefix: string;
}

/** Game render context passed to renderers */
export interface GameRenderContext {
  /** Unique activity ID */
  activityId: string;
  /** Sanitized ID for use in function names (no dashes) */
  uniqueId: string;
  /** Whether this activity is required for progression */
  required: boolean;
  /** CSS class for tracking required activities */
  trackingClass: string;
}

/** Creates a render context from an activity */
export function createRenderContext(activity: GamificationActivity): GameRenderContext {
  const required = activity.config?.required || false;
  return {
    activityId: activity.id,
    uniqueId: activity.id.replace(/-/g, '_'),
    required,
    trackingClass: required ? 'interactive-card' : '',
  };
}

/** Utility to safely serialize JSON for embedding in HTML */
export function safeJsonEmbed(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');
}

/**
 * Combines theme CSS with game-specific styles
 * This enables theme switching by swapping the theme parameter
 */
export function combineStyles(themeStyles: string, additionalStyles?: string): string {
  return additionalStyles
    ? `${themeStyles}\n${additionalStyles}`
    : themeStyles;
}

/**
 * Creates the standard fullscreen toggle HTML used across games
 */
export function createFullscreenButton(
  gameId: string,
  uniqueId: string,
  classPrefix: string,
  toggleFunctionName: string
): string {
  return `
    <button class="${classPrefix}-fullscreen-btn" id="fullscreen-btn-${gameId}" onclick="${toggleFunctionName}_${uniqueId}()" title="Toggle Fullscreen">
      <span class="${classPrefix}-fs-expand" id="fs-expand-${gameId}">⛶</span>
      <span class="${classPrefix}-fs-collapse" id="fs-collapse-${gameId}">⛶</span>
    </button>
  `;
}

/**
 * Creates standard fullscreen toggle JavaScript used across games
 */
export function createFullscreenScript(
  gameId: string,
  uniqueId: string,
  classPrefix: string,
  toggleFunctionName: string
): string {
  return `
    let isFullscreen = false;

    window['${toggleFunctionName}_${uniqueId}'] = function() {
      const container = document.getElementById('game-${gameId}');
      const activity = document.getElementById('activity-${gameId}');
      if (!container || !activity) return;
      if (!isFullscreen) {
        enableCssFullscreen();
      } else {
        disableCssFullscreen();
      }
    };

    function enableCssFullscreen() {
      const container = document.getElementById('game-${gameId}');
      const activity = document.getElementById('activity-${gameId}');
      if (!container || !activity) return;
      container.classList.add('${classPrefix}-maximized');
      activity.classList.add('${classPrefix}-activity-maximized');
      document.body.style.overflow = 'hidden';
      isFullscreen = true;
      updateFullscreenButton();
    }

    function disableCssFullscreen() {
      const container = document.getElementById('game-${gameId}');
      const activity = document.getElementById('activity-${gameId}');
      if (!container || !activity) return;
      container.classList.remove('${classPrefix}-maximized');
      activity.classList.remove('${classPrefix}-activity-maximized');
      document.body.style.overflow = '';
      isFullscreen = false;
      updateFullscreenButton();
    }

    function updateFullscreenButton() {
      const expandIcon = document.getElementById('fs-expand-${gameId}');
      const collapseIcon = document.getElementById('fs-collapse-${gameId}');
      if (expandIcon && collapseIcon) {
        expandIcon.style.display = isFullscreen ? 'none' : 'block';
        collapseIcon.style.display = isFullscreen ? 'block' : 'none';
      }
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isFullscreen) {
        disableCssFullscreen();
      }
    });
  `;
}
