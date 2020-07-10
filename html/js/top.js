const remote = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;

const app = remote.app;
const path = document.getElementById('path');
const hide = document.getElementById('hide');
const title = document.getElementById('title');
const info = document.getElementById('info');
document.getElementById('liveFrame').src = app.html;
document.getElementById('pin').onmouseup = function() {
    ipcRenderer.send('toggleTop', false);
}

path.value = app.html.replace(/\\/g,'/');
path.onfocus = () => path.setSelectionRange(0, path.value.length);

window.addEventListener('keydown', (e) => {
    ipcRenderer.send('top', e.key);
    hide.focus();
}, true);

ipcRenderer.on('time', (event, time) => {
    document.getElementById('time').innerHTML = time;
});

ipcRenderer.on('title', (event, data) => {
    if (!data.same) {
        title.innerHTML = data.title;
        info.innerHTML = '';
    }
    if (data.highlight) title.classList.add('highlight');
    else title.classList.remove('highlight');
    for (let i of info.childNodes) {
        i.classList.remove('highlight');
    }
    if (data.info) {
        let ind = 0;
        for (let i of data.info) {
            let item = document.createElement('span');
            item.className = ind > 9 ? '' : 'topKey';
            if (!i.style) item.classList.add('alt');
            if (i.highlight) item.classList.add('highlight');
            item.id = `live-${i.key}`;
            item.innerHTML = ind > 9 ? '&bull;' : i.key;
            info.appendChild(item);
            ind++;
        }
    }
    if (data.key) {
        title.classList.add('highlight');
        document.getElementById(data.key).classList.add('highlight');
    }
});