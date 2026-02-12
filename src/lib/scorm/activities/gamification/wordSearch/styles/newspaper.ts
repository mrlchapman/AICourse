/**
 * Newspaper/Lexicon Theme for Word Search
 * A vintage natural history collection aesthetic
 */

import { GameTheme } from '../../core/types';
import { fontImports } from '../../core/styles/base';

export const newspaperTheme: GameTheme = {
  id: 'newspaper',
  name: 'The Lexicon',
  classPrefix: 'lexicon',
  css: `
    ${fontImports.playfairDisplay}
    @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');

    .lexicon-activity {
      width: 100%;
      max-width: 950px;
      margin: 40px auto;
      font-family: 'Crimson Text', Georgia, serif;
      user-select: none;
    }

    .lexicon-cabinet {
      position: relative;
      background: linear-gradient(180deg, #f5f0e1 0%, #ebe4d4 50%, #f5f0e1 100%);
      border: 4px solid #5c4033;
      overflow: hidden;
      min-height: 650px;
      box-shadow:
        inset 0 0 60px rgba(92, 64, 51, 0.1),
        0 10px 40px rgba(0, 0, 0, 0.3);
    }

    /* Decorative Corners */
    .lexicon-corner {
      position: absolute;
      width: 50px;
      height: 50px;
      z-index: 10;
    }

    .lexicon-corner::before,
    .lexicon-corner::after {
      content: '';
      position: absolute;
      background: #5c4033;
    }

    .lexicon-corner-tl { top: 0; left: 0; }
    .lexicon-corner-tl::before { top: 8px; left: 0; width: 30px; height: 2px; }
    .lexicon-corner-tl::after { top: 0; left: 8px; width: 2px; height: 30px; }

    .lexicon-corner-tr { top: 0; right: 0; }
    .lexicon-corner-tr::before { top: 8px; right: 0; width: 30px; height: 2px; }
    .lexicon-corner-tr::after { top: 0; right: 8px; width: 2px; height: 30px; }

    .lexicon-corner-bl { bottom: 0; left: 0; }
    .lexicon-corner-bl::before { bottom: 8px; left: 0; width: 30px; height: 2px; }
    .lexicon-corner-bl::after { bottom: 0; left: 8px; width: 2px; height: 30px; }

    .lexicon-corner-br { bottom: 0; right: 0; }
    .lexicon-corner-br::before { bottom: 8px; right: 0; width: 30px; height: 2px; }
    .lexicon-corner-br::after { bottom: 0; right: 8px; width: 2px; height: 30px; }

    /* Fullscreen Button */
    .lexicon-fullscreen-btn {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 150;
      width: 32px;
      height: 32px;
      background: transparent;
      border: 2px solid #5c4033;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      color: #5c4033;
      font-size: 1rem;
    }

    .lexicon-fullscreen-btn:hover {
      background: #5c4033;
      color: #f5f0e1;
    }

    .lexicon-fs-collapse { display: none; }

    /* Overlays */
    .lexicon-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, #f5f0e1 0%, #ebe4d4 50%, #f5f0e1 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 100;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .lexicon-overlay.active {
      opacity: 1;
      pointer-events: auto;
    }

    /* Start Screen */
    .lexicon-start-content {
      text-align: center;
      padding: 40px;
    }

    .lexicon-emblem {
      margin-bottom: 15px;
    }

    .lexicon-emblem-wreath {
      font-size: 3rem;
      color: #2d5a27;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .lexicon-start-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 3.5rem;
      font-weight: 700;
      color: #3a2a1a;
      letter-spacing: 8px;
      text-shadow: 2px 2px 0 rgba(255, 255, 255, 0.5);
    }

    .lexicon-start-subtitle {
      font-family: 'Crimson Text', Georgia, serif;
      font-size: 1.2rem;
      font-style: italic;
      color: #6b5a45;
      letter-spacing: 2px;
      margin-top: 5px;
    }

    .lexicon-divider {
      margin: 25px 0;
    }

    .lexicon-divider-leaf {
      color: #2d5a27;
      font-size: 1.5rem;
    }

    .lexicon-start-rules {
      max-width: 400px;
      margin: 0 auto;
    }

    .lexicon-rule {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      color: #5c4033;
      font-size: 1rem;
      text-align: left;
    }

    .lexicon-rule-icon {
      color: #2d5a27;
      font-size: 0.8rem;
    }

    /* Button */
    .lexicon-button {
      background: #2d5a27;
      border: 2px solid #1a3a1a;
      color: #f5f0e1;
      padding: 15px 40px;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 3px;
      cursor: pointer;
      margin-top: 25px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(45, 90, 39, 0.3);
    }

    .lexicon-button:hover {
      background: #1a3a1a;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(45, 90, 39, 0.4);
    }

    /* Game Screen */
    .lexicon-game {
      display: flex;
      flex-direction: column;
      min-height: 620px;
      padding: 15px 25px;
    }

    .lexicon-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-bottom: 2px solid rgba(92, 64, 51, 0.2);
      margin-bottom: 15px;
    }

    .lexicon-title-small {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.3rem;
      font-weight: 700;
      color: #3a2a1a;
      letter-spacing: 4px;
    }

    .lexicon-stats {
      display: flex;
      gap: 30px;
    }

    .lexicon-stat {
      text-align: center;
    }

    .lexicon-stat-label {
      display: block;
      font-size: 0.7rem;
      color: #8b7355;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 3px;
    }

    .lexicon-stat-value {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.3rem;
      font-weight: 600;
      color: #2d5a27;
    }

    .lexicon-stat-timer .lexicon-stat-value {
      color: #8b4513;
    }

    .lexicon-required {
      font-size: 0.65rem;
      letter-spacing: 2px;
      color: #8b4513;
      border: 1px solid #8b4513;
      padding: 4px 10px;
    }

    /* Main Game Area */
    .lexicon-main {
      display: flex;
      gap: 25px;
      flex: 1;
      align-items: flex-start;
    }

    @media (max-width: 750px) {
      .lexicon-main {
        flex-direction: column;
      }
    }

    /* Grid Area */
    .lexicon-grid-area {
      flex: 1;
    }

    .lexicon-grid-frame {
      background: #faf8f3;
      border: 3px solid #5c4033;
      padding: 10px;
      box-shadow:
        inset 0 0 20px rgba(92, 64, 51, 0.1),
        0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .lexicon-grid {
      display: grid;
      grid-template-columns: repeat(var(--grid-size), 1fr);
      gap: 2px;
      background: rgba(92, 64, 51, 0.1);
    }

    .lexicon-cell {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #faf8f3;
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      font-weight: 700;
      font-size: clamp(11px, 1.8vw, 16px);
      color: #2a1a0a;
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1px solid rgba(92, 64, 51, 0.15);
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
    }

    .lexicon-cell:hover {
      background: rgba(45, 90, 39, 0.15);
    }

    .lexicon-cell.selecting {
      background: rgba(45, 90, 39, 0.4);
      color: #1a3a1a;
      transform: scale(1.05);
      z-index: 5;
    }

    .lexicon-cell.found {
      background: linear-gradient(135deg, #2d5a27 0%, #3d7a37 100%);
      color: #f5f0e1;
      border-color: #2d5a27;
    }

    .lexicon-grid-label {
      text-align: center;
      margin-top: 10px;
      font-size: 0.7rem;
      color: #8b7355;
      letter-spacing: 3px;
    }

    /* Specimens List */
    .lexicon-specimens {
      min-width: 200px;
      max-width: 220px;
      background: #faf8f3;
      border: 2px solid #5c4033;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .lexicon-specimens-header {
      background: #5c4033;
      color: #f5f0e1;
      padding: 12px 15px;
      text-align: center;
    }

    .lexicon-specimens-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 0.9rem;
      font-weight: 600;
      letter-spacing: 3px;
      display: block;
    }

    .lexicon-specimens-subtitle {
      font-size: 0.7rem;
      font-style: italic;
      opacity: 0.8;
      display: block;
      margin-top: 2px;
    }

    .lexicon-specimens-list {
      padding: 10px;
      max-height: 400px;
      overflow-y: auto;
    }

    .lexicon-specimen-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      margin-bottom: 4px;
      background: rgba(92, 64, 51, 0.05);
      border-left: 3px solid transparent;
      transition: all 0.2s ease;
    }

    .lexicon-specimen-item.found {
      background: rgba(45, 90, 39, 0.15);
      border-left-color: #2d5a27;
    }

    .lexicon-specimen-item.found .lexicon-specimen-word {
      text-decoration: line-through;
      color: #8b7355;
    }

    .lexicon-specimen-item.wrong {
      border-left-color: #8b4513;
    }

    .lexicon-specimen-number {
      font-size: 0.7rem;
      color: #8b7355;
      min-width: 20px;
    }

    .lexicon-specimen-word {
      flex: 1;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 0.85rem;
      font-weight: 500;
      color: #3a2a1a;
      letter-spacing: 1px;
    }

    .lexicon-specimen-status {
      font-size: 0.9rem;
      color: #8b7355;
    }

    .lexicon-specimen-item.found .lexicon-specimen-status {
      color: #2d5a27;
    }

    .lexicon-specimen-item.wrong .lexicon-specimen-status {
      color: #8b4513;
    }

    /* Footer */
    .lexicon-footer {
      text-align: center;
      padding: 12px;
      border-top: 2px solid rgba(92, 64, 51, 0.2);
      margin-top: 15px;
    }

    .lexicon-footer-text {
      font-size: 0.65rem;
      color: #8b7355;
      letter-spacing: 3px;
    }

    /* Modal */
    .lexicon-modal {
      position: absolute;
      inset: 0;
      background: rgba(58, 42, 26, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 150;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .lexicon-modal.active {
      opacity: 1;
      pointer-events: auto;
    }

    .lexicon-modal-content {
      background: linear-gradient(180deg, #f5f0e1 0%, #ebe4d4 100%);
      border: 3px solid #5c4033;
      padding: 30px 40px;
      max-width: 480px;
      width: 90%;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
    }

    .lexicon-discovery-badge {
      display: inline-block;
      background: #2d5a27;
      color: #f5f0e1;
      padding: 6px 16px;
      font-size: 0.75rem;
      letter-spacing: 3px;
      margin-bottom: 10px;
    }

    .lexicon-found-word {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 2rem;
      font-weight: 700;
      color: #1a4015;
      letter-spacing: 4px;
      margin: 0 0 20px 0;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .lexicon-question {
      font-size: 1.15rem;
      color: #3a2a1a;
      line-height: 1.6;
      margin: 0 0 25px 0;
    }

    .lexicon-answers {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .lexicon-answer-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 14px 18px;
      background: #faf8f3;
      border: 2px solid rgba(92, 64, 51, 0.3);
      color: #3a2a1a;
      font-family: 'Crimson Text', Georgia, serif;
      font-size: 1rem;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .lexicon-answer-btn:hover:not(:disabled) {
      background: rgba(45, 90, 39, 0.1);
      border-color: #2d5a27;
      transform: translateX(5px);
    }

    .lexicon-answer-btn.correct {
      background: rgba(45, 90, 39, 0.2);
      border-color: #2d5a27;
    }

    .lexicon-answer-btn.wrong {
      background: rgba(139, 69, 19, 0.15);
      border-color: #8b4513;
    }

    .lexicon-answer-btn:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }

    .lexicon-answer-letter {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(92, 64, 51, 0.3);
      font-family: 'Playfair Display', Georgia, serif;
      font-weight: 600;
      font-size: 0.85rem;
      color: #5c4033;
    }

    /* Feedback */
    .lexicon-feedback {
      display: none;
      margin-top: 20px;
      padding: 20px;
      background: #faf8f3;
      border-left: 4px solid #8b7355;
      text-align: left;
    }

    .lexicon-feedback.active {
      display: block;
    }

    .lexicon-feedback.correct {
      border-left-color: #2d5a27;
    }

    .lexicon-feedback.wrong {
      border-left-color: #8b4513;
    }

    .lexicon-feedback-text {
      font-size: 1rem;
      color: #3a2a1a;
      line-height: 1.5;
      margin: 0 0 15px 0;
    }

    .lexicon-continue-btn {
      background: #2d5a27;
      border: none;
      color: #f5f0e1;
      padding: 10px 25px;
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 0.9rem;
      letter-spacing: 2px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .lexicon-continue-btn:hover {
      background: #1a3a1a;
    }

    /* End Screen */
    .lexicon-end-content {
      text-align: center;
      padding: 40px;
      max-width: 450px;
    }

    .lexicon-end-emblem {
      font-size: 3rem;
      margin-bottom: 15px;
    }

    .lexicon-end-emblem.passed {
      color: #2d5a27;
    }

    .lexicon-end-emblem.failed {
      color: #8b4513;
    }

    .lexicon-end-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 2rem;
      font-weight: 700;
      color: #3a2a1a;
      letter-spacing: 4px;
      margin: 0 0 20px 0;
    }

    .lexicon-final-score {
      margin-bottom: 20px;
    }

    .lexicon-final-label {
      display: block;
      font-size: 0.8rem;
      color: #8b7355;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 5px;
    }

    .lexicon-final-value {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 2.5rem;
      font-weight: 700;
      color: #2d5a27;
    }

    .lexicon-breakdown {
      background: #faf8f3;
      border: 2px solid rgba(92, 64, 51, 0.3);
      padding: 20px;
      margin: 20px 0;
    }

    .lexicon-breakdown-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid rgba(92, 64, 51, 0.15);
      font-size: 0.95rem;
      color: #5c4033;
    }

    .lexicon-breakdown-item:last-child {
      border-bottom: none;
    }

    .lexicon-breakdown-value {
      font-weight: 600;
      color: #3a2a1a;
    }

    /* Fullscreen Styles */
    .lexicon-activity-maximized {
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
      background: #ebe4d4;
    }

    .lexicon-maximized, .lexicon-native-fullscreen {
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

    .lexicon-maximized .lexicon-game,
    .lexicon-native-fullscreen .lexicon-game {
      flex: 1;
      min-height: 0;
      padding: 20px 60px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .lexicon-maximized .lexicon-main,
    .lexicon-native-fullscreen .lexicon-main {
      flex: 1;
      min-height: 0;
      gap: 50px;
      justify-content: center;
      align-items: center;
    }

    .lexicon-maximized .lexicon-grid-area,
    .lexicon-native-fullscreen .lexicon-grid-area {
      flex: none;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .lexicon-maximized .lexicon-grid-frame,
    .lexicon-native-fullscreen .lexicon-grid-frame {
      height: calc(100vh - 240px);
      width: calc(100vh - 240px);
      max-width: calc(100vw - 400px);
    }

    .lexicon-maximized .lexicon-grid,
    .lexicon-native-fullscreen .lexicon-grid {
      height: 100%;
      width: 100%;
    }

    .lexicon-maximized .lexicon-grid-label,
    .lexicon-native-fullscreen .lexicon-grid-label {
      margin-top: 8px;
      font-size: 0.65rem;
    }

    .lexicon-maximized .lexicon-cell,
    .lexicon-native-fullscreen .lexicon-cell {
      font-size: clamp(12px, 2vmin, 20px);
    }

    .lexicon-maximized .lexicon-title-small,
    .lexicon-native-fullscreen .lexicon-title-small {
      font-size: 1.6rem;
    }

    .lexicon-maximized .lexicon-stat-value,
    .lexicon-native-fullscreen .lexicon-stat-value {
      font-size: 1.4rem;
    }

    .lexicon-maximized .lexicon-stat-label,
    .lexicon-native-fullscreen .lexicon-stat-label {
      font-size: 0.75rem;
    }

    .lexicon-maximized .lexicon-specimens,
    .lexicon-native-fullscreen .lexicon-specimens {
      flex: none;
      min-width: 180px;
      max-width: 220px;
      align-self: center;
      max-height: calc(100vh - 200px);
      display: flex;
      flex-direction: column;
    }

    .lexicon-maximized .lexicon-specimens-header,
    .lexicon-native-fullscreen .lexicon-specimens-header {
      padding: 6px 10px;
      flex-shrink: 0;
    }

    .lexicon-maximized .lexicon-specimens-title,
    .lexicon-native-fullscreen .lexicon-specimens-title {
      font-size: 0.75rem;
    }

    .lexicon-maximized .lexicon-specimens-subtitle,
    .lexicon-native-fullscreen .lexicon-specimens-subtitle {
      font-size: 0.55rem;
    }

    .lexicon-maximized .lexicon-specimens-list,
    .lexicon-native-fullscreen .lexicon-specimens-list {
      padding: 4px 6px;
      flex: 1;
      overflow-y: auto;
    }

    .lexicon-maximized .lexicon-specimen-item,
    .lexicon-native-fullscreen .lexicon-specimen-item {
      padding: 3px 5px;
      margin-bottom: 1px;
    }

    .lexicon-maximized .lexicon-specimen-num,
    .lexicon-native-fullscreen .lexicon-specimen-num {
      font-size: 0.6rem;
      min-width: 16px;
    }

    .lexicon-maximized .lexicon-specimen-word,
    .lexicon-native-fullscreen .lexicon-specimen-word {
      font-size: 0.75rem;
    }

    .lexicon-maximized .lexicon-start-title,
    .lexicon-native-fullscreen .lexicon-start-title {
      font-size: 4rem;
    }

    .lexicon-maximized .lexicon-modal-content,
    .lexicon-native-fullscreen .lexicon-modal-content {
      max-width: 500px;
      padding: 35px 45px;
    }

    .lexicon-maximized .lexicon-question,
    .lexicon-native-fullscreen .lexicon-question {
      font-size: 1.2rem;
    }

    .lexicon-maximized .lexicon-answer-btn,
    .lexicon-native-fullscreen .lexicon-answer-btn {
      font-size: 1rem;
      padding: 14px 18px;
    }

    .lexicon-maximized .lexicon-found-word,
    .lexicon-native-fullscreen .lexicon-found-word {
      font-size: 2.5rem;
    }
  `,
};

export default newspaperTheme;
