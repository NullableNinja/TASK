/* ============================================================
   STUDENT SELECTOR - Dynamic Student Loading
   ------------------------------------------------------------
   Purpose:
   - Allow selection of different students
   - Load student data dynamically
   - Integrate with student management system
============================================================ */

// Get student ID from URL parameter or localStorage
function getSelectedStudentId() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlStudentId = urlParams.get('student');
  
  if (urlStudentId) {
    // Save to localStorage for persistence
    localStorage.setItem('selectedStudentId', urlStudentId);
    return urlStudentId;
  }
  
  // Try to get from localStorage
  const savedStudentId = localStorage.getItem('selectedStudentId');
  if (savedStudentId) {
    return savedStudentId;
  }
  
  // Default to first student or demo student
  return 'demo-student';
}

// Load student data by ID
function loadStudentById(studentId) {
  // Get all students from localStorage
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  
  // Find the student
  let student = students.find(s => s.id === studentId);
  
  // If not found, create demo student
  if (!student) {
    student = createDemoStudent();
  }
  
  return student;
}

// Create demo student data
function createDemoStudent() {
  return {
    id: 'demo-student',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '(608) 555-0123',
    avatar: 'images/staff/RandyThomson.png',
    currentBelt: 'orange',
    beltColor: 'orange',
    stripes: 2,
    beltAchievedDate: '2023-06-15',
    beltSize: 'Size 3',
    uniformSize: 'Adult Medium',
    dateJoined: '2023-01-15',
    birthDate: '2008-03-20',
    tags: ['Teen/Adult', 'Karate Student', 'Active'],
    stats: {
      classesAttended: 47,
      practiceHours: 124,
      techniquesLearned: 28,
      tournamentsWon: 3,
      currentStreak: 12
    },
    attendance: [],
    achievements: [
      { id: 'first-steps', name: 'First Steps', earned: true, progress: 100, icon: '🥋' },
      { id: 'dedicated-student', name: 'Dedicated Student', earned: true, progress: 100, icon: '⭐' },
      { id: 'perfect-attendance', name: 'Perfect Attendance', earned: false, progress: 85, icon: '📅' },
      { id: 'technique-master', name: 'Technique Master', earned: true, progress: 100, icon: '🎯' },
      { id: 'tournament-champion', name: 'Tournament Champion', earned: false, progress: 60, icon: '🏆' },
      { id: 'black-belt-journey', name: 'Black Belt Journey', earned: false, progress: 35, icon: '🥇' }
    ],
    techniques: [
      { id: 'front-punch', name: 'Front Punch', status: 'learned', category: 'strikes' },
      { id: 'low-block', name: 'Low Block', status: 'in-progress', category: 'blocks' },
      { id: 'front-kick', name: 'Front Kick', status: 'locked', category: 'kicks' }
    ]
  };
}

// Calculate training duration in months
function calculateTrainingDuration(dateJoined) {
  const joined = new Date(dateJoined);
  const now = new Date();
  const months = (now.getFullYear() - joined.getFullYear()) * 12 + (now.getMonth() - joined.getMonth());
  return Math.max(1, months);
}

// Calculate age from birth date
function calculateAge(birthDate) {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Get belt progression info
function getBeltProgressionInfo(student) {
  const beltOrder = ['white', 'gold', 'orange', 'green', 'purple', 'blue', 'red', 'brown', 'black'];
  const currentBeltIndex = beltOrder.indexOf(student.currentBelt || student.beltColor);
  
  // Classes needed per stripe based on belt
  let classesPerStripe = 8; // Default for color belts
  if (student.currentBelt === 'brown' || student.beltColor === 'brown') {
    classesPerStripe = 12;
  }
  
  // Calculate progress to next stripe
  const totalStripes = (student.currentBelt === 'brown' || student.beltColor === 'brown') ? 4 : 4;
  const currentStripes = student.stripes || 0;
  const classesForCurrentStripe = (student.stats?.classesAttended || 0) % classesPerStripe;
  const progressPercent = (classesForCurrentStripe / classesPerStripe) * 100;
  
  return {
    currentBelt: student.currentBelt || student.beltColor,
    currentBeltIndex,
    nextBelt: beltOrder[currentBeltIndex + 1] || 'black',
    currentStripes,
    totalStripes,
    classesPerStripe,
    classesForCurrentStripe,
    progressPercent,
    classesUntilNextStripe: classesPerStripe - classesForCurrentStripe
  };
}

// Create student selector dropdown
function createStudentSelector() {
  const students = JSON.parse(localStorage.getItem('students') || '[]');
  const currentStudentId = getSelectedStudentId();
  
  // Create selector HTML
  const selectorHTML = `
    <div class="student-selector" style="margin-bottom: 20px;">
      <label for="studentSelect" style="display: block; margin-bottom: 8px; color: #fff; font-weight: 600;">
        Select Student:
      </label>
      <select id="studentSelect" class="student-select" style="width: 100%; max-width: 400px; padding: 12px 16px; border-radius: 10px; border: 2px solid rgba(31, 94, 161, 0.3); background: rgba(255, 255, 255, 0.1); color: #fff; font-size: 1rem; cursor: pointer;">
        ${students.length === 0 ? '<option value="demo-student">Alex Johnson (Demo)</option>' : ''}
        ${students.map(s => `
          <option value="${s.id}" ${s.id === currentStudentId ? 'selected' : ''}>
            ${s.name} - ${s.currentBelt || s.beltColor} Belt
          </option>
        `).join('')}
      </select>
    </div>
  `;
  
  return selectorHTML;
}

// Handle student selection change
function handleStudentChange(studentId) {
  // Save selection
  localStorage.setItem('selectedStudentId', studentId);
  
  // Reload page with new student
  window.location.href = `student-dashboard.html?student=${studentId}`;
}

// Initialize student selector
function initializeStudentSelector() {
  const welcomeCard = document.querySelector('.card.layered-soft');
  if (welcomeCard) {
    const selectorDiv = document.createElement('div');
    selectorDiv.innerHTML = createStudentSelector();
    welcomeCard.insertBefore(selectorDiv.firstElementChild, welcomeCard.firstElementChild);
    
    // Add event listener
    const select = document.getElementById('studentSelect');
    if (select) {
      select.addEventListener('change', (e) => {
        handleStudentChange(e.target.value);
      });
    }
  }
}

// Export functions for use in other scripts
window.StudentSelector = {
  getSelectedStudentId,
  loadStudentById,
  calculateTrainingDuration,
  calculateAge,
  getBeltProgressionInfo,
  initializeStudentSelector,
  handleStudentChange
};