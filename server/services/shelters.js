// server/services/shelters.js
const csv = require('./csvHandler');
const cppBridge = require('./cppBridge');
const resourcesSvc = require('./resources'); 

const NEARBY = {
    "Pernem": ["Bicholim", "Bardez"],
    "Bardez": ["Pernem", "Bicholim", "Tiswadi"],
    "Bicholim": ["Pernem", "Bardez", "Tiswadi", "Sattari", "Ponda"],
    "Tiswadi": ["Bardez", "Bicholim", "Ponda", "Mormugao"],
    "Sattari": ["Bicholim", "Ponda", "Sanguem"],
    "Ponda": ["Bicholim", "Tiswadi", "Mormugao", "Sanguem", "Quepem"],
    "Mormugao": ["Tiswadi", "Ponda", "Salcete"],
    "Salcete": ["Mormugao", "Quepem"],
    "Quepem": ["Ponda", "Salcete", "Sanguem", "Canacona"],
    "Sanguem": ["Sattari", "Ponda", "Quepem", "Canacona"],
    "Canacona": ["Quepem", "Sanguem"],
    "Dharbandora": ["Ponda", "Sanguem"]
};

function requiredCategoryFor(injury) {
    if (!injury) return "General";
    injury = String(injury).trim();
    if (injury === "Critical" || injury === "Moderate") return "Hospital";
    return "General";
}

async function getShelters() {
    try {
        const rows = await csv.readShelters();
        return rows.map(s => ({
            ID: Number(s.ID),
            Name: s.Name,
            Capacity: Number(s.Capacity || 0),
            Location: s.Location,
            Category: s.Category,
            Occupancy: Number(s.Occupancy || 0)
        }));
    } catch (err) {
        console.error('[Shelters] getShelters failed', err);
        return [];
    }
}

async function addShelter(newS) {
    try {
        const current = await getShelters();
        const newID = current.length > 0 ? Math.max(...current.map(s => s.ID)) + 1 : 1;
        const shelter = {
            ID: newID,
            Name: newS.name || newS.Name || `Shelter #${newID}`,
            Capacity: Number(newS.capacity ?? newS.Capacity ?? 0),
            Location: newS.location || newS.Location || '',
            Category: newS.category || newS.Category || 'General',
            Occupancy: 0
        };
        current.push(shelter);
        await csv.writeShelters(current);
        
        // Sync C++
        const addon = cppBridge.getCppBridge();
        if (addon && addon.loadData) addon.loadData();

        return shelter;
    } catch (err) {
        console.error('[Shelters] addShelter failed', err);
        throw err;
    }
}

// FIX: Added missing remove function
async function removeShelterById(id, force) {
    try {
        const shelters = await getShelters();
        const idx = shelters.findIndex(s => String(s.ID) === String(id));
        
        if (idx === -1) return { success: false, error: "Shelter not found" };
        
        const shelter = shelters[idx];
        
        // Safety check for occupants
        if (shelter.Occupancy > 0 && !force) {
            return { success: false, error: `Shelter has ${shelter.Occupancy} occupants. Force delete to unassign them.` };
        }

        // Remove shelter
        shelters.splice(idx, 1);
        await csv.writeShelters(shelters);

        // Unassign civilians who were in this shelter
        const civilians = await csv.readCivilians();
        let civsModified = false;
        civilians.forEach(c => {
            if (String(c.ShelterID) === String(id)) {
                c.ShelterID = "";
                civsModified = true;
            }
        });
        
        if (civsModified) {
            await csv.writeCivilians(civilians);
        }

        // Sync C++ backend
        const addon = cppBridge.getCppBridge();
        if (addon && addon.loadData) addon.loadData();

        return { success: true };
    } catch (err) {
        console.error('[Shelters] remove failed', err);
        return { success: false, error: err.message };
    }
}

function pickShelter(shelters, location, category) {
    const same = shelters.filter(s => s.Location === location && s.Category === category && (s.Occupancy < s.Capacity));
    if (same.length > 0) return same[0];

    const nearList = NEARBY[location] || [];
    for (const n of nearList) {
        const found = shelters.find(s => s.Location === n && s.Category === category && (s.Occupancy < s.Capacity));
        if (found) return found;
    }

    const any = shelters.find(s => s.Category === category && (s.Occupancy < s.Capacity));
    return any || null;
}

async function runSmartTriage() {
    try {
        // Prefer C++ Engine
        const addon = cppBridge.getCppBridge();
        if (addon && addon.runAutoTriage) {
            console.log("[Shelters] Using C++ Engine for Triage...");
            const msg = addon.runAutoTriage();
            return { success: true, message: msg };
        }

        // Fallback JS Logic
        const shelters = await getShelters();
        const civilians = await csv.readCivilians();

        if (!shelters || shelters.length === 0) {
            return { success: false, message: "No shelters available." };
        }

        for (const s of shelters) s.Occupancy = 0;

        for (const civ of civilians) {
            const injury = civ.InjurySeverity || "None";
            const location = civ.Location;
            const category = requiredCategoryFor(injury);
            const chosen = pickShelter(shelters, location, category);

            if (chosen) {
                civ.ShelterID = String(chosen.ID);
                chosen.Occupancy++;
                
                // Simple Resource Allocation
                if (resourcesSvc && typeof resourcesSvc.allocateForCivilian === 'function') {
                    const req = { "Water Bottle": 2, "Food Pack": 1 };
                    if (injury === 'Critical') req["First Aid Kit"] = 1;
                    
                    // Convert requirements to integers
                    const reqInts = {};
                    Object.entries(req).forEach(([k,v]) => reqInts[k] = Math.floor(v));
                    
                    await resourcesSvc.allocateForCivilian(civ, reqInts);
                }
            } else {
                civ.ShelterID = "";
            }
        }

        await csv.writeShelters(shelters);
        await csv.writeCivilians(civilians);

        return { success: true, message: "JS Triage complete (C++ addon inactive)." };
    } catch (err) {
        console.error('[Shelters] runSmartTriage failed', err);
        return { success: false, message: err.message || 'Triage error' };
    }
}

module.exports = {
    getShelters,
    addShelter,
    removeShelterById, // Exported now
    runSmartTriage
};
