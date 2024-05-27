const VolcanoDAO = require("./volcano.dao")
const UserDAO = require("./user.dao")
const HttpException = require('../exceptions/HttpException');

class EruptionDAO extends VolcanoDAO {
    constructor(db, authenticated = false) {
        // Call the super class constructor
        super(db, authenticated);
        // Assign the db object to the class
        this.db_eru = () => db.table('eruption_guesses');
        // Assign authenticated status to the class
        this.authenticated = authenticated;
        // Mount the UserDAO
        this.userDAO = new UserDAO(db, authenticated); // Create a new instance of the UserDAO
    }

    // Set the guess year for a volcano eruption
    async setEruptionYearGuess(volcanoID, eruptionYear) {
        try {
            // Check if volcano ID and eruption year are provided
            if (!volcanoID || !eruptionYear) throw new HttpException(400, 'Volcano ID and eruption year are required parameters');

            // Check user authentication
            if (!this.authenticated) throw new HttpException(401, 'Unauthorized');

            // Check if the volcano exists
            const volcanoExists = await this.getVolcanoById(volcanoID);
            if (!volcanoExists) throw new HttpException(404, `Volcano with ID ${volcanoID} not found`);

            // Check if the user has already guessed the eruption year
            const alreadyGuessed = await this.db_eru()
                .where({ volcanoID, userEmail: this.authenticated.email })
                .first();

            // Update or insert the eruption year for the volcano
            if (alreadyGuessed) {
                return this.db_eru()
                    .update({ eruptionYear })
                    .where({ volcanoID, userEmail: this.authenticated.email });
            } else {
                return this.db_eru()
                    .insert({ volcanoID, userEmail: this.authenticated.email, eruptionYear });
            }
        } catch (err) {
            // Return an error if failed to set eruption year
            throw new HttpException(err.status || 500, err.message || 'Failed to set eruption year');
        }
    }

    // Get the guess statistics for a volcano eruption
    async getEruptionGuesses(volcanoID) {
        try {
            // Check if volcano ID is provided
            if (!volcanoID) throw new HttpException(400, 'Volcano ID is a required parameter');

            // Check if the volcano exists
            const volcanoExists = await this.getVolcanoById(volcanoID);
            if (!volcanoExists) throw new HttpException(404, `Volcano with ID ${volcanoID} not found`);

            // Get the eruption guesses for the volcano
            const guesses = await this.db_eru()
                .select('eruptionYear')
                .where({ volcanoID });

            // Return an no eruption guesses found message if no guesses are found
            if (!guesses.length) return { count: `No eruption guesses found for volcano with ID ${volcanoID}`, average: 0, median: 0, min: 0, max: 0 };

            // Sort the guesses into count, average, median, min, and max
            const count = guesses.length;
            const average = guesses.reduce((acc, guess) => acc + guess.eruptionYear, 0) / count;
            const median = guesses[Math.floor(count / 2)].eruptionYear;
            const min = Math.min(...guesses.map(guess => guess.eruptionYear));
            const max = Math.max(...guesses.map(guess => guess.eruptionYear));

            // Return the eruption guesses statistics
            return { count, average, median, min, max };
        } catch (err) {
            // Return an error if failed to get eruption guesses
            throw new HttpException(err.status || 500, err.message || 'Failed to get eruption guesses');
        }
    }
}

module.exports = EruptionDAO;