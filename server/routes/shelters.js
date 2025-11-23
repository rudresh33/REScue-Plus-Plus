// server/routes/shelters.js
const express = require("express");
const router = express.Router();
const shelters = require("../services/shelters");

// GET all
router.get("/", async (req, res) => {
    const list = await shelters.getShelters();
    res.json(list);
});

// ADD
router.post("/add", async (req, res) => {
    try {
        const s = await shelters.addShelter(req.body);
        res.json({ success: true, shelter: s });
    } catch (err) {
        console.error("[Routes][Shelters] add error:", err);
        res.status(500).json({ success: false, error: "Failed to add" });
    }
});

// RUN TRIAGE
router.post("/runTriage", async (req, res) => {
    try {
        const r = await shelters.runSmartTriage();
        res.json(r);
    } catch (err) {
        console.error("[Routes][Shelters] triage error:", err);
        res.status(500).json({ success: false, error: "Triage failed" });
    }
});

// DELETE shelter by id
router.delete("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const force = req.query.force === "1" || req.body.force === true;
        const result = await shelters.removeShelterById(id, force);
        if (!result.success) return res.status(400).json(result);
        return res.json({ success: true });
    } catch (err) {
        console.error("[Routes][Shelters] delete error:", err);
        res.status(500).json({ success: false, error: "Delete failed" });
    }
});

module.exports = router;
