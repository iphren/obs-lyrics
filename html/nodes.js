const search = document.getElementById('search');
const clear = document.getElementById('clear');
const hideUp = document.getElementById('hideUp');
const sendBtn = document.getElementById('sendBtn');
const plURL = document.getElementById('plURL');
const clock = document.getElementById('clock');
const songlist = document.getElementById('songlist');
const notFound = document.getElementById('notFound');
const playlist = document.getElementById('playlist');
const bin = document.getElementById('bin');

const pTitle = document.getElementById('pTitle');
const pLyrics = document.getElementById('pLyrics');

const live = document.getElementById('live');
const liveFrame = document.getElementById('liveFrame');

const path = document.getElementById('path');
const login = document.getElementById('login');
const address = document.getElementById('address');
const password = document.getElementById('password');
const status = document.getElementById('status');

const hide = document.getElementById('hide');

app.thisWin.webContents.on('did-finish-load', function(){
    document.getElementById('app').style.visibility = 'visible';
});

document.title = app.getName();
ipcRenderer.on('update', function(event, text) {
    document.title = text === 'latest version' ? app.getName() : `${app.getName()} - ${text}`;
});