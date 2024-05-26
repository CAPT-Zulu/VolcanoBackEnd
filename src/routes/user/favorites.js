const router = require("express").Router({ mergeParams: true });
const createError = require('http-errors');
const FavoritesDAO = require('../../dao/favorites.dao');

// Favorites Route Middleware
router.use((req, res, next) => {
    // Create a new instance of FavoritesDAO and attach it to the request object.
    // This isn't great cause it creates a new instance of userDAO despite it 
    // already existing in the user / index.js file
    req.favoritesDAO = new FavoritesDAO(req.db, req.user);
    next();
});

// Get Saved Volcanoes Route
router.get('/', async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Retrieve saved volcanoes
            const savedVolcanoes = await req.favoritesDAO.getAllFavorites(req.user.email);

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

// Save Volcano Route
router.post('/', async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Get volcano ID from request body
            const { volcanoID } = req.body;

            // Attempt to save volcano
            await req.favoritesDAO.addFavorite(volcanoID);

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
router.delete("/:volcanoID", async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Get volcano ID from request parameters
            const volcanoID = req.params.volcanoID;

            // Attempt to remove saved volcano
            await req.favoritesDAO.deleteFavorite(volcanoID);

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