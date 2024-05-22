const express = require('express');
const router = express.Router();
const createError = require('http-errors');
const EruptionDAO = require('../dao/eruption.dao');

// Register Route middleware
router.use((req, res, next) => {
    // Create a new instance of EruptionDAO and attach it to the request object
    req.eruptionDAO = new EruptionDAO(req.db, req.user);
    next();
});

// Get Eruption Guesses Route
router.get('/', async (req, res, next) => {
    try {
        // Get volcano ID from request parameters
        const volcanoID = req.params.volcanoID;

        // Attempt to get eruption guesses
        const eruptionGuesses = await req.eruptionDAO.getEruptionGuesses(volcanoID);

        // Return eruption guesses with 200 status code
        res.status(200).json(eruptionGuesses);
    } catch (err) {
        // Return an error if failed to get eruption guesses
        next(createError(err.status || 500, err.message || 'Failed to get eruption guesses'));
    }
});

// Guess Eruption Year Route
router.post('/', async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Get volcano ID and guess year from request body
            const volcanoID = req.params.volcanoID;
            const { guessYear } = req.body;

            // Attempt to set eruption year guess
            await req.eruptionDAO.setEruptionYearGuess(volcanoID, guessYear);

            // Return success message with 200 status code
            res.status(200).json({ message: `Eruption year guess ${guessYear} submitted for volcano with ID ${volcanoID}` });
        } else {
            // Return an error if user is not authenticated
            return next(createError(401, "Unauthorized"));
        }
    } catch (err) {
        // Return an error if failed to guess eruption year
        next(createError(err.status || 500, err.message || 'Failed to submit eruption year guess'));
    }
});
