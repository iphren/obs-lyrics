search.oninput = function(e) {
    if (e.target.value === 'whosyourdaddy') remote.getCurrentWebContents().openDevTools();
    else if (e.target.value === 'thereisnospoon') {
        send.classList.remove('none');
        app.save('send',true);
    }
    else if (e.target.value === 'somebodysetusupthebomb') {
        local = !local;
        loadToken();
    }
    let term = '';
    let py = myPinyin(e.target.value);
    for (let p of py) {
        term += p[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    let found = false;
    for (let song of songlist.childNodes) {
        if (song.getAttribute('keywords').indexOf(term) > -1) {
            song.classList.add('result');
            found = true;
        } else {
            song.classList.remove('result');
        }       
    }
    if (found) notFound.classList.add('none');
    else notFound.classList.remove('none');
    if (hideUp.classList.contains('active')) toggleHide();
}

search.onkeydown = function(e) {
    if (e.key in funcKeys || (e.ctrlKey && e.key in ctrlKeys) || (e.metaKey && e.key in metaKeys)) {
        e.preventDefault();
        return;
    }
    e.stopPropagation();
    switch (e.key) {
        case 'Enter':
            if (!hideUp.classList.contains('active')) {
                if (songlist.getElementsByClassName('result').length !== 0) {
                    selectSong(getNext(songlist), songlist);
                    changeFocus(songlist.parentNode);
                }
                break;
            } else {
                toggleHide();
                break;
            }
        case 'Escape':
            changeFocus();
            search.blur();
            break;
    }
}

plURL.onkeydown = function(e) {
    e.stopPropagation();
    switch (e.key) {
        case 'Enter':
            sendPlaylist();
    }
}

pTitle.onkeydown = editorControl;
pLyrics.onkeydown = editorControl;

pTitle.oninput = editorInput;
pLyrics.oninput = editorInput;

address.onkeydown = function(e) {
    e.stopPropagation();
    if (e.key === 'Enter' || e.key === 'Tab') password.focus();
    if (e.key === 'Tab') e.preventDefault();
}

password.onkeydown = function(e) {
    e.stopPropagation();
    if (e.key === 'Enter') {
        reload();
        password.focus();
    }
    if (e.key === 'Tab') {
        e.preventDefault();
        address.focus();
    }
}

status.onkeydown = function(e) {
    e.stopPropagation();
    if (e.key === 'Tab') {
        e.preventDefault();
        address.focus();
    }
}

typeDelete.onkeydown = function(e) {
    e.stopPropagation();
    if (e.key === 'Escape') noDelete();
    if (e.key === 'Tab') e.preventDefault();
}

typeDelete.oninput = function(e) {
    if (typeDelete.value === 'delete') {
        confirmDelete.classList.remove('disabled');
    } else {
        confirmDelete.classList.add('disabled');
    }
}

for (let node of songInfo.getElementsByTagName('input')) {
    node.onkeydown = function(e) {
        e.stopPropagation();
    }
    node.oninput  = editorInput;
}

window.onkeydown = keyControl;

function keyControl(e) {
    if ((e.ctrlKey && !(e.key in ctrlKeys)) || (e.metaKey && !(e.key in metaKeys))) return;
    e.preventDefault();
    if (!search.isSameNode(focused)) hide.focus();
    switch (e.key) {
        case 'Tab':
            if (!pTitle.readOnly) {
                changeFocus();
                pTitle.focus();
                break;
            }
            let ind = 0;
            if (focused) {
                for (let i = 0; i < rotation.length; i++) {
                    if (rotation[i].isSameNode(focused)) ind = (i + 1) % rotation.length;
                }
            }
            if (rotation[ind].classList.contains('hide')) ind = (ind + 1) % rotation.length;
            if (rotation[ind].id === 'forSonglist' && songlist.getElementsByClassName('result').length === 0) ind = (ind + 1) % rotation.length;
            if (rotation[ind].id === 'forPlaylist' && playlist.getElementsByClassName('result').length === 0) ind = (ind + 1) % rotation.length;
            if (rotation[ind].id === 'forLive' && live.getElementsByClassName('result').length === 0) ind = (ind + 1) % rotation.length;
            if (rotation[ind].isSameNode(focused)) changeFocus();
            else changeFocus(rotation[ind]);
            break;
        case '/':
            hideUp.classList.contains('active') && toggleHide();
            clearSearch();
            break;
        case 'Enter':
            if (selected && focused) {
                if (focused.id === 'forPlaylist' && selectedParent.isSameNode(playlist)) {
                    showLyrics(selected);
                } else if (focused.id === 'forSonglist' && selectedParent.isSameNode(songlist)) {
                    addToPlaylist(selected);
                    selectSong(getPrev(playlist), playlist);
                }
            } else if (!focused && live.innerHTML) {
                changeFocus(live.parentNode);
            }
            break;
        case 'Backspace':
            if (currentLyrics) changeLyrics();
            else if (currentPlaying) {
                selectSong(currentPlaying, playlist);
                showLyrics();
            }
            else {
                selectSong();
                changeFocus();
            }
            break;
        case 'Delete':
            if (focused && focused.id === 'forPlaylist' && selectedParent.isSameNode(playlist)) {
                let next = getNext(playlist, selected);
                if (next.isSameNode(selected)) next = getPrev(playlist, selected);
                if (next.isSameNode(selected)) next = null;
                if (selected.isSameNode(currentPlaying)) showLyrics();
                selected.remove();
                selectSong(next, playlist);
                if (!selected) changeFocus();
                savePlaylist();
            } else if (focused && focused.id === 'forSonglist' && selectedParent.isSameNode(songlist)) {
                deleteSong(selected);
            }
            break;
        case 'Escape':
            selectSong();
            changeFocus();
            break;
        case 'ArrowDown':
            if (focused) {
                if (focused.id === 'forLive') {
                    if (currentPlaying) changeLyrics(getNext(live, currentPlayingLyrics));
                } else if (focused.id === 'forSonglist') {
                    selectSong(getNext(songlist, selected), songlist);
                } else if (focused.id === 'forPlaylist') {
                    selectSong(getNext(playlist, selected), playlist);
                }
            }
            break;
        case 'ArrowUp':
            if (focused) {
                if (focused.id === 'forLive') {
                    if (currentPlaying) changeLyrics(getPrev(live, currentPlayingLyrics));
                } else if (focused.id === 'forSonglist') {
                    selectSong(getPrev(songlist, selected), songlist);
                } else if (focused.id === 'forPlaylist') {
                    selectSong(getPrev(playlist, selected), playlist);
                }
            }
            break;
        case 'ArrowRight':
        case 'PageDown':
            showLyrics(getNext(playlist, currentPlaying));
            break;
        case 'ArrowLeft':
        case 'PageUp':
            showLyrics(getPrev(playlist, currentPlaying));
            break;
        default:
            if (e.ctrlKey || e.metaKey) {
                if (e.key.toLowerCase() === 's') {
                    save();
                    break;
                } else if (e.key.toLowerCase() === 'o' && selected) {
                    openEditor();
                    break;
                } else if (e.key.toLowerCase() === 'n') {
                    newSong();
                    break;
                }
            }
            let item = document.getElementById(`live-${e.key.toUpperCase()}`);
            if (item) {
                changeLyrics(item);
            }
    }
}

ipcRenderer.on('top', (event, key) => {
    let e = {preventDefault:function(){}};
    if (key in allowedTop || key.length === 1) {
        e.key = key;
        keyControl(e);
    }
});