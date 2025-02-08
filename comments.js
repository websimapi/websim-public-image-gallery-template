import { room } from "./room.js";
import { updateCommentsUI, getCurrentImageId } from "./modal.js";

export async function submitComment() {
  const currentId = getCurrentImageId();
  if (!currentId) return;
  const commentInput = document.getElementById('commentInput');
  const commentText = commentInput.value.trim();
  if (commentText) {
    try {
      await room.collection('comments').create({
        image_id: currentId,
        comment_text: commentText,
        username: room.party.client.username
      });
      commentInput.value = '';
      updateCommentsUI(currentId);
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  }
}