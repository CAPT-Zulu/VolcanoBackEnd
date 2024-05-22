// --------------------- Import Modules ---------------------
// General
const createError = require('http-errors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const https = require('https');
// Routes
const swaggerDocument = require('./docs/swagger.docs.json');
const countriesRouter = require('./routes/countries.routes');
const volcanoesRouter = require('./routes/volcanoes.routes');
const volcanoRouter = require('./routes/volcano.routes');
const imageRouter = require('./routes/image.routes');
const eruptionRouter = require('./routes/eruption.routes');
const userRouter = require('./routes/user.routes');
const profileRouter = require('./routes/profile.routes');
const favoritesRouter = require('./routes/favorites.routes');
const AdministrationRouter = require('./routes/me.routes');
// Middleware
const dbMiddleware = require('./middleware/db.middleware');
const authenticateToken = require('./middleware/auth.middleware');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('morgan');
const express = require('express');
// const cookieParser = require('cookie-parser'); why?


// --------------------- App ---------------------
const app = express();
app.set('views', path.join(__dirname, 'views')); // Set the views directory
app.set('view engine', 'jade'); // Set the view engine to Jade


// --------------------- HTTPS ---------------------
const httpsOptions = {
  key: fs.readFileSync(process.env.PRIVATE_KEY_PATH),
  cert: fs.readFileSync(process.env.CERTIFICATE_PATH)
};


// --------------------- Middleware ---------------------
app.use(dbMiddleware); // Attach Knex instance to the request object
app.use(cors()); // Enable CORS (Cross-Origin Resource Sharing
app.use(helmet()); // Security middleware
app.use(logger('dev')); // Log HTTP requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded request bodies
// app.use(cookieParser()); // Parse cookie headers
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from /public
app.use(authenticateToken); // Authenticate user tokens (Used in most routes, decided was better to have it global instead of in each route)


// --------------------- Routes ---------------------
// Swagger Docs
app.use('/', swaggerUi.serve) // Serve on root
app.get('/', swaggerUi.setup(swaggerDocument)); // Swagger document 

// Data API
app.use('/countries', countriesRouter); // Countries routes
app.use('/volcanoes', volcanoesRouter); // Volcanoes routes
app.use('/volcano/:id', volcanoRouter); // Volcano routes
// Image API
app.use('/volcano/:id/image', imageRouter); // Image routes
// Eruption guesses API
app.use('/volcano/:id/eruption', eruptionRouter); // Eruption routes

// Authentication API
app.use('/user', userRouter); // User routes
// Profile API
app.use('/user/:email/profile', profileRouter); // Profile route
// Favorites API
app.use('/user/:email/favorites', favoritesRouter); // Favorites route 

// Administration API
app.use('/me', AdministrationRouter); // Administration route

// 404 Error
app.use(function (req, res, next) { next(createError(404, 'Not Found')); }); // 404 error, forwarded to error handler


// --------------------- Error Handling ---------------------
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // If the error is an 500 internal server error, render custom error page
  if (err.status === 500) {
    // Log the error
    console.error(err);
    // Send JSON response for API errors
    res.status(500);
    res.json({ error: true, message: 'Internal server error' }); // Don't send the error message to the client may contain sensitive information
  } else {
    // Render the error page
    res.status(err.status || 500);
    res.json({ error: true, message: err.message })
  }
});


// --------------------- Server ---------------------
https.createServer(httpsOptions, app).listen(process.env.PORT, () => {
  console.log(`HTTPS Server running on port ${process.env.PORT}`);
});

module.exports = app;

// TODO:
// - Custom functions
// - Custom Swagger docs

// sql database dump
// Server start up auto
// Port forwarding
// Cookie parser, do I need it?
// Route HTTP to HTTPS?