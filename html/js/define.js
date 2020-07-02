const remote = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
const fs = require('fs');
const pinyin = require('pinyin');

const app = remote.app;

const webApp = document.getElementById('app');
const menu = document.getElementById('menu');
const search = document.getElementById('search');
const clear = document.getElementById('clear');
const reloadBtn = document.getElementById('reload');
const hideUp = document.getElementById('hideUp');
const sendBtn = document.getElementById('sendBtn');
const plURL = document.getElementById('plURL');
const clock = document.getElementById('clock');
const main = document.getElementById('main');
const control = document.getElementById('control');
const songlist = document.getElementById('songlist');
const loading = document.getElementById('loading');
const notFound = document.getElementById('notFound');
const playlist = document.getElementById('playlist');
const trash = document.getElementById('trash');
const bin = document.getElementById('bin');
const pTitle = document.getElementById('pTitle');
const pLyrics = document.getElementById('pLyrics');
const editInfo = document.getElementById('editInfo');
const edit = document.getElementById('edit');
const cancel = document.getElementById('cancel');
const saveBtn = document.getElementById('save');
const live = document.getElementById('live');
const liveBin = document.getElementById('liveBin');
const liveFrame = document.getElementById('liveFrame');
const path = document.getElementById('path');
const login = document.getElementById('login');
const address = document.getElementById('address');
const password = document.getElementById('password');
const status = document.getElementById('status');
const hide = document.getElementById('hide');
const songInfo = document.getElementById('songInfo');
const onDelete = document.getElementById('onDelete');
const askDelete = document.getElementById('askDelete');
const typeDelete = document.getElementById('typeDelete');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');

var currentLyrics = '';
var currentPlaying = null;
var currentPlayingLyrics = null;
var selected = null;
var selectedParent = null;
var focused = null, lastFocused = null;
var savedTitle = '', savedLyrics = '';
var savedInfo = {};
for (let node of songInfo.getElementsByTagName('input')) {
    savedInfo[node.id] = '';
}

const rotation = [search, songlist.parentNode, playlist.parentNode, live.parentNode];
const keyMap = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM';
const ctrlKeys = {r:true, R:true, h:true, H:true, s:true, S:true, l:true, L:true, e:true, E:true, n:true, N:true};
const funcKeys = {Tab: true, F5: true}
const metaKeys = {};