const router = require('express').Router({ mergeParams: true });
const countriesRoute = require('./countries/countries');

// --------------------- Routes ---------------------
router.use('/', countriesRoute); // Countries routes

// Export the router
module.exports = router;