/* ============================================================
   TECHNIQUE LIBRARY FUNCTIONALITY
   ------------------------------------------------------------  
   - Technique catalog and filtering
   - Video and instruction display
   - Progress tracking
   - Practice management
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  
  /* ===========================
     TECHNIQUE DATA
  =========================== */
  const techniques = [
    {
      id: 'front-punch',
      name: 'Front Punch (Choku Zuki)',
      category: 'strikes',
      belt: 'white',
      difficulty: 'beginner',
      icon: '👊',
      description: 'Basic straight punch',
      learned: true,
      instructions: 'Start in natural stance with fists chambered at hips. Extend punching arm straight forward while rotating fist 180 degrees. Keep elbow pointed down and retract non-punching arm.',
      keyPoints: [
        'Keep back straight and shoulders relaxed',
        'Rotate hips and shoulders into the punch',
        'Exhale sharply as punch extends',
        'Retract quickly to chamber position'
      ],
      drills: [
        { level: 'Beginner', reps: '10 repetitions, 3 sets' },
        { level: 'Intermediate', reps: '25 repetitions, 5 sets' },
        { level: 'Advanced', reps: '50 repetitions, 5 sets' }
      ]
    },
    {
      id: 'low-block',
      name: 'Low Block (Gedan Barai)',
      category: 'blocks',
      belt: 'white',
      difficulty: 'beginner',
      icon: '🛡️',
      description: 'Downward sweeping block',
      learned: true,
      instructions: 'Start with blocking hand at opposite shoulder. Sweep arm downward and across body, stopping just below waist level. Palm faces down at completion.',
      keyPoints: [
        'Use whole arm, not just wrist',
        'Block moves in circular motion',
        'Keep other hand ready at chamber',
        'Focus power at the point of impact'
      ],
      drills: [
        { level: 'Beginner', reps: '10 repetitions each side, 3 sets' },
        { level: 'Intermediate', reps: '20 repetitions each side, 5 sets' },
        { level: 'Advanced', reps: '30 repetitions each side, 5 sets' }
      ]
    },
    {
      id: 'front-kick',
      name: 'Front Kick (Mae Geri)',
      category: 'kicks',
      belt: 'yellow',
      difficulty: 'beginner',
      icon: '🦵',
      description: 'Straight forward kick',
      learned: false,
      instructions: 'Lift knee high, extend leg straight forward, strike with ball of foot. Retract quickly and set foot down.',
      keyPoints: [
        'Chamber knee high before extension',
        'Keep toes pulled back',
        'Support foot points forward',
        'Maintain balance throughout'
      ],
      drills: [
        { level: 'Beginner', reps: '8 repetitions each leg, 3 sets' },
        { level: 'Intermediate', reps: '15 repetitions each leg, 5 sets' },
        { level: 'Advanced', reps: '25 repetitions each leg, 5 sets' }
      ]
    },
    {
      id: 'horse-stance',
      name: 'Horse Stance (Kiba Dachi)',
      category: 'stances',
      belt: 'white',
      difficulty: 'beginner',
      icon: '🧍',
      description: 'Wide straddle stance',
      learned: true,
      instructions: 'Stand with feet twice shoulder-width apart, toes pointing forward. Bend knees until thighs are parallel to floor. Keep back straight.',
      keyPoints: [
        'Feet parallel and flat on floor',
        'Knees bent over toes',
        'Weight evenly distributed',
        'Chest up, shoulders relaxed'
      ],
      drills: [
        { level: 'Beginner', reps: 'Hold 30 seconds, 3 sets' },
        { level: 'Intermediate', reps: 'Hold 60 seconds, 3 sets' },
        { level: 'Advanced', reps: 'Hold 90 seconds, 3 sets' }
      ]
    },
    {
      id: 'roundhouse-kick',
      name: 'Roundhouse Kick (Mawashi Geri)',
      category: 'kicks',
      belt: 'orange',
      difficulty: 'intermediate',
      icon: '🔄',
      description: 'Circular kicking technique',
      learned: false,
      instructions: 'Lift knee and pivot support foot. Swing leg in arc, striking with instep. Retract along same path.',
      keyPoints: [
        'Pivot on support foot for power',
        'Kick through target, not just to it',
        'Keep hands up for balance',
        'Chamber high before extension'
      ],
      drills: [
        { level: 'Beginner', reps: '5 repetitions each leg, 3 sets' },
        { level: 'Intermediate', reps: '10 repetitions each leg, 5 sets' },
        { level: 'Advanced', reps: '20 repetitions each leg, 5 sets' }
      ]
    },
    {
      id: 'knife-hand-strike',
      name: 'Knife Hand Strike (Shuto Uchi)',
      category: 'strikes',
      belt: 'orange',
      difficulty: 'intermediate',
      icon: '🔪',
      description: 'Open hand strike with knife edge',
      learned: false,
      instructions: 'Strike with outer edge of hand from thumb to pinky. Keep fingers straight and together. Strike at 45-degree angle.',
      keyPoints: [
        'Keep wrist straight and firm',
        'Tense striking hand at impact',
        'Use body rotation for power',
        'Pull non-striking hand to hip'
      ],
      drills: [
        { level: 'Beginner', reps: '12 repetitions each side, 3 sets' },
        { level: 'Intermediate', reps: '25 repetitions each side, 5 sets' },
        { level: 'Advanced', reps: '40 repetitions each side, 5 sets' }
      ]
    }
  ];
  
  let currentTechniques = [...techniques];
  let selectedTechnique = null;
  
  /* ===========================
     INITIALIZATION
  =========================== */
  function initialize() {
    renderTechniques();
    setupEventListeners();
    loadUserProgress();
  }
  
  /* ===========================
     RENDER TECHNIQUES
  =========================== */
  function renderTechniques() {
    const grid = document.getElementById('techniqueGrid');
    grid.innerHTML = '';
    
    currentTechniques.forEach(technique => {
      const card = createTechniqueCard(technique);
      grid.appendChild(card);
    });
  }
  
  function createTechniqueCard(technique) {
    const card = document.createElement('div');
    card.className = 'technique-card';
    card.dataset.techniqueId = technique.id;
    
    if (technique.learned) {
      card.classList.add('learned');
    }
    
    card.innerHTML = `
      <div class="technique-header">
        <div class="technique-icon">${technique.icon}</div>
        <div class="technique-level">
          <span class="belt-indicator belt-${technique.belt}">${technique.belt}</span>
          <span class="difficulty-${technique.difficulty}">${technique.difficulty}</span>
        </div>
      </div>
      <div class="technique-body">
        <h3>${technique.name}</h3>
        <p class="muted">${technique.description}</p>
        <div class="technique-category">
          <i class="fas fa-tag"></i> ${technique.category}
        </div>
      </div>
      <div class="technique-footer">
        <button class="btn-small" onclick="viewTechnique('${technique.id}')">
          <i class="fas fa-play"></i> View
        </button>
        ${technique.learned ? 
          '<span class="learned-badge"><i class="fas fa-check"></i> Learned</span>' :
          '<button class="btn-small outline" onclick="markAsLearned(\'' + technique.id + '\')">Mark Learned</button>'
        }
      </div>
    `;
    
    return card;
  }
  
  /* ===========================
     EVENT LISTENERS
  =========================== */
  function setupEventListeners() {
    // Search functionality
    document.getElementById('techniqueSearch').addEventListener('input', (e) => {
      filterTechniques();
    });
    
    // Belt filter
    document.getElementById('beltFilter').addEventListener('change', () => {
      filterTechniques();
    });
    
    // Category filter
    document.getElementById('categoryFilter').addEventListener('change', () => {
      filterTechniques();
    });
    
    // Category cards
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const category = card.dataset.category;
        document.getElementById('categoryFilter').value = category;
        filterTechniques();
      });
    });
    
    // Load more button
    document.getElementById('loadMoreBtn').addEventListener('click', loadMoreTechniques);
  }
  
  function filterTechniques() {
    const searchTerm = document.getElementById('techniqueSearch').value.toLowerCase();
    const beltFilter = document.getElementById('beltFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    currentTechniques = techniques.filter(technique => {
      const matchesSearch = technique.name.toLowerCase().includes(searchTerm) ||
                           technique.description.toLowerCase().includes(searchTerm);
      const matchesBelt = !beltFilter || technique.belt === beltFilter;
      const matchesCategory = !categoryFilter || technique.category === categoryFilter;
      
      return matchesSearch && matchesBelt && matchesCategory;
    });
    
    renderTechniques();
  }
  
  function loadMoreTechniques() {
    // In a real implementation, this would load more techniques from an API
    showNotification('All techniques loaded!');
  }
  
  /* ===========================
     TECHNIQUE MODAL
  =========================== */
  window.viewTechnique = function(techniqueId) {
    selectedTechnique = techniques.find(t => t.id === techniqueId);
    if (!selectedTechnique) return;
    
    // Update modal content
    document.getElementById('modalTechniqueName').textContent = selectedTechnique.name;
    document.getElementById('modalInstructions').textContent = selectedTechnique.instructions;
    
    // Update key points
    const keyPointsList = document.getElementById('modalKeyPoints');
    keyPointsList.innerHTML = selectedTechnique.keyPoints.map(point => `<li>${point}</li>`).join('');
    
    // Update practice drills
    const drillsContainer = document.getElementById('modalDrills');
    drillsContainer.innerHTML = selectedTechnique.drills.map(drill => 
      `<div class="practice-drill"><strong>${drill.level}:</strong> ${drill.reps}</div>`
    ).join('');
    
    // Show modal
    document.getElementById('techniqueModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
  };
  
  window.closeTechniqueModal = function() {
    document.getElementById('techniqueModal').style.display = 'none';
    document.body.style.overflow = 'auto';
  };
  
  window.markAsLearned = function(techniqueId) {
    const technique = techniques.find(t => t.id === techniqueId) || selectedTechnique;
    if (!technique) return;
    
    technique.learned = true;
    saveUserProgress();
    renderTechniques();
    
    if (techniqueId) {
      showNotification('Technique marked as learned! Great progress! 🎉');
    } else {
      closeTechniqueModal();
      showNotification('Technique marked as learned! Great progress! 🎉');
    }
  };
  
  window.addToPractice = function() {
    if (!selectedTechnique) return;
    
    // In a real implementation, this would add to user's practice list
    showNotification(`Added ${selectedTechnique.name} to your practice list! 💪`);
  };
  
  /* ===========================
     USER PROGRESS
  =========================== */
  function loadUserProgress() {
    const savedProgress = localStorage.getItem('taskTechniqueProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      progress.learnedTechniques.forEach(techniqueId => {
        const technique = techniques.find(t => t.id === techniqueId);
        if (technique) {
          technique.learned = true;
        }
      });
      renderTechniques();
    }
  }
  
  function saveUserProgress() {
    const learnedTechniques = techniques.filter(t => t.learned).map(t => t.id);
    localStorage.setItem('taskTechniqueProgress', JSON.stringify({
      learnedTechniques,
      lastUpdated: new Date().toISOString()
    }));
  }
  
  /* ===========================
     UTILITY FUNCTIONS
  =========================== */
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'technique-notification';
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
      font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.5s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 500);
    }, 3000);
  }
  
  // Close modal when clicking outside
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('techniqueModal');
    if (e.target === modal) {
      closeTechniqueModal();
    }
  });
  
  // Initialize the library
  initialize();
});

/* ===========================
   TECHNIQUE LIBRARY STYLES
=========================== */
const style = document.createElement('style');
style.textContent = `
  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }
  
  .category-card {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }
  
  .category-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    border-color: var(--task-400);
  }
  
  .category-icon {
    font-size: 3rem;
    margin-bottom: 12px;
    display: block;
  }
  
  .category-card h3 {
    margin: 0 0 8px 0;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.4rem;
    color: var(--ink);
  }
  
  .category-card p {
    margin: 0 0 12px 0;
    color: var(--muted);
    font-size: 0.9rem;
  }
  
  .category-count {
    background: var(--task-400);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
  }
  
  .technique-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }
  
  .technique-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: all 0.3s ease;
    border: 2px solid transparent;
  }
  
  .technique-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    border-color: var(--task-400);
  }
  
  .technique-card.learned {
    border-color: #10b981;
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  }
  
  .technique-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f8fafc;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .technique-icon {
    font-size: 2rem;
  }
  
  .technique-level {
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: flex-end;
  }
  
  .belt-indicator {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
  }
  
  .belt-white { background: #f3f4f6; color: #374151; }
  .belt-yellow { background: #fef3c7; color: #92400e; }
  .belt-orange { background: #fed7aa; color: #9a3412; }
  .belt-green { background: #dcfce7; color: #365314; }
  .belt-blue { background: #dbeafe; color: #1e3a8a; }
  
  .difficulty-beginner { color: #10b981; font-size: 0.75rem; }
  .difficulty-intermediate { color: #f59e0b; font-size: 0.75rem; }
  .difficulty-advanced { color: #ef4444; font-size: 0.75rem; }
  
  .technique-body {
    padding: 16px;
  }
  
  .technique-body h3 {
    margin: 0 0 8px 0;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.2rem;
    color: var(--ink);
  }
  
  .technique-body p {
    margin: 0 0 12px 0;
    color: var(--muted);
    font-size: 0.9rem;
  }
  
  .technique-category {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    color: var(--task-500);
    font-weight: 600;
  }
  
  .technique-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f8fafc;
    border-top: 1px solid #e5e7eb;
  }
  
  .btn-small {
    padding: 6px 12px;
    font-size: 0.8rem;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    background: var(--task-400);
    color: white;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  
  .btn-small:hover {
    background: var(--task-500);
    transform: translateY(-1px);
  }
  
  .btn-small.outline {
    background: transparent;
    border: 1px solid var(--task-400);
    color: var(--task-400);
  }
  
  .btn-small.outline:hover {
    background: var(--task-400);
    color: white;
  }
  
  .learned-badge {
    background: #10b981;
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .tips-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 20px;
  }
  
  .tip-card {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-radius: 12px;
    padding: 20px;
    border-left: 4px solid var(--task-400);
  }
  
  .tip-card h3 {
    margin: 0 0 12px 0;
    color: var(--task-500);
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.2rem;
  }
  
  .tip-card p {
    margin: 0;
    color: var(--muted);
    line-height: 1.5;
  }
  
  /* Modal Styles */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  
  .modal-content {
    background: white;
    border-radius: 16px;
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #e5e7eb;
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    border-radius: 16px 16px 0 0;
  }
  
  .modal-header h2 {
    margin: 0;
    color: var(--ink);
    font-family: 'Bebas Neue', sans-serif;
  }
  
  .modal-close {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: var(--muted);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }
  
  .modal-close:hover {
    background: #fee2e2;
    color: #991b1b;
  }
  
  .modal-body {
    padding: 24px;
  }
  
  .technique-video {
    margin-bottom: 24px;
  }
  
  .video-placeholder {
    background: #1f2937;
    border-radius: 12px;
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 3rem;
  }
  
  .video-placeholder p {
    font-size: 1rem;
    margin-top: 12px;
    opacity: 0.7;
  }
  
  .technique-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  
  .technique-info h3,
  .technique-tips h3,
  .technique-practice h3 {
    margin: 0 0 12px 0;
    color: var(--task-500);
    font-family: 'Bebas Neue', sans-serif;
  }
  
  .technique-tips ul {
    margin: 0;
    padding-left: 20px;
  }
  
  .technique-tips li {
    margin-bottom: 8px;
    line-height: 1.4;
  }
  
  .practice-drill {
    background: #f8fafc;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 8px;
    border-left: 3px solid var(--task-400);
  }
  
  .modal-footer {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding: 24px;
    border-top: 1px solid #e5e7eb;
    background: #f8fafc;
    border-radius: 0 0 16px 16px;
  }
  
  @media (max-width: 768px) {
    .technique-details {
      grid-template-columns: 1fr;
    }
    
    .category-grid {
      grid-template-columns: 1fr;
    }
    
    .technique-grid {
      grid-template-columns: 1fr;
    }
    
    .tips-grid {
      grid-template-columns: 1fr;
    }
    
    .modal-content {
      margin: 20px;
      max-height: calc(100vh - 40px);
    }
  }
`;
document.head.appendChild(style);