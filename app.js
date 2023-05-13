var createError = require('http-errors');
const passport = require('passport');
const express = require("express");
const session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const flash = require('express-flash');
const connectFlash = require('connect-flash');
const bodyParser = require('body-parser');
const moment = require('moment'); // Import the moment.js library
const hbs = require('hbs');

var indexRouter = require('./routes/index');
var tutorRouter = require('./routes/tutorRoute');
var hodRouter = require('./routes/hodRoute');
var principalRouter = require('./routes/principalRoute');
let authentication = require('./routes/authentication')


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


// Define the formatDate helper
hbs.registerHelper('formatDate', function(date, format) {
  // Use moment.js to format the date
  return moment(date).format(format);
});
hbs.registerHelper('gt', function(a, b) {
  return a > b;
});
hbs.registerHelper('eq', function(a, b) {
  return a === b;
});


app.use(cookieParser('secret'));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 }
}));
app.use(connectFlash());
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/tutor', tutorRouter);
app.use('/hod',hodRouter);
app.use('/principal',principalRouter);
app.use(authentication);



// app.use(session({
//   resave: false,
//   saveUninitialized: true,
//   secret: 'newSecretz'
// }));




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
