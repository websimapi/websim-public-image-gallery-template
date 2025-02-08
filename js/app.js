// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
  // Initialize modal
  initializeModal();
  
  // Initialize filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => 
        b.classList.remove('active')
      );
      btn.classList.add('active');
      
      currentFilter = btn.getAttribute('data-filter');
      updateGallery();
    });
  });
  
  // Initialize create button
  document.getElementById('createBtn').addEventListener('click', async () => {
    const inputText = document.getElementById('imageUrl').value.trim();
    await createImage(inputText);
    document.getElementById('imageUrl').value = '';
  });
});