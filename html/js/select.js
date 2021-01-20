function play(e) {
    e.stopPropagation();
    if (control.classList.contains('disabled')) return;
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

function selectSlide(path) {
    if (!path) {
        path = '';
        currentSlideViewImg.classList.remove('none');
        currentSlideBackImg.classList.add('none');
        currentSlideViewVideo.classList.add('none');
        currentSlideBackVideo.classList.add('none');
        currentSlideViewImg.src = path;
    } else if (videoTypes.test(path)) {
        currentSlideViewImg.classList.add('none');
        currentSlideBackImg.classList.add('none');
        currentSlideViewVideo.classList.remove('none');
        currentSlideBackVideo.classList.remove('none');
        currentSlideViewVideo.src = path;
        currentSlideBackVideo.src = path;
    } else {
        currentSlideViewImg.classList.remove('none');
        currentSlideBackImg.classList.remove('none');
        currentSlideViewVideo.classList.add('none');
        currentSlideBackVideo.classList.add('none');
        currentSlideViewImg.src = path;
        currentSlideBackImg.src = path;
    }
    selectedSlide = path;
    for (let el of document.getElementsByClassName('slideBox')) {
        let p = unescape(el.getAttribute('data-file'));
        if (p && p === path) el.classList.add('active');
        else el.classList.remove('active'); 
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
    if (search.isSameNode(node)) search.focus();
    else search.blur();
    if (node) {
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
    if (!item || list.id === 'live') closeInfo();
    switch (list.id) {
        case 'songlist':
        case 'playlist':
            if (control.classList.contains('disabled')) return;
            if (list.getElementsByClassName('result').length !== 0) changeFocus(list.parentNode);
            else changeFocus();
            if (item && !(item.classList.contains('selected'))) {
                selectSong(item, list);
            }
            break;
        case 'live':
            if (list.getElementsByClassName('result').length !== 0) changeFocus(list.parentNode);
            else changeFocus();
            if (item && !(item.classList.contains('selected'))) {
                changeLyrics(item);
            }
            break;
    }
}

function selectSong(item = null, parent = null) {
    if (control.classList.contains('disabled')) return;
    if (selected) selected.classList.remove('selected');
    selected = item;
    if (item) {
        selectSlide(app.configs[`slide-for-${selected.getAttribute('songid')}`]);
        selectedParent = parent;
        if (item.offsetTop < parent.scrollTop) {
            parent.scrollTop = item.offsetTop;
            letter.innerHTML = /^./.exec(item.getAttribute('songId'))[0].toUpperCase();
        } else if (item.offsetTop + item.clientHeight > parent.scrollTop + parent.clientHeight) {
            parent.scrollTop = item.offsetTop + item.clientHeight - parent.clientHeight;
            letter.innerHTML = /^./.exec(item.getAttribute('songId'))[0].toUpperCase();
        }
        item.classList.add('selected');
        if (item.classList.contains('preview')) {
            let song = JSON.parse(item.getAttribute('value'));
            slidesFooter.innerHTML = song.title;
            if (currentPlaying
                && currentPlaying.getAttribute('songId') === item.getAttribute('songId'))
                slidesFooter.classList.add('live');
            else slidesFooter.classList.remove('live');
            savedTitle = pTitle.value = song.title;
            savedLyrics = pLyrics.value = song.lyrics;
            for (let key in savedInfo) {
                savedInfo[key] = document.getElementById(key).value = key in song ? song[key] : '';
            }
        }
    } else {
        selectSlide(app.configs['default-slide']);
        slidesFooter.innerHTML = 'Default';
        if (!currentPlaying
            || !app.configs[`slide-for-${currentPlaying.getAttribute('songid')}`])
            slidesFooter.classList.add('live');
        else slidesFooter.classList.remove('live');
        savedTitle = pTitle.value = '';
        savedLyrics = pLyrics.value = '';
        for (let key in savedInfo) {
            savedInfo[key] = document.getElementById(key).value = '';
        }
    }
}

function showLyrics(item = null) {
    if (!item || !app.configs[`slide-for-${item.getAttribute('songid')}`]) {
        let p = app.configs['default-slide'];
        ipcRenderer.send('changeBackground', p);
        if (selected) slidesFooter.classList.remove('live');
        else slidesFooter.classList.add('live');
    } else {
        let iid = item.getAttribute('songid');
        ipcRenderer.send('changeBackground', app.configs[`slide-for-${iid}`]);
        if (selected && selected.getAttribute('songid') === iid) slidesFooter.classList.add('live');
        else slidesFooter.classList.remove('live');
    }
    hide.focus();
    currentPlayingLyrics = null;
    currentPlaying = item;
    for (let o of playlist.childNodes)
        o.classList.remove('playing');
    if (!item) {
        if (playlist.getElementsByClassName('result').length !== 0) changeFocus(playlist.parentNode);
        else changeFocus();
        live.innerHTML = '';
        ipcRenderer.send('title', {title: ''});
        return;
    }
    changeFocus(live.parentNode);
    if (item.offsetTop < playlist.scrollTop)
        playlist.scrollTop = item.offsetTop;
    else if (item.offsetTop + item.clientHeight > playlist.scrollTop + playlist.clientHeight)
        playlist.scrollTop = item.offsetTop + item.clientHeight - playlist.clientHeight;
    let highlight = item.classList.contains('showing');
    let data = JSON.parse(item.getAttribute('value'));
    let lyrics = data.lyrics.split('\n\n');
    item.classList.add('playing');
    let step = 2;
    live.innerHTML = '';
    let m = 0;
    let style = true;
    let info = [];
    for (let i of lyrics) {
        let j = i.split('\n');
        for (let k = 0; k < j.length; k += step) {
            let lyricsList = [];
            for (let l = k; l < Math.min(j.length, k + step); l++) {
                lyricsList.push(j[l]);
            }
            key = keyMap[m];
            let a = addLyrics(lyricsList, key, style, highlight);
            info.push({key: key, style: style, highlight: a});
            m++;
        }
        style = !style;
    }
    ipcRenderer.send('title', {title: data.title, highlight: highlight, info: info});
}

function addLyrics(lyricsList, key, style, highlight) {
    let item = document.createElement('div');
    let hlKey = false;
    item.className = `option result${style ? '' : ' alt'}`;
    if (highlight && currentLyrics === JSON.stringify(lyricsList)) {
        currentPlayingLyrics = item;
        item.classList.add('selected');
        hlKey = true;
    }
    item.setAttribute('value', JSON.stringify(lyricsList));
    item.id = `live-${key}`;
    item.innerHTML = `<span class="key">${key}</span>` + lyricsList.join('<br>');
    live.appendChild(item);
    return hlKey;
}

function changeLyrics(item = null) {
    hide.focus();
    currentPlayingLyrics = item;
    for (let o of live.childNodes)
        o.classList.remove('selected');
    for (let o of playlist.childNodes)
        o.classList.remove('showing');
    ipcRenderer.send('title', {same: true, key: item ? item.id : null});
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

function toggleShow() {
    if (slideBtn.classList.contains('active')) {
        ipcRenderer.send('endShow');
    } else {
        ipcRenderer.send('startShow');
    }
}

ipcRenderer.on('showStarted', () => {
    slideBtn.classList.add('active');
    slideBtn.innerHTML = 'End Show';
    sizesBtn.classList.remove('none');
});

ipcRenderer.on('showEnded', () => {
    slideBtn.classList.remove('active');
    slideBtn.innerHTML = 'Slide Show';
    sizesBtn.classList.add('none');
});

ipcRenderer.on('showFullScreen', (event, full) => {
    if (full) {
        sizesBtn.innerHTML = 'Window';
    } else {
        sizesBtn.innerHTML = 'Fullscreen';
    }
});

function update(lyricsList) {
    let fineList = [];
    let separator = /\s*,\s*|\s*\.\s*|(?<=[^A-Za-z])\s+(?=[^A-Za-z])/;
    separator = /\s*,\s*|\s*\.\s*|\s+/;
    for (let l of lyricsList) {
        let line = [];
        for (let phrase of l.split(separator)) {
            line.push({text: phrase});
        }
        fineList.push(line);
    }
    ipcRenderer.send('changeLyrics', fineList);
    ipcRenderer.send('lyrics', lyricsList.join('<br>'));
};