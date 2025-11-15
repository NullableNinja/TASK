/* ============================================================
   NEWS ADMIN ENHANCED - AMAZEBALLS FUNCTIONALITY
   ------------------------------------------------------------  
   - Advanced rich text editing
   - Drag & drop media upload
   - Facebook integration
   - Scheduling system
   - Real-time preview
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  
  /* ===========================
     INITIALIZATION
  =========================== */
  let quill;
  let uploadedMedia = [];
  let currentTags = [];
  let facebookEnabled = false;
  
  // Initialize Quill editor with enhanced configuration
  function initializeEditor() {
    Quill.register('modules/imageResize', window.ImageResize);
    
    quill = new Quill('#editor', {
      theme: 'snow',
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'font': [] }],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'script': 'sub'}, { 'script': 'super' }],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'indent': '-1'}, { 'indent': '+1' }],
          [{ 'direction': 'rtl' }],
          [{ 'align': [] }],
          ['blockquote', 'code-block'],
          ['link', 'image', 'video'],
          ['clean']
        ],
        imageResize: {
          modules: ['Resize', 'DisplaySize']
        }
      },
      placeholder: 'Start writing your amazing content here...'
    });
    
    // Set up real-time preview
    quill.on('text-change', updatePreview);
  }
  
  /* ===========================
     MEDIA UPLOAD SYSTEM
  =========================== */
  function initializeMediaUpload() {
    const uploadZone = document.getElementById('mediaUploadZone');
    const mediaInput = document.getElementById('mediaInput');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('uploadProgressBar');
    
    // Click to upload
    uploadZone.addEventListener('click', () => {
      mediaInput.click();
    });
    
    // File input change
    mediaInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadZone.classList.add('drag-over');
    });
    
    uploadZone.addEventListener('dragleave', () => {
      uploadZone.classList.remove('drag-over');
    });
    
    uploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadZone.classList.remove('drag-over');
      handleFiles(e.dataTransfer.files);
    });
  }
  
  function handleFileSelect(e) {
    handleFiles(e.target.files);
  }
  
  function handleFiles(files) {
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('uploadProgressBar');
    
    uploadProgress.style.display = 'block';
    progressBar.style.width = '0%';
    
    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 90) {
        clearInterval(progressInterval);
        progress = 90;
      }
      progressBar.style.width = progress + '%';
    }, 200);
    
    // Process files
    Array.from(files).forEach(file => {
      if (isValidFileType(file)) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const mediaItem = {
            id: Date.now() + Math.random(),
            type: file.type.startsWith('image/') ? 'image' : 
                  file.type.startsWith('video/') ? 'video' : 'document',
            name: file.name,
            url: e.target.result,
            size: file.size
          };
          
          uploadedMedia.push(mediaItem);
          updateMediaGallery();
          insertMediaIntoEditor(mediaItem);
        };
        
        reader.readAsDataURL(file);
      }
    });
    
    // Complete upload
    setTimeout(() => {
      clearInterval(progressInterval);
      progressBar.style.width = '100%';
      setTimeout(() => {
        uploadProgress.style.display = 'none';
        updateStatus('Media uploaded successfully!');
      }, 500);
    }, 1000);
  }
  
  function isValidFileType(file) {
    const validTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/ogg',
      'application/pdf'
    ];
    return validTypes.includes(file.type);
  }
  
  function updateMediaGallery() {
    const gallery = document.getElementById('mediaGallery');
    const grid = document.getElementById('mediaGrid');
    
    if (uploadedMedia.length === 0) {
      gallery.style.display = 'none';
      return;
    }
    
    gallery.style.display = 'block';
    grid.innerHTML = '';
    
    uploadedMedia.forEach(media => {
      const item = document.createElement('div');
      item.className = 'media-item';
      item.innerHTML = `
        <div class="media-preview">
          ${media.type === 'image' ? 
            `<img src="${media.url}" alt="${media.name}"/>` :
            media.type === 'video' ?
            `<video src="${media.url}" controls></video>` :
            `<div class="document-preview"><i class="fas fa-file-pdf"></i><br>${media.name}</div>`
          }
        </div>
        <div class="media-actions">
          <button class="btn-small" onclick="insertMediaToEditor('${media.id}')">
            <i class="fas fa-plus"></i>
          </button>
          <button class="btn-small danger" onclick="removeMedia('${media.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      grid.appendChild(item);
    });
  }
  
  function insertMediaIntoEditor(media) {
    if (media.type === 'image') {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, 'image', media.url);
    } else if (media.type === 'video') {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, 'video', media.url);
    }
  }
  
  window.insertMediaToEditor = function(mediaId) {
    const media = uploadedMedia.find(m => m.id == mediaId);
    if (media) {
      insertMediaIntoEditor(media);
    }
  };
  
  window.removeMedia = function(mediaId) {
    uploadedMedia = uploadedMedia.filter(m => m.id != mediaId);
    updateMediaGallery();
  };
  
  /* ===========================
     FACEBOOK INTEGRATION
  =========================== */
  function initializeFacebookIntegration() {
    const toggle = document.getElementById('facebookToggle');
    const options = document.getElementById('facebookOptions');
    
    toggle.addEventListener('click', () => {
      facebookEnabled = !facebookEnabled;
      toggle.classList.toggle('active');
      options.style.display = facebookEnabled ? 'block' : 'none';
      
      if (facebookEnabled) {
        updateFacebookPreview();
        updateStatus('Facebook integration enabled');
      } else {
        updateStatus('Facebook integration disabled');
      }
    });
  }
  
  function updateFacebookPreview() {
    const title = document.getElementById('postTitle').value || 'Your post title here';
    const subtitle = document.getElementById('postSubtitle').value || quill.getText().substring(0, 200) + '...';
    
    document.getElementById('facebookPreviewTitle').textContent = title;
    document.getElementById('facebookPreviewDescription').textContent = subtitle;
    
    // Update preview image if available
    if (uploadedMedia.length > 0 && uploadedMedia[0].type === 'image') {
      document.getElementById('facebookPreviewImage').innerHTML = 
        `<img src="${uploadedMedia[0].url}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;"/>`;
    }
  }
  
  /* ===========================
     SCHEDULING SYSTEM
  =========================== */
  function initializeScheduling() {
    const scheduleLater = document.getElementById('scheduleLater');
    const datetimePicker = document.getElementById('datetimePicker');
    
    scheduleLater.addEventListener('change', () => {
      datetimePicker.classList.toggle('show', scheduleLater.checked);
    });
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('publishDate').min = today;
  }
  
  /* ===========================
     TAG SYSTEM
  =========================== */
  function initializeTags() {
    const tagInput = document.getElementById('tagInput');
    const container = document.getElementById('tagsContainer');
    
    tagInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const tag = tagInput.value.trim();
        if (tag && !currentTags.includes(tag)) {
          addTag(tag);
          tagInput.value = '';
        }
      }
    });
  }
  
  function addTag(tag) {
    currentTags.push(tag);
    updateTagsDisplay();
  }
  
  function removeTag(tag) {
    currentTags = currentTags.filter(t => t !== tag);
    updateTagsDisplay();
  }
  
  function updateTagsDisplay() {
    const container = document.getElementById('tagsContainer');
    container.innerHTML = currentTags.map(tag => `
      <span class="tag">
        ${tag}
        <button type="button" onclick="removeTag('${tag}')">&times;</button>
      </span>
    `).join('');
  }
  
  window.removeTag = removeTag;
  
  /* ===========================
     PREVIEW SYSTEM
  =========================== */
  function updatePreview() {
    const eyebrow = document.getElementById('postEyebrow').value;
    const title = document.getElementById('postTitle').value;
    const subtitle = document.getElementById('postSubtitle').value;
    
    document.getElementById('previewEyebrow').textContent = eyebrow;
    document.getElementById('previewTitle').textContent = title;
    document.getElementById('previewSubtitle').textContent = subtitle;
    document.getElementById('previewBody').innerHTML = quill.root.innerHTML;
    document.getElementById('previewTags').innerHTML = currentTags.map(tag => 
      `<span class="tag">${tag}</span>`
    ).join('');
    
    // Update Facebook preview if enabled
    if (facebookEnabled) {
      updateFacebookPreview();
    }
  }
  
  /* ===========================
     FORM HANDLERS
  =========================== */
  function initializeFormHandlers() {
    // Real-time preview updates
    ['postEyebrow', 'postTitle', 'postSubtitle'].forEach(id => {
      document.getElementById(id).addEventListener('input', updatePreview);
    });
    
    // Save draft
    document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);
    
    // Publish post
    document.getElementById('publishBtn').addEventListener('click', publishPost);
    
    // Preview mode toggle
    document.getElementById('previewModeBtn').addEventListener('click', togglePreviewMode);
  }
  
  async function saveDraft() {
    const post = collectPostData();
    post.status = 'draft';
    
    try {
      updateStatus('Saving draft...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save to localStorage for demo
      localStorage.setItem('taskNewsDraft', JSON.stringify(post));
      
      updateStatus('Draft saved successfully!');
    } catch (error) {
      updateStatus('Error saving draft', 'error');
    }
  }
  
  async function publishPost() {
    const post = collectPostData();
    
    // Validation
    if (!post.title || !quill.getText().trim()) {
      updateStatus('Please add a title and content', 'error');
      return;
    }
    
    try {
      const publishBtn = document.getElementById('publishBtn');
      publishBtn.disabled = true;
      publishBtn.innerHTML = '<span class="loading-spinner"></span> Publishing...';
      
      updateStatus('Publishing post...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save to news system
      const fileName = generateFileName();
      post.date = new Date().toISOString();
      post.status = 'published';
      
      // Add to news posts index (simplified for demo)
      const postsIndex = JSON.parse(localStorage.getItem('taskNewsPosts') || '[]');
      postsIndex.unshift({
        id: fileName,
        title: post.title,
        summary: post.subtitle || quill.getText().substring(0, 150),
        date: post.date,
        tags: post.tags,
        image: post.image
      });
      localStorage.setItem('taskNewsPosts', JSON.stringify(postsIndex));
      localStorage.setItem('taskNewsPost_' + fileName, JSON.stringify(post));
      
      // Post to Facebook if enabled
      if (facebookEnabled) {
        await postToFacebook(post);
      }
      
      updateStatus('Post published successfully! 🎉');
      
      // Reset form after successful publish
      setTimeout(() => {
        if (confirm('Post published! Would you like to create another post?')) {
          resetForm();
        }
      }, 1000);
      
    } catch (error) {
      updateStatus('Error publishing post', 'error');
    } finally {
      const publishBtn = document.getElementById('publishBtn');
      publishBtn.disabled = false;
      publishBtn.innerHTML = '<i class="fas fa-rocket"></i> Publish Post';
    }
  }
  
  async function postToFacebook(post) {
    updateStatus('Posting to Facebook...');
    
    // Simulate Facebook API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In real implementation, this would use Facebook Graph API
    updateStatus('Posted to Facebook successfully!');
  }
  
  function collectPostData() {
    return {
      eyebrow: document.getElementById('postEyebrow').value,
      title: document.getElementById('postTitle').value,
      subtitle: document.getElementById('postSubtitle').value,
      content: quill.root.innerHTML,
      tags: currentTags,
      media: uploadedMedia,
      facebook: facebookEnabled ? {
        enabled: true,
        message: document.getElementById('facebookMessage').value
      } : { enabled: false },
      schedule: document.getElementById('scheduleLater').checked ? {
        date: document.getElementById('publishDate').value,
        time: document.getElementById('publishTime').value
      } : { type: 'now' },
      image: uploadedMedia.find(m => m.type === 'image')?.url || null
    };
  }
  
  function generateFileName() {
    const date = new Date().toISOString().split('T')[0];
    const random = Math.random().toString(36).substring(2, 8);
    return `${date}-${random}`;
  }
  
  function resetForm() {
    document.getElementById('postEyebrow').value = '';
    document.getElementById('postTitle').value = '';
    document.getElementById('postSubtitle').value = '';
    quill.setText('');
    currentTags = [];
    uploadedMedia = [];
    updateTagsDisplay();
    updateMediaGallery();
    updatePreview();
    updateStatus('Form reset - Ready for new post');
  }
  
  /* ===========================
     UTILITY FUNCTIONS
  =========================== */
  function updateStatus(message, type = 'success') {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.style.color = type === 'error' ? '#ef4444' : '#10b981';
    
    // Auto-hide success messages
    if (type === 'success') {
      setTimeout(() => {
        statusElement.textContent = 'Ready to publish';
        statusElement.style.color = '#9ca3af';
      }, 3000);
    }
  }
  
  function togglePreviewMode() {
    const previewSection = document.getElementById('previewSection');
    const isHidden = previewSection.style.display === 'none';
    
    previewSection.style.display = isHidden ? 'block' : 'none';
    
    const btn = document.getElementById('previewModeBtn');
    btn.innerHTML = isHidden ? 
      '<i class="fas fa-eye-slash"></i> Hide Preview' : 
      '<i class="fas fa-eye"></i> Preview Mode';
  }
  
  /* ===========================
     INITIALIZE EVERYTHING
  =========================== */
  function initialize() {
    initializeEditor();
    initializeMediaUpload();
    initializeFacebookIntegration();
    initializeScheduling();
    initializeTags();
    initializeFormHandlers();
    updatePreview();
    
    // Load saved draft if exists
    const savedDraft = localStorage.getItem('taskNewsDraft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      if (confirm('Found a saved draft. Would you like to load it?')) {
        loadDraft(draft);
      }
    }
  }
  
  function loadDraft(draft) {
    document.getElementById('postEyebrow').value = draft.eyebrow || '';
    document.getElementById('postTitle').value = draft.title || '';
    document.getElementById('postSubtitle').value = draft.subtitle || '';
    quill.root.innerHTML = draft.content || '';
    currentTags = draft.tags || [];
    uploadedMedia = draft.media || [];
    updateTagsDisplay();
    updateMediaGallery();
    updatePreview();
    updateStatus('Draft loaded successfully');
  }
  
  // Start the application
  initialize();
});