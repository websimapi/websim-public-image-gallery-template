// Views management
const hoverTimeouts = new Map();

async function createView(imageId) {
  await room.collection('views').create({
    image_id: imageId
  });
}

function calculateViews(imageId, views) {
  return views.filter(view => view.image_id === imageId).length;
}

function updateViewCounters(views) {
  const viewCounts = new Map();
  
  views.forEach(view => {
    const count = viewCounts.get(view.image_id) || 0;
    viewCounts.set(view.image_id, count + 1);
  });
  
  viewCounts.forEach((count, imageId) => {
    const counter = document.getElementById(`views_${imageId}`);
    if (counter) {
      counter.textContent = count;
    }
  });
}

function showViewers(imageId) {
  const viewersList = document.getElementById('viewersList');
  const views = room.collection('views').getList();
  
  const imageViews = views
    .filter(view => view.image_id === imageId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  
  viewersList.innerHTML = '';
  
  imageViews.forEach(view => {
    const viewerItem = document.createElement('div');
    viewerItem.className = 'viewer-item';
    viewerItem.innerHTML = `
      <img class="user-avatar" src="https://images.websim.ai/avatar/${view.username}" alt="${view.username}">
      <div class="viewer-info">
        <span class="viewer-name">${view.username}</span>
        <span class="view-time">${formatDate(view.created_at)}</span>
      </div>
    `;
    viewersList.appendChild(viewerItem);
  });
  
  document.getElementById('viewersModal').classList.add('show');
}