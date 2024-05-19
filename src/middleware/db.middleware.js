const knex = require("knex");
const knexfile = require("../../knexfile");
// const environment = process.env.NODE_ENV || 'development';
const db = knex(knexfile); // [environment]

// Attach Knex instance to the request object
function dbMiddleware(req, res, next) {
    req.db = db;
    next();
}

module.exports = dbMiddleware;