function errorHandler(err, req, res, next) {
    console.error(err.stack); // Log the error for debugging

    // Customize error responses based on the error type or code
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }

    if (err.code === '23505') { // Example for PostgreSQL unique constraint violation
        return res.status(409).json({ error: 'Duplicate entry' });
    }

    // Generic error response for unhandled errors
    res.status(500).json({ error: 'Internal Server Error' });
}

module.exports = errorHandler;