function HealtCheck(obj) {
  this.healthCheckObject = this.getApplicationDetails(obj);
  this.healthChecksArray = obj.checks;
};

HealtCheck.prototype.getHealthCheckResult = function(obj) {
  var self = this;

  return this.getHealthChecks().then(function(checks) {

    var application = self.healthCheckObject

    application.checks = checks;
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

  var CheckArray = this.healthChecksArray;
  var self = this;
  var servicesCheck = [];

  CheckArray.forEach(function(v, i) {

    var url = CheckArray[i].url;

    var results = self.getServiceStatus(url).then(function(data) {

      CheckArray[i].result = (data.status === 200 ? 'SUCCESS' : 'FAILURE');
      CheckArray[i].dateOfCheck = new Date().toISOString();

      return CheckArray
    });

    servicesCheck.push(results);

  });

  return require('es6-promise').Promise.all(servicesCheck)
};


HealtCheck.prototype.getServiceStatus = function(url) {

  return require('./lib/http').get(url).then(function(data) {

    return data;

  }, function Error(error) {


    return error.response.error

  });
};

module.exports = function (obj) {
  return new HealtCheck(obj).getHealthCheckResult(obj);
};
