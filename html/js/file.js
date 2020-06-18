function loadToken() {
    fs.readFile(app.token, {encoding: 'utf-8'}, (err, data) => {
        if (!err) {
            let json = JSON.parse(data);
            address.value = json.url;
            password.value = json.token;
            reload();
        } else {
            login.classList.remove('none');
        }
    });
}

function loadPlaylist() {
    playlist.innerHTML = '';
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
}

function savePlaylist() {
    let list = [];
    for (let i of playlist.childNodes)
        list.push(i.getAttribute('value'));
    fs.writeFile(app.playlist,JSON.stringify(list),()=>{});
}