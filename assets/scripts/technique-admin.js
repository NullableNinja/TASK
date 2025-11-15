/* ============================================================
   TECHNIQUE ADMIN FUNCTIONALITY
   ------------------------------------------------------------  
   - Add/edit/delete techniques
   - Video upload and management
   - Data persistence and export
   - Belt and category management
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  
  /* ===========================
     DATA MANAGEMENT
  =========================== */
  let techniques = [];
  let currentEditingTechnique = null;
  let uploadedVideo = null;
  let instructionsEditor;
  
  // Load existing techniques
  function loadTechniques() {
    const saved = localStorage.getItem('taskTechniques');
    if (saved) {
      techniques = JSON.parse(saved);
    } else {
      // Load default techniques
      techniques = getDefaultTechniques();
    }
    renderTechniqueGrid();
  }
  
  function getDefaultTechniques() {
    return [
      {
        id: 'front-punch',
        name: 'Front Punch',
        japanese: 'Choku Zuki',
        category: 'strikes',
        belt: 'white',
        difficulty: 'beginner',
        icon: '👊',
        description: 'Basic straight punch',
        instructions: '<p>Start in natural stance with fists chambered at hips.</p><p>Extend punching arm straight forward while rotating fist 180 degrees.</p><p>Keep elbow pointed down and retract non-punching arm.</p>',
        keyPoints: ['Keep back straight and shoulders relaxed', 'Rotate hips and shoulders into the punch'],
        drills: [
          { level: 'beginner', requirement: '10 repetitions, 3 sets' },
          { level: 'intermediate', requirement: '25 repetitions, 5 sets' }
        ],
        testingRequirements: 'Demonstrate proper form and power',
        commonMistakes: 'Dropping the shoulder, telegraphing the punch'
      }
    ];
  }
  
  /* ===========================
     INITIALIZATION
  =========================== */
  function initialize() {
    initializeQuillEditor();
    setupEventListeners();
    loadTechniques();
  }
  
  function initializeQuillEditor() {
    instructionsEditor = new Quill('#instructionsEditor', {
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          ['blockquote', 'code-block'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          ['link', 'image'],
          ['clean']
        ]
      },
      placeholder: 'Enter step-by-step instructions...'
    });
  }
  
  function setupEventListeners() {
    // Video upload
    const videoUploadZone = document.getElementById('videoUploadZone');
    const videoInput = document.getElementById('videoInput');
    
    videoUploadZone.addEventListener('click', () => {
      videoInput.click();
    });
    
    videoInput.addEventListener('change', handleVideoUpload);
    
    // Form actions
    document.querySelector('.form-actions').addEventListener('click', (e) => {
      if (e.target.closest('button')) {
        const action = e.target.closest('button').textContent;
        if (action.includes('Save Technique')) {
          saveTechnique();
        } else if (action.includes('Save Draft')) {
          saveTechniqueDraft();
        } else if (action.includes('Clear')) {
          resetForm();
        }
      }
    });
    
    // Search and filters
    document.getElementById('techniqueSearch').addEventListener('input', filterTechniques);
    document.getElementById('filterBelt').addEventListener('change', filterTechniques);
    document.getElementById('filterCategory').addEventListener('change', filterTechniques);
  }
  
  /* ===========================
     VIDEO HANDLING
  =========================== */
  function handleVideoUpload(e) {
    const file = e.target.files[0];
    if (file &amp;&amp; file.type.startsWith('video/')) {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        uploadedVideo = {
          name: file.name,
          type: file.type,
          url: e.target.result,
          size: file.size
        };
        
        showVideoPreview(uploadedVideo);
        showNotification('Video uploaded successfully!');
      };
      
      reader.readAsDataURL(file);
    }
  }
  
  function showVideoPreview(video) {
    const preview = document.getElementById('videoPreview');
    const videoElement = preview.querySelector('video');
    
    videoElement.src = video.url;
    preview.style.display = 'block';
  }
  
  window.removeVideo = function() {
    uploadedVideo = null;
    document.getElementById('videoPreview').style.display = 'none';
    document.getElementById('videoInput').value = '';
  };
  
  /* ===========================
     FORM MANAGEMENT
  =========================== */
  window.addKeyPoint = function() {
    const container = document.getElementById('keyPointsList');
    const item = document.createElement('div');
    item.className = 'key-point-item';
    item.innerHTML = `
      <input type="text" placeholder="Enter key point..." class="key-point-input"/>
      <button type="button" class="btn-small danger" onclick="removeKeyPoint(this)">Remove</button>
    `;
    container.appendChild(item);
  };
  
  window.removeKeyPoint = function(button) {
    button.parentElement.remove();
  };
  
  window.addDrill = function() {
    const container = document.getElementById('practiceDrills');
    const item = document.createElement('div');
    item.className = 'drill-item';
    item.innerHTML = `
      <input type="text" placeholder="e.g. 10 repetitions, 3 sets" class="drill-input"/>
      <select class="drill-level">
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <button type="button" class="btn-small danger" onclick="removeDrill(this)">Remove</button>
    `;
    container.appendChild(item);
  };
  
  window.removeDrill = function(button) {
    button.parentElement.remove();
  };
  
  function collectFormData() {
    const keyPoints = Array.from(document.querySelectorAll('.key-point-input'))
      .map(input => input.value.trim())
      .filter(value => value);
    
    const drills = Array.from(document.querySelectorAll('.drill-item')).map(item => ({
      level: item.querySelector('.drill-level').value,
      requirement: item.querySelector('.drill-input').value.trim()
    })).filter(drill => drill.requirement);
    
    return {
      id: currentEditingTechnique?.id || generateId(),
      name: document.getElementById('techniqueName').value.trim(),
      japanese: document.getElementById('techniqueJapanese').value.trim(),
      category: document.getElementById('techniqueCategory').value,
      belt: document.getElementById('techniqueBelt').value,
      difficulty: document.getElementById('techniqueDifficulty').value,
      icon: document.getElementById('techniqueIcon').value,
      description: document.getElementById('techniqueDescription').value.trim(),
      instructions: instructionsEditor.root.innerHTML,
      keyPoints: keyPoints,
      drills: drills,
      testingRequirements: document.getElementById('testingRequirements').value.trim(),
      commonMistakes: document.getElementById('commonMistakes').value.trim(),
      video: uploadedVideo,
      lastUpdated: new Date().toISOString()
    };
  }
  
  function saveTechnique() {
    const technique = collectFormData();
    
    // Validation
    if (!technique.name || !technique.category || !technique.belt || !technique.description) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    // Save or update
    if (currentEditingTechnique) {
      const index = techniques.findIndex(t => t.id === currentEditingTechnique.id);
      techniques[index] = technique;
    } else {
      techniques.push(technique);
    }
    
    saveTechniques();
    renderTechniqueGrid();
    resetForm();
    showNotification('Technique saved successfully! 🎉');
  }
  
  function saveTechniqueDraft() {
    const technique = collectFormData();
    technique.status = 'draft';
    
    // Save to drafts
    let drafts = JSON.parse(localStorage.getItem('taskTechniqueDrafts') || '[]');
    const existingIndex = drafts.findIndex(d => d.id === technique.id);
    
    if (existingIndex >= 0) {
      drafts[existingIndex] = technique;
    } else {
      drafts.push(technique);
    }
    
    localStorage.setItem('taskTechniqueDrafts', JSON.stringify(drafts));
    showNotification('Draft saved successfully!');
  }
  
  function saveTechniques() {
    localStorage.setItem('taskTechniques', JSON.stringify(techniques));
  }
  
  function resetForm() {
    document.getElementById('techniqueName').value = '';
    document.getElementById('techniqueJapanese').value = '';
    document.getElementById('techniqueCategory').value = '';
    document.getElementById('techniqueBelt').value = '';
    document.getElementById('techniqueDifficulty').value = 'beginner';
    document.getElementById('techniqueIcon').value = '👊';
    document.getElementById('techniqueDescription').value = '';
    instructionsEditor.setText('');
    document.getElementById('testingRequirements').value = '';
    document.getElementById('commonMistakes').value = '';
    
    // Reset key points
    document.getElementById('keyPointsList').innerHTML = `
      <div class="key-point-item">
        <input type="text" placeholder="Enter key point..." class="key-point-input"/>
        <button type="button" class="btn-small danger" onclick="removeKeyPoint(this)">Remove</button>
      </div>
    `;
    
    // Reset drills
    document.getElementById('practiceDrills').innerHTML = `
      <div class="drill-item">
        <input type="text" placeholder="e.g. 10 repetitions, 3 sets" class="drill-input"/>
        <select class="drill-level">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <button type="button" class="btn-small danger" onclick="removeDrill(this)">Remove</button>
      </div>
    `;
    
    removeVideo();
    currentEditingTechnique = null;
  }
  
  /* ===========================
     TECHNIQUE GRID
  =========================== */
  function renderTechniqueGrid() {
    const grid = document.getElementById('techniqueGrid');
    const filteredTechniques = getFilteredTechniques();
    
    grid.innerHTML = '';
    
    filteredTechniques.forEach(technique => {
      const card = createTechniqueCard(technique);
      grid.appendChild(card);
    });
    
    if (filteredTechniques.length === 0) {
      grid.innerHTML = '<p style="text-align: center; color: var(--muted);">No techniques found matching your filters.</p>';
    }
  }
  
  function createTechniqueCard(technique) {
    const card = document.createElement('div');
    card.className = 'technique-management-card';
    
    card.innerHTML = `
      <div class="technique-card-header">
        <div class="technique-card-icon">${technique.icon}</div>
        <div class="technique-card-info">
          <h3>${technique.name}</h3>
          <p>${technique.japanese || ''}</p>
        </div>
      </div>
      <div class="technique-badges">
        <span class="technique-badge belt-badge-${technique.belt}">${technique.belt}</span>
        <span class="technique-badge category-badge-${technique.category}">${technique.category}</span>
        <span class="technique-badge difficulty-${technique.difficulty}">${technique.difficulty}</span>
      </div>
      <p style="margin: 12px 0; color: var(--muted); font-size: 0.9rem;">${technique.description}</p>
      <div style="display: flex; gap: 8px; margin-top: 16px;">
        <button class="btn-small" onclick="editTechnique('${technique.id}')">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="btn-small danger" onclick="deleteTechnique('${technique.id}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
    
    return card;
  }
  
  function getFilteredTechniques() {
    const searchTerm = document.getElementById('techniqueSearch').value.toLowerCase();
    const beltFilter = document.getElementById('filterBelt').value;
    const categoryFilter = document.getElementById('filterCategory').value;
    
    return techniques.filter(technique => {
      const matchesSearch = technique.name.toLowerCase().includes(searchTerm) ||
                           technique.japanese?.toLowerCase().includes(searchTerm) ||
                           technique.description.toLowerCase().includes(searchTerm);
      const matchesBelt = !beltFilter || technique.belt === beltFilter;
      const matchesCategory = !categoryFilter || technique.category === categoryFilter;
      
      return matchesSearch &amp;&amp; matchesBelt &amp;&amp; matchesCategory;
    });
  }
  
  function filterTechniques() {
    renderTechniqueGrid();
  }
  
  window.editTechnique = function(techniqueId) {
    const technique = techniques.find(t => t.id === techniqueId);
    if (!technique) return;
    
    currentEditingTechnique = technique;
    
    // Populate form
    document.getElementById('techniqueName').value = technique.name;
    document.getElementById('techniqueJapanese').value = technique.japanese || '';
    document.getElementById('techniqueCategory').value = technique.category;
    document.getElementById('techniqueBelt').value = technique.belt;
    document.getElementById('techniqueDifficulty').value = technique.difficulty;
    document.getElementById('techniqueIcon').value = technique.icon;
    document.getElementById('techniqueDescription').value = technique.description;
    instructionsEditor.root.innerHTML = technique.instructions || '';
    document.getElementById('testingRequirements').value = technique.testingRequirements || '';
    document.getElementById('commonMistakes').value = technique.commonMistakes || '';
    
    // Load key points
    const keyPointsContainer = document.getElementById('keyPointsList');
    keyPointsContainer.innerHTML = '';
    technique.keyPoints?.forEach(point => {
      const item = document.createElement('div');
      item.className = 'key-point-item';
      item.innerHTML = `
        <input type="text" placeholder="Enter key point..." class="key-point-input" value="${point}"/>
        <button type="button" class="btn-small danger" onclick="removeKeyPoint(this)">Remove</button>
      `;
      keyPointsContainer.appendChild(item);
    });
    
    // Load drills
    const drillsContainer = document.getElementById('practiceDrills');
    drillsContainer.innerHTML = '';
    technique.drills?.forEach(drill => {
      const item = document.createElement('div');
      item.className = 'drill-item';
      item.innerHTML = `
        <input type="text" placeholder="e.g. 10 repetitions, 3 sets" class="drill-input" value="${drill.requirement}"/>
        <select class="drill-level">
          <option value="beginner" ${drill.level === 'beginner' ? 'selected' : ''}>Beginner</option>
          <option value="intermediate" ${drill.level === 'intermediate' ? 'selected' : ''}>Intermediate</option>
          <option value="advanced" ${drill.level === 'advanced' ? 'selected' : ''}>Advanced</option>
        </select>
        <button type="button" class="btn-small danger" onclick="removeDrill(this)">Remove</button>
      `;
      drillsContainer.appendChild(item);
    });
    
    // Load video if exists
    if (technique.video) {
      uploadedVideo = technique.video;
      showVideoPreview(uploadedVideo);
    }
    
    // Scroll to form
    document.querySelector('.card.layered-off').scrollIntoView({ behavior: 'smooth' });
  };
  
  window.deleteTechnique = function(techniqueId) {
    if (confirm('Are you sure you want to delete this technique?')) {
      techniques = techniques.filter(t => t.id !== techniqueId);
      saveTechniques();
      renderTechniqueGrid();
      showNotification('Technique deleted successfully!');
    }
  };
  
  /* ===========================
     UTILITY FUNCTIONS
  =========================== */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'technique-notification';
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
     EXPORT FUNCTIONALITY
  =========================== */
  window.exportTechniques = function() {
    const dataStr = JSON.stringify(techniques, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `task-techniques-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Techniques exported successfully!');
  };
  
  // Initialize the application
  initialize();
});