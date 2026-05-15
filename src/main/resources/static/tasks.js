const API = '/api/tasks';

let allTasks    = [];   // active (non-deleted) tasks from GET /api/tasks
let allDeleted  = [];   // deleted tasks from GET /api/tasks/deleted (if endpoint exists)
                        // otherwise populated by checking deleted flag
let editingId   = null;
let draggedId   = null;
let searchTimeout = null;
let currentTab  = 'board';
let currentPage = 0;
let pageSize    = 10;
let totalPages  = 1;

// ─── INIT ─────────────────────────────────────────────────────────────────────

async function init() {
    await loadTasks();
    renderCurrentTab();
}

// ─── LOAD DATA ────────────────────────────────────────────────────────────────

// GET /api/tasks — returns active (non-deleted) tasks
async function loadTasks() {
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error();
        allTasks = await res.json();
        updateStats();
    } catch {
        showToast('Failed to load tasks', 'error');
    }
}

// Loads deleted tasks — tries GET /api/tasks/deleted first,
// falls back to checking deleted:true flag in allTasks
async function loadDeletedTasks() {
    try {
        const res = await fetch(`${API}/deleted`);
        if (res.ok) {
            allDeleted = await res.json();
            return;
        }
    } catch { /* endpoint may not exist */ }

    // Fallback: filter from allTasks if backend returns deleted tasks in main list
    allDeleted = allTasks.filter(t => t.deleted === true);
}

// ─── STATS ────────────────────────────────────────────────────────────────────

function updateStats() {
    document.getElementById('statTotal').textContent      = allTasks.length;
    document.getElementById('statIncomplete').textContent = allTasks.filter(t => !t.completed).length;
    document.getElementById('statComplete').textContent   = allTasks.filter(t =>  t.completed).length;
    document.getElementById('statHigh').textContent       = allTasks.filter(t => t.priority === 'HIGH').length;
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab').forEach((el, i) => {
        el.classList.toggle('active', ['board', 'list', 'deleted'][i] === tab);
    });
    document.getElementById('tab-board').classList.toggle('hidden',   tab !== 'board');
    document.getElementById('tab-list').classList.toggle('hidden',    tab !== 'list');
    document.getElementById('tab-deleted').classList.toggle('hidden', tab !== 'deleted');

    renderCurrentTab();
}

// Central render dispatcher — always calls the right render for the active tab
async function renderCurrentTab() {
    if (currentTab === 'board') {
        renderBoard(getFilteredTasks());
    } else if (currentTab === 'list') {
        await loadPaginated();
    } else if (currentTab === 'deleted') {
        await loadDeletedTasks();
        renderDeleted(allDeleted);
    }
}

// ─── SEARCH  GET /api/tasks/search?keyword= ───────────────────────────────────

function handleSearch(val) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        const keyword = val.trim();
        if (keyword.length >= 2) {
            try {
                const res = await fetch(`${API}/search?keyword=${encodeURIComponent(keyword)}`);
                if (!res.ok) throw new Error();
                const results = await res.json();
                // Search results go to whichever tab is active
                if (currentTab === 'board')   renderBoard(results);
                if (currentTab === 'list')    renderListTable(results.filter(t => !t.deleted));
                if (currentTab === 'deleted') renderDeleted(results.filter(t => t.deleted));
            } catch {
                showToast('Search failed', 'error');
            }
        } else {
            // No keyword — fall back to normal rendering
            renderCurrentTab();
        }
    }, 300);
}

// ─── FILTERS ──────────────────────────────────────────────────────────────────

function applyFilters() {
    const keyword = document.getElementById('searchInput').value.trim();
    // If search is active, don't let filter dropdowns override it
    if (keyword.length >= 2) { handleSearch(keyword); return; }

    renderCurrentTab();
}

// Returns active tasks filtered by the current dropdown selections,
// using dedicated endpoints where possible
function getFilteredTasks() {
    return applyLocalFilters(allTasks);
}

async function applyFiltersAndRender() {
    const priority = document.getElementById('priorityFilter').value;
    const status   = document.getElementById('statusFilter').value;
    const keyword  = document.getElementById('searchInput').value.trim();

    if (keyword.length >= 2) { handleSearch(keyword); return; }

    if (currentTab === 'board' || currentTab === 'list') {
        // Use dedicated endpoints for single-filter cases
        if (status === 'completed'  && !priority) { await fetchIntoTasks(`${API}/completed`);           }
        else if (status === 'incomplete' && !priority) { await fetchIntoTasks(`${API}/incomplete`);     }
        else if (priority && !status)             { await fetchIntoTasks(`${API}/priority/${priority}`);}
        else { /* use allTasks */ }
    }

    renderCurrentTab();
}

async function fetchIntoTasks(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error();
        // Temporarily replace allTasks for rendering (don't persist)
        const filtered = await res.json();
        if (currentTab === 'board') renderBoard(filtered);
        if (currentTab === 'list')  renderListTable(filtered.filter(t => !t.deleted));
    } catch {
        showToast('Failed to filter tasks', 'error');
    }
}

function applyLocalFilters(tasks) {
    const priority = document.getElementById('priorityFilter').value;
    const status   = document.getElementById('statusFilter').value;
    let result = [...tasks];
    if (priority)                result = result.filter(t => t.priority === priority);
    if (status === 'completed')  result = result.filter(t =>  t.completed);
    if (status === 'incomplete') result = result.filter(t => !t.completed);
    return result;
}

function clearFilters() {
    document.getElementById('searchInput').value    = '';
    document.getElementById('priorityFilter').value = '';
    document.getElementById('statusFilter').value   = '';
    renderCurrentTab();
}

// ─── BOARD ────────────────────────────────────────────────────────────────────

function renderBoard(tasks) {
    const active     = tasks.filter(t => !t.deleted);
    const todo       = active.filter(t => !t.completed && t.priority !== 'HIGH');
    const inprogress = active.filter(t => !t.completed && t.priority === 'HIGH');
    const done       = active.filter(t =>  t.completed);

    renderColumn('todo',       todo);
    renderColumn('inprogress', inprogress);
    renderColumn('done',       done);

    document.getElementById('count-todo').textContent       = todo.length;
    document.getElementById('count-inprogress').textContent = inprogress.length;
    document.getElementById('count-done').textContent       = done.length;
}

function renderColumn(col, tasks) {
    const el = document.getElementById(`tasks-${col}`);
    if (!tasks.length) {
        el.innerHTML = `
            <div class="empty">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <path d="M9 12h6"/>
                </svg>
                <div>No tasks</div>
            </div>`;
        return;
    }
    el.innerHTML = tasks.map(cardHTML).join('');
}

function cardHTML(t) {
    return `
        <div class="task-card" id="card-${t.id}" draggable="true"
             ondragstart="onDragStart(event,${t.id})"
             ondragend="onDragEnd()">
            <div class="task-card-top">
                <div class="task-title">${escHtml(t.title)}</div>
                <div class="task-actions">
                    <button class="icon-btn" onclick="openEditModal(${t.id})" title="Edit">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button class="icon-btn delete" onclick="deleteTask(${t.id})" title="Delete">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                        </svg>
                    </button>
                </div>
            </div>
            ${t.description ? `<div class="task-desc">${escHtml(t.description)}</div>` : ''}
            <div class="task-footer">
                <span class="priority-badge priority-${t.priority}">${t.priority}</span>
                <span class="task-id">#${t.id}</span>
            </div>
        </div>`;
}

// ─── PAGINATED LIST  GET /api/tasks/paginated ─────────────────────────────────

async function loadPaginated() {
    try {
        const res = await fetch(`${API}/paginated?page=${currentPage}&size=${pageSize}&sortBy=id`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        totalPages = data.totalPages;
        renderListTable(data.content.filter(t => !t.deleted));
        document.getElementById('pageInfo').textContent = `Page ${currentPage + 1} of ${totalPages}`;
        document.getElementById('prevBtn').disabled     = currentPage === 0;
        document.getElementById('nextBtn').disabled     = currentPage >= totalPages - 1;
    } catch {
        showToast('Failed to load paginated tasks', 'error');
    }
}

function renderListTable(tasks) {
    const tbody = document.getElementById('listBody');
    if (!tasks.length) {
        tbody.innerHTML = `<tr><td colspan="5"><div class="empty">No tasks found</div></td></tr>`;
        return;
    }
    tbody.innerHTML = tasks.map(t => `
        <tr>
            <td><span class="task-id">#${t.id}</span></td>
            <td>
                <div style="font-weight:500">${escHtml(t.title)}</div>
                ${t.description
                    ? `<div style="font-size:12px;color:var(--text-muted);margin-top:2px">
                           ${escHtml(t.description.substring(0, 60))}${t.description.length > 60 ? '…' : ''}
                       </div>`
                    : ''}
            </td>
            <td><span class="priority-badge priority-${t.priority}">${t.priority}</span></td>
            <td><span class="status-badge ${t.completed ? 'status-done' : 'status-todo'}">${t.completed ? 'Done' : 'To Do'}</span></td>
            <td>
                <div style="display:flex;gap:4px">
                    <button class="btn btn-ghost btn-sm"  onclick="openEditModal(${t.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTask(${t.id})">Delete</button>
                </div>
            </td>
        </tr>`).join('');
}

function changePage(dir) {
    const next = currentPage + dir;
    if (next < 0 || next >= totalPages) return;
    currentPage = next;
    loadPaginated();
}

function changePageSize() {
    pageSize    = parseInt(document.getElementById('pageSizeSelect').value);
    currentPage = 0;
    loadPaginated();
}

// ─── DELETED TAB ──────────────────────────────────────────────────────────────

function renderDeleted(tasks) {
    const grid = document.getElementById('deletedGrid');
    if (!tasks.length) {
        grid.innerHTML = `
            <div class="empty" style="grid-column:1/-1">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                </svg>
                <div>No deleted tasks</div>
            </div>`;
        return;
    }
    grid.innerHTML = tasks.map(t => `
        <div class="deleted-card">
            <div class="deleted-card-title">${escHtml(t.title)}</div>
            ${t.description ? `<div class="deleted-card-desc">${escHtml(t.description)}</div>` : ''}
            <div class="deleted-card-footer">
                <span class="priority-badge priority-${t.priority}">${t.priority}</span>
                <button class="btn btn-success btn-sm" onclick="restoreTask(${t.id})">↩ Restore</button>
            </div>
        </div>`).join('');
}

// PUT /api/tasks/{id}/restore
async function restoreTask(id) {
    try {
        const res = await fetch(`${API}/${id}/restore`, { method: 'PUT' });
        if (!res.ok) throw new Error();
        showToast('Task restored', 'success');
        await loadTasks();
        await loadDeletedTasks();
        renderDeleted(allDeleted);
    } catch {
        showToast('Failed to restore task', 'error');
    }
}

// ─── DRAG & DROP ──────────────────────────────────────────────────────────────

function onDragStart(e, id) {
    draggedId = Number(id);
    setTimeout(() => document.getElementById(`card-${id}`)?.classList.add('dragging'), 0);
    e.dataTransfer.effectAllowed = 'move';
}

function onDragEnd() {
    document.querySelectorAll('.task-card').forEach(c => c.classList.remove('dragging'));
}

function onDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function onDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

// PUT /api/tasks/{id} — updates completed status on drop
async function onDrop(e, completed) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (!draggedId) return;

    const id   = Number(draggedId);
    const task = allTasks.find(t => t.id === id);
    if (!task || task.completed === completed) { draggedId = null; return; }

    try {
        const res = await fetch(`${API}/${id}`, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ ...task, completed })
        });
        if (!res.ok) throw new Error();
        allTasks[allTasks.findIndex(t => t.id === id)] = await res.json();
        renderBoard(getFilteredTasks());
        updateStats();
        showToast(`Moved to ${completed ? 'Done' : 'To Do'}`, 'success');
    } catch {
        showToast('Failed to update task', 'error');
    }
    draggedId = null;
}

// ─── CREATE MODAL ─────────────────────────────────────────────────────────────

function openCreateModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Create Task';
    document.getElementById('saveBtn').textContent    = 'Create Task';
    document.getElementById('taskTitle').value        = '';
    document.getElementById('taskDesc').value         = '';
    document.getElementById('taskPriority').value     = 'MEDIUM';
    document.getElementById('taskCompleted').value    = 'false';
    document.getElementById('taskModal').classList.add('open');
    setTimeout(() => document.getElementById('taskTitle').focus(), 100);
}

// GET /api/tasks/{id}
async function openEditModal(id) {
    try {
        const res = await fetch(`${API}/${id}`);
        if (!res.ok) throw new Error();
        const task = await res.json();

        editingId = id;
        document.getElementById('modalTitle').textContent = `Edit Task #${id}`;
        document.getElementById('saveBtn').textContent    = 'Save Changes';
        document.getElementById('taskTitle').value        = task.title;
        document.getElementById('taskDesc').value         = task.description || '';
        document.getElementById('taskPriority').value     = task.priority;
        document.getElementById('taskCompleted').value    = String(task.completed);
        document.getElementById('taskModal').classList.add('open');
        setTimeout(() => document.getElementById('taskTitle').focus(), 100);
    } catch {
        showToast('Failed to load task', 'error');
    }
}

function closeModal() {
    document.getElementById('taskModal').classList.remove('open');
    editingId = null;
}

// POST /api/tasks  or  PUT /api/tasks/{id}
async function saveTask() {
    const title       = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDesc').value.trim();
    const priority    = document.getElementById('taskPriority').value;
    const completed   = document.getElementById('taskCompleted').value === 'true';

    if (!title) {
        const input = document.getElementById('taskTitle');
        input.style.borderColor = 'var(--high)';
        input.focus();
        setTimeout(() => input.style.borderColor = '', 1500);
        return;
    }

    const btn = document.getElementById('saveBtn');
    btn.innerHTML = '<span class="spinner"></span>';
    btn.disabled  = true;

    try {
        if (editingId) {
            const task = allTasks.find(t => t.id === editingId);
            const res  = await fetch(`${API}/${editingId}`, {
                method:  'PUT',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ ...task, title, description, priority, completed })
            });
            if (!res.ok) throw new Error();
            allTasks[allTasks.findIndex(t => t.id === editingId)] = await res.json();
            showToast('Task updated', 'success');
        } else {
            const res = await fetch(API, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ title, description, priority, completed })
            });
            if (!res.ok) throw new Error();
            allTasks.push(await res.json());
            showToast('Task created', 'success');
        }
        closeModal();
        updateStats();
        renderCurrentTab();
    } catch {
        showToast('Failed to save task', 'error');
    } finally {
        btn.innerHTML = editingId ? 'Save Changes' : 'Create Task';
        btn.disabled  = false;
    }
}

// DELETE /api/tasks/{id}
async function deleteTask(id) {
    if (!confirm('Delete this task? You can restore it from the Deleted tab.')) return;
    try {
        const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        await loadTasks();
        renderCurrentTab();
        showToast('Task deleted — restore from the Deleted tab', 'success');
    } catch {
        showToast('Failed to delete task', 'error');
    }
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

function showToast(msg, type = 'success') {
    const wrap = document.getElementById('toastWrap');
    const t    = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${type === 'success' ? '✓' : '✕'}</span> ${msg}`;
    wrap.appendChild(t);
    setTimeout(() => t.remove(), 3500);
}

// ─── KEYBOARD SHORTCUTS ───────────────────────────────────────────────────────

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter' && document.getElementById('taskModal').classList.contains('open'))
        if (document.activeElement.tagName !== 'TEXTAREA') saveTask();
});

document.getElementById('taskModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
});

// ─── UTILS ────────────────────────────────────────────────────────────────────

function escHtml(str) {
    return String(str)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;');
}

// ─── START ────────────────────────────────────────────────────────────────────

init();