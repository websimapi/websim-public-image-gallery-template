import * as api from 'api';

// Track hover timeouts to prevent multiple rapid views
const hoverTimeouts = new Map();

// Renders the image gallery
export function renderGallery(images, openModalCallback, showFullscreenCallback) {
  const container = document.getElementById('imageContainer');
  container.innerHTML = '';
  
  images.forEach(image => {
    const div = document.createElement('div');
    div.id = 'img_' + image.id;
    div.className = 'image-box';
    
    const imageContent = document.createElement('div');
    imageContent.className = 'image-content';
    imageContent.style.backgroundImage = `url(${image.text})`;
    imageContent.setAttribute('title', image.prompt || image.text);
    
    // Add hover event listener for views
    setupImageHoverEvents(imageContent, image.id);
    
    // Fullscreen view on click
    imageContent.addEventListener('click', () => {
      showFullscreenCallback(image.text, image.prompt);
    });

    const userInfo = createUserInfoElement(image);
    const viewsCounter = createViewsCounter(image.id, openModalCallback);
    const commentCounter = createCommentCounter(image.id, openModalCallback);
    const downloadCounter = createDownloadCounter(image.text);

    div.appendChild(imageContent);
    div.appendChild(userInfo);
    div.appendChild(viewsCounter);
    div.appendChild(commentCounter);
    div.appendChild(downloadCounter);
    container.appendChild(div);
  });
}

// Create user info element with avatar and copy button
function createUserInfoElement(image) {
  const userInfo = document.createElement('div');
  userInfo.className = 'user-info';

  // Add copy button
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
  userInfo.appendChild(document.createTextNode(image.username));
  
  const avatar = document.createElement('img');
  avatar.className = 'user-avatar';
  avatar.src = `https://images.websim.ai/avatar/${image.username}`;
  avatar.alt = image.username;
  
  userInfo.appendChild(avatar);
  return userInfo;
}

// Create views counter element
function createViewsCounter(imageId, openModalCallback) {
  const viewsCounter = document.createElement('div');
  viewsCounter.className = 'views-counter';
  viewsCounter.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
    <span id="views_${imageId}">${api.calculateViews(imageId)}</span>
  `;
  
  // Add click handler to show viewers
  viewsCounter.addEventListener('click', () => {
    openModalCallback(imageId, 'viewers');
  });
  
  return viewsCounter;
}

// Create comment counter element
function createCommentCounter(imageId, openModalCallback) {
  const commentCounter = document.createElement('div');
  commentCounter.className = 'comment-counter';
  commentCounter.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
    </svg>
    <span id="comments_${imageId}">0</span>
  `;
  
  commentCounter.addEventListener('click', () => {
    openModalCallback(imageId, 'comments');
  });
  
  return commentCounter;
}

// Create download counter/button element
function createDownloadCounter(imageUrl) {
  const downloadCounter = document.createElement('div');
  downloadCounter.className = 'download-counter';
  downloadCounter.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
    </svg>
  `;
  
  downloadCounter.addEventListener('click', (e) => {
    e.stopPropagation();
    downloadImage(imageUrl);
  });
  
  return downloadCounter;
}

// Setup hover events for tracking views
function setupImageHoverEvents(element, imageId) {
  element.addEventListener('mouseenter', () => {
    if (hoverTimeouts.has(imageId)) {
      clearTimeout(hoverTimeouts.get(imageId));
    }
    
    const timeout = setTimeout(() => {
      window.createImageView(imageId);
    }, 500);
    
    hoverTimeouts.set(imageId, timeout);
  });
  
  element.addEventListener('mouseleave', () => {
    if (hoverTimeouts.has(imageId)) {
      clearTimeout(hoverTimeouts.get(imageId));
      hoverTimeouts.delete(imageId);
    }
  });
}

// Update view counters in the UI
export function updateViewCounters(views) {
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

// Update comment counters in the UI
export function updateCommentCounters(comments) {
  const commentCounts = new Map();
  
  comments.forEach(comment => {
    const count = commentCounts.get(comment.image_id) || 0;
    commentCounts.set(comment.image_id, count + 1);
  });
  
  commentCounts.forEach((count, imageId) => {
    const counter = document.getElementById(`comments_${imageId}`);
    if (counter) {
      counter.textContent = count;
    }
  });
}

// Show modal with viewers list
export function showViewersList(imageId, views, formatDateFn) {
  const viewersList = document.getElementById('viewersList');
  
  // Filter views for this image and sort by creation date
  const imageViews = views
    .filter(view => view.image_id === imageId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  // Clear previous content
  viewersList.innerHTML = '';
  
  // Add viewers to list
  imageViews.forEach(view => {
    const viewerItem = document.createElement('div');
    viewerItem.className = 'viewer-item';
    viewerItem.innerHTML = `
      <img class="user-avatar" src="https://images.websim.ai/avatar/${view.username}" alt="${view.username}">
      <div class="viewer-info">
        <span class="viewer-name">${view.username}</span>
        <span class="view-time">${formatDateFn(view.created_at)}</span>
      </div>
    `;
    viewersList.appendChild(viewerItem);
  });
}

// Show comments list
export function showCommentsList(imageId, comments, formatDateFn) {
  const commentsList = document.getElementById('commentsList');
  
  // Filter comments for this image
  const imageComments = comments
    .filter(comment => comment.image_id === imageId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  // Clear and populate comments list
  commentsList.innerHTML = '';
  
  if (imageComments.length === 0) {
    commentsList.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
    return;
  }
  
  imageComments.forEach(comment => {
    const commentItem = document.createElement('div');
    commentItem.className = 'comment-item';
    commentItem.innerHTML = `
      <img class="user-avatar" src="https://images.websim.ai/avatar/${comment.username}" alt="${comment.username}">
      <div class="comment-content">
        <div class="comment-header">
          <span class="comment-author">${comment.username}</span>
          <span class="comment-time">${formatDateFn(comment.created_at)}</span>
        </div>
        <div class="comment-text">${comment.comment_text}</div>
      </div>
    `;
    commentsList.appendChild(commentItem);
  });
}

// Switch between modal tabs
export function switchModalTab(sectionId) {
  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-section') === sectionId);
  });
  
  document.querySelectorAll('.modal-content-section').forEach(section => {
    section.classList.toggle('active', section.id === sectionId);
  });
}

// Show the modal
export function showModal() {
  document.getElementById('viewersModal').classList.add('show');
}

// Hide the modal
export function hideModal() {
  document.getElementById('viewersModal').classList.remove('show');
  return null; // Return null to reset currentImageId in the caller
}

// Show fullscreen image
export function showFullscreenImage(imageUrl, prompt) {
  const viewer = document.getElementById('fullscreenViewer');
  
  // Update viewer content
  viewer.innerHTML = `
    <img src="${imageUrl}" class="fullscreen-image" alt="${prompt || 'Image'}">
    ${prompt ? `<div class="fullscreen-prompt">${prompt}</div>` : ''}
  `;
  
  // Close on click outside
  viewer.addEventListener('click', (e) => {
    if (e.target === viewer) {
      hideFullscreenImage();
    }
  });
  
  // Show viewer
  viewer.classList.add('show');
}

// Hide fullscreen image
export function hideFullscreenImage() {
  document.getElementById('fullscreenViewer').classList.remove('show');
}

// Download image
export async function downloadImage(imageUrl) {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Create a canvas to convert the image to PNG
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // Convert to PNG and download
      canvas.toBlob((pngBlob) => {
        const url = window.URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `image-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 'image/png');
    };
    
    img.src = URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error downloading image:', error);
  }
}