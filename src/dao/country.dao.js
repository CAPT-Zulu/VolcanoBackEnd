// Country Data Access Object 
class CountryDAO {
    constructor(db) {
        // Attach the Knex instance to the DAO
        this.db = db;
    }

    // Get a list of all countries associated with volcanoes
    getCountries() {
        try {
            // Return a list of all countries associated with volcanoes
            return this.db('data')
                .select('country')
                .distinct()
                .orderBy('country', 'asc');
        } catch (err) {
            // Return an error if failed to get countries
            throw new Error(err.message);
        }
    }
}

module.exports = CountryDAO;