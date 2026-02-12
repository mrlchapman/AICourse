'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ACTIVITY_CONFIG, type ActivityType, type Activity } from '@/types/activities';

interface InsertMenuProps {
  onInsert: (activity: Activity) => void;
  position?: 'top' | 'between' | 'bottom';
  className?: string;
}

const categories = ['Content', 'Interactive', 'Media', 'Advanced'] as const;

function createDefaultActivity(type: ActivityType): Activity {
  const base = {
    id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    order: 0,
  };

  switch (type) {
    case 'text_content':
      return { ...base, type: 'text_content', content: '<p>Enter your text here...</p>' };
    case 'image':
      return { ...base, type: 'image', src: '', alt: 'Image description' };
    case 'info_panel':
      return { ...base, type: 'info_panel', title: 'Info', content: 'Important information here.', variant: 'info' };
    case 'knowledge_check':
      return {
        ...base,
        type: 'knowledge_check',
        question: 'Enter your question',
        options: [
          { id: 'opt-1', text: 'Option A', correct: true },
          { id: 'opt-2', text: 'Option B', correct: false },
          { id: 'opt-3', text: 'Option C', correct: false },
        ],
        explanation: 'Explanation for the correct answer.',
      };
    case 'youtube':
      return { ...base, type: 'youtube', videoId: '' };
    case 'quiz':
      return {
        ...base,
        type: 'quiz',
        title: 'Quiz',
        description: '',
        timeLimit: 0,
        passingScore: 70,
        questions: [
          {
            id: 'q-1',
            text: 'Question 1',
            points: 10,
            options: [
              { id: 'o-1', text: 'Answer A', correct: true },
              { id: 'o-2', text: 'Answer B', correct: false },
            ],
          },
        ],
      };
    case 'accordion':
      return {
        ...base,
        type: 'accordion',
        sections: [
          { id: 'acc-1', title: 'Section 1', content: 'Content for section 1' },
          { id: 'acc-2', title: 'Section 2', content: 'Content for section 2' },
        ],
      };
    case 'tabs':
      return {
        ...base,
        type: 'tabs',
        tabs: [
          { id: 'tab-1', title: 'Tab 1', content: 'Content for tab 1' },
          { id: 'tab-2', title: 'Tab 2', content: 'Content for tab 2' },
        ],
      };
    case 'flashcard':
      return {
        ...base,
        type: 'flashcard',
        cards: [
          { id: 'card-1', front: 'Front', back: 'Back' },
          { id: 'card-2', front: 'Term', back: 'Definition' },
        ],
      };
    case 'matching':
      return {
        ...base,
        type: 'matching',
        title: 'Match the pairs',
        pairs: [
          { id: 'pair-1', left: 'Item A', right: 'Match A' },
          { id: 'pair-2', left: 'Item B', right: 'Match B' },
        ],
      };
    case 'sequence':
      return {
        ...base,
        type: 'sequence',
        title: 'Put in order',
        items: [
          { id: 'seq-1', text: 'Step 1', order: 0 },
          { id: 'seq-2', text: 'Step 2', order: 1 },
          { id: 'seq-3', text: 'Step 3', order: 2 },
        ],
      };
    case 'timeline':
      return {
        ...base,
        type: 'timeline',
        title: 'Timeline',
        events: [
          { id: 'evt-1', title: 'Event 1', content: 'Description' },
          { id: 'evt-2', title: 'Event 2', content: 'Description' },
        ],
      };
    case 'divider':
      return { ...base, type: 'divider', style: 'line' };
    case 'code_snippet':
      return { ...base, type: 'code_snippet', language: 'javascript', code: '// Your code here' };
    case 'process':
      return {
        ...base,
        type: 'process',
        steps: [
          { id: 'step-1', title: 'Step 1', content: 'Description' },
          { id: 'step-2', title: 'Step 2', content: 'Description' },
        ],
      };
    case 'button':
      return {
        ...base,
        type: 'button',
        alignment: 'center',
        buttons: [{ id: 'btn-1', text: 'Click here', url: '#', variant: 'primary' }],
      };
    case 'video':
      return { ...base, type: 'video', src: '' };
    case 'audio':
      return { ...base, type: 'audio', src: '' };
    case 'gallery':
      return { ...base, type: 'gallery', images: [], layout: 'grid' };
    case 'pdf':
      return { ...base, type: 'pdf', pdfUrl: '' };
    case 'embed':
      return { ...base, type: 'embed', url: '' };
    case 'gamification':
      return {
        ...base,
        type: 'gamification',
        gameType: 'memory_match',
        config: { pairs: [] },
      };
    case 'discussion':
      return {
        ...base,
        type: 'discussion',
        title: 'Discussion',
        prompt: 'Share your thoughts on this topic...',
        config: { enableReplies: true },
      };
    default:
      return { ...base } as Activity;
  }
}

export function InsertMenu({ onInsert, position = 'between', className }: InsertMenuProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const filteredTypes = Object.entries(ACTIVITY_CONFIG).filter(
    ([, config]) =>
      search === '' ||
      config.label.toLowerCase().includes(search.toLowerCase()) ||
      config.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleInsert = (type: ActivityType) => {
    const activity = createDefaultActivity(type);
    onInsert(activity);
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'group flex items-center justify-center transition-all',
          position === 'between'
            ? 'w-full py-1 opacity-0 hover:opacity-100 focus:opacity-100'
            : 'w-full py-3'
        )}
      >
        <div className="flex items-center gap-2">
          <div className="h-px w-8 bg-border group-hover:bg-primary transition-colors" />
          <div className="h-6 w-6 rounded-full border border-border group-hover:border-primary group-hover:bg-primary-light flex items-center justify-center transition-colors">
            <Plus className="h-3.5 w-3.5 text-foreground-subtle group-hover:text-primary" />
          </div>
          <div className="h-px w-8 bg-border group-hover:bg-primary transition-colors" />
        </div>
      </button>

      {/* Menu Popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 w-80 bg-surface rounded-xl border border-border shadow-lg overflow-hidden"
          >
            {/* Search */}
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-subtle" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search blocks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-surface-hover rounded-md border-none outline-none placeholder:text-foreground-subtle"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="max-h-72 overflow-y-auto p-2">
              {categories.map((category) => {
                const items = filteredTypes.filter(([, c]) => c.category === category);
                if (items.length === 0) return null;
                return (
                  <div key={category} className="mb-2 last:mb-0">
                    <p className="text-xs font-semibold text-foreground-subtle uppercase tracking-wider px-2 py-1">
                      {category}
                    </p>
                    <div className="grid grid-cols-2 gap-0.5">
                      {items.map(([type, config]) => (
                        <button
                          key={type}
                          onClick={() => handleInsert(type as ActivityType)}
                          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-surface-hover transition-colors"
                        >
                          <span className="text-sm shrink-0">{config.icon}</span>
                          <span className="text-xs text-foreground truncate">{config.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {filteredTypes.length === 0 && (
                <p className="text-sm text-foreground-muted text-center py-4">No blocks found</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
