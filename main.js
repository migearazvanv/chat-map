// Initialize the map and assign it to a variable for later use
// var map = L.map('map', {
//   // Set latitude and longitude of the map center (required)
//   center: [46.7712, 23.6236],
//   // Set the initial zoom level, values 0-18, where 0 is most zoomed-out (required)
//   zoom: 5
// });
var map = L.map('map', {
  center: [46.7712, 23.6236],
  zoom: 4,
});

var tiles = new L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
}).addTo(map);
var stack = [];

function onMapClick(e) {
  var pin = L.marker(e.latlng).addTo(map);
  pin.bindPopup(showChat(pin)).openPopup();

}

function showChat(pin) {
  return 'Chat ' + pin._leaflet_id;
}

map.on('click', onMapClick);
map.on('popupopen', function(e) {
  $('.chat-wrapper').removeAttr('hidden');
  var pin = e.popup._source;
  var pinID = pin._leaflet_id;

  $('#message-box-' + pinID).show();
  $('#user-panel-' + pinID).show();
  previousPinID = stack.pop();
  stack.push(pin._leaflet_id);
  $('#message-box-' + previousPinID).hide();
  $('#user-panel-' + previousPinID).hide();

    if($('#message-box-' + pin._leaflet_id).length == 0){
    $('.chat-wrapper').append('<div class="message-box" id="message-box-' + pin._leaflet_id + '" ></div>\n' +
        '    <div class="user-panel" id="user-panel-' + pin._leaflet_id + '">\n' +
        '        <input type="text" name="name" class="name" id="name-' + pin._leaflet_id + '" placeholder="Your Name" maxlength="15" />\n' +
        '        <input type="text" name="message" class="message" id="message-' + pin._leaflet_id + '" placeholder="Type your message here..." maxlength="100" />\n' +
        '        <button class="send-message" id="send-message-' + pin._leaflet_id + '">Send</button>\n' +
        '    </div>');
  }
  startServer(pin);
});

//create a new WebSocket object.
function startServer(pin) {
  var pinID = pin._leaflet_id;
  var msgBox = $('#message-box-' + pinID);
  var wsUri = "ws://localhost:9000/demo/server.php";
  websocket = new WebSocket(wsUri);

  websocket.onopen = function(ev) { // connection is open
    msgBox.append('<div class="system_msg" style="color:#bbbbbb">Welcome to chat no. ' + pinID + '!</div>'); //notify user
  };
// Message received from server
  websocket.onmessage = function(ev) {
    var response 		= JSON.parse(ev.data); //PHP sends Json data

    var res_type 		= response.type; //message type
    var user_message 	= response.message; //message text
    var user_name 		= response.name; //user name
    var user_color 		= response.color; //color

    switch(res_type){
      case 'usermsg':
        msgBox.append('<div><span class="user_name" style="color:' + user_color + '">' + user_name + '</span> : <span class="user_message">' + user_message + '</span></div>');
        break;
      case 'system':
        msgBox.append('<div style="color:#bbbbbb">' + user_message + '</div>');
        break;
    }
    msgBox[0].scrollTop = msgBox[0].scrollHeight; //scroll message

  };

  websocket.onerror	= function(ev){ msgBox.append('<div class="system_error">Error Occurred - ' + ev.data + '</div>'); };
  websocket.onclose 	= function(ev){ msgBox.append('<div class="system_msg">Connection Closed</div>'); };

//Message send button
  $('#send-message-' + pinID).click(function(){
    send_message(pinID);
  });

//User hits enter key
  $('#message-' + pin._leaflet_id).on( "keydown", function( event ) {
    if(event.which==13){
      send_message(pin._leaflet_id);
    }
  });

//Send message
  function send_message(pinID){
    console.log(pinID);
    var message_input = $('#message-' + pinID); //user message text
    var name_input = $('#name-' + pinID); //user name

    if(name_input.val() == ""){ //empty name?
      // alert("Enter your Name please!");
      return;
    }
    if(message_input.val() == ""){ //empty message?
      // alert("Enter Some message Please!");
      return;
    }

    //prepare json data
    var msg = {
      message: message_input.val(),
      name: name_input.val()
    };
    //convert and send data to server
    websocket.send(JSON.stringify(msg));
    message_input.val(''); //reset message input
  }
}

