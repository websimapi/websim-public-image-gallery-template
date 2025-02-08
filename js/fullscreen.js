// Fullscreen viewer functionality
function showFullscreenImage(imageUrl, prompt) {
  let viewer = document.getElementById('fullscreenViewer');
  if (!viewer) {
    viewer = document.createElement('div');
    viewer.id = 'fullscreenViewer';
    viewer.className = 'fullscreen-viewer';
    document.body.appendChild(viewer);
    
    viewer.addEventListener('click', (e) => {
      if (e.target === viewer) {
        viewer.classList.remove('show');
      }
    });
  }
  
  viewer.innerHTML = `
    <img src="${imageUrl}" class="fullscreen-image" alt="${prompt || 'Image'}">
    ${prompt ? `<div class="fullscreen-prompt">${prompt}</div>` : ''}
  `;
  
  viewer.classList.add('show');
}