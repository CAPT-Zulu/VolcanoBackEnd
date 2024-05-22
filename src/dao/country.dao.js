const VolcanoDAO = require('./volcano.dao');
const HttpException = require('../exceptions/HttpException');

// Country Data Access Object 
class CountryDAO extends VolcanoDAO {
    constructor(db) {
        super(db, false);
    }

    // Get a list of all countries associated with volcanoes
    getCountries() {
        try {
            // Return a list of all countries associated with volcanoes
            return this.db
                .select('country')
                .distinct()
                .orderBy('country', 'asc');
        } catch (err) {
            // Return an error if failed to get countries
            throw new HttpException(500, 'Failed to get countries');
        }
    }
}

module.exports = CountryDAO;