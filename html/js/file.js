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

function loadSong() {
    return new Promise((resolve, reject) => {
        fs.readFile(app.songs, function(err, data) {
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                reject(err || e);
            }
        });
    });
}

function localSave(song) {
    return new Promise((resolve, reject) => {
        fs.readFile(app.songs, function(err, data) {
            let songs;
            try {
                songs = JSON.parse(data);
            } catch (e) {
                reject(err || e);
                return;
            }
            let id = '';
            let py = myPinyin(song.title);
            for (let i of py) {
                id += i[0].toLowerCase();
            }
            id = id.replace(/[^a-z0-9]/g, '');
            if (!song.id || song.id.length === 0 || id !== /^[a-z0-9]*/.exec(song.id)[0]) {
                let i = 2;
                let newid = id;
                for (let s of songs) {
                    if (newid == s.id) {
                        newid = `${id}-${i}`;
                        i++;
                    }
                }
                song.id = newid;
            }
            if (typeof song.id == 'string' && typeof song.title == 'string' && typeof song.lyrics == 'string' && song.id.length > 0 && song.title.length > 0 && song.lyrics.length > 0) {
                let keywords = '', initials = '';
                let py = myPinyin(`${song.title} ${song.lyrics}`);
                for (let p of py) {
                    let plc = p[0].toLowerCase();
                    keywords += plc.replace(/[^a-z0-9]/g, '');
                    plc.split(/[^a-z0-9]/).forEach(s => {
                        let m = s.match(/[a-z0-9]/);
                        if (m) initials += m[0];
                    });
                }
                song.keywords = song.id + initials + keywords;
                songlist:
                for (let i = 0; i < songs.length; i++) {
                    switch (song.id.localeCompare(songs[i].id)) {
                        case 1:
                            if (i == songs.length - 1) {
                                songs.push(song);
                                break songlist;
                            }
                            break;
                        case -1:
                            songs.splice(i, 0, song);
                            break songlist;
                        case 0:
                            songs[i] = song;
                            break songlist;
                    }
                }
                if (songs.length == 0) songs.push(song);
                fs.writeFile(app.songs, JSON.stringify(songs),() => {
                    resolve({song: song});
                });
            } else {
                reject(Error('invalid song structure'));
            }
        });
    });
}

function localDelete(id) {
    return new Promise((resolve, reject) => {
        fs.readFile(app.songs, function(err, data) {
            let songs;
            try {
                songs = JSON.parse(data);
            } catch (e) {
                reject(err || e);
                return;
            }
            if (id && id.length > 0) {
                let deleted = false;
                for (let i = 0; i < songs.length; i++) {
                    if (songs[i].id === id) {
                        songs.splice(i,1);
                        deleted = true;
                        break;
                    }
                }
                if (deleted) {
                    fs.writeFile(app.songs, JSON.stringify(songs), () => {
                        resolve({deleted: true});
                    })
                } else {
                    reject(Error('deleting: id not found'));
                }
            } else {
                reject(Error('deleting: id not given'));
            }
        });
    });
}