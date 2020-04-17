const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

const appData = path.join(app.getPath('appData'), 'obs-lyrics')
app.lyrics = path.join(appData, 'lyrics.txt')
app.line = path.join(appData, 'line.txt')
app.settings = path.join(appData, 'settings.json')
fs.mkdirSync(appData, { recursive: true })

try {
  app.set = JSON.parse(fs.readFileSync(app.settings))
  if (app.set.maximize) throw 'maximized'
} catch (e) {
  app.set = {rec: {width: 800, height: 600}, showleft: true}
}

function createWindow () {
  const win = new BrowserWindow({
    width: app.set.rec.width,
    height: app.set.rec.height,
    webPreferences: {
      nodeIntegration: true
    }
  })
  try {win.setBounds(app.set.rec)} catch (e) {}
  app.set.rec = win.getBounds()
  win.loadFile('html/index.html')
  win.setMenu(null)
  //win.webContents.openDevTools()

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

  ipcMain.on('resize', (e, size) => {
    app.set.rec.width += size
    app.set.rec.x -= size
    app.set.showleft = size > 0
    try {win.setBounds(app.set.rec)} catch (e) {}
    app.set.rec = win.getBounds()
    save(app.set, app.settings)
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  fs.writeFileSync(app.line, '')
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