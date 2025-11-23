const { getCppBridge } = require('../services/cppBridge');

class CivilianController {
    async getAll(req, res, next) {
        try {
            const bridge = getCppBridge();
            const civilians = bridge.getAllCivilians();
            res.json(civilians);
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const bridge = getCppBridge();
            const civilian = bridge.getCivilianById(parseInt(req.params.id));
            
            if (Object.keys(civilian).length === 0) {
                return res.status(404).json({ error: 'Civilian not found' });
            }
            
            res.json(civilian);
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const bridge = getCppBridge();
            const newCivilian = bridge.addCivilian(req.body);
            res.status(201).json(newCivilian);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const bridge = getCppBridge();
            const updated = bridge.updateCivilian(parseInt(req.params.id), req.body);
            res.json(updated);
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const bridge = getCppBridge();
            const result = bridge.deleteCivilian(parseInt(req.params.id));
            
            if (result) {
                res.json({ message: 'Civilian deleted successfully' });
            } else {
                res.status(404).json({ error: 'Civilian not found' });
            }
        } catch (error) {
            next(error);
        }
    }

    async getByStatus(req, res, next) {
        try {
            const bridge = getCppBridge();
            const civilians = bridge.searchCiviliansByStatus(parseInt(req.params.status));
            res.json(civilians);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CivilianController();

