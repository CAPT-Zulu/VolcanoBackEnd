const HttpException = require('../exceptions/HttpException');
const bcrypt = require('bcrypt');
// const moment = require('moment');

// User Data Access Object
class UserDAO {
    constructor(db, authenticated = false) {
        // Assign the db object to the class
        this.db = db('users');
        // Define fields that are not accessible to non-authenticated users
        this.nonAuthFields = authenticated ? ['email', 'firstName', 'lastName', 'dob', 'address'] : ['email', 'firstName', 'lastName'];
    }

    // Find a user by their email (Private, only used within the DAO for obvious reasons)
    async findUserByEmail(email) {
        try {
            // Return the user with the provided email
            return this.select('email', 'password_hash')
                .where({ email })
                .first();
        } catch (err) {
            // Return an error if failed to find user by email
            throw new HttpException(err.status || 500, err.message || 'Failed to find user by email')
        }
    }

    // Create a new user
    async createUser(email, password) {
        try {
            // Check if email and password are provided
            if (!email || !password) throw new HttpException(400, 'Request body incomplete, both email and password are required');

            // Check if user already exists
            return this.findUserByEmail(email)
                // Return an error if user already exists, otherwise continue
                .then(user => {
                    if (user) throw new HttpException(400, 'User already exists');
                })
                // Hash the password
                .then(() => bcrypt.hash(password, 10))
                // Insert the user into the database
                .then(hashedPassword => {
                    return this.db.insert({ email, password_hash: hashedPassword });
                });
        } catch (err) {
            // Return an error if failed to create user
            throw new HttpException(err.status || 500, err.message || 'Failed to create user');
        }
    }

    // Log into the user account
    async login(email, password) {
        try {
            // Check if email and password are provided
            if (!email || !password) throw new HttpException(400, 'Request body incomplete, both email and password are required');

            // Find the user by email
            const user = await this.findUserByEmail(email);

            // Check if user exists
            if (!user) throw new HttpException(401, 'User not found');

            // Compare the password
            const passwordsMatch = await bcrypt.compare(password, user.password_hash);

            // Return an error if the password is incorrect
            if (!passwordsMatch) throw new HttpException(401, 'Incorrect password');

            // Return the user
            return user;
        } catch (err) {
            // Return an error if failed to log into the user account
            throw new HttpException(err.status || 500, err.message || 'Failed to login');
        }
    }

    // Get user profile by email
    async getProfile(email) {
        try {
            // Check if email is provided
            if (!email) throw new Error('Email is a required parameter');

            // Check user is authenticated
            if (!this.authenticated) throw new HttpException(401, 'Unauthorized');

            // Retrieve the user profile by email
            const profile = await this.select(this.nonAuthFields)
                .where({ email })
                .first();

            // Check if profile exists
            if (!profile) throw new HttpException(404, 'User not found');

            // Fix the date on dob (Otherwise it will be returned as a timestamp)
            if (profile.dob) profile.dob = new Date(profile.dob).toISOString().split('T')[0];

            // Return the user profile
            return profile;
        } catch (err) {
            // Return an error if failed to get user profile
            throw new HttpException(err.status || 500, err.message || 'Failed to get user profile');
        }
    }

    // Update user profile
    async updateProfile(email, profile) {
        try {
            // Set body fields
            const { firstName, lastName, address, dob } = profile;

            // Check if email is provided
            if (!email) {
                throw new HttpException(400, 'Email is a required parameter');
            }
            // Check if each field is provided
            if (!firstName || !lastName || !dob || !address) {
                throw new HttpException(400, 'Request body incomplete: firstName, lastName, dob and address are required.');
            }
            // Check if each field is a string
            if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof dob !== 'string' || typeof address !== 'string') {
                throw new HttpException(400, 'Request body invalid: firstName, lastName and address must be strings only.');
            }
            // Check if authenticated user is updating their own profile
            if (!this.authenticated || email !== this.authenticated.email) {
                throw new HttpException(401, 'Unauthorized');
            }
            // Check if dob is a valid date !/^\d{4}-\d{2}-\d{2}$/.test(dob) || 
            if (isNaN(new Date(dob)) || dob !== new Date(dob).toISOString().split('T')[0]) {
                throw new HttpException(400, 'Invalid input: dob must be a real date in format YYYY-MM-DD.');
            }
            // Check if dob is in the past
            if (new Date(dob) > new Date()) {
                throw new HttpException(400, 'Invalid input: dob must be a date in the past.');
            }

            // Update the user profile with the provided email
            return this.select(this.nonAuthFields)
                .where({ email })
                .update(profile);
        } catch (err) {
            // Return an error if failed to update user profile
            throw new HttpException(err.status || 500, err.message || 'Failed to update user profile');
        }
    }
}

module.exports = UserDAO;