const VolcanoDAO = require("./volcano.dao")
const HttpException = require('../exceptions/HttpException');

class EruptionDAO extends VolcanoDAO {
    constructor(db, authenticated = false) {
        super(db, authenticated);
        this.db = db('eruptions');
    }

    // Set the guess year for a volcano eruption
    async setEruptionYearGuess(volcanoID, eruptionYear) {
        try {
            // Check if volcano ID and eruption year are provided
            if (!volcanoID || !eruptionYear) throw new HttpException(400, 'Volcano ID and eruption year are required parameters');

            // Check if the volcano exists
            const volcanoExists = await this.getVolcanoById(volcanoID);

            // Return an error if the volcano does not exist
            if (!volcanoExists) throw new HttpException(404, `Volcano with ID ${volcanoID} not found`);

            // Set the eruption year for the volcano
            return this.db.insert({ volcanoID, eruptionYear });
        } catch (err) {
            // Return an error if failed to set eruption year
            throw new HttpException(err.status || 500, err.message || 'Failed to set eruption year');
        }
    }

    // Get the guesses for a volcano eruption
    async getEruptionGuesses(volcanoID) {
        try {
            // Check if volcano ID is provided
            if (!volcanoID) throw new HttpException(400, 'Volcano ID is a required parameter');

            // Get the eruption guesses for the volcano
            const guesses = await this.db.select('eruptionYear').where({ volcanoID });

            // Return an error if no guesses are found
            if (!guesses.length) throw new HttpException(404, `No eruption guesses found for volcano with ID ${volcanoID}`); // 404?

            // Return the eruption guesses
            return guesses;
        } catch (err) {
            // Return an error if failed to get eruption guesses
            throw new HttpException(err.status || 500, err.message || 'Failed to get eruption guesses');
        }
    }
}

module.exports = EruptionDAO;