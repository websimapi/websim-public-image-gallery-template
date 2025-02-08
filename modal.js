import { formatDate } from "./utils.js";
import { room } from "./room.js";

let currentImageId = null;

export function getCurrentImageId() {
  return currentImageId;
}

export function initModal() {
  const modal = document.getElementById('viewersModal');
  const closeBtn = document.getElementById('closeModal');
  const tabs = document.querySelectorAll('.modal-tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.modal-content-section').forEach(s => s.classList.remove('active'));
      const section = tab.getAttribute('data-section');
      document.getElementById(section).classList.add('active');
    });
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    currentImageId = null;
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      currentImageId = null;
    }
  });
}

export function showViewers(imageId) {
  const modal = document.getElementById('viewersModal');
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
      <img class="user-avatar" src="https://images.websim.ai/avatar/${view.username}" alt="${view.username}" />
      <div class="viewer-info">
        <span class="viewer-name">${view.username}</span>
        <span class="view-time">${formatDate(view.created_at)}</span>
      </div>
    `;
    viewersList.appendChild(viewerItem);
  });
  document.querySelectorAll('.modal-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.modal-content-section').forEach(s => s.classList.remove('active'));
  document.querySelector('[data-section="viewersList"]').classList.add('active');
  document.getElementById('viewersList').classList.add('active');
  modal.classList.add('show');
}

export function showComments(imageId) {
  currentImageId = imageId;
  updateCommentsUI(imageId);
  document.querySelectorAll('.modal-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.modal-content-section').forEach(s => s.classList.remove('active'));
  document.querySelector('[data-section="commentsSection"]').classList.add('active');
  document.getElementById('commentsSection').classList.add('active');
  const modal = document.getElementById('viewersModal');
  modal.classList.add('show');
}

export function updateCommentsUI(imageId) {
  const commentsList = document.getElementById('commentsList');
  const comments = room.collection('comments').getList();
  const imageComments = comments
    .filter(comment => comment.image_id === imageId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  commentsList.innerHTML = '';
  imageComments.forEach(comment => {
    const commentItem = document.createElement('div');
    commentItem.className = 'comment-item';
    commentItem.innerHTML = `
      <img class="user-avatar" src="https://images.websim.ai/avatar/${comment.username}" alt="${comment.username}" />
      <div class="comment-content">
        <div class="comment-header">
          <span class="comment-author">${comment.username}</span>
          <span class="comment-time">${formatDate(comment.created_at)}</span>
        </div>
        <div class="comment-text">${comment.comment_text}</div>
      </div>
    `;
    commentsList.appendChild(commentItem);
  });
}

export { updateCommentsUI };