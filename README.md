# Health Check
Simple and highly customisable JSON health check builder.


``` javascript
var status = require('mrp-health');

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

#Example Output
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
				"result": "FAILURE", // SUCCESS, or FAILURE
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
