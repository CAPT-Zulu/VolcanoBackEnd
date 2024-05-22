const express = require('express');
const createError = require('http-errors');
const router = express.Router();
const ImageDAO = require('../dao/image.dao');

// Volcano route middleware
router.use((req, res, next) => {
    // Create a new instance of ImageDAO and attach it to the request object
    req.imageDAO = new ImageDAO(req.db, req.user);
    next();
});


// Get Images Route
router.get("/", async (req, res, next) => {
    try {
        // Get volcano ID
        const volcanoID = req.params.volcanoID;

        // Attempt to get images
        const images = await req.imageDAO.getImages(volcanoID);

        // Return images with 200 status code
        res.status(200).json(images);
    } catch (err) {
        // Return an error if failed to get images
        next(createError(err.status || 500, err.message || 'Failed to get images'));
    }
});

// Post Image Route
router.post("/", async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Get volcano ID and image URL from request body
            const volcanoID = req.params.volcanoID;
            const { imageUrl } = req.body;

            // Attempt to post image
            await req.imageDAO.postImage(volcanoID, imageUrl, req.user.email);

            // Return success message with 201 status code
            res.status(201).json({ message: "Image posted" });
        } else {
            // Return an error if user is not authenticated
            return next(createError(401, "Unauthorized"));
        }
    } catch (err) {
        // Return an error if failed to post image
        next(createError(err.status || 500, err.message || 'Failed to post image'));
    }
});

// Post Report Route
router.post("/report", async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (req.user) {
            // Get volcano ID, image ID, and reporter email
            const volcanoID = req.params.volcanoID;
            const imageID = req.params.imageID;
            const reporterEmail = req.user.email;

            // Attempt to post report
            await req.imageDAO.postReport(volcanoID, imageID, reporterEmail);

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