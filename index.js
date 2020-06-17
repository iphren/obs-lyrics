const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const appData = path.join(app.getPath('appData'), 'live-lyrics')
app.settings = path.join(appData, 'settings.json')
app.playlist = path.join(appData, 'playlist.json')
app.token = path.join(appData, 'token.json')
fs.mkdirSync(appData, { recursive: true })

app.html = 'http://127.0.0.1:56733'

try {
  app.configs = JSON.parse(fs.readFileSync(app.settings))
  if (app.configs.maximize) {
    delete app.configs.maximize
    app.configs.rec = {width: 800, height: 600}
  }
} catch (e) {
  app.configs = {rec: {width: 800, height: 600}}
}



function createWindow () {
  const win = new BrowserWindow({
    width: app.configs.rec.width,
    height: app.configs.rec.height,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  try {win.setBounds(app.configs.rec)} catch (e) {}
  app.configs.rec = win.getBounds()
  app.thisWin = win;
  win.loadFile('html/index.html')
  win.setMenu(null)
  //win.webContents.openDevTools()
  win.webContents.focus()

  win.on('resize', () => {
    save('rec', win.getBounds())
  })
  win.on('move', () => {
    save('rec', win.getBounds())
  })
  win.on('maximize', () => {
    save('maximize', true)
  })
  win.on('unmaximize', () => {
    save('maximize', false)
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

function save(key, value)  {
  app.configs[key] = value
  try {
    var content = JSON.stringify(app.configs)
  } catch (e) {
    return false
  }
  var stream = fs.createWriteStream(app.settings)
  stream.end(content)
  return true
}
app.save = save;

const express = require('express')
const exp = express()
const http = require('http').createServer(exp)
const io = require('socket.io')(http)

app.io = io;

var lyrics = ''
ipcMain.on('lyrics', (event, arg) => {
  lyrics = arg
  io.emit('lyrics', lyrics)
})

io.on('connection', (socket) => {
  socket.emit('lyrics', lyrics)
});

exp.use(express.static(path.join(app.getAppPath(), 'node_modules/jquery/dist')))

exp.get('/',(req, res) => {
  res.sendFile(path.join(app.getAppPath(), 'html', 'line.html'))
})

exp.get('/font.ttc',(req, res) => {
  res.sendFile(path.join(app.getAppPath(), 'html', 'SourceHanSans-Regular.ttc'))
})

http.on('error', error => {
  if (error.syscall !== 'listen') {
    throw error
  }
  switch (error.code) {
    case 'EADDRINUSE':
      dialog.showErrorBox('Error','Port 56733 in use.')
      process.exit(1)
      break
    default:
      throw error
  }
})
http.listen(56733,'localhost')