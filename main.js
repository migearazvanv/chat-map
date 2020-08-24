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
var marker = L.marker([51.5, -0.09]).addTo(map);

//create a new WebSocket object.
var msgBox = $('#message-box');
var wsUri = "ws://localhost:9000/demo/server.php";
websocket = new WebSocket(wsUri);

websocket.onopen = function(ev) { // connection is open
  msgBox.append('<div class="system_msg" style="color:#bbbbbb">Welcome to my "Demo WebSocket Chat box"!</div>'); //notify user
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
$('#send-message').click(function(){
  send_message();
});

//User hits enter key
$( "#message" ).on( "keydown", function( event ) {
  if(event.which==13){
    send_message();
  }
});

//Send message
function send_message(){
  var message_input = $('#message'); //user message text
  var name_input = $('#name'); //user name

  if(name_input.val() == ""){ //empty name?
    alert("Enter your Name please!");
    return;
  }
  if(message_input.val() == ""){ //empty message?
    alert("Enter Some message Please!");
    return;
  }

  //prepare json data
  var msg = {
    message: message_input.val(),
    name: name_input.val(),
  };
  //convert and send data to server
  websocket.send(JSON.stringify(msg));
  message_input.val(''); //reset message input
}
