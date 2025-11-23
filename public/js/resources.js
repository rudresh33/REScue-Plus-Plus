// public/js/resources.js
window.resourcesLoaded = true;

async function safeFetch(url, opts = {}) {
  try {
    const r = await fetch(url, opts);
    if (!r.ok) {
      const txt = await r.text().catch(()=>null);
      throw new Error(`${r.status} ${r.statusText} ${txt ? ' - '+txt : ''}`);
    }
    return await r.json();
  } catch (err) {
    console.error('[resources] fetch error', err);
    return null;
  }
}

async function loadResources() {
  const body = document.getElementById('resources-body');
  body.innerHTML = '<tr><td colspan="7" class="p-4 text-center">Loading...</td></tr>';
  const data = await safeFetch('/api/resources');
  if (!Array.isArray(data)) {
    body.innerHTML = '<tr><td colspan="7" class="p-4 text-center text-red-400">Failed to load</td></tr>';
    return;
  }
  body.innerHTML = data.map(r => `
    <tr class="border-t">
      <td class="p-2">${r.ID}</td>
      <td class="p-2">${r.Type}</td>
      <td class="p-2">${r.Quantity}</td>
      <td class="p-2">${r.Unit}</td>
      <td class="p-2">${r.Location}</td>
      <td class="p-2">${r.Priority || ''}</td>
      <td class="p-2">
        <button class="restock px-2 py-1 bg-neutral-700 rounded text-sm" data-id="${r.ID}">Restock</button>
        <button class="edit px-2 py-1 bg-neutral-700 rounded text-sm" data-id="${r.ID}">Edit</button>
        <button class="delete px-2 py-1 bg-red-700 rounded text-sm text-white" data-id="${r.ID}">Delete</button>
      </td>
    </tr>
  `).join('');
}

/* ---------- Modal wiring ---------- */
const openAddBtn = document.getElementById('open-add');
const addModal = document.getElementById('add-modal');
const closeAdd = document.getElementById('close-add');
const cancelAdd = document.getElementById('cancel-add');
const addForm = document.getElementById('add-resource-form');

openAddBtn?.addEventListener('click', () => {
  addModal.classList.remove('hidden');
  addModal.classList.add('flex');
  // focus first field
  setTimeout(()=>document.getElementById('r-type')?.focus(), 50);
});
closeAdd?.addEventListener('click', () => { addModal.classList.add('hidden'); addModal.classList.remove('flex'); });
cancelAdd?.addEventListener('click', () => { addModal.classList.add('hidden'); addModal.classList.remove('flex'); });

/* ---------- Add form submit ---------- */
addForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    Type: document.getElementById('r-type').value.trim(),
    Quantity: Number(document.getElementById('r-qty').value || 0),
    Unit: document.getElementById('r-unit').value.trim(),
    Location: document.getElementById('r-location').value.trim() || 'All',
    Priority: document.getElementById('r-priority').value
  };

  // Basic validation
  if (!payload.Type) { alert('Type required'); return; }

  const res = await safeFetch('/api/resources/add', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });

  if (res && (res.ID || res.success)) {
    addModal.classList.add('hidden');
    addModal.classList.remove('flex');
    addForm.reset();
    await loadResources();
  } else {
    alert('Failed to add resource. Check console.');
  }
});

/* ---------- Delegated buttons: restock / edit / delete ---------- */
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('button.restock');
  if (btn) {
    const id = btn.dataset.id;
    const delta = prompt('Enter restock amount (+ to add, - to remove). Example: 200 or -400');
    if (delta === null) return;
    const n = Number(delta);
    if (isNaN(n)) return alert('Invalid number');
    await safeFetch(`/api/resources/restock/${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ delta: n })
    });
    await loadResources();
    return;
  }

  const del = e.target.closest('button.delete');
  if (del) {
    const id = del.dataset.id;
    if (!confirm('Delete resource ' + id + '?')) return;
    await safeFetch(`/api/resources/${encodeURIComponent(id)}`, { method: 'DELETE' });
    await loadResources();
    return;
  }

  const edit = e.target.closest('button.edit');
  if (edit) {
    const id = edit.dataset.id;
    const qty = prompt('Enter new quantity (integer)');
    if (qty === null) return;
    if (isNaN(Number(qty))) return alert('Invalid number');
    await safeFetch(`/api/resources/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ Quantity: Number(qty) })
    });
    await loadResources();
    return;
  }
});

/* ---------- Search ---------- */
document.getElementById('res-search')?.addEventListener('input', (e) => {
  const q = (e.target.value || '').toLowerCase().trim();
  const rows = document.querySelectorAll('#resources-body tr');
  rows.forEach(r => {
    r.style.display = r.innerText.toLowerCase().includes(q) ? '' : 'none';
  });
});

/* ---------- Initial load ---------- */
document.addEventListener('DOMContentLoaded', loadResources);
