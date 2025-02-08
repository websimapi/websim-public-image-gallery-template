// Gallery management
function updateGallery() {
  const container = document.getElementById('imageContainer');
  container.innerHTML = '';
  
  const filteredImages = getFilteredImages();
  
  filteredImages.forEach(image => {
    const div = document.createElement('div');
    div.id = 'img_' + image.id;
    div.className = 'image-box';
    
    const imageContent = document.createElement('div');
    imageContent.className = 'image-content';
    imageContent.style.backgroundImage = `url(${image.text})`;
    imageContent.setAttribute('title', image.prompt || image.text);
    
    imageContent.addEventListener('mouseenter', () => {
      if (hoverTimeouts.has(image.id)) {
        clearTimeout(hoverTimeouts.get(image.id));
      }
      
      const timeout = setTimeout(() => {
        createView(image.id);
      }, 500);
      
      hoverTimeouts.set(image.id, timeout);
    });
    
    imageContent.addEventListener('mouseleave', () => {
      if (hoverTimeouts.has(image.id)) {
        clearTimeout(hoverTimeouts.get(image.id));
        hoverTimeouts.delete(image.id);
      }
    });
    
    imageContent.addEventListener('click', () => {
      showFullscreenImage(image.text, image.prompt);
    });

    const userInfo = createUserInfo(image);
    const viewsCounter = createViewsCounter(image);
    const commentCounter = createCommentCounter(image);
    const downloadCounter = createDownloadCounter(image);

    div.appendChild(imageContent);
    div.appendChild(userInfo);
    div.appendChild(viewsCounter);
    div.appendChild(commentCounter);
    div.appendChild(downloadCounter);
    container.appendChild(div);
  });
  
  updateViewCounters(cachedViews);
}

function createUserInfo(image) {
  const userInfo = document.createElement('div');
  userInfo.className = 'user-info';

  const copyButton = document.createElement('button');
  copyButton.className = 'copy-prompt-btn';
  copyButton.innerHTML = `
    <svg viewBox="0 0 24 24" width="16" height="16">
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
    </svg>
  `;
  copyButton.title = "Copy prompt to input";
  copyButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const input = document.getElementById('imageUrl');
    input.value = image.prompt || image.text;
    input.focus();
    input.scrollIntoView({ behavior: 'smooth' });
  });

  const avatar = document.createElement('img');
  avatar.className = 'user-avatar';
  avatar.src = `https://images.websim.ai/avatar/${image.username}`;
  avatar.alt = image.username;

  userInfo.appendChild(copyButton);
  userInfo.appendChild(document.createTextNode(image.username));
  userInfo.appendChild(avatar);

  return userInfo;
}

function createViewsCounter(image) {
  const viewsCounter = document.createElement('div');
  viewsCounter.className = 'views-counter';
  viewsCounter.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
    </svg>
    <span id="views_${image.id}">${calculateViews(image.id, cachedViews)}</span>
  `;
  
  viewsCounter.addEventListener('click', () => {
    showViewers(image.id);
  });
  
  return viewsCounter;
}

function createCommentCounter(image) {
  const commentCounter = document.createElement('div');
  commentCounter.className = 'comment-counter';
  commentCounter.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>
    </svg>
    <span id="comments_${image.id}">0</span>
  `;
  
  commentCounter.addEventListener('click', () => {
    showComments(image.id);
  });
  
  return commentCounter;
}

function createDownloadCounter(image) {
  const downloadCounter = document.createElement('div');
  downloadCounter.className = 'download-counter';
  downloadCounter.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
    </svg>
  `;
  
  downloadCounter.addEventListener('click', (e) => {
    e.stopPropagation();
    downloadImage(image.text);
  });
  
  return downloadCounter;
}