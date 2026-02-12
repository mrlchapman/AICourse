'use client';

import { Input } from '@/components/ui';
import type { CodeSnippetActivity } from '@/types/activities';

interface Props {
  activity: CodeSnippetActivity;
  onUpdate: (updates: Partial<CodeSnippetActivity>) => void;
}

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp',
  'html', 'css', 'sql', 'bash', 'ruby', 'go', 'rust', 'php', 'swift',
];

export function CodeSnippetEditor({ activity, onUpdate }: Props) {
  return (
    <div className="space-y-3">
      <Input
        label="Title"
        value={activity.title || ''}
        onChange={(e) => onUpdate({ title: e.target.value })}
        placeholder="Optional title"
      />

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Language</label>
        <select
          value={activity.language}
          onChange={(e) => onUpdate({ language: e.target.value })}
          className="w-full text-xs px-2 py-1.5 border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Code</label>
        <textarea
          value={activity.code}
          onChange={(e) => onUpdate({ code: e.target.value })}
          placeholder="Paste your code here..."
          rows={12}
          className="w-full text-xs px-2 py-1.5 font-mono border border-border rounded bg-surface outline-none focus:ring-1 focus:ring-primary resize-y"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
