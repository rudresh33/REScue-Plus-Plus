const path = require("path");
const fs = require("fs");
const csv = require("./csvHandler");

let addon = null;
// CORRECT PATH TO ADDON
const addonPath = path.join(__dirname, "..", "..", "backend", "cpp", "addon", "build", "Release", "rescue_addon.node");

if (fs.existsSync(addonPath)) {
    try {
        addon = require(addonPath);
        console.log("C++ Addon Loaded Successfully.");
        addon.loadData(); // Load data into C++ memory on startup
    } catch (err) {
        console.error("Error loading C++ addon:", err);
        addon = null;
    }
} else {
    console.warn("⚠ No C++ addon found. Using CSV fallback backend.");
}

// Fallback helpers
async function fallback_getAll() { return await csv.readCivilians(); }
async function fallback_add(civ) { /* ... */ return {}; }

module.exports = {
    getCppBridge: () => addon,

    // Expose C++ Report Generation
    async generateReport() {
        if (addon && addon.generateReport) {
            return addon.generateReport(); // Returns string "Report Generated"
        }
        return null; // Signal fallback
    },

    async runAutoTriage() {
        if (addon && addon.runAutoTriage) {
            return addon.runAutoTriage();
        }
        return "C++ Addon missing";
    },

    // ... other wrappers can remain or use direct access
    async getAllCivilians() {
        if (addon) return addon.getAllCivilians();
        return await csv.readCivilians();
    },
    
    async addCivilian(data) {
        if (addon) {
            const id = addon.addCivilian(data.Name, Number(data.Age), data.Gender, data.Location, data.InjurySeverity || "None");
            return { ID: id, ...data };
        }
        return await csv.addCivilian(data);
    }
};
