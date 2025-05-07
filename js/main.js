import * as api from 'api';
import * as ui from 'ui';
import { formatDate } from 'utils';

// Current state
let currentImageId = null;
let currentFilter = 'new';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Set up event listeners
  setupEventListeners();
  
  // Subscribe to data sources
  subscribeToData();
});

function setupEventListeners() {
  // Create image button
  document.getElementById('createBtn').addEventListener('click', handleImageCreation);
  
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', handleFilterChange);
  });
  
  // Modal controls
  const modal = document.getElementById('viewersModal');
  const closeBtn = document.getElementById('closeModal');
  
  closeBtn.addEventListener('click', () => ui.hideModal());
  modal.addEventListener('click', (e) => {
    if (e.target === modal) ui.hideModal();
  });
  
  // Modal tabs
  document.querySelectorAll('.modal-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const section = tab.getAttribute('data-section');
      ui.switchModalTab(section);
    });
  });
  
  // Comment submit button
  document.getElementById('commentInput').nextElementSibling.addEventListener('click', handleCommentSubmission);
}

function subscribeToData() {
  // Subscribe to image changes
  api.subscribeToImages(handleImageUpdate);
  
  // Subscribe to views
  api.subscribeToViews(handleViewsUpdate);
  
  // Subscribe to comments
  api.subscribeToComments(handleCommentsUpdate);
}

// Event handlers
async function handleImageCreation() {
  const inputField = document.getElementById('imageUrl');
  const promptText = inputField.value.trim();
  
  if (promptText) {
    try {
      ui.showLoading();
      await api.createImage(promptText);
      inputField.value = '';
      ui.hideLoading();
    } catch (error) {
      ui.hideLoading();
      ui.showError(error.message);
      console.error('Error creating image:', error);
    }
  }
}

function handleFilterChange(event) {
  const filterType = event.target.getAttribute('data-filter');
  
  // Update active state
  document.querySelectorAll('.filter-btn').forEach(btn => 
    btn.classList.remove('active')
  );
  event.target.classList.add('active');
  
  // Update current filter and refresh gallery
  currentFilter = filterType;
  updateGallery();
}

async function handleCommentSubmission() {
  if (!currentImageId) return;
  
  const commentInput = document.getElementById('commentInput');
  const commentText = commentInput.value.trim();
  
  if (commentText) {
    await api.createComment(currentImageId, commentText);
    commentInput.value = '';
  }
}

// Update handlers
function handleImageUpdate(images) {
  api.setCachedImages(images);
  updateGallery();
}

function handleViewsUpdate(views) {
  api.setCachedViews(views);
  ui.updateViewCounters(views);
  
  // If modal is open with viewers, update it
  if (currentImageId && document.querySelector('.modal-tab.active').getAttribute('data-section') === 'viewersList') {
    ui.showViewersList(currentImageId, views, formatDate);
  }
}

function handleCommentsUpdate(comments) {
  ui.updateCommentCounters(comments);
  
  // If comments modal is open, update the comments UI
  if (currentImageId && document.querySelector('.modal-tab.active').getAttribute('data-section') === 'commentsSection') {
    ui.showCommentsList(currentImageId, comments, formatDate);
  }
}

// Gallery update
function updateGallery() {
  const filteredImages = api.getFilteredImages(currentFilter);
  ui.renderGallery(filteredImages, openModal, showFullscreenImage);
}

// Modal functions
function openModal(imageId, section) {
  currentImageId = imageId;
  
  if (section === 'viewers') {
    ui.showViewersList(imageId, api.getCachedViews(), formatDate);
    ui.switchModalTab('viewersList');
  } else if (section === 'comments') {
    ui.showCommentsList(imageId, api.getComments(), formatDate);
    ui.switchModalTab('commentsSection');
  }
  
  ui.showModal();
}

function showFullscreenImage(imageUrl, prompt) {
  ui.showFullscreenImage(imageUrl, prompt);
}

// Export functions that need to be called from UI events
window.createImageView = api.createView;
window.downloadImage = ui.downloadImage;
window.submitComment = handleCommentSubmission;