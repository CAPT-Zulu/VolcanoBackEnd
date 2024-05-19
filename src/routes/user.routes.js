const express = require("express");
const createError = require('http-errors');
const router = express.Router();
const authenticateToken = require('../middleware/auth.middleware');
const UserDAO = require("../dao/user.dao");
const jwt = require("jsonwebtoken");

// Register Route middleware
router.use((req, res, next) => {
  // Create a new instance of UserDAO and attach it to the request object
  req.userDAO = new UserDAO(req.db);
  next();
});

// Registration Route
router.post("/register", async (req, res, next) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body;

    // Attempt to create user
    await req.userDAO.createUser(email, password);

    // Return 201 status code if user was created
    res.status(201).json({ message: "User created" });
  } catch (err) {
    // Return an error if failed to register
    next(createError(err.status || 500, err.message || 'Failed to register user'));
  }
});

// Login Route
router.post("/login", async (req, res, next) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body;

    // Attempt to login
    const user = await req.userDAO.login(email, password);

    // Create and sign JWT if login was successful
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Return JWT token with 200 status code
    res.status(200).json({
      token,
      token_type: "Bearer",
      expires_in: 86400
    });
  } catch (err) {
    // Return an error if failed to login
    next(createError(err.status || 500, err.message || 'Failed to login'));
  }
});

// Get Profile Route
router.get("/:email/profile", authenticateToken, async (req, res, next) => {
  try {
    // Get user email
    const userEmail = req.params.email;

    // Attempt to retrieve profile by email
    const profile = await req.userDAO.getProfile(userEmail, req.user);

    // Return profile with 200 status code
    res.status(200).json(profile);
  } catch (err) {
    // Return an error if failed to get profile
    next(createError(err.status || 500, err.message || 'Failed to get profile'));
  }
});

// Update Profile Route
router.put("/:email/profile", authenticateToken, async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (req.user) {
      // Get user email 
      const userEmail = req.params.email;

      // Attempt to update the profile
      await req.userDAO.updateProfile(userEmail, req.body, req.user);

      // Retrieve updated profile
      const updatedProfile = await req.userDAO.getProfile(userEmail, req.user);

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