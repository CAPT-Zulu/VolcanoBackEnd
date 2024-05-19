const express = require("express");
const createError = require('http-errors');
const router = express.Router();
const UserDAO = require("../dao/user.dao");
const jwt = require("jsonwebtoken");

// Register Route middleware
router.use((req, res, next) => {
  // DEBUG
  console.log("User route");
  // Create a new instance of UserDAO and attach it to the request object
  req.userDAO = new UserDAO(req.db);
  next();
});

// Registration Route
router.post("/register", async (req, res, next) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return next(createError(400, "Request body incomplete, both email and password are required"));
    }

    // Attempt to create user
    await req.userDAO.createUser(email, password);

    // Return 201 status code if user was created
    res.status(201).json({ message: "User created" });
  } catch (err) {
    // Return an error if failed to register
    return next(createError(400, err.message)); // Do I need an return here?
  }
});

// Login Route
router.post("/login", async (req, res, next) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return next(createError(400, "Request body incomplete, both email and password are required"));
    }

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
    // If error is thrown, check if it's a user not found or incorrect password error
    if (err.message === "User not found") {
      // Return 401 error if user not found
      return next(createError(401, err.message));

    } else if (err.message === "Incorrect password") {
      // Return 401 error if incorrect password
      return next(createError(401, err.message));
    }
    // Return an error if failed to login
    return next(createError(400, err.message));
  }
});

// Get Profile Route
router.get("/:email/profile", async (req, res, next) => {
  try {
    const profile = await req.userDAO.getProfile(req.params.email);

    if (!profile) {
      return next(createError(404, "User not found"));
    }

    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
});

// Update Profile Route
router.put("/:email/profile", async (req, res, next) => {
  try {
    const userEmail = req.params.email;
    const { firstName, lastName, dob, address } = req.body;

    // Input validation
    if (!firstName || !lastName || !dob || !address) {
      return next(createError(400, "Request body incomplete: firstName, lastName, dob and address are required."));
    }

    if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof address !== 'string') {
      return next(createError(400, "Request body invalid: firstName, lastName and address must be strings only."));
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      return next(createError(400, "Invalid input: dob must be a real date in format YYYY-MM-DD."));
    }

    if (new Date(dob) > new Date()) {
      return next(createError(400, "Invalid input: dob must be a date in the past."));
    }

    // Authentication check
    if (userEmail !== req.user.email) {
      return next(createError(403, "Forbidden"));
    }

    await req.userDAO.updateProfile(userEmail, { firstName, lastName, dob, address });
    const updatedProfile = await req.userDAO.getProfile(userEmail);

    res.status(200).json(updatedProfile);
  } catch (err) {
    next(err);
  }
});

module.exports = router;