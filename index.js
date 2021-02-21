const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const electron = require('electron');
const { autoUpdater } = require("electron-updater");
const path = require('path');
const fs = require('fs');

const appData = path.join(app.getPath('appData'), app.getName());
app.appData = appData;
app.settings = path.join(appData, 'settings.json');
app.playlist = path.join(appData, 'playlist.json');
app.token = path.join(appData, 'token.json');
app.songs = path.join(appData, 'songs.json');
app.basejs = path.join(app.getAppPath(), 'html/js/custom.js');
app.customjs = path.join(appData, 'custom.txt');
fs.mkdirSync(appData, { recursive: true });
if (!fs.existsSync(app.songs)) fs.writeFileSync(app.songs,'[]');

app.html = 'http://127.0.0.1:56733';

try {
  app.configs = JSON.parse(fs.readFileSync(app.settings));
} catch (e) {
  app.configs = {rec: {width: 800, height: 600}}
}

let win, top, stats, slideShow;
let showTop = false;
let maxSlide = true;

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
  win.loadFile('html/index.html');
  win.setMenu(null);
  if (!app.isPackaged) {
    win.webContents.openDevTools();
    win.setBounds({width: 1500, height: 1000, x: 300, y: 25});
  } else {
    win.setBounds(app.configs.rec);
  }
  win.webContents.focus();

  win.webContents.on('did-finish-load', function(){
    autoUpdater.checkForUpdatesAndNotify();
  });

  win.on('resize', () => {
    if (app.isPackaged) save('rec', win.getBounds());
  });
  win.on('move', () => {
    if (app.isPackaged) save('rec', win.getBounds());
  });
  win.on('maximize', () => {
    if (app.isPackaged) save('maximize', true);
  });
  win.on('unmaximize', () => {
    if (app.isPackaged) save('maximize', false);
  });

  stats = new BrowserWindow({
    width: 1280,
    height: 720,
    resizable: false,
    frame: false,
    minimizable: false,
    maximizable: false,
    center: true,
    closable: false,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true
    }
  });
  stats.setMenu(null);
  stats.on('blur', () => {
    stats.hide();
    if (!win.isFocused() && showTop) {
      top.show();
      top.focus();
    }
  })

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

  slideShow = new BrowserWindow({
    resizable: false,
    frame: false,
    transparent: true,
    minimizable: false,
    maximizable: false,
    closable: false,
    show: false,
    fullscreen: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  slideShow.loadFile('html/slideShow.html');
  slideShow.setMenu(null);
  if (!app.isPackaged) {
    slideShow.webContents.openDevTools();
  }

  win.on('focus', () => {
    win.webContents.send('focused',true);
    top.hide();
  });
  win.on('blur', () => {
    win.webContents.send('focused',false);
    if (showTop && !stats.isVisible()) {
      top.show();
      top.focus();
    }
  });
  win.on('close', () => {
    stats.destroy();
    top.destroy();
    slideShow.destroy();
  });
  top.on('focus', () => {
    top.setOpacity(1);
  });
  top.on('blur', () => {
    top.setOpacity(0.5);
  });

  win.show();

  fitShow();
  electron.screen.addListener('display-added', fitShow);
  electron.screen.addListener('display-removed', fitShow);
  electron.screen.addListener('display-metrics-changed', fitShow);
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

ipcMain.on('stats', (event) => {
  reloadStats();
});

function reloadStats() {
  fs.readFile(app.token, {encoding: 'utf-8'}, (err, data) => {
    if (!err) {
      let json = JSON.parse(data);
      if (!json.stats) {
        win.webContents.send('stats');
      }
      stats.loadURL(`https://${json.stats}`, {
        extraHeaders: `appidentifier: ${json.token}`
      }).then(() => {
        if (json.stats.length > 0 && !stats.isVisible()) stats.show();
      }).catch(() => {
        win.webContents.send('stats');
      });
    }
  });
}

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

ipcMain.on('endShow', () => {
  slideShow.hide();
  win.webContents.send('showEnded');
  win.focus();
});

ipcMain.on('startShow', () => {
  slideShow.show();
  win.webContents.send('showStarted');
});

ipcMain.on('maxShow', () => {
  maxSlide = true;
  var electronScreen = electron.screen;
  var bounds = slideShow.getBounds();
  var display = electronScreen.getDisplayNearestPoint({x: bounds.x, y: bounds.y});
  slideShow.setBounds(display.bounds);
  win.webContents.send('showFullScreen', true);
  slideShow.webContents.send('showFullScreen', true);
});

ipcMain.on('minShow', () => {
  maxSlide = false;
  var electronScreen = electron.screen;
  var bounds = slideShow.getBounds();
  var display = electronScreen.getDisplayNearestPoint({x: bounds.x, y: bounds.y});
  bounds = display.bounds;
  bounds.x = bounds.x + bounds.width / 4;
  bounds.y = bounds.y + bounds.height / 4;
  bounds.width = bounds.width / 2;
  bounds.height = bounds.height / 2;
  slideShow.setBounds(bounds);
  win.webContents.send('showFullScreen', false);
  slideShow.webContents.send('showFullScreen', false);
});

ipcMain.on('changeBackground', (event, link) => {
  slideShow.webContents.send('changeBackground', link);
});

ipcMain.on('changeLyrics', (event, list) => {
  slideShow.webContents.send('changeLyrics', list);
});

function fitShow() {
  if (!maxSlide) return;
  var electronScreen = electron.screen;
  var displays = electronScreen.getAllDisplays();
  var externalDisplay = displays[0];
  for (var i in displays) {
    if (displays[i].bounds.x != 0 || displays[i].bounds.y != 0) {
      externalDisplay = displays[i];
      break;
    }
  }
  slideShow.setBounds(externalDisplay.bounds);
}






const express = require('express');
const exp = express();
const http = require('http').createServer(exp);
const io = require('socket.io')(http);

exp.use(express.json({limit: '5mb'}));

var lyrics = '';
var lineStyle = app.configs.lineStyle || 0;
ipcMain.on('lyrics', (event, arg) => {
  lyrics = arg;
  io.emit('lyrics', lyrics);
});

ipcMain.on('lineStyle', (event, arg) => {
  lineStyle = arg;
  io.emit('lineStyle', lineStyle);
  save('lineStyle', lineStyle);
});

io.on('connection', (socket) => {
  socket.emit('lyrics', lyrics);
  socket.emit('lineStyle', lineStyle);
});

exp.use(express.static(path.join(app.getAppPath(), 'node_modules/jquery/dist')));

exp.get('/',(req, res) => {
  res.sendFile(path.join(app.getAppPath(), 'html', 'line.html'));
});


exp.get('/custom.js',(req, res) => {
  res.sendFile(app.customjs);
});

exp.post('/custom.js',(req, res) => {
  fs.writeFile(app.customjs + '.tmp', req.body.code, () => {
    res.end();
  });
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