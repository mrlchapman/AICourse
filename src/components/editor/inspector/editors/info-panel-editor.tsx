'use client';

import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Highlighter,
} from 'lucide-react';
import { Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { InfoPanelActivity } from '@/types/activities';

interface Props {
  activity: InfoPanelActivity;
  onUpdate: (updates: Partial<InfoPanelActivity>) => void;
}

const variants = [
  { value: 'info', label: 'Info', color: 'bg-primary-light border-primary text-primary' },
  { value: 'warning', label: 'Warning', color: 'bg-warning-light border-warning text-amber-700' },
  { value: 'success', label: 'Success', color: 'bg-success-light border-success text-green-700' },
  { value: 'error', label: 'Error', color: 'bg-danger-light border-danger text-red-700' },
] as const;

function ToolbarButton({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1 rounded transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-foreground-muted hover:bg-surface-hover hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

export function InfoPanelEditor({ activity, onUpdate }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Underline,
      Highlight,
    ],
    content: activity.content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onUpdate({ content: editor.getHTML() });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[80px] px-3 py-2 outline-none text-foreground text-sm',
      },
    },
  });

  // Sync editor content when switching between activities of the same type
  useEffect(() => {
    if (editor && activity.content !== editor.getHTML()) {
      editor.commands.setContent(activity.content || '');
    }
  }, [activity.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const iconSize = 'h-3.5 w-3.5';

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Variant</label>
        <div className="grid grid-cols-2 gap-1.5">
          {variants.map((v) => (
            <button
              key={v.value}
              onClick={() => onUpdate({ variant: v.value })}
              className={cn(
                'px-2 py-1.5 text-xs font-medium rounded-md border transition-colors',
                activity.variant === v.value ? v.color : 'bg-surface border-border text-foreground-muted'
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
      <Input
        label="Title"
        value={activity.title}
        onChange={(e) => onUpdate({ title: e.target.value })}
      />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-foreground">Content</label>
        <div className="border border-border rounded-lg overflow-hidden bg-surface">
          {editor && (
            <div className="flex flex-wrap gap-0.5 p-1 border-b border-border bg-surface-hover/50">
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                active={editor.isActive('bold')}
                title="Bold"
              >
                <Bold className={iconSize} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                active={editor.isActive('italic')}
                title="Italic"
              >
                <Italic className={iconSize} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                active={editor.isActive('underline')}
                title="Underline"
              >
                <UnderlineIcon className={iconSize} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                active={editor.isActive('highlight')}
                title="Highlight"
              >
                <Highlighter className={iconSize} />
              </ToolbarButton>

              <div className="w-px h-5 bg-border mx-0.5 self-center" />

              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                active={editor.isActive('bulletList')}
                title="Bullet List"
              >
                <List className={iconSize} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                active={editor.isActive('orderedList')}
                title="Numbered List"
              >
                <ListOrdered className={iconSize} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                active={editor.isActive('blockquote')}
                title="Blockquote"
              >
                <Quote className={iconSize} />
              </ToolbarButton>
            </div>
          )}
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
