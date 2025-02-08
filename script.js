// Initialize WebSocket connection
const room = new WebsimSocket();

// Function to fetch and upload image
async function uploadImage(imageUrl) {
  try {
    // Fetch the image
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Create a File object from the blob
    const file = new File([blob], 'image.jpg', { type: blob.type });
    
    // Upload to storage and get URL
    const uploadedUrl = await websim.upload(file);
    
    // Store in database
    await room.collection('images').create({
      originalUrl: imageUrl,
      storedUrl: uploadedUrl
    });
    
    return uploadedUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return imageUrl; // fallback to original URL if upload fails
  }
}

// Handle image creation
document.getElementById('createBtn').addEventListener('click', async () => {
  const imageUrl = document.getElementById('imageUrl').value.trim();
  
  if (imageUrl) {
    // Create image element
    const img = document.createElement('img');
    img.id = 'img_' + Date.now();
    
    // Upload image and set source
    const uploadedUrl = await uploadImage(imageUrl);
    img.src = uploadedUrl;
    img.alt = 'User created image';
    
    document.getElementById('imageContainer').appendChild(img);
    document.getElementById('imageUrl').value = '';
  }
});

// Subscribe to image changes in the database
room.collection('images').subscribe(images => {
  const container = document.getElementById('imageContainer');
  
  // Clear container and rebuild with latest data
  container.innerHTML = '';
  
  images.forEach(image => {
    const img = document.createElement('img');
    img.id = 'img_' + image.id;
    img.src = image.storedUrl;
    img.alt = 'User created image';
    container.appendChild(img);
  });
});