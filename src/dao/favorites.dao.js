const VolcanoDAO = require("./volcano.dao")
const UserDAO = require("./user.dao")
const HttpException = require('../exceptions/HttpException');

class FavoritesDAO {
    constructor(db, authenticated = false) {
        // Assign the db object to the class
        this.db = db('favorites');
        // Assign authenticated status to the class
        this.authenticated = authenticated;
        // Mount the VolcanoDAO and UserDAO
        this.volcanoDAO = new VolcanoDAO(db, false); // Create a new instance of the VolcanoDAO without authentication (To prevent getting all fields)
        this.userDAO = new UserDAO(db, authenticated); // Create a new instance of the UserDAO
    }

    // Add a favorite to the database
    async addFavorite(volcanoID) {
        try {
            // Check if volcano ID and user email are provided
            if (!volcanoID) throw new HttpException(400, 'Volcano ID is an required parameter');

            // Check if user is authenticated
            if (!this.authenticated) throw new HttpException(401, 'Unauthorized');

            // Check if the volcano exists
            const volcanoExists = await this.volcanoDAO.getVolcanoById(volcanoID);
            if (!volcanoExists) throw new HttpException(404, `Volcano with ID ${volcanoID} not found`);

            // Check if the volcano is already saved by the user
            const alreadySaved = await this.db.where({ volcanoID, userEmail: this.authenticated.email }).first();
            if (alreadySaved) throw new HttpException(409, `Volcano with ID ${volcanoID} is already saved by user ${this.authenticated.email}`);

            // Save the volcano to the user's saved list
            return this.db.insert({ volcanoID, userEmail: this.authenticated.email });
        } catch (err) {
            // Return an error if failed to save volcano
            throw new HttpException(err.status || 500, err.message || 'Failed to save volcano');
        }
    }

    // Get all favorites from the database
    async getAllFavorites(userEmail) {
        try {
            // Check if user email is provided
            if (!userEmail) throw new HttpException(400, 'User email is a required parameter');

            // Get the ids of all saved volcanoes
            const savedVolcanoes = await this.db.select('volcanoID').where({ userEmail });

            // Check if any volcanoes are saved
            if (!savedVolcanoes.length) {
                return { message: `No favorites found for user ${userEmail}` };
            } else {
                // Extract the volcano ids from the saved volcanoes
                const volcanoIDs = savedVolcanoes.map(volcano => volcano.volcanoID);

                // Get the details of the saved volcanoes
                return this.volcanoDAO.getVolcanoesInList(volcanoIDs);
            }
        } catch (err) {
            // Return an error if failed to get all favorites
            throw new HttpException(err.status || 500, err.message || 'Failed to get all favorites');
        }
    }

    // Delete a favorite from the database
    async deleteFavorite(volcanoID) {
        try {
            // Check if volcano ID is provided
            if (!volcanoID) throw new HttpException(400, 'Volcano ID is a required parameter');

            // Check if user is authenticated
            if (!this.authenticated.email) throw new HttpException(401, 'Unauthorized');

            // Check if the volcano exists
            const volcanoExists = await this.volcanoDAO.getVolcanoById(volcanoID);
            if (!volcanoExists) throw new HttpException(404, `Volcano with ID ${volcanoID} not found`);

            // Check if the volcano is saved by the user
            const savedVolcano = await this.db.where({ volcanoID, userEmail: this.authenticated.email }).first();
            if (!savedVolcano) throw new HttpException(404, `Volcano with ID ${volcanoID} not saved by user ${this.authenticated.email}`);

            // Delete the saved volcano
            return this.db.where({ volcanoID, userEmail: this.authenticated.email }).del();
        } catch (err) {
            // Return an error if failed to delete favorite
            throw new HttpException(err.status || 500, err.message || 'Failed to delete favorite');
        }
    }
}

module.exports = FavoritesDAO;