document.body.onmousedown = function () {
    plURL.classList.add('none');
    changeFocus();
}

send.onmousedown = function(e) {
    e.stopPropagation();
    e.preventDefault();
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