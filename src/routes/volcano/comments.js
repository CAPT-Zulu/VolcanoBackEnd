const router = require("express").Router({ mergeParams: true });
const createError = require('http-errors');
const commentDAO = require('../../dao/comment.dao');

// Comments route middleware
router.use((req, res, next) => {
    // Create a new instance of commentDAO and attach it to the request object
    req.commentDAO = new commentDAO(req.db, req.user);
    next();
});

// TODO: Limit the number of comments returned at a time

// Get comments Route
router.get("/", async (req, res, next) => {
    try {
        // Get volcano ID
        const volcanoID = req.params.volcanoID;

        // Attempt to get comments
        const comments = await req.commentDAO.getComments(volcanoID);

        // Return comments with 200 status code
        res.status(200).json(comments);
    } catch (err) {
        // Return an error if failed to get comments
        next(createError(err.status || 500, err.message || 'Failed to get comments'));
    }
});

module.exports = router;