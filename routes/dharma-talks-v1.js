var express = require("express"),
  	Db = require('mongodb').Db,
  	Server = require('mongodb').Server,
  	Connection = require('mongodb').Connection;

var host = "localhost";
var port = Connection.DEFAULT_PORT;
var db = new Db('dharmaTalks', new Server(host, port, {}), {native_parser:false, w: 1});

var ObjectID = db.bson_serializer.ObjectID;

db.open(function(err, db) {
  if(err) throw err   

  db.authenticate("dharmaTalksApi", "wideopen", function(err, result)
  {
  	if(err)
  	{
  		console.log("Error authenticating:", err);
  	}
  });   
});

var router = express.Router();
//var bodyParser = require('body-parser');
//var parseUrlencoded = bodyParser.urlencoded({ extended: false });

router.route("/talks")
.get(function(request, response)
{
	var talks;

	db.collection('talks', function(err, collection) {

    	// Fetch all docs for rendering of list
    	collection
    	.find({})
    	.sort({ "Date": 1 }, function (err, cursor) {
    		if (err)
    		{
    			console.log("Error sorting:", err);
    		}
    	})
    	.toArray(function(err, items) {            
      		talks = items;

			response.json(talks);
    	})          
 	});
})
//.post(parseUrlencoded, function(request, response)
//{

//});

module.exports = router;