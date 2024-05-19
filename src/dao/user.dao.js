// DAO for interacting with the users data
const bcrypt = require("bcrypt");

class UserDAO {
    constructor(db) {
        // Attach the Knex instance to the DAO
        this.db = db;
    }

    // Find a user by their email
    findUserByEmail(email) {
        try {
            // Check if email is provided
            if (!email) {
                throw new Error("Email is required");
            }
            // Return the user with the provided email
            return this.db('users')
                .select('*') // To be changed to select specific columns (security issue)
                .where({ email })
                .first();
        } catch (err) {
            // Return an error if failed to find user by email
            throw new Error(err.message);
        }
    }

    // Create a new user
    createUser(email, password) {
        try {
            // Check if email and password are provided
            if (!email || !password) {
                throw new Error("Email and password are required");
            }
            // Check if user already exists
            return this.findUserByEmail(email)
                .then(user => {
                    if (user) {
                        throw new Error("User already exists");
                    }
                })
                // Hash the password
                .then(() => bcrypt.hash(password, 10))
                // Insert the user into the database
                .then(hashedPassword => {
                    return this.db('users')
                        .insert({ email, password_hash: hashedPassword });
                });
        } catch (err) {
            // Return an error if failed to create user
            console.error(err);
            throw new Error(err.message);
        }
    }

    // Log into the user account
    async login(email, password) {
        try {
            // Check if email and password are provided
            if (!email || !password) {
                throw new Error("Email and password are required");
            }
            // Find the user by email
            const user = await this.findUserByEmail(email);
            // Check if user exists
            if (!user) {
                throw new Error("User not found");
            }
            // Compare the password
            const passwordsMatch = await bcrypt.compare(password, user.password_hash);
            // Return an error if the password is incorrect
            if (!passwordsMatch) {
                throw new Error("Incorrect password");
            }
            // Return the user
            return user;
        } catch (err) {
            // Return an error if failed to log into the user account
            throw new Error(err.message);
        }
    }

    // Get user profile by email
    getProfile(email) {
        try {
            // Check if email is provided
            if (!email) {
                throw new Error("Email is required");
            }
            // Return the user profile with the provided email
            return this.db('users')
                .select('email', 'firstName', 'lastName', 'dob', 'address')
                .where({ email })
                .first();
        } catch (err) {
            // Return an error if failed to get user profile
            throw new Error(err.message);
        }
    }

    // Update user profile
    updateProfile(email, profile) {
        try {
            // Check if email and profile are provided
            if (!email || !profile) {
                throw new Error("Email and profile are required");
            }
            // Update the user profile with the provided email
            return this.db('users')
                .where({ email })
                .update(profile);
        } catch (err) {
            // Return an error if failed to update user profile
            throw new Error(err.message);
        }
    }
}

module.exports = UserDAO;