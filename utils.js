import { room } from "./room.js";

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

export function calculateViews(imageId, views) {
  return views.filter(view => view.image_id === imageId).length;
}

export async function createView(imageId) {
  try {
    await room.collection('views').create({ image_id: imageId });
  } catch (error) {
    console.error('Error creating view:', error);
  }
}