const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const APP_ID = 'simple-chat-app-v1';

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    const userId = uuidv4();
    let currentUsername = null;
    let currentRoom = null;

    socket.emit('user connected', { userId: userId, appId: APP_ID });

    socket.on('join room', (data) => {
        currentUsername = data.username;
        currentRoom = data.room;
        socket.join(currentRoom);
        io.to(currentRoom).emit('user joined', { username: currentUsername, room: currentRoom });
    });

    socket.on('chat message', (data) => {
        io.to(data.room).emit('chat message', data);
    });

    socket.on('typing', (data) => {
        socket.to(data.room).emit('typing', data);
    });

    socket.on('stop typing', (data) => {
        socket.to(data.room).emit('stop typing', data);
    });

    socket.on('disconnect', () => {
        if (currentRoom && currentUsername) {
            io.to(currentRoom).emit('user left', { username: currentUsername });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on *:${PORT}`);
});