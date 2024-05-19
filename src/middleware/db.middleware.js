const knex = require("knex");
const knexfile = require("../../knexfile");
const db = knex(knexfile);

// Knex middleware to attach the db object to the request object
function dbMiddleware(req, res, next) {
    req.db = db;
    next();
}

module.exports = dbMiddleware;