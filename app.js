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

  request(url, { encoding: 'latin1' }, function(err, resp, body){
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
            if(i == 1) almoco[k++] = $(this).text().toProperCase();
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

app.post('/slackrequest', function(req, res, next){
  var username = req.body.user_name;
  var text = req.body.text.toLowerCase();

  if(text.contains('no almoço') || text.contains('no almoco') || text.contains('de almoço') || text.contains('de almoco') || text.contains('do almoco') || (text.contains('almoco') && waiting) ){
    if(almoco[0].toLowerCase().contains('cozido')){
      var botPayLoad = { "text": 'Cara, na boa, nem vai... É cozido misto' };
    }
    else {
      var botPayLoad = {
        "text": 'Vai rolar: *' + almoco[0] + '* com suco de *' + almoco[3] + '*. A sobremesa vai ser *' + almoco[2] + '*'
      };
    }
    waiting = 0;
  }

  else if(text.contains('na janta') || text.contains('de janta') || text.contains('pra janta') || text.contains('da janta') || (text.contains('janta') && waiting)){
    if(janta[0].toLowerCase().contains('cozido')){
      var botPayLoad = { "text": 'Cara, na boa, nem vai... É cozido misto' };
    }
    else {
      var botPayLoad = {
        "text": 'Vai rolar: *' + janta[0] + '* com suco de *' + janta[3] + '*. A sobremesa vai ser *' + janta[2] + '*'
      };
    }
    waiting = 0;
  }

  else if(text.contains('no bandeco') || text.contains('no bandejao') || text.contains('pra comer')){
    var botPayLoad = { "text" : "Tu quer saber do almoço ou da janta?" };
    waiting = 1;
  }

  else if(text.contains('valeu link') || text.contains('obrigado link')){
    var botPayLoad = { "text" : "É tois parcero :fathayase:, bom apetite lá!" };
  }


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
