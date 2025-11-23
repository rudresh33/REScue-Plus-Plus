// server/routes/civilians.js
//----------------------------------------------------
// CIVILIANS API ROUTES (CSV Backend)
//----------------------------------------------------

const express = require("express");
const router = express.Router();

const civiliansService = require("../services/civilians");

// ----------------------------------------------------
// LIST CIVILIANS FOR DASHBOARD MODAL (supports ?status=)
// ----------------------------------------------------
router.get("/list", async (req, res) => {
    try {
        let list = await civiliansService.getAllCivilians();

        const status = req.query.status?.trim();
        if (status && status.length > 0) {
            list = list.filter(c => (c.Status || "").trim() === status);
        }

        res.json(list);
    } catch (err) {
        console.error("[CIV ROUTE] /list error:", err);
        res.status(500).json({ error: "Failed to load civilian list" });
    }
});

// ----------------------------------------------------
// GET ALL CIVILIANS  (with ?status= filter)
// ----------------------------------------------------
router.get("/", async (req, res) => {
    try {
        let list = await civiliansService.getAllCivilians();

        if (req.query.status) {
            const status = req.query.status.trim();
            list = list.filter(c => (c.Status || "").trim() === status);
        }

        res.json(list);
    } catch (err) {
        console.error("[CIV ROUTE] Get all error:", err);
        res.status(500).json({ error: "Failed to load civilians" });
    }
});

// ----------------------------------------------------
// ADD NEW CIVILIAN
// ----------------------------------------------------
router.post("/add", async (req, res) => {
    try {
        const saved = await civiliansService.addCivilian(req.body);
        res.json({ success: true, civilian: saved });
    } catch (err) {
        console.error("[CIV ROUTE] Add error:", err);
        res.status(500).json({ error: "Failed to add civilian" });
    }
});

// ----------------------------------------------------
// UPDATE CIVILIAN STATUS
// ----------------------------------------------------
router.post("/updateStatus", async (req, res) => {
    try {
        const { ID, Status } = req.body;

        if (!ID || !Status)
            return res.status(400).json({ error: "Missing ID or Status" });

        const ok = await civiliansService.updateCivilianStatus(ID, Status);
        res.json({ success: ok });
    } catch (err) {
        console.error("[CIV ROUTE] Status update error:", err);
        res.status(500).json({ error: "Failed to update status" });
    }
});

// ----------------------------------------------------
// UPDATE TRIAGE
// ----------------------------------------------------
router.post("/updateTriage", async (req, res) => {
    try {
        const { ID, InjurySeverity } = req.body;

        if (!ID || !InjurySeverity)
            return res.status(400).json({ error: "Missing ID or InjurySeverity" });

        const ok = await civiliansService.updateCivilianTriage(ID, InjurySeverity);
        res.json({ success: ok });
    } catch (err) {
        console.error("[CIV ROUTE] Triage update error:", err);
        res.status(500).json({ error: "Failed to update triage" });
    }
});

// ----------------------------------------------------
// DELETE CIVILIAN
// ----------------------------------------------------
router.delete("/delete/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const ok = await civiliansService.deleteCivilian(id);

        res.json({ success: ok });
    } catch (err) {
        console.error("[CIV ROUTE] Delete error:", err);
        res.status(500).json({ error: "Failed to delete civilian" });
    }
});

module.exports = router;
