const router = require("express").Router({ mergeParams: true });
const createError = require('http-errors');
const FavoritesDAO = require('../../dao/favorites.dao');

// Favorites Route Middleware
router.use((req, res, next) => {
    // Create a new instance of FavoritesDAO and attach it to the request object
    req.favoritesDAO = new FavoritesDAO(req.db, req.user);
    next();
});

// Save Volcano Route
router.post('/', async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Get volcano ID from request body
            const { volcanoID } = req.body;

            // Attempt to save volcano
            await req.favoritesDAO.saveVolcano(volcanoID);

            // Return success message with 200 status code
            res.status(200).json({ message: `Volcano with ID ${volcanoID} saved to favorites` });
        } else {
            // Return an error if user is not authenticated
            return next(createError(401, "Unauthorized"));
        }
    } catch (err) {
        // Return an error if failed to save volcano
        next(createError(err.status || 500, err.message || 'Failed to save volcano'));
    }
});

// Remove Saved Volcano Route
router.delete("/:volcanoID/save", async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Get volcano ID from request parameters
            const volcanoID = req.params.volcanoID;

            // Attempt to remove saved volcano
            await req.favoritesDAO.removeSavedVolcano(volcanoID);

            // Return success message with 200 status code
            res.status(200).json({ message: `Volcano with ID ${volcanoID} removed from saved volcanoes` });
        } else {
            // Return an error if user is not authenticated
            return next(createError(401, "Unauthorized"));
        }
    } catch (err) {
        // Return an error if failed to remove saved volcano
        next(createError(err.status || 500, err.message || 'Failed to remove saved volcano'));
    }
});

module.exports = router;