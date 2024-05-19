const express = require('express');
const router = express.Router();
const CountryDAO = require('../dao/country.dao');

// Route for fetching all countries associated with volcanoes
router.get('/', async function (req, res, next) {
    try {
        const countryDAO = new CountryDAO(req.db); // Instantiate DAO
        const countries = await countryDAO.getCountries(); // Fetch countries from the database

        res.status(200).json(countries.map(country => country.country)); // Return countries
    } catch (err) {
        next(err);
    }
});

module.exports = router;