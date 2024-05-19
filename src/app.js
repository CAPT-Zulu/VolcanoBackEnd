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
// const fs = require('fs');
// const https = require('https');
// Routes
const countriesRouter = require('./routes/countries.routes');
const volcanoesRouter = require('./routes/volcanoes.routes');
const volcanoRouter = require('./routes/volcano.routes');
const userRouter = require('./routes/user.routes');
const AdministrationRouter = require('./routes/me.routes');
// Middleware
const dbMiddleware = require('./middleware/db.middleware');
const authenticateToken = require('./middleware/auth.middleware');
// const errorHandler = require('./middleware/error.middleware');


// --------------------- App ---------------------
const app = express();
app.set('views', path.join(__dirname, 'views')); // Set the views directory
app.set('view engine', 'jade'); // Set the view engine to Jade

// --------------------- HTTPS ---------------------
// const httpsOptions = {
//   key: fs.readFileSync('./certificates/key.pem'),
//   cert: fs.readFileSync('./certificates/cert.pem')
// };

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
// Data
app.use('/countries', countriesRouter); // Countries routes
app.use('/volcanoes', volcanoesRouter); // Volcanoes routes
app.use('/volcano', volcanoRouter); // Volcano routes
// Authentication
app.use('/login', userRouter); // Login route
app.use('/register', userRouter); // Register route
// Profile
app.use('/profile', authenticateToken, userRouter); // Profile route
// Administration
app.use('/me', AdministrationRouter); // Administration route
// Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)); // Swagger docs

// Knex test route DEBUG
// app.get('/knex', function (req, res, next) {
//   req.db.raw("SELECT VERSION()").then(
//     (version) => console.log((version[0][0]))
//   ).catch((err) => { console.log(err); throw err })
//   res.send("Version Logged successfully");
// });

app.use(function (req, res, next) { next(createError(404)); }); // 404 error, forwarded to error handler


// --------------------- Error Handling ---------------------
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page (or send JSON response for API errors)
  res.status(err.status || 500);
  // res.render('error'); // Or 
  res.json({ error: true, message: err.message })
});

// --------------------- Server ---------------------
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

// https.createServer(httpsOptions, app).listen(3443, () => {
//   console.log('HTTPS Server running on port 3443');
// });

module.exports = app;