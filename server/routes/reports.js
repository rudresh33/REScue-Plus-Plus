// server/routes/reports.js
const express = require('express');
const router = express.Router();
const reportsSvc = require('../services/reports');

router.get('/summary', async (req, res) => {
    try {
        const summary = await reportsSvc.getSummary();
        res.json(summary);
    } catch (err) {
        console.error('[Reports] summary error', err);
        res.status(500).json({ error: 'Failed to get summary' });
    }
});

router.post('/generate', async (req, res) => {
    try {
        const result = await reportsSvc.generateReport();
        res.json(result);
    } catch (err) {
        console.error('[Reports] generate error', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/view', async (req, res) => {
    try {
        const file = req.query.file;
        if (!file) return res.status(400).send('file param required');
        const text = await reportsSvc.getReportText(file);
        if (text == null) return res.status(404).send('Not found');
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.send(text);
    } catch (err) {
        console.error('[Reports] view error', err);
        res.status(500).send('Error');
    }
});

router.get('/download', async (req, res) => {
    try {
        const file = req.query.file;
        if (!file) return res.status(400).send('file param required');
        const path = await reportsSvc.getReportPath(file);
        if (!path) return res.status(404).send('Not found');
        res.download(path, file);
    } catch (err) {
        console.error('[Reports] download error', err);
        res.status(500).send('Error');
    }
});

module.exports = router;
