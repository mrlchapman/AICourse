/**
 * Space Invaders Theme for Neon Defender
 * Classic 1978 arcade aesthetic with green phosphor CRT look
 */

import { GameTheme } from '../../core/types';
import { fontImports } from '../../core/styles/base';

export const spaceInvadersTheme: GameTheme = {
  id: 'space-invaders',
  name: 'Space Invaders',
  classPrefix: 'si',
  css: `
    ${fontImports.pressStart2P}

    .si-defender-activity {
      width: 100%;
      max-width: 900px;
      margin: 30px auto;
    }

    .si-cabinet {
      position: relative;
      background: #000;
      border-radius: 4px;
      overflow: hidden;
      font-family: 'Press Start 2P', monospace;
      color: #33ff33;
      border: 1px solid #33ff33;
      box-shadow:
        0 0 20px rgba(51, 255, 51, 0.15),
        0 10px 40px rgba(0, 0, 0, 0.6);
    }

    /* Fullscreen Button */
    .si-fullscreen-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 150;
      width: 28px;
      height: 28px;
      background: transparent;
      border: 1px solid #33ff33;
      border-radius: 2px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      color: #33ff33;
      font-size: 0.8rem;
    }

    .si-fullscreen-btn:hover {
      background: rgba(51, 255, 51, 0.15);
      box-shadow: 0 0 8px rgba(51, 255, 51, 0.4);
    }

    .si-fs-collapse { display: none; transform: rotate(45deg); }

    /* CSS Fullscreen */
    .si-activity-maximized {
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
      background: #000;
    }

    .si-maximized, .si-native-fullscreen {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      max-width: none !important;
      border-radius: 0 !important;
      z-index: 999999 !important;
      display: flex;
      flex-direction: column;
    }

    .si-maximized .si-display-frame,
    .si-native-fullscreen .si-display-frame {
      flex: 1;
      height: auto;
    }

    /* Scanlines overlay on whole cabinet */
    .si-scanlines {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.12) 2px,
        rgba(0, 0, 0, 0.12) 4px
      );
      pointer-events: none;
      z-index: 4;
    }

    /* Top Bar */
    .si-top-bar {
      position: relative;
      z-index: 5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(51, 255, 51, 0.3);
    }

    .si-title {
      font-size: 0.65rem;
      letter-spacing: 2px;
      color: #33ff33;
    }

    .si-score-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .si-score-label {
      font-size: 0.5rem;
      color: rgba(51, 255, 51, 0.6);
    }

    .si-score-value {
      font-size: 0.9rem;
      color: #fff;
    }

    .si-lives-display {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .si-lives-label {
      font-size: 0.5rem;
      color: rgba(51, 255, 51, 0.6);
    }

    .si-lives-icons {
      display: flex;
      gap: 4px;
    }

    .si-life-icon {
      color: #33ff33;
      font-size: 0.7rem;
    }

    .si-life-icon.lost {
      color: #333;
    }

    /* Display Frame (Canvas Area) */
    .si-display-frame {
      position: relative;
      z-index: 5;
      padding: 4px;
      background: #000;
      height: 350px;
    }

    .si-canvas {
      display: block;
      width: 100%;
      height: 100%;
    }

    /* Question Strip */
    .si-question-strip {
      position: relative;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px 16px;
      background: #000;
      border-top: 1px solid rgba(51, 255, 51, 0.3);
      border-bottom: 1px solid rgba(51, 255, 51, 0.3);
    }

    .si-question-display {
      text-align: center;
      padding: 8px 16px;
    }

    .si-question-text {
      color: #33ff33;
      font-size: 0.6rem;
      line-height: 1.6;
    }

    /* Reflection Banner */
    .si-reflection {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 100;
      background: rgba(0, 0, 0, 0.95);
      border: 1px solid #33ff33;
      border-radius: 4px;
      padding: 16px 20px;
      max-width: 380px;
      width: 80%;
      display: none;
      box-shadow: 0 0 20px rgba(51, 255, 51, 0.2);
    }

    .si-reflection-header {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #33ff33;
      font-size: 0.5rem;
      letter-spacing: 2px;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(51, 255, 51, 0.3);
    }

    .si-reflection-icon {
      animation: si-blink 1s ease-in-out infinite;
    }

    @keyframes si-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .si-reflection-body {
      color: #ccc;
      font-family: 'Courier New', monospace;
      font-size: 0.8rem;
      line-height: 1.5;
      text-align: center;
    }

    /* Bottom Controls Bar */
    .si-bottom-bar {
      position: relative;
      z-index: 5;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 40px;
      padding: 10px 16px;
      opacity: 0.5;
    }

    .si-control-hint {
      font-size: 0.45rem;
      color: #33ff33;
      letter-spacing: 1px;
    }

    /* Screens */
    .si-screen {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.98);
      align-items: center;
      justify-content: center;
      z-index: 50;
      display: none;
    }

    .si-screen.active {
      display: flex;
    }

    /* Start Screen */
    .si-start-content {
      text-align: center;
      padding: 30px;
      max-width: 500px;
    }

    .si-start-logo {
      margin-bottom: 30px;
    }

    .si-invader-row {
      display: flex;
      justify-content: center;
      gap: 16px;
      font-size: 1.5rem;
      color: #33ff33;
      margin-bottom: 16px;
    }

    .si-invader-row span {
      animation: si-invader-bob 1.2s ease-in-out infinite;
    }
    .si-invader-row span:nth-child(2) { animation-delay: 0.15s; }
    .si-invader-row span:nth-child(3) { animation-delay: 0.3s; }
    .si-invader-row span:nth-child(4) { animation-delay: 0.45s; }
    .si-invader-row span:nth-child(5) { animation-delay: 0.6s; }

    @keyframes si-invader-bob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    .si-logo-title {
      font-size: 1.1rem;
      letter-spacing: 4px;
      color: #fff;
      text-shadow: 0 0 10px rgba(51, 255, 51, 0.4);
      margin-bottom: 6px;
    }

    .si-logo-subtitle {
      font-size: 0.45rem;
      letter-spacing: 3px;
      color: rgba(51, 255, 51, 0.5);
      margin-top: 4px;
    }

    .si-instructions {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 24px;
    }

    .si-inst-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .si-inst-key {
      font-size: 0.5rem;
      color: #fff;
      background: rgba(51, 255, 51, 0.1);
      border: 1px solid rgba(51, 255, 51, 0.4);
      padding: 4px 10px;
      min-width: 60px;
    }

    .si-inst-desc {
      font-size: 0.45rem;
      color: rgba(51, 255, 51, 0.6);
      text-align: left;
      min-width: 160px;
    }

    .si-required-badge {
      font-size: 0.45rem;
      letter-spacing: 2px;
      color: #ff3333;
      border: 1px solid rgba(255, 51, 51, 0.4);
      padding: 6px 14px;
      margin-bottom: 18px;
      display: inline-block;
    }

    .si-button {
      background: transparent;
      border: 2px solid #33ff33;
      color: #33ff33;
      padding: 12px 28px;
      font-family: 'Press Start 2P', monospace;
      font-size: 0.6rem;
      letter-spacing: 2px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .si-button:hover {
      background: rgba(51, 255, 51, 0.15);
      box-shadow: 0 0 15px rgba(51, 255, 51, 0.3);
      transform: translateY(-1px);
    }

    /* End Screen */
    .si-end-content {
      text-align: center;
      padding: 24px;
      max-width: 500px;
    }

    .si-end-status {
      font-size: 0.9rem;
      letter-spacing: 4px;
      margin-bottom: 20px;
      padding: 8px 16px;
    }

    .si-end-status.success {
      color: #33ff33;
      text-shadow: 0 0 15px rgba(51, 255, 51, 0.5);
    }

    .si-end-status.failed {
      color: #ff3333;
      text-shadow: 0 0 15px rgba(255, 51, 51, 0.5);
    }

    .si-end-score {
      margin-bottom: 16px;
    }

    .si-score-box {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 24px;
      border: 1px solid rgba(51, 255, 51, 0.3);
      margin-bottom: 12px;
    }

    .si-score-big {
      font-size: 1.6rem;
      color: #fff;
      margin-bottom: 6px;
    }

    .si-score-tag {
      font-size: 0.45rem;
      color: rgba(51, 255, 51, 0.6);
      letter-spacing: 2px;
    }

    .si-pass-info {
      font-size: 0.5rem;
      padding: 6px 14px;
    }

    .si-pass-info.success {
      color: #33ff33;
      border: 1px solid rgba(51, 255, 51, 0.3);
    }

    .si-pass-info.failed {
      color: #ff3333;
      border: 1px solid rgba(255, 51, 51, 0.3);
    }

    .si-end-feedback {
      max-height: 140px;
      overflow-y: auto;
      margin-top: 12px;
      margin-bottom: 16px;
    }

    .si-stats-list {
      text-align: left;
    }

    .si-stat-item {
      padding: 8px;
      border-left: 2px solid rgba(51, 255, 51, 0.3);
      margin-bottom: 6px;
    }

    .si-stat-q {
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      color: #33ff33;
      margin-bottom: 3px;
    }

    .si-stat-a {
      font-family: 'Courier New', monospace;
      font-size: 0.7rem;
      color: #888;
    }

    .si-stat-attempts {
      opacity: 0.5;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .si-top-bar {
        padding: 8px 10px;
      }

      .si-display-frame {
        height: 280px;
      }

      .si-title {
        font-size: 0.5rem;
      }

      .si-logo-title {
        font-size: 0.8rem;
        letter-spacing: 2px;
      }

      .si-inst-item {
        flex-direction: column;
        gap: 4px;
      }

      .si-inst-desc {
        text-align: center;
        min-width: auto;
      }

      .si-bottom-bar {
        gap: 20px;
      }
    }
  `,
};

export default spaceInvadersTheme;
