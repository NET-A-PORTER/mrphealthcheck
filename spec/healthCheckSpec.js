var health = require('../index');
var nock = require('nock');
var tk = require('timekeeper');
// free time for testing
var time = new Date(1330688329321);
tk.freeze(time);

jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000

describe("Health Check Modules", function() {

  it("Should handle basic data", function(done) {

    health({
      "name": "test app",
      "uptimeSeconds": 300,
      "env": process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : "development",
      "nodeVersion": "0.10.31",
      "random": "You can pass anything"

    }).then(function(data) {
        expect(JSON.stringify(data)).toBe('{"application":{"name":"test app","uptimeSeconds":300,"env":"development","nodeVersion":"0.10.31","random":"You can pass anything"}}')
          done();
    });

  });


  it("Should handle checks against external services", function(done) {

    var googleRequest = nock('http://google.com')
    .replyDate(new Date(2015, 0, 1))
    .get('/')
    .reply(200, {"data": "Got back some data"});

    var yahooRequest = nock('http://yahoo.com')
    .replyDate(new Date(2015, 0, 1))
    .get('/')
    .reply(200, {"data": "Got back some data"});

    health({
      "name": "test app",
      "uptimeSeconds": 300,
      "env": process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : "development",
      "nodeVersion": "0.10.31",
      "checks": [
        {
        'name': 'google',
        'url': 'http://google.com/'
      },
      {
        'name': 'yahoo',
        'url': 'http://yahoo.com'
      }
    ]

    }).then(function(data) {

        expect(JSON.stringify(data)).toBe('{"application":{"name":"test app","uptimeSeconds":300,"env":"development","nodeVersion":"0.10.31","checks":[{"name":"google","url":"http://google.com/","result":"SUCCESS","dateOfCheck":"2012-03-02T11:38:49.321Z"},{"name":"yahoo","url":"http://yahoo.com","result":"SUCCESS","dateOfCheck":"2012-03-02T11:38:49.321Z"}]}}')
        googleRequest.done();
        yahooRequest.done();

        done();
    });

  });


  it("Should handle checks against external services with error", function(done) {

    var googleRequest = nock('http://google.com')
    .replyDate(new Date(2015, 0, 1))
    .get('/')
    .reply(404, {"data": "Got back some data"});

    var yahooRequest = nock('http://yahoo.com')
    .replyDate(new Date(2015, 0, 1))
    .get('/')
    .reply(200, {"data": "Got back some data"});

    health({
      "name": "test app",
      "uptimeSeconds": 300,
      "env": process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : "development",
      "nodeVersion": "0.10.31",
      "checks": [
        {
        'name': 'google',
        'url': 'http://google.com/'
      },
      {
        'name': 'yahoo',
        'url': 'http://yahoo.com'
      }
    ]

    }).then(function(data) {

        expect(JSON.stringify(data)).toBe('{"application":{"name":"test app","uptimeSeconds":300,"env":"development","nodeVersion":"0.10.31","checks":[{"name":"google","url":"http://google.com/","result":"FAILURE","dateOfCheck":"2012-03-02T11:38:49.321Z"},{"name":"yahoo","url":"http://yahoo.com","result":"SUCCESS","dateOfCheck":"2012-03-02T11:38:49.321Z"}]}}')
        googleRequest.done();
        yahooRequest.done();

        done();
    });

  });

    it("Should handle timeout", function(done) {
        nock.enableNetConnect();

        health({
            "name": "test app",
            "uptimeSeconds": 300,
            "env": process.env.NODE_ENV ? process.env.NODE_ENV.toLowerCase() : "development",
            "nodeVersion": "0.10.31",
            "random": "You can pass anything",
            "checks": [
                {
                    'name': 'real timeout',
                    'url': 'http://mrporter.com:801/'
                },
                {
                    'name': 'not found',
                    'url': 'http://384u385.com'
                },
                {
                    'name': 'real reddit',
                    'url': 'http://www.reddit.com/'
                }
            ]

        }).then(function(data) {
            expect(data.application.checks[0].result).toBe('FAILURE');
            expect(data.application.checks[1].result).toBe('FAILURE');
            expect(data.application.checks[2].result).toBe('SUCCESS');
            nock.disableNetConnect();

            done();
        });

    });




});
