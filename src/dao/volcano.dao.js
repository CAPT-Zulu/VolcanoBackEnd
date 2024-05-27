const HttpException = require('../exceptions/HttpException');

// Volcano Data Access Object
class VolcanoDAO {
    // Constructor with a db object
    constructor(db, authenticated = false) {
        // Assign the db object to the class
        this.db = db('data');
        // Define valid distances for population radius
        this.validDistances = ['5km', '10km', '30km', '100km'];
        // Define fields that are not accessible to non-authenticated users
        this.nonAuthFields = authenticated ? '*' : ['id', 'name', 'country', 'region', 'subregion', 'last_eruption', 'summit', 'elevation', 'latitude', 'longitude'];
        // Allowed queries for getVolcanoesByQuery
        this.allowedQueries = ['name', 'country', 'region', 'last_eruption', 'summit', 'elevation'];
    }

    // Get volcano by id
    async getVolcanoById(id) {
        try {
            // If id is not provided, throw an error
            if (!id) throw new HttpException(404, 'Volcano ID not found.');

            // Retrieve the volcano by id
            const volcano = await this.db.select(this.nonAuthFields)
                .where('id', id)
                .first();

            // If volcano is not found, throw an error
            if (!volcano) throw new HttpException(404, `Volcano with ID: ${id} not found.`);

            // Return the volcano
            return volcano;
        } catch (err) {
            // Throw an error if failed to retrieve volcano by id
            throw new HttpException(err.status || 500, err.message || 'Failed to get volcano by id');
        }
    }

    // Get volcanos by multiple custom queries
    async getVolcanoesByQuery(queries) {
        try {
            // If queries are not provided, throw an error
            if (!queries) throw new HttpException(400, 'Queries are required.');

            // Ensure that all queries are valid
            if (!Object.keys(queries).every(query => allowedQueries.includes(query))) {
                throw new HttpException(400, 'Invalid queries provided. Allowed queries: ' + allowedQueries.join(', '));
            }

            // Create a query to get volcanoes by custom queries
            const query = this.db.select(this.nonAuthFields)
                .where(queries);

            // Return the query
            return await query;
        } catch (err) {
            // Throw an error if failed to retrieve volcanoes by custom queries
            throw new HttpException(err.status || 500, err.message || 'Failed to get volcanoes by custom queries');
        }
    }

    // Get volcanoes by country and optional population
    async getVolcanoesByCountry(country, population) {
        try {
            // If country is not provided, throw an error
            if (!country) throw new HttpException(400, 'Country is a required query parameter.');

            // Create a query to get volcanoes by country
            const query = this.db.select(this.nonAuthFields)
                .where('country', country);

            // If population is provided
            if (population) {
                // Check if populatedWithin is a valid distance
                if (!this.validDistances.includes(population)) {
                    throw new HttpException(400, 'Invalid value for populatedWithin. Allowed values: ' + this.validDistances.join(', '));
                }
                // Add the population range to the query
                const populatedWithin = `population_${population}`;
                query.andWhere(populatedWithin, '>', 0);
            }

            // Return the query
            return await query;
        } catch (err) {
            // Throw an error if failed to retrieve volcanoes by country
            throw new HttpException(err.status || 500, err.message || 'Failed to get volcanoes by country');
        }
    }

    // Get random volcanos
    async getRandomVolcanos(amount) {
        try {
            // If amount is not provided, set it to 1
            amount = amount ? amount : 1;

            // Check if amount is within the allowed range (1-10) and is a number
            if (amount < 1 || amount > 10 || isNaN(amount)) throw new HttpException(400, 'Invalid value for amount. Allowed numbers are between 1-10');

            // Get random volcanoes
            const randomVolcanoes = await this.db.select(this.nonAuthFields)
                .orderByRaw('RAND()')
                .limit(amount);

            // Return the random volcanoes
            return randomVolcanoes;
        } catch (err) {
            // Throw an error if failed to retrieve a random volcano
            throw new HttpException(err.status || 500, err.message || 'Failed to get random volcano');
        }
    }

    // Get volcanoes in a list of ids
    async getVolcanoesInList(ids) {
        try {
            // If ids are not provided, throw an error
            if (!ids) throw new HttpException(400, 'Volcano IDs are required.');

            // Retrieve the volcanoes in the list of ids
            const volcanoes = await this.db.select(this.nonAuthFields)
                .whereIn('id', ids);

            // If no volcanoes are found, return an error
            if (!volcanoes.length) throw new HttpException(404, 'No volcanoes found.');

            // Return the volcanoes
            return volcanoes;
        } catch (err) {
            // Throw an error if failed to retrieve volcanoes in list
            throw new HttpException(err.status || 500, err.message || 'Failed to get volcanoes in list');
        }
    }
}

module.exports = VolcanoDAO;