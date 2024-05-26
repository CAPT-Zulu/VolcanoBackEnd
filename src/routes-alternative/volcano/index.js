const router = require('express').Router({ mergeParams: true });
const authenticateToken = require('./middleware/auth.middleware');
const volcanoRoute = require('./volcano');
const eruptionsRoute = require('./eruptions');
const commentsRoute = require('./comments');

// --------------------- Middleware ---------------------
router.use(authenticateToken); // Authentication Middleware (Used for all routes)

// --------------------- Routes ---------------------
router.use('/:id', volcanoRoute);
router.use('/:id/eruptions', eruptionsRoute);
router.use('/:id/comments', commentsRoute);

// Export the router
module.exports = router;