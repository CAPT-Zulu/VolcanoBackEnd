const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const VolcanoDAO = require('../dao/volcano.dao');

// Route for getting volcano data by ID
router.get('/:id', async function (req, res, next) {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            return next(createError(400, 'Invalid volcano ID.'));
        }

        const volcanoDAO = new VolcanoDAO(req.db); // Instantiate DAO
        const volcano = await volcanoDAO.getVolcanoById(id); // Fetch volcano by ID

        if (!volcano) {
            return next(createError(404, `Volcano with ID: ${id} not found.`));
        }

        // Include population data if the user is authenticated
        if (req.user) {
            res.status(200).json(volcano);
        } else {
            // Exclude population data for unauthenticated users
            const { population_5km, population_10km, population_30km, population_100km, ...volcanoWithoutPopulation } = volcano;
            res.status(200).json(volcanoWithoutPopulation);
        }

    } catch (err) {
        next(err);
    }
});

module.exports = router;