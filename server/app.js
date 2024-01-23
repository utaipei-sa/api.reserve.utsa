var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

// const swaggerUi = require('swagger-ui-express');
// const fs = require("fs")
// const YAML = require('yaml')

var home_router = require('./routes/home');
var signin_router = require('./routes/signin');
var reserve_router = require('./routes/reserve/index');
var docs_router = require('./docs/docs');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// const file  = fs.readFileSync('./openapi.yaml', 'utf8')
// const swaggerDocument = YAML.parse(file)
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(docs_router);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// cors
const corsOptions = {
    origin: [
        'http://localhost:7414'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors());
app.use(cors(corsOptions));

// routes
app.use(home_router);
app.use(signin_router); //'/signin', 
app.use('/api/v1', reserve_router);

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
