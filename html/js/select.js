function play(e) {
    e.stopPropagation();
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
        if (node.isSameNode(search)) search.focus();
        else search.blur();
        node.classList.add('focused');
    }
}

function select(e) {
    e.stopPropagation();
    let list = e.target, item = undefined;
    while (list && !list.classList.contains('select')) {
        if (list.classList.contains('option')) item = list;
        list = list.parentNode;
    }
    if (list.getElementsByClassName('result').length !== 0)
        changeFocus(list.parentNode);
    else
        changeFocus();
    switch (list.id) {
        case 'songlist':
        case 'playlist':
            if (item && !(item.classList.contains('selected'))) {
                selectSong(item, list);
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
        if (playlist.getElementsByClassName('result').length !== 0) changeFocus(playlist.parentNode);
        else changeFocus();
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