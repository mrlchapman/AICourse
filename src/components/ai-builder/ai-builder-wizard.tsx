'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  FileText,
  Upload,
  Zap,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { InputStep } from './steps/input-step';
import { OutlineReviewStep } from './steps/outline-review-step';
import { GenerationStep } from './steps/generation-step';
import type { CourseOutline, CourseContent, AIQuestionAnswer } from '@/types/activities';

type WizardStep = 'input' | 'outline' | 'generating';
type BuildMode = 'quick' | 'progressive';

interface AIBuilderWizardProps {
  onComplete: (content: CourseContent) => void | Promise<void>;
  onCancel: () => void;
}

export function AIBuilderWizard({ onComplete, onCancel }: AIBuilderWizardProps) {
  const [step, setStep] = useState<WizardStep>('input');
  const [buildMode, setBuildMode] = useState<BuildMode>('progressive');
  const [title, setTitle] = useState('');
  const [sourceText, setSourceText] = useState('');
  const [model, setModel] = useState('gemini-2.5-flash');
  const [apiKey, setApiKey] = useState('');
  const [outline, setOutline] = useState<CourseOutline | null>(null);
  const [userAnswers, setUserAnswers] = useState<AIQuestionAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = sourceText.trim() && title.trim();

  const handleGenerateOutline = useCallback(async () => {
    if (!canGenerate) {
      setError('Please fill in the course title and source content.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_outline',
          text: sourceText,
          title,
          model,
          apiKey: apiKey || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate outline');

      setOutline(data.outline);
      setStep('outline');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [canGenerate, sourceText, title, apiKey, model]);

  const handleQuickBuild = useCallback(async () => {
    if (!canGenerate) {
      setError('Please fill in the course title and source content.');
      return;
    }

    setBuildMode('quick');
    setStep('generating');
  }, [canGenerate, sourceText, title, apiKey]);

  const handleStartProgressive = useCallback(() => {
    setBuildMode('progressive');
    setStep('generating');
  }, []);

  const handleGenerationComplete = useCallback(
    (content: CourseContent) => {
      onComplete(content);
    },
    [onComplete]
  );

  const stepInfo = {
    input: { number: 1, label: 'Content Input', icon: FileText },
    outline: { number: 2, label: 'Review Outline', icon: Layers },
    generating: { number: 3, label: 'Generate Course', icon: Sparkles },
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="border-b border-border bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-foreground-muted" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">AI Course Builder</h1>
              <p className="text-sm text-foreground-muted">Create a course with AI assistance</p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2">
            {(['input', 'outline', 'generating'] as WizardStep[]).map((s, i) => {
              const info = stepInfo[s];
              const isActive = s === step;
              const isPast =
                (step === 'outline' && s === 'input') ||
                (step === 'generating' && (s === 'input' || s === 'outline'));

              return (
                <div key={s} className="flex items-center gap-2">
                  {i > 0 && (
                    <div
                      className={`w-8 h-0.5 ${isPast ? 'bg-primary' : 'bg-border'}`}
                    />
                  )}
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : isPast
                          ? 'bg-primary/10 text-primary'
                          : 'bg-surface-hover text-foreground-muted'
                    }`}
                  >
                    <info.icon className="h-3.5 w-3.5" />
                    {info.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <InputStep
                title={title}
                onTitleChange={setTitle}
                sourceText={sourceText}
                onSourceTextChange={setSourceText}
                model={model}
                onModelChange={setModel}
                apiKey={apiKey}
                onApiKeyChange={setApiKey}
              />

              <div className="mt-8 flex items-center gap-4">
                <Button
                  onClick={handleGenerateOutline}
                  loading={isLoading}
                  disabled={!canGenerate}
                  className="flex-1"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Review Outline First (Recommended)
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleQuickBuild}
                  disabled={!canGenerate || isLoading}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Quick Build
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'outline' && outline && (
            <motion.div
              key="outline"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <OutlineReviewStep
                outline={outline}
                onOutlineChange={setOutline}
                userAnswers={userAnswers}
                onUserAnswersChange={setUserAnswers}
              />

              <div className="mt-8 flex items-center gap-4">
                <Button variant="secondary" onClick={() => setStep('input')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleStartProgressive} className="flex-1">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Course
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <GenerationStep
                mode={buildMode}
                title={title}
                sourceText={sourceText}
                model={model}
                apiKey={apiKey}
                outline={outline}
                userAnswers={userAnswers}
                onComplete={handleGenerationComplete}
                onError={(err) => {
                  setError(err);
                  setStep(outline ? 'outline' : 'input');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
