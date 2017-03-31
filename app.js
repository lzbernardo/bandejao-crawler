var express = require('express');
var bodyParser = require('body-parser');
var cheerio = require('cheerio');
var request = require('request');

var app = express();
var port = process.env.PORT || 1337;

var url = "http://catedral.prefeitura.unicamp.br/cardapio.php";


// 1 - prato principal
// 4 - sobremesa
// 5 - suco
var almoco = [];
var janta = [];

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

request(url, function(err, resp, body){
  var $ = cheerio.load(body);

  $('.fundo_cardapio').each(function(i, elem) {
    $('strong').remove();
    $('br').remove();
    var cardapio = $(this);
    if(i == 1 || i == 3){
      cardapio.find('tr td').each(function (j) {
        if(i == 1) almoco[j] = $(this).text().toProperCase();
        else if(i == 3) janta[j] = $(this).text().toProperCase();
      });
    }
  });


});

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res) {res.status(200).send('Hello World! Fully functional.'); });

app.post('/hello', function(req, res, next){
  var username = req.body.user_name;
  var botPayLoad = {
    text: 'O almoço de hoje é *' + almoco[1] + '* com suco de *' + almoco[5] + '* e *' + almoco[4] + '* de sobremesa! \n A janta é *' + janta[1] + '* com suco de *' + almoco[5] + '* e *' + almoco[4] + '* de sobremesa!'
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
