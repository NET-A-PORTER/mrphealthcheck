var health = require('./index');

var result = health({

    "name": "My App",
    "bootTime": "2014-02-28T15:30:00Z", // http://en.wikipedia.org/wiki/ISO_8601#Combined_date_and_time_representations
    "buildTime": "2014-02-28T15:30:00Z",
    "version": "1.0.0",
    "buildNumber": 55,
    "gitCommit": "860760dbba4e131209e458c61979895e5d51a8c4",
    "buildUrl": "http://jenkins01.vm.wtf.nap:8080/jenkins/job/CI-my-app/55/",
    "gitUrl": "http://stash.vm.wtf.nap:7990/projects/API/repos/my-app/commits/860760dbba4e131209e458c61979895e5d51a8c4",
    "checks": [{
        'name': 'lad',
        'url': 'http://google.com'
    }, {
        'name': 'yahoo',
        'url': 'http://yahoo.com'
    }],
    "host": {
        "host": "sabeur"
    }
});


// console.log(result)
result.then(function healthCheckData(data) {
    console.log(JSON.stringify(data))
});
