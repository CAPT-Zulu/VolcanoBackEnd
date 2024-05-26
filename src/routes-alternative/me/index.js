const router = require('express');
const meRoute = require('./me');

// --------------------- Routes ---------------------
router.use('/', meRoute);

// Export the router
module.exports = router;