const createError = require('http-errors');
const passport = require('passport');
const express = require("express");
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('express-flash');
const connectFlash = require('connect-flash');
const bodyParser = require('body-parser');
const moment = require('moment');
const hbs = require('hbs');

var indexRouter = require('./routes/index');
var tutorRouter = require('./routes/tutorRoute');
var hodRouter = require('./routes/hodRoute');
var principalRouter = require('./routes/principalRoute');
var officeRouter = require('./routes/officeRoute');
var adminRouter = require('./routes/adminRoute');
let authentication = require('./routes/authentication')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Configure the session middleware
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 }
}));

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Define the addUserNameToLocals middleware
const addUserNameToLocals = function (req, res, next) {
  res.locals.userName = req.user ? req.user.name : '';
  next();
};

// Register the helpers and middleware
hbs.registerHelper('formatDate', function(date, format) {
  return moment(date).format(format);
});
hbs.registerHelper('gt', function(a, b) {
  return a > b;
});
hbs.registerHelper('eq', function(a, b) {
  return a === b;
});
hbs.registerHelper('range', function(start, end) {
  var result = [];
  for (var i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
});

app.use(cookieParser('secret'));
app.use(connectFlash());
app.use(flash());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(addUserNameToLocals); // Add the addUserNameToLocals middleware here

app.use('/', indexRouter);
app.use('/tutor', tutorRouter);
app.use('/hod', hodRouter);
app.use('/principal', principalRouter);
app.use('/office', officeRouter);
app.use('/admin', adminRouter);
app.use(authentication);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
