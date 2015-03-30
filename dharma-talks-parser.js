module.exports.run = function (request, response)
{
	var http = require("http"),
	  	cheerio = require("cheerio"),
	  	talksList = [],
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
	  	else
	  	{
		  //  !!! CHANGE
		  db.ensureIndex("talks", {"Url": 1}, { unique: true }, function(err, result) {
		    if (err) 
		    {
		    	throw err    
		    }
		  });
	  	}
	  });

	});

	(function(){
	  if (!Array.prototype.indexOfPropertyValue){
	    Array.prototype.indexOfPropertyValue = function(propValueArray){
	      for (var index = 0; index < this.length; index++){

	        if ("undefined" !== typeof propValueArray[0] 
	          && "undefined" !== typeof this[index][propValueArray[0].prop]
	          && "undefined" !== typeof propValueArray[1] 
	          && "undefined" !== typeof this[index][propValueArray[1].prop]){

	          if (this[index][propValueArray[0].prop] == propValueArray[0].value
	            && this[index][propValueArray[1].prop] == propValueArray[1].value){
	            return index;
	          }
	        }
	        else if("undefined" !== typeof this[index][propValueArray[0].prop])
	        {
	          if (this[index][propValueArray[0].prop] == propValueArray[0].value){
	            return index;
	          } 
	        }
	      }
	      return -1;
	    }
	  }
	 })();

	var dharmaTalksApi = {
		host: "www.missiondharma.org",
		port: 80,
		method: "GET",
		path: "/dharma-talks.html"
	};

	var persistData = function (db, talk)
	{
		db.collection('talks', function(err, collection) {

			collection.find({ "Url": talk.Url }).toArray(function (err, results)
			{
				if(err)
				{
					console.log("Error Finding Document with Url:" + talk.Url);
					console.log("Error Finding Document", err);
				}
				else
				{
					if(results.length === 0)
					{
						collection.insert(talk, {safe:true}, function(err, result) 
						{
							if (err)
							{
								console.log("Error inserting:", err);	
							}
						});
					}
					else
					{
						// Don't update existing items with data from the website -- this data will overwrite any data that has been fixed manually
						/*
						resultItem = results[0];

						talk = talksList[talksList.indexOfPropertyValue([{ "prop": "Url", "value": resultItem.Url}])];

						if(resultItem.Title !== talk.Title
						   || resultItem.Speaker !== talk.Speaker)
						{
							console.log("this information doesn't match (Result):", resultItem);
							console.log("this information doesn't match (Talk):", talk);

							collection.update({ "Url": resultItem.Url }, {
								$set: {
									"Title": talk.Title,
									"Speaker": talk.Speaker
								}
							}, function (err)
							{
								if(err)
								{
									console.log("Error updating document", err);
								}
							});
						}
						*/
					}
				}
			});
		});
	};

	var clientRequest = http.get(dharmaTalksApi, function(response)
	{
		var data = [];

		response.on("data", function (chunk) {
			data.push(chunk.toString());
		});

		response.on("end", function ()
		{
			var dataString = data.join(""),
				unparsedHtml,
				dateString,
				date,
				title,
				speaker,
				url;
			//console.log(data);
			var $ = cheerio.load(dataString, { 
				xmlMode: false, 
				decodeEntities: true 
			});

			$("a").each(function ()
			{
				unparsedHtml = $(this).html();
				date = null;
				dateString = null;
				speaker = null;

				if(unparsedHtml.indexOf(":") !== -1)
				{
					dateString = unparsedHtml.split(":")[0];
				}
				else
				{
					dateString = unparsedHtml.split(",")[0] + "," + unparsedHtml.split(",")[1];
				}

				date = new Date(dateString);

				speaker = unparsedHtml
						  .substring(unparsedHtml.lastIndexOf(",") + 1, unparsedHtml.length)
						  .trim();

				title = unparsedHtml
						.replace(dateString, "")
						.replace(speaker, "")
						.replace(":", "")
						.replace(/,/g, "")
						.trim();

				url = $(this).attr("href");

				if(url.indexOf("/uploads/") !== -1)
				{
					talksList.push({
						"UnparsedInfo": unparsedHtml,
						"Date": date,
						"Title": title,
						"Speaker": speaker,
						"Url": url
					});	
				}
			});

			var talk,
				resultItem;

			for(var i = 0, talksListLength = talksList.length; i < talksListLength; i++)
			{
				talk = talksList[i];

				persistData(db, talk);	
			}
		});
	});
}
