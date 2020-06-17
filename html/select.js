for (let list of document.getElementsByClassName('select')) {
    list.ondblclick = play;
    list.onclick = selecting;
}

var currentLyrics = '';
var currentPlaying = null;
var currentPlayingLyrics = null;
var selected = null;
var selectedParent = null;
var focused = null;
const rotation = [search, songlist.parentNode, playlist.parentNode, live.parentNode];
const keyMap = '1234567890QWERTYUIOPASDFGHJKLZXCVBNM';
function play(e) {
    let list = e.target, item = undefined;
    while (list && !list.classList.contains('select')) {
        if (list.classList.contains('option')) item = list;
        list = list.parentNode;
    }
    if (item) {
        switch (list.id) {
            case 'songlist':
                addToPlaylist(item);
                break;
            case 'playlist':
                showLyrics(item);
                break;
        }
    }
}

function addToPlaylist(item) {
    changeFocus(playlist.parentNode);
    let i = item.cloneNode(true);
    i.classList.remove('selected');
    playlist.appendChild(i);
    savePlaylist();
}

function changeFocus(node = null) {
    if (focused) focused.classList.remove('focused');
    focused = node;
    if (node) {
        focused.classList.add('focused');
        if (node.isSameNode(search)) search.focus();
    }
}

document.body.onclick = function() {
    changeFocus();
}
search.onclick = function(e) {
    e.stopPropagation();
}
function selecting(e) {
    e.stopPropagation();
    let list = e.target, item = undefined;
    while (list && !list.classList.contains('select')) {
        if (list.classList.contains('option')) item = list;
        list = list.parentNode;
    }
    changeFocus(list.parentNode);
    switch (list.id) {
        case 'songlist':
        case 'playlist':
            if (item && !(item.classList.contains('selected'))) {
                selectSong(item, list);
            } else if (!item) {
                selectSong();
            }
            break;
        case 'live':
            if (item && !(item.classList.contains('selected'))) {
                changeLyrics(item);
            }
            break;
    }
}

function selectSong(item = null, parent = null) {
    if (selected) selected.classList.remove('selected');
    selected = item;
    if (item) {
        selectedParent = parent;
        if (item.offsetTop < parent.scrollTop)
            parent.scrollTop = item.offsetTop;
        else if (item.offsetTop + item.clientHeight > parent.scrollTop + parent.clientHeight)
            parent.scrollTop = item.offsetTop + item.clientHeight - parent.clientHeight;
        item.classList.add('selected');
        if (item.classList.contains('preview')) {
            let song = JSON.parse(item.getAttribute('value'));
            pTitle.innerHTML = song.title;
            pLyrics.innerHTML = song.lyrics.replace(/\n/g,'<br>');
        }
    } else {
        pTitle.innerHTML = '';
        pLyrics.innerHTML = '';
    }
}

function showLyrics(item = null) {
    hide.focus();
    currentPlayingLyrics = null;
    currentPlaying = item;
    for (let o of playlist.childNodes)
        o.classList.remove('playing');
    if (!item) {
        live.innerHTML = '';
        return;
    }
    changeFocus(live.parentNode);
    if (item.offsetTop < playlist.scrollTop)
        playlist.scrollTop = item.offsetTop;
    else if (item.offsetTop + item.clientHeight > playlist.scrollTop + playlist.clientHeight)
        playlist.scrollTop = item.offsetTop + item.clientHeight - playlist.clientHeight;
    let lyrics = JSON.parse(item.getAttribute('value')).lyrics.split('\n\n');
    item.classList.add('playing');
    let step = 2;
    live.innerHTML = '';
    let m = 0;
    let style = true;
    let highlight = item.classList.contains('showing');
    for (let i of lyrics) {
        let j = i.split('\n');
        for (let k = 0; k < j.length; k += step) {
            let lyricsList = [];
            for (let l = k; l < Math.min(j.length, k + step); l++) {
                lyricsList.push(j[l]);
            }
            key = keyMap[m];
            addLyrics(lyricsList, key, style, highlight);
            m++;
        }
        style = !style;
    }
}

function addLyrics(lyricsList, key, style, highlight) {
    let item = document.createElement('div');
    item.className = `option result${style ? '' : ' alt'}`;
    if (highlight && currentLyrics === JSON.stringify(lyricsList)) {
        currentPlayingLyrics = item;
        item.classList.add('selected');
    }
    item.setAttribute('value', JSON.stringify(lyricsList));
    item.id = `live-${key}`;
    item.innerHTML = `<span class="key">${key}</span>` + lyricsList.join('<br>');
    live.appendChild(item);
}

function changeLyrics(item = null) {
    hide.focus();
    currentPlayingLyrics = item;
    for (let o of live.childNodes)
        o.classList.remove('selected');
    for (let o of playlist.childNodes)
        o.classList.remove('showing');
    if (item) {
        changeFocus(live.parentNode);
        currentPlaying.classList.add('showing');
        if (item.offsetTop < live.scrollTop)
            live.scrollTop = item.offsetTop;
        else if (item.offsetTop + item.clientHeight > live.scrollTop + live.clientHeight)
            live.scrollTop = item.offsetTop + item.clientHeight - live.clientHeight;
        item.classList.add('selected');
        currentLyrics = item.getAttribute('value');
        let lyricsList = JSON.parse(currentLyrics);
        update(lyricsList);
    } else {
        currentLyrics = '';
        update([]);
    }
}

plURL.addEventListener('keydown', function(e) {
    e.stopPropagation();
    switch (e.key) {
        case 'Enter':
            sendBtn.click();
    }
});
search.onfocus = function() {
    changeFocus(search);
}
search.onblur = function() {
    search.classList.remove('focused');
}
search.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        search.blur();
        return;
    }
    e.stopPropagation();
    switch (e.key) {
        case 'Enter':
            if (!hideUp.classList.contains('active')) {
                changeFocus(songlist.parentNode);
                selectSong(getNext(songlist), songlist);
            } else {
                hideUp.click();
                break;
            }
        case 'Escape':
            search.blur();
            break;
        case 'Backspace':
            if (search.value === '' && !hideUp.classList.contains('active')) {
                hideUp.click();
                search.blur();
            }
            break;
    }
});

window.addEventListener('keydown', keyControl);

ctrlKeys = {r:true, R:true, h:true, H:true, s:true, S:true};
metaKeys = {};
function keyControl(e) {
    if ((e.ctrlKey && !(e.key in ctrlKeys)) || (e.metaKey && !(e.key in metaKeys))) return;
    hide.focus();
    switch (e.key) {
        case 'Tab':
            e.preventDefault();
            let ind = 0;
            if (focused) {
                for (let i = 0; i < rotation.length; i++) {
                    if (rotation[i].isSameNode(focused)) ind = (i + 1) % rotation.length;
                }
            }
            if (rotation[ind].classList.contains('hide')) ind = (ind + 1) % rotation.length;
            changeFocus(rotation[ind]);
            break;
        case '/':
            e.preventDefault();
            clear.click();
            break;
        case 'Enter':
            if (selected && focused) {
                if (focused.id === 'forPlaylist' && selectedParent.isSameNode(playlist)) {
                    showLyrics(selected);
                } else if (focused.id === 'forSonglist' && selectedParent.isSameNode(songlist)) {
                    addToPlaylist(selected);
                    selectSong(getPrev(playlist), playlist);
                }
            } else if (!focused) {
                changeFocus(live.parentNode);
            }
            break;
        case 'Backspace':
            changeLyrics();
            break;
        case 'Delete':
            if (focused && focused.id === 'forPlaylist' && selectedParent.isSameNode(playlist)) {
                let next = getNext(playlist, selected);
                if (next.isSameNode(selected)) next = getPrev(playlist, selected);
                if (next.isSameNode(selected)) next = null;
                if (selected.isSameNode(currentPlaying)) showLyrics();
                selected.remove();
                selectSong(next, playlist);
                savePlaylist();
            }
            break;
        case 'Escape':
            selectSong();
            showLyrics();
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
        case 'PageDown':
            showLyrics(getNext(playlist, currentPlaying));
            break;
        case 'PageUp':
            showLyrics(getPrev(playlist, currentPlaying));
            break;
        case 'F5':
            reload();
            break;
        default:
            if (e.ctrlKey) {
                if (e.key.toLowerCase() === 'r') {
                    reload();
                    break;
                } else if (e.key.toLowerCase() === 'h') {
                    hideUp.click();
                    break;
                } else if (e.key.toLowerCase() === 's' && app.configs.send) {
                    sendBtn.click();
                    break;
                }
            }
            let item = document.getElementById(`live-${e.key.toUpperCase()}`);
            if (item) {
                changeLyrics(item);
            }
    }
}

function getNext(parent, item = null) {
    let list = parent.getElementsByClassName('result');
    let next = 0;
    if (item) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].isSameNode(item)) {
                next = i + 1;
                break;
            }
        }
        if (next === list.length) next--;
    }
    return list[next];
}

function getPrev(parent, item = null) {
    let list = parent.getElementsByClassName('result');
    let prev = list.length - 1;
    if (item) {
        for (let i = 0; i < list.length; i++) {
            if (list[i].isSameNode(item)) {
                prev = i - 1;
                break;
            }
        }
        if (prev === -1) prev++;
    }
    return list[prev];
}

function update(lyricsList) {
    ipcRenderer.send('lyrics', lyricsList.join('<br>'));
};