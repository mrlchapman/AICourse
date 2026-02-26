/**
 * Classic TV Theme for Jeopardy
 * Jeopardy Blue #060CE9 + Gold #FFD700 aesthetic
 */

import { GameTheme } from '../../core/types';

export const classicTvTheme: GameTheme = {
  id: 'classic-tv',
  name: 'Classic TV',
  classPrefix: 'jep',
  css: `
    .jeopardy-activity {
      width: 100%;
      margin: 20px auto;
    }

    .jep-container {
      position: relative;
      background: radial-gradient(circle at center, #0a1628 0%, #020818 100%);
      border-radius: 12px;
      overflow: hidden;
      min-height: 520px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #e0e6ed;
    }

    /* Fullscreen */
    .jep-fullscreen-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 250;
      width: 36px;
      height: 36px;
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid #FFD700;
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFD700;
      font-size: 18px;
      transition: background 0.2s;
    }
    .jep-fullscreen-btn:hover { background: rgba(255, 215, 0, 0.2); }
    .jep-fs-collapse { display: none; }

    .jep-maximized {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      max-width: none !important;
      border-radius: 0 !important;
      z-index: 99999 !important;
      margin: 0 !important;
    }
    .jep-activity-maximized {
      position: fixed !important;
      top: 0; left: 0;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 99998 !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    /* Screens */
    .jep-start, .jep-game, .jep-end { display: none; }
    .jep-start.active, .jep-game.active, .jep-end.active { display: flex; }

    /* Start Screen */
    .jep-start {
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 520px;
      padding: 40px;
      text-align: center;
    }
    .jep-logo {
      font-size: 2.5rem;
      font-weight: 900;
      color: #FFD700;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
      margin-bottom: 10px;
      letter-spacing: 2px;
    }
    .jep-logo span { color: #fff; font-size: 3rem; }
    .jep-tagline {
      color: #8899aa;
      font-size: 1.1rem;
      margin-bottom: 30px;
    }
    .jep-rules {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 30px;
      text-align: left;
    }
    .jep-rule {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #b0bec5;
      font-size: 0.95rem;
    }
    .jep-rule-icon { font-size: 1.2rem; }

    /* Buttons */
    .jep-btn {
      padding: 12px 32px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .jep-btn.primary {
      background: linear-gradient(135deg, #060CE9 0%, #0a14ff 100%);
      color: #FFD700;
      border: 2px solid #FFD700;
    }
    .jep-btn.primary:hover {
      background: linear-gradient(135deg, #0a14ff 0%, #1a24ff 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 20px rgba(6, 12, 233, 0.4);
    }
    .jep-btn.secondary {
      background: rgba(255, 215, 0, 0.1);
      color: #FFD700;
      border: 1px solid #FFD700;
    }
    .jep-btn.secondary:hover { background: rgba(255, 215, 0, 0.2); }

    /* Game Screen */
    .jep-game {
      flex-direction: column;
      min-height: 520px;
      position: relative;
    }

    /* HUD */
    .jep-hud {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      background: rgba(0,0,0,0.4);
      border-bottom: 2px solid #FFD700;
    }
    .jep-score {
      font-size: 1.2rem;
      font-weight: 700;
      color: #FFD700;
    }
    .jep-clues-left { color: #8899aa; font-size: 0.9rem; }

    /* Board */
    .jep-board {
      display: grid;
      gap: 4px;
      padding: 16px;
      flex: 1;
    }
    .jep-cat-header {
      background: #060CE9;
      color: #FFD700;
      text-align: center;
      padding: 12px 4px;
      font-weight: 800;
      font-size: 0.85rem;
      text-transform: uppercase;
      border-radius: 4px;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 50px;
    }
    .jep-cell {
      background: #060CE9;
      color: #FFD700;
      text-align: center;
      padding: 16px 4px;
      font-weight: 900;
      font-size: 1.3rem;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60px;
    }
    .jep-cell:hover {
      background: #0a14ff;
      transform: scale(1.03);
      box-shadow: 0 2px 12px rgba(6, 12, 233, 0.5);
    }
    .jep-cell.used {
      background: #1a2a40;
      color: #334455;
      cursor: default;
      transform: none;
      box-shadow: none;
    }

    /* Clue Modal */
    .jep-clue-overlay {
      display: none;
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.85);
      z-index: 200;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px;
    }
    .jep-clue-overlay.active { display: flex; }

    .jep-dd-banner {
      font-size: 2rem;
      font-weight: 900;
      color: #FFD700;
      text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
      margin-bottom: 20px;
      animation: jepPulse 0.8s ease-in-out infinite alternate;
    }
    @keyframes jepPulse {
      from { transform: scale(1); opacity: 0.8; }
      to { transform: scale(1.05); opacity: 1; }
    }

    .jep-wager-section {
      text-align: center;
      margin-bottom: 20px;
    }
    .jep-wager-label { color: #b0bec5; margin-bottom: 8px; }
    .jep-wager-input {
      width: 150px;
      padding: 8px 16px;
      background: #0a1628;
      border: 2px solid #FFD700;
      border-radius: 8px;
      color: #FFD700;
      font-size: 1.3rem;
      font-weight: 700;
      text-align: center;
      outline: none;
    }
    .jep-wager-input:focus { box-shadow: 0 0 10px rgba(255, 215, 0, 0.3); }

    .jep-clue-category {
      font-size: 0.9rem;
      color: #FFD700;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }
    .jep-clue-value {
      font-size: 1rem;
      color: #8899aa;
      margin-bottom: 20px;
    }
    .jep-clue-text {
      font-size: 1.4rem;
      color: #fff;
      text-align: center;
      max-width: 600px;
      line-height: 1.5;
      margin-bottom: 30px;
      font-weight: 500;
    }

    .jep-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      max-width: 600px;
      width: 100%;
    }
    .jep-option {
      padding: 14px 16px;
      background: rgba(6, 12, 233, 0.3);
      border: 2px solid #060CE9;
      border-radius: 8px;
      color: #e0e6ed;
      cursor: pointer;
      font-size: 0.95rem;
      text-align: center;
      transition: all 0.2s;
    }
    .jep-option:hover {
      background: rgba(6, 12, 233, 0.5);
      border-color: #FFD700;
      color: #fff;
    }
    .jep-option.correct {
      background: rgba(34, 197, 94, 0.3) !important;
      border-color: #22c55e !important;
      color: #fff !important;
    }
    .jep-option.wrong {
      background: rgba(239, 68, 68, 0.3) !important;
      border-color: #ef4444 !important;
      color: #fff !important;
    }
    .jep-option.disabled { pointer-events: none; opacity: 0.5; }

    /* Timer */
    .jep-timer-wrap {
      width: 100%;
      max-width: 600px;
      height: 6px;
      background: rgba(255,255,255,0.1);
      border-radius: 3px;
      margin-top: 20px;
      overflow: hidden;
    }
    .jep-timer-bar {
      height: 100%;
      background: linear-gradient(90deg, #FFD700, #ff8c00);
      border-radius: 3px;
      width: 100%;
      transition: width 0.1s linear;
    }
    .jep-timer-bar.warning { background: linear-gradient(90deg, #ff8c00, #ef4444); }

    /* Feedback */
    .jep-feedback {
      display: none;
      text-align: center;
      margin-top: 16px;
      max-width: 600px;
    }
    .jep-feedback.active { display: block; }
    .jep-feedback-result {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .jep-feedback-result.correct { color: #22c55e; }
    .jep-feedback-result.wrong { color: #ef4444; }
    .jep-feedback-explanation {
      color: #8899aa;
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 12px;
    }
    .jep-feedback-points {
      color: #FFD700;
      font-weight: 600;
    }

    /* Final Jeopardy */
    .jep-final-overlay {
      display: none;
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.9);
      z-index: 200;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px;
    }
    .jep-final-overlay.active { display: flex; }
    .jep-final-title {
      font-size: 2rem;
      font-weight: 900;
      color: #FFD700;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 3px;
    }

    /* End Screen */
    .jep-end {
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 520px;
      padding: 40px;
      text-align: center;
    }
    .jep-end-title {
      font-size: 2rem;
      font-weight: 900;
      margin-bottom: 10px;
    }
    .jep-end-title.win { color: #FFD700; }
    .jep-end-title.lose { color: #ef4444; }
    .jep-final-score {
      font-size: 2.5rem;
      font-weight: 900;
      color: #FFD700;
      margin: 10px 0;
    }
    .jep-end-stats {
      display: flex;
      gap: 30px;
      margin: 20px 0;
    }
    .jep-stat { text-align: center; }
    .jep-stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
    }
    .jep-stat-label {
      font-size: 0.8rem;
      color: #8899aa;
      text-transform: uppercase;
    }
    .jep-review {
      margin-top: 20px;
      max-width: 600px;
      width: 100%;
      text-align: left;
    }
    .jep-review-title {
      color: #FFD700;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .jep-review-item {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 8px;
    }
    .jep-review-q { color: #e0e6ed; font-weight: 600; margin-bottom: 4px; font-size: 0.9rem; }
    .jep-review-a { color: #22c55e; font-size: 0.85rem; }

    .jep-end-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }

    /* Responsive */
    @media (max-width: 640px) {
      .jep-cat-header { font-size: 0.7rem; padding: 8px 2px; min-height: 40px; }
      .jep-cell { font-size: 1rem; padding: 10px 2px; min-height: 45px; }
      .jep-options { grid-template-columns: 1fr; }
      .jep-clue-text { font-size: 1.1rem; }
      .jep-logo { font-size: 1.8rem; }
      .jep-logo span { font-size: 2.2rem; }
    }
  `
};
