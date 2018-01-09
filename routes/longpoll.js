var express = require('express');
var router = express.Router();

var EventEmitter = require('events').EventEmitter;
var messageBus = new EventEmitter();
messageBus.setMaxListeners(100);

// get an instance of router
var router = express.Router();

function createUUID() {
  var s = [];
  var hexDigits = "0123456789abcdef";
  for (var i = 0; i < 36; i++) {
   s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  var uuid = s.join("");
  return uuid;
}

function addMessageListener(res, id) {
  console.log("addMessageListener");
  messageBus.once(id, function(data){
      console.log("messageBus.once");
      res.json(data)
  })
}

function doSomethingRandom(id, question, interval) {
  console.log(id + " doSomethingRandom for " + (interval/1000) + " seconds, for message " + question);
  setTimeout(function() {

    console.log(messageBus.eventNames());
    var checking = true;
    var checkTime = 1000;
    var timeOut = 30000; // 30 seconds
    function checkEmitter() {
      if(messageBus.eventNames().includes(id)) {
        console.log("have found emmiter " + id);
        messageBus.emit(id, "response after " + (interval/1000) + " seconds is <span style=color:blue;>" + question + "</span>");
      } else {
        if (timeOut > 0) {
          setTimeout(checkEmitter, checkTime); /* this checks the emitters every 1000 milliseconds*/
        } else {
          console.log("Failed to find emitter after serveral tries");
        }
        timeOut = timeOut - checkTime;
      }
    };
    if (checking) {
      checking = false;
      checkEmitter();
    }

  }, interval);
}

router.get('/addlistener/:id', function(req, res) {
    console.log("Adding listener for: " + JSON.stringify(req.params));
    console.log("Adding listener for: " + req.params.id);
    addMessageListener(res, req.params.id);
});

router.get('/getnewid', function(req, res) {
    console.log("getting messageid");
    var data = {id: createUUID()};
    console.log("returning message is data " + JSON.stringify(data));
    res.json(data);
});

router.post('/ask', function(req, res) {
  var id = req.body.id;
  var question = req.body.question;
  console.log("Recieved question: " + question);

  var interval = Math.floor((Math.random()*10)+1) * 1000;
  doSomethingRandom(id, question, interval);

  var response = {
    success: 'message <span style=color:blue;>' + question + '</span> recieved will respond in ' + (interval/1000) + ' seconds'
  }
  res.json(response);
});

router.get('/conversation', function(req, res) {
  res.render('conversation', { title: 'Longpoll' });
});

module.exports = router;
