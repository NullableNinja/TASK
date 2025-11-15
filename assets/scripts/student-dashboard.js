/* ============================================================
   STUDENT DASHBOARD FUNCTIONALITY
   ------------------------------------------------------------  
   - Progress tracking and visualization
   - Attendance management
   - Achievement system
   - Belt progression
   - Technique library integration
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  
  /* ===========================
     LOAD DYNAMIC STUDENT DATA
  =========================== */
  // Get selected student ID
  const studentId = window.StudentSelector.getSelectedStudentId();
  
  // Load student data
  let studentData = window.StudentSelector.loadStudentById(studentId);
  
  // Calculate training duration
  if (studentData.dateJoined) {
    studentData.trainingDuration = window.StudentSelector.calculateTrainingDuration(studentData.dateJoined);
  } else {
    studentData.trainingDuration = 18; // Default
  }
  
  // Ensure stats exist
  if (!studentData.stats) {
    studentData.stats = {
      classesAttended: 0,
      practiceHours: 0,
      techniquesLearned: 0,
      tournamentsWon: 0,
      currentStreak: 0
    };
  }
  
  // Ensure attendance exists
  if (!studentData.attendance || studentData.attendance.length === 0) {
    studentData.attendance = generateMockAttendance();
  }
  
  // Ensure achievements exist
  if (!studentData.achievements) {
    studentData.achievements = [
      { id: 'first-steps', name: 'First Steps', earned: true, progress: 100, icon: '🥋' },
      { id: 'dedicated-student', name: 'Dedicated Student', earned: true, progress: 100, icon: '⭐' },
      { id: 'perfect-attendance', name: 'Perfect Attendance', earned: false, progress: 85, icon: '📅' },
      { id: 'technique-master', name: 'Technique Master', earned: true, progress: 100, icon: '🎯' },
      { id: 'tournament-champion', name: 'Tournament Champion', earned: false, progress: 60, icon: '🏆' },
      { id: 'black-belt-journey', name: 'Black Belt Journey', earned: false, progress: 35, icon: '🥇' }
    ];
  }
  
  // Ensure techniques exist
  if (!studentData.techniques) {
    studentData.techniques = [
      { id: 'front-punch', name: 'Front Punch', status: 'learned', category: 'strikes' },
      { id: 'low-block', name: 'Low Block', status: 'in-progress', category: 'blocks' },
      { id: 'front-kick', name: 'Front Kick', status: 'locked', category: 'kicks' }
    ];
  }
  
  /* ===========================
     INITIALIZATION
  =========================== */
  function initialize() {
    // Initialize student selector dropdown
    window.StudentSelector.initializeStudentSelector();
    
    loadStudentData();
    renderAttendanceCalendar();
    checkMilestones();
    animateStats();
    setupEventListeners();
  }
  
  function loadStudentData() {
    // Load saved data or use defaults
    const savedData = localStorage.getItem('taskStudentData');
    if (savedData) {
      Object.assign(studentData, JSON.parse(savedData));
    }
    
    // Update UI with student data
    document.getElementById('studentName').textContent = studentData.name;
    document.getElementById('studentAvatar').src = studentData.avatar;
    document.getElementById('trainingDuration').textContent = studentData.trainingDuration + ' months';
    document.getElementById('currentStreak').textContent = studentData.currentStreak + ' day';
    
    // Update stats
    document.getElementById('classesAttended').textContent = studentData.stats.classesAttended;
    document.getElementById('practiceHours').textContent = studentData.stats.practiceHours;
    document.getElementById('techniquesLearned').textContent = studentData.stats.techniquesLearned;
    document.getElementById('tournamentsWon').textContent = studentData.stats.tournamentsWon;
    
    // Update current belt display
    updateBeltDisplay();
  }
  
  function updateBeltDisplay() {
    const beltBadge = document.getElementById('currentBeltBadge');
    const beltNames = {
      white: 'White Belt',
      yellow: 'Yellow Belt', 
      orange: 'Orange Belt',
      green: 'Green Belt',
      blue: 'Blue Belt',
      purple: 'Purple Belt',
      brown: 'Brown Belt',
      black: 'Black Belt'
    };
    
    beltBadge.textContent = beltNames[studentData.currentBelt] || 'Orange Belt';
    beltBadge.className = `avatar-badge belt-${studentData.currentBelt}`;
  }
  
  /* ===========================
     ATTENDANCE CALENDAR
  ============================ */
  function generateMockAttendance() {
    const attendance = {};
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Generate attendance for current month
    for (let day = 1; day <= 31; day++) {
      const date = new Date(currentYear, currentMonth, day);
      if (date.getMonth() === currentMonth) {
        const dateKey = formatDateKey(date);
        // Random attendance pattern (80% present)
        attendance[dateKey] = Math.random() > 0.2 ? 'present' : 'absent';
      }
    }
    
    // Mark today as present for demo
    attendance[formatDateKey(today)] = 'present';
    
    return attendance;
  }
  
  function formatDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  function renderAttendanceCalendar() {
    const calendar = document.getElementById('attendanceCalendar');
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    calendar.innerHTML = '';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
      const header = document.createElement('div');
      header.className = 'attendance-day header';
      header.textContent = day;
      header.style.fontWeight = '700';
      header.style.fontSize = '0.7rem';
      header.style.background = 'var(--task-400)';
      header.style.color = 'white';
      calendar.appendChild(header);
    });
    
    // Add empty cells for days before month starts
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement('div');
      emptyDay.className = 'attendance-day empty';
      calendar.appendChild(emptyDay);
    }
    
    // Add attendance days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateKey = formatDateKey(date);
      const attendance = studentData.attendance[dateKey] || 'none';
      
      const dayElement = document.createElement('div');
      dayElement.className = 'attendance-day';
      dayElement.textContent = day;
      
      if (attendance === 'present') {
        dayElement.classList.add('present');
      } else if (attendance === 'absent') {
        dayElement.classList.add('absent');
      }
      
      if (date.toDateString() === today.toDateString()) {
        dayElement.classList.add('today');
      }
      
      dayElement.title = `${dateKey}: ${attendance === 'present' ? 'Attended' : attendance === 'absent' ? 'Absent' : 'No class'}`;
      
      calendar.appendChild(dayElement);
    }
    
    // Update streak counter
    updateStreakCounter();
  }
  
  function updateStreakCounter() {
    const streakCount = calculateCurrentStreak();
    document.getElementById('streakCount').textContent = streakCount + ' days';
    
    // Update fire animation based on streak
    const fireElement = document.querySelector('.streak-fire');
    if (streakCount >= 30) {
      fireElement.style.animationDuration = '0.5s';
    } else if (streakCount >= 14) {
      fireElement.style.animationDuration = '0.8s';
    } else {
      fireElement.style.animationDuration = '1s';
    }
  }
  
  function calculateCurrentStreak() {
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateKey = formatDateKey(checkDate);
      
      if (studentData.attendance[dateKey] === 'present') {
        streak++;
      } else if (i > 0) {
        break; // Break if we find a gap after the first day
      }
    }
    
    return streak;
  }
  
  /* ===========================
     MILESTONE CHECKING
  =========================== */
  function checkMilestones() {
    const milestones = [
      { 
        condition: studentData.stats.classesAttended >= 50 && !studentData.achievements.find(a => a.id === 'class-50')?.earned,
        title: '🎉 50 Classes Milestone!',
        message: "You've attended 50 classes! Your dedication is inspiring!",
        action: 'View Achievement'
      },
      {
        condition: studentData.currentStreak >= 14 && !studentData.achievements.find(a => a.id === 'two-week-streak')?.earned,
        title: '🔥 Two Week Streak!',
        message: 'Amazing consistency! You\'ve trained for 14 days straight!',
        action: 'Share Achievement'
      },
      {
        condition: studentData.stats.practiceHours >= 125 && !studentData.achievements.find(a => a.id === 'practice-125')?.earned,
        title: '💪 125 Practice Hours!',
        message: 'Your hard work is paying off! Keep up the excellent effort!',
        action: 'View Progress'
      }
    ];
    
    const currentMilestone = milestones.find(m => m.condition);
    
    if (currentMilestone) {
      showMilestoneCelebration(currentMilestone);
    }
  }
  
  function showMilestoneCelebration(milestone) {
    const section = document.getElementById('milestoneSection');
    document.getElementById('milestoneTitle').textContent = milestone.title;
    document.getElementById('milestoneMessage').textContent = milestone.message;
    document.getElementById('milestoneAction').textContent = milestone.action;
    
    section.style.display = 'block';
    
    // Add celebration animation
    setTimeout(() => {
      section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
  }
  
  /* ===========================
     ANIMATIONS
  =========================== */
  function animateStats() {
    const statValues = document.querySelectorAll('.stat-value');
    
    statValues.forEach(stat => {
      const finalValue = parseInt(stat.textContent);
      let currentValue = 0;
      const increment = finalValue / 50; // Animate over 50 frames
      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalValue) {
          currentValue = finalValue;
          clearInterval(timer);
        }
        stat.textContent = Math.floor(currentValue);
      }, 30);
    });
  }
  
  /* ===========================
     EVENT HANDLERS
  =========================== */
  function setupEventListeners() {
    // Mark attendance button
    window.markAttendance = function() {
      markTodayAttendance();
    };
    
    // Belt step clicks (show info)
    document.querySelectorAll('.belt-achievement').forEach(belt => {
      belt.addEventListener('click', function() {
        const beltName = this.classList.find(c => c.startsWith('belt-')).replace('belt-', '');
        showBeltInfo(beltName);
      });
    });
    
    // Achievement badge clicks
    document.querySelectorAll('.achievement-badge').forEach(badge => {
      badge.addEventListener('click', function() {
        if (!this.classList.contains('locked')) {
          showAchievementDetails(this);
        }
      });
    });
  }
  
  function markTodayAttendance() {
    const today = new Date();
    const dateKey = formatDateKey(today);
    
    if (studentData.attendance[dateKey] === 'present') {
      alert('You have already marked today\'s attendance!');
      return;
    }
    
    // Mark today as present
    studentData.attendance[dateKey] = 'present';
    studentData.stats.classesAttended++;
    studentData.currentStreak++;
    studentData.stats.practiceHours += 1.5; // Average class length
    
    // Save data
    saveStudentData();
    
    // Update UI
    renderAttendanceCalendar();
    loadStudentData();
    
    // Show success message
    showSuccessMessage('Great job! Today\'s class has been marked.');
    
    // Check for new milestones
    checkMilestones();
  }
  
  function showBeltInfo(beltName) {
    const beltInfo = {
      white: { description: 'The beginning of your journey', requirements: 'Start training' },
      yellow: { description: 'Basic techniques mastered', requirements: '10 classes + basic form' },
      orange: { description: 'Developing intermediate skills', requirements: '25 classes + yellow belt techniques' },
      green: { description: 'Advanced technique proficiency', requirements: '50 classes + green belt requirements' },
      blue: { description: 'Expert level techniques', requirements: '75 classes + blue belt requirements' },
      purple: { description: 'Mastery of multiple styles', requirements: '100 classes + purple belt requirements' },
      brown: { description: 'Senior student level', requirements: '125 classes + brown belt requirements' },
      black: { description: 'Expert martial artist', requirements: '150 classes + black belt requirements' }
    };
    
    const info = beltInfo[beltName];
    if (info) {
      alert(`${beltName.charAt(0).toUpperCase() + beltName.slice(1)} Belt\n\n${info.description}\n\nRequirements: ${info.requirements}`);
    }
  }
  
  function showAchievementDetails(badgeElement) {
    const title = badgeElement.querySelector('.badge-title').textContent;
    const description = badgeElement.querySelector('.badge-description').textContent;
    
    alert(`${title}\n\n${description}\n\nKeep up the great work!`);
  }
  
  function showSuccessMessage(message) {
    // Create a temporary success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 9999;
      animation: slideInRight 0.5s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.5s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  }
  
  /* ===========================
     DATA PERSISTENCE
  =========================== */
  function saveStudentData() {
    localStorage.setItem('taskStudentData', JSON.stringify(studentData));
  }
  
  /* ===========================
     UTILITY FUNCTIONS
  =========================== */
  function updateStudentStats(stat, value) {
    studentData.stats[stat] += value;
    saveStudentData();
    loadStudentData();
  }
  
  // Initialize the dashboard
  initialize();
});

/* ===========================
   ANIMATION KEYFRAMES
=========================== */
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .success-notification {
    font-weight: 600;
    font-family: 'Inter', sans-serif;
  }
  
  .technique-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    margin-bottom: 12px;
    transition: all 0.2s ease;
  }
  
  .technique-item:hover {
    background: #e2e8f0;
    transform: translateX(4px);
  }
  
  .technique-icon {
    font-size: 2rem;
    width: 60px;
    text-align: center;
  }
  
  .technique-info {
    flex: 1;
  }
  
  .technique-info h4 {
    margin: 0 0 4px 0;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.2rem;
    color: var(--ink);
  }
  
  .technique-info p {
    margin: 0;
    font-size: 0.9rem;
    color: var(--muted);
  }
  
  .technique-status {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }
  
  .technique-status.learned {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
  }
  
  .technique-status.in-progress {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #78350f;
  }
  
  .technique-status.locked {
    background: #e5e7eb;
    color: #6b7280;
  }
  
  .student-avatar {
    position: relative;
    width: 100px;
    height: 100px;
  }
  
  .student-avatar img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 4px solid var(--task-400);
  }
  
  .avatar-badge {
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, var(--task-400) 0%, var(--task-500) 100%);
    color: white;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 700;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
  
  .next-belt-info {
    margin-top: 24px;
    padding: 16px;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-radius: 12px;
    border-left: 4px solid var(--task-400);
  }
  
  .next-belt-info h3 {
    margin: 0 0 8px 0;
    color: var(--task-500);
    font-family: 'Bebas Neue', sans-serif;
  }
  
  .next-belt-info p {
    margin: 0 0 12px 0;
    color: var(--muted);
  }
`;
document.head.appendChild(style);
/* ===========================
   STUDENT LOGOUT
   =========================== */
window.logoutStudent = function() {
  if (confirm('Are you sure you want to log out?')) {
    // Clear session
    sessionStorage.removeItem('studentLoggedIn');
    sessionStorage.removeItem('loggedInStudentId');
    sessionStorage.removeItem('loggedInStudentName');
    
    // Redirect to login
    window.location.href = 'student-login.html';
  }
};
