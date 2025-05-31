const socket = io();

const joinRoomContainer = document.getElementById('join-room-container');
const roomNameInput = document.getElementById('room-name-input');
const usernameInput = document.getElementById('username-input');
const joinRoomButton = document.getElementById('join-room-button');
const chatContainer = document.getElementById('chat-container');
const roomTitleDisplay = document.getElementById('room-title');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const currentUserInfo = document.getElementById('current-user-info');
const typingIndicator = document.getElementById('typing-indicator');
const appInfoDiv = document.querySelector('.app-info');

let username = null;
let currentRoom = null;
let typingTimeout;
let isTyping = false;

socket.on('user connected', (data) => {
    if (appInfoDiv) {
        appInfoDiv.querySelector('p:nth-child(1)').textContent = `Your User ID: ${data.userId}`;
        appInfoDiv.querySelector('p:nth-child(2)').textContent = `App ID: ${data.appId}`;
    }
});

joinRoomButton.addEventListener('click', () => {
    const roomName = roomNameInput.value.trim();
    username = usernameInput.value.trim();

    if (roomName && username) {
        currentRoom = roomName;
        socket.emit('join room', { room: roomName, username: username });
        joinRoomContainer.style.display = 'none';
        chatContainer.style.display = 'block';
        roomTitleDisplay.textContent = roomName;
        currentUserInfo.textContent = `You are: ${username}`;
        input.focus();
    } else {
        alert('Please enter both a room name and a username.');
    }
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value && username && currentRoom) {
        const message = input.value;
        socket.emit('chat message', { room: currentRoom, username, message });
        input.value = '';
    }
});

input.addEventListener('input', () => {
    if (input.value.trim() && !isTyping) {
        isTyping = true;
        socket.emit('typing', { room: currentRoom, username });
    } else if (!input.value.trim() && isTyping) {
        isTyping = false;
        socket.emit('stop typing', { room: currentRoom, username });
    }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        isTyping = false;
        socket.emit('stop typing', { room: currentRoom, username });
    }, 1000);
});

socket.on('chat message', (data) => {
    const item = document.createElement('li');
    item.innerHTML = `<strong>${data.username}:</strong> ${data.message}`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

socket.on('user joined', (data) => {
    const item = document.createElement('li');
    item.classList.add('system-message');
    item.textContent = `${data.username} joined the chat.`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

socket.on('user left', (data) => {
    const item = document.createElement('li');
    item.classList.add('system-message');
    item.textContent = `${data.username} left the chat.`;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

socket.on('typing', (data) => {
    if (data.room === currentRoom && data.username !== username) {
        typingIndicator.textContent = `${data.username} is typing...`;
    }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingIndicator.textContent = '';
    }, 2000);
});

socket.on('stop typing', () => {
    typingIndicator.textContent = '';
});