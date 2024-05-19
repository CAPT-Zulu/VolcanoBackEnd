const express = require("express");
const router = express.Router();
const UserDAO = require("../dao/user.dao");
const jwt = require("jsonwebtoken");

// Registration Route
router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError(400, "Request body incomplete, both email and password are required"));
    }

    const userDao = new UserDAO(req.db);
    const existingUser = await userDao.findUserByEmail(email);

    if (existingUser) {
      return next(createError(409, "User already exists"));
    }

    await userDao.createUser(email, password);
    res.status(201).json({ message: "User created" });
  } catch (err) {
    next(err);
  }
});

// Login Route
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError(400, "Request body incomplete, both email and password are required"));
    }

    const userDao = new UserDAO(req.db);
    const user = await userDao.findUserByEmail(email);

    if (!user) {
      return next(createError(401, "Incorrect email or password"));
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
      return next(createError(401, "Incorrect email or password"));
    }

    // Create and sign JWT
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      token_type: "Bearer",
      expires_in: 86400
    });
  } catch (err) {
    next(err);
  }
});

// Get Profile Route
router.get("/:email/profile", async (req, res, next) => {
  try {
    const userDao = new UserDAO(req.db);
    const profile = await userDao.getProfile(req.params.email);

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

    const userDao = new UserDAO(req.db);
    await userDao.updateProfile(userEmail, { firstName, lastName, dob, address });
    const updatedProfile = await userDao.getProfile(userEmail);

    res.status(200).json(updatedProfile);
  } catch (err) {
    next(err);
  }
});

module.exports = router;