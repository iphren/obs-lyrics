document.title = app.getName();
ipcRenderer.on('update', function(event, text) {
    document.title = text === 'latest version' ? app.getName() : `${app.getName()} - ${text}`;
});