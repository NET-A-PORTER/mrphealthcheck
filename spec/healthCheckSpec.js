var health = require('../index');
var nock = require('nock');
var Promises = require('es6-promise').Promise;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000;

describe("Health Check Modules", function() {
  it("Should handle multiple checks", function(done) {
      var googleRequest = nock('http://googlecom')
          .get('/')
          .reply(200, {});

      var yahooRequest = nock('http://yahoocom')
          .get('/')
          .reply(200, {});

      var hotmail = nock('http://hotmailcom')
          .get('/')
          .reply(200, {});

      var facebook = nock('http://facebookcom')
          .get('/')
          .reply(200, {});

      var bing = nock('http://bingcom')
          .get('/')
          .reply(200, {});

      var msn = nock('http://msncom')
          .get('/')
          .reply(200, {});

      var myspace = nock('http://myspacecom')
          .get('/')
          .reply(200, {});


      health({
          "name": "test app",
          "uptimeSeconds": 300,
          "env": process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : "development",
          "nodeVersion": "0.10.31",
          "checks": [
              {
                  'name': 'google',
                  'url': 'http://googlecom'
              },
              {
                  'name': 'yahoo',
                  'url': 'http://yahoocom'
              },
              {
                  'name': 'hotmail',
                  'url': 'http://hotmailcom'
              },
              {
                  'name': 'faceook',
                  'url': 'http://facebookcom'
              },
              {
                  'name': 'bing',
                  'url': 'http://bingcom'
              },
              {
                  'name': 'msn',
                  'url': 'http://msncom'
              },
              {
                  'name': 'myspace',
                  'url': 'http://myspacecom'
              }
          ]
      }).then(function(data) {
          expect(data.application.checks[0].name).toBe('google');
          expect(data.application.checks[0].result).toBe('SUCCESS');
          expect(data.application.checks[1].name).toBe('yahoo');
          expect(data.application.checks[1].result).toBe('SUCCESS');

          googleRequest.done();
          yahooRequest.done();
          hotmail.done();
          facebook.done();
          bing.done();
          msn.done();
          msn.done();
          myspace.done();


          done();
      });
  });



    it("Should handle checks against external services with error codes", function(done) {
        var googleRequest = nock('http://googleerror.com')
            .get('/')
            .reply(500, undefined);

        var yahooRequest = nock('http://yahooerror.com')
            .get('/')
            .reply(404, undefined);

        health({
            "name": "test app",
            "uptimeSeconds": 300,
            "env": process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : "development",
            "nodeVersion": "0.10.31",
            "checks": [
                {
                    'name': 'google',
                    'url': 'http://googleerror.com/'
                },
                {
                    'name': 'yahoo',
                    'url': 'http://yahooerror.com'
                }
            ]
        }).then(function(data) {
            expect(data.application.checks[0].name).toBe('google');
            expect(data.application.checks[0].result).toBe('FAILED');
            expect(data.application.checks[1].name).toBe('yahoo');
            expect(data.application.checks[1].result).toBe('FAILED');

            done();
        });
    });

    it("Should be able to handle a custom timeout", function(done) {
        var googleRequest = createDelayedConnectionMockService('http://google.com', 2000);
        var yahooRequest = createDelayedConnectionMockService('http://yahoo.com', 2000);

        health({
            "name": "test app",
            "checks": [
                {
                    'name': 'Google',
                    'url': 'http://google.com/',
                    'timeout': 3000
                },
                {
                    'name': 'Yahoo',
                    'url': 'http://yahoo.com/',
                    'timeout': 1000
                }
            ]
        }).then(function(data) {
            expect(data.application.checks[0].name).toBe('Google');
            expect(data.application.checks[0].result).toBe('SUCCESS');
            expect(data.application.checks[1].name).toBe('Yahoo');
            expect(data.application.checks[1].result).toBe('FAILED');

            googleRequest.done();
            yahooRequest.done();

            done();
        });

    });

    it("Should use a default timeout of 2000ms if one isn't specified.", function(done) {
        var googleRequest = createDelayedConnectionMockService('http://google.com', 3000);
        var yahooRequest = createDelayedConnectionMockService('http://yahoo.com', 1000);

        health({
            "name": "test app",
            "checks": [
                {
                    'name': 'Google',
                    'url': 'http://google.com/'
                },
                {
                    'name': 'Yahoo',
                    'url': 'http://yahoo.com/'
                }
            ]
        }).then(function(data) {
            expect(data.application.checks[0].name).toBe('Google');
            expect(data.application.checks[0].result).toBe('FAILED');
            expect(data.application.checks[1].name).toBe('Yahoo');
            expect(data.application.checks[1].result).toBe('SUCCESS');

            googleRequest.done();
            yahooRequest.done();
            done();
        });

    });
    it("Should hide the user specified timeout in the response.", function(done) {
        var googleRequest = createDelayedConnectionMockService('http://google.com', 500);
        health({
            "name": "test app",
            "checks": [
                {
                    'name': 'Google',
                    'url': 'http://google.com/',
                    'timeout': 1000
                }
            ]
        }).then(function(data) {
            expect(data.application.checks[0].name).toBe('Google');
            expect(data.application.checks[0].timeout).toBeUndefined();
            googleRequest.done();
            done();
        });
    });

    it("Should support custom http clients.", function(done) {
        var clientCalled = false;

        var httpClient = {
            get: function (url, timeout, queryParams, headers) {
                clientCalled = true;
                return new Promises(function(resolve, reject) {
                    resolve({});
                });
            }
        };

        health({
            "name": "test app",
            "checks": [
                {
                    'name': 'Google',
                    'url': 'http://google.com/',
                    'timeout': 1000
                }
            ]
        }, httpClient).then(function(data) {
            expect(clientCalled).toBeTruthy();
            done();
        });
    });
});

createDelayedConnectionMockService = function(url, timeout) {
    return nock(url)
        .get('/')
        .delayConnection(timeout)
        .reply(200, undefined);
};
