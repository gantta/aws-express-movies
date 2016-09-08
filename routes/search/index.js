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


/* GET search page. */
router.get('/', function(req, res, next) {
  res.render('search', { title: 'Search Movies' });
});

router.post('/searchMovies', function(req, res) {
//router.get('/searchMovies', function(req, res) {    
  var yearField = req.body.year,
      titleField = req.body.title;

  //res.send("Movie Found");

  // @todo: add some validation to the input fields

  var params = {
      TableName: config.DB_TABLENAME,
      ProjectionExpression:"#yr, title, info.genres, info.actors[0]",
      KeyConditionExpression: "#yr = :yyyy and title = :title",
      ExpressionAttributeNames:{
          "#yr": "year"
      },
      ExpressionAttributeValues: {
          ":yyyy": Number(yearField),
          ":title": titleField
      }
  };

  docClient.query(params, function(err, data) {
      if (err) {
          console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
          res.sendStatus(500);
      } else {
          console.log("Query succeeded.");
          if (data.Count > 0) {
            console.log("Movie was found");
            //res.sendStatus(200);
            res.send("Movie Found");
              
        } else {
            console.log("Movie was not found");
            //res.sendStatus(204);
            res.sendStatus("Movie Not Found");
          }
          /*
          data.Items.forEach(function(item) {
              console.log(" -", item.year + ": " + item.title);
          });
          res.sendStatus(200);
          */
      }
  });
});

module.exports = router;
