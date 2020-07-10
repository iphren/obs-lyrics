const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { autoUpdater } = require("electron-updater");
const path = require('path');
const fs = require('fs');

const appData = path.join(app.getPath('appData'), app.getName());
app.settings = path.join(appData, 'settings.json');
app.playlist = path.join(appData, 'playlist.json');
app.token = path.join(appData, 'token.json');
fs.mkdirSync(appData, { recursive: true });

app.html = 'http://127.0.0.1:56733';

try {
  app.configs = JSON.parse(fs.readFileSync(app.settings));
} catch (e) {
  app.configs = {rec: {width: 800, height: 600}}
}

let win, top;
let showTop = false;

autoUpdater.on('checking-for-update', () => {
  win.webContents.send('update', 'checking for update...');
});
autoUpdater.on('update-available', (info) => {
  win.webContents.send('update', 'update available');
});
autoUpdater.on('update-not-available', (info) => {
  win.webContents.send('update', 'latest version');
});
autoUpdater.on('error', (err) => {
  win.webContents.send('update', err.toString());
});
autoUpdater.on('download-progress', (progressObj) => {
  win.webContents.send('update', `downloading update ${Math.round(progressObj.percent)}%`);
});
autoUpdater.on('update-downloaded', (info) => {
  win.webContents.send('update', 'install update on exit');
});

function createWindow () {
  win = new BrowserWindow({
    width: app.configs.rec.width,
    height: app.configs.rec.height,
    minWidth: 800,
    minHeight: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  try {win.setBounds(app.configs.rec)} catch (e) {}
  app.configs.rec = win.getBounds();
  win.loadFile('html/index.html');
  win.setMenu(null);
  if (!app.isPackaged) win.webContents.openDevTools();
  win.webContents.focus();

  win.webContents.on('did-finish-load', function(){
    autoUpdater.checkForUpdatesAndNotify();
  });

  win.on('resize', () => {
    save('rec', win.getBounds());
  });
  win.on('move', () => {
    save('rec', win.getBounds());
  });
  win.on('maximize', () => {
    save('maximize', true);
  });
  win.on('unmaximize', () => {
    save('maximize', false);
  });

  top = new BrowserWindow({
    width: 466,
    height: 120,
    x: 150,
    y: 150,
    resizable: false,
    frame: false,
    transparent: true,
    minimizable: false,
    maximizable: false,
    closable: false,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  top.setAlwaysOnTop(true, "pop-up-menu");
  top.loadFile('html/top.html');
  top.setMenu(null);
  if (!app.isPackaged) {
    //top.webContents.openDevTools();
    //top.setSize(800,600);
  }

  win.on('focus', () => {
    top.hide();
  });
  win.on('blur', () => {
    if (showTop) {
      top.show();
      top.focus();
    }
  });
  win.on('close', () => {
    top.destroy();
  });
  top.on('focus', () => {
    top.setOpacity(1);
  });
  top.on('blur', () => {
    top.setOpacity(0.5);
  });

  win.show();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function save(key, value)  {
  app.configs[key] = value;
  try {
    var content = JSON.stringify(app.configs);
  } catch (e) {
    return false;
  }
  var stream = fs.createWriteStream(app.settings);
  stream.end(content);
  return true;
}
app.save = save;

ipcMain.on('top', (event, key) => {
  if (key === '/') win.focus();
  win.webContents.send('top', key);
});

ipcMain.on('title', (event, data) => {
  top.webContents.send('title', data);
});

ipcMain.on('toggleTop', (event, st) => {
  showTop = st;
  if (showTop) top.show();
  else top.hide();
  win.webContents.send('toggleTop', showTop);
});

ipcMain.on('time', (event, time) => {
  top.webContents.send('time', time);
});





const express = require('express');
const exp = express();
const http = require('http').createServer(exp);
const io = require('socket.io')(http);

var lyrics = '';
ipcMain.on('lyrics', (event, arg) => {
  lyrics = arg;
  io.emit('lyrics', lyrics);
});

io.on('connection', (socket) => {
  socket.emit('lyrics', lyrics);
});

exp.use(express.static(path.join(app.getAppPath(), 'node_modules/jquery/dist')));

exp.get('/',(req, res) => {
  res.sendFile(path.join(app.getAppPath(), 'html', 'line.html'));
});

http.on('error', error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  switch (error.code) {
    case 'EADDRINUSE':
      dialog.showErrorBox('Error','port 56733 in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});
http.listen(56733,'localhost');