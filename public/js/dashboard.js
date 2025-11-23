// public/js/dashboard.js  (REPLACE existing file with this)
async function safeFetch(url, opts = {}) {
    try {
        const res = await fetch(url, opts);
        if (!res.ok) {
            const txt = await res.text().catch(()=> '');
            throw new Error(`HTTP ${res.status} ${res.statusText} ${txt}`);
        }
        const ct = res.headers.get('content-type') || '';
        const text = await res.text();
        if (ct.includes('application/json') || /^\s*[\[\{]/.test(text)) {
            try { return JSON.parse(text); } catch(e) { console.warn('JSON parse failed, returning text', e); return text; }
        }
        return text;
    } catch (err) {
        console.warn('[dashboard] fetch error', err);
        return null;
    }
}

/* small helper: tolerant field extractor */
function getField(obj, names) {
    if (!obj || typeof obj !== 'object') return '';
    for (const n of names) {
        if (Object.prototype.hasOwnProperty.call(obj, n)) {
            const v = obj[n];
            if (v === null || v === undefined) return '';
            return String(v);
        }
    }
    // try case-insensitive match
    const keys = Object.keys(obj || {});
    for (const k of keys) {
        if (names.some(t => t.toLowerCase() === k.toLowerCase())) {
            return obj[k] == null ? '' : String(obj[k]);
        }
    }
    return '';
}

async function loadCountsAndBind() {
    const safe = document.getElementById('count-safe');
    const inj  = document.getElementById('count-injured');
    const miss = document.getElementById('count-missing');
    const totalEl = document.getElementById('count-total');
    if (!totalEl || !safe || !inj || !miss) {
        console.warn('Some dashboard count elements are missing');
        return;
    }

    const summary = await safeFetch('/api/reports/summary');
    if (!summary || !summary.statusCounts) {
        totalEl.innerText = '--';
        safe.innerText = '--';
        inj.innerText = '--';
        miss.innerText = '--';
        return;
    }

    const counts = summary.statusCounts || {};
    const total = Object.values(counts).reduce((a,b)=> a + Number(b || 0), 0);
    totalEl.innerText = total;
    safe.innerText = counts['Safe'] || counts['safe'] || 0;
    inj.innerText = counts['Injured'] || counts['injured'] || counts['Injured '] || 0;
    miss.innerText = counts['Missing'] || counts['missing'] || 0;

    // attach click handlers safely (overwrite existing to avoid duplicates)
    try {
        const safeCard = safe.closest('.stat-card');
        const injCard  = inj.closest('.stat-card');
        const missCard = miss.closest('.stat-card');
        const totCard  = totalEl.closest('.stat-card');

        if (safeCard) safeCard.onclick = () => openList('Safe','Safe Civilians');
        if (injCard)  injCard.onclick   = () => openList('Injured','Injured Civilians');
        if (missCard) missCard.onclick  = () => openList('Missing','Missing Civilians');
        if (totCard)  totCard.onclick   = () => openList('','All Civilians');
    } catch(e){ console.warn('attach handlers failed', e); }
}

async function openList(status, title) {
    const modal = document.getElementById('list-modal');
    const tbody = document.getElementById('modal-body');
    const titleEl = document.getElementById('modal-title');
    if (!modal || !tbody || !titleEl) {
        console.error('Modal elements missing');
        return;
    }

    titleEl.innerText = title || 'List';
    tbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-neutral-400"><i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Loading...</td></tr>`;
    modal.classList.remove('hidden');

    let url = '/api/civilians/list';
    if (status) url += '?status=' + encodeURIComponent(status);

    const data = await safeFetch(url);
    if (!data) {
        tbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-red-400">Failed to fetch data.</td></tr>`;
        return;
    }

    // if server returned object with data property, try to unwrap
    let list = data;
    if (!Array.isArray(list) && typeof list === 'object' && list.data && Array.isArray(list.data)) {
        list = list.data;
    }

    if (!Array.isArray(list) || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-neutral-400">No records.</td></tr>`;
        return;
    }

    // Build rows robustly — tolerate many field name variants
    const rows = list.map(item => {
        const id = getField(item, ['ID','Id','id']);
        const name = getField(item, ['Name','name','FullName','Fullname']);
        const age = getField(item, ['Age','age']);
        const gender = getField(item, ['Gender','gender','Sex']);
        const loc = getField(item, ['Location','location','Taluka','taluka','TalukaName']);
        const statusVal = getField(item, ['Status','status','CurrentStatus']);
        const triage = getField(item, ['InjurySeverity','injurySeverity','Injury','injury','InjurySeverity']);
        // render a compact card-like row (keeps format tidy)
        return `<tr class="border-b border-neutral-800">
            <td class="py-2 px-3 align-top font-mono text-sm text-neutral-300">${id}</td>
            <td class="py-2 px-3 align-top">
                <div class="font-semibold text-neutral-100">${escapeHtml(name)}</div>
                <div class="text-xs text-neutral-400 mt-1">${age ? age + ' yrs' : ''} ${gender ? '• ' + gender : ''}</div>
                <div class="text-xs text-neutral-500 mt-1"><i class="fa-solid fa-map-pin mr-1"></i> ${escapeHtml(loc)}</div>
            </td>
            <td class="py-2 px-3 align-top">
                <div class="text-sm font-bold">${escapeHtml(statusVal)}</div>
                <div class="text-xs text-neutral-400 mt-1">Triage: ${escapeHtml(triage)}</div>
            </td>
            <td class="py-2 px-3 align-top">
                <button onclick="deleteCivConfirm(${JSON.stringify(id)})" class="px-2 py-1 text-xs rounded bg-red-700 text-white">Delete</button>
            </td>
        </tr>`;
    });

    tbody.innerHTML = rows.join('');
}

/* helper: simple (safe) html escaper */
function escapeHtml(s) {
    if (s === null || s === undefined) return '';
    return String(s).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

/* delete helper that calls backend and refreshes list if modal open */
async function deleteCivConfirm(id) {
    if (!confirm('Delete civilian ID '+id+'?')) return;
    try {
        const res = await fetch('/api/civilians/' + encodeURIComponent(id), { method: 'DELETE' });
        if (res.ok) {
            // refresh counts and modal if open
            await loadCountsAndBind();
            // refresh visible modal list if it's open (try to re-run current filter)
            const modal = document.getElementById('list-modal');
            if (!modal) return;
            const title = document.getElementById('modal-title')?.innerText || '';
            // derive status from title
            let status = '';
            if (title.toLowerCase().includes('safe')) status = 'Safe';
            else if (title.toLowerCase().includes('injured')) status = 'Injured';
            else if (title.toLowerCase().includes('missing')) status = 'Missing';
            openList(status, title);
        } else {
            const txt = await res.text().catch(()=> '');
            alert('Delete failed: ' + (txt || res.status));
        }
    } catch (e) {
        console.error(e);
        alert('Delete request failed (network).');
    }
}

/* Attach modal close button */
document.getElementById('modal-close')?.addEventListener('click', () => {
    const modal = document.getElementById('list-modal');
    if (modal) modal.classList.add('hidden');
});

/* Run Smart Triage */
document.getElementById('btn-run-triage')?.addEventListener('click', async () => {
    const toast = document.getElementById('notification-toast');
    if (toast) {
        toast.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Running triage...`;
        toast.classList.remove('hidden','translate-x-full');
        toast.classList.add('translate-x-0');
    }
    const result = await safeFetch('/api/shelters/runTriage', { method: 'POST' });
    if (toast) {
        if (result && result.success) toast.innerHTML = `<i class="fa-solid fa-check mr-2"></i> Triage completed.`;
        else toast.innerHTML = `<i class="fa-solid fa-exclamation mr-2"></i> Triage failed.`;
        setTimeout(()=>{ toast.classList.add('translate-x-full'); setTimeout(()=> toast.classList.add('hidden'),500); }, 1800);
    }
    await loadCountsAndBind();
});

/* Report generation */
document.getElementById('btn-generate-report')?.addEventListener('click', async () => {
    const out = document.getElementById('report-output');
    if (out) { out.classList.remove('hidden'); out.innerText = 'Generating report...'; }
    const resp = await safeFetch('/api/reports/generate', { method: 'POST' });
    if (!resp || !resp.success) {
        if (out) out.innerText = 'Failed to generate report.';
        return;
    }
    if (out) out.innerText = resp.reportText || ('Report: ' + resp.filename);
    const viewBtn = document.getElementById('btn-view-report');
    const dlBtn = document.getElementById('btn-download-report');
    if (viewBtn) { viewBtn.disabled = false; viewBtn.dataset.file = resp.filename; }
    if (dlBtn)  { dlBtn.disabled  = false; dlBtn.dataset.file = resp.filename; }
});

/* view & download report */
document.getElementById('btn-view-report')?.addEventListener('click', function(){
    const f = this.dataset.file;
    if (!f) return alert('Generate a report first');
    window.open('/api/reports/view?file=' + encodeURIComponent(f), '_blank');
});
document.getElementById('btn-download-report')?.addEventListener('click', function(){
    const f = this.dataset.file;
    if (!f) return alert('Generate a report first');
    window.location.href = '/api/reports/download?file=' + encodeURIComponent(f);
});

/* initial loader */
document.addEventListener('DOMContentLoaded', () => {
    loadCountsAndBind();
    setInterval(loadCountsAndBind, 20000);
});
