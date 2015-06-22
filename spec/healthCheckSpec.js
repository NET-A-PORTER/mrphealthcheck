var health = require('../index');
var nock = require('nock');
var tk = require('timekeeper');
// free time for testing
var time = new Date(1330688329321);
tk.freeze(time);

jasmine.DEFAULT_TIMEOUT_INTERVAL = 2000

describe("Health Check Modules", function() {

    it("Should handle checks against external services with error codes", function(done) {

        var googleRequest = nock('http://googleerror.com')
            .replyDate(new Date(2015, 0, 1))
            .get('/')
            .reply('ECONNABORTED', undefined);

        var yahooRequest = nock('http://yahooerror.com')
            .replyDate(new Date(2015, 0, 1))
            .get('/')
            .reply('ENOTFOUND', undefined);

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

            expect(JSON.stringify(data)).toBe('{"application":{"name":"test app","uptimeSeconds":300,"env":"development","nodeVersion":"0.10.31","checks":[{"name":"google","url":"http://googleerror.com/","result":"SUCCESS","dateOfCheck":"2012-03-02T11:38:49.321Z"},{"name":"yahoo","url":"http://yahooerror.com","result":"SUCCESS","dateOfCheck":"2012-03-02T11:38:49.321Z"}]}}')
            googleRequest.done();
            yahooRequest.done();

            done();
        });

    });
});
