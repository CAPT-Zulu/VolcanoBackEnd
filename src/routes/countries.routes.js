const express = require('express');
const router = express.Router();
const CountryDAO = require('../dao/country.dao');

// Register Route middleware
router.use((req, res, next) => {
    // DEBUG
    console.log('Countries route');
    // Create a new instance of CountryDAO and attach it to the request object
    req.countryDAO = new CountryDAO(req.db);
    next();
});

// Route for fetching all countries associated with volcanoes
router.get('/', async function (req, res, next) {
    try {
        // Retrieve all countries associated with volcanoes
        const countries = await req.countryDAO.getCountries();

        // Return countries with 200 status code
        res.status(200).json(countries.map(country => country.country));
    } catch (err) {
        // Return an error if failed to get countries
        next(createError(400, err.message));
    }
});

module.exports = router;