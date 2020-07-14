function openEditor(e = null) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    hideUp.classList.contains('active') && toggleHide();
    edit.classList.add('none');
    cancel.classList.remove('none');
    saveBtn.classList.remove('none');
    pTitle.readOnly = false;
    pLyrics.readOnly = false;
    for (let key in savedInfo) {
        document.getElementById(key).readOnly = false;
    }
    reloadBtn.classList.add('disabled');
    clear.classList.add('disabled');
    control.classList.add('disabled');
    hideUp.classList.add('disabled');
    search.classList.add('disabled');
    search.disabled = true;
    changeFocus();
    editorInput();
    pTitle.focus();
}

function closeEditor(e = null, restore = true) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    closeInfo();
    if (restore) {
        pTitle.value = savedTitle;
        pLyrics.value = savedLyrics;
    }
    edit.classList.remove('none');
    cancel.classList.add('none');
    saveBtn.classList.add('none');
    pTitle.readOnly = true;
    pLyrics.readOnly = true;
    for (let key in savedInfo) {
        if (restore) document.getElementById(key).value = savedInfo[key];
        document.getElementById(key).readOnly = true;
    }
    reloadBtn.classList.remove('disabled');
    clear.classList.remove('disabled');
    control.classList.remove('disabled');
    hideUp.classList.remove('disabled');
    search.classList.remove('disabled');
    search.disabled = false;
    editorInput();
    hideUp.focus();
}

function openInfo(e = null) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    songInfo.classList.remove('none');
}

function closeInfo(e = null) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    songInfo.classList.add('none');
}

function editorControl(e) {
    if (e.target.readOnly) return;
    if (e.key === 'Tab') {
        e.stopPropagation();
        e.preventDefault();
        changeFocus();
        if (e.target.isSameNode(pTitle)) pLyrics.focus();
        else pTitle.focus();
        return;
    }
    if (e.key in funcKeys || (e.ctrlKey && e.key in ctrlKeys) || (e.metaKey && e.key in metaKeys)) {
        e.preventDefault();
        return;
    }
    e.stopPropagation();
    if (e.key === 'Escape') {
        closeEditor();
    }
}

function editorInput() {
    let info = false;
    for (let key in savedInfo) {
        if (savedInfo[key] !== document.getElementById(key).value) {
            info = true;
            break;
        }
    }
    if ((info || savedTitle !== pTitle.value || savedLyrics !== pLyrics.value) && pTitle.value && pLyrics.value) {
        saveBtn.classList.remove('disabled');
    } else {
        saveBtn.classList.add('disabled');
    }
}

function save(e = null) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    closeInfo();
    if (saveBtn.classList.contains('disabled')) return;
    let song = {};
    if (selected) {
        song = JSON.parse(selected.getAttribute('value'));
    }
    song.title = pTitle.value;
    song.lyrics = pLyrics.value;
    for (let key in savedInfo) {
        song[key] = document.getElementById(key).value;
    }
    if (!song.id) song.id = '';
    if (local) {
        localSave(song)
        .then(x => {
            closeEditor(null, false);
            reload(null, x.song.id);
        }).catch(x => {
            console.error(x);
        });
    } else {
        post(`https://${address.value}/save`, {song: song, token: password.value, needId: true})
        .then(x => {
            closeEditor(null, false);
            reload(null, x.song.id);
        }).catch(xhr => {
            status.value = `Server Response: ${xhr.status} ${xhr.response ? xhr.response.error : 'server not found'}`;
            login.classList.remove('none');
        });
    }
}

function noDelete(e = null) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    onDelete.classList.add('none');
    typeDelete.value = '';
    confirmDelete.classList.add('disabled');
    confirmDelete.setAttribute('songid', '');
}

function deleteSong(node) {
    let song = JSON.parse(node.getAttribute('value'));
    onDelete.classList.remove('none');
    askDelete.value = `[${song.title}] type 'delete' to continue`;
    typeDelete.value = '';
    confirmDelete.classList.add('disabled');
    confirmDelete.setAttribute('songid', song.id);
    typeDelete.focus();
}

function newSong(e = null) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    closeInfo();
    selectSong();
    if (selected) selected.classList.remove('selected');
    selected = null;
    savedTitle = pTitle.value = '';
    savedLyrics = pLyrics.value = '';
    openEditor();
}