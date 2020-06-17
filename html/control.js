liveFrame.src = app.html;
clear.onclick = function() {
    search.value = '';
    for (let song of songlist.childNodes) {
        song.classList.add('result');
    }
    notFound.style.visibility = 'hidden';
    search.focus();
}
hideUp.onclick = function() {
    let act = hideUp.classList.contains('active');
    if (act)
        hideUp.classList.remove('active');
    else
        hideUp.classList.add('active');
    for (let c of document.getElementsByClassName('container')) {
        if (c.nextElementSibling) {
            if (act)
                c.classList.remove('hide');
            else {
                c.classList.add('hide');
                c.classList.remove('focused');
            }
        }
    }
}

if (app.configs.plURL) plURL.value = app.configs.plURL;
plURL.oninput = function() {
    app.save('plURL',plURL.value);
}

document.body.onmousedown = function () {
    plURL.style.display = 'none';
}
if (app.configs.send) send.style.display = 'inline-block';
send.onmousedown = function(e) {
    e.stopPropagation();
}
sendBtn.onclick = function() {
    if (!app.configs.plURL || !plURL.value) {
        plURL.style.display = 'block';
        plURL.focus();
        return;
    }
    app.save('plURL',plURL.value);
    let pl = [];
    for (let o of playlist.childNodes) {
        let v = o.getAttribute('value');
        if (v) {
            v = JSON.parse(v);
            if (v.title && !(pl.includes(v.title))) pl.push(v.title);
        }
    }
    let xhr = new XMLHttpRequest();
    let method = 'POST';
    xhr.open(method, app.configs.plURL, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if(xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                plURL.style.display = 'none';
                sendBtn.classList.add('success');
                setTimeout(function(){
                    sendBtn.classList.remove('success');
                },1000);
            } else {
                plURL.style.display = 'block';
            }
        }
    }
    xhr.send(JSON.stringify({playlist: pl, token: token}));
}

search.oninput = function(e) {
    if (e.target.value === 'whosyourdaddy') app.thisWin.webContents.openDevTools();
    else if (e.target.value === 'thereisnospoon') {
        send.style.display = 'inline-block';
        app.save('send',true);
    }
    let term = '';
    let py = pinyin(e.target.value.replace(/行/g,'形'), {style: pinyin.STYLE_NORMAL});
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
    notFound.style.visibility = found ? 'hidden' : 'visible';
    if (hideUp.classList.contains('active')) hideUp.click();
}

path.value = app.html.replace(/\\/g,'/');
path.onfocus = () => path.setSelectionRange(0, path.value.length);

addSong({id: '_filter',title: '',lyrics: ''}, playlist);
fs.readFile(app.playlist, function(err, data) {
    if (!err) {
        let list = JSON.parse(data);
        for (let i of list) {
            let item = JSON.parse(i);
            if (item.id != '_filter')
                addSong(JSON.parse(i), playlist);
        }
    }
});

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

function savePlaylist() {
    let list = [];
    for (let i of playlist.childNodes)
        list.push(i.getAttribute('value'));
    fs.writeFile(app.playlist,JSON.stringify(list),()=>{});
}

var showSongs;
async function reload() {
    let songs = await getLyrics()
    .then(x => {
        login.style.display = 'none';
        fs.writeFile(app.token, JSON.stringify({url: url, token: token}), ()=>{});
        return x;
    })
    .catch(() => {
        login.style.display = 'flex';
        return [];
    });
    songlist.style.opacity = 0;
    songlist.innerHTML = '';
    for (let song of songs) {
        let item = addSong(song, songlist);
        for (let i of playlist.childNodes) {
            if (i.getAttribute('songId') == song.id) {
                let node = item.cloneNode(true);
                node.className = i.className;
                playlist.replaceChild(node, i);
            }
        }
    }
    clearTimeout(showSongs);
    showSongs = setTimeout(function(){
        for (let song of songlist.childNodes) {
            song.classList.add('result');
        }
        songlist.style.opacity = 1;
        search.disabled = false;
    },1000);
    let sel = null, pla = null;
    for (let i of playlist.childNodes) {
        if (i.classList.contains('selected'))
            sel = i;
        if (i.classList.contains('playing'))
            pla = i;
    }
    selectSong(sel, playlist);
    showLyrics(pla);
    search.disabled = true;
    search.value = '';
    notFound.style.visibility = 'hidden';
}

function addSong(song, list) {
    let item = document.createElement('div');
    let title = document.createElement('div');
    let lyrics = document.createElement('div');

    item.className = 'song preview';
    if (song.id === '_filter') item.classList.add('filter');
    else {
        item.classList.add('option');
        if (list.id === 'playlist') item.classList.add('result');
    }
    item.setAttribute('keywords', song.keywords);
    item.setAttribute('songId', song.id);
    item.setAttribute('value', JSON.stringify(song));

    title.className = 'title';
    title.innerHTML = escapeHtml(song.title);
    lyrics.className = 'lyrics';
    lyrics.innerHTML = escapeHtml(song.lyrics).replace('\n', ' ');

    item.appendChild(title);
    item.appendChild(lyrics);
    list.appendChild(item);
    return item;
}

function getLyrics() {
    status.value = 'Loading...';
    let xhr = new XMLHttpRequest();
    let method = 'POST';
    let u = `https://${url}/lyrics`;
    xhr.open(method, u, true);
    xhr.responseType = 'json';
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
            if(xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    status.value = `Server Connected`;
                    resolve(xhr.response);
                } else {
                    status.value = `Server Response: ${xhr.status} ${xhr.response ? xhr.response.error : 'server not found'}`;
                    reject();
                }
            }
        }
        xhr.send(JSON.stringify({token: token}));
    });
}

function escapeHtml(text) {
    return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}