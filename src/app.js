// --------------------- Import Modules ---------------------
// General
const express = require('express');
const createError = require('http-errors');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const https = require('https');
// Routes
const swaggerDocument = require('./docs/swagger.docs.json');
const countriesRouter = require('./routes/countries');
const volcanoesRouter = require('./routes/volcanoes');
const volcanoRouter = require('./routes/volcano');
const userRouter = require('./routes/user');
const meRouter = require('./routes/me');
// Middleware
const dbMiddleware = require('./middleware/db.middleware');
const cors = require('cors');
const helmet = require('helmet');
const logger = require('morgan');


// --------------------- App ---------------------
const app = express();


// --------------------- HTTPS ---------------------
const httpsOptions = {
  key: fs.readFileSync(process.env.PRIVATE_KEY_PATH),
  cert: fs.readFileSync(process.env.CERTIFICATE_PATH)
};
const httpsServer = https.createServer(httpsOptions, app);


// --------------------- Middleware ---------------------
app.use(dbMiddleware); // Attach Knex instance to the request object
app.use(cors()); // Enable CORS (Cross-Origin Resource Sharing
app.use(helmet()); // Security middleware
app.use(logger('dev')); // Logging middleware, logs requests to the console
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded request bodies

// --------------------- Routes ---------------------
// Swagger Docs page
app.use('/', swaggerUi.serve) // Swagger served at root
app.get('/', swaggerUi.setup(swaggerDocument)); // Swagger document

// API Routes
app.use('/countries', countriesRouter); // Countries API router
app.use('/volcanoes', volcanoesRouter); // Volcanoes API router
app.use('/volcano/:volcanoID', volcanoRouter); // Volcano API router
app.use('/user', userRouter); // User API router
app.use('/me', meRouter); // Me router, used for assessment purposes (Provides my information)

// 404 Error
app.use((req, res, next) => { next(createError(404, 'Not Found')); }); // 404 error, forwarded to error handler


// --------------------- Error Handling ---------------------
app.use((err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // If the error is internal or unknown send a 500 error
  if (err.status === 500 || err.status === undefined) {
    // Log the error
    console.error(err);
    // Send JSON response for API errors
    res.status(500);
    res.json({ error: true, message: 'Internal server error', debug: err.message }); // Don't send server side errors to the client
  } else {
    // Render the error page
    res.status(err.status);
    res.json({ error: true, message: err.message })
  }
});


// --------------------- Server ---------------------
httpsServer.listen(process.env.PORT, () => {
  console.log(`HTTPS Server running on port ${process.env.PORT}`);
});

module.exports = app;

// TODO:
// - Finish custom functions
// - Finish custom Swagger docs