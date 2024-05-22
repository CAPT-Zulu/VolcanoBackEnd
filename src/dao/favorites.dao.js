const VolcanoDAO = require("./volcano.dao")
const HttpException = require('../exceptions/HttpException');

class FavoritesDAO extends VolcanoDAO {
    constructor(db, authenticated = false) {
        super(db, authenticated);
        this.db = db('favorites');
    }

    // Add a favorite to the database
    async addFavorite(volcanoID, userEmail) {
        try {
            // Check if volcano ID and user email are provided
            if (!volcanoID || !userEmail) throw new HttpException(400, 'Volcano ID and user email are required parameters');

            // Check if the volcano exists
            const volcanoExists = await this.getVolcanoById(volcanoID);

            // Return an error if the volcano does not exist
            if (!volcanoExists) throw new HttpException(404, `Volcano with ID ${volcanoID} not found`);

            // Check if the volcano is already saved by the user
            const alreadySaved = await this.db.where({ volcanoID, userEmail }).first();

            // Return an error if the volcano is already saved by the user
            if (alreadySaved) throw new HttpException(409, `Volcano with ID ${volcanoID} is already saved by user ${userEmail}`);

            // Save the volcano to the user's saved list
            return this.db.insert({ volcanoID, userEmail });
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
            if (!savedVolcanoes.length) throw new HttpException(404, `No favorites found for user ${userEmail}`);

            // Extract the volcano ids from the saved volcanoes
            const volcanoIDs = savedVolcanoes.map(volcano => volcano.volcanoID);

            // Get the details of the saved volcanoes
            return this.getVolcanoesInList(volcanoIDs);
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

            // Check if the volcano exists
            const volcanoExists = await this.getVolcanoById(volcanoID);

            // Return an error if the volcano does not exist
            if (!volcanoExists) throw new HttpException(404, `Volcano with ID ${volcanoID} not found`);

            // Delete the saved volcano
            return this.db.where({ volcanoID }).del();
        } catch (err) {
            // Return an error if failed to delete favorite
            throw new HttpException(err.status || 500, err.message || 'Failed to delete favorite');
        }
    }
}

module.exports = FavoritesDAO;