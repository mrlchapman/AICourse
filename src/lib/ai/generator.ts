/**
 * AI Course Generator
 * Uses Gemini and OpenAI to generate interactive courses from text content.
 * Supports both quick (full course) and progressive (outline → sections) generation.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import type {
  CourseContent,
  CourseSection,
  CourseOutline,
  SectionOutline,
  AIQuestion,
  AIQuestionAnswer,
  ActivityType,
} from '@/types/activities';

// ============================================
// Types
// ============================================

export type AIModel = 'gemini-2.5-flash' | 'gemini-2.0-flash-exp' | 'gpt-4o-mini';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface GenerationOptions {
  model: AIModel;
  apiKey: string;
  includeActivities?: boolean;
  activityTypes?: string[];
}

interface SectionGenerationContext {
  courseTitle: string;
  courseDescription: string;
  previousSectionTitles: string[];
  userAnswers: AIQuestionAnswer[];
  originalText: string;
  usedGameTypes?: string[];
}

let lastTokenUsage: TokenUsage | null = null;

export function getLastTokenUsage(): TokenUsage | null {
  return lastTokenUsage;
}

// ============================================
// Core API Calls
// ============================================

async function generateWithGemini(
  prompt: string,
  apiKey: string,
  modelName: string = 'gemini-2.5-flash'
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      maxOutputTokens: 65536,
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  });

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;

    const usage = response.usageMetadata;
    if (usage) {
      lastTokenUsage = {
        promptTokens: usage.promptTokenCount || 0,
        completionTokens: usage.candidatesTokenCount || 0,
        totalTokens: usage.totalTokenCount || 0,
      };
    }

    return response.text();
  } catch (error: any) {
    if (error.status === 503 || error.message?.includes('503')) {
      console.log(`[AI] 503 for ${modelName}, retrying in 3s...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const result = await model.generateContent(prompt);
      const usage = result.response.usageMetadata;
      if (usage) {
        lastTokenUsage = {
          promptTokens: usage.promptTokenCount || 0,
          completionTokens: usage.candidatesTokenCount || 0,
          totalTokens: usage.totalTokenCount || 0,
        };
      }
      return result.response.text();
    }
    throw error;
  }
}

async function generateWithOpenAI(
  prompt: string,
  apiKey: string,
  model: AIModel
): Promise<string> {
  const openai = new OpenAI({ apiKey });

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert instructional designer creating comprehensive educational courses. Return only valid JSON with no markdown formatting.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 65536,
    response_format: { type: 'json_object' },
  });

  if (completion.usage) {
    lastTokenUsage = {
      promptTokens: completion.usage.prompt_tokens || 0,
      completionTokens: completion.usage.completion_tokens || 0,
      totalTokens: completion.usage.total_tokens || 0,
    };
  }

  return completion.choices[0]?.message?.content || '{}';
}

async function callAI(prompt: string, options: GenerationOptions): Promise<string> {
  if (options.model.startsWith('gemini')) {
    return generateWithGemini(prompt, options.apiKey, options.model);
  }
  return generateWithOpenAI(prompt, options.apiKey, options.model);
}

// ============================================
// JSON Utilities
// ============================================

function cleanJsonResponse(response: string): string {
  let cleaned = response.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/```\n?/g, '');
  }
  if (!cleaned.startsWith('{') && !cleaned.startsWith('[')) {
    const jsonStart = cleaned.indexOf('{');
    const arrayStart = cleaned.indexOf('[');
    const start = jsonStart === -1 ? arrayStart : arrayStart === -1 ? jsonStart : Math.min(jsonStart, arrayStart);
    const end = cleaned.startsWith('[') ? cleaned.lastIndexOf(']') : cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      cleaned = cleaned.substring(start, end + 1);
    }
  }
  return cleaned;
}

function repairTruncatedJSON(json: string): string {
  // Strategy 1: Try closing brackets on the full string first (preserves most data)
  const attempt1 = closeBrackets(json);
  try { JSON.parse(attempt1); return attempt1; } catch { /* try next strategy */ }

  // Strategy 2: Remove trailing incomplete key-value pair, then close
  let trimmed = json.replace(/,\s*"[^"]*"\s*:\s*("([^"\\]|\\.)*)?$/, '');
  trimmed = trimmed.replace(/,\s*$/, '');
  const attempt2 = closeBrackets(trimmed);
  try { JSON.parse(attempt2); return attempt2; } catch { /* try next strategy */ }

  // Strategy 3: Cut at last complete object/array entry
  const lastCompleteActivity = json.lastIndexOf('},');
  const lastCompleteArray = json.lastIndexOf('],');
  const cutPoint = Math.max(lastCompleteActivity, lastCompleteArray);

  let repaired = json;
  if (cutPoint > json.length * 0.3) {
    repaired = json.substring(0, cutPoint + 1);
  }

  repaired = repaired.replace(/,\s*$/, '');
  repaired = repaired.replace(/:\s*$/, ': null');
  repaired = repaired.replace(/"[^"]*$/, '""');

  return closeBrackets(repaired);
}

function closeBrackets(json: string): string {
  let repaired = json;
  // Close any unterminated strings
  let inString = false;
  let escapeNext = false;
  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (char === '\\' && inString) { escapeNext = true; continue; }
    if (char === '"') { inString = !inString; continue; }
  }
  if (inString) repaired += '"';

  // Count and close unclosed brackets
  inString = false;
  escapeNext = false;
  let braceCount = 0;
  let bracketCount = 0;
  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (char === '\\' && inString) { escapeNext = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (char === '{') braceCount++;
    if (char === '}') braceCount--;
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;
  }

  while (bracketCount > 0) { repaired += ']'; bracketCount--; }
  while (braceCount > 0) { repaired += '}'; braceCount--; }

  return repaired;
}

function safeParseJSON(text: string): any {
  const cleaned = cleanJsonResponse(text);
  try {
    return JSON.parse(cleaned);
  } catch (e: any) {
    if (
      e.message.includes('Unterminated string') ||
      e.message.includes('Unexpected end') ||
      e.message.includes('Expected')
    ) {
      const repaired = repairTruncatedJSON(cleaned);
      return JSON.parse(repaired);
    }
    throw e;
  }
}

// ============================================
// Activity Validation & Normalization
// ============================================

function normalizeActivities(activities: any[]): any[] {
  return activities
    .filter((a: any) => a && a.type)
    .map((activity: any, index: number) => {
      if (!activity.id) activity.id = `activity-${Date.now()}-${index}`;
      if (activity.order === undefined) activity.order = index;

      // Knowledge checks
      if (activity.type === 'knowledge_check') {
        // AI often returns "answers" or "choices" instead of "options"
        if (!activity.options && activity.answers) {
          activity.options = activity.answers;
          delete activity.answers;
        }
        if (!activity.options && activity.choices) {
          activity.options = activity.choices;
          delete activity.choices;
        }
        // AI may nest question under "text" or "prompt"
        if (!activity.question && activity.text) {
          activity.question = activity.text;
          delete activity.text;
        }
        if (!activity.question && activity.prompt) {
          activity.question = activity.prompt;
          delete activity.prompt;
        }
        if (!activity.options) activity.options = [];
        // AI may return options as strings instead of objects
        activity.options = activity.options.map((opt: any, i: number) => {
          if (typeof opt === 'string') {
            return { id: `opt-${index}-${i}`, text: opt, correct: false };
          }
          // AI may use "label" or "value" or "answer" instead of "text"
          if (!opt.text && (opt.label || opt.value || opt.answer)) {
            opt.text = opt.label || opt.value || opt.answer;
          }
          return opt;
        });
        activity.options.forEach((opt: any, i: number) => {
          if (!opt.id) opt.id = `opt-${index}-${i}`;
          opt.correct = opt.correct === true || opt.correct === 'true';
        });
        // Handle correctIndex / correct_answer patterns
        if (!activity.options.some((opt: any) => opt.correct)) {
          const idx = typeof activity.correctIndex === 'number' ? activity.correctIndex
            : typeof activity.correct_answer === 'number' ? activity.correct_answer : 0;
          if (activity.options[idx]) activity.options[idx].correct = true;
        }
        // Shuffle options
        activity.options = activity.options
          .map((v: any) => ({ v, sort: Math.random() }))
          .sort((a: any, b: any) => a.sort - b.sort)
          .map(({ v }: any) => v);
      }

      // Quiz questions
      if (activity.type === 'quiz') {
        // AI may use "title" or "name" fields — ensure defaults
        if (!activity.title) activity.title = activity.name || 'Quiz';
        if (!activity.passingScore) activity.passingScore = 80;
        if (!activity.questions) activity.questions = [];
        activity.questions.forEach((q: any, qi: number) => {
          if (!q.id) q.id = `q-${Date.now()}-${qi}`;
          // AI may use "question" instead of "text" for the question text
          if (!q.text && q.question) {
            q.text = q.question;
            delete q.question;
          }
          if (!q.points) q.points = 10;
          // AI often returns "answers" or "choices" instead of "options"
          if (!q.options && q.answers) {
            q.options = q.answers;
            delete q.answers;
          }
          if (!q.options && q.choices) {
            q.options = q.choices;
            delete q.choices;
          }
          if (!q.options) q.options = [];
          // AI may return options as strings instead of objects
          q.options = q.options.map((opt: any, oi: number) => {
            if (typeof opt === 'string') {
              return { id: `opt-${qi}-${oi}`, text: opt, correct: false };
            }
            if (!opt.text && (opt.label || opt.value || opt.answer)) {
              opt.text = opt.label || opt.value || opt.answer;
            }
            return opt;
          });
          q.options.forEach((opt: any, oi: number) => {
            if (!opt.id) opt.id = `opt-${qi}-${oi}`;
            opt.correct = opt.correct === true || opt.correct === 'true';
          });
          if (!q.options.some((opt: any) => opt.correct) && q.options.length > 0) {
            const idx = typeof q.correctIndex === 'number' ? q.correctIndex
              : typeof q.correct_answer === 'number' ? q.correct_answer : 0;
            if (q.options[idx]) q.options[idx].correct = true;
          }
        });
      }

      // Flashcards
      if (activity.type === 'flashcard') {
        // AI may return "items" or "flashcards" instead of "cards"
        if (!activity.cards && activity.items) {
          activity.cards = activity.items;
          delete activity.items;
        }
        if (!activity.cards && activity.flashcards) {
          activity.cards = activity.flashcards;
          delete activity.flashcards;
        }
        if (!activity.cards) activity.cards = [];
        // Normalize card fields: AI may use "question"/"term" for front, "answer"/"definition" for back
        activity.cards = activity.cards.map((card: any, ci: number) => {
          if (!card.front && (card.question || card.term || card.word)) {
            card.front = card.question || card.term || card.word;
          }
          if (!card.back && (card.answer || card.definition || card.meaning)) {
            card.back = card.answer || card.definition || card.meaning;
          }
          if (!card.id) card.id = `card-${ci}`;
          return card;
        });
        activity.cards = activity.cards.filter((card: any) => {
          const hasFront = card.front?.trim() || card.frontImageQuery?.trim();
          const hasBack = card.back?.trim() || card.backImageQuery?.trim();
          return hasFront && hasBack;
        });
      }

      // Accordions
      if (activity.type === 'accordion') {
        // AI may return "items" or "panels" instead of "sections"
        if (!activity.sections && activity.items) {
          activity.sections = activity.items;
          delete activity.items;
        }
        if (!activity.sections && activity.panels) {
          activity.sections = activity.panels;
          delete activity.panels;
        }
        if (!activity.sections) activity.sections = [];
        activity.sections.forEach((s: any, si: number) => {
          if (!s.id) s.id = `acc-sect-${si}`;
          // AI may use "heading"/"label" instead of "title", "body"/"text" instead of "content"
          if (!s.title && (s.heading || s.label)) s.title = s.heading || s.label;
          if (!s.content && (s.body || s.text)) s.content = s.body || s.text;
        });
      }

      // Gamification
      if (activity.type === 'gamification') {
        normalizeGamificationActivity(activity);
      }

      return activity;
    });
}

function normalizeGamificationActivity(activity: any): void {
  const gameType = activity.gameType || 'memory_match';
  if (!activity.config) activity.config = {};

  // AI sometimes puts game data at the activity root instead of inside config
  if (gameType === 'memory_match' && !activity.config.pairs && activity.pairs) {
    activity.config.pairs = activity.pairs;
    delete activity.pairs;
  }

  if (gameType === 'memory_match' && activity.config.pairs) {
    // Fix pairs where AI returned strings instead of {type, content} objects
    activity.config.pairs = activity.config.pairs.map((pair: any, i: number) => {
      if (!pair.id) pair.id = `p${i + 1}`;
      // AI may use "term"/"definition" or "left"/"right" or "word"/"meaning"
      if (!pair.item1 && (pair.term || pair.left || pair.word)) {
        pair.item1 = { type: 'text', content: pair.term || pair.left || pair.word };
      }
      if (!pair.item2 && (pair.definition || pair.right || pair.meaning || pair.match)) {
        pair.item2 = { type: 'text', content: pair.definition || pair.right || pair.meaning || pair.match };
      }
      if (typeof pair.item1 === 'string') pair.item1 = { type: 'text', content: pair.item1 };
      if (typeof pair.item2 === 'string') pair.item2 = { type: 'text', content: pair.item2 };
      if (pair.item1 && !pair.item1.type) pair.item1.type = 'text';
      if (pair.item2 && !pair.item2.type) pair.item2.type = 'text';
      return pair;
    });
    activity.config.pairs = activity.config.pairs.filter((pair: any) => {
      const hasItem1 = pair.item1?.content?.trim() || pair.item1?.imageQuery?.trim();
      const hasItem2 = pair.item2?.content?.trim() || pair.item2?.imageQuery?.trim();
      return hasItem1 && hasItem2;
    });
  }

  // Question-based games with correctIndex
  const questionKeyMap: Record<string, string> = {
    battleships: 'battleshipsQuestions',
    millionaire: 'millionaireQuestions',
    the_chase: 'chaseQuestions',
    quiz_uno: 'unoQuestions',
    word_search: 'wordSearchWords',
    knowledge_tetris: 'questions',
    neon_defender: 'questions',
  };

  const qKey = questionKeyMap[gameType];

  // AI sometimes puts questions at the activity root instead of inside config
  if (qKey && !activity.config[qKey] && !activity.config.questions && activity.questions) {
    activity.config.questions = activity.questions;
    delete activity.questions;
  }

  // If AI returned questions under wrong key, remap to the correct one
  if (qKey && !activity.config[qKey] && activity.config.questions && qKey !== 'questions') {
    activity.config[qKey] = activity.config.questions;
    delete activity.config.questions;
  }

  // Normalize all question-based games: ensure answers exist and are well-formed
  if (qKey && activity.config[qKey]) {
    activity.config[qKey].forEach((q: any, i: number) => {
      if (!q.id) q.id = `${gameType.substring(0, 3)}-q${i + 1}`;

      // For neon_defender: answers are [{text, correct}]
      if (gameType === 'neon_defender') {
        // AI may use "options" or "choices" instead of "answers"
        if (!q.answers && q.options) { q.answers = q.options; delete q.options; }
        if (!q.answers && q.choices) { q.answers = q.choices; delete q.choices; }
        if (!q.answers) q.answers = [];
        // Normalize: AI may return strings instead of objects
        q.answers = q.answers.map((a: any) => {
          if (typeof a === 'string') return { text: a, correct: false };
          if (!a.text && (a.label || a.value || a.answer)) a.text = a.label || a.value || a.answer;
          a.correct = a.correct === true || a.correct === 'true';
          return a;
        });
        // If no answer is marked correct and correctIndex exists, set it
        if (!q.answers.some((a: any) => a.correct) && q.answers.length > 0) {
          const idx = typeof q.correctIndex === 'number' ? q.correctIndex : 0;
          if (q.answers[idx]) q.answers[idx].correct = true;
        }
        // Truncate long answer text for neon_defender display
        q.answers = q.answers.map((a: any) => {
          if (typeof a === 'object' && a.text && a.text.length > 12) {
            const text = a.text.trim();
            const lastSpace = text.substring(0, 12).lastIndexOf(' ');
            if (lastSpace > 4) return { ...a, text: text.substring(0, lastSpace).trim() };
            const firstWord = text.split(' ')[0];
            return { ...a, text: firstWord.length <= 12 ? firstWord : firstWord.substring(0, 12) };
          }
          return a;
        });
      } else {
        // For correctIndex-based games (battleships, millionaire, the_chase, etc.)
        // AI may use "options" or "choices" instead of "answers"
        if (!q.answers && q.options) { q.answers = q.options; delete q.options; }
        if (!q.answers && q.choices) { q.answers = q.choices; delete q.choices; }
        // Normalize answers to string array
        if (q.answers && Array.isArray(q.answers)) {
          q.answers = q.answers.map((a: any) => (typeof a === 'object' ? (a.text || a.label || a.value || '') : String(a)));
        }
        if (q.correctIndex !== undefined) q.correctIndex = Number(q.correctIndex) || 0;
      }
    });

    // Filter out questions that have no answers at all
    activity.config[qKey] = activity.config[qKey].filter((q: any) => {
      if (gameType === 'neon_defender') return q.answers && q.answers.length >= 2;
      if (gameType === 'word_search') return q.word?.trim();
      return q.answers && q.answers.length >= 2;
    });
  }
}

function filterMinimumRequirements(activities: any[]): any[] {
  return activities.filter((activity: any) => {
    // Remove knowledge checks with no question or no options
    if (activity.type === 'knowledge_check') {
      if (!activity.question?.trim()) return false;
      if (!activity.options || activity.options.length < 2) return false;
    }
    // Require at least 2 questions (not 4) — partial content is better than nothing
    if (activity.type === 'flashcard' && (!activity.cards || activity.cards.length < 2)) return false;
    if (activity.type === 'accordion' && (!activity.sections || activity.sections.length < 2)) return false;
    if (activity.type === 'quiz' && (!activity.questions || activity.questions.length < 2)) return false;
    if (activity.type === 'gamification') {
      const gt = activity.gameType || 'memory_match';
      const cfg = activity.config || {};
      if (gt === 'memory_match' && (!cfg.pairs || cfg.pairs.length < 2)) return false;
      if (gt === 'neon_defender' && (!cfg.questions || cfg.questions.length < 2)) return false;
      if (gt === 'battleships' && (!cfg.battleshipsQuestions || cfg.battleshipsQuestions.length < 2)) return false;
      if (gt === 'millionaire' && (!cfg.millionaireQuestions || cfg.millionaireQuestions.length < 2)) return false;
      if (gt === 'the_chase' && (!cfg.chaseQuestions || cfg.chaseQuestions.length < 2)) return false;
      if (gt === 'word_search' && (!cfg.wordSearchWords || cfg.wordSearchWords.length < 2)) return false;
      if (gt === 'quiz_uno' && (!cfg.unoQuestions || cfg.unoQuestions.length < 2)) return false;
      if (gt === 'knowledge_tetris' && (!cfg.questions || cfg.questions.length < 2)) return false;
    }
    return true;
  });
}

function enforceQuizzesLast(activities: any[]): any[] {
  const sorted = [...activities].sort((a, b) => {
    if (a.type === 'quiz' && b.type !== 'quiz') return 1;
    if (a.type !== 'quiz' && b.type === 'quiz') return -1;
    return (a.order || 0) - (b.order || 0);
  });
  sorted.forEach((act, idx) => (act.order = idx));
  return sorted;
}

function deduplicateGameTypes(sections: any[]): any[] {
  const usedGameTypes = new Set<string>();
  return sections.map((section: any) => ({
    ...section,
    activities: section.activities.filter((activity: any) => {
      if (activity.type === 'gamification') {
        const gt = activity.gameType || 'memory_match';
        if (usedGameTypes.has(gt)) return false;
        usedGameTypes.add(gt);
      }
      return true;
    }),
  }));
}

// ============================================
// Prompt Builders
// ============================================

function buildCourseGenerationPrompt(text: string, title: string, options: GenerationOptions): string {
  const activityTypes = options.activityTypes || [
    'knowledge_check', 'quiz', 'flashcard', 'text_content',
    'info_panel', 'accordion', 'image', 'infographic', 'gamification', 'divider',
  ];

  let sections = '4-6';
  let activitiesPerSection = '5-7';
  let wordsPerBlock = '150-250';
  let additionalInstructions = '';

  const overrideMatch = text.match(/\[STRUCTURE_OVERRIDE\]\s*([\s\S]*?)\s*\[\/STRUCTURE_OVERRIDE\]/);
  if (overrideMatch) {
    try {
      const override = JSON.parse(overrideMatch[1]);
      const targetSections = Math.min(override.sections || 4, 5);
      const targetActivities = Math.min(override.activitiesPerSection || 5, 5);
      sections = `exactly ${targetSections}`;
      activitiesPerSection = `${targetActivities}-${targetActivities + 1}`;
      wordsPerBlock = `${Math.min(override.wordsPerTextBlock || 150, 150)}-${Math.min((override.wordsPerTextBlock || 150) + 50, 200)}`;
      if (override.difficulty === 'advanced') {
        additionalInstructions = '\nADVANCED LEVEL: Include research citations, professional terminology, nuanced analysis.';
      } else if (override.difficulty === 'beginner') {
        additionalInstructions = '\nBEGINNER LEVEL: Define all technical terms, use simple analogies, build concepts step-by-step.';
      }
    } catch { /* use defaults */ }
  }

  return `You are an expert instructional designer. Create a comprehensive, interactive SCORM course.

TITLE: ${title}

CONTENT/REQUIREMENTS:
${text}
${additionalInstructions}
STRUCTURE:
- Create ${sections} sections that build knowledge progressively
- Each section: ${activitiesPerSection} activities with variety
- Use dividers (clickToContinue: true) to paginate after every 3 activities

ACTIVITY TYPES: ${activityTypes.join(', ')}

MINIMUM REQUIREMENTS:
- quiz: MINIMUM 4 questions
- flashcard: MINIMUM 4 cards
- gamification: MINIMUM 4 pairs/questions depending on gameType
- accordion: MINIMUM 3 sections
- text_content: ${wordsPerBlock} words with HTML (<h2>, <h3>, <p>, <ul>, <li>, <strong>)

ACTIVITY FORMATS:
1. text_content: ${wordsPerBlock} words, rich HTML, real examples and data
2. knowledge_check: 3-4 options, randomize correct position, include explanation
3. quiz: 4+ questions, test application not just recall
4. flashcard: 4+ cards (each needs id, front, back)
5. accordion: 3+ sections (each needs id, title, content)
6. gamification: gameTypes: "memory_match", "neon_defender", "battleships", "millionaire", "the_chase", "word_search", "knowledge_tetris", "quiz_uno" - each can only be used ONCE
7. info_panel: title and content, use for tips/warnings
8. image: Include imageQuery (stock photo search) and geminiPrompt (AI image generation prompt)
9. infographic: Include infographicPrompt (detailed AI infographic generation prompt), alt, title
10. divider: clickToContinue: true, label: "Continue to [topic]"
11. ALL ACTIVITIES: Include "editorLabel" field

GAMIFICATION FORMATS:
- memory_match: config.pairs [{id, item1: {type: "text", content}, item2: {type: "text", content}, info}]
- neon_defender: config.questions [{id, question, explanation, answers: [{text (max 12 chars), correct}]}], startingLives: 3
- battleships: config.battleshipsQuestions [{id, question, explanation, answers: ["A","B","C","D"], correctIndex}]
- millionaire: config.millionaireQuestions [{id, question, explanation, hint, answers, correctIndex}]
- the_chase: config.chaseQuestions [{id, question, explanation, answers, correctIndex}]
- word_search: config.wordSearchWords [{id, word, question, explanation, answers, correctIndex}]
- knowledge_tetris: config.questions [{id, question, explanation, answers, correctIndex}]
- quiz_uno: config.unoQuestions [{id, question, explanation, answers, correctIndex}]

VARIETY RULES:
- EVERY section MUST include at least 1 image activity
- Include at least 2 gamification activities (different gameTypes)
- NEVER use the same gameType more than once

OUTPUT FORMAT:
{
  "title": "${title}",
  "description": "Course description",
  "sections": [
    {
      "id": "section-0",
      "title": "Section Title",
      "paginatedStartLabel": "Introduction",
      "order": 0,
      "activities": [
        {"id": "act-0", "type": "text_content", "order": 0, "editorLabel": "Label", "content": "<h2>Title</h2><p>Content</p>"},
        {"id": "act-1", "type": "knowledge_check", "order": 1, "editorLabel": "Check", "question": "What is X?", "options": [{"id": "o1", "text": "Answer A", "correct": false}, {"id": "o2", "text": "Answer B", "correct": true}, {"id": "o3", "text": "Answer C", "correct": false}, {"id": "o4", "text": "Answer D", "correct": false}], "explanation": "B is correct because..."},
        {"id": "act-2", "type": "image", "order": 2, "editorLabel": "Image", "imageQuery": "terms", "geminiPrompt": "detailed prompt", "alt": "Description"},
        {"id": "act-3", "type": "quiz", "order": 3, "editorLabel": "Quiz", "title": "Section Quiz", "description": "Test your knowledge", "timeLimit": 300, "passingScore": 80, "questions": [{"id": "q1", "text": "Question?", "points": 10, "options": [{"id": "o1", "text": "A", "correct": false}, {"id": "o2", "text": "B", "correct": true}, {"id": "o3", "text": "C", "correct": false}, {"id": "o4", "text": "D", "correct": false}], "feedback": "Explanation"}]}
      ]
    }
  ]
}

CRITICAL: For knowledge_check, use "question" and "options" fields (NOT "answers" or "choices"). For quiz, use "questions" array where each has "text" and "options" (NOT "answers").

Return valid JSON only. NEVER repeat a gameType.`;
}

function buildOutlineGenerationPrompt(text: string, title: string, options: GenerationOptions): string {
  let targetSections = 4;
  const overrideMatch = text.match(/\[STRUCTURE_OVERRIDE\]\s*([\s\S]*?)\s*\[\/STRUCTURE_OVERRIDE\]/);
  if (overrideMatch) {
    try {
      const override = JSON.parse(overrideMatch[1]);
      targetSections = Math.min(override.sections || 4, 6);
    } catch { /* defaults */ }
  }

  const activityTypes = options.activityTypes || [
    'knowledge_check', 'quiz', 'flashcard', 'text_content',
    'info_panel', 'accordion', 'image', 'gamification', 'divider',
  ];

  return `You are an expert instructional designer. Analyze the content and create a COURSE OUTLINE (structure only, not full content).

TITLE: ${title}

CONTENT/REQUIREMENTS:
${text}

TASK: Create a course outline with ${targetSections} sections. For each section, provide:
1. A clear title
2. Key topics to cover (3-5 bullet points)
3. Estimated number of activities (typically 5-7)
4. Suggested activity types that fit the content

ALSO: Identify any ambiguities (0-3 questions max).

AVAILABLE ACTIVITY TYPES: ${activityTypes.join(', ')}

OUTPUT FORMAT (JSON):
{
  "title": "${title}",
  "description": "Course description (2-3 sentences)",
  "sections": [
    {
      "id": "section-0",
      "title": "Section Title",
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "estimatedActivities": 6,
      "suggestedActivityTypes": ["text_content", "knowledge_check", "flashcard"]
    }
  ],
  "suggestedQuestions": [
    {
      "id": "q1",
      "question": "What depth is needed for [topic]?",
      "context": "Context for why asking.",
      "type": "multiple_choice",
      "options": ["Option A", "Option B", "Option C"],
      "relatedSectionIndex": 2
    }
  ]
}

Return ONLY valid JSON. Create exactly ${targetSections} sections.`;
}

function buildSectionWithContextPrompt(
  sectionOutline: SectionOutline,
  sectionIndex: number,
  context: SectionGenerationContext,
  options: GenerationOptions
): string {
  const activityTypes =
    sectionOutline.suggestedActivityTypes.length > 0
      ? sectionOutline.suggestedActivityTypes
      : options.activityTypes || ['text_content', 'knowledge_check', 'quiz', 'flashcard', 'accordion', 'info_panel', 'image', 'gamification', 'divider'];

  let userContext = '';
  if (context.userAnswers.length > 0) {
    userContext = `\nUSER PREFERENCES:\n${context.userAnswers.map((a) => `- ${a.answer}`).join('\n')}`;
  }

  let previousContext = '';
  if (context.previousSectionTitles.length > 0) {
    previousContext = `\nPREVIOUS SECTIONS:\n${context.previousSectionTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
  }

  const allGameTypes = ['memory_match', 'neon_defender', 'battleships', 'millionaire', 'the_chase', 'word_search', 'knowledge_tetris', 'quiz_uno'];
  const usedGameTypes = context.usedGameTypes || [];
  const availableGameTypes = allGameTypes.filter((g) => !usedGameTypes.includes(g));
  let gamificationConstraint = '';
  if (usedGameTypes.length > 0) {
    gamificationConstraint = `\nGAMIFICATION CONSTRAINT: Already used: ${usedGameTypes.join(', ')}. Available: ${availableGameTypes.length > 0 ? availableGameTypes.join(', ') : 'NONE - do not include gamification'}`;
  }

  return `You are an expert instructional designer creating ONE section for an interactive SCORM course.

COURSE: ${context.courseTitle}
DESCRIPTION: ${context.courseDescription}
${previousContext}${userContext}${gamificationConstraint}

SOURCE CONTENT:
${context.originalText.substring(0, 5000)}

NOW GENERATE SECTION ${sectionIndex + 1}: "${sectionOutline.title}"

SECTION OUTLINE:
- Topics: ${sectionOutline.topics.join(', ')}
- Target activities: ~${sectionOutline.estimatedActivities}
- Types: ${activityTypes.join(', ')}

REQUIREMENTS:
1. Create ${sectionOutline.estimatedActivities} activities covering all topics
2. Rich HTML for text content
3. At least one interactive element (knowledge_check, quiz, or flashcard)
4. At least one image activity
5. Dividers with clickToContinue: true after every 3 activities
6. Quiz: MINIMUM 4 questions. Flashcard: MINIMUM 4 cards.

GAMIFICATION FORMATS (each gameType only ONCE per course):
- memory_match: config.pairs [{id, item1, item2, info}] (4+ pairs)
- neon_defender: config.questions [{id, question, explanation, answers: [{text (max 12 chars), correct}]}] (6+ questions)
- battleships: config.battleshipsQuestions [{id, question, explanation, answers, correctIndex}] (6+ questions)
- millionaire: config.millionaireQuestions [{id, question, explanation, hint, answers, correctIndex}] (8+ questions)
- the_chase: config.chaseQuestions [{id, question, explanation, answers, correctIndex}] (6+ questions)

ACTIVITY FIELD NAMES (use EXACTLY these):
- knowledge_check: "question" (string), "options" (array of {id, text, correct}), "explanation" (string)
- quiz: "title", "description", "timeLimit", "passingScore", "questions" (array of {id, text, points, options: [{id, text, correct}], feedback})
- Do NOT use "answers" or "choices" — always use "options"

OUTPUT FORMAT (JSON):
{
  "section": {
    "id": "section-${sectionIndex}",
    "title": "${sectionOutline.title}",
    "order": ${sectionIndex},
    "paginatedStartLabel": "Short label",
    "activities": [...]
  },
  "suggestedQuestion": null
}

Return ONLY valid JSON. All activities need IDs (use "act-${sectionIndex}-N").`;
}

function buildActivityGenerationPrompt(
  text: string,
  type: string,
  options: GenerationOptions,
  subType?: string
): string {
  let specificInstructions = '';

  switch (type) {
    case 'quiz':
      specificInstructions = `Create a quiz with at least 5 questions, 4 options each, passingScore: 80.`;
      break;
    case 'knowledge_check':
      specificInstructions = `Create a single question with 4 options, one correct, include explanation.`;
      break;
    case 'flashcard':
      specificInstructions = `Create at least 6 flashcards with front/back pairs.`;
      break;
    case 'accordion':
      specificInstructions = `Create at least 3 collapsible sections with title/content.`;
      break;
    case 'text_content':
      specificInstructions = `Create a rich HTML text block (~200 words) using h2, p, ul, li tags.`;
      break;
    case 'gamification': {
      const gt = subType || 'memory_match';
      const schemaMap: Record<string, string> = {
        memory_match: `gameType: "memory_match", config: { pairs: [{id, item1: {type: "text", content: "term"}, item2: {type: "text", content: "definition"}, info: "explanation"}] } — MINIMUM 6 pairs`,
        neon_defender: `gameType: "neon_defender", config: { startingLives: 3, questions: [{id, question, explanation, answers: [{text: "max 12 chars", correct: true/false}]}] } — MINIMUM 6 questions, 4 answers each`,
        battleships: `gameType: "battleships", config: { gridSize: 8, shipCount: 4, battleshipsQuestions: [{id, question, explanation, answers: ["A","B","C","D"], correctIndex: 0}] } — MINIMUM 6 questions`,
        millionaire: `gameType: "millionaire", config: { timer: 30, millionaireQuestions: [{id, question, explanation, hint, answers: ["A","B","C","D"], correctIndex: 0}] } — MINIMUM 8 questions, increasing difficulty`,
        the_chase: `gameType: "the_chase", config: { timer: 15, chaserAccuracy: 70, chaseQuestions: [{id, question, explanation, answers: ["A","B","C","D"], correctIndex: 0}] } — MINIMUM 8 questions`,
        word_search: `gameType: "word_search", config: { gridSize: 12, wordSearchWords: [{id, word: "SINGLE WORD", question, explanation, answers: ["A","B","C","D"], correctIndex: 0}] } — MINIMUM 8 words`,
        knowledge_tetris: `gameType: "knowledge_tetris", config: { questions: [{id, question, explanation, answers: ["A","B","C","D"], correctIndex: 0}] } — MINIMUM 6 questions`,
        quiz_uno: `gameType: "quiz_uno", config: { startingCards: 5, unoQuestions: [{id, question, explanation, answers: ["A","B","C","D"], correctIndex: 0}] } — MINIMUM 6 questions`,
      };
      specificInstructions = `Create a ${gt} game.\n\nEXACT SCHEMA REQUIRED:\n${schemaMap[gt] || schemaMap.memory_match}\n\nThe JSON must include: type: "gamification", gameType: "${gt}", and config with the fields above.`;
      break;
    }
    default:
      specificInstructions = `Create a ${type} activity.`;
  }

  return `You are an expert instructional designer.

TASK: Create a SINGLE activity JSON object.
TOPIC: ${text}
ACTIVITY TYPE: ${type}
${specificInstructions}

Return ONLY valid JSON for the single activity object with id, type, editorLabel, order: 0, and type-specific fields.`;
}

// ============================================
// Response Parsers
// ============================================

function deduplicateSectionIds(sections: any[]): any[] {
  const seen = new Set<string>();
  return sections.map((section: any, index: number) => {
    if (!section.id || seen.has(section.id)) {
      section.id = `section-${Date.now()}-${index}`;
    }
    seen.add(section.id);
    return section;
  });
}

function parseCourseResponse(response: string, fallbackTitle: string): CourseContent {
  try {
    if (!response || response.length < 100) {
      throw new Error('AI response is empty or too short');
    }

    const parsed = safeParseJSON(response);

    if (!parsed.sections) {
      throw new Error('Invalid course structure - no sections found');
    }

    parsed.sections.forEach((section: any, sIndex: number) => {
      if (!section.id) section.id = `section-${sIndex}`;
      if (!section.activities) section.activities = [];
      section.activities = normalizeActivities(section.activities);
      section.activities = filterMinimumRequirements(section.activities);
      section.activities = enforceQuizzesLast(section.activities);
    });

    parsed.sections = deduplicateSectionIds(parsed.sections);
    parsed.sections = deduplicateGameTypes(parsed.sections);

    return parsed as CourseContent;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      title: fallbackTitle,
      description: 'AI generation encountered an error. Please try again.',
      sections: [
        {
          id: 'section-0',
          title: 'Introduction',
          order: 0,
          activities: [
            {
              id: 'activity-0',
              type: 'text_content' as ActivityType,
              order: 0,
              content: '<p>Failed to generate course content. Please try again.</p>',
            } as any,
          ],
        },
      ],
    };
  }
}

function parseOutlineResponse(response: string, fallbackTitle: string): CourseOutline {
  try {
    const parsed = safeParseJSON(response);

    const seenIds = new Set<string>();
    return {
      title: parsed.title || fallbackTitle,
      description: parsed.description || '',
      sections: (parsed.sections || []).map((s: any, i: number) => {
        let id = s.id || `section-${i}`;
        if (seenIds.has(id)) {
          id = `section-${Date.now()}-${i}`;
        }
        seenIds.add(id);
        return {
          id,
          title: s.title || `Section ${i + 1}`,
          topics: s.topics || [],
          estimatedActivities: s.estimatedActivities || 5,
          suggestedActivityTypes: s.suggestedActivityTypes || ['text_content', 'knowledge_check'],
        };
      }),
      suggestedQuestions: (parsed.suggestedQuestions || []).map((q: any, i: number) => ({
        id: q.id || `outline-q-${i}`,
        question: q.question || '',
        context: q.context || '',
        type: q.type || 'multiple_choice',
        options: q.options || [],
        relatedSectionIndex: q.relatedSectionIndex,
      })),
    };
  } catch (error) {
    console.error('Error parsing outline:', error);
    return {
      title: fallbackTitle,
      description: 'Course outline',
      sections: [
        {
          id: 'section-0',
          title: 'Introduction',
          topics: ['Overview'],
          estimatedActivities: 5,
          suggestedActivityTypes: ['text_content' as ActivityType, 'knowledge_check' as ActivityType],
        },
      ],
    };
  }
}

function parseSectionWithContextResponse(
  response: string,
  sectionOutline: SectionOutline,
  sectionIndex: number
): { section: CourseSection; suggestedQuestion?: AIQuestion } {
  try {
    const parsed = safeParseJSON(response);
    const sectionData = parsed.section || parsed;

    const section: CourseSection = {
      id: sectionData.id || `section-${sectionIndex}`,
      title: sectionData.title || sectionOutline.title,
      order: sectionIndex,
      paginatedStartLabel: sectionData.paginatedStartLabel,
      activities: normalizeActivities(sectionData.activities || []),
    };

    let suggestedQuestion: AIQuestion | undefined;
    if (parsed.suggestedQuestion?.question) {
      suggestedQuestion = {
        id: parsed.suggestedQuestion.id || `sq-${sectionIndex}`,
        question: parsed.suggestedQuestion.question,
        context: parsed.suggestedQuestion.context || '',
        type: parsed.suggestedQuestion.type || 'multiple_choice',
        options: parsed.suggestedQuestion.options || [],
        relatedSectionIndex: parsed.suggestedQuestion.relatedSectionIndex,
      };
    }

    return { section, suggestedQuestion };
  } catch (error) {
    console.error('Error parsing section:', error);
    return {
      section: {
        id: `section-${sectionIndex}`,
        title: sectionOutline.title,
        order: sectionIndex,
        activities: [
          {
            id: `act-${sectionIndex}-0`,
            type: 'text_content' as ActivityType,
            order: 0,
            content: '<p>Section generation failed. Please edit manually.</p>',
          } as any,
        ],
      },
    };
  }
}

// ============================================
// Public API - Course Generation
// ============================================

/**
 * Quick build: Generates a complete course from text content
 */
export async function generateCourseFromText(
  text: string,
  title: string,
  options: GenerationOptions
): Promise<CourseContent> {
  console.log('[AI] Starting quick course generation for:', title);
  const prompt = buildCourseGenerationPrompt(text, title, options);
  const response = await callAI(prompt, options);
  return parseCourseResponse(response, title);
}

/**
 * Progressive build step 1: Generate course outline
 */
export async function generateCourseOutline(
  text: string,
  title: string,
  options: GenerationOptions
): Promise<CourseOutline> {
  console.log('[AI] Generating outline for:', title);
  const prompt = buildOutlineGenerationPrompt(text, title, options);
  const response = await callAI(prompt, options);
  return parseOutlineResponse(response, title);
}

/**
 * Progressive build step 2+: Generate a single section with context
 */
export async function generateSectionWithContext(
  sectionOutline: SectionOutline,
  sectionIndex: number,
  context: SectionGenerationContext,
  options: GenerationOptions
): Promise<{ section: CourseSection; suggestedQuestion?: AIQuestion }> {
  console.log('[AI] Generating section:', sectionOutline.title);
  const prompt = buildSectionWithContextPrompt(sectionOutline, sectionIndex, context, options);
  const response = await callAI(prompt, options);
  return parseSectionWithContextResponse(response, sectionOutline, sectionIndex);
}

/**
 * Generate a single activity from text
 */
export async function generateActivityFromText(
  text: string,
  type: string,
  options: GenerationOptions,
  subType?: string
): Promise<any> {
  const prompt = buildActivityGenerationPrompt(text, type, options, subType);
  const response = await callAI(prompt, options);

  const parsed = safeParseJSON(response);
  if (!parsed.id) parsed.id = `activity-${Date.now()}`;
  if (parsed.type !== type) parsed.type = type;

  if (type === 'knowledge_check' || type === 'quiz' || type === 'flashcard' || type === 'accordion' || type === 'gamification') {
    const normalized = normalizeActivities([parsed]);
    return normalized[0];
  }

  return parsed;
}
