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
    async getRandomVolcanos(count) {
        try {
            // Check if count was provided
            if (!count) throw new HttpException(400, 'Count is a required query parameter.');

            // Check if count is within the allowed range (1-10)
            if (count < 1 || count > 10) throw new HttpException(400, 'Invalid value for count. Allowed values: 1-10');

            // Get the total number of volcanoes
            const totalVolcanoes = await this.db.count('id').first();

            // Generate a random number between 1 and the total number of volcanoes
            const randoms = [...Array(count).keys()].map(() => Math.floor(Math.random() * totalVolcanoes.count) + 1);

            // Retrieve the random volcanoes
            const randomVolcanoes = await this.db.select(this.nonAuthFields)
                .whereIn('id', randoms);

            // If no random volcanoes are found, return an error
            if (!randomVolcanoes.length) throw new Error('No random volcanoes found.'); // Will be passed as an 500 error

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