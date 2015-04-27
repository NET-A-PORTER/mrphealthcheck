var http = require('./lib/http');
var Promises = require('es6-promise').Promise;
var debug = require('debug')('health-check');

module.exports = function(healthCheckObject) {

  return buildHealthChecks(healthCheckObject.checks).then(function(data) {

    debug('buildHealthCheck data', data[0]);

    var application = applicationDetails(healthCheckObject);

    application.checks = data[0];

    return {"application" : application}

  });

};

function applicationDetails(healthCheckObject) {

  var application = {};

  for(item in healthCheckObject) {

    // checks are handled differently, see buildHealthChecks method
    if(item !== 'checks') {

      application[item] = healthCheckObject[item];

    }

  }
  debug('application details ', application);

  return application
}

function buildHealthChecks(checksArray) {

  var servicesCheck = [];

  checksArray.forEach(function(v, i) {

    var url = checksArray[i].url;

    var results = getServiceStatus(url).then(function(data) {

      debug(url, 'status:', data.status);

      checksArray[i].result = (data.status === 200 ? 'SUCCESS' : 'FAILURE');
      checksArray[i].dateOfCheck = new Date().toISOString();

      debug('checkArray inside promise ', checksArray[i]);

      return checksArray
    });

    servicesCheck.push(results);

  })

  return Promises.all(servicesCheck)
}

function getServiceStatus(url) {

  return http.get(url).then(function(data) {

    return data;

  }, function Error(error) {

    debug('getServiceStatus Error ', error.response.error);

    return error.response.error

  });
}
