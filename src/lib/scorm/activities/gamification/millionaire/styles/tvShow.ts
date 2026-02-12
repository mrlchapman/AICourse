/**
 * Classic TV Theme for Millionaire
 * Classic "Who Wants to Be a Millionaire" style aesthetic
 */

import { GameTheme } from '../../core/types';

export const classicTvTheme: GameTheme = {
  id: 'classic-tv',
  name: 'Classic TV',
  classPrefix: 'mill',
  css: `
    .millionaire-activity {
      width: 100%;
      margin: 20px auto;
    }

    .mill-container {
      position: relative;
      background: radial-gradient(circle at center, #1a2a40 0%, #020b1a 100%);
      border-radius: 12px;
      overflow: hidden;
      min-height: 520px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #e0e6ed;
    }

    /* Fullscreen Button */
    .mill-fullscreen-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 250;
      width: 36px;
      height: 36px;
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid #d4af37;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      color: #d4af37;
      font-size: 1.2rem;
    }

    .mill-fullscreen-btn:hover {
      background: rgba(212, 175, 55, 0.2);
      box-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
    }

    .mill-fs-collapse { display: none; transform: rotate(45deg); }

    /* CSS Fullscreen Mode */
    .mill-activity-maximized {
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

    .mill-maximized {
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

    .mill-maximized .mill-game {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .mill-maximized .mill-layout {
      flex: 1;
      min-height: 100vh;
    }

    .mill-maximized .mill-ladder {
      width: 240px;
      padding: 15px 12px;
    }

    .mill-maximized .mill-step {
      padding: 10px 14px;
      font-size: 1rem;
    }

    .mill-maximized .mill-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }

    .mill-maximized .mill-hud {
      margin-bottom: 20px;
    }

    .mill-maximized .mill-question {
      font-size: 1.1rem;
      padding: 20px;
      min-height: auto;
      margin-bottom: 15px;
    }

    .mill-maximized .mill-options {
      gap: 10px;
      margin-bottom: 15px;
    }

    .mill-maximized .mill-opt {
      padding: 12px 18px;
      font-size: 1rem;
    }

    .mill-maximized .mill-controls {
      margin-top: 10px;
    }

    /* Start Screen */
    .mill-start {
      position: absolute;
      inset: 0;
      background: rgba(2, 11, 26, 0.98);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    .mill-start.active { display: flex; }

    .mill-start-content {
      text-align: center;
      max-width: 450px;
      padding: 30px;
    }

    .mill-logo {
      font-size: 1.4rem;
      color: #e0e8f0;
      margin: 0 0 10px 0;
      letter-spacing: 2px;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
    .mill-logo span {
      display: block;
      font-size: 2.2rem;
      color: #ffd700;
      text-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.5);
    }
    .mill-tagline {
      color: #9aa8b6;
      margin-bottom: 20px;
    }
    .mill-rules {
      text-align: left;
      background: rgba(0,0,0,0.3);
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .mill-rule {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
      font-size: 0.9rem;
    }
    .mill-rule-icon { font-size: 1.2rem; }

    /* Buttons */
    .mill-btn {
      padding: 12px 24px;
      border: none;
      border-radius: 5px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mill-btn.primary {
      background: #d4af37;
      color: #000;
    }
    .mill-btn.primary:hover { background: #fff; }
    .mill-btn.secondary {
      background: #333;
      color: #fff;
    }
    .mill-btn.secondary:hover { background: #444; }

    /* Game Screen */
    .mill-game {
      display: none;
      height: 100%;
    }
    .mill-game.active { display: block; }

    .mill-layout {
      display: flex;
      height: 100%;
      min-height: 520px;
    }

    /* Ladder */
    .mill-ladder {
      width: 180px;
      background: rgba(0,0,0,0.5);
      border-right: 2px solid #8a7020;
      padding: 10px 8px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
    }
    .mill-step {
      display: flex;
      justify-content: space-between;
      padding: 6px 10px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.85rem;
      color: #8a7020;
      position: relative;
    }
    .mill-step.current {
      background: #d4af37;
      color: #000;
      font-weight: bold;
      box-shadow: 0 0 10px #d4af37;
    }
    .mill-step.passed { color: #2ecc71; opacity: 0.6; }
    .mill-step.safe { color: #e0e6ed; }
    .mill-step.safe::before {
      content: '...';
      position: absolute;
      left: 2px;
      font-size: 0.7rem;
      color: #e0e6ed;
    }

    /* Main Area */
    .mill-main {
      flex: 1;
      padding: 15px;
      display: flex;
      flex-direction: column;
    }

    /* HUD */
    .mill-hud {
      display: flex;
      align-items: center;
      gap: 15px;
      background: rgba(0,0,0,0.3);
      padding: 10px 15px;
      border-radius: 8px;
      margin-bottom: 15px;
    }
    .mill-hud-info { display: flex; flex-direction: column; gap: 2px; }
    .mill-banked { color: #d4af37; font-weight: bold; font-size: 1rem; }
    .mill-playing { color: #9aa8b6; font-size: 0.8rem; }

    .mill-timer-wrap {
      flex: 1;
      height: 8px;
      background: #333;
      border-radius: 4px;
      overflow: hidden;
    }
    .mill-timer-bar {
      height: 100%;
      width: 100%;
      background: #00f0ff;
      transition: width 1s linear;
    }
    .mill-timer-bar.warning { background: #f39c12; }
    .mill-timer-bar.danger { background: #ff4d4d; }

    .mill-timer-text {
      width: 30px;
      text-align: right;
      font-weight: bold;
    }
    .mill-timer-toggle {
      background: transparent;
      border: 1px solid #00f0ff;
      color: #00f0ff;
      padding: 4px 8px;
      font-size: 0.75rem;
      border-radius: 4px;
      cursor: pointer;
    }
    .mill-timer-toggle.active {
      background: #00f0ff;
      color: #000;
    }

    /* Question */
    .mill-question {
      background: linear-gradient(180deg, #0a1525 0%, #15253a 50%, #0a1525 100%);
      border: 2px solid #e0e6ed;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      font-size: 1.1rem;
      margin-bottom: 20px;
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Options */
    .mill-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 15px;
    }
    .mill-opt {
      background: linear-gradient(90deg, #0a1525 0%, #1c2e44 50%, #0a1525 100%);
      border: 1px solid #9aa8b6;
      border-radius: 25px;
      padding: 12px 15px;
      color: #e0e6ed;
      font-size: 0.95rem;
      cursor: pointer;
      text-align: left;
      transition: all 0.2s;
    }
    .mill-opt:hover:not(:disabled) {
      border-color: #d4af37;
      background: #2c3e50;
    }
    .mill-opt.selected {
      background: #f39c12;
      border-color: #f39c12;
      color: #000;
      font-weight: bold;
    }
    .mill-opt.correct {
      background: #2ecc71;
      border-color: #2ecc71;
      color: #000;
      font-weight: bold;
    }
    .mill-opt.wrong {
      background: #ff4d4d;
      border-color: #ff4d4d;
      color: #fff;
    }
    .mill-opt:disabled { opacity: 0.5; cursor: default; }
    .mill-opt.hidden { opacity: 0; pointer-events: none; }

    .mill-opt-label {
      color: #d4af37;
      font-weight: bold;
      margin-right: 8px;
    }
    .mill-opt.selected .mill-opt-label,
    .mill-opt.correct .mill-opt-label,
    .mill-opt.wrong .mill-opt-label { color: inherit; }

    /* Controls */
    .mill-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }
    .mill-lifelines { display: flex; gap: 10px; }

    .mill-life {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 2px solid #00f0ff;
      background: transparent;
      color: #00f0ff;
      font-size: 0.7rem;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .mill-life:hover:not(:disabled) {
      background: #00f0ff;
      color: #000;
      box-shadow: 0 0 10px #00f0ff;
    }
    .mill-life:disabled {
      border-color: #555;
      color: #555;
      cursor: not-allowed;
      text-decoration: line-through;
    }

    .mill-walk {
      padding: 12px 20px;
      background: #ff4d4d;
      border: none;
      color: #fff;
      font-weight: bold;
      border-radius: 5px;
      cursor: pointer;
      box-shadow: 0 0 10px rgba(255, 77, 77, 0.5);
    }
    .mill-walk:hover { background: #ff6666; }

    /* Modals - Contained within game */
    .mill-modal {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 200;
      padding: 20px;
      box-sizing: border-box;
    }
    .mill-modal.active { display: flex; }

    .mill-modal-box {
      background: #0a1525;
      border: 2px solid #d4af37;
      padding: 25px;
      border-radius: 10px;
      text-align: center;
      max-width: 450px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 0 50px rgba(0,0,0,0.8);
      position: relative;
    }
    .mill-modal-box.wide { max-width: 550px; }

    .mill-modal-title {
      font-size: 1.5rem;
      margin: 0 0 15px 0;
    }
    .mill-modal-title.gold { color: #d4af37; }
    .mill-modal-title.correct { color: #2ecc71; }
    .mill-modal-title.wrong { color: #ff4d4d; }

    .mill-modal-text {
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .mill-modal-btns {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    /* End Screen */
    .mill-prize {
      font-size: 2.5rem;
      color: #d4af37;
      font-weight: bold;
      margin: 10px 0 20px 0;
    }
    .mill-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      background: rgba(0,0,0,0.3);
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 15px;
    }
    .mill-stat { display: flex; flex-direction: column; text-align: center; }
    .mill-stat-val { font-size: 1.2rem; font-weight: bold; color: #00f0ff; }
    .mill-stat-lbl { font-size: 0.7rem; color: #9aa8b6; }

    .mill-review {
      text-align: left;
      margin-bottom: 15px;
    }
    .mill-review-title {
      font-size: 0.85rem;
      color: #9aa8b6;
      border-bottom: 1px solid #333;
      padding-bottom: 5px;
      margin-bottom: 10px;
    }
    .mill-review-list {
      max-height: 120px;
      overflow-y: auto;
      border: 1px solid #333;
      padding: 10px;
      font-size: 0.85rem;
    }
    .mill-review-ok { color: #2ecc71; text-align: center; padding: 10px; }
    .mill-review-item {
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #333;
    }
    .mill-review-q { font-weight: bold; margin-bottom: 4px; }
    .mill-review-ans .wrong { color: #ff4d4d; }
    .mill-review-ans .correct { color: #2ecc71; }
    .mill-review-exp { color: #00f0ff; font-style: italic; font-size: 0.8rem; margin-top: 4px; }
  `,
};

export default classicTvTheme;
