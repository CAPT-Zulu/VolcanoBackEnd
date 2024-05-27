const router = require("express").Router();
var createError = require('http-errors')
const authenticateToken = require('../../middleware/auth.middleware');
var VolcanoDAO = require('../../dao/volcano.dao');

// Volcanoes route middleware
router.use((req, res, next) => {
    // Create a new instance of VolcanoDAO and attach it to the request object
    req.volcanoDAO = new VolcanoDAO(req.db, false);
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

// Route for fetching volcanoes by custom queries
router.get('/adv', async (req, res, next) => {
    try {
        // Retrieve the query parameters
        const queries = req.query;

        // Retrieve all volcanoes (Error handling is done in the DAO to abstract the invalid format of the query parameters)
        const volcanoes = await req.volcanoDAO.getVolcanoesByQuery(queries);

        // Return the volcanoes with 200 status code
        res.status(200).json(volcanoes);
    } catch (err) {
        // Return an error if failed to get volcanoes by custom queries
        next(createError(err.status || 500, err.message || 'Failed to get volcanoes by custom queries'));
    }
});

// Get Random Volcano Route
router.get("/random", async (req, res, next) => {
    try {
        // Get optional amount of volcanoes passed in the request
        const amount = req.query.amount;

        // Attempt to get random volcano
        const randomVolcanos = await req.volcanoDAO.getRandomVolcanos(amount);

        // Return random volcanos with 200 status code
        res.status(200).json(randomVolcanos);
    } catch (err) {
        // Return an error if failed to get random volcano
        next(createError(err.status || 500, err.message || 'Failed to get random volcanos'));
    }
});

module.exports = router;