var clientid;

function subscribe(callback) {
  console.log("running subscribe");
  $.ajax({
    method: 'GET',
    url: '/longpoll/getnewid',
    success: function(data) {
      addToConversationHistory("messagesid: " + data.id);
      clientid = data.id;
      var longPoll = function() {
        console.log("running longPoll");
        $.ajax({
          method: 'GET',
          url: '/longpoll/addlistener/' + data.id,
          success: function(data) {
            callback(data)
          },
          complete: function() {
            longPoll()
          },
          timeout: 30000
        })
      }
      longPoll()
    },
  })
};

function askQuestion(question) {
  $.ajax({
    method: "POST",
    url: "/longpoll/ask",
    data: {
      id: clientid,
      question: question
    },
    success: function(res) {
      addToConversationHistory("<i>Ask response: </i> " + res.success);
    }
  });
}

function addToConversationHistory(message) {
  var div = document.getElementById("conversation");
  if (div.innerHTML !== "") {
    div.innerHTML += "<br>";
  }
  div.innerHTML += message;
  div.scrollTop = div.scrollHeight;
}

$(document).ready(function() {

  $("#statement").on('keyup', function(e) {
    if (e.keyCode == 13) {
      $("#ask").trigger("click");
    }
  });

  $("#ask").click(function(e) {
    var div = document.getElementById("conversation");
    if (div.innerHTML !== "") {
      div.innerHTML += "<br>";
    }
    var question = document.getElementById("statement").value;
    div.innerHTML += "<i>message sent:</i> <span style=color:blue;>" + question + "</span>";
    div.scrollTop = div.scrollHeight;
    document.getElementById("statement").value = "";
    askQuestion(question);
  });

  subscribe(function(data) {
    addToConversationHistory("<i>Recieved back: </i> " + data);
  });

});
