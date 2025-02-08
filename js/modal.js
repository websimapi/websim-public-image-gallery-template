// Modal functionality
function initializeModal() {
  const modal = document.getElementById('viewersModal');
  const closeBtn = document.getElementById('closeModal');
  const tabs = document.querySelectorAll('.modal-tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const section = tab.getAttribute('data-section');
      
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      document.querySelectorAll('.modal-content-section').forEach(s => s.classList.remove('active'));
      document.getElementById(section).classList.add('active');
    });
  });
  
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    currentImageId = null;
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      currentImageId = null;
    }
  });
}