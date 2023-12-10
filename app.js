// Import required modules
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import your route files
const customerRequestRouter = require('./routes/customer_request.js');
const bidRouter = require('./routes/bid.js');
const dashboardRouter = require('./routes/dashboard.js');
const profileRouter = require('./routes/profile.js');
const registrationRouter = require('./routes/register.js');
const loginRouter = require('./routes/login.js');
const dotenv = require('dotenv');
dotenv.config();

// Load environment variables from the appropriate .env file
console.log(process.env.NODE_ENV);

// Create an Express application
const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Standard middleware setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
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
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
