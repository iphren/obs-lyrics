const remote = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;

const app = remote.app;
const path = document.getElementById('path');
const hide = document.getElementById('hide');
const title = document.getElementById('title');

document.getElementById('liveFrame').src = app.html;
path.value = app.html.replace(/\\/g,'/');
path.onfocus = () => path.setSelectionRange(0, path.value.length);

window.addEventListener('keyup', (e) => {
    ipcRenderer.send('top', e.key);
    hide.focus();
}, true);

ipcRenderer.on('title', (event, data) => {
    if (!data.same) title.innerHTML = data.title;
    if (data.highlight) title.classList.add('highlight');
    else title.classList.remove('highlight');
});