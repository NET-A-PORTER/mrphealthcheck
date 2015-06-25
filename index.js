var Promises = require('es6-promise').Promise;

var DEFAULT_TIME_OUT_MS = 2000;

function HealthCheck(obj, httpClient) {
    this.httpClient = httpClient;
    this.healthCheckObject = this.getApplicationDetails(obj);
    this.healthChecksArray = obj.checks;
}

HealthCheck.prototype.getHealthCheckResult = function(obj) {
    var self = this;

    return this.getHealthChecks().then(function(checks) {

        var application = self.healthCheckObject;

        application.checks = checks;

        return {
            "application": application
        }
    });
};

HealthCheck.prototype.getApplicationDetails = function(obj) {
    var application = {};

    for (var item in obj) {
        // checks are handled differently, see buildHealthChecks method
        if (item !== 'checks') {
            application[item] = obj[item];
        }
    }

    return application;
};

function addDateToCheck(check) {
    check.dateOfCheck = new Date().toISOString();
    return check;
}

function removeUnneededAttributesFromCheck(check) {
    // No need to return the timeout back to the user.
    delete check.timeout;
    return check;
}

HealthCheck.prototype.getHealthChecks = function() {

    var checkArray = this.healthChecksArray;
    var self = this;
    var servicesCheck = [];

    // if no checks, will exit
    if (!checkArray) {
        return Promises.resolve([], 'no checks array')
    }

    checkArray.forEach(function(v, i) {

        var url = v.url;
        var timeout = v.timeout || DEFAULT_TIME_OUT_MS;

        var results = self.getServiceStatus(url, timeout, self.httpClient).then(function(data) {
            checkArray[i].result = (data.status === 200 ? 'SUCCESS' : 'FAILED');
            return removeUnneededAttributesFromCheck(addDateToCheck(checkArray[i]));
        }).catch(function(error) {
            checkArray[i].result = 'FAILED';
            return removeUnneededAttributesFromCheck(addDateToCheck(checkArray[i]));
        });

        servicesCheck.push(results);
    });

    return Promises.all(servicesCheck)
};

HealthCheck.prototype.getServiceStatus = function(url, timeout, httpClient) {
    return this.httpClient.get(url, timeout).then(function(data) {
        return data;
    }).catch(function(error) {
        return error.response.error;
    });
};

module.exports = function(obj, httpClient) {
    httpClient = typeof httpClient !== 'undefined' ? httpClient : require('./lib/http');
    return new HealthCheck(obj, httpClient).getHealthCheckResult(obj);
};
