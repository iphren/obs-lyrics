window.oncontextmenu = function (e) {
    remote.getCurrentWindow().inspectElement(e.x, e.y);
}

window.onmousedown = function () {
    plURL.classList.add('none');
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

reloadBtn.onmousedown = reload;

hideUp.onmousedown = toggleHide;

function toggleHide(e = null) {
    if (e) {
        e.stopPropagation();
        e.preventDefault();
    }
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

edit.onmousedown = openEditor;
cancel.onmousedown = closeEditor;
saveBtn.onmousedown = save;

cancelDelete.onmousedown = function(e) {
    e.stopPropagation();
    e.preventDefault();
    onDelete.classList.add('none');
    typeDelete.value = '';
    confirmDelete.classList.add('disabled');
    confirmDelete.setAttribute('songid', '');
}

confirmDelete.onmousedown = function(e) {
    e.stopPropagation();
    e.preventDefault();
    if (confirmDelete.classList.contains('disabled') || !confirmDelete.getAttribute('songid')) return;
    onDelete.classList.add('none');
    typeDelete.value = '';
    confirmDelete.classList.add('disabled');
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