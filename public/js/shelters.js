// public/js/shelters.js

async function loadShelters() {
    const grid = document.getElementById("shelter-grid");
    grid.innerHTML = `
        <p class="text-neutral-500 col-span-3 text-center py-10">
            <i class="fa-solid fa-circle-notch fa-spin"></i> Loading shelters...
        </p>`;

    try {
        const res = await fetch("/api/shelters");
        const shelters = await res.json();

        if (!Array.isArray(shelters) || shelters.length === 0) {
            grid.innerHTML = `<p class="text-neutral-500 col-span-3 text-center py-10">No shelters found.</p>`;
            return;
        }

        grid.innerHTML = "";

        shelters.forEach(s => {
            const pct = Math.round((s.Occupancy / s.Capacity) * 100);

            let barColor = "bg-neutral-600";
            let icon = "fa-tents";
            let iconBg = "bg-neutral-700/60 text-neutral-300";
            let typeLabel = "General Shelter";
            let typeColor = "text-neutral-400";

            if (s.Category === "Hospital") {
                barColor = "bg-red-700";
                icon = "fa-hospital";
                iconBg = "bg-red-900/30 text-red-400";
                typeLabel = "Hospital";
                typeColor = "text-red-400 font-semibold";
            }

            if (pct > 90) barColor = "bg-red-800";

            grid.innerHTML += `
                <div class="bg-neutral-800/40 border border-neutral-700/50 p-6 rounded-xl hover:border-neutral-600/50">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-bold text-neutral-100">${s.Name}</h3>
                            <span class="text-xs bg-neutral-700/50 text-neutral-400 px-2 py-1 rounded inline-block mt-2">
                                <i class="fa-solid fa-map-pin mr-1"></i> ${s.Location}
                            </span>
                        </div>

                        <div class="flex gap-2">
                            <button class="delete-shelter px-2 py-1 bg-red-700/80 text-white rounded text-sm"
                                    data-id="${s.ID}">
                                <i class="fa-solid fa-trash"></i>
                            </button>

                            <div class="w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center">
                                <i class="fa-solid ${icon} text-xl"></i>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4">
                        <div class="flex justify-between text-xs text-neutral-500 font-bold uppercase">
                            <span>Occupancy</span>
                            <span>${s.Occupancy} / ${s.Capacity}</span>
                        </div>

                        <div class="w-full mt-2 bg-neutral-700/50 h-2.5 rounded-full">
                            <div class="${barColor} h-2.5 rounded-full" style="width:${pct}%"></div>
                        </div>

                        <p class="text-xs mt-3 ${typeColor} text-right">${typeLabel}</p>
                    </div>
                </div>
            `;
        });

    } catch (err) {
        console.error("Shelter load error:", err);
        grid.innerHTML = `<p class="text-red-500 text-center col-span-3 py-10">Failed to load shelters.</p>`;
    }
}

/* -------------------------------
   ADD SHELTER
--------------------------------*/
document.getElementById("add-shelter-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        name: document.getElementById("s-name").value,
        capacity: document.getElementById("s-capacity").value,
        location: document.getElementById("s-location").value,
        category: document.getElementById("s-category").value
    };

    const res = await fetch("/api/shelters/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) return alert("Failed to add shelter");

    document.getElementById("add-shelter-modal").classList.add("hidden");
    loadShelters();
});

/* -------------------------------
   DELETE SHELTER
--------------------------------*/
document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".delete-shelter");
    if (!btn) return;

    const id = btn.dataset.id;
    if (!id) return;

    if (!confirm("Delete this shelter? It will unassign all civilians under it.")) return;

    let res = await fetch(`/api/shelters/${id}`, { method: "DELETE" });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));

        if (body.error && body.error.includes("occupants")) {
            if (confirm("Shelter has occupants. Force delete?")) {
                res = await fetch(`/api/shelters/${id}?force=1`, { method: "DELETE" });
            }
        }
    }

    if (res.ok) {
        alert("Shelter deleted.");
        loadShelters();
    } else {
        alert("Delete failed.");
    }
});

document.addEventListener("DOMContentLoaded", loadShelters);
