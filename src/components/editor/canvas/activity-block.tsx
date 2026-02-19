'use client';

import {
  Type,
  Image as ImageIcon,
  HelpCircle,
  Youtube,
  Trophy,
  Info,
  ChevronDown,
  Layout,
  Clock,
  Minus,
  Code,
  ArrowRight,
  MousePointer,
  Headphones,
  Grid3X3,
  FileText,
  Globe,
  Box,
  Gamepad2,
  Layers,
  Link2,
  ListOrdered,
  Target,
  GitBranch,
  Monitor,
  BarChart,
  PencilLine,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getActivityDisplayInfo, type Activity } from '@/types/activities';
import DOMPurify from 'isomorphic-dompurify';

interface ActivityBlockProps {
  activity: Activity;
  isSelected: boolean;
  onClick: () => void;
}

export function ActivityBlock({ activity, isSelected, onClick }: ActivityBlockProps) {
  const { icon, label } = getActivityDisplayInfo(activity);

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative bg-surface rounded-lg border transition-all cursor-pointer',
        isSelected
          ? 'border-primary ring-2 ring-primary/20 shadow-md'
          : 'border-border hover:border-primary/30 hover:shadow-sm'
      )}
    >
      {/* Block Content Preview */}
      <div className="p-4">
        <ActivityPreview activity={activity} />
      </div>

      {/* Block Type Label */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-xs bg-surface-hover text-foreground-muted px-2 py-0.5 rounded-full border border-border">
          {icon} {label}
        </span>
      </div>
    </div>
  );
}

function ActivityPreview({ activity }: { activity: Activity }) {
  switch (activity.type) {
    case 'text_content':
      return (
        <div className="prose prose-sm max-w-none text-foreground">
          <div
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activity.content || '<p class="text-foreground-subtle italic">Empty text block</p>') }}
          />
        </div>
      );

    case 'image':
      return (
        <div className="flex flex-col items-center gap-2">
          {activity.src ? (
            <img src={activity.src} alt={activity.alt} className="max-h-48 rounded-md object-contain" />
          ) : (
            <div className="w-full h-32 bg-surface-hover rounded-md flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-foreground-subtle" />
            </div>
          )}
          {activity.caption && (
            <p className="text-xs text-foreground-muted text-center">{activity.caption}</p>
          )}
        </div>
      );

    case 'knowledge_check':
      return (
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
              <HelpCircle className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground mt-1">{activity.question}</p>
          </div>
          <div className="ml-10 space-y-1.5">
            {(activity.options || []).map((opt, i) => (
              <div
                key={opt.id || `opt-${i}`}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-md border',
                  opt.correct
                    ? 'border-success/30 bg-success-light text-green-800 font-medium'
                    : 'border-border bg-surface-hover text-foreground-muted'
                )}
              >
                {opt.text}
              </div>
            ))}
          </div>
        </div>
      );

    case 'youtube':
      return (
        <div className="space-y-2">
          {activity.videoId ? (
            <div className="relative aspect-video bg-black rounded-md overflow-hidden">
              <img
                src={`https://img.youtube.com/vi/${activity.videoId}/mqdefault.jpg`}
                alt="Video thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
                  <div className="ml-1 w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent" />
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-surface-hover rounded-md flex items-center justify-center">
              <Youtube className="h-8 w-8 text-foreground-subtle" />
            </div>
          )}
          {activity.caption && (
            <p className="text-xs text-foreground-muted">{activity.caption}</p>
          )}
        </div>
      );

    case 'quiz': {
      const questions = activity.questions || [];
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">{activity.title}</span>
              <div className="flex items-center gap-2 text-[10px] text-foreground-subtle">
                <span>{questions.length} questions</span>
                <span>&middot;</span>
                <span>{activity.passingScore}% to pass</span>
                {activity.timeLimit > 0 && (
                  <>
                    <span>&middot;</span>
                    <span>{Math.floor(activity.timeLimit / 60)}m limit</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {questions.length > 0 && (
            <div className="space-y-1.5">
              {questions.slice(0, 2).map((q, i) => (
                <div key={q.id || `q-${i}`} className="flex items-start gap-2 px-2 py-1.5 bg-surface-hover rounded-md">
                  <span className="text-[10px] font-bold text-foreground-subtle mt-0.5 shrink-0">Q{i + 1}</span>
                  <span className="text-xs text-foreground line-clamp-1">{q.text}</span>
                </div>
              ))}
              {questions.length > 2 && (
                <p className="text-[10px] text-foreground-subtle text-center">+{questions.length - 2} more questions</p>
              )}
            </div>
          )}
        </div>
      );
    }

    case 'info_panel': {
      const variantConfig = {
        info:    { bg: 'bg-primary-light', border: 'border-primary', iconBg: 'bg-primary/15', iconColor: 'text-primary', textColor: 'text-blue-900' },
        warning: { bg: 'bg-warning-light', border: 'border-warning', iconBg: 'bg-warning/15', iconColor: 'text-warning', textColor: 'text-amber-900' },
        success: { bg: 'bg-success-light', border: 'border-success', iconBg: 'bg-success/15', iconColor: 'text-success', textColor: 'text-green-900' },
        error:   { bg: 'bg-danger-light', border: 'border-danger', iconBg: 'bg-danger/15', iconColor: 'text-danger', textColor: 'text-red-900' },
      };
      const v = variantConfig[activity.variant] || variantConfig.info;
      return (
        <div className={cn('rounded-lg border-l-4 overflow-hidden', v.border, v.bg)}>
          <div className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn('h-7 w-7 rounded-md flex items-center justify-center shrink-0', v.iconBg)}>
                <Info className={cn('h-4 w-4', v.iconColor)} />
              </div>
              <p className={cn('text-sm font-semibold', v.textColor)}>{activity.title}</p>
            </div>
            {activity.content && (
              <div
                className={cn('prose max-w-none text-xs ml-9 opacity-85', v.textColor)}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(activity.content) }}
              />
            )}
          </div>
        </div>
      );
    }

    case 'accordion': {
      const sections = activity.sections || [];
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-surface-hover flex items-center justify-center">
              <ChevronDown className="h-4 w-4 text-foreground-muted" />
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">Accordion</span>
              <p className="text-[10px] text-foreground-subtle">{sections.length} sections</p>
            </div>
          </div>
          <div className="space-y-1">
            {sections.slice(0, 4).map((sec, i) => (
              <div key={sec.id || `sec-${i}`} className="flex items-center gap-2 px-3 py-2 bg-surface-hover rounded-md border border-border/50">
                <ChevronDown className="h-3.5 w-3.5 text-foreground-subtle shrink-0" />
                <span className="text-xs font-medium text-foreground truncate">{sec.title}</span>
              </div>
            ))}
            {sections.length > 4 && (
              <p className="text-[10px] text-foreground-subtle text-center">
                +{sections.length - 4} more
              </p>
            )}
          </div>
        </div>
      );
    }

    case 'tabs': {
      const tabs = activity.tabs || [];
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-surface-hover flex items-center justify-center">
              <Layout className="h-4 w-4 text-foreground-muted" />
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">Tabs</span>
              <p className="text-[10px] text-foreground-subtle">{tabs.length} tabs</p>
            </div>
          </div>
          <div className="rounded-md border border-border overflow-hidden">
            <div className="flex bg-surface-hover/50">
              {tabs.map((tab, i) => (
                <div
                  key={tab.id || `tab-${i}`}
                  className={cn(
                    'px-3 py-1.5 text-xs border-b-2',
                    i === 0
                      ? 'border-primary text-primary font-medium bg-surface'
                      : 'border-transparent text-foreground-muted'
                  )}
                >
                  {tab.title}
                </div>
              ))}
            </div>
            <p className="text-xs text-foreground-muted p-2 line-clamp-2">
              {tabs[0]?.content || 'Tab content'}
            </p>
          </div>
        </div>
      );
    }

    case 'flashcard': {
      const cards = activity.cards || [];
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Flashcards</span>
            <span className="text-xs text-foreground-subtle ml-auto">{cards.length} cards</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {cards.slice(0, 4).map((card, i) => (
              <div
                key={card.id || `card-${i}`}
                className="shrink-0 w-28 h-20 bg-primary-light border border-primary/20 rounded-lg flex flex-col items-center justify-center p-2 text-center"
              >
                <span className="text-xs font-medium text-primary line-clamp-2">{card.front}</span>
                <div className="w-8 border-t border-primary/20 my-1" />
                <span className="text-[10px] text-primary/60 line-clamp-1">{card.back}</span>
              </div>
            ))}
            {cards.length > 4 && (
              <div className="shrink-0 w-28 h-20 bg-surface-hover border border-border rounded-lg flex items-center justify-center">
                <span className="text-xs text-foreground-subtle">+{cards.length - 4} more</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'divider':
      return (
        <div className="py-2">
          {activity.style === 'space' ? (
            <div className="h-4" />
          ) : (
            <div
              className={cn(
                'border-t',
                activity.style === 'dashed' && 'border-dashed',
                activity.style === 'dotted' && 'border-dotted',
                'border-border'
              )}
            />
          )}
          {activity.label && (
            <p className="text-xs text-foreground-subtle text-center mt-1">{activity.label}</p>
          )}
        </div>
      );

    case 'code_snippet':
      return (
        <div className="bg-slate-900 text-slate-100 rounded-md p-3 font-mono text-xs overflow-hidden">
          {activity.title && (
            <p className="text-slate-400 mb-1">{activity.title}</p>
          )}
          <pre className="line-clamp-4 whitespace-pre-wrap">{activity.code}</pre>
        </div>
      );

    case 'timeline': {
      const events = activity.events || [];
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-light flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">{activity.title || 'Timeline'}</span>
              <p className="text-[10px] text-foreground-subtle">{events.length} events</p>
            </div>
          </div>
          {events.length > 0 && (
            <div className="space-y-2 pl-4 border-l-2 border-primary/30">
              {events.slice(0, 3).map((evt, i) => (
                <div key={evt.id || `evt-${i}`} className="relative">
                  <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-primary-light" />
                  <p className="text-xs font-medium text-foreground">{evt.title}</p>
                  {evt.date && <p className="text-[10px] text-foreground-subtle">{evt.date}</p>}
                </div>
              ))}
              {events.length > 3 && (
                <p className="text-[10px] text-foreground-subtle">+{events.length - 3} more</p>
              )}
            </div>
          )}
        </div>
      );
    }

    case 'process': {
      const steps = activity.steps || [];
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-light flex items-center justify-center">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">Process</span>
              <p className="text-[10px] text-foreground-subtle">{steps.length} steps</p>
            </div>
          </div>
          {steps.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {steps.map((step, i) => (
                <div key={step.id || `step-${i}`} className="flex items-center gap-1 shrink-0">
                  <div className="px-3 py-1.5 bg-primary-light text-primary rounded-lg flex items-center gap-1.5 text-xs font-medium border border-primary/15">
                    <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[9px] font-bold shrink-0">
                      {i + 1}
                    </span>
                    {step.title}
                  </div>
                  {i < steps.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-foreground-subtle shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    case 'matching': {
      const pairs = activity.pairs || [];
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-light flex items-center justify-center">
              <Link2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">{activity.title}</span>
              <p className="text-[10px] text-foreground-subtle">{pairs.length} pairs to match</p>
            </div>
          </div>
          {pairs.length > 0 && (
            <div className="space-y-1.5">
              {pairs.slice(0, 3).map((pair, i) => (
                <div key={pair.id || `pair-${i}`} className="flex items-center gap-2 text-xs">
                  <span className="flex-1 px-2 py-1.5 bg-primary-light text-primary rounded-md text-center truncate">{pair.left}</span>
                  <ArrowRight className="h-3 w-3 text-foreground-subtle shrink-0" />
                  <span className="flex-1 px-2 py-1.5 bg-surface-hover text-foreground-muted rounded-md text-center truncate">{pair.right}</span>
                </div>
              ))}
              {pairs.length > 3 && (
                <p className="text-[10px] text-foreground-subtle text-center">+{pairs.length - 3} more</p>
              )}
            </div>
          )}
        </div>
      );
    }

    case 'sequence': {
      const items = activity.items || [];
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-light flex items-center justify-center">
              <ListOrdered className="h-4 w-4 text-primary" />
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">{activity.title}</span>
              <p className="text-[10px] text-foreground-subtle">{items.length} items to order</p>
            </div>
          </div>
          {items.length > 0 && (
            <div className="space-y-1.5">
              {items.slice(0, 4).map((item, i) => (
                <div key={item.id || `item-${i}`} className="flex items-center gap-2 text-xs px-2 py-1.5 bg-surface-hover rounded-md">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-foreground truncate">{item.text}</span>
                </div>
              ))}
              {items.length > 4 && (
                <p className="text-[10px] text-foreground-subtle text-center">+{items.length - 4} more</p>
              )}
            </div>
          )}
        </div>
      );
    }

    case 'gamification': {
      const gameLabel = activity.gameType?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Game';
      const pairCount = activity.config?.pairs?.length || 0;
      const questionCount = activity.config?.questions?.length || 0;
      const itemCount = pairCount || questionCount;
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Gamepad2 className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">{gameLabel}</span>
              <p className="text-[10px] text-foreground-subtle">
                {itemCount > 0
                  ? `${itemCount} ${pairCount ? 'pairs' : 'questions'}`
                  : 'Configure game content'}
              </p>
            </div>
          </div>
          {itemCount > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {(activity.config?.pairs || []).slice(0, 3).map((pair, i) => (
                <span key={pair.id || `p-${i}`} className="text-[10px] px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                  {pair.item1?.content?.substring(0, 15) || `Pair ${i + 1}`}
                </span>
              ))}
              {(activity.config?.questions || []).slice(0, 3).map((q, i) => (
                <span key={q.id || `q-${i}`} className="text-[10px] px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full line-clamp-1">
                  {q.question?.substring(0, 20) || `Q${i + 1}`}
                </span>
              ))}
              {itemCount > 3 && (
                <span className="text-[10px] px-2 py-1 bg-surface-hover text-foreground-subtle rounded-full">+{itemCount - 3}</span>
              )}
            </div>
          )}
        </div>
      );
    }

    case 'discussion':
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-foreground">{(activity as any).title || 'Discussion'}</span>
          </div>
          {(activity as any).prompt && (
            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-800 line-clamp-3 italic">
                &ldquo;{(activity as any).prompt}&rdquo;
              </p>
            </div>
          )}
        </div>
      );

    // Default fallback for other types
    default: {
      const { icon: actIcon, label: actLabel } = getActivityDisplayInfo(activity);
      return (
        <div className="flex items-center gap-3 py-2">
          <span className="text-2xl">{actIcon}</span>
          <div>
            <p className="text-sm font-medium text-foreground">{actLabel}</p>
            <p className="text-xs text-foreground-muted">Click to configure</p>
          </div>
        </div>
      );
    }
  }
}
