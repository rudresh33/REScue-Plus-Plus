// server/services/csvHandler.js
// UNIVERSAL CSV READER/WRITER (ASYNC) + CONVENIENCE HELPERS
// Safe atomic write via tmp -> rename
// Provides: readCSV, writeCSV, readCivilians, writeCivilians,
// readShelters, writeShelters, readResources, writeResources

const fs = require('fs').promises;
const path = require('path');
const Papa = require('papaparse');

const DATA_DIR = path.join(__dirname, '..', 'data');

function safeFilePath(p) {
    if (!p) return null;
    return path.isAbsolute(p) ? p : path.join(DATA_DIR, p);
}

/* --------------------------------------------------
   Generic CSV read (async)
-------------------------------------------------- */
async function readCSV(filePath) {
    try {
        const abs = safeFilePath(filePath) || filePath;

        let text;
        try {
            text = await fs.readFile(abs, 'utf8');
        } catch (err) {
            if (err.code === 'ENOENT') return []; // file not found → empty list
            throw err;
        }

        const trimmed = text.trim();
        if (!trimmed) return [];

        const parsed = Papa.parse(trimmed, {
            header: true,
            skipEmptyLines: true
        });

        return parsed.data;
    } catch (err) {
        console.error('[CSV] readCSV failed:', err);
        return [];
    }
}

/* --------------------------------------------------
   Generic CSV write (async + atomic)
-------------------------------------------------- */
async function writeCSV(filePath, rows) {
    try {
        const abs = safeFilePath(filePath) || filePath;
        const csvText = Papa.unparse(rows || []);
        const tmpFile = abs + '.tmp';

        // Write tmp first
        await fs.writeFile(tmpFile, csvText, 'utf8');

        // Then atomically rename
        await fs.rename(tmpFile, abs);

        return true;
    } catch (err) {
        console.error('[CSV] writeCSV failed:', err);
        return false;
    }
}

/* --------------------------------------------------
   Convenience helpers
-------------------------------------------------- */
function getDefaultPath(name) {
    return path.join(DATA_DIR, name);
}

async function readCivilians() {
    return await readCSV(getDefaultPath('civilians.csv'));
}
async function writeCivilians(rows) {
    return await writeCSV(getDefaultPath('civilians.csv'), rows);
}

async function readShelters() {
    return await readCSV(getDefaultPath('shelters.csv'));
}
async function writeShelters(rows) {
    return await writeCSV(getDefaultPath('shelters.csv'), rows);
}

async function readResources() {
    return await readCSV(getDefaultPath('resources.csv'));
}
async function writeResources(rows) {
    return await writeCSV(getDefaultPath('resources.csv'), rows);
}

/* --------------------------------------------------
   Export API
-------------------------------------------------- */
module.exports = {
    readCSV,
    writeCSV,
    readCivilians,
    writeCivilians,
    readShelters,
    writeShelters,
    readResources,
    writeResources
};
