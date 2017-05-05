var express = require('express');
var bodyParser = require('body-parser');
var cheerio = require('cheerio');
var request = require('request');
var path = require('path');

var app = express();
var port = process.env.PORT || 1337;

var url = "http://catedral.prefeitura.unicamp.br/cardapio.php";


// 1 - prato principal
// 4 - sobremesa
// 5 - suco
var almoco = [];
var janta = [];
var k = 0;

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res){

  request(url, function(err, resp, body){
    var $ = cheerio.load(body);

    $('.fundo_cardapio').each(function(i, elem) {
      k = 0;
      $('br').remove();
      var cardapio = $(this);
      if(i == 1 || i == 3){
        cardapio.find('tr td').each(function (j) {
          if($(this).find('strong').is('strong')){
            $(this).find('strong').remove();
            //console.log($(this).text());
            if(i == 1) almoco[k++] = $(this).html().toProperCase();
            else if(i == 3) janta[k++] = $(this).text().toProperCase();
          }
        });
      }
    });


  });
  console.log(almoco);
  console.log(janta);
  res.send('Hello World!');
});

/*
  SE ENCONTRAR BOLD
    PEGA O CONTEÚDO DO PAI
    REMOVE O BOLD
    ADICIONA O RESTO NA ARRAY

  INDEX 0 = PRATO PRINCIPAL
  INDEX 1 = SALADA
  INDEX 2 = SOBREMESA
  INDEX 3 = SUCO
*/


app.post('/almoco', function(req, res, next){
  var username = req.body.user_name;
  if(req.body.user_name != 'lzbernardo')
    var botPayLoad = { "text" : "Deve ser cozido misto brother" };
  else
    var botPayLoad = {
      "text": 'Prato Principal: *' + almoco[0] + '*\n Suco: *' + almoco[3] + '*\n Sobremesa: *' + almoco[2] + '*\n'
    };

  if(username !== 'slackbot') {
    return res.status(200).json(botPayLoad);
  } else {
    return res.status(200).end();
  }
});

app.post('/janta', function(req, res, next){
  var username = req.body.user_name;
  var botPayLoad = {

      "text": 'Prato Principal: *' + janta[0] + '*\n Suco: *' + janta[3] + '*\n Sobremesa: *' + janta[2] + '*\n'

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
