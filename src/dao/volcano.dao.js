import HttpException from '../exceptions/HttpException';

// Volcano Data Access Object
class VolcanoDAO {
    // Constructor with a db object
    constructor(db) {
        // Assign the db object to the class
        this.db = db('data');
        // Define valid distances for population radius
        this.validDistances = ['5km', '10km', '30km', '100km'];
        // Define non restricted fields when user is not authenticated
        this.nonAuthFields = ['id', 'name', 'country', 'region', 'subregion', 'last_eruption', 'summit', 'elevation', 'latitude', 'longitude'];
    }

    // Get volcano by id
    async getVolcanoById(id, authenticated = false) {
        try {
            // If id is not provided, throw an error
            if (!id) throw new HttpException(400, 'Id is a required query parameter.');

            // Select * if user is authenticated, otherwise select nonAuthFields
            const select = authenticated ? '*' : this.nonAuthFields;

            // Return the volcano with the provided id
            return this.db.select(select)
                .where('id', id)
                .first();

        } catch (error) {
            // Throw an error if failed to retrieve volcano by id
            throw new HttpException(500, error.message);
        }
    }

    // Get volcanoes by country
    async getVolcanoesByCountry(country, population) {
        try {
            // If country is not provided, throw an error
            if (!country) throw new HttpException(400, 'Country is a required query parameter.');

            // Create a query to get volcanoes by country
            const query = this.db.select('*')
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
        } catch (error) {
            // Throw an error if failed to retrieve volcanoes by country
            throw new HttpException(500, error.message);
        }
    }
}

module.exports = VolcanoDAO;