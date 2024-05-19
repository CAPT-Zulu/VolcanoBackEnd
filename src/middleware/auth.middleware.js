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
                if (err) {
                    if (err.name === 'TokenExpiredError') {
                        return next(createError(401, "JWT token has expired"));
                    }
                    return next(createError(401, "Invalid JWT token"));
                }

                req.user = user; // Attach user data to the request object
                next();
            });
        } else {
            console.log("No Authorization header found");
            next();
        }
    } catch (err) {
        next(createError(401, "Unauthorized"));
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