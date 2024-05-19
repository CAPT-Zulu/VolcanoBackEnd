import HttpException from '../exceptions/HttpException';
const bcrypt = require("bcrypt");
const moment = require('moment');

// User Data Access Object
class UserDAO {
    constructor(db) {
        // Attach the Knex instance to the DAO
        this.db = db;
        // Define non restricted fields when user is authenticated
        this.authFields = ['email', 'firstName', 'lastName', 'dob', 'address'];
        // Define non restricted fields when user is not authenticated
        this.nonAuthFields = ['email', 'firstName', 'lastName'];
    }

    // Find a user by their email (Private)
    async findUserByEmail(email) {
        try {
            // Return the user with the provided email
            return this.db('users')
                .select('email', 'password_hash')
                .where({ email })
                .first();
        } catch (err) {
            // Return an error if failed to find user by email
            throw new HttpException(500, err.message);
        }
    }

    // Create a new user
    async createUser(email, password) {
        try {
            // Check if email and password are provided
            if (!email || !password) throw new HttpException(400, "Email and password are required");

            // Check if user already exists
            return this.findUserByEmail(email)
                // Return an error if user already exists, otherwise continue
                .then(user => {
                    if (user) throw new HttpException(400, "User already exists");
                })
                // Hash the password
                .then(() => bcrypt.hash(password, 10))
                // Insert the user into the database
                .then(hashedPassword => {
                    return this.db('users').insert({ email, password_hash: hashedPassword });
                });
        } catch (err) {
            // Return an error if failed to create user
            throw new HttpException(500, err.message);
        }
    }

    // Log into the user account
    async login(email, password) {
        try {
            // Check if email and password are provided
            if (!email || !password) throw new HttpException(400, "Email and password are required");

            // Find the user by email
            const user = await this.findUserByEmail(email);

            // Check if user exists
            if (!user) throw new HttpException(401, "User not found");

            // Compare the password
            const passwordsMatch = await bcrypt.compare(password, user.password_hash);

            // Return an error if the password is incorrect
            if (!passwordsMatch) new HttpException(401, "Incorrect password");

            // Return the user
            return user;
        } catch (err) {
            // Return an error if failed to log into the user account
            throw new HttpException(500, err.message);
        }
    }

    // Get user profile by email
    async getProfile(email, authenticated) {
        try {
            // Check if email is provided
            if (!email) throw new Error("Email is required");

            // Check if authenticated user is requesting their own profile
            const select = authenticated && email === authenticated.email ? this.authFields : this.nonAuthFields;

            // Retrieve the user profile by email
            const profile = await this.db('users')
                .select(select)
                .where({ email })
                .first();

            // Check if profile exists
            if (!profile) throw new HttpException(404, "User not found");

            // Fix the date on dob (Otherwise it will be returned as a timestamp)
            if (profile.dob) profile.dob = moment(profile.dob).format('YYYY-MM-DD');

            // Return the user profile
            return profile;
        } catch (err) {
            // Return an error if failed to get user profile
            throw new HttpException(500, err.message);
        }
    }

    // Update user profile
    async updateProfile(email, profile, authenticated) {
        try {
            // Check if email and profile are provided
            if (!email || !profile) throw new HttpException(400, "Email and profile are required");

            // Check if authenticated user is updating their own profile
            if (!authenticated || email !== authenticated.email) throw new HttpException(401, "Unauthorized");

            // Update the user profile with the provided email
            return this.db('users')
                .select(this.restrictedFields)
                .where({ email })
                .update(profile);
        } catch (err) {
            // Return an error if failed to update user profile
            throw new HttpException(500, err.message);
        }
    }
}

module.exports = UserDAO;