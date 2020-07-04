require('dotenv').config()

const createError = require('http-errors');
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
// Routers
const indexRouter = require('./routes/indexRouter')
const userRouter = require('./routes/userRouter')
const characterRouter = require('./routes/characterRouter')

// Database
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})

const db = mongoose.connection

db.on('error', err => console.error(err))
db.once('open', () => console.log('Connected to Database'))

const app = express()

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.use(logger('dev'));
app.use(express.json())
app.use(express.urlencoded({
  extended: false
}))
app.use(cookieParser(process.env.COOKIE_SECRET))
app.use(express.static(path.join(__dirname, 'dist')));

app.use('/', indexRouter)
app.use('/users', userRouter)
app.use('/characters', characterRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;