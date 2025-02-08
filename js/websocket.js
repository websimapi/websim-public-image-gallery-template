export function initializeWebSocket() {
  const room = new WebsimSocket();
  return room;
}

export function calculateViews(imageId, views) {
  return views.filter(view => view.image_id === imageId).length;
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}