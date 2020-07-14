if (local) reload();
else loadToken();
loadPlaylist();

ipcRenderer.on('toggleTop', (event, st) => {
    if (!st) {
        pin.classList.remove('none');
    } else {
        pin.classList.add('none');
    }
});

ipcRenderer.on('stats', (event) => {
    login.classList.remove('none');
});

document.title = app.getName();
ipcRenderer.on('update', function(event, text) {
    document.title = text === 'latest version' ? app.getName() : `${app.getName()} - ${text}`;
});

remote.getCurrentWebContents().on('did-finish-load', function(){
    webApp.classList.remove('hidden');
});

if (app.configs.send) send.classList.remove('none');
if (app.configs.plURL) plURL.value = app.configs.plURL;
if (app.configs.liveStats) liveStats.classList.remove('none');

liveFrame.src = app.html;
path.value = app.html.replace(/\\/g,'/');

setInterval(function () {
    let t = new Date();
    let s = t.getSeconds();
    let ttext = `${tt(t.getHours())}:${tt(t.getMinutes())}:${tt(s)}`;
    clock.innerHTML = ttext;
    if (seconds !== s) {
        seconds = s;
        ipcRenderer.send('time', ttext);
    }
}, 100);

function tt(i) {return i > 9 ? i : `0${i}`}

new Sortable(songlist, {
    group: {
        name: 'shared',
        pull: 'clone',
        put: false
    },
    sort: false,
    draggable: '.option',
    onStart: dragOn,
    onUnchoose: dragOff,
    onClone: e => {
        if (e.item.isSameNode(selected)) selectSong(e.clone, songlist);
    },
    onChange: e => trash.classList.remove('real'),
    animation: 150
});
new Sortable(playlist, {
    group: {
        name: 'shared',
        pull: function(to, from) {
            return to.el.id === 'liveBin' ? 'clone' : true;
        }
    },
    draggable: '.option',
    filter: '.filter',
    onStart: dragOn,
    onUnchoose: dragOff,
    onSort: e => {
        savePlaylist();
        changeFocus(playlist.parentNode);
    },
    onChange: e => trash.classList.remove('real'),
    animation: 150
});
new Sortable(bin, {
    group: {
        name: 'shared',
        pull: false
    },
    onChange: e => trash.classList.add('real'),
    onAdd: e => {
        if (e.item.isSameNode(currentPlaying)) showLyrics();
        if (e.item.isSameNode(selected)) selectSong();
        e.item.remove();
        if (e.from.id === 'songlist') {
            deleteSong(e.clone);
        }
    }
});
new Sortable(liveBin, {
    group: {
        name: 'shared',
        pull: false
    },
    onAdd: e => {
        if (e.clone.parentNode.isSameNode(songlist)) {
            addToPlaylist(e.clone);
            selectSong(playlist.lastChild, playlist);
            showLyrics(playlist.lastChild);
        } else {
            selectSong(e.clone, playlist);
            showLyrics(e.clone);
        }
        e.item.remove();
    }
});

function dragOn() {
    trash.classList.remove('hidden');
    liveBin.classList.remove('hidden');
}

function dragOff() {
    trash.classList.remove('real');
    trash.classList.add('hidden');
    liveBin.classList.add('hidden');
}