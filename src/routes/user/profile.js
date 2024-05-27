const router = require("express").Router({ mergeParams: true });
const createError = require('http-errors');

// Get Profile Route
router.get("/", async (req, res, next) => {
  try {
    // Get user email
    const userEmail = req.params.email;

    // Attempt to retrieve profile by email (pass in the authenticated user to check if they are authorized to view the profile)
    const profile = await req.userDAO.getProfile(userEmail, req.user);

    // Return profile with 200 status code
    res.status(200).json(profile);
  } catch (err) {
    // Return an error if failed to get profile
    next(createError(err.status || 500, err.message || 'Failed to get profile'));
  }
});

// Update Profile Route
router.put("/", async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (req.user) {
      // Get user email 
      const userEmail = req.params.email;

      // Attempt to update the profile
      const updatedProfile = await req.userDAO.updateProfile(userEmail, req.body);

      // Return updated profile with 200 status code
      res.status(200).json(updatedProfile);
    } else {
      // Return an error if user is not authenticated
      return next(createError(401, "Unauthorized"));
    }
  } catch (err) {
    // Return an error if failed to update profile
    next(createError(err.status || 500, err.message || 'Failed to update profile'));
  }
});

module.exports = router;