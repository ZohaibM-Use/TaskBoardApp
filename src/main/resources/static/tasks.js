const API = '/api/tasks';

let allTasksFull = [];
let allTasksStats = [];
let currentPage = 0;
const pageSize = 5;
let editingId = null;
let searchTimer = null;

/* BootStrap */
async function load() {
  try {
    await refreshStats();

    const search = document.getElementById('search').value.trim();
    const status = document.getElementById('filter-status').value;
    const priority = document.getElementById('filter-priority').value;

    let data;

    // SEARCH MODE (takes precedence)
    if (search.length > 0) {
      const r = await fetch(`/api/tasks/search?keyword=${encodeURIComponent(search)}`);
      data = await r.json();
    }

    // FILTER MODE (combined)
    else {
      const r = await fetch('/api/tasks');
      data = await r.json();

      data = data.filter(t => {
        const matchesStatus =
          status === 'all' ||
          (status === 'complete' && t.completed) ||
          (status === 'incomplete' && !t.completed);

        const matchesPriority =
          priority === 'all' || t.priority === priority;

        return matchesStatus && matchesPriority;
      });
    }

    allTasksFull = data;
    currentPage = 0;
    render();

  } catch (e) {
    console.error(e);
    document.getElementById('error-area').innerHTML =
      `<p class="error-msg">Backend error.</p>`;
  }
}

/* STATS */
function updateStats() {
  const done = allTasksStats.filter(t => t.completed).length;
  const high = allTasksStats.filter(t => t.priority === 'HIGH').length;

  document.getElementById('s-total').textContent = allTasksStats.length;
  document.getElementById('s-done').textContent = done;
  document.getElementById('s-todo').textContent = allTasksStats.length - done;
  document.getElementById('s-high').textContent = high;
}

/* Update Stats */
async function refreshStats() {
  const res = await fetch('/api/tasks');
  allTasksStats = await res.json();
  updateStats();
}

/* Max pages helper */
function getMaxPages() {
  return Math.max(1, Math.ceil(allTasksFull.length / pageSize));
}

/* RENDER */
function render() {
  const start = currentPage * pageSize;
  const tasks = allTasksFull.slice(start, start + pageSize);

  const maxPages = getMaxPages();
  currentPage = Math.min(Math.max(currentPage, 0), maxPages - 1);

  const el = document.getElementById('task-list');

  if (!tasks.length) {
    el.innerHTML = `<div class="empty">No tasks match your criteria.</div>`;
  } else {
    el.innerHTML = tasks.map(t => `
      <div class="task-card ${t.completed ? 'done' : ''}" data-id="${t.id}">

        <input type="checkbox" ${t.completed ? 'checked' : ''}
          onchange="toggleTask(${t.id}, this.checked)">

        <div class="task-body">

          <div class="task-title ${t.completed ? 'done' : ''}">
            ${esc(t.title)}
          </div>

          ${t.description ? `
            <div class="task-desc">
              ${esc(t.description)}
            </div>
          ` : ''}

          <div class="task-meta">
            <span class="badge ${t.priority}">${t.priority}</span>
            <span class="task-date">${fmtDate(t.createdAt)}</span>
          </div>

        </div>

        <div class="task-actions">
          <button class="icon-btn edit" title="Edit task" onclick="editTask(${t.id})">✎</button>
          <button class="icon-btn delete" title="Delete task" onclick="deleteTask(${t.id})">✕</button>
        </div>

      </div>
    `).join('');
  }

  /* Pagination UI */
  document.getElementById('page-info').textContent =
    `Page ${currentPage + 1} of ${maxPages}`;

  const prevBtn = document.querySelector('.pagination button:nth-child(1)');
  const nextBtn = document.querySelector('.pagination button:nth-child(3)');

  prevBtn.disabled = currentPage === 0;
  nextBtn.disabled = currentPage >= maxPages - 1;
}

/* SEARCH Debounce Logic */
function onSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    load();
  }, 200);
}
document.getElementById('search').addEventListener('input', onSearch);

/* FILTER EVENTS */
document.getElementById('filter-status').addEventListener('change', () => {
  load();
});

document.getElementById('filter-priority').addEventListener('change', () => {
  load();
});

/* PAGINATION */
function nextPage() {
  const maxPages = getMaxPages();
  if (currentPage < maxPages - 1) {
    currentPage++;
    render();
  }
}

function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    render();
  }
}

/* TOGGLE TASK */
async function toggleTask(id, completed) {
  const task = allTasksFull.find(t => t.id === id);

  try {
    const r = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, completed })
    });

    const updated = await r.json();

    allTasksFull = allTasksFull.map(t =>
      t.id === id ? updated : t
    );

    refreshStats();
    render();

  } catch {
    toast('Failed to update task.');
    load();
  }
}

/* DELETE */
async function deleteTask(id) {
  const task = allTasksFull.find(t => t.id === id);
  const card = document.querySelector(`[data-id="${id}"]`);

  try {
    await fetch(`${API}/${id}`, { method: 'DELETE' });

    allTasksFull = allTasksFull.filter(t => t.id !== id);

    const maxPages = getMaxPages();
    currentPage = Math.min(currentPage, maxPages - 1);

    if (card) {
      card.classList.add('fade-out');

      setTimeout(() => {
        refreshStats();
        render();
        toast('Task deleted.');
      }, 300);
    } else {
      refreshStats();
      render();
    }

  } catch {
    toast('Failed to delete task.');
  }
}

/* EDIT */
function editTask(id) {
  const t = allTasksFull.find(t => t.id === id);
  if (!t) return;

  editingId = id;

  document.getElementById('modal-title').textContent = 'Edit task';
  document.getElementById('f-title').value = t.title;
  document.getElementById('f-desc').value = t.description || '';
  document.getElementById('f-priority').value = t.priority;

  document.getElementById('modal').style.display = 'flex';
}

/* MODAL */
function openModal() {
  editingId = null;

  document.getElementById('modal-title').textContent = 'New task';
  document.getElementById('f-title').value = '';
  document.getElementById('f-desc').value = '';
  document.getElementById('f-priority').value = 'MEDIUM';

  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  editingId = null;
  document.getElementById('modal').style.display = 'none';
  clearErrors();
}

/* SAVE TASK */
async function saveTask() {
  const title = document.getElementById('f-title').value.trim();
  const description = document.getElementById('f-desc').value.trim();
  clearErrors();

  if (title.length < 3 || title.length > 100) {
    showError('title-error', 'Title must be 3–100 characters.');
    return;
  }
  if (description.length > 500) {
    showError('desc-error', 'Description cannot exceed 500 characters.');
    return;
  }

  const body = {
    title,
    description,
    priority: document.getElementById('f-priority').value,
    completed: false
  };

  try {
    if (editingId) {
      const r = await fetch(`${API}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const updated = await r.json();
      allTasksFull = allTasksFull.map(t =>
        t.id === editingId ? updated : t
      );
      toast('Task updated.');

    } else {
      const r = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const created = await r.json();
      allTasksFull.unshift(created);
      toast('Task created.');
    }

    closeModal();
    refreshStats();
    render();

    setTimeout(() => {
      const firstCard = document.querySelector('.task-card:first-child');

      if (firstCard) {
        firstCard.classList.add('new');
        setTimeout(() => {
          firstCard.classList.remove('new');
        }, 800);
      }
    }, 0);

  } catch {
    toast('Failed to save task.');
  }
}

/* HELPERS */
function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

function showError(id, msg) {
  document.getElementById(id).textContent = msg;
}

function clearErrors() {
  showError('title-error', '');
  showError('desc-error', '');
}

/* START */
load();