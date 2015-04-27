var Promises = require('es6-promise').Promise
function HealtCheck(obj) {
  this.healthCheckObject = this.getApplicationDetails(obj);
  this.healthChecksArray = obj.checks;
};

HealtCheck.prototype.getHealthCheckResult = function(obj) {
  var self = this;

  return this.getHealthChecks().then(function(checks) {

    var application = self.healthCheckObject

    application.checks = checks[0];
    return {"application" : application}

  });

};

HealtCheck.prototype.getApplicationDetails = function(obj) {
  var application = {};

  for(item in obj) {
    // checks are handled differently, see buildHealthChecks method
    if(item !== 'checks') {
      application[item] = obj[item];
    }

  };

  return application;

};

HealtCheck.prototype.getHealthChecks = function() {

  var checkArray = this.healthChecksArray;
  var self = this;
  var servicesCheck = [];

  // if no checks, will exit
  if(!checkArray) {
    return Promises.resolve([], 'no checks array')
  }

  checkArray.forEach(function(v, i) {

    var url = v.url;

    var results = self.getServiceStatus(url).then(function(data) {

      checkArray[i].result = (data.status === 200 ? 'SUCCESS' : 'FAILURE');
      checkArray[i].dateOfCheck = new Date().toISOString();

      return checkArray;

    });

    servicesCheck.push(results);

  });

  return Promises.all(servicesCheck)
};


HealtCheck.prototype.getServiceStatus = function(url) {

  return require('./lib/http').get(url).then(function(data) {

    return data;

  }, function Error(error) {

    return error.response.error;

  });
};

module.exports = function (obj) {
  return new HealtCheck(obj).getHealthCheckResult(obj);
};
