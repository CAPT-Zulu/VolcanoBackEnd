const express = require('express');
const router = express.Router();
var createError = require('http-errors')
var VolcanoDAO = require('../dao/volcano.dao');

// Volcanoes route middleware
router.use((req, res, next) => {
    // Create a new instance of VolcanoDAO and attach it to the request object
    req.volcanoDAO = new VolcanoDAO(req.db, req.user);
    next();
});

// Route for fetching volcanoes by country and optional population radius
router.get('/', async (req, res, next) => {
    try {
        // Get parameters
        const { country, populatedWithin } = req.query;

        // Check if only allowed parameters are provided
        const allowedParameters = ['country', 'populatedWithin'];
        if (!Object.keys(req.query).every(param => allowedParameters.includes(param))) {
            // Return an error if invalid query parameters are provided
            return next(createError(400, 'Invalid query parameters. Only country and populatedWithin are permitted.'));
        }

        // Retrieve all volcanoes (Error handling is done in the DAO to abstract the invalid format of the query parameters)
        const volcanoes = await req.volcanoDAO.getVolcanoesByCountry(country, populatedWithin);

        // Return the volcanoes with 200 status code
        res.status(200).json(volcanoes);
    } catch (err) {
        // Return an error if failed to get volcanoes by country
        next(createError(err.status || 500, err.message || 'Failed to get volcanoes by country'));
    }
});

// Get Saved Volcanoes Route
router.get("/saved", async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Get user email
            const userEmail = req.user.email;

            // Attempt to get saved volcanoes
            const savedVolcanoes = await req.volcanoDAO.getSavedVolcanoes(userEmail);

            // Return saved volcanoes with 200 status code
            res.status(200).json(savedVolcanoes);
        } else {
            // Return an error if user is not authenticated
            return next(createError(401, "Unauthorized"));
        }
    } catch (err) {
        // Return an error if failed to get saved volcanoes
        next(createError(err.status || 500, err.message || 'Failed to get saved volcanoes'));
    }
});

// Get Random Volcano Route
router.get("/random", async (req, res, next) => {
    try {
        // Attempt to get random volcano
        const randomVolcano = await req.volcanoDAO.getRandomVolcano();

        // Return random volcano with 200 status code
        res.status(200).json(randomVolcano);
    } catch (err) {
        // Return an error if failed to get random volcano
        next(createError(err.status || 500, err.message || 'Failed to get random volcano'));
    }
});

module.exports = router;