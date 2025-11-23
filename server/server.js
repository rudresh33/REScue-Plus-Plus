const express = require('express');
const path = require('path');
const fs = require('fs');
const Papa = require('papaparse');
const csv = require('./services/csvHandler');   // <-- NEW
const cppBridge = require('./services/cppBridge');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ====================================================
// 1) USE THE NEW CIVILIANS ROUTE (REPLACES OLD LOGIC)
// ====================================================
app.use("/api/civilians", require("./routes/civilians"));

// ====================================================
// 2) SHELTERS API ROUTE (MISSING EARLIER)
// ====================================================
app.use("/api/shelters", require("./routes/shelters"));

// near other route registrations
app.use('/api/resources', require('./routes/resources'));

app.use('/api/reports', require('./routes/reports'));



// ====================================================
// 2) KEEP RESOURCES, REPORTS & OTHER LOGIC AS IS
// ====================================================

// Path to resources CSV
const RESOURCE_FILE = path.join(__dirname, 'data', 'resources.csv');

// Load Resources
app.get('/api/resources', (req, res) => {
    try {
        const csvData = fs.readFileSync(RESOURCE_FILE, 'utf8');
        Papa.parse(csvData, {
            header: true,
            complete: results => res.json(results.data.filter(r => r.ID)),
            error: err => res.status(500).json({ error: err.message })
        });
    } catch (err) {
        console.error("Error reading resources:", err);
        res.status(500).json({ error: "Failed to load resources" });
    }
});

// Add Resource
app.post('/api/resources', (req, res) => {
    try {
        const { Type, Quantity, Unit, Location, Priority } = req.body;
        if (!Type || !Quantity) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const csvData = fs.readFileSync(RESOURCE_FILE, 'utf8');
        const parsed = Papa.parse(csvData, { header: true });
        const resources = parsed.data.filter(r => r.ID);

        const newID = resources.length > 0
            ? Math.max(...resources.map(r => Number(r.ID))) + 1
            : 1;

        const newResource = {
            ID: newID,
            Type,
            Quantity,
            Unit,
            Location,
            Priority
        };

        resources.push(newResource);

        const newCsvData = Papa.unparse(resources);
        fs.writeFileSync(RESOURCE_FILE, newCsvData, 'utf8');

        res.json({ success: true, newResource });
    } catch (err) {
        console.error("Error adding resource:", err);
        res.status(500).json({ error: "Failed to add resource" });
    }
});

// Reports from C++ (if available)
app.get('/api/reports', (req, res) => {
    try {
        if (cppBridge.addon?.generateReports) {
            const report = cppBridge.generateReports();
            res.json(report);
        } else {
            res.json({ message: "C++ backend not loaded. Reports unavailable." });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to generate report" });
    }
});

// ====================================================
// 3) FALLBACK: SERVE FRONTEND PAGES
// ====================================================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`[Server] 🚀 Running on http://localhost:${PORT}`);
});
