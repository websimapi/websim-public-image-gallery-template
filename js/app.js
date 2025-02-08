import { initializeWebSocket } from './websocket.js';
import { setupImageCreation } from './imageCreation.js';
import { setupGalleryFilters } from './filters.js';
import { setupModalHandlers } from './modal.js';
import { setupFullscreenViewer } from './fullscreenViewer.js';

document.addEventListener('DOMContentLoaded', async () => {
  const room = await initializeWebSocket();
  setupImageCreation(room);
  setupGalleryFilters(room);
  setupModalHandlers();
  setupFullscreenViewer();
});