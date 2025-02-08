import { room } from "./room.js";
import { calculateViews, createView, formatDate } from "./utils.js";
import { downloadImage, showFullscreenImage } from "./imageUtils.js";
import { showViewers, showComments } from "./modal.js";

let cachedImages = [];
let cachedViews = [];
let currentFilter = 'new';
let hoverTimeouts = new Map();

export function setImages(images) {
  cachedImages = images;
  updateGallery();
}

export function setViews(views) {
  cachedViews = views;
  updateGallery();
  updateViewCounters();
}

export function setFilter(filter) {
  currentFilter = filter;
  updateGallery();
}

function getFilteredImages() {
  const userUsername = room.party.client.username;
  switch (currentFilter) {
    case 'new':
      return [...cachedImages].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    case 'hot':
      return [...cachedImages].sort((a, b) => {
        const viewsA = calculateViews(a.id, cachedViews);
        const viewsB = calculateViews(b.id, cachedViews);
        return viewsB - viewsA;
      });
    case 'recent': {
      const recentlyViewed = new Map();
      cachedViews.forEach(view => {
        const time = new Date(view.created_at).getTime();
        recentlyViewed.set(view.image_id, Math.max(time, recentlyViewed.get(view.image_id) || 0));
      });
      return [...cachedImages]
        .filter(img => recentlyViewed.has(img.id))
        .sort((a, b) => recentlyViewed.get(b.id) - recentlyViewed.get(a.id));
    }
    case 'yours':
      return cachedImages.filter(img => img.username === userUsername);
    default:
      return cachedImages;
  }
}

export function updateGallery() {
  const container = document.getElementById('imageContainer');
  if (!container) return;
  container.innerHTML = '';
  const filteredImages = getFilteredImages();
  
  filteredImages.forEach(image => {
    const div = document.createElement('div');
    div.id = 'img_' + image.id;
    div.className = 'image-box';

    const imageContent = document.createElement('div');
    imageContent.className = 'image-content';
    imageContent.style.backgroundImage = `url(${image.text})`;
    imageContent.title = image.prompt || image.text;

    imageContent.addEventListener('mouseenter', () => {
      if (hoverTimeouts.has(image.id)) clearTimeout(hoverTimeouts.get(image.id));
      const timeout = setTimeout(() => {
        createView(image.id);
      }, 500);
      hoverTimeouts.set(image.id, timeout);
    });

    imageContent.addEventListener('mouseleave', () => {
      if (hoverTimeouts.has(image.id)) {
        clearTimeout(hoverTimeouts.get(image.id));
        hoverTimeouts.delete(image.id);
      }
    });

    imageContent.addEventListener('click', () => {
      showFullscreenImage(image.text, image.prompt);
    });

    // User info at top right with copy prompt button, username text, and avatar
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-prompt-btn';
    copyButton.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
    `;
    copyButton.title = "Copy prompt to input";
    copyButton.addEventListener('click', (e) => {
      e.stopPropagation();
      const input = document.getElementById('imageUrl');
      input.value = image.prompt || image.text;
      input.focus();
      input.scrollIntoView({ behavior: 'smooth' });
    });
    userInfo.appendChild(copyButton);

    const usernameText = document.createElement('span');
    usernameText.textContent = image.username;
    userInfo.appendChild(usernameText);

    const avatar = document.createElement('img');
    avatar.className = 'user-avatar';
    avatar.src = `https://images.websim.ai/avatar/${image.username}`;
    avatar.alt = image.username;
    userInfo.appendChild(avatar);

    // Views counter
    const viewsCounter = document.createElement('div');
    viewsCounter.className = 'views-counter';
    viewsCounter.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
      </svg>
      <span id="views_${image.id}">${calculateViews(image.id, cachedViews)}</span>
    `;
    viewsCounter.addEventListener('click', () => {
      showViewers(image.id);
    });

    // Comment counter
    const commentCounter = document.createElement('div');
    commentCounter.className = 'comment-counter';
    commentCounter.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
      </svg>
      <span id="comments_${image.id}">0</span>
    `;
    commentCounter.addEventListener('click', () => {
      showComments(image.id);
    });

    // Download button
    const downloadCounter = document.createElement('div');
    downloadCounter.className = 'download-counter';
    downloadCounter.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
      </svg>
    `;
    downloadCounter.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadImage(image.text);
    });

    div.appendChild(imageContent);
    div.appendChild(userInfo);
    div.appendChild(viewsCounter);
    div.appendChild(commentCounter);
    div.appendChild(downloadCounter);
    container.appendChild(div);
  });
}

function updateViewCounters() {
  const viewCounts = new Map();
  cachedViews.forEach(view => {
    const count = viewCounts.get(view.image_id) || 0;
    viewCounts.set(view.image_id, count + 1);
  });
  viewCounts.forEach((count, imageId) => {
    const counter = document.getElementById(`views_${imageId}`);
    if (counter) counter.textContent = count;
  });
}

export { updateGallery };