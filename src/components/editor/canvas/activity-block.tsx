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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getActivityDisplayInfo, type Activity } from '@/types/activities';

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
            dangerouslySetInnerHTML={{ __html: activity.content || '<p class="text-foreground-subtle italic">Empty text block</p>' }}
            className="line-clamp-4"
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
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-foreground">{activity.question}</p>
          </div>
          <div className="ml-7 space-y-1">
            {(activity.options || []).map((opt, i) => (
              <div
                key={opt.id || `opt-${i}`}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-md border',
                  opt.correct
                    ? 'border-success/30 bg-success-light text-green-800'
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

    case 'quiz':
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium text-foreground">{activity.title}</span>
          </div>
          <p className="text-xs text-foreground-muted ml-7">
            {(activity.questions || []).length} questions &middot; {activity.passingScore}% to pass
            {activity.timeLimit > 0 && ` \u00b7 ${Math.floor(activity.timeLimit / 60)}m limit`}
          </p>
        </div>
      );

    case 'info_panel':
      return (
        <div
          className={cn(
            'p-3 rounded-md border-l-4',
            activity.variant === 'info' && 'bg-primary-light border-primary',
            activity.variant === 'warning' && 'bg-warning-light border-warning',
            activity.variant === 'success' && 'bg-success-light border-success',
            activity.variant === 'error' && 'bg-danger-light border-danger'
          )}
        >
          <p className="text-sm font-medium">{activity.title}</p>
          <p className="text-xs mt-1 opacity-80 line-clamp-2">{activity.content}</p>
        </div>
      );

    case 'accordion':
      return (
        <div className="space-y-1">
          {(activity.sections || []).slice(0, 3).map((sec, i) => (
            <div key={sec.id || `sec-${i}`} className="flex items-center gap-2 px-3 py-2 bg-surface-hover rounded-md">
              <ChevronDown className="h-3.5 w-3.5 text-foreground-subtle" />
              <span className="text-xs text-foreground">{sec.title}</span>
            </div>
          ))}
          {(activity.sections || []).length > 3 && (
            <p className="text-xs text-foreground-subtle text-center">
              +{activity.sections.length - 3} more
            </p>
          )}
        </div>
      );

    case 'tabs':
      return (
        <div>
          <div className="flex border-b border-border">
            {(activity.tabs || []).map((tab, i) => (
              <div
                key={tab.id || `tab-${i}`}
                className={cn(
                  'px-3 py-1.5 text-xs',
                  i === 0
                    ? 'border-b-2 border-primary text-primary font-medium'
                    : 'text-foreground-muted'
                )}
              >
                {tab.title}
              </div>
            ))}
          </div>
          <p className="text-xs text-foreground-muted p-2 line-clamp-2">
            {(activity.tabs || [])[0]?.content || 'Tab content'}
          </p>
        </div>
      );

    case 'flashcard':
      return (
        <div className="flex items-center gap-2">
          <div className="h-16 w-24 bg-primary-light rounded-md flex items-center justify-center">
            <span className="text-xs text-primary font-medium text-center px-1 line-clamp-2">
              {(activity.cards || [])[0]?.front || 'Front'}
            </span>
          </div>
          <span className="text-foreground-subtle text-xs">{(activity.cards || []).length} cards</span>
        </div>
      );

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

    case 'timeline':
      return (
        <div className="space-y-2 pl-4 border-l-2 border-primary/30">
          {(activity.events || []).slice(0, 3).map((evt, i) => (
            <div key={evt.id || `evt-${i}`} className="relative">
              <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
              <p className="text-xs font-medium text-foreground">{evt.title}</p>
              {evt.date && <p className="text-xs text-foreground-subtle">{evt.date}</p>}
            </div>
          ))}
          {(activity.events || []).length > 3 && (
            <p className="text-xs text-foreground-subtle">+{activity.events.length - 3} more</p>
          )}
        </div>
      );

    case 'process':
      return (
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {(activity.steps || []).map((step, i) => (
            <div key={step.id || `step-${i}`} className="flex items-center gap-1 shrink-0">
              <div className="h-8 px-2 bg-primary-light text-primary rounded-md flex items-center text-xs font-medium">
                {step.title}
              </div>
              {i < (activity.steps || []).length - 1 && (
                <ArrowRight className="h-3 w-3 text-foreground-subtle shrink-0" />
              )}
            </div>
          ))}
        </div>
      );

    case 'matching':
      return (
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground">{activity.title}</p>
          {(activity.pairs || []).slice(0, 3).map((pair, i) => (
            <div key={pair.id || `pair-${i}`} className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 bg-primary-light text-primary rounded">{pair.left}</span>
              <Link2 className="h-3 w-3 text-foreground-subtle" />
              <span className="px-2 py-1 bg-surface-hover rounded">{pair.right}</span>
            </div>
          ))}
        </div>
      );

    case 'sequence':
      return (
        <div className="space-y-1">
          <p className="text-xs font-medium text-foreground">{activity.title}</p>
          {(activity.items || []).slice(0, 3).map((item, i) => (
            <div key={item.id || `item-${i}`} className="flex items-center gap-2 text-xs">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                {i + 1}
              </span>
              <span className="text-foreground">{item.text}</span>
            </div>
          ))}
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
