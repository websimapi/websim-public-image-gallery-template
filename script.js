// Initialize WebSocket connection
const room = new WebsimSocket();

// Track hover timeouts to prevent multiple rapid views
const hoverTimeouts = new Map();

// Global variable to track current image ID for comments
let currentImageId = null;

// Create a view record for an image
async function createView(imageId) {
  await room.collection('views').create({
    image_id: imageId
  });
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Show viewers modal
function showViewers(imageId) {
  const modal = document.getElementById('viewersModal');
  const viewersList = document.getElementById('viewersList');
  
  // Get views directly (getList is synchronous)
  const views = room.collection('views').getList();
  
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
        <span class="view-time">${formatDate(view.created_at)}</span>
      </div>
    `;
    viewersList.appendChild(viewerItem);
  });
  
  modal.classList.add('show');
}

// Show comments modal
function showComments(imageId) {
  currentImageId = imageId;
  const modal = document.getElementById('viewersModal');
  updateCommentsUI(imageId);  // Extracted to separate function for reuse
  
  // Switch to comments tab
  document.querySelectorAll('.modal-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.modal-content-section').forEach(s => s.classList.remove('active'));
  document.querySelector('[data-section="commentsSection"]').classList.add('active');
  document.getElementById('commentsSection').classList.add('active');
  
  modal.classList.add('show');
}

// Update comments UI
function updateCommentsUI(imageId) {
  const commentsList = document.getElementById('commentsList');
  
  // Get comments
  const comments = room.collection('comments').getList();
  const imageComments = comments
    .filter(comment => comment.image_id === imageId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  // Clear and populate comments list
  commentsList.innerHTML = '';
  imageComments.forEach(comment => {
    const commentItem = document.createElement('div');
    commentItem.className = 'comment-item';
    commentItem.innerHTML = `
      <img class="user-avatar" src="https://images.websim.ai/avatar/${comment.username}" alt="${comment.username}">
      <div class="comment-content">
        <div class="comment-header">
          <span class="comment-author">${comment.username}</span>
          <span class="comment-time">${formatDate(comment.created_at)}</span>
        </div>
        <div class="comment-text">${comment.comment_text}</div>
      </div>
    `;
    commentsList.appendChild(commentItem);
  });
}

// Handle image creation
document.getElementById('createBtn').addEventListener('click', async () => {
  const inputText = document.getElementById('imageUrl').value.trim();
  
  if (inputText) {
    const img = document.createElement('img');
    img.id = 'img_' + Date.now();
    img.src = inputText;
    img.alt = inputText;
    
    img.onload = async function() {
      if (img.src !== inputText) {
        try {
          const response = await fetch(img.src);
          const blob = await response.blob();
          const uploadedUrl = await websim.upload(blob);
          
          await room.collection('images').create({
            text: uploadedUrl
          });
          
          img.remove();
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }
    };
    
    document.getElementById('imageUrl').value = '';
    document.getElementById('imageContainer').appendChild(img);
  }
});

// Subscribe to image changes in the database
room.collection('images').subscribe(images => {
  const container = document.getElementById('imageContainer');
  container.innerHTML = '';
  
  images.forEach(image => {
    const div = document.createElement('div');
    div.id = 'img_' + image.id;
    div.className = 'image-box';
    
    const imageContent = document.createElement('div');
    imageContent.className = 'image-content';
    imageContent.style.backgroundImage = `url(${image.text})`;
    imageContent.setAttribute('title', image.text);
    
    // Add hover event listener for views
    imageContent.addEventListener('mouseenter', () => {
      if (hoverTimeouts.has(image.id)) {
        clearTimeout(hoverTimeouts.get(image.id));
      }
      
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
    
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.textContent = image.username;
    
    const avatar = document.createElement('img');
    avatar.className = 'user-avatar';
    avatar.src = `https://images.websim.ai/avatar/${image.username}`;
    avatar.alt = image.username;
    
    const viewsCounter = document.createElement('div');
    viewsCounter.className = 'views-counter';
    viewsCounter.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
      </svg>
      <span id="views_${image.id}">0</span>
    `;
    
    // Add click handler to show viewers
    viewsCounter.addEventListener('click', () => {
      showViewers(image.id);
    });
    
    const commentCounter = document.createElement('div');
    commentCounter.className = 'comment-counter';
    commentCounter.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
      </svg>
      <span id="comments_${image.id}">0</span>
    `;
    
    // Add click handler to show comments
    commentCounter.addEventListener('click', () => {
      showComments(image.id);
    });
    
    userInfo.appendChild(avatar);
    div.appendChild(imageContent);
    div.appendChild(userInfo);
    div.appendChild(viewsCounter);
    div.appendChild(commentCounter);
    container.appendChild(div);
  });
});

// Subscribe to views and update counters
room.collection('views').subscribe(views => {
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
});

// Handle comment submission
async function submitComment() {
  if (!currentImageId) return;
  
  const commentInput = document.getElementById('commentInput');
  const commentText = commentInput.value.trim();
  
  if (commentText) {
    await room.collection('comments').create({
      image_id: currentImageId,
      comment_text: commentText
    });
    
    commentInput.value = '';
    // Immediately update the comments UI after submitting
    updateCommentsUI(currentImageId);
  }
}

// Subscribe to comments and update counters
room.collection('comments').subscribe(comments => {
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
  
  // If comments modal is open, update the comments UI
  if (currentImageId) {
    updateCommentsUI(currentImageId);
  }
});

// Close modal when clicking outside or on close button
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('viewersModal');
  const closeBtn = document.getElementById('closeModal');
  
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    currentImageId = null; // Reset current image ID when closing modal
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      currentImageId = null; // Reset current image ID when closing modal
    }
  });
});