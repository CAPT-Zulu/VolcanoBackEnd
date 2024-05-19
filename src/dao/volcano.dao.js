var createError = require('http-errors')

// Volcano Data Access Object
class VolcanoDAO {
    // Constructor with a db object
    /**
     * Create a new VolcanoDAO.
     * @param {Object} db - The Knex instance.
     * @example const volcanoDAO = new VolcanoDAO(req.db);
     */
    constructor(db) {
        this.db = db('data');
        this.validDistances = ['5km', '10km', '30km', '100km'];
    }

    // Get all volcanoes
    getVolcanoes() {
        return this.db('volcanoes')
            .select('id', 'name', 'country', 'region', 'subregion');
    }

    // Get all volcanoes
    /**
     * Get all volcanoes.
     * @returns {Promise<Array>} - The array of volcanoes.
     * @throws {Error} - If failed to retrieve all volcanoes.
     * @example getAllVolcanoes(); // Returns [{ id: 1, name: 'Volcano 1', ... }, ...]
     */
    async getAllVolcanoes() {
        try {
            // Await the query, and return the result
            const volcanoes = await this.db.select('*');
            return volcanoes;
        } catch (error) {
            // Throw an error if failed to retrieve all volcanoes
            throw new Error('Failed to retrieve all volcanoes');
        }
    }

    // Get volcano by id
    /**
     * Get volcano by id.
     * @param {number} id - The volcano id.
     * @returns {Promise<Object>} - The volcano object.
     * @throws {Error} - If failed to retrieve volcano by id.
     * @example getVolcanoById(1); // Returns { id: 1, name: 'Volcano 1', ... }
     */
    async getVolcanoById(id) {
        try {
            // Await the query, and return the result
            const volcano = await this.db.select('*').where('id', id).first();
            return volcano;
        } catch (error) {
            // Throw an error if failed to retrieve volcano by id
            throw new Error('Failed to retrieve volcano by id');
        }
    }

    // Get volcanoes by country
    /**
     * Get volcanoes by country.
     * @param {string} country - The country name.
     * @param {string} population - The population range.
     * @returns {Promise<Array>} - The array of volcanoes.
     * @throws {Error} - If failed to retrieve volcanoes by country.
     * @example getVolcanoesByCountry('Australia', '10km'); // Returns [{ id: 1, name: 'Volcano 1', ... }, ...]
     */
    async getVolcanoesByCountry(country, population) {
        try {
            // If country is not provided, throw an error
            if (!country) {
                throw new Error('Country is a required query parameter.');
            }

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