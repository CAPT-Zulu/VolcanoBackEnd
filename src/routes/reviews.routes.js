const express = require('express');
const createError = require('http-errors');
const router = express.Router();

// Route for adding a review to a volcano
router.post('/:id/reviews', async function (req, res, next) {
    try {
        const volcanoId = parseInt(req.params.id);
        const { rating, comment } = req.body;

        if (isNaN(volcanoId)) {
            return next(createError(400, 'Invalid volcano ID.'));
        }

        if (!rating || !comment) {
            return next(createError(400, 'Request body incomplete, both rating and comment are required.'));
        }

        if (rating < 1 || rating > 5) {
            return next(createError(400, 'Invalid rating. Rating must be between 1 and 5.'));
        }

        const userId = req.user.id; // Assuming user ID is available in req.user from authentication

        // Insert review into the database
        await req.db('reviews').insert({
            volcano_id: volcanoId,
            user_id: userId,
            rating,
            comment
        });

        res.status(201).json({ message: 'Review added successfully.' });
    } catch (err) {
        next(err);
    }
});

// Route for getting reviews for a volcano
router.get('/:id/reviews', async function (req, res, next) {
    try {
        const volcanoId = parseInt(req.params.id);

        if (isNaN(volcanoId)) {
            return next(createError(400, 'Invalid volcano ID.'));
        }

        const reviews = await req.db('reviews')
            .select('rating', 'comment', 'created_at')
            .where({ volcano_id: volcanoId });

        res.status(200).json(reviews);
    } catch (err) {
        next(err);
    }
});

module.exports = router;