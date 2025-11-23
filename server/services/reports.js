// server/services/reports.js
const fs = require('fs');
const path = require('path');
const csv = require('./csvHandler');
const cppBridge = require('./cppBridge'); // Import Bridge

const REPORT_DIR = path.join(__dirname, '..', 'data', 'reports');
const SIMULATION_REPORT = path.join(__dirname, '..', 'data', 'simulation_report.txt');

if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

// Helper for summary stats
async function getSummary() {
    const civilians = await csv.readCivilians();
    const shelters = await csv.readShelters();
    const resources = await csv.readResources();
    const statusCounts = civilians.reduce((acc, c) => {
        const s = c.Status || 'Unknown';
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});
    return { totalCivilians: civilians.length, statusCounts, shelterCount: shelters.length, resourceCount: resources.length };
}

async function generateReport() {
    try {
        // 1. TRY C++ GENERATION FIRST
        const cppResult = await cppBridge.generateReport();
        
        if (cppResult) {
            // If C++ ran, it updated 'simulation_report.txt'
            // We want to save a timestamped copy in /reports/ too
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `report_${timestamp}.txt`;
            const filepath = path.join(REPORT_DIR, filename);
            
            let content = "";
            if (fs.existsSync(SIMULATION_REPORT)) {
                content = fs.readFileSync(SIMULATION_REPORT, 'utf8');
                fs.writeFileSync(filepath, content);
            } else {
                content = "Error: C++ report file not found.";
            }

            return { success: true, filename, filepath, reportText: content };
        }
    } catch (e) {
        console.error("C++ Report Gen failed, falling back to JS", e);
    }

    // 2. FALLBACK (Simple JS Report) - only runs if C++ fails
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `report_JS_FALLBACK_${ts}.txt`;
    const filepath = path.join(REPORT_DIR, filename);
    const text = "Fallback Report (C++ Module Offline)\nSee console for details.";
    fs.writeFileSync(filepath, text, 'utf8');
    return { success: true, filename, filepath, reportText: text };
}

async function getReportText(filename) {
    const filepath = path.join(REPORT_DIR, filename);
    if (!fs.existsSync(filepath)) return null;
    return fs.readFileSync(filepath, 'utf8');
}

async function getReportPath(filename) {
    const filepath = path.join(REPORT_DIR, filename);
    if (!fs.existsSync(filepath)) return null;
    return filepath;
}

module.exports = { getSummary, generateReport, getReportPath, getReportText };
