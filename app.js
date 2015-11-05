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

// error-handler settings
require('./config/error-handler')(app);

var port = process.env.VCAP_APP_PORT || 3000;
app.listen(port);
console.log('listening at:', port);
