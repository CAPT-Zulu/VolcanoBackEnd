// DAO for interacting with the users data
const bcrypt = require("bcrypt");

class UserDAO {
    constructor(db) {
        this.db = db;
    }

    // Find a user by their email
    findUserByEmail(email) {
        return this.db('users')
            .select('*')
            .where({ email })
            .first();
    }

    // Create a new user
    createUser(email, password) {
        return bcrypt.hash(password, 10)
            .then(hashedPassword => {
                return this.db('users')
                    .insert({ email, password: hashedPassword });
            });
    }

    // Get user profile by email
    getProfile(email) {
        return this.db('users')
            .select('email', 'firstName', 'lastName', 'dob', 'address')
            .where({ email })
            .first();
    }

    // Update user profile
    updateProfile(email, profile) {
        return this.db('users')
            .where({ email })
            .update(profile);
    }
}

module.exports = UserDAO;