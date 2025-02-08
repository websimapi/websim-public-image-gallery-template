// Comments management
let currentImageId = null;

async function submitComment() {
  if (!currentImageId) return;
  
  const commentInput = document.getElementById('commentInput');
  const commentText = commentInput.value.trim();
  
  if (commentText) {
    await room.collection('comments').create({
      image_id: currentImageId,
      comment_text: commentText
    });
    
    commentInput.value = '';
    updateCommentsUI(currentImageId);
  }
}

function updateCommentsUI(imageId) {
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
      <img class="user-avatar" src="https://images.websim.ai/avatar/${comment.username}" alt="${comment.username}">
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

function showComments(imageId) {
  currentImageId = imageId;
  updateCommentsUI(imageId);
  
  const tabs = document.querySelectorAll('.modal-tab');
  tabs.forEach(tab => tab.classList.remove('active'));
  document.querySelector('[data-section="commentsSection"]').classList.add('active');
  
  document.querySelectorAll('.modal-content-section').forEach(s => s.classList.remove('active'));
  document.getElementById('commentsSection').classList.add('active');
  
  document.getElementById('viewersModal').classList.add('show');
}

// Subscribe to comments
room.collection('comments').subscribe(comments => {
  const commentCounts = new Map();
  
  comments.forEach(comment => {
    const count = commentCounts.get(comment.image_id) || 0;
    commentCounts.set(comment.image_id, count + 1);
  });
  
  commentCounts.forEach((count, imageId) => {
    const counter = document.getElementById(`comments_${imageId}`);
    if (counter) {
      counter.textContent = count;
    }
  });
  
  if (currentImageId) {
    updateCommentsUI(currentImageId);
  }
});