// Volcano Data Access Object
class VolcanoDAO {
    // Constructor with a db object
    constructor(db) {
        // Assign the db object to the class
        this.db = db('data');
        // Define valid distances for population radius
        this.validDistances = ['5km', '10km', '30km', '100km'];
        // Define non restricted fields when user is not authenticated
        this.nonRestrictedFields = ['id', 'name', 'country', 'region', 'subregion', 'last_eruption', 'summit', 'elevation', 'latitude', 'longitude'];
    }

    // Get all volcanoes
    async getAllVolcanoes() {
        try {
            // Create a query to get all volcanoes
            const query = this.db.select('*');

            // Await the query, and return the result
            const volcanoes = await query;
            return volcanoes;
        } catch (error) {
            // Throw an error if failed to retrieve all volcanoes
            throw new Error('Failed to retrieve all volcanoes');
        }
    }

    // Get volcano by id
    async getVolcanoById(id, authenticated = false) {
        try {
            // If id is not provided, throw an error
            if (!id) throw new Error('Id is a required parameter.');

            // Select * if user is authenticated
            const select = authenticated ? '*' : this.nonRestrictedFields;

            // Create a query to get volcano by id
            const query = this.db.select(select).where('id', id).first();

            // Await the query, and return the result
            const volcano = await query;
            return volcano;
        } catch (error) {
            // Throw an error if failed to retrieve volcano by id
            throw new Error('Failed to retrieve volcano by id');
        }
    }

    // Get volcanoes by country
    async getVolcanoesByCountry(country, population) {
        try {
            // If country is not provided, throw an error
            if (!country) throw new Error('Country is a required query parameter.');

            // Create a query to get volcanoes by country
            const query = this.db.select('*').where('country', country);

            // If population is provided
            if (population) {
                // Check if populatedWithin is a valid distance
                if (!this.validDistances.includes(population)) {
                    throw new Error('Invalid value for populatedWithin. Allowed values: ' + this.validDistances.join(', '));
                }
                // Add the population range to the query
                const populatedWithin = `population_${population}`;
                query.andWhere(populatedWithin, '>', 0);
            }

            // Await the query, and return the result
            const volcanoes = await query;
            return volcanoes;
        } catch (error) {
            // Throw an error if failed to retrieve volcanoes by country
            throw new error(error.message || 'Failed to retrieve volcanoes by country');
        }
    }
}

module.exports = VolcanoDAO;