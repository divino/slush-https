/* jshint node:true */

'use strict';

var config = require('../../gulp.config')();

module.exports = function(){

  var environment = process.env.NODE_ENV;
  environment = environment === 'build' ? 'prod' : environment;

  var envJson = getEnvOptions(environment);

  var options = {
    env: environment,
    appName: process.env.APP_NAME || envJson['app-name'] || 'slush-app',
    https: process.env.HTTPS || envJson['https'] == "true" || false,
    httpsStrict: process.env.HTTPS_STRICT || envJson['httpsStrict'] == "true" || false,
    appPort: process.env.APP_PORT || process.env.PORT || envJson['node-port'] || config.defaultPort,
    mlHost: process.env.ML_HOST || envJson['ml-host'] || config.marklogic.host,
    mlHttpPort: process.env.ML_PORT || envJson['ml-http-port'] || config.marklogic.httpPort,
    defaultUser: process.env.ML_APP_USER || envJson['ml-app-user'] || config.marklogic.user,
    defaultPass: process.env.ML_APP_PASS || envJson['ml-app-pass'] || config.marklogic.password,
    guestAccess: bool(process.env.GUEST_ACCESS || envJson['guest-access'] || config.marklogic.guestAccess || false),
    disallowUpdates: bool(process.env.DISALLOW_UPDATES || envJson['disallow-updates'] || config.marklogic.disallowUpdates || false),
    appUsersOnly: bool(process.env.APP_USERS_ONLY || envJson['appusers-only'] || config.marklogic.appUsersOnly || false)
  };

  if (options.httpsStrict != "true") {
    console.warn("Allowing self signed certificates.");
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  return options;

  function getEnvOptions(env) {
    var envJson;
    var envFile = '../../' + env + '.json';

    try {
      envJson = require(envFile);
    }
    catch (e) {
      envJson = {};
      console.log('Couldn\'t find ' + envFile + '; you can create this file to override properties - ' +
        '`gulp init-local` creates local.json which can be modified for other environments as well');
    }

    return envJson;
  }

  function bool(x) {
    return (x === 'true' || x === true);
  }

};
