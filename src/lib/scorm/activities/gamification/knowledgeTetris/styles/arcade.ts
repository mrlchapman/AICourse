/**
 * Arcade Theme for Knowledge Tetris
 * A Soviet-constructivist aesthetic with bold red and cream colors
 */

import { GameTheme } from '../../core/types';
import { fontImports } from '../../core/styles/base';

export const arcadeTheme: GameTheme = {
  id: 'arcade',
  name: 'Arcade (Soviet)',
  classPrefix: 'blok',
  css: `
    ${fontImports.robotoMono}
    @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Roboto+Condensed:wght@400;700&display=swap');

    .blok-activity {
      width: 100%;
      max-width: 700px;
      margin: 30px auto;
    }

    .blok-cabinet {
      position: relative;
      background: #1a1a1a;
      border: 4px solid #c41e3a;
      font-family: 'Roboto Condensed', sans-serif;
      color: #f5f0e1;
      overflow: hidden;
    }

    /* Fullscreen Button */
    .blok-fullscreen-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 150;
      width: 32px;
      height: 32px;
      background: #c41e3a;
      border: 2px solid #f5f0e1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      color: #f5f0e1;
      font-size: 1rem;
    }

    .blok-fullscreen-btn:hover {
      background: #f5f0e1;
      color: #c41e3a;
    }

    .blok-fs-collapse { display: none; transform: rotate(45deg); }

    /* CSS Fullscreen */
    .blok-activity-maximized {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      max-width: none !important;
      margin: 0 !important;
      z-index: 999999 !important;
      background: #1a1a1a;
    }

    .blok-maximized, .blok-native-fullscreen {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      max-width: none !important;
      border: none !important;
      z-index: 999999 !important;
      display: flex;
      flex-direction: column;
    }

    .blok-maximized .blok-main,
    .blok-native-fullscreen .blok-main {
      flex: 1;
      align-items: center;
      padding: 30px 40px;
      gap: 30px;
    }

    .blok-maximized .blok-panel,
    .blok-native-fullscreen .blok-panel {
      min-width: 140px;
      gap: 20px;
    }

    .blok-maximized .blok-stat,
    .blok-native-fullscreen .blok-stat {
      padding: 16px 20px;
    }

    .blok-maximized .blok-stat-label,
    .blok-native-fullscreen .blok-stat-label {
      font-size: 0.85rem;
      letter-spacing: 3px;
    }

    .blok-maximized .blok-stat-value,
    .blok-native-fullscreen .blok-stat-value {
      font-size: 2.4rem;
    }

    .blok-maximized .blok-propaganda,
    .blok-native-fullscreen .blok-propaganda {
      padding: 20px 15px;
    }

    .blok-maximized .blok-slogan,
    .blok-native-fullscreen .blok-slogan {
      font-size: 1.3rem;
      letter-spacing: 4px;
    }

    .blok-maximized .blok-next-box,
    .blok-native-fullscreen .blok-next-box {
      padding: 16px 20px;
    }

    .blok-maximized .blok-progress-current,
    .blok-native-fullscreen .blok-progress-current {
      font-size: 2.4rem;
    }

    .blok-maximized .blok-progress-total,
    .blok-native-fullscreen .blok-progress-total {
      font-size: 1.5rem;
    }

    .blok-maximized .blok-controls-info,
    .blok-native-fullscreen .blok-controls-info {
      padding: 16px 20px;
    }

    .blok-maximized .blok-control-item,
    .blok-native-fullscreen .blok-control-item {
      font-size: 0.85rem;
      margin: 6px 0;
    }

    .blok-maximized .blok-header,
    .blok-native-fullscreen .blok-header {
      padding: 25px 60px 20px;
    }

    .blok-maximized .blok-title,
    .blok-native-fullscreen .blok-title {
      font-size: 3.5rem;
    }

    .blok-maximized .blok-subtitle,
    .blok-native-fullscreen .blok-subtitle {
      font-size: 1.1rem;
    }

    .blok-maximized .blok-game-frame,
    .blok-native-fullscreen .blok-game-frame {
      border-width: 6px;
      padding: 4px;
    }

    /* Decorative Elements */
    .blok-stripe {
      position: absolute;
      left: 0;
      right: 0;
      height: 8px;
      background: repeating-linear-gradient(
        90deg,
        #c41e3a 0px,
        #c41e3a 20px,
        #f5f0e1 20px,
        #f5f0e1 40px
      );
      z-index: 5;
    }

    .blok-stripe-top { top: 0; }
    .blok-stripe-bottom { bottom: 0; }

    .blok-corner {
      position: absolute;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #c41e3a;
      color: #f5f0e1;
      font-size: 1rem;
      z-index: 10;
    }

    .blok-corner-tl { top: 8px; left: 0; }
    .blok-corner-tr { top: 8px; right: 0; }
    .blok-corner-bl { bottom: 8px; left: 0; }
    .blok-corner-br { bottom: 8px; right: 0; }

    /* Header */
    .blok-header {
      position: relative;
      z-index: 5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 50px 15px;
      background: linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%);
      border-bottom: 3px solid #c41e3a;
    }

    .blok-title-group {
      display: flex;
      align-items: baseline;
      gap: 15px;
    }

    .blok-title {
      font-family: 'Oswald', sans-serif;
      font-size: 2.5rem;
      font-weight: 700;
      color: #c41e3a;
      letter-spacing: 4px;
      text-shadow: 2px 2px 0 #000;
    }

    .blok-subtitle {
      font-size: 0.9rem;
      letter-spacing: 3px;
      color: #d4a574;
      text-transform: uppercase;
    }

    .blok-required {
      font-size: 0.7rem;
      letter-spacing: 2px;
      color: #c41e3a;
      border: 2px solid #c41e3a;
      padding: 6px 12px;
      background: rgba(196, 30, 58, 0.1);
    }

    /* Main Area */
    .blok-main {
      position: relative;
      z-index: 5;
      display: flex;
      gap: 20px;
      padding: 20px;
      justify-content: center;
      align-items: flex-start;
    }

    /* Panels */
    .blok-panel {
      display: flex;
      flex-direction: column;
      gap: 15px;
      min-width: 100px;
    }

    .blok-stat {
      background: #2a2a2a;
      border: 2px solid #4a4a4a;
      padding: 12px;
      text-align: center;
    }

    .blok-stat-label {
      font-size: 0.7rem;
      letter-spacing: 2px;
      color: #888;
      margin-bottom: 6px;
    }

    .blok-stat-value {
      font-family: 'Oswald', sans-serif;
      font-size: 1.8rem;
      font-weight: 700;
      color: #f5f0e1;
    }

    .blok-stat-value.blok-level {
      color: #c41e3a;
    }

    .blok-stat-bar {
      height: 6px;
      background: #1a1a1a;
      margin-top: 8px;
      border: 1px solid #4a4a4a;
    }

    .blok-stat-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #c41e3a, #d4a574);
      transition: width 0.3s ease;
    }

    .blok-propaganda {
      background: #c41e3a;
      padding: 15px 10px;
      text-align: center;
    }

    .blok-slogan {
      font-family: 'Oswald', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 3px;
      color: #f5f0e1;
      line-height: 1.4;
    }

    /* Game Frame */
    .blok-game-frame {
      background: #0a0a0a;
      border: 4px solid #c41e3a;
      padding: 3px;
    }

    .blok-game-inner {
      border: 2px solid #4a4a4a;
    }

    .blok-canvas {
      display: block;
    }

    /* Next Piece */
    .blok-next-box {
      background: #2a2a2a;
      border: 2px solid #4a4a4a;
      padding: 12px;
      text-align: center;
    }

    .blok-next-frame {
      background: #1a1a1a;
      border: 2px solid #c41e3a;
      margin-top: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .blok-next-canvas {
      display: block;
    }

    .blok-progress {
      display: flex;
      justify-content: center;
      align-items: baseline;
      gap: 4px;
    }

    .blok-progress-current {
      font-family: 'Oswald', sans-serif;
      font-size: 1.8rem;
      font-weight: 700;
      color: #c41e3a;
    }

    .blok-progress-divider {
      color: #666;
      font-size: 1.2rem;
    }

    .blok-progress-total {
      font-family: 'Oswald', sans-serif;
      font-size: 1.2rem;
      color: #888;
    }

    .blok-controls-info {
      background: #2a2a2a;
      border: 2px solid #4a4a4a;
      padding: 12px;
    }

    .blok-control-item {
      font-size: 0.7rem;
      letter-spacing: 1px;
      color: #888;
      text-align: center;
      margin: 4px 0;
    }

    /* Footer */
    .blok-footer {
      position: relative;
      z-index: 5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 50px;
      background: #2a2a2a;
      border-top: 3px solid #c41e3a;
      font-size: 0.65rem;
      letter-spacing: 2px;
      color: #666;
    }

    /* Overlays */
    .blok-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(26, 26, 26, 0.98);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .blok-overlay.active {
      opacity: 1;
      pointer-events: auto;
    }

    /* Start Screen */
    .blok-overlay-content, .blok-end-content {
      text-align: center;
      padding: 40px;
      max-width: 400px;
    }

    .blok-start-emblem {
      margin-bottom: 20px;
    }

    .blok-emblem-star {
      font-size: 3rem;
      color: #c41e3a;
      text-shadow: 0 0 30px rgba(196, 30, 58, 0.5);
      animation: blok-pulse 2s ease-in-out infinite;
    }

    @keyframes blok-pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }

    .blok-emblem-blocks {
      display: flex;
      justify-content: center;
      gap: 5px;
      margin-top: 10px;
      font-size: 1.5rem;
    }

    .blok-emblem-blocks span {
      color: #c41e3a;
      animation: blok-block-float 1.5s ease-in-out infinite;
    }

    .blok-emblem-blocks span:nth-child(2) { animation-delay: 0.2s; }
    .blok-emblem-blocks span:nth-child(3) { animation-delay: 0.4s; }
    .blok-emblem-blocks span:nth-child(4) { animation-delay: 0.6s; }

    @keyframes blok-block-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    .blok-start-title {
      font-family: 'Oswald', sans-serif;
      font-size: 3rem;
      font-weight: 700;
      color: #c41e3a;
      letter-spacing: 8px;
      text-shadow: 3px 3px 0 #000;
      margin-bottom: 5px;
    }

    .blok-start-subtitle {
      font-size: 1rem;
      letter-spacing: 4px;
      color: #d4a574;
      margin-bottom: 25px;
    }

    .blok-start-instructions p {
      font-size: 0.9rem;
      color: #888;
      margin-bottom: 20px;
    }

    .blok-start-controls {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 25px;
      flex-wrap: wrap;
    }

    .blok-start-controls span {
      font-size: 0.75rem;
      letter-spacing: 1px;
      color: #666;
      background: #2a2a2a;
      padding: 6px 12px;
      border: 1px solid #4a4a4a;
    }

    .blok-button {
      background: #c41e3a;
      border: 3px solid #f5f0e1;
      color: #f5f0e1;
      padding: 14px 40px;
      font-family: 'Oswald', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 3px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-transform: uppercase;
    }

    .blok-button:hover {
      background: #f5f0e1;
      color: #c41e3a;
      transform: scale(1.05);
    }

    .blok-button-small {
      padding: 10px 30px;
      font-size: 0.9rem;
    }

    /* Question Overlay */
    .blok-question-box {
      background: #2a2a2a;
      border: 4px solid #c41e3a;
      padding: 30px;
      max-width: 90%;
      width: 400px;
    }

    .blok-question-header {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 2px solid #4a4a4a;
      font-size: 0.8rem;
      letter-spacing: 3px;
      color: #d4a574;
    }

    .blok-question-icon {
      width: 30px;
      height: 30px;
      background: #c41e3a;
      color: #f5f0e1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Oswald', sans-serif;
      font-size: 1.2rem;
      font-weight: 700;
    }

    .blok-question-text {
      font-size: 1.1rem;
      color: #f5f0e1;
      line-height: 1.5;
      margin-bottom: 25px;
      text-align: center;
    }

    .blok-answers {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .blok-answer-btn {
      background: #1a1a1a;
      border: 2px solid #4a4a4a;
      color: #f5f0e1;
      padding: 14px 20px;
      font-family: 'Roboto Condensed', sans-serif;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
    }

    .blok-answer-btn:hover {
      border-color: #c41e3a;
      background: rgba(196, 30, 58, 0.1);
    }

    /* Feedback Overlay */
    .blok-feedback-box {
      background: #2a2a2a;
      border: 4px solid #2d5a27;
      padding: 30px;
      text-align: center;
      max-width: 90%;
      width: 400px;
    }

    .blok-feedback-icon {
      font-size: 2.5rem;
      color: #2d5a27;
      margin-bottom: 10px;
    }

    .blok-feedback-title {
      font-family: 'Oswald', sans-serif;
      font-size: 1.8rem;
      font-weight: 700;
      color: #2d5a27;
      letter-spacing: 3px;
      margin-bottom: 15px;
    }

    .blok-feedback-text {
      color: #ccc;
      font-size: 1rem;
      line-height: 1.5;
      margin-bottom: 25px;
    }

    /* End Screen */
    .blok-end-emblem {
      font-size: 3rem;
      margin-bottom: 15px;
      transition: color 0.3s ease;
    }

    .blok-end-emblem.success { color: #2d5a27; }
    .blok-end-emblem.failed { color: #8b0000; }

    .blok-end-title {
      font-family: 'Oswald', sans-serif;
      font-size: 1.8rem;
      font-weight: 700;
      letter-spacing: 4px;
      margin-bottom: 25px;
      transition: color 0.3s ease;
    }

    .blok-end-title.success { color: #2d5a27; }
    .blok-end-title.failed { color: #c41e3a; }

    .blok-end-stats {
      margin-bottom: 25px;
    }

    .blok-end-stat {
      display: flex;
      justify-content: space-between;
      padding: 10px 20px;
      background: #2a2a2a;
      border-left: 3px solid #c41e3a;
      margin-bottom: 8px;
    }

    .blok-end-stat-label {
      font-size: 0.8rem;
      letter-spacing: 2px;
      color: #888;
    }

    .blok-end-stat-value {
      font-family: 'Oswald', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: #f5f0e1;
    }

    .blok-pass-badge {
      font-size: 0.9rem;
      letter-spacing: 3px;
      padding: 12px 20px;
      margin-top: 15px;
      display: inline-block;
    }

    .blok-pass-badge.success {
      background: #2d5a27;
      color: #f5f0e1;
      border: 2px solid #4a8b3e;
    }

    .blok-pass-badge.failed {
      background: transparent;
      color: #c41e3a;
      border: 2px solid #c41e3a;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .blok-header {
        flex-direction: column;
        gap: 10px;
        padding: 20px 20px 15px;
      }

      .blok-title {
        font-size: 2rem;
      }

      .blok-main {
        flex-direction: column;
        align-items: center;
      }

      .blok-panel {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        min-width: auto;
      }

      .blok-stat {
        min-width: 80px;
      }

      .blok-propaganda {
        display: none;
      }

      .blok-footer {
        flex-direction: column;
        gap: 5px;
        padding: 10px 20px;
      }

      .blok-start-title {
        font-size: 2.5rem;
      }

      .blok-start-controls {
        flex-direction: column;
        gap: 8px;
      }
    }
  `,
};

export default arcadeTheme;
