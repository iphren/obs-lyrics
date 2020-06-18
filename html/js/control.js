loadToken();
loadPlaylist();

document.title = app.getName();
ipcRenderer.on('update', function(event, text) {
    document.title = text === 'latest version' ? app.getName() : `${app.getName()} - ${text}`;
});

app.thisWin.webContents.on('did-finish-load', function(){
    webApp.classList.remove('hidden');
});

if (app.configs.send) send.classList.remove('none');
if (app.configs.plURL) plURL.value = app.configs.plURL;

liveFrame.src = app.html;
path.value = app.html.replace(/\\/g,'/');

setInterval(function () {
    let t = new Date();
    clock.innerHTML = `${tt(t.getHours())}:${tt(t.getMinutes())}:${tt(t.getSeconds())}`;
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
    onStart: () => bin.parentNode.classList.add('show'),
    onUnchoose: () => bin.parentNode.classList.remove('show'),
    onClone: e => {
        if (e.item.isSameNode(selected)) selectSong(e.clone, songlist);
    },
    onChange: e => bin.parentNode.classList.remove('opaque'),
    animation: 150
});
new Sortable(playlist, {
    group: 'shared',
    draggable: '.option',
    filter: '.filter',
    onStart: () => bin.parentNode.classList.add('show'),
    onUnchoose: () => bin.parentNode.classList.remove('show'),
    onSort: e => {
        savePlaylist();
        changeFocus(playlist.parentNode);
    },
    onChange: e => bin.parentNode.classList.remove('opaque'),
    animation: 150
});
new Sortable(bin, {
    group: 'shared',
    draggable: '.option',
    onChange: e => bin.parentNode.classList.add('opaque'),
    onAdd: e => {
        if (e.item.isSameNode(currentPlaying)) showLyrics();
        if (e.item.isSameNode(selected)) selectSong();
        e.item.remove();
    }
});