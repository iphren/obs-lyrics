document.body.onmousedown = function () {
    plURL.style.display = 'none';
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
}

clear.onmousedown = function(e) {
    e.stopPropagation();
    search.value = '';
    for (let song of songlist.childNodes) {
        song.classList.add('result');
    }
    notFound.style.visibility = 'hidden';
    search.focus();
}

reloadBtn.onclick = reload;

hideUp.onclick = function() {
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