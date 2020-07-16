const socket = io();

const form = document.getElementById('messageForm');
const input = document.getElementById('messageInput');
const buttonSubmit = document.getElementById('btnSubmit');
const buttonLocation = document.getElementById('send-location');
const messages = document.getElementById('messages'); 
const locations = document.getElementById('locations');
const sidebar = document.getElementById('sidebar');

//Templates
const messagesTemplate = document.getElementById('message-templete').innerHTML;
const locationTemplate = document.getElementById('location-templete').innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML;

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    // New message element
    const newMessage = messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;
    
    // Visible height
    const visibleHeight = messages.offsetHeight;

    // Container height
    const containerHeight = messages.scrollHeight;

    // How far have I scrolled
    const scrollOffset = messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight;
    }
}

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messagesTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format("hh:mm:ss a")
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('locationMessage', ({ username, url, createdAt }) => {
    const html = Mustache.render(locationTemplate, {
        username,
        location: url,
        createdAt: moment(createdAt).format("hh:mm:ss a")
    });
    messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    sidebar.innerHTML = html;
});

form.addEventListener('submit', (e) => {
    e.preventDefault(); // stop the browser for a whole page refresh
    buttonSubmit.setAttribute('disabled', 'disabled');
    socket.emit('sendMessage', input.value, (error) => {
        buttonSubmit.removeAttribute('disabled');
        input.value = '';
        input.focus();
        if (error) {
            return console.log(error);
        }
        console.log('The message is delivered.');
    });
});

buttonLocation.addEventListener('click', () => {
    buttonLocation.setAttribute('disabled', 'disabled');
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('sendLocation', { latitude, longitude }, (message) => {
            console.log(message);
            buttonLocation.removeAttribute('disabled');
        });
    })
});

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/'; //send user to the root page, to retype in info
    }
});

// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated!', count);
// });

// document.getElementById('increment').addEventListener('click', () => {
//     console.log('click');
//     socket.emit('increment');
// });