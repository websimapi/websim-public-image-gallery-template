// Initialize WebSocket connection
const room = new WebsimSocket();

// Track hover timeouts to prevent multiple rapid hover counts
const hoverTimeouts = new Map();
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
            hoverCount: 0
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

// Function to handle hover event with debounce
const handleImageHover = async (imageId) => {
  // Only increment if we haven't hovered this image in this session
  if (!hoveredImages.has(imageId)) {
    hoveredImages.add(imageId);
    
    try {
      const image = await room.collection('images').get(imageId);
      if (image) {
        // Update the hover count
        await room.collection('images').update(imageId, {
          hoverCount: (image.hoverCount || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error updating hover count:', error);
    }
  }
};

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
    
    // Add hover event listener
    imageContent.addEventListener('mouseenter', () => handleImageHover(image.id));
    
    // Add hover count
    const hoverCount = document.createElement('div');
    hoverCount.className = 'hover-count';
    hoverCount.textContent = `${image.hoverCount || 0} views`;
    
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
    div.appendChild(hoverCount);
    div.appendChild(userInfo);
    
    container.appendChild(div);
  });
});