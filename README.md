# Volcanoes Around the World API

This API has been created for my uni assignment three in CAB230, Web Computing. It exposes a number of REST endpoints which implement CRUD operations on a database containing publicly available data about volcanoes collated by the Smithsonian Institution's Global Volcanism Program.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js
- MySQL

### Installing

1. Clone the repository
2. Install dependencies with `npm install`
3. Set up your `.env` file with your database and JWT configurations
4. Run the server with `npm start`

## API Endpoints

The API endpoints and their usage are described in detail in the [Swagger documentation](src/docs/swagger.docs.json).

## Built With

- [Express](https://expressjs.com/) - The web framework used
- [Knex](http://knexjs.org/) - SQL query builder
- [MySQL](https://www.mysql.com/) - Database

## Authors

- Ronan Kennedy

## License

This project is licensed under the MIT License.

## Acknowledgments

- Thanks to the Smithsonian Institution's Global Volcanism Program for the data.