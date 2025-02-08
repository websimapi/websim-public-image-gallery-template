// Initialize WebSocket connection
const room = new WebsimSocket();

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
          
          // Store in database with the uploaded URL
          await room.collection('images').create({
            text: uploadedUrl
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

// Subscribe to image changes in the database
room.collection('images').subscribe(images => {
  const container = document.getElementById('imageContainer');
  
  // Clear container and rebuild with latest data
  container.innerHTML = '';
  
  images.forEach(image => {
    const div = document.createElement('div');
    div.id = 'img_' + image.id;
    div.className = 'image-box';
    div.style.backgroundImage = `url(${image.text})`; // Use uploaded URL from database
    div.setAttribute('title', image.text); // Set title attribute for hover text
    
    // Add user attribution
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    userInfo.textContent = image.username;
    
    const avatar = document.createElement('img');
    avatar.className = 'user-avatar';
    avatar.src = `https://images.websim.ai/avatar/${image.username}`;
    avatar.alt = image.username;
    
    userInfo.appendChild(avatar);
    div.appendChild(userInfo);
    
    container.appendChild(div);
  });
});