const remote = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;
const fs = require('fs');
const pinyin = require('pinyin');

const app = remote.app;

const webApp = document.getElementById('app');
const search = document.getElementById('search');
const clear = document.getElementById('clear');
const reloadBtn = document.getElementById('reload');
const hideUp = document.getElementById('hideUp');
const sendBtn = document.getElementById('sendBtn');
const plURL = document.getElementById('plURL');
const clock = document.getElementById('clock');
const songlist = document.getElementById('songlist');
const loading = document.getElementById('loading');
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

var currentLyrics = '';
var currentPlaying = null;
var currentPlayingLyrics = null;
var selected = null;
var selectedParent = null;
var focused = null, lastFocused = null;

const rotation = [search, songlist.parentNode, playlist.parentNode, live.parentNode];
const keyMap = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM';
const ctrlKeys = {r:true, R:true, h:true, H:true, s:true, S:true};
const metaKeys = {};