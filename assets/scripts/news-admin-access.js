/* ============================================================
   NEWS ADMIN ACCESS - Password Protection
   ------------------------------------------------------------
   Purpose:
   - Add password-protected admin access button to news.html
   - Redirect to admin dashboard on successful authentication
============================================================ */

document.addEventListener('DOMContentLoaded', function() {
  // Create admin access button
  const headerCard = document.querySelector('#archive .card.layered-soft');
  if (headerCard) {
    const adminSection = document.createElement('div');
    adminSection.style.marginTop = '20px';
    adminSection.innerHTML = `
      <button id="adminAccessBtn" class="btn navy" style="display: inline-flex; align-items: center; gap: 8px;">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="width: 20px; height: 20px; fill: currentColor;">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
        </svg>
        Admin Access
      </button>
    `;
    headerCard.appendChild(adminSection);
    
    // Create password modal
    const modal = document.createElement('div');
    modal.id = 'adminPasswordModal';
    modal.style.cssText = 'display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 9999; align-items: center; justify-content: center;';
    modal.innerHTML = `
      <div style="background: linear-gradient(135deg, rgba(31, 94, 161, 0.15) 0%, rgba(255, 255, 255, 0.95) 100%); backdrop-filter: blur(20px); border-radius: 20px; padding: 40px; max-width: 400px; width: 90%; border: 1px solid rgba(31, 94, 161, 0.3); box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);">
        <h2 style="font-family: 'Bebas Neue', sans-serif; font-size: 2rem; color: var(--task-500); margin: 0 0 20px; text-align: center;">Admin Access</h2>
        <p style="color: var(--task-500); margin-bottom: 20px; text-align: center;">Enter password to continue</p>
        <input type="password" id="adminPasswordInput" placeholder="Enter password" style="width: 100%; padding: 14px 16px; border-radius: 12px; border: 2px solid rgba(31, 94, 161, 0.2); background: rgba(255, 255, 255, 0.9); font-size: 1rem; margin-bottom: 16px; color: var(--task-500);">
        <div id="adminPasswordError" style="display: none; color: #C62828; background: rgba(244, 67, 54, 0.15); border: 1px solid rgba(244, 67, 54, 0.3); padding: 12px; border-radius: 10px; margin-bottom: 16px; text-align: center; font-weight: 600;"></div>
        <div style="display: flex; gap: 12px;">
          <button id="adminPasswordSubmit" class="btn" style="flex: 1;">Submit</button>
          <button id="adminPasswordCancel" class="btn" style="flex: 1; background: linear-gradient(135deg, #666, #444);">Cancel</button>
        </div>
        <p style="color: var(--task-500); font-size: 0.85rem; margin-top: 16px; text-align: center; opacity: 0.7;">Hint: The highest belt rank</p>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Event listeners
    const adminBtn = document.getElementById('adminAccessBtn');
    const passwordInput = document.getElementById('adminPasswordInput');
    const submitBtn = document.getElementById('adminPasswordSubmit');
    const cancelBtn = document.getElementById('adminPasswordCancel');
    const errorDiv = document.getElementById('adminPasswordError');
    
    adminBtn.addEventListener('click', () => {
      modal.style.display = 'flex';
      setTimeout(() => passwordInput.focus(), 100);
    });
    
    cancelBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      passwordInput.value = '';
      errorDiv.style.display = 'none';
    });
    
    // Close modal on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
        passwordInput.value = '';
        errorDiv.style.display = 'none';
      }
    });
    
    submitBtn.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') checkPassword();
    });
    
    function checkPassword() {
      const password = passwordInput.value;
      if (password === 'blackbelt') {
        window.location.href = './admin-dashboard.html';
      } else {
        errorDiv.textContent = 'Incorrect password. Please try again.';
        errorDiv.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
      }
    }
  }
});