/* ============================================================
   ADMIN DASHBOARD - JavaScript
   ------------------------------------------------------------
   Purpose:
   - Password protection with "blackbelt" password
   - Load statistics from localStorage
   - Handle logout functionality
============================================================ */

// Admin password
const ADMIN_PASSWORD = 'blackbelt';
const AUTH_KEY = 'task_admin_authenticated';

// Check if already authenticated
document.addEventListener('DOMContentLoaded', function() {
  const isAuthenticated = sessionStorage.getItem(AUTH_KEY);
  
  if (isAuthenticated === 'true') {
    showAdminContent();
  }
  
  // Password form submission
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const passwordInput = document.getElementById('adminPassword');
      const errorMessage = document.getElementById('errorMessage');
      const password = passwordInput.value;
      
      if (password === ADMIN_PASSWORD) {
        // Correct password
        sessionStorage.setItem(AUTH_KEY, 'true');
        showAdminContent();
      } else {
        // Wrong password
        errorMessage.textContent = 'Incorrect password. Please try again.';
        errorMessage.classList.add('show');
        passwordInput.value = '';
        passwordInput.focus();
        
        // Shake animation
        setTimeout(() => {
          errorMessage.classList.remove('show');
        }, 3000);
      }
    });
  }
  
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      sessionStorage.removeItem(AUTH_KEY);
      location.reload();
    });
  }
  
  // Load statistics
  loadStatistics();
});

// Show admin content and hide password overlay
function showAdminContent() {
  const overlay = document.getElementById('passwordOverlay');
  const content = document.getElementById('adminContent');
  
  if (overlay && content) {
    overlay.style.display = 'none';
    content.style.display = 'block';
    
    // Animate content in
    setTimeout(() => {
      content.style.opacity = '0';
      content.style.transform = 'translateY(20px)';
      content.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      
      setTimeout(() => {
        content.style.opacity = '1';
        content.style.transform = 'translateY(0)';
      }, 50);
    }, 50);
  }
}

// Load statistics from localStorage
function loadStatistics() {
  // Total Students
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const totalStudentsEl = document.getElementById('totalStudents');
  if (totalStudentsEl) {
    totalStudentsEl.textContent = students.length;
    animateCounter(totalStudentsEl, 0, students.length, 1000);
  }
  
  // Today's Check-ins
  const checkins = JSON.parse(localStorage.getItem('checkins') || '[]');
  const today = new Date().toDateString();
  const todayCheckins = checkins.filter(c => new Date(c.date).toDateString() === today);
  const todayCheckinsEl = document.getElementById('todayCheckins');
  if (todayCheckinsEl) {
    todayCheckinsEl.textContent = todayCheckins.length;
    animateCounter(todayCheckinsEl, 0, todayCheckins.length, 1000);
  }
  
  // Total Techniques
  const techniques = JSON.parse(localStorage.getItem('techniques') || '[]');
  const totalTechniquesEl = document.getElementById('totalTechniques');
  if (totalTechniquesEl) {
    totalTechniquesEl.textContent = techniques.length;
    animateCounter(totalTechniquesEl, 0, techniques.length, 1000);
  }
  
  // Total Posts
  const posts = JSON.parse(localStorage.getItem('newsPosts') || '[]');
  const totalPostsEl = document.getElementById('totalPosts');
  if (totalPostsEl) {
    totalPostsEl.textContent = posts.length;
    animateCounter(totalPostsEl, 0, posts.length, 1000);
  }
}

// Animate counter from start to end
function animateCounter(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 16); // 60fps
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current);
  }, 16);
}

// Keyboard shortcut for admin access (Ctrl+Shift+A)
document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && e.key === 'A') {
    const isAuthenticated = sessionStorage.getItem(AUTH_KEY);
    if (isAuthenticated !== 'true') {
      const passwordInput = document.getElementById('adminPassword');
      if (passwordInput) {
        passwordInput.focus();
      }
    }
  }
});