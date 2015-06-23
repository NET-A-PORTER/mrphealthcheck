var Promises = require('es6-promise').Promise;

var DEFAULT_TIME_OUT_MS = 2000;

function HealthCheck(obj) {
  this.healthCheckObject = this.getApplicationDetails(obj);
  this.healthChecksArray = obj.checks;
}

HealthCheck.prototype.getHealthCheckResult = function(obj) {
  var self = this;

  return this.getHealthChecks().then(function(checks) {

    var application = self.healthCheckObject;

    application.checks = checks;
    return {"application" : application}

  });

};

HealthCheck.prototype.getApplicationDetails = function(obj) {
  var application = {};

  this.timeout = obj.timeout;

  for(var item in obj) {
    // checks are handled differently, see buildHealthChecks method
    if(item !== 'checks') {
      application[item] = obj[item];
    }

  }

  return application;

};

HealthCheck.prototype.getHealthChecks = function() {

  var checkArray = this.healthChecksArray;
  var self = this;
  var servicesCheck = [];

  // if no checks, will exit
  if(!checkArray) {
    return Promises.resolve([], 'no checks array')
  }

  checkArray.forEach(function(v, i) {

    var url = v.url;
    var timeout = v.timeout || DEFAULT_TIME_OUT_MS;

    var results = self.getServiceStatus(url, timeout).then(function(data) {

      checkArray[i].result = (data.status === 200 ? 'SUCCESS' : 'FAILURE');
      checkArray[i].dateOfCheck = new Date().toISOString();

      // No need to return the timeout back to the user.
      delete checkArray[i].timeout;

      return checkArray[i];

    });

    servicesCheck.push(results);

  });

  return Promises.all(servicesCheck)
};


HealthCheck.prototype.getServiceStatus = function(url, timeout) {

  return require('./lib/http').get(url, timeout).then(function(data) {

    return data;

  }, function Error(error) {
      return error.response.error;
  });
};

module.exports = function (obj) {
  return new HealthCheck(obj).getHealthCheckResult(obj);
};
