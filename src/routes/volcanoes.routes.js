const express = require('express');
const router = express.Router();
var createError = require('http-errors')
var VolcanoDAO = require('../dao/volcano.dao');

router.use((req, res, next) => {
    console.log('Volcanoes route')
    req.volcanoDAO = new VolcanoDAO(req.db);
    next();
});

// Route for fetching volcanoes by country and optional population radius
router.get('/', async function (req, res, next) {
    try {
        // Allowed query parameters
        const allowedParameters = ['country', 'populatedWithin'];
        // Get query parameters
        const { country, populatedWithin } = req.query;

        // Check if only allowed parameters are provided
        if (!Object.keys(req.query).every(param => allowedParameters.includes(param))) {
            // Return an error if invalid query parameters are provided
            return next(createError(400, { message: 'Invalid query parameters. Only country and populatedWithin are permitted.' }));
        }

        // Retrieve all volcanoes (Error handling is done in the DAO to abstract the invalid format of the query parameters)
        const volcanoes = await req.volcanoDAO.getVolcanoesByCountry(country, populatedWithin);

        // Return the volcanoes with 200 status code
        res.status(200).json(volcanoes);
    } catch (err) {
        // Return an error if failed to get volcanoes by country
        return next(createError(400, { message: err.message }));
    }
});

module.exports = router;
// const express = require('express');
// const createError = require('http-errors');
// const router = express.Router();
// const VolcanoDAO = require('../dao/volcano.dao');

// // Route for fetching volcanoes by country and optional population radius
// router.get('/', async function (req, res, next) {
//     try {
//         const { country, populatedWithin } = req.query;

//         // Check if country parameter is provided
//         if (!country) {
//             return next(createError(400, { error: true, message: 'Country is a required query parameter.' }));
//         }

//         // Check for invalid query parameters
//         const validPopulatedWithinValues = ['5km', '10km', '30km', '100km'];
//         if (
//             Object.keys(req.query).length > 2 ||
//             (populatedWithin && !validPopulatedWithinValues.includes(populatedWithin))
//         ) {
//             return next(createError(400, { error: true, message: 'Invalid query parameters. Only country and populatedWithin are permitted.' }));
//         }

//         const volcanoDAO = new VolcanoDAO(req.db);
//         const volcanoes = await volcanoDAO.getVolcanoesByCountry(country, populatedWithin);

//         res.status(200).json(volcanoes);
//     } catch (err) {
//         next(err);
//     }
// });

// module.exports = router;

// const express = require('express');
// const createError = require('http-errors');
// const router = express.Router();
// const VolcanoDAO = require('../dao/volcano.dao');

// // Route for fetching volcanoes by country and optional population radius
// router.get('/', async function (req, res, next) {
//     try {
//         const { country, populatedWithin } = req.query;

//         // Check if country parameter is provided
//         if (!country) {
//             return next(createError(400, 'Country is a required query parameter.'));
//         }

//         // Check for invalid query parameters
//         if (Object.keys(req.query).length > 2 || (populatedWithin && !['5km', '10km', '30km', '100km'].includes(populatedWithin))) {
//             return next(createError(400, 'Invalid query parameters. Only country and populatedWithin are permitted.'));
//         }

//         const volcanoDAO = new VolcanoDAO(req.db); // Instantiate DAO
//         const volcanoes = await volcanoDAO.getVolcanoesByCountry(country, populatedWithin); // Fetch volcanoes based on query parameters

//         res.status(200).json(volcanoes); // Return list of volcanoes
//     } catch (err) {
//         next(err);
//     }
// });

// module.exports = router;

// var express = require('express');
// const router = express.Router();
// const VolcanoDAO = require('../dao/volcano.dao');

// // Middleware to attach the VolcanoDAO to the request object
// router.use((req, res, next) => {
//     console.log('Volcanoes route')
//     req.volcanoDAO = new VolcanoDAO(req.db);
//     next();
// });

// // Route to get volcanoes by country and population range (optional)
// router.get('/', async (req, res) => {
//     try {
//         // Get the country from the URL
//         const country = req.query.country;
//         const populatedWithin = req.query.populatedWithin;

//         // Check if country is provided
//         if (!country) return res.status(400).json({ error: 'Country name is required' });

//         // Retrieve all volcanoes
//         const volcanoes = await req.volcanoDAO.getVolcanoesByCountry(country, populatedWithin);

//         // Return the volcanoes
//         res.json(volcanoes);
//     } catch (error) {
//         // Return an error if failed to get volcanoes by country
//         res.status(500).json({ error: error.message });
//     }
// });

// module.exports = router;