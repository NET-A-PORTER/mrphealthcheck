var Promises = require('es6-promise').Promise;

module.exports = {

  get: function(url, queryParams, headers) {
    return new Promises(function(resolve, reject) {
      require('superagent')
        .get(url)
        .timeout(2000)
        .query(queryParams || {})
        .set(headers || {})
        .end(function(error, res) {
          if (error) {
            reject(error);
          } else {
            resolve(res);
          }
        });
    });
  }


};
