const dotenv = require('dotenv');
const moment = require('moment');
dotenv.config(); // Load environment variables

module.exports = {
    client: 'mysql2',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        timezone: 'UTC',
    },
};