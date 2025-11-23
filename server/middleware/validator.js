const validateCivilian = (req, res, next) => {
    const { name, age, gender, location, status } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Valid name is required' });
    }
    
    if (!age || typeof age !== 'number' || age < 0 || age > 150) {
        return res.status(400).json({ error: 'Valid age is required (0-150)' });
    }
    
    if (!gender || !['Male', 'Female', 'Other'].includes(gender)) {
        return res.status(400).json({ error: 'Valid gender is required' });
    }
    
    if (!location || typeof location !== 'string' || location.trim().length === 0) {
        return res.status(400).json({ error: 'Valid location is required' });
    }
    
    if (status === undefined || ![0, 1, 2, 3].includes(status)) {
        return res.status(400).json({ error: 'Valid status is required (0-3)' });
    }
    
    next();
};

const validateResource = (req, res, next) => {
    const { resourceName, quantity } = req.body;
    
    if (!resourceName || typeof resourceName !== 'string') {
        return res.status(400).json({ error: 'Valid resource name is required' });
    }
    
    if (!quantity || typeof quantity !== 'number' || quantity <= 0) {
        return res.status(400).json({ error: 'Valid quantity is required (> 0)' });
    }
    
    next();
};

module.exports = {
    validateCivilian,
    validateResource
};

