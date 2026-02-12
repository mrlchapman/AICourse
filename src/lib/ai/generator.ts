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
    max_tokens: 16384,
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
  let inString = false;
  let escapeNext = false;
  const stack: string[] = [];

  for (let i = 0; i < json.length; i++) {
    const char = json[i];
    if (escapeNext) { escapeNext = false; continue; }
    if (char === '\\' && inString) { escapeNext = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (char === '{' || char === '[') stack.push(char === '{' ? '}' : ']');
    else if (char === '}' || char === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === char) stack.pop();
    }
  }

  const lastCompleteActivity = json.lastIndexOf('},');
  const lastCompleteArray = json.lastIndexOf('],');
  const cutPoint = Math.max(lastCompleteActivity, lastCompleteArray);

  let repaired = json;
  if (cutPoint > json.length * 0.5) {
    repaired = json.substring(0, cutPoint + 1);
  }

  // Remove trailing incomplete content
  repaired = repaired.replace(/,\s*$/, '');
  repaired = repaired.replace(/:\s*$/, ': null');
  repaired = repaired.replace(/"[^"]*$/, '""');

  // Count unclosed brackets
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

  if (inString) repaired += '"';
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
        if (!activity.options) activity.options = [];
        activity.options.forEach((opt: any, i: number) => {
          if (!opt.id) opt.id = `opt-${index}-${i}`;
          opt.correct = opt.correct === true || opt.correct === 'true';
        });
        if (!activity.options.some((opt: any) => opt.correct)) {
          const idx = typeof activity.correctIndex === 'number' ? activity.correctIndex : 0;
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
        if (!activity.questions) activity.questions = [];
        activity.questions.forEach((q: any, qi: number) => {
          if (!q.id) q.id = `q-${Date.now()}-${qi}`;
          if (q.options) {
            q.options.forEach((opt: any, oi: number) => {
              if (!opt.id) opt.id = `opt-${qi}-${oi}`;
              opt.correct = opt.correct === true || opt.correct === 'true';
            });
            if (!q.options.some((opt: any) => opt.correct) && q.options.length > 0) {
              const idx = typeof q.correctIndex === 'number' ? q.correctIndex : 0;
              if (q.options[idx]) q.options[idx].correct = true;
            }
          }
        });
      }

      // Flashcards
      if (activity.type === 'flashcard' && activity.cards) {
        activity.cards = activity.cards.filter((card: any) => {
          const hasFront = card.front?.trim() || card.frontImageQuery?.trim();
          const hasBack = card.back?.trim() || card.backImageQuery?.trim();
          return hasFront && hasBack;
        });
        activity.cards.forEach((card: any, ci: number) => {
          if (!card.id) card.id = `card-${ci}`;
        });
      }

      // Accordions
      if (activity.type === 'accordion' && activity.sections) {
        activity.sections.forEach((s: any, si: number) => {
          if (!s.id) s.id = `acc-sect-${si}`;
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

  if (gameType === 'memory_match' && activity.config.pairs) {
    activity.config.pairs = activity.config.pairs.filter((pair: any) => {
      const hasItem1 = pair.item1?.content?.trim() || pair.item1?.imageQuery?.trim();
      const hasItem2 = pair.item2?.content?.trim() || pair.item2?.imageQuery?.trim();
      return hasItem1 && hasItem2;
    });
    activity.config.pairs.forEach((pair: any, i: number) => {
      if (!pair.id) pair.id = `p${i + 1}`;
    });
  }

  // Neon defender - truncate long answers
  if (gameType === 'neon_defender' && activity.config.questions) {
    activity.config.questions.forEach((q: any, i: number) => {
      if (!q.id) q.id = `nd-q${i + 1}`;
      if (q.answers && Array.isArray(q.answers)) {
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
      }
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
  };

  const qKey = questionKeyMap[gameType];
  if (qKey && activity.config[qKey]) {
    activity.config[qKey].forEach((q: any, i: number) => {
      if (!q.id) q.id = `${gameType.substring(0, 3)}-q${i + 1}`;
      if (q.correctIndex !== undefined) q.correctIndex = Number(q.correctIndex) || 0;
    });
  }
}

function filterMinimumRequirements(activities: any[]): any[] {
  return activities.filter((activity: any) => {
    if (activity.type === 'flashcard' && (!activity.cards || activity.cards.length < 4)) return false;
    if (activity.type === 'accordion' && (!activity.sections || activity.sections.length < 3)) return false;
    if (activity.type === 'quiz' && (!activity.questions || activity.questions.length < 4)) return false;
    if (activity.type === 'gamification') {
      const gt = activity.gameType || 'memory_match';
      const cfg = activity.config || {};
      if (gt === 'memory_match' && (!cfg.pairs || cfg.pairs.length < 4)) return false;
      if (gt === 'neon_defender' && (!cfg.questions || cfg.questions.length < 4)) return false;
      if (gt === 'battleships' && (!cfg.battleshipsQuestions || cfg.battleshipsQuestions.length < 4)) return false;
      if (gt === 'millionaire' && (!cfg.millionaireQuestions || cfg.millionaireQuestions.length < 4)) return false;
      if (gt === 'the_chase' && (!cfg.chaseQuestions || cfg.chaseQuestions.length < 4)) return false;
      if (gt === 'word_search' && (!cfg.wordSearchWords || cfg.wordSearchWords.length < 4)) return false;
      if (gt === 'quiz_uno' && (!cfg.unoQuestions || cfg.unoQuestions.length < 4)) return false;
      if (gt === 'knowledge_tetris' && (!cfg.questions || cfg.questions.length < 4)) return false;
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
        {"id": "act-1", "type": "image", "order": 1, "editorLabel": "Image", "imageQuery": "terms", "geminiPrompt": "detailed prompt", "alt": "Description"}
      ]
    }
  ]
}

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
    case 'gamification':
      specificInstructions = `Create a ${subType || 'memory_match'} game with appropriate content.`;
      break;
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
