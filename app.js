var express = require('express');
var bodyParser = require('body-parser');
var cheerio = require('cheerio');
var request = require('request');

var app = express();
var port = process.env.PORT || 1337;

var url = "http://catedral.prefeitura.unicamp.br/cardapio.php";

request(url, function(err, resp, body){
  var $ = cheerio.load(body);
  var whatsthis = $('.titulo');
  var whatsthistext = whatsthis.text();

  console.log(whatsthistext);
});

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res) {res.status(200).send('Hello World!'); });

app.post('/hello', function(req, res, next){
  var username = req.body.user_name;
  var botPayLoad = {
    text: 'Hey ' + username + ', I am Link, your link management assistant'
  };

  if(username !== 'slackbot') {
    return res.status(200).json(botPayLoad);
  } else {
    return res.status(200).end();
  }
});

app.listen(port, function(){
  console.log('Listening on port ' + port);
});
