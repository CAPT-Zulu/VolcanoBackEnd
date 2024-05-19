const express = require('express');
const router = express.Router();
var createError = require('http-errors')
var VolcanoDAO = require('../dao/volcano.dao');

// Volcanoes route middleware
router.use((req, res, next) => {
    // Create a new instance of VolcanoDAO and attach it to the request object
    req.volcanoDAO = new VolcanoDAO(req.db);
    next();
});

// Route for fetching volcanoes by country and optional population radius
router.get('/', async function (req, res, next) {
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
        return next(createError(400, err.message));
    }
});

module.exports = router;