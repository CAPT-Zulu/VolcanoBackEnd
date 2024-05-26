const router = require("express").Router({ mergeParams: true });
const createError = require('http-errors');
const authenticateToken = require('../../middleware/auth.middleware');
const VolcanoDAO = require('../../dao/volcano.dao');

// Authenticate token for all routes
router.use(authenticateToken);

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
        const volcanoID = parseInt(req.params.volcanoID);

        // Retrieve volcano by ID
        const volcano = await req.volcanoDAO.getVolcanoById(volcanoID);

        // Return the volcano with 200 status code
        res.status(200).json(volcano);
    } catch (err) {
        // Return an error if failed to get volcano by ID
        next(createError(err.status || 500, err.message || 'Failed to get volcano by ID'));
    }
});

// Images Router
router.use('/images', require('./image'));

// Eruptions Router
router.use('/eruptions', require('./eruption'));

module.exports = router;