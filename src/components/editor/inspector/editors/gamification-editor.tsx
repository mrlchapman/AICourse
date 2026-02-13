'use client';

import { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Gamepad2,
  Rocket,
  Grid3X3,
  Layers,
  Search,
  Ship,
  Trophy,
  Zap,
  GripVertical,
  Check,
  Settings,
  HelpCircle,
  Link2,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GamificationActivity } from '@/types/activities';

interface Props {
  activity: GamificationActivity;
  onUpdate: (updates: Partial<GamificationActivity>) => void;
}

const GAME_TYPES = [
  { value: 'memory_match', label: 'Memory Match', desc: 'Match pairs of related items', icon: Link2, color: 'text-blue-600 bg-blue-100' },
  { value: 'neon_defender', label: 'Space Shooter', desc: 'Answer questions to shoot enemies', icon: Rocket, color: 'text-purple-600 bg-purple-100' },
  { value: 'knowledge_tetris', label: 'Knowledge Tetris', desc: 'Stack correct answers as blocks fall', icon: Layers, color: 'text-cyan-600 bg-cyan-100' },
  { value: 'quiz_uno', label: 'Quiz UNO', desc: 'Card game with quiz questions', icon: Gamepad2, color: 'text-red-600 bg-red-100' },
  { value: 'word_search', label: 'Word Search', desc: 'Find hidden words in a grid', icon: Search, color: 'text-green-600 bg-green-100' },
  { value: 'battleships', label: 'Battleships', desc: 'Sink ships by answering correctly', icon: Ship, color: 'text-slate-600 bg-slate-100' },
  { value: 'millionaire', label: 'Millionaire', desc: 'Progressive difficulty quiz show', icon: Trophy, color: 'text-amber-600 bg-amber-100' },
  { value: 'the_chase', label: 'The Chase', desc: 'Race against a chaser with questions', icon: Zap, color: 'text-orange-600 bg-orange-100' },
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
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showGamePicker, setShowGamePicker] = useState(false);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateConfig = (updates: Record<string, unknown>) => {
    onUpdate({ config: { ...config, ...updates } });
  };

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
    const newId = `gq-${Date.now()}`;
    setQuestions([
      ...getQuestions(),
      {
        id: newId,
        question: '',
        explanation: '',
        answers: ['', '', '', ''],
        correctIndex: 0,
      },
    ]);
    setExpandedItems((prev) => new Set(prev).add(newId));
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

  const isMemoryMatch = gameType === 'memory_match';
  const pairs = config.pairs || [];

  const addPair = () => {
    const newId = `mp-${Date.now()}`;
    updateConfig({
      pairs: [
        ...pairs,
        {
          id: newId,
          item1: { type: 'text', content: '' },
          item2: { type: 'text', content: '' },
          info: '',
        },
      ],
    });
    setExpandedItems((prev) => new Set(prev).add(newId));
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
  const currentGame = GAME_TYPES.find((g) => g.value === gameType) || GAME_TYPES[0];
  const CurrentIcon = currentGame.icon;

  return (
    <div className="space-y-4">
      {/* Game Type Selector */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Game Type</label>
        <button
          onClick={() => setShowGamePicker(!showGamePicker)}
          className="w-full flex items-center gap-3 px-3 py-2.5 border border-border rounded-lg bg-surface hover:bg-surface-hover transition-colors text-left"
        >
          <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center shrink-0', currentGame.color)}>
            <CurrentIcon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{currentGame.label}</p>
            <p className="text-[10px] text-foreground-subtle truncate">{currentGame.desc}</p>
          </div>
          <ChevronDown className={cn('h-4 w-4 text-foreground-subtle shrink-0 transition-transform', showGamePicker && 'rotate-180')} />
        </button>

        {showGamePicker && (
          <div className="mt-1.5 border border-border rounded-lg bg-surface overflow-hidden shadow-md">
            {GAME_TYPES.map((gt) => {
              const Icon = gt.icon;
              const isSelected = gt.value === gameType;
              return (
                <button
                  key={gt.value}
                  onClick={() => {
                    onUpdate({ gameType: gt.value as any });
                    setShowGamePicker(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                    isSelected ? 'bg-primary-light' : 'hover:bg-surface-hover'
                  )}
                >
                  <div className={cn('h-7 w-7 rounded-md flex items-center justify-center shrink-0', gt.color)}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-medium', isSelected ? 'text-primary' : 'text-foreground')}>{gt.label}</p>
                    <p className="text-[10px] text-foreground-subtle truncate">{gt.desc}</p>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Memory Match: pairs */}
      {isMemoryMatch ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Pairs</label>
            <span className="text-[10px] text-foreground-subtle px-1.5 py-0.5 bg-surface-hover rounded-full">{pairs.length}</span>
          </div>

          {pairs.map((pair: any, i: number) => {
            const isOpen = expandedItems.has(pair.id);
            const hasContent = pair.item1?.content || pair.item2?.content;
            return (
              <div key={pair.id} className="border border-border rounded-lg overflow-hidden bg-surface">
                <button
                  onClick={() => toggleExpanded(pair.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-hover transition-colors text-left"
                >
                  <GripVertical className="h-3 w-3 text-foreground-subtle shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-foreground">
                      {hasContent
                        ? `${pair.item1?.content || '...'} — ${pair.item2?.content || '...'}`
                        : `Pair ${i + 1}`}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-3.5 w-3.5 text-foreground-subtle shrink-0" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-foreground-subtle shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 space-y-2 border-t border-border bg-surface-hover/30">
                    <div className="pt-2">
                      <label className="text-[10px] font-medium text-foreground-muted uppercase tracking-wide">Item 1</label>
                      <input
                        type="text"
                        value={pair.item1?.content || ''}
                        onChange={(e) => updatePair(i, { item1: { type: 'text', content: e.target.value } })}
                        placeholder="First item"
                        className="w-full text-xs px-2.5 py-1.5 mt-0.5 border border-border rounded-md bg-surface outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-foreground-muted uppercase tracking-wide">Item 2 (match)</label>
                      <input
                        type="text"
                        value={pair.item2?.content || ''}
                        onChange={(e) => updatePair(i, { item2: { type: 'text', content: e.target.value } })}
                        placeholder="Matching item"
                        className="w-full text-xs px-2.5 py-1.5 mt-0.5 border border-border rounded-md bg-surface outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-foreground-muted uppercase tracking-wide">Explanation</label>
                      <input
                        type="text"
                        value={pair.info || ''}
                        onChange={(e) => updatePair(i, { info: e.target.value })}
                        placeholder="Shown after match (optional)"
                        className="w-full text-xs px-2.5 py-1.5 mt-0.5 border border-border rounded-md bg-surface outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <button
                      onClick={() => removePair(i)}
                      className="flex items-center gap-1 text-[10px] text-danger hover:underline mt-1"
                    >
                      <Trash2 className="h-2.5 w-2.5" /> Remove pair
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={addPair}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-primary font-medium py-2 border border-dashed border-primary/30 rounded-lg hover:bg-primary-light/50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add pair
          </button>
        </div>
      ) : (
        /* Question-based games */
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Questions</label>
            <span className="text-[10px] text-foreground-subtle px-1.5 py-0.5 bg-surface-hover rounded-full">{questions.length}</span>
          </div>

          {questions.map((q, qi) => {
            const isOpen = expandedItems.has(q.id);
            return (
              <div key={q.id} className="border border-border rounded-lg overflow-hidden bg-surface">
                <button
                  onClick={() => toggleExpanded(q.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-hover transition-colors text-left"
                >
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {qi + 1}
                  </span>
                  <span className="flex-1 text-xs font-medium text-foreground truncate min-w-0">
                    {q.question || `Question ${qi + 1}`}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-3.5 w-3.5 text-foreground-subtle shrink-0" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-foreground-subtle shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 space-y-2.5 border-t border-border bg-surface-hover/30">
                    <div className="pt-2">
                      <label className="text-[10px] font-medium text-foreground-muted uppercase tracking-wide">Question</label>
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuestion(qi, { question: e.target.value })}
                        placeholder="Enter question"
                        className="w-full text-xs px-2.5 py-1.5 mt-0.5 border border-border rounded-md bg-surface outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-medium text-foreground-muted uppercase tracking-wide">Answers</label>
                      <div className="space-y-1 mt-0.5">
                        {q.answers.map((ans, ai) => (
                          <div
                            key={ai}
                            className={cn(
                              'flex items-center gap-1.5 px-2 py-1 rounded-md border transition-colors',
                              q.correctIndex === ai
                                ? 'border-success/40 bg-success-light/50'
                                : 'border-border bg-surface'
                            )}
                          >
                            <button
                              onClick={() => updateQuestion(qi, { correctIndex: ai })}
                              className={cn(
                                'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                                q.correctIndex === ai
                                  ? 'border-success bg-success'
                                  : 'border-border-strong hover:border-foreground-subtle'
                              )}
                            >
                              {q.correctIndex === ai && <Check className="h-2.5 w-2.5 text-white" />}
                            </button>
                            <input
                              type="text"
                              value={ans}
                              onChange={(e) => updateAnswer(qi, ai, e.target.value)}
                              placeholder={`Answer ${ai + 1}`}
                              className="flex-1 text-xs py-0.5 bg-transparent outline-none"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-foreground-subtle mt-1">Click the circle to mark the correct answer</p>
                    </div>

                    <div>
                      <label className="text-[10px] font-medium text-foreground-muted uppercase tracking-wide">Explanation</label>
                      <input
                        type="text"
                        value={q.explanation}
                        onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
                        placeholder="Shown after answering (optional)"
                        className="w-full text-xs px-2.5 py-1.5 mt-0.5 border border-border rounded-md bg-surface outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <button
                      onClick={() => removeQuestion(qi)}
                      className="flex items-center gap-1 text-[10px] text-danger hover:underline"
                    >
                      <Trash2 className="h-2.5 w-2.5" /> Remove question
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={addQuestion}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-primary font-medium py-2 border border-dashed border-primary/30 rounded-lg hover:bg-primary-light/50 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Add question
          </button>
        </div>
      )}

      {/* Settings */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Settings className="h-3.5 w-3.5 text-foreground-muted" />
          <label className="text-sm font-medium text-foreground">Settings</label>
        </div>

        <div className="space-y-2 p-3 bg-surface-hover/50 rounded-lg border border-border">
          {gameType === 'neon_defender' && (
            <SettingSelect
              label="Starting Lives"
              value={config.startingLives || 3}
              onChange={(v) => updateConfig({ startingLives: v })}
              options={[
                { value: 3, label: '3 lives' },
                { value: 4, label: '4 lives' },
                { value: 5, label: '5 lives' },
              ]}
            />
          )}

          {gameType === 'word_search' && (
            <SettingSelect
              label="Grid Size"
              value={config.wordSearchGridSize || 10}
              onChange={(v) => updateConfig({ wordSearchGridSize: v })}
              options={[
                { value: 10, label: '10 x 10' },
                { value: 12, label: '12 x 12' },
                { value: 15, label: '15 x 15' },
              ]}
            />
          )}

          {gameType === 'battleships' && (
            <>
              <SettingSelect
                label="Grid Size"
                value={config.gridSize || 8}
                onChange={(v) => updateConfig({ gridSize: v })}
                options={[
                  { value: 6, label: '6 x 6' },
                  { value: 8, label: '8 x 8' },
                  { value: 10, label: '10 x 10' },
                ]}
              />
              <SettingSelect
                label="Ships"
                value={config.shipCount || 4}
                onChange={(v) => updateConfig({ shipCount: v })}
                options={[
                  { value: 3, label: '3 ships' },
                  { value: 4, label: '4 ships' },
                  { value: 5, label: '5 ships' },
                ]}
              />
            </>
          )}

          {gameType === 'millionaire' && (
            <SettingSelect
              label="Timer"
              value={config.timerSeconds || 30}
              onChange={(v) => updateConfig({ timerSeconds: v })}
              options={[
                { value: 15, label: '15 seconds' },
                { value: 30, label: '30 seconds' },
                { value: 45, label: '45 seconds' },
                { value: 60, label: '60 seconds' },
              ]}
            />
          )}

          {gameType === 'the_chase' && (
            <>
              <SettingSelect
                label="Timer"
                value={config.chaseTimerSeconds || 20}
                onChange={(v) => updateConfig({ chaseTimerSeconds: v })}
                options={[
                  { value: 15, label: '15 seconds' },
                  { value: 20, label: '20 seconds' },
                  { value: 30, label: '30 seconds' },
                ]}
              />
              <SettingSelect
                label="Chaser Accuracy"
                value={config.chaserAccuracy || 70}
                onChange={(v) => updateConfig({ chaserAccuracy: v })}
                options={[
                  { value: 60, label: '60%' },
                  { value: 70, label: '70%' },
                  { value: 80, label: '80%' },
                  { value: 90, label: '90%' },
                ]}
              />
            </>
          )}

          {gameType === 'quiz_uno' && (
            <SettingSelect
              label="Starting Cards"
              value={config.startingCards || 5}
              onChange={(v) => updateConfig({ startingCards: v })}
              options={[
                { value: 3, label: '3 cards' },
                { value: 5, label: '5 cards' },
                { value: 7, label: '7 cards' },
              ]}
            />
          )}

          <label className="flex items-center gap-2.5 text-xs cursor-pointer py-1">
            <div
              className={cn(
                'w-8 h-[18px] rounded-full transition-colors relative',
                config.required ? 'bg-primary' : 'bg-border-strong'
              )}
              onClick={() => updateConfig({ required: !config.required })}
            >
              <div
                className={cn(
                  'absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-all',
                  config.required ? 'left-[17px]' : 'left-[2px]'
                )}
              />
            </div>
            <span className="text-foreground">Required to complete</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function SettingSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  options: { value: number; label: string }[];
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-xs text-foreground-muted shrink-0">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="text-xs px-2 py-1 border border-border rounded-md bg-surface outline-none focus:ring-1 focus:ring-primary min-w-[100px]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
