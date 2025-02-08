// Initialize WebSocket connection
const room = new WebsimSocket();

// Track hover timeouts to prevent multiple rapid hover counts
const hoverTimeouts = new Map();

// Handle image creation
document.getElementById('createBtn').addEventListener('click', async () => {
  const inputText = document.getElementById('imageUrl').value.trim();
  
  if (inputText) {
    // Create single image element with unique ID
    const img = document.createElement('img');
    img.id = 'img_' + Date.now();
    img.src = inputText; // Set src to exact input text
    img.alt = inputText; // Set alt to exact input text
    
    // Listen for when the image loads and its src changes
    img.onload = async function() {
      if (img.src !== inputText) { // Check if src changed from original text
        try {
          // Convert image to blob
          const response = await fetch(img.src);
          const blob = await response.blob();
          
          // Upload to websim storage
          const uploadedUrl = await websim.upload(blob);
          
          // Store in database with the uploaded URL and initialize hover count
          await room.collection('images').create({
            text: uploadedUrl,
            hoverCount: 0
          });
          
          // Remove the temporary img element since we'll display from database
          img.remove();
        } catch (error) {
          console.error('Error processing image:', error);
        }
      }
    };
    
    // Clear input and add temporary image to container
    document.getElementById('imageUrl').value = '';
    document.getElementById('imageContainer').appendChild(img);
  }
});

// Function to handle hover event with debounce
const handleImageHover = async (imageId) => {
  // Clear any existing timeout for this image
  if (hoverTimeouts.has(imageId)) {
    clearTimeout(hoverTimeouts.get(imageId));
  }
  
  // Set a new timeout
  hoverTimeouts.set(imageId, setTimeout(async () => {
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
    hoverTimeouts.delete(imageId);
  }, 500)); // Debounce time of 500ms
};

// Subscribe to image changes in the database
room.collection('images').subscribe(images => {
  const container = document.getElementById('imageContainer');
  
  // Clear container and rebuild with latest data
  container.innerHTML = '';
  
  images.forEach(image => {
    const div = document.createElement('div');
    div.id = 'img_' + image.id;
    div.className = 'image-box';
    
    // Create inner div for image content
    const imageContent = document.createElement('div');
    imageContent.className = 'image-content';
    imageContent.style.backgroundImage = `url(${image.text})`; // Use uploaded URL from database
    imageContent.setAttribute('title', image.text); // Set title attribute for hover text
    
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