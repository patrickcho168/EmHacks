'use strict';

var express      = require('express'),
    app          = express(),
    vcapServices = require('vcap_services'),
    bluemix      = require('./config/bluemix'),
    extend       = require('util')._extend,
    countries    = require('./src/countries'),
    watson       = require('watson-developer-cloud'),
    httprequest = require('request'), //jul
    bodyParser = require('body-parser'); //jul

//jul
app.use('/assets', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json({
  extended: true
}));

// Bootstrap application settings
require('./config/express')(app);

// -------- For speech to text -----------
var config = extend({
  version: 'v1',
  url: 'https://stream.watsonplatform.net/speech-to-text/api',
  username: "f9a32220-120c-48d7-a73e-bebfb54feb31",
  password: "oTm1rMgmdYus"
}, vcapServices.getCredentials('speech_to_text'));

var authService = watson.authorization(config);

app.get('/', function(req, res) {
  res.render('index', { ct: req._csrfToken });
});

// Get token using your credentials
app.post('/api/token', function(req, res, next) {
  authService.getToken({url: config.url}, function(err, token) {
    if (err)
      next(err);
    else
      res.send(token);
  });
});

// Get token using your credentials
app.post('/post', function(req, res, next) {
  
});

// -------- For text to speech -----------
var textToSpeech = watson.text_to_speech({
  version: 'v1',
  username: '1f01389a-efc3-4104-a91e-82fe27120b7b',
  password: 'vzXGZ1ex8c0m'
});

app.get('/api/synthesize', function(req, res, next) {
  var transcript = textToSpeech.synthesize(req.query);
  transcript.on('response', function(response) {
    if (req.query.download) {
      response.headers['content-disposition'] = 'attachment; filename=transcript.ogg';
    }
  });
  transcript.on('error', function(error) {
    next(error);
  });
  transcript.pipe(res);
});

// -------- For natural language classifier ---------
// if bluemix credentials exists, then override local
var credentials = extend({
  version: 'v1',
  url : 'https://gateway.watsonplatform.net/natural-language-classifier/api',
  username : '2176207c-7dfa-45de-90a3-712cde58914f',
  password : 'QGC1XexqVKnU',
}, bluemix.getServiceCreds('natural_language_classifier')); // VCAP_SERVICES

// Create the service wrapper
var nlClassifier = watson.natural_language_classifier(credentials);

// Responses are json
app.post('/nlc', function(req, res, next) {
  var params = {
    classifier: process.env.CLASSIFIER_ID || 'CEA87Dx5-nlc-709', // pre-trained classifier
    text: req.body.text
  };

  nlClassifier.classify(params, function(err, results) {
    if (err)
      return next(err);
    else
      res.json(results);
  });
});

// Responses are json
app.post('/yesno', function(req, res, next) {
  var params = {
    classifier: process.env.CLASSIFIER_ID || 'CEA87Dx5-nlc-711', // pre-trained classifier
    text: req.body.text
  };

  nlClassifier.classify(params, function(err, results) {
    if (err)
      return next(err);
    else
      res.json(results);
  });
});

// ------- For IBM Extract Relationship -----------

var extrel = watson.relationship_extraction({
  username: '3c15ce82-8104-4aec-8304-b9a17531662f',
  password: '039GtTADKzv5',
  version: 'v1'
});

app.post('/extrel', function(req, res, next) {
  var params = {
    text: req.body.text,
    dataset: 'ie-en-news' 
  };
  extrel.extract(params, function(err, response) {
    if (err) {
      console.log('error:', err);
    } else {
      res.json(response.doc.entities.entity);
    }
  })
})

// -------- For SU Time ------------

var NLP = require('./lib/index');
var path = require('path');

var SUtime_config = {
  'nlpPath':path.join ( __dirname,'./corenlp'), //the path of corenlp
  'version':'3.5.2', //what version of corenlp are you using
  'annotators': ['tokenize','cleanxml','ssplit','pos','parse','sentiment','depparse','quote','lemma', 'ner'], //optional!
  'extra' : {
      'depparse.extradependencie': 'MAXIMAL'
    }
};

var coreNLP = new NLP.StanfordNLP(SUtime_config);

app.post('/dateproc', function(req, res, next) {
  coreNLP.process(req.body.text, function(err, result) {
    if (err) {
      console.log('error:', err);
    } else {
      var token = result.document.sentences.sentence.tokens.token
      // console.log(token);
      if( Object.prototype.toString.call( token ) === '[object Array]' ) {
        var finished = false
        for (var i=0;i<token.length;i++) {
          if (typeof token[i].NormalizedNER != 'undefined') {
            finished = true
            console.log(token[i].NormalizedNER)
            res.json(token[i].NormalizedNER);
            break;
          }
        }
        if (!finished) {
          res.json("NOTHING")
        }
      } else {
        if (typeof token.NormalizedNER != 'undefined') {
          res.json(token.NormalizedNER);
        } else {
          res.json("NOTHING")
        }
      }
    }
  });
});

// --------- For country code processing ------------

app.post('/getcountry', function(req, res, next) {
  console.log(req.body.text);
  var location = req.body.text;
  var country_code_list = [];
  for (var i=0;i<countries.length;i++) {
    if (countries[i]["Subregion"].indexOf(location) > -1 || countries[i]["Region"].indexOf(location) > -1 || countries[i]["Name"].indexOf(location) > -1) {
      country_code_list.push(countries[i]["Code"]);
    }
  }
  res.json(country_code_list)
});

// ------ For ------
//jul: for flight search result
app.post("/getquotes", function(request, response) {
  // var search_params = request.body;

  // NOTE: 
  // des formats: anywhere
  // od formats: anytime, yyyy-mm, yyyy-mm-dd
  var country_code = req.body.country_code;
  var date = req.body.travel_date;

  var webpath = 'http://api.skyscanner.net/apiservices/xd/browsequotes/v1.0/SG/USD/en-US/sfo/' + country_code + '/' + date + '/anytime?apikey=ah473367287496555171637201591562&callback=cb';

  // var webpath = 'http://api.skyscanner.net/apiservices/xd/browsequotes/v1.0/SG/USD/en-US/sfo/sg/anytime?apikey=ah473367287496555171637201591562&callback=cb';

  console.log("#############webpath is: " + webpath + "############");
  httprequest(webpath, function (error, response2, body2) {
    if (!error && response.statusCode == 200) {
      response.json(body2);
    }
  })
});

// error-handler settings
require('./config/error-handler')(app);

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);