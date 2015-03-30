var express = require("express");
var app = express();

var dharmaTalksParser = require("./dharma-talks-parser");
var cronJob = require("cron").CronJob;

var job = new cronJob({
	cronTime: "0 * * * *", 
	onTick: function () {
		dharmaTalksParser.run()
	}, 
	start: true, 
	timeZone: "America/Chicago"
});

dharmaTalksParser.run();

var dharmaTalks = require("./routes/dharma-talks-v1")

app.use("/dharma-talks-v1", dharmaTalks);

app.listen(3003);