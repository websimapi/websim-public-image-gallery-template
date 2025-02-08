import { updateGallery } from './gallery.js';

let currentFilter = 'new';
let cachedImages = [];
let cachedViews = [];

export function setupGalleryFilters(room) {
  room.collection('images').subscribe(images => {
    cachedImages = images;
    updateGallery(room, cachedImages, cachedViews);
  });

  room.collection('views').subscribe(views => {
    cachedViews = views;
    updateViewCounters(views);
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => 
        b.classList.remove('active')
      );
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      updateGallery(room, cachedImages, cachedViews);
    });
  });
}

export function getFilteredImages(room, images, views) {
  const userUsername = room.party.client.username;
  
  switch(currentFilter) {
    case 'new':
      return [...images].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
    case 'hot':
      return [...images].sort((a, b) => {
        const viewsA = calculateViews(a.id, views);
        const viewsB = calculateViews(b.id, views);
        return viewsB - viewsA;
      });
      
    case 'recent':
      const recentlyViewed = new Map();
      views.forEach(view => {
        recentlyViewed.set(view.image_id, 
          Math.max(new Date(view.created_at).getTime(), 
            recentlyViewed.get(view.image_id) || 0)
        );
      });
      
      return [...images].filter(img => recentlyViewed.has(img.id))
        .sort((a, b) => recentlyViewed.get(b.id) - recentlyViewed.get(a.id));
      
    case 'yours':
      return images.filter(img => img.username === userUsername);
      
    default:
      return images;
  }
}

function calculateViews(imageId, views) {
  return views.filter(view => view.image_id === imageId).length;
}

function updateViewCounters(views) {
  const viewCounts = new Map();
  
  views.forEach(view => {
    const count = viewCounts.get(view.image_id) || 0;
    viewCounts.set(view.image_id, count + 1);
  });
  
  viewCounts.forEach((count, imageId) => {
    const counter = document.getElementById(`views_${imageId}`);
    if (counter) {
      counter.textContent = count;
    }
  });
}