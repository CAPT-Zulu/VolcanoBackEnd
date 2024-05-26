const router = require("express").Router({ mergeParams: true });
const createError = require('http-errors');
const commentDAO = require('../../dao/comment.dao');

// Volcano route middleware
router.use((req, res, next) => {
    // Create a new instance of commentDAO and attach it to the request object
    req.commentDAO = new commentDAO(req.db, req.user);
    next();
});

// Post comment Route
router.post("/", async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Get volcano ID and comment from the request
            const volcanoID = req.params.volcanoID;
            const comment = req.body.comment;

            // Attempt to post comment
            await req.commentDAO.postComment(volcanoID, comment, req.user.email);

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

// Update / PUT comment Route
router.put("/", async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Get comment ID and comment from the request
            const commentID = req.params.commentID;
            const comment = req.body.comment;

            // Attempt to update comment
            await req.commentDAO.updateComment(commentID, comment, req.user.email);

            // Return success message with 200 status code
            res.status(200).json({ message: "comment updated" });
        } else {
            // Return an error if user is not authenticated
            return next(createError(401, "Unauthorized"));
        }
    } catch (err) {
        // Return an error if failed to update comment
        next(createError(err.status || 500, err.message || 'Failed to update comment'));
    }
});

// Delete comment Route
router.delete("/", async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Get comment ID from request parameters
            const commentID = req.params.commentID;

            // Attempt to delete comment
            await req.commentDAO.deleteComment(commentID, req.user.email);

            // Return success message with 200 status code
            res.status(200).json({ message: "comment deleted" });
        } else {
            // Return an error if user is not authenticated
            return next(createError(401, "Unauthorized"));
        }
    } catch (err) {
        // Return an error if failed to delete comment
        next(createError(err.status || 500, err.message || 'Failed to delete comment'));
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