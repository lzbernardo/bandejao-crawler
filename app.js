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
  console.log('rolou um get aqui');
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
var randomExpression = function(){

  var jsonContent = {
    "featured": [
      'vai rolar',
      'vai ter',
      'o prato vai ser',
    ]
  };

  return (jsonContent.featured[Math.floor(Math.random() * jsonContent.featured.length)]);
}

var interjection = function(){

  var jsonContent = {
    "featured": [
      'Opa! ',
      'Deu sorte! ',
      'Ihhh... ',
      'Eita! '
    ]
  };

  return (jsonContent.featured[Math.floor(Math.random() * jsonContent.featured.length)]);
}

var waiting = 0;

app.post('/slackrequest', function(req, res, next){
  var username = req.body.user_name;
  var text = req.body.text.toLowerCase();

  var d = new Date();
  var n = d.getHours() - 3;
  console.log(n);

  if(username == 'luiz.madoreira' || text.indexOf('finge que eu sou o banana')!=-1){
    var botPayLoad = { "text" : interjection() + 'Especialmente pra você, hoje vai ter *Cozido Misto* com suco de *Acerola*. A sobremesa vai ser *Acelga*'};
  }

  else if(username == 'gabrielaffonso' || text.indexOf('finge que eu sou o cabra')!=-1){
    var botPayLoad = { "text" : 'Hoje não vai ter nada não, porque o bandeco é pago com impostos e *imposto é roubo.*'};
  }

  else if(username == 'ismael.melo' || text.indexOf('finge que eu sou o ismael')!=-1){
    var botPayLoad = { "text" : 'Vai ter *croissant*, certeza.'};
  }

  else if( (n > 14 && n < 13) || (n > 20 && n < 0) ){
    var botPayLoad = { "text" : 'Acho que agora já tá meio tarde, né brother... Mas na FEA/FEM sempre tem comida :relieved:'};
  }

  else if(text.indexOf('no almoço')!=-1 || text.indexOf('no almoco')!=-1 || text.indexOf('de almoço')!=-1 || text.indexOf('de almoco')!=-1 || text.indexOf('do almoco')!=-1 ){
    if(almoco[0].toLowerCase().indexOf('cozido')!=-1){
      var botPayLoad = { "text": 'Cara, na boa, nem vai... É cozido misto :mask:' };
    }
    else {
      var botPayLoad = {
        "text": 'No *almoço* ' + randomExpression() + ' *' + almoco[0] + '* com suco de *' + almoco[3] + '*. A sobremesa vai ser *' + almoco[2] + '*'
      };
    }
  }

  else if(text.indexOf('na janta')!=-1 || text.indexOf('de janta')!=-1 || text.indexOf('pra janta')!=-1 || text.indexOf('da janta')!=-1){
    if(janta[0].toLowerCase().indexOf('cozido')!=-1){
      var botPayLoad = { "text": 'Cara, na boa, nem vai... É cozido misto' };
    }
    else {
      var botPayLoad = {
        "text": 'Na *janta* ' + randomExpression() + ' *' + janta[0] + '* com suco de *' + janta[3] + '*. A sobremesa vai ser *' + janta[2] + '*'
      };
    }
  }

  else if(text.indexOf('no bandeco')!=-1 || text.indexOf('no bandejao')!=-1 || text.indexOf('pra comer')!=-1){
    var botPayLoad = { "text" : "Tu quer saber _do almoço_ ou _da janta_? :thinking_face:" };
    waiting = 1;
  }

  else if(text.indexOf('valeu link')!=-1 || text.indexOf('obrigado link')!=-1){
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
