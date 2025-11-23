// server/routes/resources.js
const express = require('express');
const router = express.Router();
const svc = require('../services/resources');

// GET /api/resources
router.get('/', async (req, res) => {
  try {
    const list = await svc.getResources();
    res.json(list);
  } catch (err) {
    console.error('[Resources] GET error', err);
    res.status(500).json({ error: 'Failed to load resources' });
  }
});

// POST /api/resources/add
router.post('/add', async (req, res) => {
  try {
    const r = await svc.addResource(req.body);
    res.json(r);
  } catch (err) {
    console.error('[Resources] ADD error', err);
    res.status(500).json({ error: 'Add failed' });
  }
});

// PUT /api/resources/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await svc.updateResource(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error('[Resources] UPDATE error', err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// POST /api/resources/restock/:id
router.post('/restock/:id', async (req, res) => {
  try {
    const delta = Number(req.body.delta);
    if (isNaN(delta)) return res.status(400).json({ error: 'delta must be number' });
    const updated = await svc.restock(req.params.id, delta);
    res.json(updated);
  } catch (err) {
    console.error('[Resources] RESTOCK error', err);
    res.status(500).json({ error: 'Restock failed' });
  }
});

// DELETE /api/resources/:id
router.delete('/:id', async (req, res) => {
  try {
    const ok = await svc.deleteResource(req.params.id);
    res.json({ success: !!ok });
  } catch (err) {
    console.error('[Resources] DELETE error', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;
