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

// Post comment Route
router.post("/", async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Get volcano ID and comment from the request
            const volcanoID = req.params.volcanoID;
            const comment = req.body.comment;

            // Attempt to post comment
            const commentID = await req.commentDAO.postComment(volcanoID, comment, req.user.email);

            // Return success message with 201 status code
            res.status(201).json({ message: "Comment posted", commentID });
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
router.put("/:commentID", async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Get parameters from request
            const volcanoID = req.params.volcanoID;
            const commentID = req.params.commentID;
            const comment = req.body.comment;

            // Attempt to update comment
            await req.commentDAO.updateComment(volcanoID, commentID, comment, req.user.email);

            // Return success message with 200 status code
            res.status(200).json({ message: "Comment updated", commentID });
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
router.delete("/:commentID", async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Get parameters from request
            const volcanoID = req.params.volcanoID;
            const commentID = req.params.commentID;

            // Attempt to delete comment
            await req.commentDAO.deleteComment(volcanoID, commentID, req.user.email);

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
router.post("/:commentID/report", async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Get parameters from request
            const volcanoID = req.params.volcanoID;
            const commentID = req.params.commentID;

            // Attempt to post report
            await req.commentDAO.postReport(volcanoID, commentID);

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