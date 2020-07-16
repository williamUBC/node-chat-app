const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage, generateLocationMessage } = require('./utils/messages');
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users');

const app = express();
//socketio函数需要一个http server作为参数，而express默认是在内部实现创建http server的，这就导致无法给这个函数提供http server
//因此需要用下面这个显性创建http server的方法
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

// let count = 0;

io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    socket.on('join', ({ username, room }, callback) => {
        const { user, error } = addUser({ id: socket.id, username, room });
        if (error) {
            return callback(error);
        }

        socket.join(user.room) // socket.join only used in server side
        socket.emit('message', generateMessage('Admin', 'Welcome!')); // emit info to that connection        
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`)); // emit info to connections except that connection
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback(); // means without an error
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();
        const user = getUser(socket.id);
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!');
        }

        io.to(user.room).emit('message', generateMessage(user.username, message)); // emit to all connections
        callback();
    });

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        const url = `https://google.com/maps?q=${longitude},${latitude}`;
        const user = getUser(socket.id);
        //io.emit('message', url);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, url));
        callback('Location shared!');
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
    // socket.emit('countUpdated', count);
    // socket.on('increment', () => {
    //     count++;
    //     //socket.emit('countUpdated', count); // This one emit info to that connection
    //     io.emit('countUpdated', count); // This one emit info to every connection
    // })
});

server.listen(port, () => {
    console.log('Server is up on port ' + port);
});


// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname,'../index.html'));    
// });