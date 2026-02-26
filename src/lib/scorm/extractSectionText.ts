import type { Activity } from './activities/types';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

const MAX_LENGTH = 5000;

/**
 * Extracts readable text from a section's activities for use as AI context.
 * Covers all text-bearing activity types. Caps output at 5000 characters.
 */
export function extractSectionText(
  activities: Activity[],
  excludeActivityId?: string
): string {
  const parts: string[] = [];

  for (const act of activities) {
    if (excludeActivityId && act.id === excludeActivityId) continue;

    const a = act as any;

    switch (a.type) {
      case 'text_content':
        if (a.content) parts.push(stripHtml(a.content));
        break;

      case 'info_panel':
        if (a.title) parts.push(a.title);
        if (a.content) parts.push(stripHtml(a.content));
        break;

      case 'accordion':
        if (a.sections) {
          for (const s of a.sections) {
            if (s.title) parts.push(s.title);
            if (s.content) parts.push(stripHtml(s.content));
          }
        }
        break;

      case 'tabs':
        if (a.tabs) {
          for (const t of a.tabs) {
            if (t.label || t.title) parts.push(t.label || t.title);
            if (t.content) parts.push(stripHtml(t.content));
          }
        }
        break;

      case 'knowledge_check':
        if (a.question) parts.push(a.question);
        if (a.options) {
          for (const o of a.options) {
            if (o.text) parts.push(o.text);
          }
        }
        if (a.explanation) parts.push(a.explanation);
        break;

      case 'quiz':
        if (a.title) parts.push(a.title);
        if (a.questions) {
          for (const q of a.questions) {
            if (q.text) parts.push(q.text);
            if (q.options) {
              for (const o of q.options) {
                if (o.text) parts.push(o.text);
              }
            }
          }
        }
        break;

      case 'flashcard':
        if (a.cards) {
          for (const c of a.cards) {
            if (c.front) parts.push(c.front);
            if (c.back) parts.push(c.back);
          }
        }
        break;

      case 'matching':
        if (a.title) parts.push(a.title);
        if (a.pairs) {
          for (const p of a.pairs) {
            if (p.left) parts.push(p.left);
            if (p.right) parts.push(p.right);
          }
        }
        break;

      case 'process':
        if (a.steps) {
          for (const s of a.steps) {
            if (s.title) parts.push(s.title);
            if (s.content) parts.push(stripHtml(s.content));
          }
        }
        break;

      case 'timeline':
        if (a.events) {
          for (const e of a.events) {
            if (e.title) parts.push(e.title);
            if (e.content) parts.push(stripHtml(e.content));
          }
        }
        break;

      case 'sequence':
        if (a.items) {
          for (const item of a.items) {
            if (item.text) parts.push(item.text);
          }
        }
        break;

      case 'sorting':
        if (a.categories) {
          for (const cat of a.categories) {
            if (cat.title) parts.push(cat.title);
          }
        }
        if (a.items) {
          for (const item of a.items) {
            if (item.text) parts.push(item.text);
          }
        }
        break;

      case 'code_snippet':
        if (a.title) parts.push(a.title);
        break;
    }
  }

  const text = parts.join('\n');
  return text.length > MAX_LENGTH ? text.substring(0, MAX_LENGTH) : text;
}
