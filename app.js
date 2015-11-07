/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express      = require('express'),
    app          = express(),
    vcapServices = require('vcap_services'),
    bluemix      = require('./config/bluemix'),
    extend       = require('util')._extend,
    watson       = require('watson-developer-cloud');

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
  console.log(req.query);
  var transcript = textToSpeech.synthesize(req.query);
  transcript.on('response', function(response) {
    if (req.query.download) {
      response.headers['content-disposition'] = 'attachment; filename=transcript.ogg';
    }
  });
  transcript.on('error', function(error) {
    next(error);
  });
  console.log(res);
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
    classifier: process.env.CLASSIFIER_ID || 'CEA87Dx5-nlc-383', // pre-trained classifier
    text: req.body.text
  };

  nlClassifier.classify(params, function(err, results) {
    if (err)
      return next(err);
    else
      res.json(results);
  });
});

// error-handler settings
require('./config/error-handler')(app);

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);
