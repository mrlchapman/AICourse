'use client';

import { useState } from 'react';
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Edit3,
  Check,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { CourseOutline, SectionOutline, AIQuestionAnswer } from '@/types/activities';

interface OutlineReviewStepProps {
  outline: CourseOutline;
  onOutlineChange: (outline: CourseOutline) => void;
  userAnswers: AIQuestionAnswer[];
  onUserAnswersChange: (answers: AIQuestionAnswer[]) => void;
}

export function OutlineReviewStep({
  outline,
  onOutlineChange,
  userAnswers,
  onUserAnswersChange,
}: OutlineReviewStepProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(outline.sections.map((s) => s.id))
  );
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateSection = (sectionId: string, updates: Partial<SectionOutline>) => {
    onOutlineChange({
      ...outline,
      sections: outline.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    });
  };

  const deleteSection = (sectionId: string) => {
    onOutlineChange({
      ...outline,
      sections: outline.sections.filter((s) => s.id !== sectionId),
    });
  };

  const addSection = () => {
    const newSection: SectionOutline = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      topics: ['Topic 1'],
      estimatedActivities: 5,
      suggestedActivityTypes: ['text_content', 'knowledge_check'] as any[],
    };
    onOutlineChange({
      ...outline,
      sections: [...outline.sections, newSection],
    });
    setEditingSectionId(newSection.id);
  };

  const updateTopic = (sectionId: string, topicIndex: number, value: string) => {
    const section = outline.sections.find((s) => s.id === sectionId);
    if (!section) return;
    const topics = [...section.topics];
    topics[topicIndex] = value;
    updateSection(sectionId, { topics });
  };

  const addTopic = (sectionId: string) => {
    const section = outline.sections.find((s) => s.id === sectionId);
    if (!section) return;
    updateSection(sectionId, { topics: [...section.topics, ''] });
  };

  const deleteTopic = (sectionId: string, topicIndex: number) => {
    const section = outline.sections.find((s) => s.id === sectionId);
    if (!section) return;
    updateSection(sectionId, {
      topics: section.topics.filter((_, i) => i !== topicIndex),
    });
  };

  const answerQuestion = (questionId: string, answer: string) => {
    const existing = userAnswers.filter((a) => a.questionId !== questionId);
    onUserAnswersChange([...existing, { questionId, answer }]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-1">Review Course Outline</h2>
        <p className="text-sm text-foreground-muted">
          The AI has created an outline for your course. Review and edit the structure before generating full content.
        </p>
      </div>

      {/* Course Title & Description */}
      <div className="p-4 rounded-lg border border-border bg-white">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground">{outline.title}</h3>
          <span className="text-xs text-foreground-subtle bg-surface-hover px-2 py-0.5 rounded-full">
            {outline.sections.length} sections
          </span>
        </div>
        <p className="text-sm text-foreground-muted">{outline.description}</p>
      </div>

      {/* AI Questions */}
      {outline.suggestedQuestions && outline.suggestedQuestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">AI has some questions</h3>
          </div>
          {outline.suggestedQuestions.map((q) => {
            const currentAnswer = userAnswers.find((a) => a.questionId === q.id)?.answer;
            return (
              <div
                key={q.id}
                className="p-4 rounded-lg border border-primary/20 bg-primary/5"
              >
                <p className="text-sm font-medium text-foreground mb-1">{q.question}</p>
                {q.context && (
                  <p className="text-xs text-foreground-muted mb-3">{q.context}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {(q.options || []).map((option, i) => (
                    <button
                      key={i}
                      onClick={() => answerQuestion(q.id, option)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                        currentAnswer === option
                          ? 'bg-primary text-white'
                          : 'bg-white border border-border text-foreground hover:border-primary hover:text-primary'
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sections */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Sections</h3>
        {outline.sections.map((section, index) => {
          const isExpanded = expandedSections.has(section.id);
          const isEditing = editingSectionId === section.id;

          return (
            <div
              key={section.id}
              className="rounded-lg border border-border bg-white overflow-hidden"
            >
              {/* Section Header */}
              <div
                className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-surface-hover transition-colors"
                onClick={() => toggleExpand(section.id)}
              >
                <GripVertical className="h-4 w-4 text-foreground-subtle shrink-0" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpand(section.id);
                  }}
                  className="shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-foreground-muted" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-foreground-muted" />
                  )}
                </button>

                <span className="text-xs font-medium text-foreground-subtle bg-surface-hover px-1.5 py-0.5 rounded shrink-0">
                  {index + 1}
                </span>

                {isEditing ? (
                  <input
                    autoFocus
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    onBlur={() => setEditingSectionId(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setEditingSectionId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 text-sm font-medium bg-surface border border-border rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <span className="flex-1 text-sm font-medium text-foreground truncate">
                    {section.title}
                  </span>
                )}

                <span className="text-xs text-foreground-subtle shrink-0">
                  ~{section.estimatedActivities} activities
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSectionId(section.id);
                  }}
                  className="p-1 rounded hover:bg-surface-active transition-colors shrink-0"
                >
                  <Edit3 className="h-3.5 w-3.5 text-foreground-muted" />
                </button>

                {outline.sections.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSection(section.id);
                    }}
                    className="p-1 rounded hover:bg-red-50 hover:text-red-600 transition-colors shrink-0"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Section Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-border/50">
                  <div className="ml-10 space-y-3">
                    {/* Topics */}
                    <div>
                      <label className="text-xs font-medium text-foreground-muted mb-1 block">
                        Topics to cover:
                      </label>
                      <div className="space-y-1.5">
                        {section.topics.map((topic, ti) => (
                          <div key={ti} className="flex items-center gap-2">
                            <span className="text-xs text-foreground-subtle">•</span>
                            <input
                              value={topic}
                              onChange={(e) => updateTopic(section.id, ti, e.target.value)}
                              className="flex-1 text-sm bg-transparent border-b border-transparent focus:border-primary focus:outline-none py-0.5 text-foreground"
                            />
                            {section.topics.length > 1 && (
                              <button
                                onClick={() => deleteTopic(section.id, ti)}
                                className="p-0.5 rounded hover:bg-red-50 text-foreground-subtle hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => addTopic(section.id)}
                        className="mt-1.5 flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                        Add topic
                      </button>
                    </div>

                    {/* Activity Types */}
                    <div>
                      <label className="text-xs font-medium text-foreground-muted mb-1 block">
                        Suggested activity types:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {section.suggestedActivityTypes.map((type, i) => (
                          <span
                            key={i}
                            className="text-xs bg-surface-hover text-foreground-muted px-2 py-0.5 rounded-full"
                          >
                            {type.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Add Section */}
        <button
          onClick={addSection}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-border text-sm text-foreground-muted hover:border-primary hover:text-primary transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Section
        </button>
      </div>
    </div>
  );
}
