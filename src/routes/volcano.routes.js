const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const jsonwebtoken = require('jsonwebtoken');
const VolcanoDAO = require('../dao/volcano.dao');

// Volcano route middleware
router.use((req, res, next) => {
    // DEBUG
    console.log('Volcano route')
    // Create a new instance of VolcanoDAO and attach it to the request object
    req.volcanoDAO = new VolcanoDAO(req.db);
    next();
});

// Route for getting volcano data by ID
router.get('/:id', async function (req, res, next) {
    try {
        // Get volcano ID parameter
        const id = parseInt(req.params.id);
        // Get token from headers if exists
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        console.log('Token:', token);

        // Validate token using JWT
        const user = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        console.log('User:', user);



        // Check if ID is a number
        if (!id && isNaN(id)) {
            // Next to 404 page
            return next(createError(404, 'Volcano ID not found.'));
        }

        // Retrieve volcano by ID
        const volcano = await req.volcanoDAO.getVolcanoById(id, req.user);

        // Check if volcano exists
        if (!volcano) {
            return next(createError(404, `Volcano with ID: ${id} not found.`));
        }

        // Return the volcano with 200 status code
        res.status(200).json(volcano);
    } catch (err) {
        // Return an error if failed to get volcano by ID
        return next(createError(400, err.message));
    }
});

module.exports = router;