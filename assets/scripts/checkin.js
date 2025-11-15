/* ============================================================
   CHECK-IN SYSTEM FUNCTIONALITY
   ------------------------------------------------------------  
   - Student search and filtering
   - Touch-optimized check-in process
   - Real-time attendance tracking
   - Admin panel for class management
   - Local storage for data persistence
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  
  /* ===========================
     DATA MANAGEMENT
  =========================== */
  let students = [];
  let todayCheckins = [];
  let currentFilter = 'all';
  let currentClassType = 'kids';
  let searchTimeout;
  
  // Load data from localStorage
  function loadData() {
    const savedStudents = localStorage.getItem('taskStudents');
    if (savedStudents) {
      students = JSON.parse(savedStudents);
    } else {
      // Load demo students if no data exists
      students = getDemoStudents();
      saveStudents();
    }
    
    // Load today's check-ins
    const today = new Date().toDateString();
    const savedCheckins = localStorage.getItem('taskCheckins');
    if (savedCheckins) {
      const allCheckins = JSON.parse(savedCheckins);
      todayCheckins = allCheckins.filter(checkin => 
        new Date(checkin.timestamp).toDateString() === today
      );
    }
    
    loadCurrentClassType();
    updateStats();
    renderStudents();
    renderRecentCheckins();
  }
  
  function getDemoStudents() {
    return [
      {
        id: '1',
        firstName: 'Alex',
        lastName: 'Johnson',
        belt: 'orange',
        stripes: 2,
        program: 'kids',
        status: 'active'
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Miller',
        belt: 'green',
        stripes: 3,
        program: 'teens',
        status: 'active'
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Davis',
        belt: 'yellow',
        stripes: 1,
        program: 'kids',
        status: 'active'
      },
      {
        id: '4',
        firstName: 'Emma',
        lastName: 'Wilson',
        belt: 'blue',
        stripes: 2,
        program: 'adults',
        status: 'active'
      },
      {
        id: '5',
        firstName: 'James',
        lastName: 'Brown',
        belt: 'white',
        stripes: 0,
        program: 'kids',
        status: 'active'
      },
      {
        id: '6',
        firstName: 'Olivia',
        lastName: 'Taylor',
        belt: 'purple',
        stripes: 3,
        program: 'teens',
        status: 'active'
      }
    ];
  }
  
  /* ===========================
     INITIALIZATION
  =========================== */
  function initialize() {
    setupEventListeners();
    startTimeUpdates();
    loadData();
    
    // Focus search input on load (good for iPad kiosk)
    setTimeout(() => {
      document.getElementById('studentSearch').focus();
    }, 500);
  }
  
  function setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('studentSearch');
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        checkInFirstStudent();
      }
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', handleFilter);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
  }
  
  /* ===========================
     SEARCH AND FILTERING
  =========================== */
  function handleSearch(e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.toLowerCase().trim();
      filterAndRenderStudents(searchTerm);
    }, 300);
  }
  
  function handleFilter(e) {
    // Remove active class from all buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    e.target.classList.add('active');
    
    currentFilter = e.target.dataset.filter;
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase().trim();
    filterAndRenderStudents(searchTerm);
  }
  
  function filterAndRenderStudents(searchTerm) {
    let filteredStudents = students;
    
    // Apply program filter
    if (currentFilter !== 'all') {
      filteredStudents = filteredStudents.filter(student => 
        student.program === currentFilter
      );
    }
    
    // Apply search filter
    if (searchTerm) {
      filteredStudents = filteredStudents.filter(student =>
        student.firstName.toLowerCase().includes(searchTerm) ||
        student.lastName.toLowerCase().includes(searchTerm) ||
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm)
      );
    }
    
    renderStudents(filteredStudents);
  }
  
  /* ===========================
   STUDENT RENDERING
  =========================== */
  function renderStudents(studentsToRender = students) {
    const grid = document.getElementById('studentsGrid');
    const noResults = document.getElementById('noResults');
    
    if (studentsToRender.length === 0) {
      grid.style.display = 'none';
      noResults.style.display = 'block';
      return;
    }
    
    grid.style.display = 'grid';
    noResults.style.display = 'none';
    
    grid.innerHTML = '';
    
    studentsToRender.forEach((student, index) => {
      const card = createStudentCard(student);
      card.style.animationDelay = `${index * 0.05}s`;
      grid.appendChild(card);
    });
  }
  
  function createStudentCard(student) {
    const isCheckedIn = todayCheckins.some(checkin => checkin.studentId === student.id);
    const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
    
    const card = document.createElement('div');
    card.className = `student-card ${isCheckedIn ? 'checked-in' : ''}`;
    card.dataset.studentId = student.id;
    
    card.innerHTML = `
      ${isCheckedIn ? '<div class="checked-in-badge"><i class="fas fa-check"></i> Checked In</div>' : ''}
      <div class="student-header">
        <div class="student-avatar">${initials}</div>
        <div class="student-info">
          <h3>${student.firstName} ${student.lastName}</h3>
          <p>${getProgramDisplayName(student.program)}</p>
        </div>
      </div>
      <div class="student-belt">
        <span>${student.belt.charAt(0).toUpperCase() + student.belt.slice(1)} Belt</span>
        <span>• ${student.stripes} Stripe${student.stripes !== 1 ? 's' : ''}</span>
      </div>
      <div class="belt-strip">
        <div class="belt-progress" style="width: ${(parseInt(student.stripes) + 1) * 20}%"></div>
      </div>
    `;
    
    if (!isCheckedIn) {
      card.addEventListener('click', () => checkInStudent(student));
    }
    
    return card;
  }
  
  function getProgramDisplayName(program) {
    const displayNames = {
      'kids': 'Kids Karate',
      'teens': 'Teens & Adults',
      'adults': 'Teens & Adults',
      'eskrima': 'IS3 Eskrima',
      'weapons': 'Weapons'
    };
    return displayNames[program] || program;
  }
  
  /* ===========================
     CHECK-IN FUNCTIONALITY
  =========================== */
  function checkInStudent(student) {
    // Check if already checked in
    if (todayCheckins.some(checkin => checkin.studentId === student.id)) {
      return;
    }
    
    // Create check-in record
    const checkin = {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      belt: student.belt,
      program: student.program,
      classType: currentClassType,
      timestamp: new Date().toISOString()
    };
    
    // Add to today's check-ins
    todayCheckins.push(checkin);
    
    // Save to localStorage
    saveCheckins();
    
    // Update student's attendance record
    updateStudentAttendance(student.id);
    
    // Show success animation
    showCheckinSuccess(student);
    
    // Update UI
    updateStats();
    renderStudents();
    renderRecentCheckins();
    
    // Haptic feedback (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  }
  
  function updateStudentAttendance(studentId) {
    const student = students.find(s => s.id === studentId);
    if (student) {
      student.classesAttended = (student.classesAttended || 0) + 1;
      student.lastAttendance = new Date().toISOString();
      
      // Update attendance streak (simplified logic)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (student.lastAttendanceDate) {
        const lastDate = new Date(student.lastAttendanceDate);
        if (lastDate.toDateString() === yesterday.toDateString()) {
          student.attendanceStreak = (student.attendanceStreak || 0) + 1;
        } else if (lastDate.toDateString() !== new Date().toDateString()) {
          student.attendanceStreak = 1;
        }
      } else {
        student.attendanceStreak = 1;
      }
      student.lastAttendanceDate = new Date().toDateString();
      
      saveStudents();
    }
  }
  
  function checkInFirstStudent() {
    const visibleCards = document.querySelectorAll('.student-card:not(.checked-in)');
    if (visibleCards.length > 0) {
      const firstCard = visibleCards[0];
      const studentId = firstCard.dataset.studentId;
      const student = students.find(s => s.id === studentId);
      if (student) {
        checkInStudent(student);
      }
    }
  }
  
  function showCheckinSuccess(student) {
    const successDiv = document.getElementById('checkinSuccess');
    const messageEl = document.getElementById('successMessage');
    
    messageEl.textContent = `Welcome back, ${student.firstName}!`;
    successDiv.style.display = 'block';
    
    // Auto-hide after 2 seconds
    setTimeout(() => {
      successDiv.style.display = 'none';
    }, 2000);
    
    // Sound effect (optional)
    playSuccessSound();
  }
  
  function playSuccessSound() {
    // Create a simple success sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }
  
  /* ===========================
     RECENT CHECK-INS
  =========================== */
  function renderRecentCheckins() {
    const container = document.getElementById('recentCheckins');
    
    // Sort by timestamp (most recent first)
    const sortedCheckins = [...todayCheckins].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    ).slice(0, 10); // Show last 10
    
    if (sortedCheckins.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--muted);">No check-ins yet today</p>';
      return;
    }
    
    container.innerHTML = sortedCheckins.map(checkin => {
      const time = new Date(checkin.timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return `
        <div class="checkin-item">
          <span class="checkin-name">${checkin.studentName}</span>
          <span class="checkin-time">${time}</span>
        </div>
      `;
    }).join('');
  }
  
  /* ===========================
     STATISTICS
  =========================== */
  function updateStats() {
    // Today's count
    document.getElementById('todayCount').textContent = todayCheckins.length;
    
    // This week's count (simplified)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekCheckins = getCheckinsSince(weekStart);
    document.getElementById('weekCount').textContent = weekCheckins.length;
    
    // This month's count
    const monthStart = new Date();
    monthStart.setDate(1);
    const monthCheckins = getCheckinsSince(monthStart);
    document.getElementById('monthCount').textContent = monthCheckins.length;
    
    // Current class count
    const currentClassCheckins = todayCheckins.filter(checkin => 
      checkin.classType === currentClassType
    );
    document.getElementById('currentClassCount').textContent = currentClassCheckins.length;
    document.getElementById('currentClassType').textContent = getProgramDisplayName(currentClassType);
  }
  
  function getCheckinsSince(date) {
    const allCheckins = JSON.parse(localStorage.getItem('taskCheckins') || '[]');
    return allCheckins.filter(checkin => 
      new Date(checkin.timestamp) >= date
    );
  }
  
  /* ===========================
     ADMIN PANEL
  =========================== */
  window.showAdminPanel = function() {
    document.getElementById('adminPanel').style.display = 'flex';
    updateAdminStats();
  };
  
  window.hideAdminPanel = function() {
    document.getElementById('adminPanel').style.display = 'none';
  };
  
  function updateAdminStats() {
    document.getElementById('summaryTotal').textContent = todayCheckins.length;
    
    const uniqueStudents = new Set(todayCheckins.map(checkin => checkin.studentId));
    document.getElementById('summaryUnique').textContent = uniqueStudents.size;
    
    // Set current class type in dropdown
    document.getElementById('classTypeSelect').value = currentClassType;
  }
  
  window.updateCurrentClass = function() {
    currentClassType = document.getElementById('classTypeSelect').value;
    localStorage.setItem('taskCurrentClassType', currentClassType);
    
    updateStats();
    hideAdminPanel();
    showNotification('Class type updated successfully!');
  };
  
  window.exportTodayAttendance = function() {
    const exportData = {
      date: new Date().toISOString().split('T')[0],
      classType: currentClassType,
      totalCheckins: todayCheckins.length,
      uniqueStudents: new Set(todayCheckins.map(checkin => checkin.studentId)).size,
      checkins: todayCheckins.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `task-attendance-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Attendance data exported successfully!');
  };
  
  window.viewAttendanceReport = function() {
    // Simple report - could be enhanced with charts
    const uniqueStudents = new Set(todayCheckins.map(checkin => checkin.studentId));
    const report = `
      Attendance Report - ${new Date().toLocaleDateString()}
      
      Total Check-ins: ${todayCheckins.length}
      Unique Students: ${uniqueStudents.size}
      Current Class: ${getProgramDisplayName(currentClassType)}
      
      Check-ins by program:
      ${getCheckinsByProgram()}
    `;
    
    alert(report);
  };
  
  window.clearTodayData = function() {
    if (confirm('Are you sure you want to clear today\'s check-in data? This cannot be undone.')) {
      todayCheckins = [];
      saveCheckins();
      updateStats();
      renderStudents();
      renderRecentCheckins();
      hideAdminPanel();
      showNotification('Today\'s data has been cleared!');
    }
  };
  
  function getCheckinsByProgram() {
    const programCounts = {};
    todayCheckins.forEach(checkin => {
      programCounts[checkin.program] = (programCounts[checkin.program] || 0) + 1;
    });
    
    return Object.entries(programCounts)
      .map(([program, count]) => `  ${getProgramDisplayName(program)}: ${count}`)
      .join('\n');
  }
  
  /* ===========================
     DATA PERSISTENCE
  =========================== */
  function saveStudents() {
    localStorage.setItem('taskStudents', JSON.stringify(students));
  }
  
  function saveCheckins() {
    const allCheckins = JSON.parse(localStorage.getItem('taskCheckins') || '[]');
    
    // Remove today's existing check-ins and add new ones
    const today = new Date().toDateString();
    const filteredCheckins = allCheckins.filter(checkin => 
      new Date(checkin.timestamp).toDateString() !== today
    );
    
    const updatedCheckins = [...filteredCheckins, ...todayCheckins];
    localStorage.setItem('taskCheckins', JSON.stringify(updatedCheckins));
  }
  
  function loadCurrentClassType() {
    const saved = localStorage.getItem('taskCurrentClassType');
    if (saved) {
      currentClassType = saved;
    }
  }
  
  /* ===========================
     UTILITY FUNCTIONS
  =========================== */
  function startTimeUpdates() {
    updateTime();
    setInterval(updateTime, 1000);
  }
  
  function updateTime() {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    document.getElementById('currentTime').textContent = now.toLocaleDateString('en-US', options);
  }
  
  function showNotification(message) {
    // Create a simple notification (could be enhanced)
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
      z-index: 9999;
      font-weight: 600;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
  
  function handleKeyboardNavigation(e) {
    // Number keys to quickly filter
    if (e.key >= '1' && e.key <= '4') {
      const filters = ['all', 'kids', 'teens', 'adults'];
      const index = parseInt(e.key) - 1;
      if (filters[index]) {
        const filterBtn = document.querySelector(`[data-filter="${filters[index]}"]`);
        if (filterBtn) {
          filterBtn.click();
        }
      }
    }
    
    // Escape to close admin panel
    if (e.key === 'Escape') {
      hideAdminPanel();
    }
    
    // Ctrl+A or Cmd+A for admin panel
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      showAdminPanel();
    }
  }
  
  // Initialize the application
  initialize();
});

/* ===========================
   TOUCH ENHANCEMENTS
  =========================== */
// Add touch feedback for mobile devices
if ('ontouchstart' in window) {
  document.addEventListener('touchstart', function(e) {
    if (e.target.closest('.student-card:not(.checked-in)')) {
      e.target.closest('.student-card').style.transform = 'translateY(-2px) scale(1.02)';
    }
  }, { passive: true });
  
  document.addEventListener('touchend', function(e) {
    if (e.target.closest('.student-card')) {
      setTimeout(() => {
        e.target.closest('.student-card').style.transform = '';
      }, 150);
    }
  }, { passive: true });
}