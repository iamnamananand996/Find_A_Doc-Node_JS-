var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('connect-flash');
var session = require('express-session');
var cassandra = require('cassandra-driver');

var indexRouter = require('./routes/index');
var doctorsRouter = require('./routes/doctors');
var categoriesRouter = require('./routes/categories');

var app = express();

var client = new cassandra.Client({contactPoints:['127.0.0.1']});
client.connect(function(err,result){
  console.log('Cassandra Connected');
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret : 'secret',
  saveUninstialized : true,
  resave: true
}));
  

app.use(flash());
  app.use(function(req,res,next){
    res.locals.messages = require('express-messages')(req,res);
    next();
  });


  var query = "SELECT * FROM findadoc.categories";
  client.execute(query,[],function(err,results){
    if (err) {
        res.status(404).send({msg:err});
    } else {
        app.locals.cats = results.rows;
      }
  });



app.use('/', indexRouter);
app.use('/doctors', doctorsRouter);
app.use('/categories',categoriesRouter)

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
