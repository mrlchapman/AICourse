/**
 * Synthwave Theme for Synth Defender
 * A retro synth/analog aesthetic with warm amber tones
 */

import { GameTheme } from '../../core/types';
import { fontImports } from '../../core/styles/base';

export const synthwaveTheme: GameTheme = {
  id: 'synthwave',
  name: 'Synthwave',
  classPrefix: 'synth',
  css: `
    ${fontImports.orbitron}
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');

    .synth-defender-activity {
      width: 100%;
      max-width: 900px;
      margin: 30px auto;
    }

    .synth-cabinet {
      position: relative;
      background: linear-gradient(180deg, #2a2520 0%, #1a1714 100%);
      border-radius: 12px;
      overflow: hidden;
      font-family: 'Space Mono', monospace;
      color: #e8e0d0;
      border: 3px solid #3d3429;
      box-shadow:
        inset 0 2px 0 rgba(255, 255, 255, 0.05),
        0 10px 40px rgba(0, 0, 0, 0.6),
        0 0 0 1px #1a1714;
    }

    /* Fullscreen Button */
    .synth-fullscreen-btn {
      position: absolute;
      top: 12px;
      right: 50px;
      z-index: 150;
      width: 32px;
      height: 32px;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid #5c4d3d;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      color: #d4a574;
      font-size: 1rem;
    }

    .synth-fullscreen-btn:hover {
      background: rgba(245, 158, 11, 0.2);
      border-color: #f59e0b;
      color: #f59e0b;
    }

    .synth-fs-collapse { display: none; transform: rotate(45deg); }

    /* CSS Fullscreen */
    .synth-activity-maximized {
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
      background: #0d0a08;
    }

    .synth-maximized, .synth-native-fullscreen {
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

    .synth-maximized .synth-display-frame,
    .synth-native-fullscreen .synth-display-frame {
      flex: 1;
      height: auto;
    }

    /* Wood Panels */
    .synth-wood-left, .synth-wood-right {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 35px;
      background: linear-gradient(180deg,
        #5c4332 0%,
        #4a3628 20%,
        #3d2c20 50%,
        #4a3628 80%,
        #5c4332 100%);
      z-index: 10;
    }
    .synth-wood-left {
      left: 0;
      border-right: 2px solid #2a2018;
      box-shadow: inset -5px 0 15px rgba(0,0,0,0.3);
    }
    .synth-wood-right {
      right: 0;
      border-left: 2px solid #2a2018;
      box-shadow: inset 5px 0 15px rgba(0,0,0,0.3);
    }

    /* Wood grain texture */
    .synth-wood-left::before, .synth-wood-right::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 8px,
        rgba(0,0,0,0.1) 8px,
        rgba(0,0,0,0.1) 10px
      );
    }

    /* Top Panel */
    .synth-top-panel {
      position: relative;
      z-index: 5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 50px;
      background: linear-gradient(180deg, #2a2520 0%, #1f1b18 100%);
      border-bottom: 2px solid #3d3429;
    }

    .synth-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .synth-brand-logo {
      font-size: 1.8rem;
      color: #f59e0b;
      text-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
    }

    .synth-brand-text {
      display: flex;
      flex-direction: column;
    }

    .synth-brand-name {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 3px;
      color: #f59e0b;
    }

    .synth-brand-model {
      font-size: 0.65rem;
      letter-spacing: 2px;
      color: #8b7355;
      margin-top: 2px;
    }

    .synth-top-meters {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    /* VU Meter */
    .synth-vu-meter {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .synth-vu-label {
      font-size: 0.6rem;
      letter-spacing: 2px;
      color: #8b7355;
    }

    .synth-vu-display {
      width: 120px;
      height: 16px;
      background: #0d0a08;
      border: 1px solid #3d3429;
      border-radius: 2px;
      overflow: hidden;
      position: relative;
    }

    .synth-vu-bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #84cc16, #f59e0b, #ef4444);
      transition: width 0.3s ease;
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
    }

    .synth-vu-ticks {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      justify-content: space-between;
      padding: 0 4px;
      font-size: 0.5rem;
      color: rgba(232, 224, 208, 0.4);
      align-items: center;
      pointer-events: none;
    }

    .synth-vu-value {
      font-family: 'Orbitron', sans-serif;
      font-size: 0.9rem;
      font-weight: 700;
      color: #f59e0b;
    }

    /* LED Cluster */
    .synth-led-cluster {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .synth-led-label {
      font-size: 0.6rem;
      letter-spacing: 2px;
      color: #8b7355;
    }

    .synth-leds {
      display: flex;
      gap: 8px;
    }

    .synth-led {
      width: 12px;
      height: 12px;
      background: #2a2018;
      border-radius: 50%;
      border: 1px solid #3d3429;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
    }

    .synth-led.active {
      background: radial-gradient(circle at 30% 30%, #ff6b35, #dc2626);
      box-shadow:
        0 0 10px rgba(255, 107, 53, 0.6),
        inset 0 -2px 4px rgba(0,0,0,0.3);
    }

    /* Display Frame */
    .synth-display-frame {
      position: relative;
      z-index: 5;
      margin: 0 35px;
      padding: 10px;
      background: #0d0a08;
      border: 3px solid #3d3429;
      height: 350px;
    }

    .synth-display-bezel {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border-radius: 4px;
    }

    .synth-crt-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.2) 100%);
      pointer-events: none;
      z-index: 2;
    }

    .synth-scanlines {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.15) 2px,
        rgba(0, 0, 0, 0.15) 4px
      );
      pointer-events: none;
      z-index: 3;
    }

    .synth-canvas {
      display: block;
      width: 100%;
      height: 100%;
    }

    /* Question Strip */
    .synth-question-strip {
      position: relative;
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px 50px;
      background: #1a1714;
      border-top: 1px solid #3d3429;
      border-bottom: 1px solid #3d3429;
    }

    .synth-patch-left, .synth-patch-right {
      color: #5c4d3d;
      font-size: 0.8rem;
      letter-spacing: 2px;
    }

    .synth-question-display {
      flex: 1;
      text-align: center;
      padding: 10px 20px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid #3d3429;
      border-radius: 4px;
      margin: 0 15px;
    }

    .synth-question-label {
      color: #f59e0b;
      font-size: 0.7rem;
      letter-spacing: 2px;
      margin-right: 8px;
    }

    .synth-question-text {
      color: #e8e0d0;
      font-size: 0.95rem;
    }

    /* Reflection Banner */
    .synth-reflection {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 100;
      background: rgba(13, 10, 8, 0.95);
      border: 2px solid #84cc16;
      border-radius: 8px;
      padding: 20px;
      max-width: 400px;
      width: 80%;
      display: none;
      box-shadow: 0 0 30px rgba(132, 204, 22, 0.3);
    }

    .synth-reflection-header {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #84cc16;
      font-size: 0.8rem;
      letter-spacing: 2px;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #3d3429;
    }

    .synth-reflection-icon {
      animation: synth-pulse 1s ease-in-out infinite;
    }

    @keyframes synth-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .synth-reflection-body {
      color: #e8e0d0;
      font-size: 0.9rem;
      line-height: 1.5;
      text-align: center;
    }

    /* Bottom Panel */
    .synth-bottom-panel {
      position: relative;
      z-index: 5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 50px;
      background: linear-gradient(180deg, #1f1b18 0%, #2a2520 100%);
      border-top: 2px solid #3d3429;
    }

    .synth-control-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .synth-knob-label {
      font-size: 0.75rem;
      letter-spacing: 2px;
      color: #d4a574;
    }

    .synth-control-hint {
      font-size: 0.6rem;
      letter-spacing: 1px;
      color: #5c4d3d;
    }

    .synth-oscilloscope {
      width: 150px;
      height: 50px;
      background: #0d0a08;
      border: 2px solid #3d3429;
      border-radius: 4px;
      padding: 5px;
      color: #f59e0b;
    }

    .synth-scope-wave {
      width: 100%;
      height: 100%;
    }

    .synth-scope-wave svg {
      width: 100%;
      height: 100%;
    }

    /* Screens */
    .synth-screen {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(13, 10, 8, 0.98);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 50;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .synth-screen.active {
      opacity: 1;
      pointer-events: auto;
    }

    /* Start Screen */
    .synth-start-content {
      text-align: center;
      padding: 40px;
      max-width: 500px;
    }

    .synth-start-logo {
      margin-bottom: 30px;
    }

    .synth-logo-waves {
      display: flex;
      justify-content: center;
      gap: 10px;
      font-size: 2rem;
      color: #f59e0b;
      margin-bottom: 10px;
    }

    .synth-logo-waves span {
      animation: synth-wave 1.5s ease-in-out infinite;
    }
    .synth-logo-waves span:nth-child(2) { animation-delay: 0.2s; }
    .synth-logo-waves span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes synth-wave {
      0%, 100% { transform: translateY(0); opacity: 0.5; }
      50% { transform: translateY(-10px); opacity: 1; }
    }

    .synth-logo-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 2rem;
      font-weight: 900;
      letter-spacing: 6px;
      color: #f59e0b;
      text-shadow: 0 0 30px rgba(245, 158, 11, 0.5);
    }

    .synth-logo-subtitle {
      font-size: 0.7rem;
      letter-spacing: 4px;
      color: #8b7355;
      margin-top: 8px;
    }

    .synth-instructions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 25px;
    }

    .synth-inst-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
    }

    .synth-inst-key {
      font-family: 'Orbitron', sans-serif;
      font-size: 0.8rem;
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid #5c4d3d;
      padding: 6px 12px;
      border-radius: 4px;
      min-width: 70px;
    }

    .synth-inst-desc {
      font-size: 0.8rem;
      color: #8b7355;
      text-align: left;
      min-width: 180px;
    }

    .synth-required-badge {
      font-size: 0.7rem;
      letter-spacing: 2px;
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 8px 16px;
      margin-bottom: 20px;
      display: inline-block;
    }

    .synth-button {
      background: linear-gradient(180deg, #3d3429 0%, #2a2520 100%);
      border: 2px solid #5c4d3d;
      color: #f59e0b;
      padding: 14px 32px;
      font-family: 'Orbitron', sans-serif;
      font-size: 0.85rem;
      letter-spacing: 3px;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    }

    .synth-button:hover {
      background: linear-gradient(180deg, #4d4439 0%, #3a3530 100%);
      border-color: #f59e0b;
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
      transform: translateY(-2px);
    }

    /* End Screen */
    .synth-end-content {
      text-align: center;
      padding: 30px;
      max-width: 500px;
    }

    .synth-end-status {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.3rem;
      letter-spacing: 4px;
      margin-bottom: 25px;
      padding: 10px 20px;
    }

    .synth-end-status.success {
      color: #84cc16;
      text-shadow: 0 0 20px rgba(132, 204, 22, 0.5);
    }

    .synth-end-status.failed {
      color: #ef4444;
      text-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
    }

    .synth-end-score {
      margin-bottom: 20px;
    }

    .synth-score-dial {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      background: rgba(0, 0, 0, 0.3);
      border: 2px solid #3d3429;
      border-radius: 8px;
      margin-bottom: 15px;
    }

    .synth-dial-ring {
      width: 80px;
      height: 80px;
      border: 4px solid #3d3429;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      background: radial-gradient(circle, #1a1714 0%, #0d0a08 100%);
    }

    .synth-dial-value {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.8rem;
      font-weight: 700;
      color: #f59e0b;
    }

    .synth-dial-label {
      font-size: 0.65rem;
      letter-spacing: 2px;
      color: #8b7355;
    }

    .synth-pass-info {
      font-size: 0.85rem;
      padding: 8px 16px;
      border-radius: 4px;
    }

    .synth-pass-info.success {
      color: #84cc16;
      background: rgba(132, 204, 22, 0.1);
      border: 1px solid rgba(132, 204, 22, 0.3);
    }

    .synth-pass-info.failed {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .synth-end-feedback {
      max-height: 150px;
      overflow-y: auto;
      margin-top: 15px;
      margin-bottom: 20px;
    }

    .synth-stats-list {
      text-align: left;
    }

    .synth-stat-item {
      padding: 10px;
      background: rgba(0, 0, 0, 0.2);
      border-left: 2px solid #5c4d3d;
      margin-bottom: 8px;
    }

    .synth-stat-q {
      font-size: 0.85rem;
      color: #d4a574;
      margin-bottom: 4px;
    }

    .synth-stat-a {
      font-size: 0.8rem;
      color: #8b7355;
    }

    .synth-stat-attempts {
      opacity: 0.6;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .synth-wood-left, .synth-wood-right {
        width: 20px;
      }

      .synth-top-panel, .synth-bottom-panel, .synth-question-strip {
        padding-left: 30px;
        padding-right: 30px;
      }

      .synth-display-frame {
        margin: 0 20px;
        height: 280px;
      }

      .synth-brand-name {
        font-size: 0.9rem;
      }

      .synth-vu-display {
        width: 80px;
      }

      .synth-oscilloscope {
        width: 100px;
      }

      .synth-logo-title {
        font-size: 1.5rem;
        letter-spacing: 3px;
      }

      .synth-inst-item {
        flex-direction: column;
        gap: 4px;
      }

      .synth-inst-desc {
        text-align: center;
        min-width: auto;
      }
    }
  `,
};

export default synthwaveTheme;
