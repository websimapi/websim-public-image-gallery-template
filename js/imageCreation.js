export function setupImageCreation(room) {
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
              text: uploadedUrl,
              prompt: inputText
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
}