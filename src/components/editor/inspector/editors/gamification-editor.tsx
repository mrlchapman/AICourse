'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { GamificationActivity } from '@/types/activities';

interface Props {
  activity: GamificationActivity;
  onUpdate: (updates: Partial<GamificationActivity>) => void;
}

const GAME_TYPES = [
  { value: 'memory_match', label: 'Memory Match' },
  { value: 'neon_defender', label: 'Space Shooter' },
  { value: 'knowledge_tetris', label: 'Knowledge Tetris' },
  { value: 'quiz_uno', label: 'Quiz UNO' },
  { value: 'word_search', label: 'Word Search' },
  { value: 'battleships', label: 'Battleships' },
  { value: 'millionaire', label: 'Who Wants to Be a Millionaire' },
  { value: 'the_chase', label: 'The Chase' },
] as const;

type QuestionItem = {
  id: string;
  question: string;
  explanation: string;
  answers: string[];
  correctIndex: number;
};

export function GamificationEditor({ activity, onUpdate }: Props) {
  const config = activity.config || {};
  const gameType = activity.gameType;

  const updateConfig = (updates: Record<string, unknown>) => {
    onUpdate({ config: { ...config, ...updates } });
  };

  // Get the question array key based on game type
  const getQuestionsKey = (): string => {
    switch (gameType) {
      case 'quiz_uno': return 'unoQuestions';
      case 'word_search': return 'wordSearchWords';
      case 'battleships': return 'battleshipsQuestions';
      case 'millionaire': return 'millionaireQuestions';
      case 'the_chase': return 'chaseQuestions';
      default: return 'questions';
    }
  };

  const getQuestions = (): QuestionItem[] => {
    const key = getQuestionsKey();
    return (config as any)[key] || [];
  };

  const setQuestions = (questions: QuestionItem[]) => {
    updateConfig({ [getQuestionsKey()]: questions });
  };

  const addQuestion = () => {
    setQuestions([
      ...getQuestions(),
      {
        id: `gq-${Date.now()}`,
        question: '',
        explanation: '',
        answers: ['', '', '', ''],
        correctIndex: 0,
      },
    ]);
  };

  const updateQuestion = (index: number, updates: Partial<QuestionItem>) => {
    const questions = getQuestions().map((q, i) =>
      i === index ? { ...q, ...updates } : q
    );
    setQuestions(questions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(getQuestions().filter((_, i) => i !== index));
  };

  const updateAnswer = (qIndex: number, aIndex: number, text: string) => {
    const q = getQuestions()[qIndex];
    const answers = q.answers.map((a, i) => (i === aIndex ? text : a));
    updateQuestion(qIndex, { answers });
  };

  // Memory match uses pairs instead of questions
  const isMemoryMatch = gameType === 'memory_match';
  const pairs = config.pairs || [];

  const addPair = () => {
    updateConfig({
      pairs: [
        ...pairs,
        {
          id: `mp-${Date.now()}`,
          item1: { type: 'text', content: '' },
          item2: { type: 'text', content: '' },
          info: '',
        },
      ],
    });
  };

  const updatePair = (index: number, updates: Record<string, unknown>) => {
    const newPairs = pairs.map((p: any, i: number) =>
      i === index ? { ...p, ...updates } : p
    );
    updateConfig({ pairs: newPairs });
  };

  const removePair = (index: number) => {
    updateConfig({ pairs: pairs.filter((_: any, i: number) => i !== index) });
  };

  const questions = getQuestions();

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Game Type</label>
        <select
          value={gameType}
          onChange={(e) => onUpdate({ gameType: e.target.value as any })}
          className="w-full text-xs px-2 py-1.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
        >
          {GAME_TYPES.map((gt) => (
            <option key={gt.value} value={gt.value}>{gt.label}</option>
          ))}
        </select>
      </div>

      {/* Memory Match: pairs */}
      {isMemoryMatch ? (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Pairs ({pairs.length})
          </label>
          {pairs.map((pair: any, i: number) => (
            <div key={pair.id} className="p-2 border border-border rounded-md space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground-muted">Pair {i + 1}</span>
                <button onClick={() => removePair(i)} className="p-0.5 text-foreground-subtle hover:text-danger">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <input
                type="text"
                value={pair.item1?.content || ''}
                onChange={(e) => updatePair(i, { item1: { type: 'text', content: e.target.value } })}
                placeholder="Item 1"
                className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="text"
                value={pair.item2?.content || ''}
                onChange={(e) => updatePair(i, { item2: { type: 'text', content: e.target.value } })}
                placeholder="Item 2 (match)"
                className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="text"
                value={pair.info || ''}
                onChange={(e) => updatePair(i, { info: e.target.value })}
                placeholder="Explanation (shown after match)"
                className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ))}
          <button onClick={addPair} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <Plus className="h-3 w-3" /> Add pair
          </button>
        </div>
      ) : (
        /* All other game types: questions */
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Questions ({questions.length})
          </label>
          {questions.map((q, qi) => (
            <div key={q.id} className="p-2 border border-border rounded-md space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground-muted">Q{qi + 1}</span>
                <button onClick={() => removeQuestion(qi)} className="p-0.5 text-foreground-subtle hover:text-danger">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
              <input
                type="text"
                value={q.question}
                onChange={(e) => updateQuestion(qi, { question: e.target.value })}
                placeholder="Question"
                className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="space-y-1">
                {q.answers.map((ans, ai) => (
                  <div key={ai} className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={q.correctIndex === ai}
                      onChange={() => updateQuestion(qi, { correctIndex: ai })}
                      className="shrink-0"
                    />
                    <input
                      type="text"
                      value={ans}
                      onChange={(e) => updateAnswer(qi, ai, e.target.value)}
                      placeholder={`Answer ${ai + 1}`}
                      className="flex-1 text-xs px-2 py-0.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={q.explanation}
                onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
                placeholder="Explanation"
                className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ))}
          <button onClick={addQuestion} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <Plus className="h-3 w-3" /> Add question
          </button>
        </div>
      )}

      {/* Game-specific settings */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">Settings</label>

        {(gameType === 'neon_defender') && (
          <div>
            <label className="text-xs text-foreground-muted">Starting Lives</label>
            <select
              value={config.startingLives || 3}
              onChange={(e) => updateConfig({ startingLives: parseInt(e.target.value) })}
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>
        )}

        {(gameType === 'word_search') && (
          <div>
            <label className="text-xs text-foreground-muted">Grid Size</label>
            <select
              value={config.wordSearchGridSize || 10}
              onChange={(e) => updateConfig({ wordSearchGridSize: parseInt(e.target.value) })}
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={10}>10x10</option>
              <option value={12}>12x12</option>
              <option value={15}>15x15</option>
            </select>
          </div>
        )}

        {(gameType === 'battleships') && (
          <>
            <div>
              <label className="text-xs text-foreground-muted">Grid Size</label>
              <select
                value={config.gridSize || 8}
                onChange={(e) => updateConfig({ gridSize: parseInt(e.target.value) })}
                className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={6}>6x6</option>
                <option value={8}>8x8</option>
                <option value={10}>10x10</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-foreground-muted">Ships</label>
              <select
                value={config.shipCount || 4}
                onChange={(e) => updateConfig({ shipCount: parseInt(e.target.value) })}
                className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>
          </>
        )}

        {(gameType === 'millionaire') && (
          <div>
            <label className="text-xs text-foreground-muted">Timer (seconds)</label>
            <select
              value={config.timerSeconds || 30}
              onChange={(e) => updateConfig({ timerSeconds: parseInt(e.target.value) })}
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={15}>15s</option>
              <option value={30}>30s</option>
              <option value={45}>45s</option>
              <option value={60}>60s</option>
            </select>
          </div>
        )}

        {(gameType === 'the_chase') && (
          <>
            <div>
              <label className="text-xs text-foreground-muted">Timer</label>
              <select
                value={config.chaseTimerSeconds || 20}
                onChange={(e) => updateConfig({ chaseTimerSeconds: parseInt(e.target.value) })}
                className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={15}>15s</option>
                <option value={20}>20s</option>
                <option value={30}>30s</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-foreground-muted">Chaser Accuracy %</label>
              <select
                value={config.chaserAccuracy || 70}
                onChange={(e) => updateConfig({ chaserAccuracy: parseInt(e.target.value) })}
                className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
              >
                <option value={60}>60%</option>
                <option value={70}>70%</option>
                <option value={80}>80%</option>
                <option value={90}>90%</option>
              </select>
            </div>
          </>
        )}

        {(gameType === 'quiz_uno') && (
          <div>
            <label className="text-xs text-foreground-muted">Starting Cards</label>
            <select
              value={config.startingCards || 5}
              onChange={(e) => updateConfig({ startingCards: parseInt(e.target.value) })}
              className="w-full text-xs px-2 py-1 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={7}>7</option>
            </select>
          </div>
        )}

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={config.required ?? false}
            onChange={(e) => updateConfig({ required: e.target.checked })}
          />
          Required
        </label>
      </div>
    </div>
  );
}
