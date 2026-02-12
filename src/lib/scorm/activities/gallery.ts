/**
 * Gallery/Carousel Activity
 * Image slideshow with navigation and lightbox
 */

import { GalleryActivity } from './types';

export function renderGallery(activity: GalleryActivity): string {
  const safeId = sanitizeId(activity.id);
  const images = activity.images || [];
  const layout = activity.layout || 'carousel';

  if (layout === 'grid') {
    return renderGridGallery(activity, safeId, images);
  }
  return renderCarouselGallery(activity, safeId, images);
}

function renderCarouselGallery(activity: GalleryActivity, safeId: string, images: GalleryActivity['images']): string {
  const slidesHtml = images.map((img, i) => `
    <div class="carousel-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
      <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt || '')}" onclick="openLightbox_${safeId}(${i})" referrerpolicy="no-referrer">
      ${img.caption ? `<div class="carousel-caption">${escapeHtml(img.caption)}</div>` : ''}
    </div>
  `).join('');

  const dotsHtml = images.map((_, i) => `
    <button class="carousel-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide_${safeId}(${i})"></button>
  `).join('');

  return `
<div class="activity gallery-activity" id="activity-${activity.id}" data-activity-type="gallery">
  ${activity.title ? `<h3 class="gallery-title">${escapeHtml(activity.title)}</h3>` : ''}
  <div class="carousel-container" id="carousel-${safeId}">
    <div class="carousel-main">
      <button class="carousel-nav carousel-prev" onclick="prevSlide_${safeId}()">❮</button>
      <div class="carousel-slides" id="slides-${safeId}">${slidesHtml}</div>
      <button class="carousel-nav carousel-next" onclick="nextSlide_${safeId}()">❯</button>
    </div>
    <div class="carousel-counter"><span id="counter-${safeId}">1</span> / ${images.length}</div>
    <div class="carousel-dots" id="dots-${safeId}">${dotsHtml}</div>
  </div>
  <div class="gallery-lightbox" id="lightbox-${safeId}">
    <button class="lightbox-close" onclick="closeLightbox_${safeId}()">×</button>
    <button class="lightbox-nav lightbox-prev" onclick="prevLightbox_${safeId}()">❮</button>
    <div class="lightbox-content"><img id="lightbox-img-${safeId}" src="" alt="" referrerpolicy="no-referrer"><div class="lightbox-caption" id="lightbox-caption-${safeId}"></div></div>
    <button class="lightbox-nav lightbox-next" onclick="nextLightbox_${safeId}()">❯</button>
  </div>
</div>
${getGalleryStyles()}
${getGalleryScript(safeId, images)}
`;
}

function renderGridGallery(activity: GalleryActivity, safeId: string, images: GalleryActivity['images']): string {
  const gridHtml = images.map((img, i) => `
    <div class="grid-item" onclick="openLightbox_${safeId}(${i})">
      <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt || '')}" referrerpolicy="no-referrer">
      ${img.caption ? `<div class="grid-caption">${escapeHtml(img.caption)}</div>` : ''}
    </div>
  `).join('');

  return `
<div class="activity gallery-activity gallery-grid" id="activity-${activity.id}" data-activity-type="gallery">
  ${activity.title ? `<h3 class="gallery-title">${escapeHtml(activity.title)}</h3>` : ''}
  <div class="grid-container" id="grid-${safeId}">${gridHtml}</div>
  <div class="gallery-lightbox" id="lightbox-${safeId}">
    <button class="lightbox-close" onclick="closeLightbox_${safeId}()">×</button>
    <button class="lightbox-nav lightbox-prev" onclick="prevLightbox_${safeId}()">❮</button>
    <div class="lightbox-content"><img id="lightbox-img-${safeId}" src="" alt=""><div class="lightbox-caption" id="lightbox-caption-${safeId}"></div></div>
    <button class="lightbox-nav lightbox-next" onclick="nextLightbox_${safeId}()">❯</button>
  </div>
</div>
${getGridStyles()}
${getGalleryScript(safeId, images)}
`;
}

function getGalleryStyles(): string {
  return `<style>
.gallery-activity { margin: 24px 0; }
.gallery-title { font-size: 1.3rem; font-weight: 700; margin-bottom: 20px; color: var(--text); }
.carousel-container { background: var(--card-bg); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid var(--card-border); padding: 24px; box-shadow: var(--card-shadow); }
.carousel-main { position: relative; overflow: hidden; border-radius: 16px; }
.carousel-slides { position: relative; height: 400px; background: var(--surface); border-radius: 16px; overflow: hidden; }
.carousel-slide { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.5s ease; }
.carousel-slide.active { opacity: 1; }
.carousel-slide img { max-width: 100%; max-height: 350px; object-fit: contain; cursor: zoom-in; border-radius: 12px; margin: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: transform 0.3s; }
.carousel-slide img:hover { transform: scale(1.02); }
.carousel-caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 16px 20px; background: linear-gradient(transparent, rgba(0,0,0,0.8)); color: white; text-align: center; font-size: 0.95rem; border-radius: 0 0 16px 16px; }
.carousel-nav { position: absolute; top: 50%; transform: translateY(-50%); z-index: 10; width: 48px; height: 48px; background: var(--card-bg); backdrop-filter: blur(10px); border: 1px solid var(--border); border-radius: 50%; color: var(--text); font-size: 1.2rem; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; }
.carousel-nav:hover { background: var(--primary); color: white; border-color: var(--primary); transform: translateY(-50%) scale(1.1); }
.carousel-prev { left: 16px; } .carousel-next { right: 16px; }
.carousel-counter { text-align: center; padding: 16px 0 8px; font-weight: 600; color: var(--text-muted); }
.carousel-dots { display: flex; justify-content: center; gap: 8px; padding: 8px 0; }
.carousel-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--border); border: none; cursor: pointer; transition: all 0.3s; }
.carousel-dot:hover { background: var(--primary-light); }
.carousel-dot.active { background: var(--primary); transform: scale(1.2); }
.gallery-lightbox { position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 10000; display: none; align-items: center; justify-content: center; backdrop-filter: blur(10px); }
.gallery-lightbox.active { display: flex; }
.lightbox-close { position: absolute; top: 20px; right: 20px; width: 50px; height: 50px; background: rgba(255,255,255,0.1); border: none; border-radius: 50%; color: white; font-size: 2rem; cursor: pointer; transition: all 0.3s; z-index: 10; }
.lightbox-close:hover { background: rgba(255,255,255,0.2); transform: rotate(90deg); }
.lightbox-content { max-width: 90vw; max-height: 85vh; display: flex; flex-direction: column; align-items: center; }
.lightbox-content img { max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 8px; margin: 0; }
.lightbox-caption { color: white; text-align: center; padding: 16px; font-size: 1rem; max-width: 600px; }
.lightbox-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 60px; height: 60px; background: rgba(255,255,255,0.1); border: none; border-radius: 50%; color: white; font-size: 1.5rem; cursor: pointer; transition: all 0.3s; }
.lightbox-nav:hover { background: rgba(255,255,255,0.2); }
.lightbox-prev { left: 20px; } .lightbox-next { right: 20px; }
@media (max-width: 768px) { .carousel-slides { height: 280px; } .carousel-slide img { max-height: 240px; } .carousel-nav { width: 40px; height: 40px; font-size: 1rem; } .carousel-prev { left: 8px; } .carousel-next { right: 8px; } }
</style>`;
}

function getGridStyles(): string {
  return getGalleryStyles() + `<style>
.gallery-grid .grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
.grid-item { position: relative; border-radius: 12px; overflow: hidden; cursor: pointer; aspect-ratio: 1; background: var(--surface); }
.grid-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; margin: 0; border-radius: 0; }
.grid-item:hover img { transform: scale(1.05); }
.grid-caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; background: linear-gradient(transparent, rgba(0,0,0,0.8)); color: white; font-size: 0.85rem; opacity: 0; transition: opacity 0.3s; }
.grid-item:hover .grid-caption { opacity: 1; }
</style>`;
}

function getGalleryScript(safeId: string, images: GalleryActivity['images']): string {
  return `<script>
(function(){var cur=0,total=${images.length},imgs=${JSON.stringify(images)},lbIdx=0;
window.goToSlide_${safeId}=function(i){document.querySelectorAll('#slides-${safeId} .carousel-slide').forEach(function(s,x){s.classList.toggle('active',x===i)});document.querySelectorAll('#dots-${safeId} .carousel-dot').forEach(function(d,x){d.classList.toggle('active',x===i)});cur=i;document.getElementById('counter-${safeId}').textContent=i+1};
window.nextSlide_${safeId}=function(){goToSlide_${safeId}((cur+1)%total)};
window.prevSlide_${safeId}=function(){goToSlide_${safeId}((cur-1+total)%total)};
window.openLightbox_${safeId}=function(i){lbIdx=i;document.getElementById('lightbox-img-${safeId}').src=imgs[i].src;document.getElementById('lightbox-caption-${safeId}').textContent=imgs[i].caption||'';document.getElementById('lightbox-${safeId}').classList.add('active');document.body.style.overflow='hidden'};
window.closeLightbox_${safeId}=function(){document.getElementById('lightbox-${safeId}').classList.remove('active');document.body.style.overflow=''};
window.nextLightbox_${safeId}=function(){lbIdx=(lbIdx+1)%total;document.getElementById('lightbox-img-${safeId}').src=imgs[lbIdx].src;document.getElementById('lightbox-caption-${safeId}').textContent=imgs[lbIdx].caption||''};
window.prevLightbox_${safeId}=function(){lbIdx=(lbIdx-1+total)%total;document.getElementById('lightbox-img-${safeId}').src=imgs[lbIdx].src;document.getElementById('lightbox-caption-${safeId}').textContent=imgs[lbIdx].caption||''};
document.addEventListener('keydown',function(e){var lb=document.getElementById('lightbox-${safeId}');if(lb.classList.contains('active')){if(e.key==='Escape')closeLightbox_${safeId}();if(e.key==='ArrowRight')nextLightbox_${safeId}();if(e.key==='ArrowLeft')prevLightbox_${safeId}()}})})();
</script>`;
}

function sanitizeId(id: string): string { return id.replace(/[^a-zA-Z0-9_]/g, '_'); }
function escapeHtml(s: string): string { if (!s) return ''; return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
