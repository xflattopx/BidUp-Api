// Import required modules
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
// Import your route files
var indexRouter = require('./routes/index.js');
var customerRequestRouter = require('./routes/customer_request.js');
var bidRouter = require('./routes/bid.js');
var dashboardRouter = require('./routes/dashboard.js');
var profileRouter = require('./routes/profile.js');
var registrationRouter = require('./routes/register.js')
var loginRouter = require('./routes/login.js');

// Create an Express application
var app = express();
dotenv.config();

// Create an HTTP server and attach Socket.IO
// const server = http.createServer(app);
// const io = socketIo(server);

// // Socket.IO connection handling
// io.on('connection', (socket) => {
//   console.log('A user connected');

//   // Additional Socket.IO event handling can be added here

//   socket.on('disconnect', () => {
//     console.log('User disconnected');
//   });
// });

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
app.use('/', indexRouter);
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
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error'); // Make sure you have an 'error' view file
});

const pool = require('./config/config.js');

// Access the environment variable


// Export the Express application
module.exports = app;
