for (let list of document.getElementsByClassName('select')) {
    list.ondblclick = play;
    list.onclick = selected;
}

var currentLyrics = '';
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
                let lyrics = JSON.parse(item.getAttribute('value')).lyrics.split('\n\n');
                let step = 2;
                live.innerHTML = '';
                for (let i of lyrics) {
                    let j = i.split('\n');
                    for (let k = 0; k < j.length; k += step) {
                        let lyricsList = [];
                        for (let l = k; l < Math.min(j.length, k + step); l++) {
                            lyricsList.push(j[l]);
                        }
                        addLyrics(lyricsList);
                    }
                }
                break;
        }
    }
}

function addLyrics(lyricsList) {
    let item = document.createElement('div');
    item.className = 'option';
    if (currentLyrics == JSON.stringify(lyricsList))
        item.classList.add('selected');
    item.setAttribute('value', JSON.stringify(lyricsList));
    item.innerHTML = lyricsList.join('<br>');
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
            for (let o of songlist.childNodes)
                o.classList.remove('selected');
            for (let o of playlist.childNodes)
                o.classList.remove('selected');
            if (item) {
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
            break;
        case 'live':
            if (item && !item.classList.contains('selected')) {
                for (let o of live.childNodes)
                    o.classList.remove('selected');
                item.classList.add('selected');
                currentLyrics = item.getAttribute('value');
                let lyricsList = JSON.parse(currentLyrics);
                update(lyricsList);
            } else {
                for (let o of live.childNodes)
                    o.classList.remove('selected');
                if (item) item.classList.remove('selected');
                currentLyrics = '';
                update([]);
            }
            break;
    }
}

function update(lyricsList) {
    let xhr = new XMLHttpRequest();
    let url = 'http://localhost:56733/';
    let method = 'POST';
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({line: lyricsList}));
};
