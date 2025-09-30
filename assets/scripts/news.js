/* ============================================================
   NEWS.JS — PAGE LOGIC (HI-YAH! STYLE)
   ------------------------------------------------------------
   Handles: Newsletter archive + Blog posts
   Data source: /data/newsletters.json, /news/posts/*.json
============================================================ */

const qs  = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];
const months = ["January","February","March","April","May","June","July",
                "August","September","October","November","December"];

// Escape HTML
const escapeHTML = (s='') => s.replace(/&/g,'&amp;')
                              .replace(/</g,'&lt;')
                              .replace(/>/g,'&gt;');

// Minimal Markdown → HTML
function mdToHtml(md=''){
  let t = escapeHTML(md);
  t = t.replace(/`([^`]+)`/g, '<code>$1</code>');
  t = t.replace(/^###\s?(.*)$/gm, '<h3>$1</h3>');
  t = t.replace(/^##\s?(.*)$/gm,  '<h2>$1</h2>');
  t = t.replace(/^#\s?(.*)$/gm,   '<h1>$1</h1>');
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\*([^*]+)\*/g,    '<em>$1</em>');
  t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
                '<a href="$2" target="_blank" rel="noopener">$1</a>');
  t = t.replace(/(?:^|\n)-(.*?)(?=\n|$)/g,
                (m, item)=>`<li>${item.trim()}</li>`);
  t = t.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>');
  t = t.split(/\n{2,}/).map(block=>{
    if(/^\s*<(h1|h2|h3|ul|li|img|p|blockquote)/.test(block)) return block;
    return `<p>${block.replace(/\n/g,'<br>')}</p>`;
  }).join('\n');
  return t;
}

// Fetch JSON
async function loadJSON(path){
  try{
    const r = await fetch(path, {cache:'no-store'});
    if(!r.ok) throw 0;
    return await r.json();
  }catch(e){
    console.warn('Could not fetch', path);
    return null;
  }
}

/* ======================
   Archive
====================== */
async function initArchive(){
  const data = await loadJSON('data/newsletters.json') || {newsletters:[]};
  const years = [...new Set(data.newsletters.map(n=>n.year))].sort((a,b)=>b-a);
  const yearSel = qs('#yearSel');
  const monthSel = qs('#monthSel');
  const btn = qs('#dlBtn');
  const noFile = qs('#noFile');

  yearSel.innerHTML = years.map(y=>`<option value="${y}">${y}</option>`).join('');

  function refreshMonths(){
    const y = parseInt(yearSel.value,10);
    const monthsForYear = data.newsletters
      .filter(n=>n.year===y)
      .map(n=>n.month)
      .sort((a,b)=>a-b);
    monthSel.innerHTML = monthsForYear.map(m=>`<option value="${m}">${months[m-1]}</option>`).join('');
    updateLink();
  }

  function updateLink(){
    const y = parseInt(yearSel.value,10);
    const m = parseInt(monthSel.value,10);
    const rec = data.newsletters.find(n=>n.year===y && n.month===m);
    if(rec){
      btn.href = rec.file;
      btn.removeAttribute('aria-disabled');
      btn.removeAttribute('disabled');
      noFile.hidden = true;
    }else{
      btn.href = '#';
      btn.setAttribute('aria-disabled','true');
      btn.setAttribute('disabled','');
      noFile.hidden = false;
    }
  }

  yearSel.addEventListener('change', refreshMonths);
  monthSel.addEventListener('change', updateLink);
  if(years.length){ yearSel.value = years[0]; refreshMonths(); }
}

/* ======================
   Blog
====================== */
const PAGE_SIZE = 8;
let POSTS = [];
let activeTags = new Set();
let queryText = '';
let renderedCount = 0;

function byPinnedThenDateDesc(a,b){
  if((b.pinned|0)!==(a.pinned|0)) return (b.pinned?1:0) - (a.pinned?0:1);
  return (a.date < b.date) ? 1 : -1;
}
function matchesFilters(p){
  if(p.draft) return false;
  const tagsOK = !activeTags.size || p.tags.some(t=>activeTags.has(t));
  const q = queryText.toLowerCase();
  const qOK = !q || [
    p.title, p.summary, p.bodyMd, p.bodyHtml, (p.tags||[]).join(' ')
  ].some(s => (s||'').toLowerCase().includes(q));
  return tagsOK && qOK;
}
function postCardHTML(p){
  const d = new Date(p.date+'T00:00:00');
  const when = isNaN(d) ? p.date : d.toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});
  const tags = (p.tags||[]).map(t=>`<span class="pill">${t}</span>`).join(' ');
  const body = p.bodyMd ? mdToHtml(p.bodyMd) : (p.bodyHtml || '');
  return `
    <article id="${p.id}" class="post card layered-off">
      <h3 class="post-title">${p.title} ${p.pinned?'<span class="pin">📌</span>':''}</h3>
      <div class="meta"><span>${when}</span>${tags?`<span>•</span> ${tags}`:''}</div>
      ${p.hero ? `<div class="hero"><img src="${p.hero}" alt="${p.heroAlt}" loading="lazy"></div>` : ''}
      ${p.summary ? `<p class="summary">${p.summary}</p>` : ''}
      <div class="body" hidden>${body}</div>
      <button class="btn steel square small readmore" data-id="${p.id}" aria-expanded="false">Read more</button>
    </article>`;
}
function bindPostToggles(){
  qsa('.readmore').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const post = qs('#'+CSS.escape(btn.dataset.id));
      const body = qs('.body', post);
      const open = !body.hasAttribute('hidden');
      if(open){
        body.setAttribute('hidden','');
        btn.textContent = 'Read more';
        btn.setAttribute('aria-expanded','false');
      }else{
        body.removeAttribute('hidden');
        btn.textContent = 'Show less';
        btn.setAttribute('aria-expanded','true');
        history.replaceState(null,'','#'+btn.dataset.id);
      }
    });
  });
}
function renderTagsRow(){
  const all = Array.from(new Set(POSTS.flatMap(p=>p.tags||[]))).sort();
  qs('#tagRow').innerHTML = all.map(t=>`
    <button type="button" class="tag ${activeTags.has(t)?'active':''}" data-tag="${t}">${t}</button>
  `).join('');
  qs('#tagRow').addEventListener('click', e=>{
    const b = e.target.closest('.tag'); if(!b) return;
    const t = b.dataset.tag;
    if(activeTags.has(t)){ activeTags.delete(t); b.classList.remove('active'); }
    else { activeTags.add(t); b.classList.add('active'); }
    fullRender();
  }, { once:true });
}
function fullRender(){
  const list = POSTS.filter(matchesFilters).sort(byPinnedThenDateDesc);
  const feed = qs('#feed');
  feed.innerHTML = '';
  renderedCount = 0;
  const toAdd = list.slice(0, PAGE_SIZE);
  feed.innerHTML = toAdd.map(postCardHTML).join('');
  renderedCount += toAdd.length;
  const more = qs('#loadMore');
  more.hidden = renderedCount >= list.length;
  more.onclick = () => {
    const next = list.slice(renderedCount, renderedCount+PAGE_SIZE);
    feed.insertAdjacentHTML('beforeend', next.map(postCardHTML).join(''));
    renderedCount += next.length;
    more.hidden = renderedCount >= list.length;
    bindPostToggles();
  };
  renderTagsRow();
  bindPostToggles();
}
async function initBlog(){
  const index = await loadJSON('news/posts-index.json');
  if(!index){ POSTS = []; return; }

  const promises = index.posts.map(path => loadJSON(path));
  const results = (await Promise.all(promises)).filter(Boolean);
  POSTS = results;
  qs('#search').addEventListener('input', e=>{
    queryText = (e.target.value||'').trim();
    fullRender();
  });
  fullRender();
}

/* ======================
   Init
====================== */
(async function init(){
  await initArchive();
  await initBlog();
})();
