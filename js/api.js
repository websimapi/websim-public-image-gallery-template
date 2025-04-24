// Initialize WebSocket connection
const room = new WebsimSocket();

// Cache for data
let cachedImages = [];
let cachedViews = [];

// Subscribes to image changes
export function subscribeToImages(callback) {
  room.collection('images').subscribe(callback);
}

// Subscribes to view changes
export function subscribeToViews(callback) {
  room.collection('views').subscribe(callback);
}

// Subscribes to comment changes
export function subscribeToComments(callback) {
  room.collection('comments').subscribe(callback);
}

// Creates a new image record
export async function createImage(promptText) {
  // Use the AI image generation route
  const result = await websim.imageGen({
    prompt: promptText,
    aspect_ratio: "1:1"
  });
  
  if (result && result.url) {
    // Create the record with both the generated image URL and original prompt
    return await room.collection('images').create({
      text: result.url,
      prompt: promptText
    });
  }
  throw new Error('Failed to generate image');
}

// Creates a view record
export async function createView(imageId) {
  return await room.collection('views').create({
    image_id: imageId
  });
}

// Creates a comment record
export async function createComment(imageId, commentText) {
  return await room.collection('comments').create({
    image_id: imageId,
    comment_text: commentText
  });
}

// Gets filtered images based on the current filter
export function getFilteredImages(filter) {
  const userUsername = room.party.client.username;
  
  switch(filter) {
    case 'new':
      return [...cachedImages].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
    case 'hot':
      return [...cachedImages].sort((a, b) => {
        const viewsA = calculateViews(a.id, cachedViews);
        const viewsB = calculateViews(b.id, cachedViews);
        return viewsB - viewsA;
      });
      
    case 'recent':
      const recentlyViewed = new Map();
      cachedViews.forEach(view => {
        recentlyViewed.set(view.image_id, 
          Math.max(new Date(view.created_at).getTime(), 
            recentlyViewed.get(view.image_id) || 0)
        );
      });
      
      return [...cachedImages].filter(img => recentlyViewed.has(img.id))
        .sort((a, b) => recentlyViewed.get(b.id) - recentlyViewed.get(a.id));
      
    case 'yours':
      return cachedImages.filter(img => img.username === userUsername);
      
    default:
      return cachedImages;
  }
}

// Calculate views for an image
export function calculateViews(imageId, views = cachedViews) {
  return views.filter(view => view.image_id === imageId).length;
}

// Get comments for a specific image
export function getImageComments(imageId) {
  const comments = room.collection('comments').getList();
  return comments.filter(comment => comment.image_id === imageId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// Get all comments
export function getComments() {
  return room.collection('comments').getList();
}

// Set cached images
export function setCachedImages(images) {
  cachedImages = images;
}

// Set cached views
export function setCachedViews(views) {
  cachedViews = views;
}

// Get cached views
export function getCachedViews() {
  return cachedViews;
}