var express = require('express');
var AWS = require('aws-sdk');
var fs = require('fs');

//Read config values from a JSON file.
var config = fs.readFileSync('./app_config.json', 'utf8');
config = JSON.parse(config);

// Update the region settings
AWS.config.update({
  region: config.AWS_REGION,
  endpoint: config.ENDPOINT
});

//Create DynamoDB client and pass in region.
//var dynamoDB = new AWS.DynamoDB({region: config.AWS_REGION});
var docClient = new AWS.DynamoDB.DocumentClient();

var router = express.Router();


/* GET list page. */
router.get('/', function(req, res, next) {
  //res.render('listPage', { title: 'List Movies' });
  console.log("response will be sent from the next function");
  next();
}, function(req, res) {
  var allMovies = [];
  var myMovies = {};
  var item = {};

  var yearArr = [];
  var titleArr = [];
  var ratingArr = [];

  yearArr.push(1933);
  titleArr.push("King Kong");
  ratingArr.push(8.0);
  
  yearArr.push(2016);
  titleArr.push("My Big Movie");
  ratingArr.push(1.0);

  yearArr.push(2001);
  titleArr.push("Old Little Movie");
  ratingArr.push(3.0);

  for (var i = 0; i < yearArr.length; i++) {

    movie = {
        year: yearArr[i],
        title: titleArr[i],
        rating: ratingArr[i]
    };

    //allMovies.push(movie);
  };

  var params = {
      TableName: "Movies",
      ProjectionExpression: "#yr, title, info.rating",
      FilterExpression: "#yr between :start_yr and :end_yr",
      ExpressionAttributeNames: {
          "#yr": "year",
      },
      ExpressionAttributeValues: {
          ":start_yr": 1950,
          ":end_yr": 1959 
      }
  };

  console.log("Scanning Movies table.");
  docClient.scan(params, onScan);

  function onScan(err, data) {
      if (err) {
          console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      } else {
          // print all the movies
          console.log("Scan succeeded.");
          
          data.Items.forEach(function(movie) {
            item = {
                year: movie.year,
                title: movie.title,
                rating: movie.info.rating
            };

            allMovies.push(item);

            /*
            console.log(
                  movie.year + ": ",
                  movie.title, "- rating:", movie.info.rating);
            */
          });
          
          //console.log(allMovies);

/*
          // continue scanning if we have more movies
          if (typeof data.LastEvaluatedKey != "undefined") {
              console.log("Scanning for more...");
              params.ExclusiveStartKey = data.LastEvaluatedKey;
              docClient.scan(params, onScan);
          }
*/          
          //myMovies = data;
        var ob = JSON.stringify(allMovies, null, 2);
        console.log(ob);

        if (allMovies.length > 0) {
            res.render('list', { layout: 'layout', json : ob } );
        } else {
            res.render('list', { title: 'List Movies!' });
        }
          
      }
  };
  

  
  //res.status(200).send(JSON.stringify(allMovies, null, 2));
});




module.exports = router;