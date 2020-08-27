const stack = [];
const wsUri = "ws://localhost:9000/demo/server.php";
websocket = new WebSocket(wsUri);

//Initialize the map and assign it to a variable for later use
const map = L.map('map', {
  //Set latitude and longitude of the map center (required)
  center: [46.7712, 23.6236],
  //Set the initial zoom level, values 0-18, where 0 is most zoomed-out (required)
  zoom: 5
});

// Create a Tile Layer and add it to the map
const tiles = new L.tileLayer('http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
}).addTo(map);

function onMapClick(e) {
  const pin = L.marker(e.latlng).addTo(map);
  pin.bindPopup('Chatroom ' + pin._leaflet_id).openPopup();
  startServer(pin);
}

function changeChat(pinID) {
  $('#message-box-' + pinID).show();
  $('#user-panel-' + pinID).show();
  previousPinID = stack.pop();
  stack.push(pinID);
  $('#message-box-' + previousPinID).hide();
  $('#user-panel-' + previousPinID).hide();
}

//Create a new WebSocket object.
function startServer(pin) {

  const pinID = pin._leaflet_id;

  let msgBox = $('#message-box-' + pinID);
  msgBox.append('<div class="system_msg" style="color:#bbbbbb; text-align: center">Chatroom ' + pinID + '</div>'); //Notify user

//Message received from server
  websocket.onmessage = function(ev) {
    let response 		= JSON.parse(ev.data); //PHP sends Json data

    let resType 		= response.type; //Message type
    let userMessage 	= response.message; //Message text
    let userName 		= response.name; //User name
    let chatId         = response.chat_id;
    msgBox = $('#message-box-' + chatId);

    switch(resType){
      case 'usermsg':
        msgBox.append('<div><span class="user-name" id="user-name-' + chatId + '">' + userName + '</span> : <span class="user-message" id="user-message- ' + chatId + ' ">' + userMessage + '</span></div>');
        break;
      case 'system':
        msgBox.append('<div style="color:#bbbbbb">' + userMessage + '</div>');
        break;
    }
    msgBox[0].scrollTop = msgBox[0].scrollHeight; //Scroll message
  };

  websocket.onerror	= function(ev){ msgBox.append('<div class="system_error">Error Occurred - ' + ev.data + '</div>'); };
  websocket.onclose = function(){ msgBox.append('<div class="system_msg">Connection Closed</div>'); };

//Message send button
  $('#send-message-' + pinID).click(function(){
    sendMessage(pinID);
  });

//User hits enter key
  $('#message-' + pinID).on( "keydown", function( event ) {
    if(event.which==13){
      sendMessage(pinID);
    }
  });

//Send message
  function sendMessage(pinID){
    const messageInput = $('#message-' + pinID); //User message text
    const nameInput = $('#name-' + pinID); //User name

    if(nameInput.val() == ""){ //Empty name?
      alert("Enter your Name please!");
      return;
    }
    if(messageInput.val() == ""){ //Empty message?
      alert("Enter Some message Please!");
      return;
    }

    //Prepare json data
    const msg = {
      message: messageInput.val(),
      name: nameInput.val(),
      chat_id: pinID
    };

    //convert and send data to server
    websocket.send(JSON.stringify(msg));
    messageInput.val(''); //Reset message input

  }
}

//Listeners
map.on('click', onMapClick);
map.on('popupopen', function(e) {
  $('#no-pin').hide(); //Hide first message
  $('.chat-wrapper').removeAttr('hidden'); //Show chat container
  const pin = e.popup._source;
  const pinID = pin._leaflet_id;
  changeChat(pinID);

//Create new chat if not exist
  if($('#message-box-' + pinID).length == 0){
    $('.chat-wrapper').append('<div class="message-box" id="message-box-' + pinID + '" ></div>\n' +
      '    <div class="user-panel" id="user-panel-' + pinID + '">\n' +
      '        <input type="text" name="name" class="name" id="name-' + pinID + '" placeholder="Your Name" maxlength="15" />\n' +
      '        <input type="text" name="message" class="message" id="message-' + pinID + '" placeholder="Type your message here..." maxlength="100" />\n' +
      '        <button class="send-message" id="send-message-' + pinID + '">Send</button>\n' +
      '    </div>');
  }
});


