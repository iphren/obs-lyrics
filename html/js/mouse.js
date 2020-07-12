window.oncontextmenu = function (e) {
    if (!app.isPackaged) {
        remote.getCurrentWindow().inspectElement(e.x, e.y);
    }
}

window.onmousedown = function () {
    plURL.classList.add('none');
    closeInfo();
    changeFocus();
}

send.onmousedown = function(e) {
    e.stopPropagation();
}

for (let list of document.getElementsByClassName('select')) {
    list.ondblclick = play;
    list.onmousedown = select;
}

search.onmousedown = function(e) {
    e.stopPropagation();
    hideUp.classList.contains('active') && toggleHide();
}

clear.onmousedown = clearSearch;

function clearSearch(e = null) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    search.value = '';
    for (let song of songlist.childNodes) {
        song.classList.add('result');
    }
    notFound.classList.add('none');
    search.focus();
}

reloadBtn.onmousedown = function(e) {
    if (!reloadBtn.classList.contains('disabled')) reload(e);
}

newBtn.onmousedown = newSong;

hideUp.onmousedown = toggleHide;

function toggleHide(e = null) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
    closeInfo();
    if (hideUp.classList.contains('disabled')) return;
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

sendBtn.onmousedown = sendPlaylist;

pin.onmousedown = function(e) {
    e.stopPropagation();
    e.preventDefault();
    closeInfo();
    ipcRenderer.send('toggleTop', true);
}

songlist.onmouseover = function(e) {
    songX = e.clientX;
    songY = e.clientY;
}

songlist.onscroll = function(e) {
    clearTimeout(scrollTimer);
    let id = document.elementFromPoint(songX, songY).getAttribute('songId');
    if (id) letter.innerHTML = /^./.exec(id)[0].toUpperCase();
    letter.classList.add('scrolling');
    scrollTimer = setTimeout(() => {
        letter.classList.remove('scrolling');
    }, 1000);
}

editInfo.onmousedown = openInfo;
edit.onmousedown = openEditor;
cancel.onmousedown = closeEditor;
saveBtn.onmousedown = save;

for (let m of document.getElementsByClassName('modal')) {
    m.onmousedown = function(e) {
        e.stopPropagation();
        if (!e.target.classList.contains('modal')) return;
        e.preventDefault();
        let f = false;
        for (let i of e.target.getElementsByTagName('input')) {
            if (document.activeElement.isSameNode(i)) {
                f = true;
                break;
            }
        }
        if (!f) {
            for (let i of e.target.getElementsByTagName('input')) {
                if (!i.readOnly) {
                    f = true;
                    i.focus();
                    break;
                }
            }
            if (!f) e.target.getElementsByTagName('input')[0].focus();
        }
    }
}

askDelete.onmousedown = function(e) {
    e.stopPropagation();
    e.preventDefault();
    typeDelete.focus();
}
cancelDelete.onmousedown = noDelete;

confirmDelete.onmousedown = function(e) {
    e.stopPropagation();
    e.preventDefault();
    if (confirmDelete.classList.contains('disabled') || !confirmDelete.getAttribute('songid')) return;
    onDelete.classList.add('none');
    typeDelete.value = '';
    confirmDelete.classList.add('disabled');
    if (local) {
        localDelete(confirmDelete.getAttribute('songid'))
        .then(() => {
            reload();
        }).catch(e => {
            console.error(e);
        }).finally(() => {
            confirmDelete.setAttribute('songid', '');
        });
    } else {
        post(`https://${address.value}/delete`, {id: confirmDelete.getAttribute('songid'), token: password.value})
        .then(x => {
            if (x.deleted) reload();
        }).catch(xhr => {
            status.value = `Server Response: ${xhr.status} ${xhr.response ? xhr.response.error : 'server not found'}`;
            login.classList.remove('none');
        }).finally(() => {
            confirmDelete.setAttribute('songid', '');
        });
    }
}