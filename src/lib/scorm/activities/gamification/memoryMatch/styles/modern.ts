/**
 * Modern Dark Theme for Memory Match
 * Clean navy/indigo aesthetic with smooth animations
 */

import { GameTheme } from '../../core/types';
import { fontImports } from '../../core/styles/base';

export const modernTheme: GameTheme = {
  id: 'modern',
  name: 'Modern',
  classPrefix: 'mm',
  css: `
    ${fontImports.robotoMono}

    .mm-game {
      position: relative;
      max-width: 900px;
      margin: 30px auto;
      background: #0f172a;
      border-radius: 16px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #e2e8f0;
      border: 1px solid #1e293b;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
    }

    /* Fullscreen Button */
    .mm-fullscreen-btn {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 150;
      width: 32px;
      height: 32px;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid #334155;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      color: #94a3b8;
      font-size: 1rem;
    }

    .mm-fullscreen-btn:hover {
      background: rgba(99, 102, 241, 0.2);
      border-color: #6366f1;
      color: #6366f1;
    }

    .mm-fs-collapse { display: none; transform: rotate(45deg); }

    /* CSS Fullscreen Mode */
    .mm-activity-maximized {
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
      background: #0f172a;
    }

    .mm-maximized, .mm-native-fullscreen {
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

    .mm-maximized .mm-main,
    .mm-native-fullscreen .mm-main {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .mm-maximized .mm-grid-container,
    .mm-native-fullscreen .mm-grid-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .mm-maximized .mm-grid,
    .mm-native-fullscreen .mm-grid {
      max-width: 1000px;
    }

    .mm-maximized .mm-card,
    .mm-native-fullscreen .mm-card {
      min-width: 120px;
      min-height: 160px;
    }

    /* Header */
    .mm-header {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #1e293b;
    }

    .mm-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .mm-game-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #f8fafc;
      letter-spacing: 0.5px;
    }

    .mm-required {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 1px;
      color: #f43f5e;
      background: rgba(244, 63, 94, 0.1);
      border: 1px solid rgba(244, 63, 94, 0.25);
      padding: 4px 10px;
      border-radius: 20px;
    }

    .mm-req-dot {
      width: 6px;
      height: 6px;
      background: #f43f5e;
      border-radius: 50%;
      animation: mm-pulse 1.5s ease-in-out infinite;
    }

    @keyframes mm-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    /* Status Bar */
    .mm-status-bar {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 24px;
      padding: 14px 24px;
      background: rgba(30, 41, 59, 0.5);
      border-bottom: 1px solid #1e293b;
    }

    .mm-stat {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #1e293b;
      padding: 6px 14px;
      border-radius: 20px;
    }

    .mm-stat-label {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 1px;
      color: #64748b;
      text-transform: uppercase;
    }

    .mm-stat-value {
      font-family: 'Roboto Mono', monospace;
      font-size: 1rem;
      font-weight: 700;
      color: #6366f1;
    }

    .mm-stat-slash {
      color: #475569;
      font-size: 0.85rem;
    }

    .mm-stat-total {
      font-family: 'Roboto Mono', monospace;
      color: #64748b;
      font-size: 0.85rem;
    }

    .mm-progress-stat {
      min-width: 120px;
    }

    .mm-progress-bar {
      width: 100%;
      height: 6px;
      background: #1e293b;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 4px;
    }

    .mm-progress-fill {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      border-radius: 3px;
      transition: width 0.5s ease;
    }

    /* Status Indicator */
    .mm-status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mm-indicator-dot {
      width: 8px;
      height: 8px;
      background: #475569;
      border-radius: 50%;
      transition: all 0.3s ease;
    }

    .mm-dot-active {
      background: #6366f1;
      box-shadow: 0 0 8px rgba(99, 102, 241, 0.5);
    }

    .mm-dot-success {
      background: #10b981;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
    }

    .mm-dot-error {
      background: #f43f5e;
      box-shadow: 0 0 8px rgba(244, 63, 94, 0.5);
    }

    .mm-dot-warning {
      background: #f59e0b;
      box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
      animation: mm-pulse 0.5s ease-in-out infinite;
    }

    .mm-status-text {
      font-size: 0.7rem;
      font-weight: 500;
      color: #94a3b8;
    }

    /* Main Area */
    .mm-main {
      position: relative;
      z-index: 10;
      padding: 24px;
    }

    .mm-instructions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 20px;
      padding: 10px 20px;
    }

    .mm-inst-text {
      font-size: 0.8rem;
      color: #64748b;
    }

    .mm-grid-container {
      display: flex;
      justify-content: center;
    }

    .mm-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 12px;
      width: 100%;
      max-width: 700px;
      perspective: 1000px;
    }

    @media (min-width: 640px) {
      .mm-grid {
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
        gap: 16px;
      }
    }

    /* Cards */
    .mm-card {
      aspect-ratio: 3/4;
      position: relative;
      cursor: pointer;
      animation: mm-card-appear 0.4s ease backwards;
    }

    @keyframes mm-card-appear {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(8px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .mm-card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
    }

    .mm-card.flipped .mm-card-inner {
      transform: rotateY(180deg);
    }

    .mm-card-front, .mm-card-back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      box-sizing: border-box;
    }

    .mm-card-front {
      background: linear-gradient(145deg, #1e293b 0%, #0f172a 100%);
      border: 2px solid #334155;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .mm-card-front::before {
      content: '';
      position: absolute;
      top: 10px; left: 10px; right: 10px; bottom: 10px;
      border: 1px solid rgba(99, 102, 241, 0.15);
      border-radius: 8px;
      pointer-events: none;
      /* subtle geometric pattern */
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(99, 102, 241, 0.03) 10px,
        rgba(99, 102, 241, 0.03) 20px
      );
    }

    .mm-card:hover .mm-card-front {
      border-color: #6366f1;
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.15);
    }

    .mm-card-symbol {
      font-size: 1.8rem;
      color: #334155;
      transition: color 0.2s ease;
    }

    .mm-card:hover .mm-card-symbol {
      color: #6366f1;
    }

    .mm-card-back {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      transform: rotateY(180deg);
      padding: 12px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .mm-card-text {
      font-size: 0.85rem;
      font-weight: 500;
      color: #1e293b;
      text-align: center;
      line-height: 1.4;
      word-break: break-word;
      overflow: hidden;
    }

    .mm-card-back img {
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      border-radius: 8px;
    }

    .mm-card.matched .mm-card-inner {
      box-shadow: 0 0 0 3px #10b981, 0 0 20px rgba(16, 185, 129, 0.3);
      border-radius: 12px;
    }

    .mm-card.match-pulse {
      animation: mm-match-pulse 0.5s ease;
    }

    @keyframes mm-match-pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.04); }
      100% { transform: scale(1); }
    }

    /* Warning Banner */
    .mm-warning {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 20px;
      padding: 12px 20px;
      background: rgba(244, 63, 94, 0.08);
      border: 1px solid rgba(244, 63, 94, 0.2);
      border-radius: 10px;
      opacity: 0;
      transform: translateY(-8px);
      transition: all 0.3s ease;
      pointer-events: none;
    }

    .mm-warning.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .mm-warning-icon {
      color: #f43f5e;
      font-size: 1.1rem;
    }

    .mm-warning-text {
      font-size: 0.75rem;
      font-weight: 500;
      color: #f43f5e;
    }

    @keyframes mm-shake {
      0%, 100% { transform: translateX(0) rotate(0); }
      20% { transform: translateX(-6px) rotate(-0.5deg); }
      40% { transform: translateX(6px) rotate(0.5deg); }
      60% { transform: translateX(-6px) rotate(-0.5deg); }
      80% { transform: translateX(6px) rotate(0.5deg); }
    }

    .mm-shake { animation: mm-shake 0.5s ease; }

    /* Footer / Progress */
    .mm-footer {
      position: relative;
      z-index: 10;
      padding: 16px 24px;
      border-top: 1px solid #1e293b;
    }

    /* Win Overlay */
    .mm-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.4s ease;
      z-index: 100;
    }

    .mm-overlay.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .mm-overlay-content {
      text-align: center;
      padding: 40px;
      max-width: 400px;
    }

    .mm-success-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 20px;
      background: rgba(16, 185, 129, 0.15);
      border: 2px solid #10b981;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      color: #10b981;
    }

    .mm-success-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 6px;
    }

    .mm-success-subtitle {
      font-size: 0.8rem;
      color: #64748b;
      margin-bottom: 28px;
    }

    .mm-results {
      display: flex;
      justify-content: center;
      gap: 32px;
      margin-bottom: 28px;
    }

    .mm-result-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: #1e293b;
      padding: 16px 20px;
      border-radius: 12px;
    }

    .mm-result-label {
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 1px;
      color: #64748b;
      text-transform: uppercase;
    }

    .mm-result-value {
      font-family: 'Roboto Mono', monospace;
      font-size: 1.3rem;
      font-weight: 700;
      color: #6366f1;
    }

    .mm-rating {
      font-size: 0.9rem !important;
    }

    .mm-stamp {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 1px;
      color: #10b981;
      padding: 8px 20px;
      border: 2px solid #10b981;
      border-radius: 20px;
      display: inline-block;
      margin-bottom: 24px;
    }

    .mm-button {
      background: #6366f1;
      border: none;
      color: #fff;
      padding: 12px 28px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      cursor: pointer;
      border-radius: 10px;
      transition: all 0.2s ease;
    }

    .mm-button:hover {
      background: #4f46e5;
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
      transform: translateY(-1px);
    }

    /* Info Modal */
    .mm-modal {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      z-index: 200;
      transition: opacity 0.3s ease;
    }

    .mm-modal.visible {
      opacity: 1;
      pointer-events: auto;
    }

    .mm-modal-content {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      max-width: 420px;
      width: 90%;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      animation: mm-modal-appear 0.3s ease;
    }

    @keyframes mm-modal-appear {
      from {
        opacity: 0;
        transform: scale(0.95) translateY(10px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    .mm-modal-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 20px;
      background: rgba(16, 185, 129, 0.1);
      border-bottom: 1px solid #334155;
      font-size: 0.85rem;
      font-weight: 600;
      color: #10b981;
    }

    .mm-modal-icon {
      font-size: 1.1rem;
    }

    .mm-modal-body {
      padding: 24px 20px;
      font-size: 0.95rem;
      line-height: 1.6;
      color: #e2e8f0;
      text-align: center;
    }

    .mm-modal-footer {
      padding: 16px 20px;
      border-top: 1px solid #334155;
      display: flex;
      justify-content: center;
    }

    .mm-button-modal {
      padding: 10px 24px;
      font-size: 0.75rem;
    }

    /* Responsive */
    @media (max-width: 600px) {
      .mm-header {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;
      }

      .mm-status-bar {
        flex-wrap: wrap;
        gap: 10px;
      }

      .mm-inst-text {
        font-size: 0.7rem;
      }

      .mm-main {
        padding: 16px;
      }
    }
  `,
};

export default modernTheme;
