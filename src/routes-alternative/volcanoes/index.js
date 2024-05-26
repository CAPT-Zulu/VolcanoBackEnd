const router = require('express').Router({ mergeParams: true });
const volcanoesRoute = require('./volcanoes');
const VolcanoDAO = require('../../daos/volcano.dao');
// --------------------- Middleware ---------------------
router.use((req, res, next) => {
    // Create a new instance of VolcanoDAO and attach it to the request object
    req.volcanoDAO = new VolcanoDAO(req.db);
    next();
});

// --------------------- Routes ---------------------
router.use('/', volcanoesRoute); // Volcanoes routes

// Export the router
module.exports = router;