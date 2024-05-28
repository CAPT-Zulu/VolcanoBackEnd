const router = require("express").Router();
const createError = require('http-errors');
const CountryDAO = require('../../dao/country.dao');

// Register Route middleware
router.use((req, res, next) => {
    // Create a new instance of CountryDAO and attach it to the request object
    req.countryDAO = new CountryDAO(req.db);
    next();
});

// Route for fetching all countries associated with volcanoes
router.get('/', async (req, res, next) => {
    try {
        // Reject if any query parameters are provided
        if (Object.keys(req.query).length > 0) {
            return next(createError(400, 'Invalid query parameters. No query parameters are permitted.'));
        }

        // Retrieve all countries associated with volcanoes
        const countries = await req.countryDAO.getCountries();

        // Return countries with 200 status code
        res.status(200).json(countries.map(country => country.country));
    } catch (err) {
        // Return an error if failed to get countries
        next(createError(err.status || 500, err.message || 'Failed to get countries'));
    }
});

module.exports = router;