const express = require('express');
const {v4 : uuidv4} = require('uuid');  //specific version of uuid
const PORT = process.env.PORT || 3000;

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const unique = uuidv4();
const path = require('path');

//creating a peer server
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server,{
   //  port: PORT,
   //  path: '/peerjs'
   debug: true
   
});


//middlewares
app.use('/peerjs', peerServer); 
//what url peerserver will use or speicfy 
//it while creating the server itself
app.use(express.static(path.join(__dirname,'/public')));
app.set('view engine', 'hbs');


//routes
app.get('/', (req,res)=>{
    res.redirect(`/${unique}`) ;
})

app.get('/:room', (req,res) =>{
     res.render('room', {roomId: req.params.room});
})

//making a connection between client and server (script.js file and this file)
io.on('connection', (socket)=>{
    socket.on('join-room', (roomId,userId) => {
        //console.log('We have joined room');
        socket.join(roomId);
        
        //tell our socket that we have a user connected if somone else does
        socket.to(roomId).emit('user-connected', userId);

        //recieve the msg sent from frontend
        socket.on('msg', (message) =>{
            io.to(roomId).emit('createMsg', message);  //sending msg to te same roomid again
        })
    })
   
})


server.listen(PORT , ()=> console.log(`Server running at ${PORT}`))