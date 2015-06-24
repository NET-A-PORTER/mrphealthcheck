var Promise = require('es6-promise').Promise;

module.exports = {
  get: function(url, timeout, queryParams, headers) {

    return new Promise(
        function(resolve, reject) {
        require('superagent')
        .get(url)
        .timeout(timeout)
        .query(queryParams || {})
        .set(headers || {})
        .end(function(error, res)  {
          if (error) {
              if (error.code == 'ECONNABORTED' || error.code == 'ENOTFOUND') {
                  reject({response: {error: {status: 408}}});
              } else {
                  reject(error);
              }
          } else {

              resolve(res);
          }
        });
    });
  }
};
