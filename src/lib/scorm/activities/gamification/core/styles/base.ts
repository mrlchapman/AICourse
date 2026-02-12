/**
 * Base styles shared across all gamification activities
 * These provide common utilities and reset styles
 */

export const baseStyles = `
  /* Base fullscreen button styles - can be customized per theme */
  [class*="-fullscreen-btn"] {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 150;
    width: 32px;
    height: 32px;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    color: rgba(255, 255, 255, 0.6);
    font-size: 1rem;
  }

  [class*="-fullscreen-btn"]:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  [class*="-fs-collapse"] {
    display: none;
    transform: rotate(45deg);
  }

  /* Base activity maximized state */
  [class*="-activity-maximized"] {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    z-index: 999999 !important;
  }

  [class*="-maximized"] {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    max-width: none !important;
    border-radius: 0 !important;
    border: none !important;
    z-index: 999999 !important;
  }

  /* Common animation keyframes */
  @keyframes game-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  @keyframes game-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  @keyframes game-shake {
    0%, 100% { transform: translateX(0) rotate(0); }
    20% { transform: translateX(-8px) rotate(-1deg); }
    40% { transform: translateX(8px) rotate(1deg); }
    60% { transform: translateX(-8px) rotate(-1deg); }
    80% { transform: translateX(8px) rotate(1deg); }
  }

  @keyframes game-fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes game-scale-in {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
`;

/**
 * Common font imports used across themes
 */
export const fontImports = {
  ibmPlexMono: "@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');",
  playfairDisplay: "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');",
  orbitron: "@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&display=swap');",
  pressStart2P: "@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');",
  vt323: "@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');",
  robotoMono: "@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&display=swap');",
};

/**
 * Common color palettes that can be used across themes
 */
export const colorPalettes = {
  retro: {
    primary: '#d4af37',
    secondary: '#c9a227',
    success: '#4ade80',
    error: '#ef4444',
    warning: '#f59e0b',
    dark: '#0f1a1c',
    medium: '#1a2a2e',
    light: '#2a3a3e',
    text: '#c4d4d6',
    textMuted: '#6a7a7e',
  },
  neon: {
    primary: '#00ffff',
    secondary: '#ff00ff',
    success: '#00ff00',
    error: '#ff0044',
    warning: '#ffaa00',
    dark: '#0a0a0f',
    medium: '#1a1a2e',
    light: '#2a2a4e',
    text: '#ffffff',
    textMuted: '#8888aa',
  },
  military: {
    primary: '#4ade80',
    secondary: '#22c55e',
    success: '#4ade80',
    error: '#ef4444',
    warning: '#eab308',
    dark: '#0f1f14',
    medium: '#1a2f1e',
    light: '#2a3f2e',
    text: '#a8d8a8',
    textMuted: '#5a8a5a',
  },
  classic: {
    primary: '#3b82f6',
    secondary: '#2563eb',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b',
    dark: '#1f2937',
    medium: '#374151',
    light: '#4b5563',
    text: '#f9fafb',
    textMuted: '#9ca3af',
  },
};
