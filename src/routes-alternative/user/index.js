const router = require('express').Router({ mergeParams: true });
const authenticateToken = require('./middleware/auth.middleware');
const userRoute = require('./user');
const profileRoute = require('./profile');
const favoritesRoute = require('./favorites');

// --------------------- Routes ---------------------
router.use('/', userRoute);
router.use('/:email/profile', authenticateToken, profileRoute);
router.use('/:email/favorites', authenticateToken, favoritesRoute);

// Export the router
module.exports = router;