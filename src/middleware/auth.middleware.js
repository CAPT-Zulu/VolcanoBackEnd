const jwt = require("jsonwebtoken");
const createError = require("http-errors");

function authenticateToken(req, res, next) {
    try {
        // Check if the Authorization header is present
        const authHeader = req.headers['authorization'];

        if (authHeader) {
            // Get the token from the Authorization header
            const token = authHeader.split(' ')[1];
            if (!token) {
                return next(createError(401, "Authorization header is malformed"));
            }

            // Verify the token
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
            console.log("No Authorization header found");
            next();
        }
    } catch (err) {
        // Return 400 error if an error occurred
        next(createError(400, "An error occurred while authenticating the token"));
    }
}

module.exports = authenticateToken;
// const jwt = require('jsonwebtoken');

// // Authenticate JWT token
// function authenticateToken(req, res, next) {
//     // Check if no Authorization header or if the header does not contain a Bearer token
//     if (!("authorization" in req.headers) || !req.headers.authorization.match(/^Bearer /)) {
//         // Return 401 error
//         res.status(401).json({ error: true, message: "Authorization header ('Bearer token') not found" });
//         return;
//     }

//     // Extract the token from the Authorization header
//     const token = req.headers.authorization.replace(/^Bearer /, "");

//     try {
//         // Verify the JWT token using the JWT_SECRET environment variable
//         jwt.verify(token, process.env.JWT_SECRET);
//     } catch (e) {
//         // Handle different token verification errors
//         console.log(e);
//         if (e.name === "TokenExpiredError") {
//             res.status(401).json({ error: true, message: "JWT token has expired" });
//         } else {
//             res.status(401).json({ error: true, message: "Invalid JWT token" });
//         }
//         return; // Stop further execution if token is invalid or expired
//     }

//     // Continue to next
//     next();
// }

// module.exports = authenticateToken; 