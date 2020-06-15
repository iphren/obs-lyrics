document.getElementById('reload').onclick = reload;
document.getElementById('liveFrame').src = app.html;
//var plURL = '';

plURL.value = app.set.plURL;
plURL.oninput = function() {
    app.save('plURL',plURL.value);
}

document.body.onmousedown = function () {
    plURL.style.display = 'none';
}
if (app.set.send) send.style.display = 'block';
send.onmousedown = function(e) {
    e.stopPropagation();
}
sendBtn.onclick = function() {
    if (!app.set.plURL) {
        plURL.style.display = 'block';
        return;
    }
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
    xhr.open(method, app.set.plURL, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if(xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                plURL.style.display = 'none';
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
        send.style.display = 'block';
        app.save('send',true);
    }
    let term = '';
    let py = pinyin(e.target.value.replace(/行/g,'形'), {style: pinyin.STYLE_NORMAL});
    for (let p of py) {
        term += p[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    for (let song of songlist.childNodes) {
        if (song.getAttribute('keywords').indexOf(term) > -1)
            song.style.display = 'block';
        else
            song.style.display = 'none';
    }
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
    onClone: e => e.clone.classList.remove('selected'),
    onChange: e => bin.parentNode.style.opacity = 0.5,
    animation: 150
});
new Sortable(playlist, {
    group: 'shared',
    draggable: '.option',
    filter: '.filter',
    onChoose: showBin,
    onUnchoose: hideBin,
    onSort: savePlaylist,
    onChange: e => bin.parentNode.style.opacity = 0.5,
    animation: 150
});
new Sortable(bin, {
    group: 'shared',
    draggable: '.option',
    onChange: e => bin.parentNode.style.opacity = 1,
    onAdd: e => {if (e.item.classList.contains('playing')) currentPlaying = null;e.item.remove()}
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
    let selected = null, playing = null;
    for (let i of playlist.childNodes) {
        if (i.classList.contains('selected'))
            selected = i;
        if (i.classList.contains('playing'))
            playing = i;
    }
    selectSong(selected)
    showLyrics(playing);
    search.value = '';
}

function addSong(song, list) {
    let item = document.createElement('div');
    let title = document.createElement('div');
    let lyrics = document.createElement('div');

    if (song.id == '_filter')
        item.className = 'filter song preview';
    else
        item.className = 'song option preview';
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