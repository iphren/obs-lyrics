for (let list of document.getElementsByClassName('select')) {
    list.ondblclick = play;
    list.onclick = selected;
}

var currentLyrics = '';
var currentPlaying = null;
var currentPlayingLyrics = null;
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
                let i = item.cloneNode(true);
                playlist.appendChild(i);
                item.classList.remove('selected');
                savePlaylist();
                break;
            case 'playlist':
                showLyrics(item);
                break;
        }
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
    if (item.offsetTop < playlist.scrollTop)
        playlist.scrollTop = item.offsetTop;
    else if (item.offsetTop + item.clientHeight > playlist.scrollTop + playlist.clientHeight)
        playlist.scrollTop = item.offsetTop + item.clientHeight - playlist.clientHeight;
    let lyrics = JSON.parse(item.getAttribute('value')).lyrics.split('\n\n');
    item.classList.add('playing');
    let step = 2;
    live.innerHTML = '';
    let m = 0;
    for (let i of lyrics) {
        let j = i.split('\n');
        for (let k = 0; k < j.length; k += step) {
            let lyricsList = [];
            for (let l = k; l < Math.min(j.length, k + step); l++) {
                lyricsList.push(j[l]);
            }
            key = keyMap[m];
            addLyrics(lyricsList, key);
            m++;
        }
    }
}

function addLyrics(lyricsList, key) {
    let item = document.createElement('div');
    item.className = 'option';
    if (currentLyrics == JSON.stringify(lyricsList)) {
        currentPlayingLyrics = item;
        item.classList.add('selected');
    }
    item.setAttribute('value', JSON.stringify(lyricsList));
    item.id = `live-${key}`;
    item.innerHTML = `<span class="key">${key}</span>` + lyricsList.join('<br>');
    live.appendChild(item);
}

function selected(e) {
    let list = e.target, item = undefined;
    while (list && !list.classList.contains('select')) {
        if (list.classList.contains('option')) item = list;
        list = list.parentNode;
    }
    switch (list.id) {
        case 'songlist':
        case 'playlist':
            if (item && !(item.classList.contains('selected'))) {
                selectSong(item);
            } else {
                selectSong();
            }
            break;
        case 'live':
            if (item && !(item.classList.contains('selected'))) {
                changeLyrics(item);
            } else {
                changeLyrics();
            }
            break;
    }
}

function selectSong(item = null) {
    for (let o of songlist.childNodes)
        o.classList.remove('selected');
    for (let o of playlist.childNodes)
        o.classList.remove('selected');
    if (item) {
        document.getElementById('preview').parentNode.classList.remove('hide');
        item.classList.add('selected');
        if (item.classList.contains('preview')) {
            let song = JSON.parse(item.getAttribute('value'));
            pTitle.innerHTML = song.title;
            pLyrics.innerHTML = song.lyrics.replace(/\n/g,'<br>');
        }
    } else {
        document.getElementById('preview').parentNode.classList.add('hide');
        pTitle.innerHTML = '';
        pLyrics.innerHTML = '';
    }
}

function changeLyrics(item = null) {
    hide.focus();
    currentPlayingLyrics = item;
    for (let o of live.childNodes)
        o.classList.remove('selected');
    for (let o of playlist.childNodes)
        o.classList.remove('showing');
    if (item) {
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

search.addEventListener('keydown', function(e) {
    e.stopPropagation();
    switch (e.key) {
        case 'Enter':
        case 'Escape':
            search.blur();
            break;
    }
});

window.addEventListener('keydown', keyControl);

function keyControl(e) {
    hide.focus();
    switch (e.key) {
        case '/':
            e.preventDefault();
            search.focus();
            break;
        case 'Delete':
            for (let o of playlist.childNodes) {
                if (o.classList.contains('selected')) {
                    if (o.nextSibling && !(o.nextSibling.classList.contains('filter')))
                        selectSong(o.nextSibling);
                    else if (o.nextSibling && o.nextSibling.nextSibling)
                        selectSong(o.nextSibling.nextSibling);
                    else if (o.previousSibling && !(o.previousSibling.classList.contains('filter')))
                        selectSong(o.previousSibling);
                    else if (o.previousSibling && o.previousSibling.previousSibling)
                        selectSong(o.previousSibling.previousSibling);
                    else
                        selectSong();
                    if (o.classList.contains('playing'))
                        currentPlaying = null;
                    o.remove();
                    savePlaylist();
                    break;
                }
            }
            break;
        case 'Escape':
            showLyrics();
            break;
        case 'Backspace':
            changeLyrics();
            break;
        case 'ArrowDown':
            if (currentPlaying) {
                if (currentPlayingLyrics && currentPlayingLyrics.nextSibling)
                    changeLyrics(currentPlayingLyrics.nextSibling);
                else if (!currentPlayingLyrics)
                    changeLyrics(live.firstChild);
                else
                    changeLyrics(currentPlayingLyrics);
            }
            break;
        case 'ArrowUp':
            if (currentPlaying) {
                if (currentPlayingLyrics && currentPlayingLyrics.previousSibling)
                    changeLyrics(currentPlayingLyrics.previousSibling);
                else if (!currentPlayingLyrics)
                    changeLyrics(live.lastChild);
                else
                    changeLyrics(currentPlayingLyrics);
            }
            break;
        case 'ArrowRight':
        case 'PageDown':
            if (currentPlaying) {
                if (currentPlaying.nextSibling && !(currentPlaying.nextSibling.classList.contains('filter')))
                    showLyrics(currentPlaying.nextSibling);
                else if (currentPlaying.nextSibling && currentPlaying.nextSibling.nextSibling)
                    showLyrics(currentPlaying.nextSibling.nextSibling);
                else
                    showLyrics(currentPlaying);
            } else if (playlist.firstChild) {
                if (!(playlist.firstChild.classList.contains('filter')))
                    showLyrics(playlist.firstChild)
                else if (playlist.firstChild.nextSibling)
                    showLyrics(playlist.firstChild.nextSibling)
            }
            break;
        case 'ArrowLeft':
        case 'PageUp':
            if (currentPlaying) {
                if (currentPlaying.previousSibling && !(currentPlaying.previousSibling.classList.contains('filter')))
                    showLyrics(currentPlaying.previousSibling);
                else if (currentPlaying.previousSibling && currentPlaying.previousSibling.previousSibling)
                    showLyrics(currentPlaying.previousSibling.previousSibling);
                else
                    showLyrics(currentPlaying);
            } else if (playlist.lastChild) {
                if (!(playlist.lastChild.classList.contains('filter')))
                    showLyrics(playlist.lastChild)
                else if (playlist.lastChild.previousSibling)
                    showLyrics(playlist.lastChild.previousSibling)
            }
            break;
        default:
            let item = document.getElementById(`live-${e.key.toUpperCase()}`);
            if (item) {
                changeLyrics(item);
            }
    }
}

function update(lyricsList) {
    let xhr = new XMLHttpRequest();
    let u = 'http://localhost:56733/';
    let method = 'POST';
    xhr.open(method, u, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({line: lyricsList}));
};
