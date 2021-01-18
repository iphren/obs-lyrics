path.onfocus = () => path.setSelectionRange(0, path.value.length);

search.onfocus = function() {
    changeFocus(search);
}

search.onblur = () => search.classList.remove('focused');

ipcRenderer.on('focused', (event, focused) => {
    if (focused) {
        webApp.classList.remove('blurred');
        blurred.classList.add('none');
    } else {
        webApp.classList.add('blurred');
        blurred.classList.remove('none');
    }
});