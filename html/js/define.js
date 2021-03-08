const { ipcRenderer, remote } = require('electron');
const { app, dialog } = remote;
const moment = require('moment');
const fs = require('fs');
const join = require('path').join;
var nzhcn = require("nzh/cn");
const pinyin = require('pinyin');
const myPinyin = function(text) {
    return pinyin(text.replace(/行/g,'形').replace(/着/g,'这').replace(/弹/g,'谈').replace(/祢|袮/g,'你'), {style: pinyin.STYLE_NORMAL});
}
const Sortable = require("sortablejs");
const getSystemFonts = require('get-system-fonts');

const pulsar = document.getElementById('pulsar');
const webApp = document.getElementById('app');
const menu = document.getElementById('menu');
const search = document.getElementById('search');
const clear = document.getElementById('clear');
const reloadBtn = document.getElementById('reload');
const newBtn = document.getElementById('newBtn');
const hideUp = document.getElementById('hideUp');
const sendBtn = document.getElementById('sendBtn');
const plURL = document.getElementById('plURL');
const liveStats = document.getElementById('liveStats');
const pin = document.getElementById('pin');
const clock = document.getElementById('clock');
const main = document.getElementById('main');
const control = document.getElementById('control');
const songlist = document.getElementById('songlist');
const loading = document.getElementById('loading');
const notFound = document.getElementById('notFound');
const letter = document.getElementById('letter');
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
const stats = document.getElementById('stats');
const status = document.getElementById('status');
const hide = document.getElementById('hide');
const songInfo = document.getElementById('songInfo');
const onDelete = document.getElementById('onDelete');
const askDelete = document.getElementById('askDelete');
const typeDelete = document.getElementById('typeDelete');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');
const blurred = document.getElementById('blurred');
const songEditor = document.getElementById('songEditor');
const slidesSettings = document.getElementById('slidesSettings');
const slidesBtn = document.getElementById('slidesBtn');
const slidesFolder = document.getElementById('slidesFolder');
const slidesFolderPath = document.getElementById('slidesFolderPath');
const slidesBrowser = document.getElementById('slidesBrowser');
const forLive = document.getElementById('forLive');
const slidesTotalPages = document.getElementById('slidesTotalPages');
const currentSlidesPage = document.getElementById('currentSlidesPage');
const slidesPrevPage = document.getElementById('slidesPrevPage');
const slidesNextPage = document.getElementById('slidesNextPage');
const clearBtn = document.getElementById('clearBtn');
const infoBtn = document.getElementById('infoBtn');
const styleBtn = document.getElementById('styleBtn');
const sizeBtn = document.getElementById('sizeBtn');
const sizeBtnBg = document.getElementById('sizeBtnBg');
const slideBtn = document.getElementById('slideBtn');
const slidesFooter = document.getElementById('slidesFooter');
const sizesBtn = document.getElementById('sizesBtn');
const slidesFolderPathProgress = document.getElementById('slidesFolderPathProgress');
const currentSlideViewImg = document.getElementById('currentSlideViewImg');
const currentSlideBackImg = document.getElementById('currentSlideBackImg');
const currentSlideViewVideo = document.getElementById('currentSlideViewVideo');
const currentSlideBackVideo = document.getElementById('currentSlideBackVideo');



var currentInfo = '';
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

const totalStyles = 3;
var startSizing = false;

const rotation = [search, songlist.parentNode, playlist.parentNode, live.parentNode];
const keyMap = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM';
const ctrlKeys = {s:true, S:true, o:true, O:true, n:true, N:true};
const funcKeys = {Tab: true}
const metaKeys = ctrlKeys;
const allowedTop = {
    Backspace: true,
    ArrowDown: true,
    ArrowUp: true,
    ArrowRight: true,
    PageDown: true,
    ArrowLeft: true,
    PageUp: true
}
var seconds = null;
var local = !fs.existsSync(app.token);
var songX = 0, songY = 0;
var scrollTimer;
var slidesFolderWatcher;
var slidesPage = 1;
var slidesPerPage = 16;
var slide = '';
var slides = [];
var selectedSlide = '';
var slidesLoading = false;
const mediaTypes = /\.(jpg|jpeg|png|gif|svg|mp4|webm|ogg|apng|avif|jfif|pjpeg|pjp|webp)$/i;
const videoTypes = /\.(mp4|webm|ogg)$/i;