// --------------------- Import Modules ---------------------
// General
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.docs.json');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
// Routes
const countriesRouter = require('./routes/countries.routes');
const volcanoesRouter = require('./routes/volcanoes.routes');
const volcanoRouter = require('./routes/volcano.routes');
const userRouter = require('./routes/user.routes');
const AdministrationRouter = require('./routes/me.routes');
// Middleware
const dbMiddleware = require('./middleware/db.middleware');
const authenticateToken = require('./middleware/auth.middleware');


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
app.use(cookieParser()); // Parse cookie headers
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from /public


// --------------------- Routes ---------------------
// Swagger Docs
app.get('/', (req, res) => { res.redirect('/docs') }); // Redirect to docs (Not sure what else to do here)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Docs route
// Data API
app.use('/countries', countriesRouter); // Countries routes
app.use('/volcanoes', volcanoesRouter); // Volcanoes routes
app.use('/volcano', volcanoRouter); // Volcano routes
// Authentication API
app.use('/user', userRouter); // User routes
// Profile API
app.use('/profile', authenticateToken, userRouter); // Profile route
// Administration API
app.use('/me', AdministrationRouter); // Administration route
// 404 Error
app.use(function (req, res, next) { next(createError(404, 'Not Found')); }); // 404 error, forwarded to error handler


// --------------------- Error Handling ---------------------
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page (or send JSON response for API errors)
  res.status(err.status || 500);
  res.json({ error: true, message: err.message })
});

// --------------------- Server ---------------------
https.createServer(httpsOptions, app).listen(process.env.PORT, () => {
  console.log(`HTTPS Server running on port ${process.env.PORT}`);
});

module.exports = app;

// TODO:
// - Custom functions
// - Custom Swagger docs

