/**
 * Cold War Theme for Battleships
 * A retro military submarine command aesthetic
 */

import { GameTheme } from '../../core/types';
import { fontImports } from '../../core/styles/base';

export const coldWarTheme: GameTheme = {
  id: 'cold-war',
  name: 'Cold War',
  classPrefix: 'bs',
  css: `
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');

    .battleships-activity {
      width: 100%;
      margin: 20px auto;
      max-width: 100%;
    }

    .bs-console {
      position: relative;
      background: #0a0c0f;
      border-radius: 16px;
      overflow: hidden;
      min-height: 520px;
      font-family: 'Share Tech Mono', monospace;
      color: #33ff77;
      border: 3px solid #1a1f28;
      box-shadow:
        inset 0 0 80px rgba(51, 255, 119, 0.03),
        0 0 40px rgba(0, 0, 0, 0.8),
        0 20px 60px rgba(0, 0, 0, 0.6);
    }

    /* Fullscreen Button */
    .bs-fullscreen-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      z-index: 150;
      width: 36px;
      height: 36px;
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid #2a4a35;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      color: #33ff77;
      font-size: 1.2rem;
    }

    .bs-fullscreen-btn:hover {
      background: rgba(51, 255, 119, 0.15);
      border-color: #33ff77;
      box-shadow: 0 0 15px rgba(51, 255, 119, 0.3);
    }

    .bs-fs-expand, .bs-fs-collapse { line-height: 1; }
    .bs-fs-collapse { display: none; transform: rotate(45deg); }

    /* CSS Fullscreen Mode */
    .bs-activity-maximized {
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
      background: #000;
    }

    .bs-maximized {
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

    .bs-maximized .bs-fullscreen-btn { top: 15px; right: 15px; }
    .bs-native-fullscreen { border-radius: 0 !important; border: none !important; }
    .bs-console:fullscreen, .bs-console:-webkit-full-screen { border-radius: 0; border: none; }

    /* Fullscreen Adaptive Layout */
    .bs-maximized .bs-game, .bs-native-fullscreen .bs-game, .bs-console:fullscreen .bs-game {
      padding: 20px 40px;
      height: 100vh;
      box-sizing: border-box;
    }

    .bs-maximized .bs-topbar, .bs-native-fullscreen .bs-topbar { padding: 15px 25px; margin-bottom: 20px; }
    .bs-maximized .bs-commander-status, .bs-native-fullscreen .bs-commander-status { font-size: 1rem; padding: 10px 20px; }
    .bs-maximized .bs-teletype, .bs-native-fullscreen .bs-teletype { font-size: 1rem; padding: 12px 20px; }
    .bs-maximized .bs-gauge-label, .bs-native-fullscreen .bs-gauge-label { font-size: 0.75rem; }
    .bs-maximized .bs-gauge-value, .bs-native-fullscreen .bs-gauge-value { font-size: 1.5rem; }
    .bs-maximized .bs-status-lamp, .bs-native-fullscreen .bs-status-lamp { width: 18px; height: 18px; }
    .bs-maximized .bs-operations, .bs-native-fullscreen .bs-operations { flex: 1; gap: 20px; min-height: 0; }
    .bs-maximized .bs-display-frame, .bs-native-fullscreen .bs-display-frame { padding: 20px; }
    .bs-maximized .bs-display-header, .bs-native-fullscreen .bs-display-header { padding-bottom: 15px; margin-bottom: 15px; }
    .bs-maximized .bs-display-title, .bs-native-fullscreen .bs-display-title { font-size: 1rem; letter-spacing: 3px; }
    .bs-maximized .bs-display-count, .bs-native-fullscreen .bs-display-count { font-size: 1.3rem; letter-spacing: 5px; }
    .bs-maximized .bs-display, .bs-native-fullscreen .bs-display { flex: 1 1 0; min-width: 0; }
    .bs-maximized .bs-sonar-screen, .bs-native-fullscreen .bs-sonar-screen { flex: 1; }
    .bs-maximized .bs-sonar-grid, .bs-native-fullscreen .bs-sonar-grid, .bs-console:fullscreen .bs-sonar-grid {
      width: calc(100% - 20px); height: auto; aspect-ratio: 1; padding: 10px; max-width: calc(100% - 20px);
    }
    .bs-maximized .bs-cell, .bs-native-fullscreen .bs-cell { border-radius: 4px; }
    .bs-maximized .bs-sonar-grid, .bs-native-fullscreen .bs-sonar-grid { gap: 4px; }
    .bs-maximized .bs-control-panel, .bs-native-fullscreen .bs-control-panel { width: 240px; min-width: 220px; padding: 20px; gap: 20px; }
    .bs-maximized .bs-section-label, .bs-native-fullscreen .bs-section-label { font-size: 0.8rem; letter-spacing: 3px; padding-bottom: 10px; }
    .bs-maximized .bs-weapon, .bs-native-fullscreen .bs-weapon { padding: 15px; border-radius: 10px; }
    .bs-maximized .bs-weapon-icon, .bs-native-fullscreen .bs-weapon-icon { font-size: 1.3rem; }
    .bs-maximized .bs-weapon-name, .bs-native-fullscreen .bs-weapon-name { font-size: 0.85rem; }
    .bs-maximized .bs-weapon-desc, .bs-native-fullscreen .bs-weapon-desc { font-size: 0.7rem; }
    .bs-maximized .bs-weapon-indicator, .bs-native-fullscreen .bs-weapon-indicator { width: 14px; height: 14px; }
    .bs-maximized .bs-intel-pip, .bs-native-fullscreen .bs-intel-pip { height: 12px; }
    .bs-maximized .bs-intel-ready, .bs-native-fullscreen .bs-intel-ready { font-size: 0.8rem; padding: 12px; }
    .bs-maximized .bs-oscilloscope, .bs-native-fullscreen .bs-oscilloscope { height: 80px; border-radius: 10px; }
    .bs-maximized .bs-cell.hit::after, .bs-native-fullscreen .bs-cell.hit::after { font-size: 1.5rem; }
    .bs-maximized .bs-cell.miss::after, .bs-native-fullscreen .bs-cell.miss::after { font-size: 2rem; }
    .bs-maximized .bs-start-inner, .bs-native-fullscreen .bs-start-inner { max-width: 600px; padding: 40px; }
    .bs-maximized .bs-logo-icon, .bs-native-fullscreen .bs-logo-icon { font-size: 4rem; }
    .bs-maximized .bs-logo-text, .bs-native-fullscreen .bs-logo-text { font-size: 2.5rem; letter-spacing: 8px; }
    .bs-maximized .bs-classification, .bs-native-fullscreen .bs-classification { font-size: 0.85rem; letter-spacing: 5px; padding: 12px; margin-bottom: 30px; }
    .bs-maximized .bs-terminal, .bs-native-fullscreen .bs-terminal { font-size: 1rem; padding: 20px; margin-bottom: 20px; }
    .bs-maximized .bs-orders, .bs-native-fullscreen .bs-orders { padding: 20px; margin-bottom: 30px; }
    .bs-maximized .bs-orders-title, .bs-native-fullscreen .bs-orders-title { font-size: 0.9rem; margin-bottom: 15px; }
    .bs-maximized .bs-order, .bs-native-fullscreen .bs-order { font-size: 1rem; margin-bottom: 10px; }
    .bs-maximized .bs-button-inner, .bs-native-fullscreen .bs-button-inner { padding: 18px 40px; font-size: 1.1rem; }
    .bs-maximized .bs-warning-strip, .bs-native-fullscreen .bs-warning-strip { font-size: 0.85rem; margin-top: 25px; }
    .bs-maximized .bs-deploy-container, .bs-native-fullscreen .bs-deploy-container { max-width: 1000px; }
    .bs-maximized .bs-deploy-title, .bs-native-fullscreen .bs-deploy-title { font-size: 2rem; }
    .bs-maximized .bs-deploy-subtitle, .bs-native-fullscreen .bs-deploy-subtitle { font-size: 1rem; }
    .bs-maximized .bs-deploy-main, .bs-native-fullscreen .bs-deploy-main { gap: 30px; }
    .bs-maximized .bs-deploy-grid-wrapper, .bs-native-fullscreen .bs-deploy-grid-wrapper { padding: 25px; }
    .bs-maximized .bs-deploy-grid-wrapper .bs-sonar-screen, .bs-native-fullscreen .bs-deploy-grid-wrapper .bs-sonar-screen { max-width: 500px; }
    .bs-maximized .bs-deploy-controls, .bs-native-fullscreen .bs-deploy-controls { width: 280px; gap: 20px; }
    .bs-maximized .bs-instruction-item, .bs-native-fullscreen .bs-instruction-item { font-size: 0.9rem; margin-bottom: 10px; }
    .bs-maximized .bs-key, .bs-native-fullscreen .bs-key { font-size: 0.75rem; padding: 4px 10px; }
    .bs-maximized .bs-ship-btn, .bs-native-fullscreen .bs-ship-btn { padding: 12px 15px; }
    .bs-maximized .bs-ship-segment, .bs-native-fullscreen .bs-ship-segment { width: 20px; height: 20px; }
    .bs-maximized .bs-ship-label, .bs-native-fullscreen .bs-ship-label { font-size: 0.85rem; }
    .bs-maximized .bs-rotate-btn, .bs-native-fullscreen .bs-rotate-btn { padding: 15px; font-size: 0.9rem; }
    .bs-maximized .bs-rotate-icon, .bs-native-fullscreen .bs-rotate-icon { font-size: 1.3rem; }
    .bs-maximized .bs-randomize-btn, .bs-native-fullscreen .bs-randomize-btn { padding: 12px; font-size: 0.9rem; }
    .bs-maximized .bs-modal-console, .bs-native-fullscreen .bs-modal-console { max-width: 600px; }
    .bs-maximized .bs-modal-header, .bs-native-fullscreen .bs-modal-header { font-size: 1rem; padding: 20px 25px; }
    .bs-maximized .bs-modal-body, .bs-native-fullscreen .bs-modal-body { padding: 30px; }
    .bs-maximized .bs-question-display, .bs-native-fullscreen .bs-question-display { padding: 20px; margin-bottom: 20px; }
    .bs-maximized .bs-question-text, .bs-native-fullscreen .bs-question-text { font-size: 1.2rem; }
    .bs-maximized .bs-options-grid, .bs-native-fullscreen .bs-options-grid { gap: 15px; }
    .bs-maximized .bs-option, .bs-native-fullscreen .bs-option { padding: 18px; border-radius: 10px; }
    .bs-maximized .bs-option-letter, .bs-native-fullscreen .bs-option-letter { width: 36px; height: 36px; font-size: 1rem; }
    .bs-maximized .bs-option-text, .bs-native-fullscreen .bs-option-text { font-size: 1rem; }
    .bs-maximized .bs-feedback-panel, .bs-native-fullscreen .bs-feedback-panel { padding: 30px; }
    .bs-maximized .bs-feedback-icon, .bs-native-fullscreen .bs-feedback-icon { font-size: 3rem; }
    .bs-maximized .bs-feedback-title, .bs-native-fullscreen .bs-feedback-title { font-size: 1.1rem; }
    .bs-maximized .bs-feedback-detail, .bs-native-fullscreen .bs-feedback-detail { font-size: 1rem; }
    .bs-maximized .bs-end-console, .bs-native-fullscreen .bs-end-console { max-width: 650px; padding: 50px; }
    .bs-maximized .bs-end-header, .bs-native-fullscreen .bs-end-header { font-size: 2.5rem; margin-bottom: 40px; }
    .bs-maximized .bs-end-stats, .bs-native-fullscreen .bs-end-stats { gap: 20px; margin-bottom: 35px; }
    .bs-maximized .bs-stat-dial, .bs-native-fullscreen .bs-stat-dial { padding: 25px 15px; border-radius: 15px; }
    .bs-maximized .bs-dial-value, .bs-native-fullscreen .bs-dial-value { font-size: 2rem; }
    .bs-maximized .bs-dial-label, .bs-native-fullscreen .bs-dial-label { font-size: 0.8rem; }
    .bs-maximized .bs-debrief, .bs-native-fullscreen .bs-debrief { padding: 25px; margin-bottom: 30px; }
    .bs-maximized .bs-debrief-header, .bs-native-fullscreen .bs-debrief-header { font-size: 0.9rem; }
    .bs-maximized .bs-debrief-q, .bs-native-fullscreen .bs-debrief-q { font-size: 1rem; }

    /* CRT Effects */
    .bs-crt-overlay {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.3) 90%);
      pointer-events: none;
      z-index: 100;
    }

    .bs-scanlines {
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.15) 2px, rgba(0, 0, 0, 0.15) 4px);
      pointer-events: none;
      z-index: 101;
    }

    .bs-flicker {
      position: absolute;
      inset: 0;
      background: transparent;
      pointer-events: none;
      z-index: 102;
      animation: flicker 8s infinite;
    }

    @keyframes flicker {
      0%, 97%, 100% { opacity: 0; }
      97.5% { opacity: 0.02; background: #33ff77; }
    }

    /* Screens */
    .bs-screen { position: absolute; inset: 0; display: none; z-index: 50; }
    .bs-screen.active { display: flex; }

    /* Start Screen */
    .bs-start {
      background: radial-gradient(ellipse at 30% 20%, rgba(51, 255, 119, 0.08) 0%, transparent 50%),
                  linear-gradient(180deg, #080a0d 0%, #0a0c0f 100%);
      align-items: center;
      justify-content: center;
      overflow-y: auto;
      padding: 15px;
    }

    .bs-start::-webkit-scrollbar { width: 0; display: none; }
    .bs-start { -ms-overflow-style: none; scrollbar-width: none; }

    .bs-start-inner { text-align: center; max-width: 480px; padding: 15px; }

    .bs-logo { display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 10px; }

    .bs-logo-icon {
      font-size: 2.5rem;
      text-shadow: 0 0 30px #33ff77, 0 0 60px #33ff77;
      animation: pulse-glow 3s ease-in-out infinite;
    }

    .bs-logo-text {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.5rem;
      font-weight: 900;
      letter-spacing: 4px;
      line-height: 1.1;
      text-shadow: 0 0 20px rgba(51, 255, 119, 0.5);
    }

    @keyframes pulse-glow {
      0%, 100% { text-shadow: 0 0 30px #33ff77, 0 0 60px #33ff77; }
      50% { text-shadow: 0 0 40px #33ff77, 0 0 80px #33ff77, 0 0 120px #33ff77; }
    }

    .bs-classification {
      color: #ff9500;
      font-size: 0.65rem;
      letter-spacing: 3px;
      margin-bottom: 15px;
      padding: 6px;
      border-top: 1px solid rgba(255, 149, 0, 0.3);
      border-bottom: 1px solid rgba(255, 149, 0, 0.3);
    }

    .bs-terminal {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid #1a2a1f;
      padding: 12px;
      text-align: left;
      margin-bottom: 12px;
      font-size: 0.8rem;
    }

    .bs-terminal-line { opacity: 0; animation: type-in 0.5s forwards; margin-bottom: 2px; }
    .bs-terminal-line:nth-child(1) { animation-delay: 0.2s; }
    .bs-terminal-line:nth-child(2) { animation-delay: 0.6s; }
    .bs-terminal-line:nth-child(3) { animation-delay: 1.0s; }
    .bs-terminal-line:nth-child(4) { animation-delay: 1.4s; }

    @keyframes type-in {
      from { opacity: 0; transform: translateX(-5px); }
      to { opacity: 1; transform: translateX(0); }
    }

    .bs-orders {
      background: rgba(51, 255, 119, 0.05);
      border-left: 3px solid #33ff77;
      padding: 12px;
      text-align: left;
      margin-bottom: 15px;
    }

    .bs-orders-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 0.7rem;
      color: #33ff77;
      letter-spacing: 2px;
      margin-bottom: 8px;
    }

    .bs-order { font-size: 0.75rem; color: #8fa; margin-bottom: 4px; display: flex; gap: 8px; }
    .bs-order-num { color: #ff9500; font-weight: bold; }

    .bs-warning-strip {
      color: #ff9500;
      font-size: 0.65rem;
      margin-top: 12px;
      animation: blink-warn 2s infinite;
    }

    @keyframes blink-warn {
      0%, 70%, 100% { opacity: 1; }
      85% { opacity: 0.4; }
    }

    /* Buttons */
    .bs-button {
      background: transparent;
      border: 2px solid #33ff77;
      color: #33ff77;
      padding: 0;
      font-family: 'Orbitron', sans-serif;
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: 3px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .bs-button-inner { display: block; padding: 12px 28px; position: relative; z-index: 1; }

    .bs-button::before {
      content: '';
      position: absolute;
      inset: 0;
      background: #33ff77;
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.3s ease;
    }

    .bs-button:hover { color: #0a0c0f; box-shadow: 0 0 30px rgba(51, 255, 119, 0.4); }
    .bs-button:hover::before { transform: scaleX(1); }
    .bs-button-primary { background: rgba(51, 255, 119, 0.1); }

    /* Game Screen */
    .bs-game {
      flex-direction: column;
      padding: 12px;
      gap: 10px;
      background: linear-gradient(180deg, #0a0c0f 0%, #080a0d 100%);
    }

    /* Top Bar */
    .bs-topbar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 15px;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid #1a2a1f;
      border-radius: 8px;
    }

    .bs-status-lamp {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #1a1f14;
      border: 2px solid #2a3524;
      position: relative;
    }

    .bs-status-lamp.player .bs-lamp-glow { background: #33ff77; box-shadow: 0 0 12px #33ff77, 0 0 24px #33ff77; }
    .bs-status-lamp.enemy .bs-lamp-glow { background: #ff4444; box-shadow: 0 0 12px #ff4444, 0 0 24px #ff4444; animation: alarm-pulse 0.5s infinite; }

    .bs-lamp-glow {
      position: absolute;
      inset: 2px;
      border-radius: 50%;
      background: #33ff77;
      box-shadow: 0 0 8px #33ff77;
    }

    @keyframes alarm-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .bs-commander-status {
      font-family: 'Orbitron', sans-serif;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 2px;
      padding: 6px 12px;
      border: 1px solid;
      text-transform: uppercase;
    }

    .bs-commander-status.player { color: #33ff77; border-color: #33ff77; text-shadow: 0 0 10px rgba(51, 255, 119, 0.5); }
    .bs-commander-status.enemy { color: #ff4444; border-color: #ff4444; background: rgba(255, 68, 68, 0.1); animation: enemy-flash 0.8s infinite; }

    @keyframes enemy-flash {
      0%, 100% { background: rgba(255, 68, 68, 0.1); }
      50% { background: rgba(255, 68, 68, 0.2); }
    }

    .bs-teletype {
      flex: 1;
      background: #000;
      border: 1px solid #1a2a1f;
      padding: 8px 15px;
      font-size: 0.8rem;
      overflow: hidden;
    }

    .bs-teletype-text::after { content: '█'; animation: cursor-blink 1s step-end infinite; margin-left: 2px; }

    @keyframes cursor-blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }

    .bs-teletype.typing .bs-teletype-text { animation: type-flash 0.1s; }

    @keyframes type-flash { 50% { color: #fff; } }

    .bs-gauges { display: flex; gap: 15px; }
    .bs-gauge { text-align: center; min-width: 50px; }
    .bs-gauge-label { font-size: 0.6rem; color: #5a7a5a; letter-spacing: 1px; }
    .bs-gauge-value {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: #ff9500;
      text-shadow: 0 0 10px rgba(255, 149, 0, 0.5);
    }

    /* Operations Area */
    .bs-operations { display: flex; gap: 12px; flex: 1; min-height: 0; }
    .bs-display { flex: 1; min-width: 0; }

    .bs-display-frame {
      height: 100%;
      background: rgba(10, 20, 15, 0.7);
      border: 2px solid #2a4a35;
      border-radius: 12px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      box-shadow: inset 0 0 40px rgba(51, 255, 119, 0.06), 0 0 15px rgba(51, 255, 119, 0.05);
    }

    .bs-radar-frame {
      background: rgba(20, 12, 10, 0.7);
      border-color: #4a2a1f;
      box-shadow: inset 0 0 40px rgba(255, 100, 50, 0.04), 0 0 15px rgba(255, 100, 50, 0.03);
    }

    .bs-display-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      margin-bottom: 8px;
      border-bottom: 1px solid rgba(51, 255, 119, 0.3);
    }

    .bs-radar-frame .bs-display-header { border-bottom-color: rgba(255, 102, 51, 0.3); }

    .bs-display-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 2px;
      color: #55ff99;
      text-shadow: 0 0 10px rgba(51, 255, 119, 0.4);
    }

    .bs-radar-frame .bs-display-title { color: #ff8855; text-shadow: 0 0 10px rgba(255, 102, 51, 0.4); }

    .bs-display-count { font-size: 0.9rem; letter-spacing: 3px; text-shadow: 0 0 8px currentColor; }
    .bs-radar-frame .bs-display-count { color: #ff8855; }

    .bs-sonar-screen {
      flex: 1;
      background:
        linear-gradient(90deg, rgba(51, 255, 119, 0.03) 1px, transparent 1px),
        linear-gradient(0deg, rgba(51, 255, 119, 0.03) 1px, transparent 1px),
        radial-gradient(ellipse at center, #0f1f15 0%, #0a150d 100%);
      background-size: 20px 20px, 20px 20px, 100% 100%;
      border: 1px solid #2a4a35;
      border-radius: 8px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-shadow: inset 0 0 40px rgba(51, 255, 119, 0.08);
    }

    .bs-sonar-screen.bs-hostile {
      background:
        linear-gradient(90deg, rgba(255, 102, 51, 0.03) 1px, transparent 1px),
        linear-gradient(0deg, rgba(255, 102, 51, 0.03) 1px, transparent 1px),
        radial-gradient(ellipse at center, #1a0f0a 0%, #100805 100%);
      background-size: 20px 20px, 20px 20px, 100% 100%;
      border-color: #4a2a1a;
      box-shadow: inset 0 0 40px rgba(255, 100, 50, 0.05);
    }

    .bs-radar-sweep {
      position: absolute;
      width: 100%;
      height: 100%;
      background: conic-gradient(from 0deg, transparent 0deg, rgba(255, 102, 51, 0.15) 30deg, transparent 60deg);
      animation: sweep 4s linear infinite;
      transform-origin: center;
      z-index: 5;
      pointer-events: none;
    }

    @keyframes sweep {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Grid */
    .bs-sonar-grid {
      display: grid;
      gap: 2px;
      width: 100%;
      max-width: 280px;
      aspect-ratio: 1;
      padding: 8px;
      position: relative;
      z-index: 10;
    }

    .bs-cell {
      aspect-ratio: 1;
      background: rgba(51, 255, 119, 0.06);
      border: 1px solid rgba(51, 255, 119, 0.15);
      border-radius: 2px;
      cursor: default;
      position: relative;
      transition: all 0.2s ease;
    }

    .bs-hostile .bs-cell { background: rgba(255, 102, 51, 0.04); border-color: rgba(255, 102, 51, 0.12); cursor: crosshair; }
    .bs-cell.fog { background: rgba(255, 102, 51, 0.03); }
    .bs-cell.ship {
      background: linear-gradient(135deg, #3a6a4a 0%, #2a5a3a 100%);
      border-color: #55ff99;
      box-shadow: inset 0 0 12px rgba(51, 255, 119, 0.35), 0 0 6px rgba(51, 255, 119, 0.2);
    }
    .bs-cell.miss { background: rgba(100, 100, 100, 0.1); }
    .bs-cell.miss::after {
      content: '·';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #4a5a4a;
      font-size: 1.5rem;
    }
    .bs-cell.hit {
      background: radial-gradient(circle, #ff4444 0%, #aa2222 100%);
      border-color: #ff4444;
      box-shadow: 0 0 15px rgba(255, 68, 68, 0.5);
      animation: hit-pulse 1s ease-out;
    }
    .bs-cell.hit::after {
      content: '×';
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 1rem;
      font-weight: bold;
    }

    @keyframes hit-pulse {
      0% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    .bs-cell.sunk { background: #1a1a1a; border-color: #333; opacity: 0.7; }
    .bs-cell.sunk::after { color: #666; }
    .bs-cell.target { background: rgba(255, 255, 255, 0.15); border-color: #fff; box-shadow: 0 0 10px rgba(255, 255, 255, 0.3); }
    .bs-cell.target-cluster { background: rgba(255, 149, 0, 0.25); border-color: #ff9500; box-shadow: 0 0 12px rgba(255, 149, 0, 0.4); }
    .bs-cell.pinged {
      background: #33ff77 !important;
      border-color: #33ff77 !important;
      box-shadow: 0 0 20px #33ff77, 0 0 40px #33ff77;
      animation: ping-flash 0.5s ease-in-out infinite;
    }

    @keyframes ping-flash {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    /* Control Panel */
    .bs-control-panel {
      width: 180px;
      min-width: 160px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 10px;
      background: linear-gradient(180deg, rgba(20, 25, 20, 0.8) 0%, rgba(10, 15, 10, 0.9) 100%);
      border: 2px solid #1a2a1f;
      border-radius: 12px;
    }

    .bs-panel-section { display: flex; flex-direction: column; gap: 8px; }

    .bs-section-label {
      font-family: 'Orbitron', sans-serif;
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 2px;
      color: #5a8a5a;
      text-align: center;
      padding-bottom: 5px;
      border-bottom: 1px solid #1a2a1f;
    }

    .bs-weapon-rack { display: flex; flex-direction: column; gap: 8px; }

    .bs-weapon {
      background: rgba(0, 0, 0, 0.4);
      border: 2px solid #1a2a1f;
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bs-weapon:hover { border-color: #33ff77; background: rgba(51, 255, 119, 0.05); }
    .bs-weapon.active { border-color: #33ff77; background: rgba(51, 255, 119, 0.15); box-shadow: 0 0 15px rgba(51, 255, 119, 0.2); }

    .bs-weapon-indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #1a1f14;
      border: 2px solid #2a3524;
      flex-shrink: 0;
    }

    .bs-weapon.active .bs-weapon-indicator { background: #33ff77; box-shadow: 0 0 8px #33ff77; }

    .bs-weapon-body { display: flex; align-items: center; gap: 8px; flex: 1; }
    .bs-weapon-icon { font-size: 1rem; color: #5a8a5a; }
    .bs-weapon.active .bs-weapon-icon { color: #33ff77; }
    .bs-weapon-info { text-align: left; }
    .bs-weapon-name { font-family: 'Orbitron', sans-serif; font-size: 0.65rem; font-weight: 700; color: #8fa; letter-spacing: 1px; }
    .bs-weapon.active .bs-weapon-name { color: #33ff77; }
    .bs-weapon-desc { font-size: 0.55rem; color: #5a7a5a; margin-top: 2px; }

    /* Intel Section */
    .bs-intel-section { margin-top: auto; }
    .bs-intel-meter { display: flex; gap: 6px; }

    .bs-intel-pip {
      flex: 1;
      height: 8px;
      background: #1a1f14;
      border: 1px solid #2a3524;
      border-radius: 2px;
      transition: all 0.3s ease;
    }

    .bs-intel-pip.filled {
      background: linear-gradient(180deg, #33ff77 0%, #22aa55 100%);
      box-shadow: 0 0 8px #33ff77;
      border-color: #33ff77;
    }

    .bs-intel-ready {
      display: none;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 8px;
      margin-top: 8px;
      background: rgba(51, 255, 119, 0.15);
      border: 1px solid #33ff77;
      border-radius: 6px;
      font-size: 0.65rem;
      color: #33ff77;
      animation: ready-pulse 1.5s infinite;
    }

    @keyframes ready-pulse {
      0%, 100% { box-shadow: 0 0 10px rgba(51, 255, 119, 0.3); }
      50% { box-shadow: 0 0 20px rgba(51, 255, 119, 0.5); }
    }

    /* Oscilloscope */
    .bs-oscilloscope {
      height: 50px;
      background: #000;
      border: 1px solid #1a2a1f;
      border-radius: 6px;
      overflow: hidden;
      position: relative;
    }

    .bs-oscilloscope::before {
      content: '';
      position: absolute;
      inset: 0;
      background:
        linear-gradient(90deg, transparent 49.5%, rgba(51, 255, 119, 0.1) 50%, transparent 50.5%),
        linear-gradient(0deg, transparent 49.5%, rgba(51, 255, 119, 0.1) 50%, transparent 50.5%);
      background-size: 20% 20%;
    }

    .bs-wave { position: absolute; inset: 0; color: #33ff77; filter: drop-shadow(0 0 3px #33ff77); }
    .bs-wave svg { width: 100%; height: 100%; }

    /* Quiz Modal */
    .bs-modal { background: rgba(0, 0, 0, 0.9); align-items: center; justify-content: center; z-index: 200; }
    .bs-modal-console { width: 90%; max-width: 480px; }

    .bs-modal-border {
      background: linear-gradient(180deg, #0a0c0f 0%, #080a0d 100%);
      border: 2px solid #33ff77;
      border-radius: 12px;
      box-shadow: 0 0 40px rgba(51, 255, 119, 0.2);
      overflow: hidden;
    }

    .bs-modal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 15px 20px;
      background: rgba(51, 255, 119, 0.1);
      border-bottom: 1px solid rgba(51, 255, 119, 0.3);
      font-family: 'Orbitron', sans-serif;
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 2px;
    }

    .bs-modal-lamp {
      width: 10px;
      height: 10px;
      background: #ff9500;
      border-radius: 50%;
      box-shadow: 0 0 10px #ff9500;
      animation: lamp-blink 1s infinite;
    }

    @keyframes lamp-blink {
      0%, 70%, 100% { opacity: 1; }
      80% { opacity: 0.3; }
    }

    .bs-modal-body { padding: 20px; }

    .bs-question-display {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid #1a2a1f;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 6px;
    }

    .bs-question-text { font-size: 1rem; line-height: 1.5; color: #cfc; }

    .bs-options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

    .bs-option {
      background: rgba(0, 0, 0, 0.4);
      border: 2px solid #1a2a1f;
      border-radius: 8px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: left;
    }

    .bs-option:hover { border-color: #33ff77; background: rgba(51, 255, 119, 0.1); }

    .bs-option-letter {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(51, 255, 119, 0.1);
      border: 1px solid #33ff77;
      border-radius: 4px;
      font-family: 'Orbitron', sans-serif;
      font-size: 0.8rem;
      font-weight: 700;
      color: #33ff77;
      flex-shrink: 0;
    }

    .bs-option:hover .bs-option-letter { background: #33ff77; color: #0a0c0f; }
    .bs-option-text { font-size: 0.85rem; color: #afc; }

    /* Feedback Panel */
    .bs-feedback-panel { display: none; text-align: center; padding: 20px; border-radius: 8px; margin-top: 15px; }
    .bs-feedback-panel.correct { background: rgba(51, 255, 119, 0.1); border: 2px solid #33ff77; }
    .bs-feedback-panel.wrong { background: rgba(255, 68, 68, 0.1); border: 2px solid #ff4444; }
    .bs-feedback-icon { font-size: 2rem; margin-bottom: 10px; }
    .bs-feedback-panel.correct .bs-feedback-icon { color: #33ff77; text-shadow: 0 0 20px #33ff77; }
    .bs-feedback-panel.wrong .bs-feedback-icon { color: #ff4444; text-shadow: 0 0 20px #ff4444; }
    .bs-feedback-title { font-family: 'Orbitron', sans-serif; font-size: 0.9rem; font-weight: 700; letter-spacing: 2px; margin-bottom: 10px; }
    .bs-feedback-panel.correct .bs-feedback-title { color: #33ff77; }
    .bs-feedback-panel.wrong .bs-feedback-title { color: #ff4444; }
    .bs-feedback-detail { font-size: 0.85rem; color: #8fa; margin-bottom: 15px; }
    .bs-button-confirm { padding: 10px 24px; font-size: 0.8rem; }

    /* End Screen */
    .bs-end {
      background: radial-gradient(ellipse at center, rgba(10, 12, 15, 0.98) 0%, #080a0d 100%);
      align-items: center;
      justify-content: center;
    }

    .bs-end-console { text-align: center; max-width: 500px; padding: 30px; }

    .bs-end-header {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.8rem;
      font-weight: 900;
      letter-spacing: 4px;
      margin-bottom: 30px;
    }

    .bs-end-header.victory { color: #33ff77; text-shadow: 0 0 30px rgba(51, 255, 119, 0.5); }
    .bs-end-header.defeat { color: #ff4444; text-shadow: 0 0 30px rgba(255, 68, 68, 0.5); }

    .bs-end-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }

    .bs-stat-dial {
      position: relative;
      padding: 15px 10px;
      background: rgba(0, 0, 0, 0.4);
      border: 2px solid #1a2a1f;
      border-radius: 10px;
    }

    .bs-dial-ring {
      position: absolute;
      top: 5px;
      left: 50%;
      transform: translateX(-50%);
      width: 8px;
      height: 8px;
      border: 2px solid #33ff77;
      border-radius: 50%;
    }

    .bs-dial-value {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.3rem;
      font-weight: 700;
      color: #ff9500;
      text-shadow: 0 0 10px rgba(255, 149, 0, 0.5);
      margin-bottom: 5px;
    }

    .bs-dial-label { font-size: 0.6rem; color: #5a7a5a; letter-spacing: 1px; }

    .bs-debrief {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid #1a2a1f;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
      text-align: left;
    }

    .bs-debrief-header {
      font-family: 'Orbitron', sans-serif;
      font-size: 0.7rem;
      color: #5a8a5a;
      letter-spacing: 2px;
      text-align: center;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #1a2a1f;
    }

    .bs-debrief-list { max-height: 120px; overflow-y: auto; }
    .bs-debrief-ok { color: #33ff77; text-align: center; padding: 10px; }

    .bs-debrief-item {
      padding: 10px;
      margin-bottom: 8px;
      background: rgba(255, 68, 68, 0.05);
      border-left: 3px solid #ff4444;
      border-radius: 0 6px 6px 0;
    }

    .bs-debrief-q { font-size: 0.85rem; color: #cfc; margin-bottom: 6px; }
    .bs-debrief-wrong { font-size: 0.75rem; color: #ff4444; }
    .bs-debrief-correct { font-size: 0.75rem; color: #33ff77; }

    .bs-debrief-list::-webkit-scrollbar { width: 6px; }
    .bs-debrief-list::-webkit-scrollbar-track { background: #0a0c0f; }
    .bs-debrief-list::-webkit-scrollbar-thumb { background: #1a2a1f; border-radius: 3px; }

    /* Deployment Screen */
    .bs-deploy {
      background: radial-gradient(ellipse at 30% 30%, rgba(51, 255, 119, 0.06) 0%, transparent 50%),
                  linear-gradient(180deg, #080a0d 0%, #0a0c0f 100%);
      align-items: center;
      justify-content: center;
      padding: 15px;
    }

    .bs-deploy-container { width: 100%; max-width: 700px; }
    .bs-deploy-header { text-align: center; margin-bottom: 15px; }

    .bs-deploy-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.4rem;
      font-weight: 900;
      letter-spacing: 4px;
      color: #33ff77;
      text-shadow: 0 0 20px rgba(51, 255, 119, 0.5);
      margin-bottom: 5px;
    }

    .bs-deploy-subtitle { font-size: 0.8rem; color: #5a8a5a; letter-spacing: 2px; }
    .bs-deploy-main { display: flex; gap: 20px; align-items: flex-start; }
    .bs-deploy-grid-area { flex: 1; }

    .bs-deploy-grid-wrapper {
      background: rgba(10, 20, 15, 0.7);
      border: 2px solid #2a4a35;
      border-radius: 12px;
      padding: 15px;
    }

    .bs-deploy-grid-wrapper .bs-sonar-screen { aspect-ratio: 1; max-width: 350px; margin: 0 auto; }
    .bs-deploy-grid-wrapper .bs-sonar-grid { max-width: 100%; }
    .bs-deploy-controls { width: 200px; display: flex; flex-direction: column; gap: 12px; }

    .bs-deploy-instructions {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid #1a2a1f;
      border-radius: 8px;
      padding: 10px;
    }

    .bs-instruction-item { font-size: 0.7rem; color: #8fa; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
    .bs-instruction-item:last-child { margin-bottom: 0; }

    .bs-key {
      background: rgba(51, 255, 119, 0.15);
      border: 1px solid #33ff77;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Orbitron', sans-serif;
      font-size: 0.6rem;
      font-weight: 700;
      color: #33ff77;
    }

    .bs-ship-selector { display: flex; flex-direction: column; gap: 6px; }

    .bs-ship-btn {
      background: rgba(0, 0, 0, 0.4);
      border: 2px solid #1a2a1f;
      border-radius: 8px;
      padding: 8px 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bs-ship-btn:hover { border-color: #33ff77; background: rgba(51, 255, 119, 0.05); }
    .bs-ship-btn.selected { border-color: #33ff77; background: rgba(51, 255, 119, 0.15); box-shadow: 0 0 15px rgba(51, 255, 119, 0.2); }

    .bs-ship-visual { display: flex; gap: 2px; }

    .bs-ship-segment {
      width: 14px;
      height: 14px;
      background: linear-gradient(135deg, #3a6a4a 0%, #2a5a3a 100%);
      border: 1px solid #55ff99;
      border-radius: 2px;
    }

    .bs-ship-btn.selected .bs-ship-segment { background: linear-gradient(135deg, #55ff99 0%, #33dd77 100%); box-shadow: 0 0 6px #33ff77; }
    .bs-ship-label { font-size: 0.7rem; color: #8fa; }
    .bs-ship-btn.selected .bs-ship-label { color: #33ff77; }

    .bs-rotate-btn {
      background: rgba(255, 149, 0, 0.1);
      border: 2px solid #ff9500;
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Orbitron', sans-serif;
      font-size: 0.7rem;
      font-weight: 700;
      color: #ff9500;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .bs-rotate-btn:hover { background: rgba(255, 149, 0, 0.2); box-shadow: 0 0 15px rgba(255, 149, 0, 0.3); }
    .bs-rotate-icon { font-size: 1rem; }
    .bs-deploy-confirm { margin-top: 5px; }

    .bs-randomize-btn {
      background: transparent;
      border: 1px solid #5a8a5a;
      border-radius: 6px;
      padding: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.75rem;
      color: #5a8a5a;
    }

    .bs-randomize-btn:hover { border-color: #33ff77; color: #33ff77; }

    /* Deployment grid cell states */
    .bs-deploy-cell { cursor: pointer; }
    .bs-deploy-cell:hover { background: rgba(51, 255, 119, 0.1); }

    .bs-deploy-cell.ship.selected {
      background: linear-gradient(135deg, #55ff99 0%, #33dd77 100%);
      border-color: #88ffbb;
      box-shadow: 0 0 15px rgba(51, 255, 119, 0.5);
      animation: selected-pulse 1s ease-in-out infinite;
    }

    @keyframes selected-pulse {
      0%, 100% { box-shadow: 0 0 15px rgba(51, 255, 119, 0.5); }
      50% { box-shadow: 0 0 25px rgba(51, 255, 119, 0.7); }
    }

    .bs-deploy-cell.preview-valid { background: rgba(51, 255, 119, 0.25) !important; border-color: #33ff77 !important; }
    .bs-deploy-cell.preview-invalid { background: rgba(255, 68, 68, 0.25) !important; border-color: #ff4444 !important; }

    /* Responsive */
    @media (max-width: 768px) {
      .bs-operations { flex-direction: column; }
      .bs-control-panel { width: 100%; flex-direction: row; flex-wrap: wrap; }
      .bs-panel-section { flex: 1; min-width: 140px; }
      .bs-oscilloscope { display: none; }
      .bs-end-stats { grid-template-columns: repeat(2, 1fr); }
      .bs-deploy-main { flex-direction: column; }
      .bs-deploy-controls { width: 100%; flex-direction: row; flex-wrap: wrap; }
      .bs-deploy-instructions { flex: 1; min-width: 150px; }
      .bs-ship-selector { flex: 1; min-width: 150px; }
    }
  `,
};

export default coldWarTheme;
