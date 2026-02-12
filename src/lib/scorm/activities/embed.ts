/**
 * Embed Activity
 * Generic iframe embed for external content
 */

import { EmbedActivity } from './types';

export function renderEmbed(activity: EmbedActivity): string {
  // If raw embed code is provided, use it
  if (activity.embedCode) {
    return `
<div class="activity embed-activity custom-embed" id="activity-${activity.id}" data-activity-type="embed">
  ${activity.title ? `<h4 class="embed-title">${escapeHtml(activity.title)}</h4>` : ''}
  <div class="embed-raw-content">
    ${activity.embedCode}
  </div>
  ${activity.caption ? `<p class="embed-caption">${escapeHtml(activity.caption)}</p>` : ''}
</div>
<style>
.embed-activity { margin: 24px 0; }
.embed-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; color: var(--text); }
.embed-container { position: relative; width: 100%; background: var(--surface); border-radius: 16px; overflow: hidden; box-shadow: var(--card-shadow); }
.embed-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
.embed-raw-content { width: 100%; overflow: hidden; border-radius: 16px; background: var(--surface); }
/* Make raw embeds responsive */
.embed-raw-content iframe, 
.embed-raw-content video, 
.embed-raw-content object,
.embed-raw-content embed { 
  max-width: 100% !important; 
  width: 100% !important; /* Override fixed width attributes */
  display: block;
}
.embed-caption { margin-top: 12px; font-size: 0.9rem; color: var(--text-muted); text-align: center; }
</style>
`;
  }

  const aspectRatio = activity.aspectRatio || '16:9';
  const [w, h] = aspectRatio.split(':').map(Number);
  const paddingPercent = (h / w) * 100;

  return `
<div class="activity embed-activity" id="activity-${activity.id}" data-activity-type="embed">
  ${activity.title ? `<h4 class="embed-title">${escapeHtml(activity.title)}</h4>` : ''}
  <div class="embed-container" style="padding-bottom: ${paddingPercent}%;">
    <iframe 
      src="${escapeHtml(activity.url)}" 
      frameborder="0" 
      allowfullscreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      loading="lazy"
    ></iframe>
  </div>
  ${activity.caption ? `<p class="embed-caption">${escapeHtml(activity.caption)}</p>` : ''}
</div>
<style>
.embed-activity { margin: 24px 0; }
.embed-title { font-size: 1.1rem; font-weight: 700; margin-bottom: 16px; color: var(--text); }
.embed-container { position: relative; width: 100%; background: var(--surface); border-radius: 16px; overflow: hidden; box-shadow: var(--card-shadow); }
.embed-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
.embed-caption { margin-top: 12px; font-size: 0.9rem; color: var(--text-muted); text-align: center; }
</style>
`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
