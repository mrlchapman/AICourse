/**
 * TV Show Theme for The Chase
 * A dramatic TV game show aesthetic inspired by The Chase
 */

import { GameTheme } from '../../core/types';

export const tvShowTheme: GameTheme = {
  id: 'tv-show',
  name: 'TV Show',
  classPrefix: 'chase',
  css: `
    .chase-activity {
      width: 100%;
      margin: 20px auto;
    }

    .chase-container {
      position: relative;
      background: radial-gradient(circle at center, #1a2a40 0%, #020b1a 100%);
      border-radius: 12px;
      overflow: hidden;
      min-height: 520px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #e0e6ed;
    }

    /* Fullscreen Button */
    .chase-fullscreen-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 250;
      width: 36px;
      height: 36px;
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid #ff4d4d;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      color: #ff4d4d;
      font-size: 1.2rem;
    }

    .chase-fullscreen-btn:hover {
      background: rgba(255, 77, 77, 0.2);
      box-shadow: 0 0 10px rgba(255, 77, 77, 0.4);
    }

    .chase-fs-collapse { display: none; transform: rotate(45deg); }

    /* CSS Fullscreen Mode */
    .chase-activity-maximized {
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
      background: #020b1a;
    }

    .chase-maximized {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      max-width: none !important;
      border-radius: 0 !important;
      border: none !important;
      z-index: 999999 !important;
      display: flex;
      flex-direction: column;
    }

    .chase-maximized .chase-game {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .chase-maximized .chase-layout {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 40px;
      padding: 20px 40px;
      align-items: center;
    }

    .chase-maximized .chase-ladder-col {
      width: 100%;
    }

    .chase-maximized .chase-ladder {
      width: 100%;
      max-width: 280px;
    }

    .chase-maximized .chase-step {
      min-height: 55px;
      font-size: 1.3rem;
    }

    .chase-maximized .chase-marker {
      width: 28px;
      height: 28px;
    }

    .chase-maximized .chase-accuracy {
      font-size: 1rem;
      margin-top: 15px;
    }

    .chase-maximized .chase-main {
      width: 100%;
      max-width: 900px;
    }

    .chase-maximized .chase-question-box {
      font-size: 1.1rem;
      padding: 20px;
      min-height: auto;
    }

    .chase-maximized .chase-options {
      gap: 10px;
    }

    .chase-maximized .chase-opt {
      padding: 12px 18px;
      font-size: 1rem;
    }

    /* Start Screen */
    .chase-start {
      position: absolute;
      inset: 0;
      background: rgba(2, 11, 26, 0.98);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    .chase-start.active { display: flex; }

    .chase-start-content {
      text-align: center;
      max-width: 450px;
      padding: 30px;
    }

    .chase-logo {
      font-size: 1.4rem;
      color: #e0e8f0;
      margin: 0 0 10px 0;
      letter-spacing: 2px;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
    .chase-logo span {
      display: block;
      font-size: 2.5rem;
      color: #ff6b6b;
      text-shadow: 0 0 30px rgba(255, 107, 107, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
    .chase-tagline {
      color: #9aa8b6;
      margin-bottom: 20px;
    }
    .chase-rules {
      text-align: left;
      background: rgba(0,0,0,0.3);
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .chase-rule {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      font-size: 0.9rem;
    }
    .chase-rule-icon { font-size: 1.2rem; }

    /* Buttons */
    .chase-btn {
      padding: 12px 24px;
      border: 1px solid #2b3c50;
      background: rgba(0,0,0,0.4);
      border-radius: 8px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
      color: #e0e6ed;
    }
    .chase-btn.primary {
      background: rgba(212,175,55,0.15);
      border-color: #d4af37;
      color: #d4af37;
    }
    .chase-btn.primary:hover { background: rgba(212,175,55,0.25); }
    .chase-btn.secondary { background: #333; color: #fff; }
    .chase-btn.secondary:hover { background: #444; }

    /* Game Screen */
    .chase-game {
      display: none;
      height: 100%;
      flex-direction: column;
    }
    .chase-game.active { display: flex; }

    /* Top Bar */
    .chase-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(0,0,0,0.35);
      border-bottom: 1px solid #223040;
      padding: 12px 20px;
    }
    .chase-title {
      font-weight: 900;
      color: #ff4d4d;
      font-size: 1.2rem;
      letter-spacing: 1px;
      text-shadow: 0 0 15px rgba(255, 77, 77, 0.4);
    }
    .chase-sub { color: #9aa8b6; font-size: 0.85rem; }

    .chase-hud-right { display: flex; align-items: center; gap: 10px; }

    .chase-timer-wrap {
      width: 150px;
      height: 8px;
      background: #2a2f36;
      border-radius: 4px;
      overflow: hidden;
    }
    .chase-timer-bar {
      height: 100%;
      width: 100%;
      background: #00f0ff;
      transition: width 1s linear;
    }
    .chase-timer-bar.warning { background: #f39c12; }
    .chase-timer-bar.danger { background: #ff4d4d; }

    .chase-timer-text {
      width: 30px;
      text-align: right;
      font-weight: bold;
      color: #00f0ff;
    }
    .chase-timer-btn {
      background: transparent;
      border: 1px solid #00f0ff;
      color: #00f0ff;
      padding: 4px 8px;
      font-size: 0.75rem;
      border-radius: 4px;
      cursor: pointer;
    }
    .chase-timer-btn.active {
      background: rgba(0, 240, 255, 0.15);
    }

    /* Layout */
    .chase-layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 20px;
      padding: 15px;
      flex: 1;
    }

    /* Ladder */
    .chase-ladder-col { display: flex; flex-direction: column; align-items: center; }
    .chase-ladder {
      width: 100%;
      padding: 15px 10px;
      border-radius: 12px;
      background: #050f1e;
      border: 2px solid #1a2a40;
    }
    .chase-steps {
      display: flex;
      flex-direction: column-reverse;
      gap: 4px;
    }
    .chase-step {
      height: 40px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      position: relative;
      border: 1px solid rgba(255,255,255,0.08);
      background: linear-gradient(90deg, #0d1b2e 0%, #15253a 50%, #0d1b2e 100%);
      color: #9aa8b6;
      margin: 0 auto;
      transition: all 0.3s;
    }
    .chase-step:last-child {
      border-color: #d4af37;
      color: #d4af37;
      background: rgba(212,175,55,0.15);
    }

    /* Markers */
    .chase-marker {
      position: absolute;
      width: 0;
      height: 0;
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      transition: opacity 0.3s;
      opacity: 0;
    }
    .chase-marker.player {
      left: -12px;
      border-left: 10px solid #00f0ff;
      filter: drop-shadow(0 0 6px #00f0ff);
    }
    .chase-marker.chaser {
      right: -12px;
      border-right: 10px solid #ff4d4d;
      filter: drop-shadow(0 0 6px #ff4d4d);
    }
    .chase-step.has-player .chase-marker.player { opacity: 1; }
    .chase-step.has-chaser .chase-marker.chaser { opacity: 1; }
    .chase-step.has-player {
      background: rgba(0, 240, 255, 0.15);
      border-color: #00f0ff;
      color: #e0e6ed;
    }
    .chase-step.has-chaser { border-color: #ff4d4d; }
    .chase-step.has-player.has-chaser {
      background: rgba(255, 77, 77, 0.25);
    }

    .chase-accuracy {
      margin-top: 10px;
      font-size: 0.8rem;
      color: #9aa8b6;
    }

    /* Game Panel */
    .chase-panel { display: flex; flex-direction: column; gap: 15px; }

    .chase-info-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .chase-gap { font-size: 1rem; color: #9aa8b6; }
    .chase-gap-num { font-size: 1.8rem; font-weight: 900; color: #e0e6ed; margin-left: 8px; }
    .chase-pot { text-align: right; }
    .chase-pot-label { font-size: 0.75rem; color: #d4af37; letter-spacing: 1px; }
    .chase-pot-val { font-size: 1.5rem; font-weight: 900; color: #d4af37; }

    .chase-question {
      background: linear-gradient(135deg, #0a1525 0%, #1c2e44 100%);
      border: 2px solid rgba(255,255,255,0.6);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      font-size: 1.1rem;
      font-weight: bold;
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chase-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .chase-opt {
      background: linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%);
      border: 2px solid #2b3c50;
      border-radius: 10px;
      padding: 15px;
      color: #e0e6ed;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      text-align: left;
      transition: all 0.15s;
    }
    .chase-opt:hover:not(:disabled) {
      border-color: #d4af37;
      transform: translateY(-2px);
    }
    .chase-opt:disabled { opacity: 0.6; cursor: default; transform: none; }
    .chase-opt.selected {
      background: #f39c12;
      border-color: #f39c12;
      color: #000;
    }
    .chase-opt.correct {
      background: #2ecc71;
      border-color: #2ecc71;
      color: #000;
    }
    .chase-opt.wrong {
      background: #ff4d4d;
      border-color: #ff4d4d;
      color: #fff;
    }
    .chase-opt-label {
      color: #d4af37;
      font-weight: 900;
      margin-right: 8px;
    }
    .chase-opt.selected .chase-opt-label,
    .chase-opt.correct .chase-opt-label { color: inherit; }

    /* Modals */
    .chase-modal {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.92);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 200;
    }
    .chase-modal.active { display: flex; }
    .chase-modal-box {
      background: #0a1525;
      border: 2px solid #d4af37;
      padding: 25px;
      border-radius: 12px;
      text-align: center;
      max-width: 400px;
      width: 90%;
    }
    .chase-modal-title {
      font-size: 1.5rem;
      font-weight: 900;
      margin: 0 0 15px 0;
      color: #d4af37;
    }
    .chase-modal-text {
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .chase-modal-btns {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .chase-report {
      background: rgba(0,0,0,0.3);
      border: 1px solid #333;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 15px;
    }
    .chase-report-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 1.1rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    .chase-report-row:last-child { border: none; }

    @media (max-width: 700px) {
      .chase-layout { grid-template-columns: 1fr; }
      .chase-ladder-col { order: 2; }
      .chase-panel { order: 1; }
      .chase-options { grid-template-columns: 1fr; }
    }
  `,
};

export default tvShowTheme;
