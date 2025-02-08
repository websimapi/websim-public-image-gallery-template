// Initialize WebSocket connection
const room = new WebsimSocket();

// Track which images have been hovered in current session
const hoveredImages = new Set();

// Handle image creation
document.getElementById('createBtn').addEventListener('click', async () => {
  const inputText = document.getElementById('imageUrl').value.trim();
  
  if (inputText) {
    // Create single image element with unique ID
    const img = document.createElement('img');
    img.id = 'img_' + Date.now();
    img.src = inputText;
    img.alt = inputText;
    
    // Listen for when the image loads and its src changes
    img.onload = async function() {
      if (img.src !== inputText) {
        try {
          const response = await fetch(img.src);
          const blob = await response.blob();
          const uploadedUrl = await websim.upload(blob);
          
          await room.collection('images').create({
            text: uploadedUrl,
            viewCount: 0
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

// Function to handle image view
const handleImageView = async (imageId) => {
  if (!hoveredImages.has(imageId)) {
    hoveredImages.add(imageId);
    
    try {
      // Create a view record
      await room.collection('image_views').create({
        image_id: imageId
      });
    } catch (error) {
      console.error('Error recording view:', error);
    }
  }
};

// Subscribe to image changes and views in the database
room.collection('images').subscribe(async images => {
  const container = document.getElementById('imageContainer');
  container.innerHTML = '';
  
  for (const image of images) {
    // Get view count for this image
    const views = await room.collection('image_views')
      .filter({ image_id: image.id })
      .getList();
    
    const viewCount = views.length;
    
    const div = document.createElement('div');
    div.id = 'img_' + image.id;
    div.className = 'image-box';
    
    const imageContent = document.createElement('div');
    imageContent.className = 'image-content';
    imageContent.style.backgroundImage = `url(${image.text})`;
    imageContent.setAttribute('title', image.text);
    
    // Add hover event listener
    imageContent.addEventListener('mouseenter', () => handleImageView(image.id));
    
    // Add view count
    const viewCountElement = document.createElement('div');
    viewCountElement.className = 'hover-count';
    viewCountElement.textContent = `${viewCount} views`;
    
    // Add user attribution
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.textContent = image.username;
    
    const avatar = document.createElement('img');
    avatar.className = 'user-avatar';
    avatar.src = `https://images.websim.ai/avatar/${image.username}`;
    avatar.alt = image.username;
    
    userInfo.appendChild(avatar);
    div.appendChild(imageContent);
    div.appendChild(viewCountElement);
    div.appendChild(userInfo);
    
    container.appendChild(div);
  }
});

// Subscribe to view changes to update counters in real-time
room.collection('image_views').subscribe(async () => {
  const images = await room.collection('images').getList();
  const container = document.getElementById('imageContainer');
  
  for (const image of images) {
    const views = await room.collection('image_views')
      .filter({ image_id: image.id })
      .getList();
    
    const viewCount = views.length;
    const viewCountElement = container.querySelector(`#img_${image.id} .hover-count`);
    if (viewCountElement) {
      viewCountElement.textContent = `${viewCount} views`;
    }
  }
});