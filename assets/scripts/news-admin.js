/* ============================================================
   NEWS-ADMIN.JS — POST BUILDER (HI-YAH! STYLE)
============================================================ */

// Init Quill
const quill = new Quill('#editor', {
  theme: 'snow',
  placeholder: 'Write your post here...',
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
    imageResize: {}
  }
});

// Fields
const eyebrowInput = document.getElementById('postEyebrow');
const titleInput = document.getElementById('postTitle');
const subtitleInput = document.getElementById('postSubtitle');
const imageUpload = document.getElementById('postImageUpload');
const imageControls = document.getElementById('imageControls');
const imageSize = document.getElementById('imageSize');
const removeImage = document.getElementById('removeImage');
const tagInput = document.getElementById('tagInput');
const tagsContainer = document.getElementById('tagsContainer');

// Preview
const previewEyebrow = document.getElementById('previewEyebrow');
const previewTitle = document.getElementById('previewTitle');
const previewSubtitle = document.getElementById('previewSubtitle');
const previewImage = document.getElementById('previewImage');
const previewBody = document.getElementById('previewBody');
const previewTags = document.getElementById('previewTags');

let tags = [];

/* ======================
   Live Preview
====================== */
eyebrowInput.addEventListener('input', () => previewEyebrow.textContent = eyebrowInput.value);
titleInput.addEventListener('input', () => previewTitle.textContent = titleInput.value);
subtitleInput.addEventListener('input', () => previewSubtitle.textContent = subtitleInput.value);
quill.on('text-change', () => previewBody.innerHTML = quill.root.innerHTML);

/* ======================
   Hero Image
====================== */
imageUpload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    previewImage.src = reader.result;
    previewImage.style.display = 'block';
    imageControls.style.display = 'flex';
  };
  reader.readAsDataURL(file);
});
imageSize.addEventListener('input', () => {
  previewImage.style.width = imageSize.value + '%';
});
removeImage.addEventListener('click', () => {
  previewImage.src = '';
  previewImage.style.display = 'none';
  imageUpload.value = '';
  imageControls.style.display = 'none';
});

/* ======================
   Tags
====================== */
tagInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const text = tagInput.value.trim();
    if (text && !tags.includes(text)) {
      tags.push(text);
      renderTags();
    }
    tagInput.value = '';
  }
});
function renderTags() {
  tagsContainer.innerHTML = '';
  previewTags.innerHTML = '';
  tags.forEach(tag => {
    const chip = document.createElement('span');
    chip.className = 'tag-chip tag-' + tag.toLowerCase().replace(/\s+/g, '-');
    chip.textContent = tag;
    chip.onclick = () => {
      tags = tags.filter(t => t !== tag);
      renderTags();
    };
    tagsContainer.appendChild(chip);
    previewTags.appendChild(chip.cloneNode(true));
  });
}

/* ======================
   Post Publishing
====================== */
const postBtn = document.getElementById('postBtn');

// Slugify
function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Download helper
function downloadBlob(data, filename, type="application/json") {
  const blob = (data instanceof Blob) ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

postBtn.addEventListener('click', async () => {
  const title = titleInput.value.trim();
  if (!title) {
    alert("Please enter a title before posting.");
    return;
  }

  const slug = slugify(title);
  const date = new Date().toISOString().split("T")[0];
  const id = `${date}-${slug}`;
  let heroFilename = "";

  // Hero image
  if (imageUpload.files.length > 0) {
    const file = imageUpload.files[0];
    const ext = file.name.split('.').pop().toLowerCase();
    heroFilename = `news/images/${id}-hero.${ext}`;
    const imgBlob = new Blob([await file.arrayBuffer()], { type: file.type });
    downloadBlob(imgBlob, `${id}-hero.${ext}`, file.type);
  }

  // Build post JSON
  const postJson = {
    id,
    title,
    subtitle: subtitleInput.value.trim(),
    date,
    hero: heroFilename,
    heroAlt: title,
    summary: quill.getText().slice(0, 140).trim(),
    bodyHtml: quill.root.innerHTML,
    tags,
    author: "Task Karate",
    pinned: false,
    draft: false
  };

  downloadBlob(JSON.stringify(postJson, null, 2), `${id}.json`);

  // Update posts-index.json
  try {
    const indexResp = await fetch("news/posts-index.json", { cache: "no-store" });
    const indexData = indexResp.ok ? await indexResp.json() : { posts: [] };
    indexData.posts.unshift(`news/posts/${id}.json`);
    downloadBlob(JSON.stringify(indexData, null, 2), "posts-index.json");
  } catch (e) {
    const newIndex = { posts: [`news/posts/${id}.json`] };
    downloadBlob(JSON.stringify(newIndex, null, 2), "posts-index.json");
  }

  alert("✅ Post generated! Upload JSON + image(s) into /news/ to publish.");
});
