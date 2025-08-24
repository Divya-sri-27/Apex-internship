// Helpers
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const storage = {
  read: (k, f) => { try { return JSON.parse(localStorage.getItem(k)) ?? f } catch { return f } },
  write: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

// Year
$('#year').textContent = new Date().getFullYear();

/* ===== Theme Toggle ===== */
const themeToggle = $('#themeToggle');
const THEME_KEY = 'theme';
const savedTheme = storage.read(THEME_KEY, 'light');
if(savedTheme === 'dark'){ document.body.classList.add('dark'); themeToggle.textContent='🌞 Light'; }
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  themeToggle.textContent = isDark ? '🌞 Light' : '🌙 Dark';
  storage.write(THEME_KEY, isDark ? 'dark' : 'light');
});

/* ===== Contact Form Validation ===== */
const form = $('#contactForm');
const formMsg = $('#formMsg');
const nameI = $('#name'), emailI = $('#email'), msgI = $('#message');
const validators = {
  name: v => v.trim().length >= 2,
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v),
  message: v => v.trim().length >= 10
};
function setValidity(el, ok){ el.classList.toggle('valid', ok); el.classList.toggle('invalid', !ok); }
[nameI,emailI,msgI].forEach(el => el.addEventListener('input', () => setValidity(el, validators[el.id](el.value))));
form.addEventListener('submit', e => {
  e.preventDefault();
  const okName = validators.name(nameI.value);
  const okEmail = validators.email(emailI.value);
  const okMsg = validators.message(msgI.value);
  [ [nameI,okName], [emailI,okEmail], [msgI,okMsg] ].forEach(([el,ok]) => setValidity(el, ok));
  if(!(okName && okEmail && okMsg)){ formMsg.textContent='Please fix highlighted fields.'; formMsg.style.color='#e74c3c'; return; }
  formMsg.textContent='✅ Message sent successfully!'; formMsg.style.color='#2ecc71';
  form.reset(); [nameI,emailI,msgI].forEach(el => el.classList.remove('valid','invalid'));
});

/* ===== To‑Do List (Drag & Drop + Persistence) ===== */
const todoInput = $('#todoInput');
const addTodo = $('#addTodo');
const todoList = $('#todoList');
const clearDone = $('#clearDone');
const clearAll = $('#clearAll');

let tasks = storage.read('tasks', []);
renderTasks();

addTodo.addEventListener('click', addTask);
todoInput.addEventListener('keydown', e => { if(e.key==='Enter') addTask(); });

function addTask(){
  const text = (todoInput.value || '').trim();
  if(!text) return;
  tasks.push({ id: Date.now(), text, done:false });
  storage.write('tasks', tasks);
  todoInput.value='';
  renderTasks();
}
function toggleTask(id){ tasks = tasks.map(t => t.id===id ? {...t, done:!t.done} : t); storage.write('tasks', tasks); renderTasks(); }
function removeTask(id){ tasks = tasks.filter(t => t.id!==id); storage.write('tasks', tasks); renderTasks(); }
clearDone.addEventListener('click', () => { tasks = tasks.filter(t => !t.done); storage.write('tasks', tasks); renderTasks(); });
clearAll.addEventListener('click', () => { tasks = []; storage.write('tasks', tasks); renderTasks(); });

function renderTasks(){
  todoList.innerHTML='';
  tasks.forEach(t => {
    const li = document.createElement('li');
    li.className = 'todo-item'; li.setAttribute('draggable','true');
    li.innerHTML = `
      <div class="todo-left">
        <input type="checkbox" ${t.done?'checked':''} aria-label="Mark complete" />
        <span class="todo-text ${t.done?'done':''}"></span>
      </div>
      <button class="icon" title="Delete" aria-label="Delete">🗑️</button>`;
    li.querySelector('.todo-text').textContent = t.text;
    li.querySelector('input[type="checkbox"]').addEventListener('change', () => toggleTask(t.id));
    li.querySelector('.icon').addEventListener('click', () => {
      li.style.opacity='.0'; li.style.transform='translateY(-6px)';
      setTimeout(() => removeTask(t.id), 150);
    });
    // Drag events
    li.addEventListener('dragstart', () => { li.classList.add('dragging'); });
    li.addEventListener('dragend', () => { li.classList.remove('dragging'); persistOrder(); });
    todoList.appendChild(li);
  });
}
todoList.addEventListener('dragover', e => {
  e.preventDefault();
  const dragging = document.querySelector('.dragging');
  const siblings = [...todoList.querySelectorAll('.todo-item:not(.dragging)')];
  const next = siblings.find(sib => e.clientY <= sib.getBoundingClientRect().top + sib.offsetHeight / 2);
  todoList.insertBefore(dragging, next || null);
});
function persistOrder(){
  const newOrderTexts = $$('.todo-item .todo-text').map(span => span.textContent);
  const map = new Map(tasks.map(t => [t.text, t]));
  tasks = newOrderTexts.map(text => map.get(text)).filter(Boolean);
  storage.write('tasks', tasks);
}

/* ===== Gallery (EMPTY by default) ===== */
const imgUrl = $('#imgUrl');
const addImage = $('#addImage');
const grid = $('#galleryGrid');
const placeholder = $('#placeholder');
const lightbox = $('#lightbox');
const lightboxImg = $('#lightboxImg');
const closeLightbox = $('#closeLightbox');

let images = storage.read('images', []); // start EMPTY
renderImages();

addImage.addEventListener('click', () => {
  const url = (imgUrl.value||'').trim();
  if(!url) return;
  images.push({ id: Date.now(), url });
  storage.write('images', images);
  imgUrl.value='';
  renderImages();
});

$('#imageUpload').addEventListener('change', e => {
  [...e.target.files].forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      images.push({ id: Date.now()+Math.random(), url: reader.result });
      storage.write('images', images);
      renderImages();
    };
    reader.readAsDataURL(file);
  });
  e.target.value='';
});

function renderImages(){
  grid.innerHTML='';
  if(!images.length){
    placeholder.style.display= 'block';
    return;
  } else {
    placeholder.style.display='none';
  }

  images.forEach(i => {
    const wrap = document.createElement('div');
    wrap.className = 'thumb';
      wrap.dataset.id = String(i.id);

    wrap.innerHTML = `
      <span class="badge">IMG</span>
      <button class="remove" aria-label="Remove">x</button>
      <img src="${i.url}" alt="User image">`;
    wrap.querySelector('img').addEventListener('click', () => openLightbox(i.url));
    wrap.querySelector('.remove').addEventListener('click', () => {
       const id = wrap.dataset.id;
      images = images.filter(x => String(x.id) !== id);
      storage.write('images', images);
      renderImages();
    });

    grid.appendChild(wrap);
  });
}

function openLightbox(url){
  lightboxImg.src = url;
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden','false');
}
function closeLB(){
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden','true');
}
closeLightbox.addEventListener('click', closeLB);
lightbox.addEventListener('click', e => { if(e.target === lightbox) closeLB(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeLB(); });
  