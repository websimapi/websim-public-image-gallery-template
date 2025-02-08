// WebSocket connection and data management
const room = new WebsimSocket();
let cachedImages = [];
let cachedViews = [];

// Subscribe to image changes
room.collection('images').subscribe(images => {
  cachedImages = images;
  updateGallery();
});

// Subscribe to views
room.collection('views').subscribe(views => {
  cachedViews = views;
  updateViewCounters(views);
});

// Create new image
async function createImage(inputText) {
  if (!inputText) return;
  
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
          text: uploadedUrl,
          prompt: inputText
        });
        
        img.remove();
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }
  };
}