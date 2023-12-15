// Import required modules
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const runCronJob = require('./services/cron.js');


// Import your route files
var customerRequestRouter = require('./routes/customer_request.js');
var bidRouter = require('./routes/bid.js');
var dashboardRouter = require('./routes/dashboard.js');
var profileRouter = require('./routes/profile.js');
var registrationRouter = require('./routes/register.js')
var loginRouter = require('./routes/login.js');
var dotenv = require('dotenv');
dotenv.config();
// Create an Express application
var app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Standard middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Route setup
app.use('/customer_request', customerRequestRouter);
app.use('/bid', bidRouter);
app.use('/dashboard', dashboardRouter);
app.use('/profile', profileRouter);
app.use('/register', registrationRouter);
app.use('/auth', loginRouter);

// Catch 404 and forward to error handler
app.use(function(next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error'); // Make sure you have an 'error' view file
});

runCronJob(); // This starts the cron job


// Export the Express application
module.exports = app;
