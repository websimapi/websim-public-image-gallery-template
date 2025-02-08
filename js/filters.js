// Filtering functionality
let currentFilter = 'new';

function getFilteredImages() {
  const userUsername = room.party.client.username;
  
  switch(currentFilter) {
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