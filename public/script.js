const socket = io('/');
//creating video element
const videoGrid = document.getElementById('videos-container');
const myVideo = document.createElement('video');
myVideo.muted = true;




//connecting to server from peerjs
//peer object
const peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
})




let myVideoStream; //important to pass individual streams

//adds the stream to our one video element and then 
//adding it to ur container
const addVideoStream = (video,stream_) =>{
  video.srcObject = stream_; //loading the content inside video
  video.addEventListener('loadedmetadata', ()=>{
      video.play();
  })
  
  videoGrid.append(video); //will append it on our main container
}


//listening to opening of peer connection
peer.on('open', (peer_id) =>{
  //console.log(id)
  //after joining the room
  socket.emit('join-room',ROOM_ID,peer_id);
})

// check for mediaDevices.Devices() support
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  console.log("getUserMedia() not supported.");
}

//for accessing webcam
//returns a promise
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
})//after recieved data
.then((stream) => {
  //passing the result to our variable
     myVideoStream = stream; //for mute unmute out of this scope
    addVideoStream(myVideo, stream);

    //answer peer call (when user calls u and then have to show stream in his browser)
    peer.on('call', (call)=>{
      call.answer(stream);
      const vid = document.createElement('video');
      call.on('stream', (userVideoStream) =>{
       addVideoStream(vid,userVideoStream);
      })

    })

    //when a new user joins
    //for peer call
    socket.on('user-connected',(userId)=>{
    connectToNewUser(userId,stream); //this stream is coming from the promise
})

})
.catch((err) => console.log(err));



//add new user facecam to the room 
//peer call
const connectToNewUser = (userId, stream) =>{

  //console.log(userId)
   const userCall = peer.call(userId, stream);
   const vid = document.createElement('video');
   userCall.on('stream', (userVideoStream) =>{
       addVideoStream(vid,userVideoStream);
   })
};



//grab the message
const chattext = document.getElementById('chat_message');
const post = document.getElementById('btn');

post.addEventListener('click', ()=>{
       if(chattext.value.length !== 0){
         //console.log(chattext.value);
         socket.emit('msg', chattext.value); //send the msg from frontend
         chattext.value = '' ;
       }
})

const ul = document.getElementById('chatlist');
const li = document.createElement('li');
socket.on('createMsg', (message) => {
  //console.log(`this is coming from server `, message)
       $("ul").append(`<li class="message"><b>User </b><br/>${message}</li>`);
       scrollToBottom();
})


//chat toggle
const chatBtn = document.getElementById('chat-up');
const rpanel = document.getElementById('rightsection');
const lpanel = document.getElementById('leftsection');
chatBtn.addEventListener('click', ()=>{
     rpanel.classList.toggle('hide');
     lpanel.classList.toggle('full');
})


const scrollToBottom = () => {
  var d = $('.main__chat_window');
  d.scrollTop( d.prop("scrollHeight") );
}


//mute audio
const muteToggle = () =>{
       // console.log(myVideoStream)
       const enable = myVideoStream.getAudioTracks()[0].enabled;
       if (enable) {
            myVideoStream.getAudioTracks()[0].enabled = false;
            setUnmuteButton();
       } else {
        setMuteButton();
         myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

//stop play video
const playStop = () => {
  //console.log('object')
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}


//leave out the window
function close_window() {
  if (confirm("Are You Sure to leave this meeting ?")) {
    window.open('', window.location.href)
    window.close();
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone" ></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}




