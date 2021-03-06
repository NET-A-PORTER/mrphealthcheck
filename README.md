# Health Check [![Circle CI](https://circleci.com/gh/NET-A-PORTER/mrphealthcheck.svg?style=svg&circle-token=dc79a9df5965b1449180d40288b4297d7c41a57c)](https://circleci.com/gh/NET-A-PORTER/mrphealthcheck)
Simple and highly customisable JSON health check builder.

``` javascript
  npm install mrphealthcheck --save
```

# Team using this modules:

* PAC (Product Pages)
* CAP (Checkout)
* Team X (Product Listing)

``` javascript
var status = require('mrphealthcheck');

var results = status({
  "name": "some-app",
  "checks": [
    {
      "name": "mr-porter product page",
      "url" : "http://mrporter.com"
    },
    {
      "name": "Google",
      "url" : "http://google.com"
    }
  ]

}).then( function(data) {
  // {JSON data}
})


```


## Product Page Example:
``` javascript
/**
 * Class - healthMiddleware - executes healthcheck module for a given route 
 *
 * @class healthMiddleware
 * @static
 * @example app.use('/health/check', require('mrphealthcheck');
 */
module.exports = function(req, res) {

	var os = require('os');

	var appUrl = req.protocol + '://' + req.get('host');
	var build = rootRequire('build.json') || {};
	var results = require('mrphealthcheck')({
		'name': 'Mr Porter Product Page',
		"uptimeSeconds": parseInt(process.uptime(), 10),
		'buildTime': build.buildTime,
		"env": req.app.settings.env, //set consistently by server.init
		"nodeVersion": process.versions.node,
		"buildNumber": build.tag,
		"buildUrl": "http://xyz/jenkins/job/CI-mrp_product-page/" + build.tag,
		"gitCommit": build.commit,
		"gitUrl": "http://xyz/product-page/commits/" + build.commit,
		"host": {
			"hostname": os.hostname(),
			"uptimeSeconds": parseInt(os.uptime(), 10)
		},
		"checks": [
			{
				'name': 'Check Product Page App',
				'url': appUrl
			},
			{
				'name': 'LAD API Product Details',
				'url': "http://xyz:80/categories?business=MRP&country=GB&lang=en"
			}
		]

	});

	results.then(function(healthCheck) {
		res.json(healthCheck);
	});

};
```

## Generic Output Example:
``` javascript
{
	"application": {
	  "name": "My App",
  	"bootTime": "2014-02-28T15:30:00Z",
  	"buildTime": "2014-02-28T15:30:00Z",
  	"uptimeSeconds": 300,
  	"version": "1.0.0",
	  "buildNumber": 55,
	  "buildUrl": "http://jenkins01.vm.wtf.nap:8080/jenkins/job/CI-my-app/55/",
	  "gitCommit": "860760dbba4e131209e458c61979895e5d51a8c4",
    "configuration": {
    	// Application specific configuration
    },
    "metrics": {
    	// Application specific metrics (request/second, etc)
    },
    "checks": [
			{
				"name": "mr-porter product page",
				"result": "FAILED", // SUCCESS, or FAILED
				"dateOfCheck": "2015-04-27T11:34:46.336Z",
			}
		]
	},
	"host": {
	  "currentTime": "2015-04-27T11:34:46.336Z",
	  "bootTime": "2015-04-27T11:34:46.336Z",
    "uptimeSeconds": 300,
	  "hostname": "dev-myApp"
	}
}
```
