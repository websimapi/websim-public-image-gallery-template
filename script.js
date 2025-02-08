import { room } from "./room.js";
import { setImages, setViews, setFilter } from "./gallery.js";
import { initModal, getCurrentImageId, updateCommentsUI } from "./modal.js";
import { submitComment } from "./comments.js";

// Expose submitComment to the global scope for the HTML button onclick
window.submitComment = submitComment;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize modal event listeners
  initModal();

  // Set up filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      setFilter(filter);
    });
  });

  // Handle image creation from user input
  document.getElementById('createBtn').addEventListener('click', async () => {
    const input = document.getElementById('imageUrl');
    const inputText = input.value.trim();
    if (!inputText) return;

    // Create an offscreen image element to validate and load the image
    const img = document.createElement('img');
    img.src = inputText;
    img.alt = inputText;
    img.onload = async function() {
      try {
        const response = await fetch(img.src);
        const blob = await response.blob();
        const uploadedUrl = await websim.upload(blob);
        await room.collection('images').create({
          text: uploadedUrl,
          prompt: inputText,
          username: room.party.client.username
        });
        img.remove();
      } catch (error) {
        console.error('Error processing image:', error);
      }
    };

    input.value = '';
  });

  // Subscriptions to keep the UI in sync with the latest records
  room.collection('images').subscribe(images => {
    setImages(images);
  });

  room.collection('views').subscribe(views => {
    setViews(views);
  });

  room.collection('comments').subscribe(comments => {
    // Update comment counters in the gallery
    const commentCounts = new Map();
    comments.forEach(comment => {
      const count = commentCounts.get(comment.image_id) || 0;
      commentCounts.set(comment.image_id, count + 1);
    });
    commentCounts.forEach((count, imageId) => {
      const counter = document.getElementById(`comments_${imageId}`);
      if (counter) counter.textContent = count;
    });
    // Update modal comments if one image is currently active
    const currentId = getCurrentImageId();
    if (currentId) {
      updateCommentsUI(currentId);
    }
  });
});