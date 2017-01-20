/*jshint node:true*/
'use strict';

var fs = require('fs');
var express = require('express');
var helmet = require('helmet');
var expressSession = require('express-session');
var app = express();
var logger = require('morgan');
var four0four = require('./utils/404')();

var options = require('./utils/options')();
var http = options.https?require('https'):require('http');
var passport = require('passport');
var authHelper = require('./utils/auth-helper');
var port = options.appPort;
var environment = options.env;


authHelper.init();

// Making this middle-tier slightly more secure: https://www.npmjs.com/package/helmet#how-it-works
app.use(helmet({
  csp: { // enable and configure
    directives: {
      defaultSrc: ['"self"']
    },
    setAllHeaders: true
  },
  dnsPrefetchControl: true, // just enable, with whatever defaults
  xssFilter: { // enabled by default, but override defaults
    setOnOldIE: true
  },
  noCache: false // make sure it is disabled
}));

app.use(expressSession({
  name: 'slush-https',
  secret: '21158bec-219b-465c-9b6e-267055f5930e',
  saveUninitialized: true,
  resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(logger('dev'));

app.use('/v1', require('./proxy'));
app.use('/api', require('./routes'));

console.log('About to crank up node');
console.log('PORT=' + port);
console.log('NODE_ENV=' + environment);

switch (environment){
  case 'prod':
  case 'dev':
    console.log('** DIST **');
    app.use(express.static('./dist/'));
    // Any invalid calls for templateUrls are under app/* and should return 404
    app.use('/app/*', function(req, res, next) {
      four0four.send404(req, res);
    });
    // Any deep link calls should return index.html
    app.use('/*', express.static('./dist/index.html'));
    break;
  default:
    console.log('** UI **');
    app.use(express.static('./ui/'));
    app.use(express.static('./')); // for bower_components
    app.use(express.static('./tmp'));
    // Any invalid calls for templateUrls are under app/* and should return 404
    app.use('/app/*', function(req, res, next) {
      four0four.send404(req, res);
    });
    // Any deep link calls should return index.html
    app.use('/*', express.static('./ui/index.html'));
    break;
}

/*
var server = app.listen(port, function() {
  console.log('Express server listening on port ' + port);
  console.log('env = ' + app.get('env') +
    '\n__dirname = ' + __dirname  +
    '\nprocess.cwd = ' + process.cwd());
});
*/

var server = null;
if (options.https) {
  // Docs on how to create self signed certificates
  // https://devcenter.heroku.com/articles/ssl-certificate-self#prerequisites
  console.log("Starting the server in https");
  var privateKey  = fs.readFileSync('server.key', 'utf8');
  var certificate = fs.readFileSync('server.crt', 'utf8');
  var credentials = {
    key: privateKey,
    cert: certificate
  };
  server = http.createServer(credentials, app);
} else {
  server = http.createServer(app);
}

server.listen(port, function() {
  console.log('Express server listening on port ' + port);
  console.log('env = ' + app.get('env') +
    '\n__dirname = ' + __dirname  +
    '\nprocess.cwd = ' + process.cwd());
});

server.timeout = 0;
