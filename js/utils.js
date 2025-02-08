// Utility functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

async function downloadImage(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((pngBlob) => {
        const url = window.URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `image-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 'image/png');
    };
    
    img.src = URL.createObjectURL(blob);
    
  } catch (error) {
    console.error('Error downloading image:', error);
  }
}