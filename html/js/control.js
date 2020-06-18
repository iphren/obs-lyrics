loadPlaylist();

app.thisWin.webContents.on('did-finish-load', function(){
    webApp.style.visibility = 'visible';
});

if (app.configs.send) send.style.display = 'inline-block';
if (app.configs.plURL) plURL.value = app.configs.plURL;

liveFrame.src = app.html;
path.value = app.html.replace(/\\/g,'/');
path.onfocus = () => path.setSelectionRange(0, path.value.length);
search.onfocus = function() {changeFocus(search)}
search.onblur = function() {search.classList.remove('focused')}

new Sortable(songlist, {
    group: {
        name: 'shared',
        pull: 'clone',
        put: false
    },
    sort: false,
    draggable: '.option',
    onChoose: showBin,
    onUnchoose: hideBin,
    onClone: e => {
        if (e.item.isSameNode(selected)) selectSong(e.clone, songlist);
    },
    onChange: e => bin.parentNode.style.opacity = 0.5,
    animation: 150
});
new Sortable(playlist, {
    group: 'shared',
    draggable: '.option',
    filter: '.filter',
    onChoose: showBin,
    onUnchoose: hideBin,
    onSort: e => {
        savePlaylist();
        changeFocus(playlist.parentNode);
    },
    onChange: e => bin.parentNode.style.opacity = 0.5,
    animation: 150
});
new Sortable(bin, {
    group: 'shared',
    draggable: '.option',
    onChange: e => bin.parentNode.style.opacity = 1,
    onAdd: e => {
        if (e.item.isSameNode(currentPlaying)) showLyrics();
        if (e.item.isSameNode(selected)) selectSong();
        e.item.remove();
    }
});

function showBin(e) {
    bin.parentNode.style.zIndex = 100;
    bin.parentNode.style.opacity = 0.5;
}

function hideBin(e) {
    bin.parentNode.style.opacity = 0;
    bin.parentNode.style.zIndex = -100;
}