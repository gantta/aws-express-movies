var express = require('express');
var AWS = require('aws-sdk');
var fs = require('fs');

//Read config values from a JSON file.
var config = fs.readFileSync('./app_config.json', 'utf8');
config = JSON.parse(config);

//Create DynamoDB client and pass in region.
var dynamoDB = new AWS.DynamoDB({region: config.AWS_REGION});


var router = express.Router();


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Movies!' });
});

/* Post signup users */
router.post('/signup', function(req, res) {
  var nameField = req.body.name,
      emailField = req.body.email,
      previewBool = req.body.previewAccess;
  
  //signup(nameField, emailField, previewBool);

    var formData = {
    TableName: config.STARTUP_SIGNUP_TABLE,
    Item: {
      email: {'S': nameField}, 
      name: {'S': emailField},
      preview: {'S': previewBool}
    }
  };
/*
  dynamoDB.putItem(formData, function(err, data) {
    if (err) {
      console.log('Error adding item to database: ', err);
    } else {
      console.log('Form data added to database.');
    }
  });
*/

  res.sendStatus(200);

});




/* Post new movie */
router.post('/addnew', function(req, res) {
  var yearField = req.body.year,
      titleField = req.body.title;
  
  // @todo: add some validation on the input fields
  
  var formData = {
    TableName: config.DB_TABLENAME,
    Item: {
      year: {'N': yearField},
      title: {'S': titleField}
    }
  };


  dynamoDB.putItem(formData, function(err, data) {
    if (err) {
      console.log('Error adding item to database: ', err);
      res.sendStatus(500);
    } else {
      console.log('Form data added to database.');
      res.sendStatus(200);
    }
  });

});


module.exports = router;
