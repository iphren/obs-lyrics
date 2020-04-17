const { ipcRenderer } = require('electron');
const showleft = document.getElementById('showleft');

showleft.checked = app.set.showleft;

document.getElementById('forshowleft').addEventListener('click', function(e) {
    e.preventDefault();
    if (showleft.checked) {
        var offset = - document.getElementById('main').offsetWidth / 2;
        document.getElementById('output').focus();
    } else {
        var offset = document.getElementById('main').offsetWidth;
        document.getElementById('input').focus();   
    };
    showleft.checked = !showleft.checked;
    ipcRenderer.send('resize', offset);
});