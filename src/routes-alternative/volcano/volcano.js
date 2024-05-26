const express = require('express');
const createError = require('http-errors');
const router = express.Router({ mergeParams: true });
const VolcanoDAO = require('../dao/volcano');

// Volcano route middleware
router.use((req, res, next) => {
    // Create a new instance of VolcanoDAO and attach it to the request object
    req.volcanoDAO = new VolcanoDAO(req.db, req.user);
    next();
});

// Route for getting volcano data by ID
router.get('/', async (req, res, next) => {
    try {
        // Get volcano ID parameter
        const volcanoID = parseInt(req.params.id);

        // Retrieve volcano by ID
        const volcano = await req.volcanoDAO.getVolcanoById(volcanoID);

        // Return the volcano with 200 status code
        res.status(200).json(volcano);
    } catch (err) {
        // Return an error if failed to get volcano by ID
        next(createError(err.status || 500, err.message || 'Failed to get volcano by ID'));
    }
});

module.exports = router;