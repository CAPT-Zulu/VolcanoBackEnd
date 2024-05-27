const knex = require("knex");
const knexFile = require("../../knexfile");

// Knex middleware to attach the db object to the request object
function dbMiddleware(req, res, next) {
    // Attach the db object to the request object
    req.db = knex(knexFile);
    next();
}

module.exports = dbMiddleware;