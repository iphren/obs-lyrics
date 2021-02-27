const remote = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;

const app = remote.app;
const videoTypes = /\.(mp4|webm|ogg)$/i;
const debug = document.getElementById('s-debug');
const bgs = document.getElementById('s-backgrounds');
const ruler = document.getElementById('s-ruler');
const lyrics = document.getElementById('s-lyrics');
var currentLink = '';
var currentText = '';

window.addEventListener('click', function(e) {
    document.getElementById('focus').focus();
});

window.addEventListener('resize', function(e) {
    for (let node of document.getElementsByClassName('slide')) {
        checkSize(node);
    }
});

ipcRenderer.on('changeBackground', (event, link) => {
    if (currentLink === link) return;
    currentLink = link;
    bgs.lastElementChild.classList.add('deleting');
    bgs.appendChild(createBg(link));
});

ipcRenderer.on('songInfo', (event, text) => {
    if (currentText === text) return;
    currentText = text;
    lyrics.lastElementChild.classList.add('l-deleting');
    lyrics.appendChild(createInfo(text));
});

ipcRenderer.on('changeLyrics', (event, list) => {
    let text = '';
    for (let line of list) {
        for (let phrase of line) {
            ruler.innerHTML = phrase.text;
            phrase.length = ruler.clientWidth;
        }
        let index = breakPoint(line);
        for (let i = 0; i < line.length; i++) {
            if (index && i === index) text += '<br>';
            text += line[i].text + ' ';
        }
        text += '<br>'
    }
    if (currentText === text) return;
    currentText = text;
    lyrics.lastElementChild.classList.add('l-deleting');
    lyrics.appendChild(createLyric(text));
});

function breakPoint(line) {
    let index = 0;
    let firstLine = line.reduce((sum, phrase) => sum + phrase.length, 0);
    let secondLine = 0;
    let minDiff = firstLine;
    if (firstLine < window.innerWidth * 0.8) return index;
    for (let i = line.length - 1; i > 0; i--) {
        firstLine -= line[i].length;
        secondLine += line[i].length;
        let diff = Math.abs(firstLine - secondLine);
        if (diff < minDiff) {
            minDiff = diff;
            index = i;
        }
    }
    return index;
}

function createLyric(text) {
    let el = document.createElement('span');
    el.innerHTML = text;
    loaded(el, 'l-deleting');
    return el;
}

function createInfo(text) {
    let el = document.createElement('span');
    el.className = 's-songInfo';
    el.innerHTML = text;
    loaded(el, 'l-deleting');
    return el;
}

function createBg(link) {
    let el = document.createElement('div');
    let media;
    let evt;
    if (videoTypes.test(link)) {
        media = document.createElement('video');
        media.playsinline = true;
        media.muted = true;
        media.autoplay = true;
        media.loop = true;
        evt = 'canplay';
    } else {
        media = document.createElement('img');
        evt = 'load';
    }
    media.className = 'slide';
    if (link) media.src = link;
    media.addEventListener(evt, loaded);
    if (!link) loaded(null);
    el.appendChild(media);
    return el;
}

function loaded(e, del = 'deleting') {
    for (let node of document.getElementsByClassName(del)) {
        node.classList.remove('s-show');
    }
    if (this && this.tagName && this.parentElement) {
        checkSize(this);
        this.parentElement.classList.add('s-show');
    }
    if (del === 'l-deleting') e.classList.add('s-show');
    setTimeout(() => {
        for (let node of document.getElementsByClassName(del)) {
            node.remove();
        }
    }, 750);
}

function checkSize(el) {
    switch (el.tagName.toLowerCase()) {
        case 'video':
            el.className = el.videoWidth / el.videoHeight > window.innerWidth / window.innerHeight ? 'slide landscape' : 'slide portrait';
            break;
        case 'img':
            el.className = el.naturalWidth / el.naturalHeight > window.innerWidth / window.innerHeight ? 'slide landscape' : 'slide portrait';
            break;
    }
}

ipcRenderer.on('showFullScreen', (event, full) => {
    if (full) {
        document.body.classList.remove('s-draggable');
    } else {
        document.body.classList.add('s-draggable');
    }
})

window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'F11':
            if (document.body.classList.contains('s-draggable')) {
                ipcRenderer.send('maxShow');
            } else {
                ipcRenderer.send('minShow');
            }
            break;
        case 'Escape':
        case 'F5':
            ipcRenderer.send('endShow');
            break;
        default:
            ipcRenderer.send('top', e.key);
            break;
    }
}, true);