async function reload() {
    loading.classList.remove('none');
    search.disabled = true;
    status.value = 'Loading...';
    clearSearch();
    let songs = await post(`https://${address.value}/lyrics`, {token: password.value})
    .then(x => {
        status.value = `Server Connected`;
        login.classList.add('none');
        fs.writeFile(app.token, JSON.stringify({url: address.value, token: password.value}), ()=>{});
        return x;
    })
    .catch(() => {
        status.value = `Server Response: ${xhr.status} ${xhr.response ? xhr.response.error : 'server not found'}`;
        login.classList.remove('none');
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
    setTimeout(function(){
        loading.classList.add('none');
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
    if (!currentPlaying) changeFocus();
}

function addSong(song, list) {
    let item = document.createElement('div');
    let title = document.createElement('div');
    let lyrics = document.createElement('div');

    item.className = 'song preview';
    if (song.id === '_filter') item.classList.add('filter');
    else {
        item.classList.add('option', 'result');
    }
    item.setAttribute('keywords', song.keywords);
    item.setAttribute('songId', song.id);
    item.setAttribute('value', JSON.stringify(song));

    title.className = 'title';
    title.innerHTML = song.title;
    lyrics.className = 'lyrics';
    lyrics.innerHTML = song.lyrics.replace('\n', ' ');

    item.appendChild(title);
    item.appendChild(lyrics);
    list.appendChild(item);
    return item;
}