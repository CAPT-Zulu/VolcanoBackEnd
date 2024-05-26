const express = require('express');
const createError = require('http-errors');
const router = express.Router({ mergeParams: true });
const commentDAO = require('../dao/comment.dao');

// Volcano route middleware
router.use((req, res, next) => {
    // Create a new instance of commentDAO and attach it to the request object
    req.commentDAO = new commentDAO(req.db, req.user);
    next();
});

// Get comments Route
router.get("/", async (req, res, next) => {
    try {
        // Get volcano ID
        const volcanoID = req.params.volcanoID;

        // Attempt to get comments
        const comments = await req.commentDAO.getcomments(volcanoID);

        // Return comments with 200 status code
        res.status(200).json(comments);
    } catch (err) {
        // Return an error if failed to get comments
        next(createError(err.status || 500, err.message || 'Failed to get comments'));
    }
});

// Post comment Route
router.post("/", async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Get volcano ID and comment URL from request body
            const volcanoID = req.params.volcanoID;
            const { commentUrl } = req.body;

            // Attempt to post comment
            await req.commentDAO.postcomment(volcanoID, commentUrl, req.user.email);

            // Return success message with 201 status code
            res.status(201).json({ message: "comment posted" });
        } else {
            // Return an error if user is not authenticated
            return next(createError(401, "Unauthorized"));
        }
    } catch (err) {
        // Return an error if failed to post comment
        next(createError(err.status || 500, err.message || 'Failed to post comment'));
    }
});

// Post Report Route
router.post("/report", async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Get volcano ID, comment ID, and reporter email
            const volcanoID = req.params.volcanoID;
            const commentID = req.params.commentID;
            const reporterEmail = req.user.email;

            // Attempt to post report
            await req.commentDAO.postReport(volcanoID, commentID, reporterEmail);

            // Return success message with 201 status code
            res.status(201).json({ message: "Report submitted" });
        } else {
            // Return an error if user is not authenticated
            return next(createError(401, "Unauthorized"));
        }
    } catch (err) {
        // Return an error if failed to post report
        next(createError(err.status || 500, err.message || 'Failed to submit report'));
    }
});

module.exports = router;