// Initialize WebSocket connection
const room = new WebsimSocket();

// Track hover timeouts to prevent multiple rapid views
const hoverTimeouts = new Map();

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

// Show image preview
function showImagePreview(imageUrl, imageId) {
  const modal = document.getElementById('imagePreviewModal');
  const previewImage = document.getElementById('previewImage');
  
  previewImage.style.backgroundImage = `url(${imageUrl})`;
  modal.classList.add('show');
  
  // Count as a view
  createView(imageId);
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
    
    // Add click handler for preview
    imageContent.addEventListener('click', () => {
      showImagePreview(image.text, image.id);
    });
    
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
    
    userInfo.appendChild(avatar);
    div.appendChild(imageContent);
    div.appendChild(userInfo);
    div.appendChild(viewsCounter);
    
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

// Close modal when clicking outside or on close button
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('viewersModal');
  const closeBtn = document.getElementById('closeModal');
  
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
    }
  });
  
  // Add preview modal close handlers
  const previewModal = document.getElementById('imagePreviewModal');
  const closePreviewBtn = document.getElementById('closePreview');
  
  closePreviewBtn.addEventListener('click', () => {
    previewModal.classList.remove('show');
  });
  
  previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) {
      previewModal.classList.remove('show');
    }
  });
});