/* ============================================================
   STUDENT MANAGEMENT FUNCTIONALITY
   ------------------------------------------------------------  
   - Student CRUD operations
   - Belt and stripe tracking
   - Attendance integration
   - Progress monitoring
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  
  /* ===========================
     DATA MANAGEMENT
  =========================== */
  let students = [];
  let currentEditingStudent = null;
  let displayedStudents = [];
  let studentsPerPage = 12;
  let currentPage = 1;
  
  // Load existing students
  function loadStudents() {
    const saved = localStorage.getItem('taskStudents');
    if (saved) {
      students = JSON.parse(saved);
    } else {
      // Load demo students
      students = getDemoStudents();
    }
    updateStats();
    renderStudentGrid();
  }
  
  function getDemoStudents() {
    return [
      {
        id: generateId(),
        firstName: 'Alex',
        lastName: 'Johnson',
        email: 'alex.johnson@email.com',
        phone: '608-555-0101',
        dob: '2010-03-15',
        emergencyContact: 'Mary Johnson - 608-555-0102',
        belt: 'orange',
        stripes: '2',
        joinDate: '2023-01-15',
        program: 'kids',
        status: 'active',
        classesAttended: 47,
        attendanceStreak: 12,
        lastAttendance: new Date().toISOString(),
        notes: 'Great focus, needs work on kicks'
      },
      {
        id: generateId(),
        firstName: 'Sarah',
        lastName: 'Miller',
        email: 'sarah.miller@email.com',
        phone: '608-555-0103',
        dob: '2008-07-22',
        emergencyContact: 'Tom Miller - 608-555-0104',
        belt: 'green',
        stripes: '3',
        joinDate: '2022-06-10',
        program: 'teens',
        status: 'testing',
        classesAttended: 89,
        attendanceStreak: 8,
        lastAttendance: new Date().toISOString(),
        notes: 'Ready for green belt testing'
      }
    ];
  }
  
  /* ===========================
     INITIALIZATION
  =========================== */
  function initialize() {
    setupEventListeners();
    loadStudents();
  }
  
  function setupEventListeners() {
    // Search and filters
    document.getElementById('studentSearch').addEventListener('input', debounce(filterStudents, 300));
    document.getElementById('beltFilter').addEventListener('change', filterStudents);
    document.getElementById('statusFilter').addEventListener('change', filterStudents);
    
    // Form handling
    document.getElementById('studentProgram').addEventListener('change', toggleParentSection);
  }
  
  /* ===========================
     MODAL FUNCTIONS
  =========================== */
  window.showAddStudentModal = function() {
    currentEditingStudent = null;
    document.getElementById('modalTitle').textContent = 'Add New Student';
    document.getElementById('studentForm').reset();
    
    // Set default values
    document.getElementById('studentJoinDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('studentBelt').value = 'white';
    document.getElementById('studentStripes').value = '0';
    document.getElementById('studentProgram').value = 'kids';
    
    // Clear tags
    window.currentStudentTags = [];
    renderStudentTags();
    
    showModal();
  };
  
  window.editStudent = function(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    currentEditingStudent = student;
    document.getElementById('modalTitle').textContent = 'Edit Student';
    
    // Populate form
    document.getElementById('studentFirstName').value = student.firstName;
    document.getElementById('studentLastName').value = student.lastName;
    document.getElementById('studentEmail').value = student.email || '';
    document.getElementById('studentPhone').value = student.phone || '';
    document.getElementById('studentDOB').value = student.dob || '';
    document.getElementById('studentEmergency').value = student.emergencyContact || '';
    document.getElementById('studentBelt').value = student.belt;
    document.getElementById('studentStripes').value = student.stripes || '0';
    document.getElementById('studentBeltAchievedDate').value = student.beltAchievedDate || '';
    document.getElementById('studentBeltSize').value = student.beltSize || '';
    document.getElementById('studentUniformSize').value = student.uniformSize || '';
    document.getElementById('studentJoinDate').value = student.joinDate;
    document.getElementById('studentProgram').value = student.program;
    document.getElementById('studentPin').value = student.pin || '';
    document.getElementById('studentNotes').value = student.notes || '';
    
    // Load tags
    window.currentStudentTags = student.tags || [];
    renderStudentTags();
    
    toggleParentSection();
    showModal();
  };
  
  window.closeStudentModal = function() {
    hideModal();
    currentEditingStudent = null;
  };
  
  function showModal() {
    document.getElementById('studentModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
  
  function hideModal() {
    document.getElementById('studentModal').style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  
  /* ===========================
     FORM FUNCTIONS
  =========================== */
  window.toggleParentSection = function() {
    const program = document.getElementById('studentProgram').value;
    const parentSection = document.getElementById('parentSection');
    
    if (program === 'kids') {
      parentSection.style.display = 'block';
    } else {
      parentSection.style.display = 'none';
    }
  };
  
  window.saveStudent = function() {
    const formData = collectFormData();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.belt) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    if (currentEditingStudent) {
      // Update existing student
      const index = students.findIndex(s => s.id === currentEditingStudent.id);
      students[index] = { ...students[index], ...formData };
    } else {
      // Add new student
      const newStudent = {
        ...formData,
        id: generateId(),
        status: 'active',
        classesAttended: 0,
        attendanceStreak: 0,
        joinDate: formData.joinDate || new Date().toISOString().split('T')[0],
        createdDate: new Date().toISOString()
      };
      students.push(newStudent);
    }
    
    saveStudents();
    loadStudents();
    hideModal();
    showNotification(currentEditingStudent ? 'Student updated successfully!' : 'Student added successfully! 🎉');
  };
  
  function collectFormData() {
    return {
      firstName: document.getElementById('studentFirstName').value.trim(),
      lastName: document.getElementById('studentLastName').value.trim(),
      email: document.getElementById('studentEmail').value.trim(),
      phone: document.getElementById('studentPhone').value.trim(),
      dob: document.getElementById('studentDOB').value,
      emergencyContact: document.getElementById('studentEmergency').value.trim(),
      belt: document.getElementById('studentBelt').value,
      stripes: document.getElementById('studentStripes').value,
      beltAchievedDate: document.getElementById('studentBeltAchievedDate').value,
      beltSize: document.getElementById('studentBeltSize').value,
      uniformSize: document.getElementById('studentUniformSize').value,
      joinDate: document.getElementById('studentJoinDate').value,
      program: document.getElementById('studentProgram').value,
      tags: window.currentStudentTags || [],
      pin: document.getElementById('studentPin').value.trim(),
      notes: document.getElementById('studentNotes').value.trim()
    };
  }
  
  /* ===========================
     STUDENT CRUD
  =========================== */
  window.deleteStudent = function(studentId) {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      students = students.filter(s => s.id !== studentId);
      saveStudents();
      loadStudents();
      showNotification('Student deleted successfully!');
    }
  };
  
  window.addStripe = function(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const currentStripes = parseInt(student.stripes) || 0;
    if (currentStripes < 4) {
      student.stripes = (currentStripes + 1).toString();
      
      // Check if ready for testing
      if (student.stripes === '4') {
        student.status = 'testing';
        showNotification(`${student.firstName} is ready for belt testing! 🏆`);
      } else {
        showNotification(`Stripe awarded to ${student.firstName}! 🎯`);
      }
      
      student.lastStripeDate = new Date().toISOString();
      saveStudents();
      loadStudents();
    }
  };
  
  window.promoteStudent = function(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const beltOrder = ['white', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'black'];
    const currentIndex = beltOrder.indexOf(student.belt);
    
    if (currentIndex < beltOrder.length - 1) {
      const confirmation = `Promote ${student.firstName} ${student.lastName} from ${student.belt} belt to ${beltOrder[currentIndex + 1]} belt?`;
      if (confirm(confirmation)) {
        student.belt = beltOrder[currentIndex + 1];
        student.stripes = '0';
        student.status = 'active';
        student.lastPromotionDate = new Date().toISOString();
        
        saveStudents();
        loadStudents();
        showNotification(`🎉 ${student.firstName} has been promoted to ${student.belt} belt!`);
      }
    }
  };
  
  /* ===========================
     RENDERING FUNCTIONS
  =========================== */
  function renderStudentGrid() {
    const grid = document.getElementById('studentGrid');
    const paginatedStudents = getPaginatedStudents();
    
    grid.innerHTML = '';
    
    paginatedStudents.forEach((student, index) => {
      const card = createStudentCard(student);
      card.style.animationDelay = `${index * 0.1}s`;
      grid.appendChild(card);
    });
    
    // Update load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (displayedStudents.length < students.length) {
      loadMoreBtn.style.display = 'inline-block';
    } else {
      loadMoreBtn.style.display = 'none';
    }
  }
  
  function createStudentCard(student) {
    const card = document.createElement('div');
    card.className = 'student-card';
    
    // Check if ready for testing
    if (student.stripes === '4') {
      card.classList.add('testing-ready');
    }
    
    const initials = `${student.firstName.charAt(0)}${student.lastName.charAt(0)}`.toUpperCase();
    
    card.innerHTML = `
      <div class="student-header">
        <div class="student-avatar">${initials}</div>
        <div class="student-info">
          <h3>${student.firstName} ${student.lastName}</h3>
          <p>${student.email || 'No email'}</p>
          <span class="program-badge">${student.program}</span>
        </div>
      </div>
      
      <div class="student-belt-info">
        <div class="belt-display">
          <div class="belt-icon ${student.belt}">${student.belt.charAt(0).toUpperCase()}</div>
          <span>${student.belt.charAt(0).toUpperCase() + student.belt.slice(1)} Belt</span>
        </div>
        <div class="stripes-display">
          ${renderStripes(parseInt(student.stripes) || 0)}
        </div>
      </div>
      
      <div class="student-stats">
        <div class="student-stat">
          <span class="value">${student.classesAttended || 0}</span>
          <span class="label">Classes</span>
        </div>
        <div class="student-stat">
          <span class="value">${student.attendanceStreak || 0}</span>
          <span class="label">Streak</span>
        </div>
      </div>
      
      <div class="student-actions">
        <button class="btn-primary" onclick="editStudent('${student.id}')">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn-secondary" onclick="addStripe('${student.id}')" ${student.stripes === '4' ? 'disabled' : ''}>
          <i class="fas fa-star"></i> Add Stripe
        </button>
        <button class="btn-primary" onclick="promoteStudent('${student.id}')">
          <i class="fas fa-arrow-up"></i> Promote
        </button>
        <button class="btn-danger" onclick="deleteStudent('${student.id}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
    
    return card;
  }
  
  function renderStripes(count) {
    let stripes = '';
    for (let i = 0; i < 4; i++) {
      stripes += `<div class="stripe ${i < count ? '' : 'empty'}"></div>`;
    }
    return stripes;
  }
  
  /* ===========================
     FILTERING & PAGINATION
  ============================ */
  function filterStudents() {
    const searchTerm = document.getElementById('studentSearch').value.toLowerCase();
    const beltFilter = document.getElementById('beltFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    displayedStudents = students.filter(student => {
      const matchesSearch = 
        student.firstName.toLowerCase().includes(searchTerm) ||
        student.lastName.toLowerCase().includes(searchTerm) ||
        student.email?.toLowerCase().includes(searchTerm) ||
        student.belt.toLowerCase().includes(searchTerm);
      
      const matchesBelt = !beltFilter || student.belt === beltFilter;
      const matchesStatus = !statusFilter || student.status === statusFilter;
      
      return matchesSearch && matchesBelt && matchesStatus;
    });
    
    currentPage = 1;
    renderStudentGrid();
  }
  
  function getPaginatedStudents() {
    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    return displayedStudents.slice(startIndex, endIndex);
  }
  
  window.loadMoreStudents = function() {
    currentPage++;
    renderStudentGrid();
  };
  
  /* ===========================
     STATISTICS
  ============================ */
  function updateStats() {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;
    const testingStudents = students.filter(s => s.status === 'testing').length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = students.filter(s => {
      const joinDate = new Date(s.joinDate);
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length;
    
    // Update stats with animation
    animateValue('totalStudents', 0, totalStudents, 1000);
    animateValue('activeStudents', 0, activeStudents, 1000);
    animateValue('testingStudents', 0, testingStudents, 1000);
    animateValue('newThisMonth', 0, newThisMonth, 1000);
  }
  
  function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        element.textContent = end;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  }
  
  /* ===========================
     DATA PERSISTENCE & EXPORT
  ============================ */
  function saveStudents() {
    localStorage.setItem('taskStudents', JSON.stringify(students));
  }
  
  window.exportStudentData = function() {
    const dataStr = JSON.stringify(students, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `task-students-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Student data exported successfully!');
  };
  
  /* ===========================
     UTILITY FUNCTIONS
  ============================ */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'student-notification';
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    `;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 9999;
      animation: slideInRight 0.5s ease;
      font-weight: 600;
      max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.5s ease';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 500);
    }, 3000);
  }
  
  // Close modal when clicking outside
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('studentModal');
    if (e.target === modal) {
      closeStudentModal();
    }
  });
  
  // Initialize the application
  initialize();
});
/* ===========================
   STUDENT TAGS MANAGEMENT
   =========================== */
window.currentStudentTags = [];

window.addStudentTag = function() {
  const input = document.getElementById('newTagInput');
  const tag = input.value.trim();
  
  if (tag && !window.currentStudentTags.includes(tag)) {
    window.currentStudentTags.push(tag);
    renderStudentTags();
    input.value = '';
  }
};

window.addPredefinedTag = function(tag) {
  if (!window.currentStudentTags.includes(tag)) {
    window.currentStudentTags.push(tag);
    renderStudentTags();
  }
};

window.removeStudentTag = function(tag) {
  window.currentStudentTags = window.currentStudentTags.filter(t => t !== tag);
  renderStudentTags();
};

function renderStudentTags() {
  const display = document.getElementById('studentTagsDisplay');
  if (!display) return;
  
  if (window.currentStudentTags.length === 0) {
    display.innerHTML = '<p style="color: rgba(255,255,255,0.5); font-style: italic;">No tags added yet</p>';
    return;
  }
  
  display.innerHTML = window.currentStudentTags.map(tag => `
    <span class="student-tag">
      ${tag}
      <span class="remove-tag" onclick="removeStudentTag('${tag}')">×</span>
    </span>
  `).join('');
}

// Allow Enter key to add tags
document.addEventListener('DOMContentLoaded', function() {
  const tagInput = document.getElementById('newTagInput');
  if (tagInput) {
    tagInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addStudentTag();
      }
    });
  }
});
