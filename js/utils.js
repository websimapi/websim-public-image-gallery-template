// Format date for displaying in UI
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Parse URL parameters
export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
}

// Create shareable URL
export function createShareableUrl(params) {
  const url = new URL(window.baseUrl || window.location.origin + window.location.pathname);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, value);
    }
  });
  
  return url.toString();
}