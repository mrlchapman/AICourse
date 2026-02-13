'use client';

import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Highlighter,
  Undo,
  Redo,
  Minus,
} from 'lucide-react';
import type { TextContentActivity } from '@/types/activities';

interface Props {
  activity: TextContentActivity;
  onUpdate: (updates: Partial<TextContentActivity>) => void;
}

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

export function TextContentEditor({ activity, onUpdate }: Props) {
  // Force re-render on selection/transaction changes so toolbar active states update
  const [, setTick] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight,
    ],
    content: activity.content || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onUpdate({ content: editor.getHTML() });
    },
    onSelectionUpdate: () => {
      setTick((t) => t + 1);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[120px] px-3 py-2 outline-none text-foreground text-sm',
      },
    },
  });

  // Sync editor content when switching between activities of the same type
  useEffect(() => {
    if (editor && activity.content !== editor.getHTML()) {
      editor.commands.setContent(activity.content || '');
    }
  }, [activity.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null;

  const iconSize = 'h-3.5 w-3.5';

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">Content</label>

      {/* Toolbar */}
      <div className="border border-border rounded-lg overflow-hidden bg-surface">
        <div className="flex flex-wrap gap-0.5 p-1 border-b border-border bg-surface-hover/50">
          {/* Text formatting */}
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
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <Strikethrough className={iconSize} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            active={editor.isActive('highlight')}
            title="Highlight"
          >
            <Highlighter className={iconSize} />
          </ToolbarButton>

          <div className="w-px h-5 bg-border mx-0.5 self-center" />

          {/* Headings */}
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            <Heading1 className={iconSize} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            <Heading2 className={iconSize} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            <Heading3 className={iconSize} />
          </ToolbarButton>

          <div className="w-px h-5 bg-border mx-0.5 self-center" />

          {/* Lists */}
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

          <div className="w-px h-5 bg-border mx-0.5 self-center" />

          {/* Alignment */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            active={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
          >
            <AlignLeft className={iconSize} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            active={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
          >
            <AlignCenter className={iconSize} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            active={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
          >
            <AlignRight className={iconSize} />
          </ToolbarButton>

          <div className="w-px h-5 bg-border mx-0.5 self-center" />

          {/* Horizontal rule */}
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <Minus className={iconSize} />
          </ToolbarButton>

          {/* Undo/Redo */}
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
          >
            <Undo className={iconSize} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
          >
            <Redo className={iconSize} />
          </ToolbarButton>
        </div>

        {/* Editor content */}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
