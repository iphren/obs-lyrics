for (let list of document.getElementsByClassName('select')) {
    list.ondblclick = play;
    list.onclick = selected;
}

function play(e) {
    let list = e.target, item = undefined;
    while (list && !item && !list.classList.contains('select')) {
        if (list.classList.contains('option')) item = list;
        list = list.parentNode;
    }
    if (item) {
        console.log(item);
    }
}

function selected(e) {
    let list = e.target, item = undefined;
    while (list && !list.classList.contains('select')) {
        if (list.classList.contains('option')) item = list;
        list = list.parentNode;
    }
    for (let o of songlist.childNodes) {
        o.classList.remove('selected');
    }
    for (let o of playlist.childNodes) {
        o.classList.remove('selected');
    }
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
}