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
    
    // Store in database
    await room.collection('images').create({
      text: inputText
    });
    
    // Clear input and add image to container
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
    div.style.backgroundImage = `url(${image.text})`; // Use exact text from database as background-image
    div.setAttribute('title', image.text); // Set title attribute for hover text
    container.appendChild(div);
  });
});