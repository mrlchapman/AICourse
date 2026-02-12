/**
 * Card Game Theme for Quiz Uno
 * An elegant art deco casino aesthetic - "Carte Royale"
 */

import { GameTheme } from '../../core/types';
import { fontImports } from '../../core/styles/base';

export const cardGameTheme: GameTheme = {
  id: 'card-game',
  name: 'Carte Royale',
  classPrefix: 'carte',
  css: `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Josefin+Sans:wght@300;400;500;600&display=swap');

    .carte-activity {
      width: 100%;
      max-width: 900px;
      margin: 40px auto;
      font-family: 'Josefin Sans', sans-serif;
      user-select: none;
    }

    .carte-cabinet {
      position: relative;
      background: linear-gradient(180deg, #1a1410 0%, #0d0a08 50%, #1a1410 100%);
      border: 3px solid #d4af37;
      overflow: hidden;
      min-height: 650px;
    }

    /* Decorative Corners */
    .carte-corner {
      position: absolute;
      width: 40px;
      height: 40px;
      z-index: 10;
    }

    .carte-corner::before,
    .carte-corner::after {
      content: '';
      position: absolute;
      background: #d4af37;
    }

    .carte-corner-tl { top: 0; left: 0; }
    .carte-corner-tl::before { top: 0; left: 0; width: 40px; height: 3px; }
    .carte-corner-tl::after { top: 0; left: 0; width: 3px; height: 40px; }

    .carte-corner-tr { top: 0; right: 0; }
    .carte-corner-tr::before { top: 0; right: 0; width: 40px; height: 3px; }
    .carte-corner-tr::after { top: 0; right: 0; width: 3px; height: 40px; }

    .carte-corner-bl { bottom: 0; left: 0; }
    .carte-corner-bl::before { bottom: 0; left: 0; width: 40px; height: 3px; }
    .carte-corner-bl::after { bottom: 0; left: 0; width: 3px; height: 40px; }

    .carte-corner-br { bottom: 0; right: 0; }
    .carte-corner-br::before { bottom: 0; right: 0; width: 40px; height: 3px; }
    .carte-corner-br::after { bottom: 0; right: 0; width: 3px; height: 40px; }

    /* Deco Lines */
    .carte-deco-line {
      position: absolute;
      left: 50px;
      right: 50px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #d4af37 20%, #d4af37 80%, transparent);
      z-index: 5;
    }

    .carte-deco-top { top: 15px; }
    .carte-deco-bottom { bottom: 15px; }

    /* Fullscreen Button */
    .carte-fullscreen-btn {
      position: absolute;
      top: 25px;
      right: 25px;
      z-index: 150;
      width: 36px;
      height: 36px;
      background: transparent;
      border: 2px solid #d4af37;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      color: #d4af37;
      font-size: 1.2rem;
    }

    .carte-fullscreen-btn:hover {
      background: #d4af37;
      color: #0d0a08;
    }

    .carte-fs-collapse { display: none; }

    /* Flash Overlay */
    .carte-flash {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 200;
      opacity: 0;
      transition: opacity 0.15s;
    }

    .carte-flash.active {
      opacity: 1;
      animation: carteFlash 0.4s ease-out;
    }

    @keyframes carteFlash {
      0% { opacity: 0.8; }
      100% { opacity: 0; }
    }

    /* Overlays */
    .carte-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, #1a1410 0%, #0d0a08 50%, #1a1410 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 100;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .carte-overlay.active {
      opacity: 1;
      pointer-events: auto;
    }

    /* Start Screen */
    .carte-start-content {
      text-align: center;
      padding: 40px;
    }

    .carte-emblem {
      margin-bottom: 20px;
    }

    .carte-emblem-diamond {
      font-size: 3rem;
      color: #d4af37;
      text-shadow: 0 0 30px rgba(212, 175, 55, 0.5);
      animation: emblemPulse 2s ease-in-out infinite;
    }

    @keyframes emblemPulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }

    .carte-emblem-suits {
      font-size: 1.2rem;
      color: #8b7355;
      letter-spacing: 8px;
      margin-top: 8px;
    }

    .carte-start-title {
      font-family: 'Cinzel', serif;
      font-size: 3rem;
      font-weight: 700;
      color: #d4af37;
      letter-spacing: 8px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }

    .carte-start-subtitle {
      font-family: 'Cinzel', serif;
      font-size: 1rem;
      color: #8b7355;
      letter-spacing: 6px;
      margin-top: 5px;
    }

    .carte-divider {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 15px;
      margin: 25px 0;
    }

    .carte-divider-line {
      width: 60px;
      height: 1px;
      background: linear-gradient(90deg, transparent, #d4af37);
    }

    .carte-divider-line:last-child {
      background: linear-gradient(90deg, #d4af37, transparent);
    }

    .carte-divider-diamond {
      color: #d4af37;
      font-size: 0.8rem;
    }

    .carte-start-rules {
      color: #c9b896;
      font-size: 0.95rem;
      line-height: 1.8;
    }

    .carte-start-rules p {
      margin: 5px 0;
    }

    .carte-pass-mark {
      color: #d4af37;
      font-weight: 500;
      margin-top: 10px !important;
    }

    /* Button */
    .carte-button {
      background: transparent;
      border: 2px solid #d4af37;
      color: #d4af37;
      padding: 15px 40px;
      font-family: 'Cinzel', serif;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 3px;
      cursor: pointer;
      margin-top: 25px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .carte-button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.2), transparent);
      transition: left 0.5s ease;
    }

    .carte-button:hover {
      background: #d4af37;
      color: #0d0a08;
      box-shadow: 0 0 30px rgba(212, 175, 55, 0.4);
    }

    .carte-button:hover::before {
      left: 100%;
    }

    .carte-button-small {
      padding: 10px 25px;
      font-size: 0.85rem;
    }

    /* Game Board */
    .carte-board {
      display: none;
      flex-direction: column;
      min-height: 620px;
      padding: 10px 20px;
    }

    .carte-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 30px;
      border-bottom: 1px solid rgba(212, 175, 55, 0.2);
    }

    .carte-title {
      font-family: 'Cinzel', serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: #d4af37;
      letter-spacing: 4px;
    }

    .carte-required {
      font-size: 0.7rem;
      letter-spacing: 2px;
      color: #d4af37;
      border: 1px solid #d4af37;
      padding: 5px 12px;
    }

    /* Player Areas */
    .carte-player-area {
      padding: 15px 20px;
      transition: all 0.3s ease;
      position: relative;
    }

    .carte-player-area.active-turn {
      background: linear-gradient(180deg, rgba(212, 175, 55, 0.05) 0%, transparent 100%);
    }

    .carte-opponent.active-turn {
      background: linear-gradient(0deg, rgba(212, 175, 55, 0.05) 0%, transparent 100%);
    }

    .carte-player-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .carte-you .carte-player-label {
      margin-bottom: 0;
      margin-top: 10px;
    }

    .carte-label-text {
      font-family: 'Cinzel', serif;
      font-size: 0.8rem;
      color: #8b7355;
      letter-spacing: 3px;
    }

    .carte-card-count {
      font-size: 0.75rem;
      color: #6b5a45;
    }

    .carte-turn-indicator {
      position: absolute;
      top: 50%;
      left: 20px;
      transform: translateY(-50%);
      font-family: 'Cinzel', serif;
      font-size: 0.7rem;
      color: #d4af37;
      letter-spacing: 2px;
      opacity: 0;
      transition: opacity 0.3s ease;
      writing-mode: vertical-rl;
      text-orientation: mixed;
    }

    .carte-player-area.active-turn .carte-turn-indicator {
      opacity: 1;
    }

    .carte-hand {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      min-height: 100px;
      gap: 2px;
    }

    /* Cards */
    .carte-card {
      width: 60px;
      height: 90px;
      border-radius: 6px;
      background: #f5e6c8;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-weight: 600;
      font-size: 1.5rem;
      box-shadow: 2px 3px 10px rgba(0,0,0,0.5);
      position: relative;
      border: 2px solid #d4af37;
      margin: 0 -8px;
      cursor: default;
      transition: all 0.2s ease;
      color: #1a1410;
    }

    .carte-you .carte-card {
      cursor: pointer;
    }

    .carte-you .carte-card:hover {
      transform: translateY(-20px) scale(1.05);
      z-index: 100;
      box-shadow: 0 15px 30px rgba(0,0,0,0.6), 0 0 20px rgba(212, 175, 55, 0.3);
    }

    .carte-card-corner {
      position: absolute;
      font-size: 0.55rem;
      font-weight: 700;
    }

    .carte-card-tl { top: 4px; left: 5px; }
    .carte-card-br { bottom: 4px; right: 5px; transform: rotate(180deg); }

    .carte-card-value {
      font-family: 'Cinzel', serif;
      font-weight: 700;
    }

    .carte-card.red {
      background: linear-gradient(135deg, #8b0000 0%, #5c0000 100%);
      color: #f5e6c8;
      border-color: #a52a2a;
    }

    .carte-card.blue {
      background: linear-gradient(135deg, #1a365d 0%, #0d1b2a 100%);
      color: #f5e6c8;
      border-color: #2c5282;
    }

    .carte-card.green {
      background: linear-gradient(135deg, #1a472a 0%, #0d2818 100%);
      color: #f5e6c8;
      border-color: #276749;
    }

    .carte-card.yellow {
      background: linear-gradient(135deg, #d4af37 0%, #a67c00 100%);
      color: #1a1410;
      border-color: #e6c84b;
    }

    .carte-card.wild {
      background: conic-gradient(from 45deg, #8b0000, #d4af37, #1a472a, #1a365d, #8b0000);
      color: #f5e6c8;
      border-color: #d4af37;
      text-shadow: 0 1px 3px rgba(0,0,0,0.5);
    }

    .carte-card.carte-back {
      background: linear-gradient(135deg, #2a2015 0%, #1a1410 100%);
      border-color: #4a3f30;
    }

    .carte-back-pattern {
      color: #4a3f30;
      font-size: 1.5rem;
    }

    .carte-card.carte-discard {
      cursor: default;
      margin: 0;
    }

    /* Table Area */
    .carte-table {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    .carte-table-felt {
      display: flex;
      gap: 30px;
      align-items: center;
      padding: 25px 40px;
      background: linear-gradient(135deg, rgba(26, 71, 42, 0.3) 0%, rgba(13, 40, 24, 0.3) 100%);
      border: 2px solid rgba(212, 175, 55, 0.3);
      border-radius: 100px;
    }

    .carte-deck {
      width: 60px;
      height: 90px;
      background: linear-gradient(135deg, #2a2015 0%, #1a1410 100%);
      border: 2px solid #4a3f30;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      box-shadow: 3px 3px 15px rgba(0,0,0,0.5);
      transition: all 0.2s ease;
      position: relative;
    }

    .carte-deck::before {
      content: '';
      color: #4a3f30;
      font-size: 1.5rem;
    }

    .carte-deck:hover {
      transform: scale(1.05);
      box-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
      border-color: #d4af37;
    }

    .carte-deck-label {
      position: absolute;
      bottom: -25px;
      font-size: 0.6rem;
      color: #6b5a45;
      letter-spacing: 2px;
    }

    /* Footer */
    .carte-footer {
      text-align: center;
      padding: 10px;
      border-top: 1px solid rgba(212, 175, 55, 0.2);
    }

    .carte-footer-text {
      font-family: 'Cinzel', serif;
      font-size: 0.65rem;
      color: #4a3f30;
      letter-spacing: 4px;
    }

    /* Modal */
    .carte-modal {
      position: absolute;
      inset: 0;
      background: rgba(13, 10, 8, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 150;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }

    .carte-modal.active {
      opacity: 1;
      pointer-events: auto;
    }

    .carte-modal-content {
      background: linear-gradient(180deg, #1a1410 0%, #0d0a08 100%);
      border: 2px solid #d4af37;
      padding: 30px 40px;
      max-width: 420px;
      width: 90%;
      text-align: center;
    }

    .carte-modal.attack-mode .carte-modal-content {
      border-color: #8b0000;
      box-shadow: 0 0 40px rgba(139, 0, 0, 0.4);
    }

    .carte-modal.defend-mode .carte-modal-content {
      border-color: #1a365d;
      box-shadow: 0 0 40px rgba(26, 54, 93, 0.4);
      animation: defenseShake 0.5s ease-out;
    }

    @keyframes defenseShake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-5px); }
      80% { transform: translateX(5px); }
    }

    .carte-modal.wild-mode .carte-modal-content {
      border-image: conic-gradient(from 45deg, #8b0000, #d4af37, #1a472a, #1a365d, #8b0000) 1;
      box-shadow: 0 0 40px rgba(212, 175, 55, 0.3);
    }

    .carte-modal.bonus-mode .carte-modal-content {
      border-color: #d4af37;
      box-shadow: 0 0 40px rgba(212, 175, 55, 0.4);
    }

    .carte-quiz-badge {
      display: inline-block;
      padding: 8px 20px;
      font-family: 'Cinzel', serif;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 3px;
      margin-bottom: 15px;
    }

    .carte-quiz-badge.attack {
      background: linear-gradient(135deg, #8b0000, #5c0000);
      color: #f5e6c8;
      animation: attackPulse 0.8s infinite;
    }

    @keyframes attackPulse {
      0%, 100% { box-shadow: 0 0 10px rgba(139, 0, 0, 0.5); }
      50% { box-shadow: 0 0 25px rgba(139, 0, 0, 0.8); }
    }

    .carte-quiz-badge.defend {
      background: linear-gradient(135deg, #1a365d, #0d1b2a);
      color: #f5e6c8;
      animation: defendPulse 0.6s infinite;
    }

    @keyframes defendPulse {
      0%, 100% { box-shadow: 0 0 10px rgba(26, 54, 93, 0.5); }
      50% { box-shadow: 0 0 25px rgba(26, 54, 93, 0.8); }
    }

    .carte-quiz-badge.wild {
      background: conic-gradient(from 45deg, #8b0000, #d4af37, #1a472a, #1a365d, #8b0000);
      color: #f5e6c8;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }

    .carte-quiz-badge.bonus {
      background: linear-gradient(135deg, #d4af37, #a67c00);
      color: #1a1410;
    }

    .carte-quiz-title {
      font-family: 'Cinzel', serif;
      font-size: 1.3rem;
      color: #d4af37;
      letter-spacing: 2px;
      margin: 0 0 10px 0;
    }

    .carte-quiz-question {
      color: #c9b896;
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 0 0 20px 0;
      white-space: pre-line;
    }

    .carte-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .carte-option-btn {
      display: flex;
      align-items: center;
      gap: 15px;
      width: 100%;
      padding: 12px 15px;
      background: transparent;
      border: 1px solid #4a3f30;
      color: #c9b896;
      font-family: 'Josefin Sans', sans-serif;
      font-size: 0.9rem;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .carte-option-btn:hover {
      background: rgba(212, 175, 55, 0.1);
      border-color: #d4af37;
      transform: translateX(5px);
    }

    .carte-option-letter {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #4a3f30;
      font-family: 'Cinzel', serif;
      font-weight: 600;
      font-size: 0.8rem;
      color: #8b7355;
    }

    .carte-option-btn:hover .carte-option-letter {
      border-color: #d4af37;
      color: #d4af37;
    }

    /* Feedback */
    .carte-feedback {
      display: none;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      margin-top: 15px;
      border: 1px solid #4a3f30;
    }

    .carte-feedback.correct {
      border-color: #d4af37;
      background: rgba(212, 175, 55, 0.1);
    }

    .carte-feedback.wrong {
      border-color: #8b0000;
      background: rgba(139, 0, 0, 0.1);
    }

    .carte-feedback-icon {
      font-size: 2rem;
      margin-bottom: 10px;
    }

    .carte-feedback-icon.correct {
      color: #d4af37;
    }

    .carte-feedback-icon.wrong {
      color: #8b0000;
    }

    .carte-feedback-msg {
      font-family: 'Cinzel', serif;
      font-size: 1rem;
      color: #c9b896;
      letter-spacing: 1px;
      margin: 0 0 10px 0;
    }

    .carte-feedback-exp {
      font-size: 0.85rem;
      color: #8b7355;
      font-style: italic;
      margin: 0 0 15px 0;
    }

    /* Color Picker */
    .carte-color-picker {
      padding: 30px;
    }

    .carte-modal-title {
      font-family: 'Cinzel', serif;
      font-size: 1.2rem;
      color: #d4af37;
      letter-spacing: 3px;
      margin: 0 0 25px 0;
    }

    .carte-color-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }

    .carte-color-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 20px;
      border: 2px solid transparent;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .carte-color-btn:hover {
      transform: scale(1.05);
    }

    .carte-color-gem {
      font-size: 2rem;
    }

    .carte-color-name {
      font-family: 'Cinzel', serif;
      font-size: 0.7rem;
      letter-spacing: 2px;
    }

    .carte-color-ruby {
      background: linear-gradient(135deg, #8b0000, #5c0000);
      color: #f5e6c8;
    }

    .carte-color-ruby:hover {
      border-color: #a52a2a;
      box-shadow: 0 0 20px rgba(139, 0, 0, 0.5);
    }

    .carte-color-sapphire {
      background: linear-gradient(135deg, #1a365d, #0d1b2a);
      color: #f5e6c8;
    }

    .carte-color-sapphire:hover {
      border-color: #2c5282;
      box-shadow: 0 0 20px rgba(26, 54, 93, 0.5);
    }

    .carte-color-emerald {
      background: linear-gradient(135deg, #1a472a, #0d2818);
      color: #f5e6c8;
    }

    .carte-color-emerald:hover {
      border-color: #276749;
      box-shadow: 0 0 20px rgba(26, 71, 42, 0.5);
    }

    .carte-color-gold {
      background: linear-gradient(135deg, #d4af37, #a67c00);
      color: #1a1410;
    }

    .carte-color-gold:hover {
      border-color: #e6c84b;
      box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
    }

    /* End Screen */
    .carte-end-content {
      text-align: center;
      padding: 30px;
      max-width: 500px;
    }

    .carte-end-emblem {
      font-size: 3rem;
      margin-bottom: 15px;
    }

    .carte-end-emblem.victory {
      color: #d4af37;
      text-shadow: 0 0 30px rgba(212, 175, 55, 0.5);
    }

    .carte-end-emblem.partial {
      color: #8b7355;
    }

    .carte-end-emblem.defeat {
      color: #8b0000;
    }

    .carte-end-title {
      font-family: 'Cinzel', serif;
      font-size: 2rem;
      color: #d4af37;
      letter-spacing: 4px;
      margin: 0 0 10px 0;
    }

    .carte-end-score {
      color: #c9b896;
      font-size: 1rem;
      margin: 0;
    }

    .carte-pass-info {
      display: block;
      margin-top: 8px;
      font-size: 0.9rem;
    }

    .carte-pass-info.passed {
      color: #d4af37;
    }

    .carte-pass-info.failed {
      color: #8b0000;
    }

    /* Log */
    .carte-log {
      max-height: 200px;
      overflow-y: auto;
      text-align: left;
      margin: 20px 0;
    }

    .carte-log-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      margin-bottom: 8px;
      background: rgba(74, 63, 48, 0.2);
      border-left: 3px solid #4a3f30;
    }

    .carte-log-item.correct {
      border-left-color: #d4af37;
    }

    .carte-log-item.wrong {
      border-left-color: #8b0000;
    }

    .carte-log-type {
      font-size: 1rem;
      color: #8b7355;
    }

    .carte-log-content {
      flex: 1;
    }

    .carte-log-question {
      font-size: 0.85rem;
      color: #c9b896;
    }

    .carte-log-exp {
      font-size: 0.75rem;
      color: #6b5a45;
      font-style: italic;
      margin-top: 4px;
    }

    .carte-log-result {
      font-size: 1rem;
      font-weight: 600;
    }

    .carte-log-item.correct .carte-log-result {
      color: #d4af37;
    }

    .carte-log-item.wrong .carte-log-result {
      color: #8b0000;
    }

    .carte-no-questions {
      color: #6b5a45;
      font-style: italic;
      text-align: center;
    }

    /* Fullscreen Styles */
    .carte-activity-maximized {
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

    .carte-maximized, .carte-native-fullscreen {
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

    .carte-maximized .carte-board,
    .carte-native-fullscreen .carte-board {
      flex: 1;
      min-height: auto;
    }

    .carte-maximized .carte-table,
    .carte-native-fullscreen .carte-table {
      flex: 1;
    }

    /* Larger cards in fullscreen */
    .carte-maximized .carte-card,
    .carte-native-fullscreen .carte-card {
      width: 90px;
      height: 135px;
      font-size: 2.2rem;
      border-width: 3px;
    }

    .carte-maximized .carte-card-corner,
    .carte-native-fullscreen .carte-card-corner {
      font-size: 0.75rem;
    }

    .carte-maximized .carte-deck,
    .carte-native-fullscreen .carte-deck {
      width: 90px;
      height: 135px;
    }

    .carte-maximized .carte-deck::before,
    .carte-native-fullscreen .carte-deck::before {
      font-size: 2.5rem;
    }

    .carte-maximized .carte-hand,
    .carte-native-fullscreen .carte-hand {
      min-height: 160px;
    }

    .carte-maximized .carte-title,
    .carte-native-fullscreen .carte-title {
      font-size: 2.5rem;
    }

    .carte-maximized .carte-table-felt,
    .carte-native-fullscreen .carte-table-felt {
      padding: 45px 80px;
      gap: 70px;
    }

    /* Larger player labels and card counts */
    .carte-maximized .carte-label-text,
    .carte-native-fullscreen .carte-label-text {
      font-size: 1.1rem;
      letter-spacing: 4px;
    }

    .carte-maximized .carte-card-count,
    .carte-native-fullscreen .carte-card-count {
      font-size: 1.1rem;
    }

    .carte-maximized .carte-turn-indicator,
    .carte-native-fullscreen .carte-turn-indicator {
      font-size: 0.9rem;
      letter-spacing: 3px;
    }

    .carte-maximized .carte-player-area,
    .carte-native-fullscreen .carte-player-area {
      padding: 20px 40px;
    }

    /* Larger modal content */
    .carte-maximized .carte-modal-content,
    .carte-native-fullscreen .carte-modal-content {
      max-width: 550px;
      padding: 40px 50px;
    }

    .carte-maximized .carte-quiz-badge,
    .carte-native-fullscreen .carte-quiz-badge {
      font-size: 1.1rem;
      padding: 10px 25px;
    }

    .carte-maximized .carte-quiz-title,
    .carte-native-fullscreen .carte-quiz-title {
      font-size: 1.8rem;
      margin-bottom: 15px;
    }

    .carte-maximized .carte-quiz-question,
    .carte-native-fullscreen .carte-quiz-question {
      font-size: 1.2rem;
      line-height: 1.6;
      margin-bottom: 25px;
    }

    .carte-maximized .carte-option-btn,
    .carte-native-fullscreen .carte-option-btn {
      padding: 16px 20px;
      font-size: 1.1rem;
    }

    .carte-maximized .carte-option-letter,
    .carte-native-fullscreen .carte-option-letter {
      width: 36px;
      height: 36px;
      font-size: 1rem;
    }

    .carte-maximized .carte-feedback,
    .carte-native-fullscreen .carte-feedback {
      padding: 25px;
    }

    .carte-maximized .carte-feedback-icon,
    .carte-native-fullscreen .carte-feedback-icon {
      font-size: 2.5rem;
    }

    .carte-maximized .carte-feedback-msg,
    .carte-native-fullscreen .carte-feedback-msg {
      font-size: 1.2rem;
    }

    .carte-maximized .carte-feedback-exp,
    .carte-native-fullscreen .carte-feedback-exp {
      font-size: 1rem;
    }

    .carte-maximized .carte-button-small,
    .carte-native-fullscreen .carte-button-small {
      padding: 12px 30px;
      font-size: 1rem;
    }

    .carte-maximized .carte-start-title,
    .carte-native-fullscreen .carte-start-title {
      font-size: 4.5rem;
    }

    .carte-maximized .carte-start-subtitle,
    .carte-native-fullscreen .carte-start-subtitle {
      font-size: 1.3rem;
    }

    .carte-maximized .carte-start-rules,
    .carte-native-fullscreen .carte-start-rules {
      font-size: 1.1rem;
    }

    .carte-maximized .carte-end-title,
    .carte-native-fullscreen .carte-end-title {
      font-size: 3rem;
    }

    .carte-maximized .carte-end-score,
    .carte-native-fullscreen .carte-end-score {
      font-size: 1.2rem;
    }
  `,
};

export default cardGameTheme;
