// DAO (Data Access Object) for interacting with the countries data
class CountryDAO {
    constructor(db) {
        this.db = db;
    }

    // Get a list of all countries associated with volcanoes
    getCountries() {
        return this.db('volcanoes')
            .select('country')
            .distinct()
            .orderBy('country', 'asc');
    }
}

module.exports = CountryDAO;