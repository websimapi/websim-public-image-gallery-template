document.getElementById('createBtn').addEventListener('click', () => {
  const imageUrl = document.getElementById('imageUrl').value.trim();
  
  if (imageUrl) {
    const img = document.createElement('img');
    img.id = 'img_' + Date.now(); // Create unique ID using timestamp
    img.src = imageUrl;
    img.alt = 'User created image';
    
    document.getElementById('imageContainer').appendChild(img);
    document.getElementById('imageUrl').value = ''; // Clear input
  }
});