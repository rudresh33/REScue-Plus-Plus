// public/js/civilians.js
// ================================================
// CIVILIANS FRONTEND CONTROLLER — FIXED INPUTS
// ================================================

// Safe JSON fetch helper
async function safeFetch(url, options = {}) {
    try {
        const res = await fetch(url, options);
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`HTTP ${res.status}: ${text}`);
        }
        return await res.json();
    } catch (err) {
        console.warn("[FETCH ERROR]", url, err);
        return null;
    }
}

let CIVILIANS_CACHE = []; // stored local list for live search

// =================================================
// LOAD ALL CIVILIANS
// =================================================
async function loadCivilians() {
    const body = document.getElementById("civilians-body");

    body.innerHTML = `
        <tr><td colspan="9" class="py-6 text-center text-neutral-500">
            <i class="fa-solid fa-circle-notch fa-spin"></i> Loading...
        </td></tr>
    `;

    const data = await safeFetch("/api/civilians");
    if (!Array.isArray(data)) {
        body.innerHTML = `
            <tr><td colspan="9" class="py-6 text-center text-red-500">
                Failed to load civilians.
            </td></tr>
        `;
        return;
    }

    CIVILIANS_CACHE = data;
    renderTable(data);
}

// =================================================
// RENDER TABLE FROM LIST
// =================================================
function renderTable(list) {
    const body = document.getElementById("civilians-body");

    if (list.length === 0) {
        body.innerHTML = `
            <tr><td colspan="9" class="py-6 text-center text-neutral-500">
                No civilians found.
            </td></tr>
        `;
        return;
    }

    body.innerHTML = list.map(c => civilianRowHTML(c)).join("");
}

// =================================================
// CIVILIAN ROW HTML
// =================================================
function civilianRowHTML(c) {
    return `
    <tr class="border-b border-neutral-800 hover:bg-neutral-800/40">

        <td class="py-3 px-4 text-neutral-400 font-mono text-sm">${c.ID}</td>

        <td class="py-3 px-4 min-w-[160px] font-medium text-neutral-200">${c.Name}</td>

        <td class="py-3 px-4">${c.Age}</td>
        <td class="py-3 px-4">${c.Gender}</td>
        <td class="py-3 px-4">${c.Location}</td>

        <td class="py-3 px-4">
            <select
                onchange="updateStatus(${c.ID}, this.value)"
                class="bg-neutral-800 border border-neutral-700 rounded p-1 text-neutral-200 text-sm focus:border-blue-500 outline-none">
                <option ${c.Status === "Safe" ? "selected" : ""}>Safe</option>
                <option ${c.Status === "Injured" ? "selected" : ""}>Injured</option>
                <option ${c.Status === "Missing" ? "selected" : ""}>Missing</option>
            </select>
        </td>

        <td class="py-3 px-4">
            <select
                onchange="updateTriage(${c.ID}, this.value)"
                class="bg-neutral-800 border border-neutral-700 rounded p-1 text-neutral-200 text-sm focus:border-blue-500 outline-none">
                <option ${c.InjurySeverity === "None" ? "selected" : ""}>None</option>
                <option ${c.InjurySeverity === "Minor" ? "selected" : ""}>Minor</option>
                <option ${c.InjurySeverity === "Moderate" ? "selected" : ""}>Moderate</option>
                <option ${c.InjurySeverity === "Critical" ? "selected" : ""}>Critical</option>
            </select>
        </td>

        <td class="py-3 px-4 text-neutral-400">${c.ShelterID || "-"}</td>

        <td class="py-3 px-4">
            <button onclick="deleteCivilian(${c.ID})"
                class="text-red-500 hover:text-red-400 text-lg transition-colors">
                <i class="fa-solid fa-trash"></i>
            </button>
        </td>

    </tr>
    `;
}

// =================================================
// SEARCH (LIVE)
// =================================================
document.getElementById("search").addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();

    const filtered = CIVILIANS_CACHE.filter(c =>
        (c.Name || "").toLowerCase().includes(q) ||
        String(c.ID).includes(q) ||
        (c.Gender || "").toLowerCase().includes(q) ||
        (c.Location || "").toLowerCase().includes(q) ||
        (c.Status || "").toLowerCase().includes(q) ||
        (c.InjurySeverity || "").toLowerCase().includes(q) ||
        (c.ShelterID || "").toLowerCase().includes(q)
    );

    renderTable(filtered);
});

// =================================================
// ADD CIVILIAN (FIXED)
// =================================================
document.getElementById("add-civilian-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    // FIX: Use document.getElementById explicitly to avoid window variable conflicts
    const payload = {
        Name: document.getElementById("name").value,
        Age: document.getElementById("age").value,
        Gender: document.getElementById("gender").value,
        Location: document.getElementById("location").value,
        Status: document.getElementById("status").value,
        InjurySeverity: document.getElementById("injury").value
    };

    const out = await safeFetch("/api/civilians/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    if (out && out.success) {
        document.getElementById("add-modal").classList.add("hidden");
        // Clear form
        document.getElementById("add-civilian-form").reset();
        loadCivilians();
    } else {
        alert("Failed to add civilian.");
    }
});

// =================================================
// UPDATE STATUS
// =================================================
async function updateStatus(ID, Status) {
    await safeFetch("/api/civilians/updateStatus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ID, Status })
    });
    loadCivilians();
}

// =================================================
// UPDATE TRIAGE
// =================================================
async function updateTriage(ID, InjurySeverity) {
    await safeFetch("/api/civilians/updateTriage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ID, InjurySeverity })
    });
    loadCivilians();
}

// =================================================
// DELETE CIVILIAN
// =================================================
async function deleteCivilian(ID) {
    if (!confirm("Delete this civilian?")) return;

    const res = await fetch(`/api/civilians/delete/${ID}`, { method: "DELETE" });

    if (res.ok) {
        loadCivilians();
    } else {
        const txt = await res.text().catch(() => "");
        alert("Delete failed: " + txt);
    }
}

// =================================================
// INIT
// =================================================
document.addEventListener("DOMContentLoaded", loadCivilians);
