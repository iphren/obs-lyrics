const { app, BrowserWindow, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const appData = path.join(app.getPath('appData'), 'obs-lyrics')
app.settings = path.join(appData, 'settings.json')
app.playlist = path.join(appData, 'playlist.json')
app.token = path.join(appData, 'token.json')
fs.mkdirSync(appData, { recursive: true })

app.html = path.join(app.getAppPath(), 'html', 'line.html')

try {
  app.set = JSON.parse(fs.readFileSync(app.settings))
  if (app.set.maximize) {
    delete app.set.maximize
    app.set.rec = {width: 800, height: 600}
  }
} catch (e) {
  app.set = {rec: {width: 800, height: 600}}
}



function createWindow () {
  const win = new BrowserWindow({
    width: app.set.rec.width,
    height: app.set.rec.height,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  try {win.setBounds(app.set.rec)} catch (e) {}
  app.set.rec = win.getBounds()
  win.loadFile('html/index.html')
  win.setMenu(null)
  //win.webContents.openDevTools()
  win.webContents.focus()

  win.on('resize', () => {
    app.set.rec = win.getBounds()
    save(app.set, app.settings)
  })
  win.on('move', () => {
    app.set.rec = win.getBounds()
    save(app.set, app.settings)
  })
  win.on('maximize', () => {
    app.set.maximize = true
    save(app.set, app.settings)
  })
  win.on('unmaximize', () => {
    app.set.maximize = false
    save(app.set, app.settings)
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

function save(data, file)  {
  try {
    var content = JSON.stringify(data)
  } catch (e) {
    return false
  }
  var stream = fs.createWriteStream(file)
  stream.end(content)
  return true
}

const http = require('http')
const port = 56733
var line = JSON.stringify({line:[]})
const requestListener = function (req, res) {
  res.setHeader('Access-Control-Allow-Origin','*')
  if (req.method == 'POST') {
    var body = ''
    req.on('data', function(data) {
      body += data
    })
    req.on('end', function() {
      line = body
      res.end()
    })
  } else if (req.method == 'GET') {
    res.setHeader("Content-Type", "application/json;charset=UTF-8")
    res.end(line)
  } else {
    res.end()
  }
}
const server = http.createServer(requestListener)
server.on('error', error => {
  if (error.syscall !== 'listen') {
    throw error
  }
  switch (error.code) {
    case 'EADDRINUSE':
      dialog.showErrorBox('Error','OBS Lyrics Manager is already running.')
      process.exit(1)
      break
    default:
      throw error
  }
})
server.listen(port,'localhost')