
! function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = "function" == typeof require && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }
    for (var i = "function" == typeof require && require, o = 0; o < r.length; o++) s(r[o]);
    return s
}({
    1: [function(require, module) {
        "use strict";

        function Microphone(_options) {
            var options = _options || {};
            this.bufferSize = options.bufferSize || 8192, this.inputChannels = options.inputChannels || 1, this.outputChannels = options.outputChannels || 1, this.recording = !1, this.requestedAccess = !1, this.sampleRate = 16e3, this.bufferUnusedSamples = new Float32Array(0), navigator.getUserMedia || (navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia)
        }
        var utils = require("./utils");
        Microphone.prototype.onPermissionRejected = function() {
            console.log("Microphone.onPermissionRejected()"), this.requestedAccess = !1, this.onError("Permission to access the microphone rejeted.")
        }, Microphone.prototype.onError = function(error) {
            console.log("Microphone.onError():", error)
        }, Microphone.prototype.onMediaStream = function(stream) {
            var AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) throw new Error("AudioContext not available");
            this.audioContext || (this.audioContext = new AudioCtx);
            var gain = this.audioContext.createGain(),
                audioInput = this.audioContext.createMediaStreamSource(stream);
            audioInput.connect(gain), this.mic = this.audioContext.createScriptProcessor(this.bufferSize, this.inputChannels, this.outputChannels), console.log("Microphone.onMediaStream(): sampling rate is:", this.sampleRate), this.mic.onaudioprocess = this._onaudioprocess.bind(this), this.stream = stream, gain.connect(this.mic), this.mic.connect(this.audioContext.destination), this.recording = !0, this.requestedAccess = !1, this.onStartRecording()
        }, Microphone.prototype._onaudioprocess = function(data) {
            if (this.recording) {
                var chan = data.inputBuffer.getChannelData(0);
                this.onAudio(this._exportDataBufferTo16Khz(new Float32Array(chan)))
            }
        }, Microphone.prototype.record = function() {
            return navigator.getUserMedia ? void(this.requestedAccess || (this.requestedAccess = !0, navigator.getUserMedia({
                audio: !0
            }, this.onMediaStream.bind(this), this.onPermissionRejected.bind(this)))) : void this.onError("Browser doesn't support microphone input")
        }, Microphone.prototype.stop = function() {
            this.recording && (this.recording = !1, this.stream.getTracks()[0].stop(), this.requestedAccess = !1, this.mic.disconnect(0), this.mic = null, this.onStopRecording())
        }, Microphone.prototype._exportDataBufferTo16Khz = function(bufferNewSamples) {
            var buffer = null,
                newSamples = bufferNewSamples.length,
                unusedSamples = this.bufferUnusedSamples.length;
            if (unusedSamples > 0) {
                buffer = new Float32Array(unusedSamples + newSamples);
                for (var i = 0; unusedSamples > i; ++i) buffer[i] = this.bufferUnusedSamples[i];
                for (i = 0; newSamples > i; ++i) buffer[unusedSamples + i] = bufferNewSamples[i]
            } else buffer = bufferNewSamples;
            for (var filter = [-.037935, -89024e-8, .040173, .019989, .0047792, -.058675, -.056487, -.0040653, .14527, .26927, .33913, .26927, .14527, -.0040653, -.056487, -.058675, .0047792, .019989, .040173, -89024e-8, -.037935], samplingRateRatio = this.audioContext.sampleRate / 16e3, nOutputSamples = Math.floor((buffer.length - filter.length) / samplingRateRatio) + 1, pcmEncodedBuffer16k = new ArrayBuffer(2 * nOutputSamples), dataView16k = new DataView(pcmEncodedBuffer16k), index = 0, volume = 32767, nOut = 0, i = 0; i + filter.length - 1 < buffer.length; i = Math.round(samplingRateRatio * nOut)) {
                for (var sample = 0, j = 0; j < filter.length; ++j) sample += buffer[i + j] * filter[j];
                sample *= volume, dataView16k.setInt16(index, sample, !0), index += 2, nOut++
            }
            var indexSampleAfterLastUsed = Math.round(samplingRateRatio * nOut),
                remaining = buffer.length - indexSampleAfterLastUsed;
            if (remaining > 0)
                for (this.bufferUnusedSamples = new Float32Array(remaining), i = 0; remaining > i; ++i) this.bufferUnusedSamples[i] = buffer[indexSampleAfterLastUsed + i];
            else this.bufferUnusedSamples = new Float32Array(0);
            return new Blob([dataView16k], {
                type: "audio/l16"
            })
        };
        Microphone.prototype._exportDataBuffer = function(buffer) {
            utils.exportDataBuffer(buffer, this.bufferSize)
        }, Microphone.prototype.onStartRecording = function() {}, Microphone.prototype.onStopRecording = function() {}, Microphone.prototype.onAudio = function() {}, module.exports = Microphone
    }, {
        "./utils": 8
    }],
    2: [function(require, module) {
        module.exports = {
            models: [{
                url: "https://stream.watsonplatform.net/speech-to-text/api/v1/models/en-US_BroadbandModel",
                rate: 16e3,
                name: "en-US_BroadbandModel",
                language: "en-US",
                description: "US English broadband model (16KHz)"
            }, {
                url: "https://stream.watsonplatform.net/speech-to-text/api/v1/models/en-US_NarrowbandModel",
                rate: 8e3,
                name: "en-US_NarrowbandModel",
                language: "en-US",
                description: "US English narrowband model (8KHz)"
            }, {
                url: "https://stream.watsonplatform.net/speech-to-text/api/v1/models/es-ES_BroadbandModel",
                rate: 16e3,
                name: "es-ES_BroadbandModel",
                language: "es-ES",
                description: "Spanish broadband model (16KHz)"
            }, {
                url: "https://stream.watsonplatform.net/speech-to-text/api/v1/models/es-ES_NarrowbandModel",
                rate: 8e3,
                name: "es-ES_NarrowbandModel",
                language: "es-ES",
                description: "Spanish narrowband model (8KHz)"
            }, {
                url: "https://stream.watsonplatform.net/speech-to-text/api/v1/models/pt-BR_BroadbandModel",
                rate: 16e3,
                name: "pt-BR_BroadbandModel",
                language: "pt-BR",
                description: "Brazilian Portuguese broadband model (16KHz)"
            }, {
                url: "https://stream.watsonplatform.net/speech-to-text/api/v1/models/pt-BR_NarrowbandModel",
                rate: 8e3,
                name: "pt-BR_NarrowbandModel",
                language: "pt-BR",
                description: "Brazilian Portuguese narrowband model (8KHz)"
            }, {
                url: "https://stream.watsonplatform.net/speech-to-text/api/v1/models/zh-CN_BroadbandModel",
                rate: 16e3,
                name: "zh-CN_BroadbandModel",
                language: "zh-CN",
                description: "Mandarin broadband model (16KHz)"
            }, {
                url: "https://stream.watsonplatform.net/speech-to-text/api/v1/models/zh-CN_NarrowbandModel",
                rate: 8e3,
                name: "zh-CN_NarrowbandModel",
                language: "zh-CN",
                description: "Mandarin narrowband model (8KHz)"
            }]
        }
    }, {}],
    3: [function(require, module, exports) {
        "use strict";
        var display = require("./views/displaymetadata"),
            initSocket = require("./socket").initSocket;
        exports.handleFileUpload = function(type, token, model, file, contentType, callback, onend) {
            function onOpen() {
                console.log("Socket opened")
            }

            function onListening(socket) {
                console.log("Socket listening"), callback(socket)
            }

            function onMessage(msg) {
                msg.results && (baseString = display.showResult(msg, baseString, model), baseJSON = display.showJSON(msg, baseJSON))
            }

            function onError(evt) {
                localStorage.setItem("currentlyDisplaying", "false"), onend(evt), console.log("Socket err: ", evt.code)
            }

            function onClose(evt) {
                localStorage.setItem("currentlyDisplaying", "false"), onend(evt), console.log("Socket closing: ", evt)
            }
            localStorage.setItem("currentlyDisplaying", type), $.subscribe("progress", function(evt, data) {
                console.log("progress: ", data)
            }), console.log("contentType", contentType);
            var baseString = "",
                baseJSON = "";
            $.subscribe("showjson", function() {
                var $resultsJSON = $("#resultsJSON");
                $resultsJSON.empty(), $resultsJSON.append(baseJSON)
            });
            var options = {};
            options.token = token, options.message = {
                action: "start",
                "content-type": contentType,
                interim_results: !0,
                continuous: !0,
                word_confidence: !0,
                timestamps: !0,
                max_alternatives: 3,
                inactivity_timeout: 600
            }, options.model = model, initSocket(options, onOpen, onListening, onMessage, onError, onClose)
        }
    }, {
        "./socket": 7,
        "./views/displaymetadata": 10
    }],
    4: [function(require, module, exports) {
        "use strict";
        var initSocket = require("./socket").initSocket,
            display = require("./views/displaymetadata");
        exports.handleMicrophone = function(token, model, mic, callback) {
            function onOpen(socket) {
                console.log("Mic socket: opened"), callback(null, socket)
            }

            function onListening(socket) {
                mic.onAudio = function(blob) {
                    socket.readyState < 2 && socket.send(blob)
                }
            }

            function onMessage(msg) {
                msg.results && (baseString = display.showResult(msg, baseString, model), baseJSON = display.showJSON(msg, baseJSON))
            }

            function onError() {
                console.log("Mic socket err: ", err)
            }

            function onClose(evt) {
                console.log("Mic socket close: ", evt)
            }
            if (model.indexOf("Narrowband") > -1) {
                var err = new Error("Microphone transcription cannot accomodate narrowband models, please select another");
                return callback(err, null), !1
            }
            $.publish("clearscreen");
            var baseString = "",
                baseJSON = "";
            $.subscribe("showjson", function() {
                var $resultsJSON = $("#resultsJSON");
                $resultsJSON.empty(), $resultsJSON.append(baseJSON)
            });
            var options = {};
            options.token = token, options.message = {
                action: "start",
                "content-type": "audio/l16;rate=16000",
                interim_results: !0,
                continuous: !0,
                word_confidence: !0,
                timestamps: !0,
                max_alternatives: 3,
                inactivity_timeout: 600
            }, options.model = model, initSocket(options, onOpen, onListening, onMessage, onError, onClose)
        }
    }, {
        "./socket": 7,
        "./views/displaymetadata": 10
    }],
    5: [function(require) {
        "use strict";
        var models = require("./data/models.json").models,
            utils = require("./utils");
        utils.initPubSub();
        var initViews = require("./views").initViews,
            showerror = require("./views/showerror"),
            showError = showerror.showError,
            getModels = require("./models").getModels;
        window.BUFFERSIZE = 8192, $(document).ready(function() {

        // FUNCTION FOR SCROLLING TO BOTTOM WHENEVER NEEDED
        function bottom() {
            // document.getElementById( 'bottom' ).scrollIntoView();
            window.scrollTo(0,document.body.scrollHeight);
        };

        // TODO: ADD FUNCTION FOR PROCESSING BASED ON CLASS
        window.STATE = 0; // 0 for not asked or confirmed, 1 for confirming
        window.listOfQuestions = [];
        window.YESNO = "SayAgain";

        // CONSTRAINTS
        window.constraints = {
            maxPrice: null,
            pax: 1,
            earliest_date: new Date(),
            latest_date: new Date(2016,4,7),
            location: null,
            maxTemp: null,
            minTemp: null,
            maxTransfers: null,
            minClass: null,
            maxClass: null
        };
        window.todayDate = "2015-11-07";
        window.YOU = "LT";
        window.timeReference = "";

        // NATURAL LANGUAGE CLASSIFIER FOR YES OR NO RESPONSE
        var postYesNo = function(question, callback) {
            if (question === '' || question == "Hi Line Traveller") {
              window.YESNO = "SayAgain";
              callback();
              return
            }
            $.post('/yesno', {text: question})
              .done(function onSucess(answers){
                if (!answers) {
                    window.YESNO = "SayAgain";
                    callback();
                }
                console.log("YESNO: " + answers.top_class);
                window.YESNO = answers.top_class;
                callback();
              })
              .fail(function onError(error) {
                $error.show();
                $errorMsg.text(error.responseJSON.error ||
                 'There was a problem with the request, please try again');
                callback();
              })

        }

        var getCountryBasedOnLocation = function(callback) {
            console.log(window.constraints.location);
            $.post('/getcountry', {text: window.constraints.location})
              .done(function onSucess(answers){
                if (!answers) {
                    answers = ["CA"];
                    callback(answers);
                    return;
                }
                console.log("Getting country code for : " + window.constraints.location);
                callback(answers);
              })
              .fail(function onError(error) {
                $error.show();
                $errorMsg.text(error.responseJSON.error ||
                 'There was a problem with the request, please try again');
                callback(["CA"]);
              })
        }

        // SUTIME FOR DATE PROCESSING
        var dateProcessing = function(time, callback) {
            if (time === '' || time == "Hi Line Traveller") {
              callback();
              return
            }
            $.post('/dateproc', {text: time})
              .done(function onSucess(answers){
                if (!answers) {
                    callback();
                    return;
                }
                console.log("dateProcessing: " + answers);
                var offset_string = answers.match("OFFSET P(.*)") // P must be PLUS
                var month_string = answers.match("XXXX-(..)") // P must be PLUS
                if (month_string !== null) {
                    month_string = month_string[1]
                }
                if (offset_string === null) {
                    callback();
                } else {
                    window.listOfQuestions.push({issue: "reldate", text: offset_string[1], month_string: month_string});
                    callback();
                }
              })
              .fail(function onError(error) {
                $error.show();
                $errorMsg.text(error.responseJSON.error ||
                 'There was a problem with the request, please try again');
                callback();
              })

        }

        // SEND POST REQUEST FOR NATURAL LANGUAGE CLASSIFIER
        // Ask a question via POST to /
        var askQuestion = function(question, callback) {
            if (question === '' || question == "Hi Line Traveller") {
              callback();
              return;
            };
            console.log("HELLO HERE")
            $.post('/nlc', {text: question})
              .done(function onSucess(answers){
                if (!answers) {
                    callback();
                    return;
                }
                if (answers.classes[0].confidence * 100 > 90) {
                    window.listOfQuestions.push({issue:answers.top_class})
                }
                console.log(answers.top_class);
                console.log((answers.classes[0].confidence * 100) + '%');
                console.log(answers);
                callback();
              })
              .fail(function onError(error) {
                $error.show();
                $errorMsg.text(error.responseJSON.error ||
                 'There was a problem with the request, please try again');
                callback();
              })

        };

        // SEND POST REQUEST FOR EXTRACT RELATIONSHIP
        // Ask a question via POST to /
        var extractRelationship = function(question, callback) {
            if (question === '' || question == "Hi Line Traveller") {
              callback();
              return;
            };

            $.post('/extrel', {text: question})
              .done(function onSucess(answers){
                var total_pax = 0;
                var date_to_process = "";
                if (!answers) {
                    callback();
                    return;
                }
                for (var i=0; i<answers.length; i++) {
                    console.log("Type: " + answers[i].type)
                    if (answers[i].type == "GPE") {
                        window.listOfQuestions.push({issue: "location", text: answers[i].mentref[0].text});
                    }
                    if (answers[i].type == "PERSON") {
                        total_pax += 1;
                    }
                    console.log(answers[i].type)
                    // if (answers[i].type == "DATE") {
                    //     console.log("Processing Date");
                    //     date_to_process = answers[i].mentref[0].text;
                        
                    // }
                    console.log("Words: " + answers[i].mentref[0].text)
                }
                if (window.constraints.pax < total_pax) {
                    window.listOfQuestions.push({issue: "pax", text: total_pax});
                }
                console.log(window.constraints);
                // if (date_to_process != "") {
                //     dateProcessing(date_to_process, function() {
                //         callback();
                //     });
                // }
                callback();
              })
              .fail(function onError(error) {
                $error.show();
                $errorMsg.text(error.responseJSON.error ||
                 'There was a problem with the request, please try again');
                callback();
              })    
        };

        var processConstraint = function(oneQuestion) {
            console.log(oneQuestion);
            if (oneQuestion.issue == "location") {
                window.constraints.location = oneQuestion.text;
            }
            else if (oneQuestion.issue == "pax") {
                window.constraints.pax = oneQuestion.text;
            }
            else if (oneQuestion.issue == "price") {
                window.constraints.maxPrice = 5000;
            }
            else if (oneQuestion.issue == "start earlier") {
                window.constraints.latest_date = "2015-12-31"
            }
            else if (oneQuestion.issue == "start later") {
                window.constraints.earliest_date = "2015-12-1"
            }
            else if (oneQuestion.issue == "colder") {
                window.constraints.maxTemp = 100
            }
            else if (oneQuestion.issue == "hotter") {
                window.constraints.minTemp = 50
            }
            else if (oneQuestion.issue == "higher class") {
                window.constraints.minClass = "Economy"
            }
            else if (oneQuestion.issue == "lower class") {
                window.constraints.maxClass = "First Class"
            }
            else if (oneQuestion.issue == "reldate") {
                var oneText = oneQuestion.text;
                var number_string = oneText.substring(0, oneText.length - 1);
                var date_type = oneText.slice(-1);
                console.log(number_string);
                console.log(date_type);
                if (date_type == 'M') {
                    var today = new Date();
                    var flightDate = new Date(today);
                    flightDate.setMonth(today.getMonth()+parseInt(number_string));
                    flightDate.setDate(1);
                    var flightLastDate = new Date(today);
                    flightLastDate.setMonth(today.getMonth()+parseInt(number_string)+1);
                    flightLastDate.setDate(0);
                    window.constraints.earliest_date = flightDate; 
                    window.constraints.latest_date = flightLastDate;
                } else if (date_type == 'D') {
                    var today = new Date();
                    var flightDate = new Date(today);
                    flightDate.setDate(today.getDate()+parseInt(number_string));
                    window.constraints.earliest_date = flightDate; 
                    window.constraints.latest_date = flightDate;
                } else if (date_type == 'Y') {
                    var today = new Date();
                    var flightDate = new Date(today);
                    var flightLastDate = new Date(today);
                    flightDate.setDate(today.getYear()+parseInt(number_string));
                    flightLastDate.setDate(today.getYear()+parseInt(number_string));
                    if (oneQuestion.month_string != null) {
                        flightLastDate.setMonth(parseInt(oneQuestion.month_string));
                        flightLastDate.setDate(0);
                        flightDate.setMonth(parseInt(oneQuestion.month_string)-1);
                        flightDate.setDate(1);
                    }
                    window.constraints.earliest_date = flightDate; 
                    window.constraints.latest_date = flightDate;
                }
            }
            else {
                var texttosay = "BUG IN CODE";
                createChatMessage(texttosay, window.YOU)
                reply(texttosay);
                bottom();
            }
        }

        var processYesNo = function(callback) {
            window.finalText = $("#resultsText").val();
            console.log(window.listOfQuestions)
            postYesNo(window.finalText, function() {
                console.log("Final YESNO: " + window.YESNO);
                if (window.YESNO == "yes") {
                    processConstraint(window.listOfQuestions.shift());
                } else if (window.YESNO == "no") {
                    window.listOfQuestions.shift();
                } else {
                    var texttosay = "Sorry, we did not understand your response.";
                    createChatMessage(texttosay, window.YOU)
                    reply(texttosay);
                    bottom();
                }
                callback();
            });
        }

        var processOneQuestion = function() {
            console.log(listOfQuestions);
            var oneQuestion = window.listOfQuestions[0];
            console.log("HERE: " + oneQuestion.issue);
            if (oneQuestion.issue == "location") {
                var texttosay = "Do you want to set your destination to " + oneQuestion.text + "?";
                createChatMessage(texttosay, window.YOU)
                reply(texttosay);
                bottom();
            }
            else if (oneQuestion.issue == "pax") {
                var texttosay = "Do you want to change the number of travellers to " + oneQuestion.text + "?";
                createChatMessage(texttosay, window.YOU)
                reply(texttosay);
                bottom();
            }
            else if (oneQuestion.issue == "price") {
                var texttosay = "Is this flight above your budget?";
                createChatMessage(texttosay, window.YOU)
                reply(texttosay);
                bottom();
            }
            else if (oneQuestion.issue == "start earlier") {
                var texttosay = "Do you need an earlier departure date?";
                createChatMessage(texttosay, window.YOU)
                reply(texttosay);
                bottom();
            }
            else if (oneQuestion.issue == "start later") {
                var texttosay = "Do you need a later departure date?";
                createChatMessage(texttosay, window.YOU)
                reply(texttosay);
                bottom();
            }
            else if (oneQuestion.issue == "colder") {
                var texttosay = "Do you want to go to a colder destination?";
                createChatMessage(texttosay, window.YOU)
                reply(texttosay);
                bottom();
            }
            else if (oneQuestion.issue == "hotter") {
                var texttosay = "Do you want to go to a warmer destination?";
                createChatMessage(texttosay, window.YOU)
                reply(texttosay);
                bottom();
            }
            else if (oneQuestion.issue == "higher class") {
                var texttosay = "Do you want to get a higher class seat?";
                createChatMessage(texttosay, window.YOU)
                reply(texttosay);
                bottom();
            }
            else if (oneQuestion.issue == "lower class") {
                var texttosay = "Do you want to get a lower class seat?";
                createChatMessage(texttosay, window.YOU)
                reply(texttosay);
                bottom();
            }
            else if (oneQuestion.issue == "reldate") {
                var oneText = oneQuestion.text;
                var number_string = oneText.substring(0, oneText.length - 1);
                var date_type = oneText.slice(-1);
                console.log(number_string);
                console.log(date_type);
                if (date_type == 'M') {
                    var today = new Date();
                    var flightDate = new Date(today);
                    flightDate.setMonth(today.getMonth()+parseInt(number_string));
                    flightDate.setDate(1);
                    var flightLastDate = new Date(today);
                    flightLastDate.setMonth(today.getMonth()+parseInt(number_string)+1);
                    flightLastDate.setDate(0);
                    if (oneQuestion.month_string != null) {
                        flightLastDate.setMonth(parseInt(oneQuestion.month_string));
                        flightDate.setMonth(parseInt(oneQuestion.month_string));
                    }
                    var texttosay = "Would you like to travel between " + flightDate.toDateString() + " and " + flightLastDate.toDateString() + "?";
                } else if (date_type == 'D') {
                    var today = new Date();
                    var flightDate = new Date(today);
                    flightDate.setDate(today.getDate()+parseInt(number_string));
                    if (oneQuestion.month_string != null) {
                        flightLastDate.setMonth(parseInt(oneQuestion.month_string));
                        flightDate.setMonth(parseInt(oneQuestion.month_string));
                    }
                    var texttosay = "Would you like to travel on " + flightDate.toDateString() + "?";
                } else if (date_type == 'Y') {
                    var today = new Date();
                    var flightDate = new Date(today);
                    var flightLastDate = new Date(today);
                    flightDate.setDate(today.getYear()+parseInt(number_string));
                    flightLastDate.setDate(today.getYear()+parseInt(number_string));
                    if (oneQuestion.month_string != null) {
                        flightLastDate.setMonth(parseInt(oneQuestion.month_string));
                        flightLastDate.setDate(0);
                        flightDate.setMonth(parseInt(oneQuestion.month_string)-1);
                        flightDate.setDate(1);
                    }
                    var texttosay = "Would you like to travel between " + flightDate.toDateString() + " and " + flightLastDate.toDateString() + "?";
                } else {
                    var texttosay = "Could not interpret datetime object."
                }
                createChatMessage(texttosay, window.YOU)
                reply(texttosay);
                bottom();
            }
            else {
                var texttosay = "BUG IN CODE";
                createChatMessage(texttosay, window.YOU)
                reply(texttosay);
                bottom();
            }
        }

        var sayInZeroState = function() {
            if (window.listOfQuestions.length == 0) {
                var texttosay = "Hello Barney";
                createChatMessage(texttosay,window.YOU);
                reply(texttosay);
                bottom();
            } else {
                window.STATE = 1;
                processOneQuestion();
            }
        }

        var sayInOneState = function() {
            console.log("HERE: " + window.listOfQuestions.length);

            if (window.listOfQuestions.length == 0) {
                window.STATE = 0;
                var texttosay = "Getting new flight based on your preferences.";
                createChatMessage(texttosay,window.YOU);
                reply(texttosay);
                bottom();
                // GET FLIGHT
                if (window.constraints.location !== null) {
                    getCountryBasedOnLocation(function(listOfCountryCodes) {
                        console.log(listOfCountryCodes);
                        var travel_date = randomDate(window.constraints.earliest_date, window.constraints.latest_date);
                        console.log(travel_date);
                    });
                }
            } else {
                processOneQuestion();
            }
        }

        function randomDate(start, end) {
            var d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
            var month = '' + (d.getMonth() + 1);
            var day = '' + d.getDate();
            var year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        }

        // INITIALIZE FINALTEXT TO SEND
        window.finalText = "Hi Line Traveller";

            // FUNCTION FOR SUBMIT BUTTON
            $("#submit").click (function() {
                console.log("Window State: " + window.STATE);
                window.finalText = $("#resultsText").val();
                if (window.finalText == "") {
                    window.finalText = "Hi Line Traveller";
                }
                console.log("Input message: " + window.finalText)
                createChatMessage(window.finalText,"Barney"); 
                if (window.STATE == 0) {
                    extractRelationship(window.finalText, function() {
                        askQuestion(window.finalText, function() {
                            dateProcessing(window.finalText, function() {
                                console.log(window.listOfQuestions);
                                sayInZeroState();
                            })
                        });
                    });
                    
                } else {
                    // PROCESS ALL LIST OF QUESTIONS
                    processYesNo(function() {
                        sayInOneState();
                    });
                }
            })

            // FOR TEXT-TO-SPEECH
            var audio = $('.audio').get(0);
            var voice = 'en-US_AllisonVoice';
            var messageTimeSent = $(".timesent");
            var chats = $(".chats");

            $('.audio').on('error', function (err) {
                $.get('/api/synthesize?text=test').always(function (response) {
                    showError(response.responseText || 'Error processing the request');
                });
            });

            $('.audio').on('loadeddata', function () {
                $('.result').show();
                $('.error-row').css('visibility','hidden');
            });

            var synthesizeRequest = function(options, audio) {
                var sessionPermissions = 0;
                var downloadURL = '/api/synthesize' +
                    '?voice=' + options.voice +
                    '&text=' + encodeURIComponent(options.text) +
                    '&X-WDC-PL-OPT-OUT=' +  sessionPermissions;
                if (options.download) {
                    downloadURL += '&download=true';
                    window.location.href = downloadURL;
                    return true;
                }
                audio.pause();
                try {
                    audio.currentTime = 0;
                } catch(ex) {
                    // ignore. Firefox just freaks out here for no apparent reason.
                }
                audio.src = downloadURL;
                audio.play();
                return true;
            };

            var validText = function(voice, text) {
                $('.error-row').css('visibility','hidden');
                $('.errorMsg').text('');
                $('.latin').hide();

                if ($.trim(text).length === 0) { // empty text
                    showError('Please enter the text you would like to synthesize in the text window.');
                    return false;
                }
                return true;
            }

            var reply = function(text) {
                console.log(text);
                if (validText(voice, text)) {
                    var utteranceOptions = {
                        text: text,
                        voice: voice,
                        sessionPermissions: 0
                    };
                    synthesizeRequest(utteranceOptions, audio);
                }
                return false;
            };

            // FOR CHAT MESSAGE CREATION
            function createChatMessage(msg,user){

                var who = '';

                if(user=='Barney') {
                    who = 'me';
                    var li = $(
                    '<li class=' + who + '>'+
                        '<div class="image">' +
                            '<img src=https://pbs.twimg.com/profile_images/2791763282/c69b80386cbd22cc9dc838587ed51d2d.jpeg />' +
                            '<b></b>' +
                            '<i class="timesent" data-time=2015-10-10 10:10:10></i> ' +
                        '</div>' +
                        '<p></p>' +
                    '</li>');
                }
                else {
                    who = 'you';
                    var li = $(
                    '<li class=' + who + '>'+
                        '<div class="image">' +
                            '<img src=http://www.clipartbest.com/cliparts/4ib/Kz7/4ibKz78KT.gif />' +
                            '<b></b>' +
                            '<i class="timesent" data-time=2015-10-10 10:10:10></i> ' +
                        '</div>' +
                        '<p></p>' +
                    '</li>');
                }

                

                // use the 'text' method to escape malicious user input
                li.find('p').text(msg);
                li.find('b').text(user);

                chats.append(li);
            };

            var tokenGenerator = utils.createTokenGenerator();
            tokenGenerator.getToken(function(err, token) {
                window.onbeforeunload = function() {
                    localStorage.clear()
                }, token || (console.error("No authorization token available"), console.error("Attempting to reconnect..."), showError(err && err.code ? "Server error " + err.code + ": " + err.error : "Server error " + err.code + ": please refresh your browser and try again"));
                var viewContext = {
                    currentModel: "en-US_BroadbandModel",
                    models: models,
                    token: token,
                    bufferSize: BUFFERSIZE
                };
                initViews(viewContext), localStorage.setItem("models", JSON.stringify(models)), localStorage.setItem("currentModel", "en-US_BroadbandModel"), localStorage.setItem("sessionPermissions", "true"), getModels(token), $.subscribe("clearscreen", function() {
                    $("#resultsText").text(""), $("#resultsJSON").text(""), $(".error-row").hide(), $(".notification-row").hide(), $(".hypotheses > ul").empty(), $("#metadataTableBody").empty()
                })
            })
        })
    }, {
        "./data/models.json": 2,
        "./models": 6,
        "./utils": 8,
        "./views": 14,
        "./views/showerror": 19
    }],
    6: [function(require, module, exports) {
        "use strict";
        var selectModel = require("./views/selectmodel").initSelectModel;
        exports.getModels = function(token) {
            var viewContext = {
                    currentModel: "en-US_BroadbandModel",
                    models: null,
                    token: token,
                    bufferSize: BUFFERSIZE
                },
                modelUrl = "https://stream.watsonplatform.net/speech-to-text/api/v1/models",
                sttRequest = new XMLHttpRequest;
            sttRequest.open("GET", modelUrl, !0), sttRequest.withCredentials = !0, sttRequest.setRequestHeader("Accept", "application/json"), sttRequest.setRequestHeader("X-Watson-Authorization-Token", token), sttRequest.onload = function() {
                var response = JSON.parse(sttRequest.responseText),
                    sorted = response.models.sort(function(a, b) {
                        return a.name > b.name ? 1 : a.name < b.name ? -1 : 0
                    });
                response.models = sorted, localStorage.setItem("models", JSON.stringify(response.models)), viewContext.models = response.models, selectModel(viewContext)
            }, sttRequest.onerror = function() {
                viewContext.models = require("./data/models.json").models, selectModel(viewContext)
            }, sttRequest.send()
        }
    }, {
        "./data/models.json": 2,
        "./views/selectmodel": 17
    }],
    7: [function(require, module, exports) {
        "use strict";
        var utils = require("./utils"),
            showerror = require("./views/showerror"),
            showError = showerror.showError,
            tokenGenerator = utils.createTokenGenerator(),
            initSocket = exports.initSocket = function(options, onopen, onlistening, onmessage, onerror, onclose) {
                function withDefault(val, defaultVal) {
                    return "undefined" == typeof val ? defaultVal : val
                }
                var listening, socket, token = options.token,
                    model = options.model || localStorage.getItem("currentModel"),
                    message = options.message || {
                        action: "start"
                    },
                    sessionPermissions = withDefault(options.sessionPermissions, JSON.parse(localStorage.getItem("sessionPermissions"))),
                    sessionPermissionsQueryParam = sessionPermissions ? "0" : "1",
                    url = options.serviceURI || "wss://stream.watsonplatform.net/speech-to-text/api/v1/recognize?watson-token=";
                url += token + "&X-WDC-PL-OPT-OUT=" + sessionPermissionsQueryParam + "&model=" + model, console.log("URL model", model);
                try {
                    socket = new WebSocket(url)
                } catch (err) {
                    console.error("WS connection error: ", err)
                }
                socket.onopen = function() {
                    listening = !1, $.subscribe("hardsocketstop", function() {
                        console.log("MICROPHONE: close."), socket.send(JSON.stringify({
                            action: "stop"
                        })), socket.close()
                    }), $.subscribe("socketstop", function() {
                        console.log("MICROPHONE: close."), socket.close()
                    }), socket.send(JSON.stringify(message)), onopen(socket)
                }, socket.onmessage = function(evt) {
                    var msg = JSON.parse(evt.data);
                    return msg.error ? (showError(msg.error), void $.publish("hardsocketstop")) : ("listening" === msg.state && (listening ? (console.log("MICROPHONE: Closing socket."), socket.close()) : (onlistening(socket), listening = !0)), void onmessage(msg, socket))
                }, socket.onerror = function(evt) {
                    console.log("WS onerror: ", evt), showError("Application error " + evt.code + ": please refresh your browser and try again"), $.publish("clearscreen"), onerror(evt)
                }, socket.onclose = function(evt) {
                    if (console.log("WS onclose: ", evt), 1006 === evt.code) {
                        if (console.log("generator count", tokenGenerator.getCount()), tokenGenerator.getCount() > 1) throw $.publish("hardsocketstop"), new Error("No authorization token is currently available");
                        return tokenGenerator.getToken(function(err, token) {
                            return err ? ($.publish("hardsocketstop"), !1) : (console.log("Fetching additional token..."), options.token = token, void initSocket(options, onopen, onlistening, onmessage, onerror, onclose))
                        }), !1
                    }
                    return 1011 === evt.code ? (console.error("Server error " + evt.code + ": please refresh your browser and try again"), !1) : evt.code > 1e3 ? (console.error("Server error " + evt.code + ": please refresh your browser and try again"), !1) : ($.unsubscribe("hardsocketstop"), $.unsubscribe("socketstop"), void onclose(evt))
                }
            }
    }, {
        "./utils": 8,
        "./views/showerror": 19
    }],
    8: [function(require, module, exports) {
        (function(global) {
            "use strict";
            var $ = "undefined" != typeof window ? window.jQuery : "undefined" != typeof global ? global.jQuery : null,
                fileBlock = function(_offset, length, _file, readChunk) {
                    var r = new FileReader,
                        blob = _file.slice(_offset, length + _offset);
                    r.onload = readChunk, r.readAsArrayBuffer(blob)
                };
            exports.onFileProgress = function(options, ondata, running, onerror, onend, samplingRate) {
                var file = options.file,
                    fileSize = file.size,
                    chunkSize = options.bufferSize || 16e3,
                    offset = 0,
                    readChunk = function(evt) {
                        if (offset >= fileSize) return console.log("Done reading file"), void onend();
                        if (running()) {
                            if (null != evt.target.error) {
                                var errorMessage = evt.target.error;
                                return console.log("Read error: " + errorMessage), void onerror(errorMessage)
                            }
                            var buffer = evt.target.result,
                                len = buffer.byteLength;
                            offset += len, ondata(buffer), samplingRate ? setTimeout(function() {
                                fileBlock(offset, chunkSize, file, readChunk)
                            }, 1e3 * chunkSize / (2 * samplingRate)) : fileBlock(offset, chunkSize, file, readChunk)
                        }
                    };
                fileBlock(offset, chunkSize, file, readChunk)
            }, exports.createTokenGenerator = function() {
                var hasBeenRunTimes = 0;
                return {
                    getToken: function(callback) {
                        if (++hasBeenRunTimes, hasBeenRunTimes > 5) {
                            var err = new Error("Cannot reach server");
                            return void callback(null, err)
                        }
                        var url = "/api/token",
                            tokenRequest = new XMLHttpRequest;
                        tokenRequest.open("POST", url, !0), tokenRequest.setRequestHeader("csrf-token", $('meta[name="ct"]').attr("content")), tokenRequest.onreadystatechange = function() {
                            if (4 === tokenRequest.readyState)
                                if (200 === tokenRequest.status) {
                                    var token = tokenRequest.responseText;
                                    callback(null, token)
                                } else {
                                    var error = "Cannot reach server";
                                    if (tokenRequest.responseText) try {
                                        error = JSON.parse(tokenRequest.responseText)
                                    } catch (e) {
                                        error = tokenRequest.responseText
                                    }
                                    callback(error)
                                }
                        }, tokenRequest.send()
                    },
                    getCount: function() {
                        return hasBeenRunTimes
                    }
                }
            }, exports.initPubSub = function() {
                var o = $({});
                $.subscribe = o.on.bind(o), $.unsubscribe = o.off.bind(o), $.publish = o.trigger.bind(o)
            }
        }).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }, {}],
    9: [function(require, module, exports) {
        "use strict";
        exports.initAnimatePanel = function() {
            $(".panel-heading span.clickable").on("click", function() {
                $(this).hasClass("panel-collapsed") ? ($(this).parents(".panel").find(".panel-body").slideDown(), $(this).removeClass("panel-collapsed"), $(this).find("i").removeClass("caret-down").addClass("caret-up")) : ($(this).parents(".panel").find(".panel-body").slideUp(), $(this).addClass("panel-collapsed"), $(this).find("i").removeClass("caret-up").addClass("caret-down"))
            })
        }
    }, {}],
    10: [function(require, module, exports) {
        "use strict";

        function updateTextScroll() {
            if (!scrolled) {
                var element = $("#resultsText").get(0);
                element.scrollTop = element.scrollHeight
            }
        }

        function updateScroll() {
            if (!scrolled) {
                var element = $(".table-scroll").get(0);
                element.scrollTop = element.scrollHeight
            }
        }
        var scrolled = !1,
            textScrolled = !1,
            showTimestamp = function(timestamps, confidences) {
                var word = timestamps[0],
                    t0 = timestamps[1],
                    t1 = timestamps[2],
                    displayConfidence = confidences ? confidences[1].toString().substring(0, 3) : "n/a";
                $("#metadataTable > tbody:last-child").append("<tr><td>" + word + "</td><td>" + t0 + "</td><td>" + t1 + "</td><td>" + displayConfidence + "</td></tr>")
            },
            showMetaData = function(alternative) {
                var confidenceNestedArray = alternative.word_confidence,
                    timestampNestedArray = alternative.timestamps;
                if (confidenceNestedArray && confidenceNestedArray.length > 0)
                    for (var i = 0; i < confidenceNestedArray.length; i++) {
                        var timestamps = timestampNestedArray[i],
                            confidences = confidenceNestedArray[i];
                        showTimestamp(timestamps, confidences)
                    } else timestampNestedArray && timestampNestedArray.length > 0 && timestampNestedArray.forEach(function(timestamp) {
                        showTimestamp(timestamp)
                    })
            },
            Alternatives = function() {
                var stringOne = "",
                    stringTwo = "",
                    stringThree = "";
                this.clearString = function() {
                    stringOne = "", stringTwo = "", stringThree = ""
                }, this.showAlternatives = function(alternatives) {
                    var $hypotheses = $(".hypotheses ol");
                    $hypotheses.empty(), alternatives.forEach(function(alternative, idx) {
                        var $alternative;
                        if (alternative.transcript) {
                            var transcript = alternative.transcript.replace(/%HESITATION\s/g, "");
                            switch (transcript = transcript.replace(/(.)\1{2,}/g, ""), idx) {
                                case 0:
                                    stringOne += transcript, $alternative = $("<li data-hypothesis-index=" + idx + " >" + stringOne + "</li>");
                                    break;
                                case 1:
                                    stringTwo += transcript, $alternative = $("<li data-hypothesis-index=" + idx + " >" + stringTwo + "</li>");
                                    break;
                                case 2:
                                    stringThree += transcript, $alternative = $("<li data-hypothesis-index=" + idx + " >" + stringThree + "</li>")
                            }
                            $hypotheses.append($alternative)
                        }
                    })
                }
            },
            alternativePrototype = new Alternatives;
        exports.showJSON = function(msg, baseJSON) {
            var json = JSON.stringify(msg, null, 2);
            return baseJSON += json, baseJSON += "\n", "JSON" === $(".nav-tabs .active").text() && ($("#resultsJSON").append(baseJSON), baseJSON = "", console.log("updating json")), baseJSON
        };
        // var finalText
        // exports.finalText = finalText;
        var initTextScroll = function() {
                $("#resultsText").on("scroll", function() {
                    textScrolled = !0
                })
            },
            initScroll = function() {
                $(".table-scroll").on("scroll", function() {
                    scrolled = !0
                })
            };
        exports.initDisplayMetadata = function() {
            initScroll(), initTextScroll()
        }, exports.showResult = function(msg, baseString) {
            if (msg.results && msg.results.length > 0) {
                var alternatives = msg.results[0].alternatives,
                    text = msg.results[0].alternatives[0].transcript || "";
                window.finalText = text;
                console.log(text);
                if (text = text.replace(/%HESITATION\s/g, ""), text = text.replace(/(.)\1{2,}/g, ""), msg.results[0]["final"] && console.log("-> " + text), text = text.replace(/D_[^\s]+/g, ""), 0 === text.length || /^\s+$/.test(text)) return baseString;
                console.log(msg.results[0]["final"]);
                msg.results && msg.results[0] && msg.results[0]["final"] ? (text = text.slice(0, -1), text = text.charAt(0).toUpperCase() + text.substring(1), text = text.trim() + ". ", baseString += text, $("#resultsText").val(baseString), showMetaData(alternatives[0]), alternativePrototype.showAlternatives(alternatives)) : (text = text.charAt(0).toUpperCase() + text.substring(1), $("#resultsText").val(baseString + text))
            }
            // console.log(baseString)
            return updateScroll(), updateTextScroll(), baseString
        }, $.subscribe("clearscreen", function() {
            var $hypotheses = $(".hypotheses ul");
            scrolled = !1, $hypotheses.empty(), alternativePrototype.clearString()
        })
    }, {}],
    11: [function(require, module, exports) {
        "use strict";
        var handleSelectedFile = require("./fileupload").handleSelectedFile;
        exports.initDragDrop = function(ctx) {
            function handleFileUploadEvent(evt) {
                var file = evt.dataTransfer.files[0];
                handleSelectedFile(ctx.token, file)
            }
            var dragAndDropTarget = $(document);
            dragAndDropTarget.on("dragenter", function(e) {
                e.stopPropagation(), e.preventDefault()
            }), dragAndDropTarget.on("dragover", function(e) {
                e.stopPropagation(), e.preventDefault()
            }), dragAndDropTarget.on("drop", function(e) {
                console.log("File dropped"), e.preventDefault();
                var evt = e.originalEvent;
                handleFileUploadEvent(evt)
            })
        }
    }, {
        "./fileupload": 13
    }],
    12: [function(require, module, exports) {
        "use strict";
        exports.flashSVG = function(el) {
            function loop() {
                el.animate({
                    fill: "#A53725"
                }, 1e3, "linear").animate({
                    fill: "white"
                }, 1e3, "linear")
            }
            el.css({
                fill: "#A53725"
            });
            var timer = setTimeout(loop, 2e3);
            return timer
        }, exports.stopFlashSVG = function(timer) {
            el.css({
                fill: "white"
            }), clearInterval(timer)
        }, exports.toggleImage = function(el, name) {
            el.attr("src") === "images/" + name + ".svg" ? el.attr("src", "images/stop-red.svg") : el.attr("src", "images/stop.svg")
        };
        var restoreImage = exports.restoreImage = function(el, name) {
            el.attr("src", "images/" + name + ".svg")
        };
        exports.stopToggleImage = function(timer, el, name) {
            clearInterval(timer), restoreImage(el, name)
        }
    }, {}],
    13: [function(require, module, exports) {
        "use strict";
        var showError = require("./showerror").showError,
            showNotice = require("./showerror").showNotice,
            handleFileUpload = require("../handlefileupload").handleFileUpload,
            effects = require("./effects"),
            utils = require("../utils"),
            handleSelectedFile = exports.handleSelectedFile = function() {
                var running = !1;
                return localStorage.setItem("currentlyDisplaying", "false"),
                    function(token, file) {
                        function restoreUploadTab() {
                            clearInterval(timer), effects.restoreImage(uploadImageTag, "upload"), uploadText.text("Select File")
                        }
                        $.publish("clearscreen"), localStorage.setItem("currentlyDisplaying", "fileupload"), running = !0;
                        var uploadImageTag = $("#fileUploadTarget > img"),
                            timer = setInterval(effects.toggleImage, 750, uploadImageTag, "stop"),
                            uploadText = $("#fileUploadTarget > span");
                        uploadText.text("Stop Transcribing"), $.subscribe("hardsocketstop", function() {
                            restoreUploadTab(), running = !1
                        });
                        var currentModel = localStorage.getItem("currentModel");
                        console.log("currentModel", currentModel);
                        var blobToText = new Blob([file]).slice(0, 4),
                            r = new FileReader;
                        r.readAsText(blobToText), r.onload = function() {
                            var contentType;
                            if ("fLaC" === r.result) contentType = "audio/flac", showNotice("Notice: browsers do not support playing FLAC audio, so no audio will accompany the transcription");
                            else if ("RIFF" === r.result) {
                                contentType = "audio/wav";
                                var audio = new Audio,
                                    wavBlob = new Blob([file], {
                                        type: "audio/wav"
                                    }),
                                    wavURL = URL.createObjectURL(wavBlob);
                                audio.src = wavURL, audio.play(), $.subscribe("hardsocketstop", function() {
                                    audio.pause(), audio.currentTime = 0
                                })
                            } else {
                                if ("OggS" !== r.result) return restoreUploadTab(), showError("Only WAV or FLAC or Opus files can be transcribed, please try another file format"), void localStorage.setItem("currentlyDisplaying", "false");
                                contentType = "audio/ogg; codecs=opus";
                                var audio = new Audio,
                                    opusBlob = new Blob([file], {
                                        type: "audio/ogg; codecs=opus"
                                    }),
                                    opusURL = URL.createObjectURL(opusBlob);
                                audio.src = opusURL, audio.play(), $.subscribe("hardsocketstop", function() {
                                    audio.pause(), audio.currentTime = 0
                                })
                            }
                            handleFileUpload("fileupload", token, currentModel, file, contentType, function(socket) {
                                var blob = new Blob([file]),
                                    parseOptions = {
                                        file: blob
                                    };
                                utils.onFileProgress(parseOptions, function(chunk) {
                                    socket.send(chunk)
                                }, function() {
                                    return running ? !0 : !1
                                }, function(evt) {
                                    console.log("Error reading file: ", evt.message), showError("Error: " + evt.message)
                                }, function() {
                                    socket.send(JSON.stringify({
                                        action: "stop"
                                    }))
                                })
                            }, function() {
                                effects.stopToggleImage(timer, uploadImageTag, "upload"), uploadText.text("Select File"), localStorage.setItem("currentlyDisplaying", "false")
                            })
                        }
                    }
            }();
        exports.initFileUpload = function(ctx) {
            var fileUploadDialog = $("#fileUploadDialog");
            fileUploadDialog.change(function() {
                var file = fileUploadDialog.get(0).files[0];
                handleSelectedFile(ctx.token, file)
            }), $("#fileUploadTarget").click(function() {
                var currentlyDisplaying = localStorage.getItem("currentlyDisplaying");
                return "fileupload" == currentlyDisplaying ? (console.log("HARD SOCKET STOP"), $.publish("hardsocketstop"), void localStorage.setItem("currentlyDisplaying", "false")) : "sample" == currentlyDisplaying ? void showError("Currently another file is playing, please stop the file or wait until it finishes") : "record" == currentlyDisplaying ? void showError("Currently audio is being recorded, please stop recording before playing a sample") : (fileUploadDialog.val(null), void fileUploadDialog.trigger("click"))
            })
        }
    }, {
        "../handlefileupload": 3,
        "../utils": 8,
        "./effects": 12,
        "./showerror": 19
    }],
    14: [function(require, module, exports) {
        "use strict";
        var initSessionPermissions = require("./sessionpermissions").initSessionPermissions,
            initAnimatePanel = require("./animatepanel").initAnimatePanel,
            initShowTab = require("./showtab").initShowTab,
            initDragDrop = require("./dragdrop").initDragDrop,
            initPlaySample = require("./playsample").initPlaySample,
            initRecordButton = require("./recordbutton").initRecordButton,
            initFileUpload = require("./fileupload").initFileUpload,
            initDisplayMetadata = require("./displaymetadata").initDisplayMetadata;
        exports.initViews = function(ctx) {
            console.log("Initializing views..."), initPlaySample(ctx), initDragDrop(ctx), initRecordButton(ctx), initFileUpload(ctx), initSessionPermissions(), initShowTab(), initAnimatePanel(), initShowTab(), initDisplayMetadata()
        }
    }, {
        "./animatepanel": 9,
        "./displaymetadata": 10,
        "./dragdrop": 11,
        "./fileupload": 13,
        "./playsample": 15,
        "./recordbutton": 16,
        "./sessionpermissions": 18,
        "./showtab": 20
    }],
    15: [function(require, module, exports) {
        "use strict";
        var utils = require("../utils"),
            onFileProgress = utils.onFileProgress,
            handleFileUpload = require("../handlefileupload").handleFileUpload,
            showError = require("./showerror").showError,
            effects = require("./effects"),
            LOOKUP_TABLE = {
                "en-US_BroadbandModel": ["Us_English_Broadband_Sample_1.wav", "Us_English_Broadband_Sample_2.wav"],
                "en-US_NarrowbandModel": ["Us_English_Narrowband_Sample_1.wav", "Us_English_Narrowband_Sample_2.wav"],
                "es-ES_BroadbandModel": ["Es_ES_spk24_16khz.wav", "Es_ES_spk19_16khz.wav"],
                "es-ES_NarrowbandModel": ["Es_ES_spk24_8khz.wav", "Es_ES_spk19_8khz.wav"],
                "pt-BR_BroadbandModel": ["pt-BR_Sample1-16KHz.wav", "pt-BR_Sample2-16KHz.wav"],
                "pt-BR_NarrowbandModel": ["pt-BR_Sample1-8KHz.wav", "pt-BR_Sample2-8KHz.wav"],
                "zh-CN_BroadbandModel": ["zh-CN_sample1_for_16k.wav", "zh-CN_sample2_for_16k.wav"],
                "zh-CN_NarrowbandModel": ["zh-CN_sample1_for_8k.wav", "zh-CN_sample2_for_8k.wav"]
            },
            playSample = function() {
                var running = !1;
                return localStorage.setItem("currentlyDisplaying", "false"), localStorage.setItem("samplePlaying", "false"),
                    function(token, imageTag, sampleNumber, iconName, url) {
                        $.publish("clearscreen");
                        var currentlyDisplaying = localStorage.getItem("currentlyDisplaying"),
                            samplePlaying = localStorage.getItem("samplePlaying");
                        if (samplePlaying === sampleNumber) return console.log("HARD SOCKET STOP"), $.publish("socketstop"), localStorage.setItem("currentlyDisplaying", "false"), localStorage.setItem("samplePlaying", "false"), effects.stopToggleImage(timer, imageTag, iconName), effects.restoreImage(imageTag, iconName), void(running = !1);
                        if ("record" === currentlyDisplaying) return void showError("Currently audio is being recorded, please stop recording before playing a sample");
                        if ("fileupload" === currentlyDisplaying || "false" !== samplePlaying) return void showError("Currently another file is playing, please stop the file or wait until it finishes");
                        localStorage.setItem("currentlyDisplaying", "sample"), localStorage.setItem("samplePlaying", sampleNumber), running = !0, $("#resultsText").val("");
                        var timer = setInterval(effects.toggleImage, 750, imageTag, iconName),
                            xhr = new XMLHttpRequest;
                        xhr.open("GET", url, !0), xhr.responseType = "blob", xhr.onload = function() {
                            var blob = xhr.response,
                                currentModel = localStorage.getItem("currentModel") || "en-US_BroadbandModel",
                                reader = new FileReader,
                                blobToText = new Blob([blob]).slice(0, 4);
                            reader.readAsText(blobToText), reader.onload = function() {
                                var contentType = "fLaC" === reader.result ? "audio/flac" : "audio/wav";
                                console.log("Uploading file", reader.result);
                                var mediaSourceURL = URL.createObjectURL(blob),
                                    audio = new Audio;
                                audio.src = mediaSourceURL, audio.play(), $.subscribe("hardsocketstop", function() {
                                    audio.pause(), audio.currentTime = 0
                                }), $.subscribe("socketstop", function() {
                                    audio.pause(), audio.currentTime = 0
                                }), handleFileUpload("sample", token, currentModel, blob, contentType, function(socket) {
                                    var parseOptions = {
                                            file: blob
                                        },
                                        samplingRate = -1 !== currentModel.indexOf("Broadband") ? 16e3 : 8e3;
                                    onFileProgress(parseOptions, function(chunk) {
                                        socket.send(chunk)
                                    }, function() {
                                        return running ? !0 : !1
                                    }, function(evt) {
                                        console.log("Error reading file: ", evt.message)
                                    }, function() {
                                        socket.send(JSON.stringify({
                                            action: "stop"
                                        }))
                                    }, samplingRate)
                                }, function() {
                                    effects.stopToggleImage(timer, imageTag, iconName), effects.restoreImage(imageTag, iconName), localStorage.getItem("currentlyDisplaying", "false"), localStorage.setItem("samplePlaying", "false")
                                })
                            }
                        }, xhr.send()
                    }
            }();
        exports.initPlaySample = function(ctx) {
            ! function() {
                var fileName = "audio/" + LOOKUP_TABLE[ctx.currentModel][0],
                    el = $(".play-sample-1");
                el.off("click");
                var iconName = "play",
                    imageTag = el.find("img");
                el.click(function() {
                    playSample(ctx.token, imageTag, "sample-1", iconName, fileName, function(result) {
                        console.log("Play sample result", result)
                    })
                })
            }(ctx, LOOKUP_TABLE),
            function() {
                var fileName = "audio/" + LOOKUP_TABLE[ctx.currentModel][1],
                    el = $(".play-sample-2");
                el.off("click");
                var iconName = "play",
                    imageTag = el.find("img");
                el.click(function() {
                    playSample(ctx.token, imageTag, "sample-2", iconName, fileName, function(result) {
                        console.log("Play sample result", result)
                    })
                })
            }(ctx, LOOKUP_TABLE)
        }
    }, {
        "../handlefileupload": 3,
        "../utils": 8,
        "./effects": 12,
        "./showerror": 19
    }],
    16: [function(require, module, exports) {
        "use strict";
        
        var Microphone = require("../Microphone"),
            handleMicrophone = require("../handlemicrophone").handleMicrophone,
            showError = require("./showerror").showError;

        exports.initRecordButton = function(ctx) {
            var recordButton = $("#recordButton");
            recordButton.click(function() {
                var running = !1,
                    token = ctx.token,
                    micOptions = {
                        bufferSize: ctx.buffersize
                    },
                    mic = new Microphone(micOptions);
                return function(evt) {
                    evt.preventDefault();
                    var currentModel = localStorage.getItem("currentModel"),
                        currentlyDisplaying = localStorage.getItem("currentlyDisplaying");
                    return "sample" == currentlyDisplaying || "fileupload" == currentlyDisplaying ? void showError("Currently another file is playing, please stop the file or wait until it finishes") : (localStorage.setItem("currentlyDisplaying", "record"), 
                        void(running ? (console.log("Stopping microphonez, sending stop action message"), recordButton.removeAttr("style"), recordButton.find("img").attr("src", "images/microphone.svg"), $.publish("hardsocketstop"), mic.stop(), running = !1, localStorage.setItem("currentlyDisplaying", "false")) : ($("#resultsText").val(""), console.log("Not running, handleMicrophone()"), handleMicrophone(token, currentModel, mic, function(err) {
                        if (err) {
                            var msg = "Error: " + err.message;
                            console.log(msg), showError(msg), running = !1, localStorage.setItem("currentlyDisplaying", "false")
                        } else recordButton.css("background-color", "#d74108"), recordButton.find("img").attr("src", "images/stop.svg"), console.log("starting mic"), mic.record(), running = !0
                    }))))
                }
            }())
        }
    }, {
        "../Microphone": 1,
        "../handlemicrophone": 4,
        "./showerror": 19,
        "./displaymetadata": 10,
    }],
    17: [function(require, module, exports) {
        "use strict";
        var initPlaySample = require("./playsample").initPlaySample;
        exports.initSelectModel = function(ctx) {
            ctx.models.forEach(function(model) {
                model.name.indexOf("JP") > -1 || $("#dropdownMenuList").append($("<li>").attr("role", "presentation").append($("<a>").attr("role", "menu-item").attr("href", "/").attr("data-model", model.name).append(model.description.substring(0, model.description.length - 1), 8e3 == model.rate ? " (8KHz)" : " (16KHz)")))
            }), $("#dropdownMenuList").click(function(evt) {
                evt.preventDefault(), evt.stopPropagation(), console.log("Change view", $(evt.target).text());
                var newModelDescription = $(evt.target).text(),
                    newModel = $(evt.target).data("model");
                $("#dropdownMenuDefault").empty().text(newModelDescription), $("#dropdownMenu1").dropdown("toggle"), localStorage.setItem("currentModel", newModel), ctx.currentModel = newModel, initPlaySample(ctx), $.publish("clearscreen")
            })
        }
    }, {
        "./playsample": 15
    }],
    18: [function(require, module, exports) {
        "use strict";
        exports.initSessionPermissions = function() {
            console.log("Initializing session permissions handler");
            var sessionPermissionsRadio = $("#sessionPermissionsRadioGroup input[type='radio']");

            sessionPermissionsRadio.click(function() {
                var checkedValue = sessionPermissionsRadio.filter(":checked").val();
                console.log("checkedValue", checkedValue), localStorage.setItem("sessionPermissions", checkedValue)
            })
        }
    }, {}],
    19: [function(require, module, exports) {
        "use strict";
        exports.showError = function(msg) {
            console.log("Error: ", msg);
            var errorAlert = $(".error-row");
            errorAlert.hide(), errorAlert.css("background-color", "#d74108"), errorAlert.css("color", "white");
            var errorMessage = $("#errorMessage");
            errorMessage.text(msg), errorAlert.show(), $("#errorClose").click(function(e) {
                return e.preventDefault(), errorAlert.hide(), !1
            })
        }, exports.showNotice = function(msg) {
            console.log("Notice: ", msg);
            var noticeAlert = $(".notification-row");
            noticeAlert.hide(), noticeAlert.css("border", "2px solid #ececec"), noticeAlert.css("background-color", "#f4f4f4"), noticeAlert.css("color", "black");
            var noticeMessage = $("#notificationMessage");
            noticeMessage.text(msg), noticeAlert.show(), $("#notificationClose").click(function(e) {
                return e.preventDefault(), noticeAlert.hide(), !1
            })
        }, exports.hideError = function() {
            var errorAlert = $(".error-row");
            errorAlert.hide()
        }
    }, {}],
    20: [function(require, module, exports) {
        "use strict";
        exports.initShowTab = function() {
            $('.nav-tabs a[data-toggle="tab"]').on("shown.bs.tab", function(e) {
                var target = $(e.target).text();
                "JSON" === target && $.publish("showjson")
            })
        }
    }, {}],
    21: [function(require, module, exports) {
        "use strict";
        $("#submit").click (function() {
            var finalText = $("#resultsText").val();
            console.log("HELLO")
        })
    }, {}],
}, {}, [5]);