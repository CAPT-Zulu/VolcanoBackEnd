const jwt = require("jsonwebtoken");
const createError = require("http-errors");

// Middleware to authenticate the JWT token
function authenticateToken(req, res, next) {
    try {
        // Check if the Authorization header is present
        const authHeader = req.headers['authorization'];

        // If the Authorization header is present
        if (authHeader) {
            // Get the token from the Authorization header
            const token = authHeader.split(' ')[1];
            // If no token is present, return an error
            if (!token) return next(createError(401, "Authorization header is malformed"));

            // Otherwise, verify the token using the JWT_SECRET 
            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
                // If the token is invalid, return an error
                if (err) {
                    // Return 401 error if token has expired
                    if (err.name === 'TokenExpiredError') {
                        return next(createError(401, "JWT token has expired"));
                    }
                    // Return 401 error if token is invalid
                    return next(createError(401, "Invalid JWT token"));
                }
                // Attach user data to the request object
                req.user = user;
                // Continue to the next middleware
                next();
            });
        } else {
            // If no Authorization header is present, continue to the next middleware
            next();
        }
    } catch (err) {
        // Return 400 error if an error occurred
        next(createError(400, "An error occurred while authenticating the token"));
    }
}

module.exports = authenticateToken;