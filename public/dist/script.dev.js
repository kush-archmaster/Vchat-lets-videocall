"use strict";

var socket = io('/'); //creating video element

var videoGrid = document.getElementById('videos-container');
var myVideo = document.createElement('video');
myVideo.muted = true; //connecting to server from peerjs
//peer object

var peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
});
var myVideoStream; //important to pass individual streams
//adds the stream to our one video element and then 
//adding it to ur container

var addVideoStream = function addVideoStream(video, stream_) {
  video.srcObject = stream_; //loading the content inside video

  video.addEventListener('loadedmetadata', function () {
    video.play();
  });
  videoGrid.append(video); //will append it on our main container
}; //listening to opening of peer connection


peer.on('open', function (peer_id) {
  //console.log(id)
  //after joining the room
  socket.emit('join-room', ROOM_ID, peer_id);
}); // check for mediaDevices.Devices() support

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  console.log("getUserMedia() not supported.");
} //for accessing webcam
//returns a promise


navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}) //after recieved data
.then(function (stream) {
  //passing the result to our variable
  myVideoStream = stream; //for mute unmute out of this scope

  addVideoStream(myVideo, stream); //answer peer call (when user calls u and then have to show stream in his browser)

  peer.on('call', function (call) {
    call.answer(stream);
    var vid = document.createElement('video');
    call.on('stream', function (userVideoStream) {
      addVideoStream(vid, userVideoStream);
    });
  }); //when a new user joins
  //for peer call

  socket.on('user-connected', function (userId) {
    connectToNewUser(userId, stream); //this stream is coming from the promise
  });
})["catch"](function (err) {
  return console.log(err);
}); //add new user facecam to the room 
//peer call

var connectToNewUser = function connectToNewUser(userId, stream) {
  //console.log(userId)
  var userCall = peer.call(userId, stream);
  var vid = document.createElement('video');
  userCall.on('stream', function (userVideoStream) {
    addVideoStream(vid, userVideoStream);
  });
}; //grab the message


var chattext = document.getElementById('chat_message');
var post = document.getElementById('btn');
post.addEventListener('click', function () {
  if (chattext.value.length !== 0) {
    //console.log(chattext.value);
    socket.emit('msg', chattext.value); //send the msg from frontend

    chattext.value = '';
  }
});
var ul = document.getElementById('chatlist');
var li = document.createElement('li');
socket.on('createMsg', function (message) {
  //console.log(`this is coming from server `, message)
  $("ul").append("<li class=\"message\"><b>User </b><br/>".concat(message, "</li>"));
  scrollToBottom();
}); //chat toggle

var chatBtn = document.getElementById('chat-up');
var rpanel = document.getElementById('rightsection');
var lpanel = document.getElementById('leftsection');
chatBtn.addEventListener('click', function () {
  rpanel.classList.toggle('hide');
  lpanel.classList.toggle('full');
});

var scrollToBottom = function scrollToBottom() {
  var d = $('.main__chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}; //mute audio


var muteToggle = function muteToggle() {
  // console.log(myVideoStream)
  var enable = myVideoStream.getAudioTracks()[0].enabled;

  if (enable) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}; //stop play video


var playStop = function playStop() {
  //console.log('object')
  var enabled = myVideoStream.getVideoTracks()[0].enabled;

  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}; //leave out the window


function close_window() {
  if (confirm("Are You Sure to leave this meeting ?")) {
    window.open('', window.location.href);
    window.close();
  }
}

var setMuteButton = function setMuteButton() {
  var html = "\n    <i class=\"fas fa-microphone\" ></i>\n    <span>Mute</span>\n  ";
  document.querySelector('.main__mute_button').innerHTML = html;
};

var setUnmuteButton = function setUnmuteButton() {
  var html = "\n    <i class=\"unmute fas fa-microphone-slash\"></i>\n    <span>Unmute</span>\n  ";
  document.querySelector('.main__mute_button').innerHTML = html;
};

var setStopVideo = function setStopVideo() {
  var html = "\n    <i class=\"fas fa-video\"></i>\n    <span>Stop Video</span>\n  ";
  document.querySelector('.main__video_button').innerHTML = html;
};

var setPlayVideo = function setPlayVideo() {
  var html = "\n  <i class=\"stop fas fa-video-slash\"></i>\n    <span>Play Video</span>\n  ";
  document.querySelector('.main__video_button').innerHTML = html;
};