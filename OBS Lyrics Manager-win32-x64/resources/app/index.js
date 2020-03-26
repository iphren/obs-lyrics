const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')

const appData = path.join(app.getPath('appData'), 'obs-lyrics')
app.lyrics = path.join(appData, 'lyrics.txt')
app.line = path.join(appData, 'line.txt')
fs.mkdirSync(appData, { recursive: true })

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.loadFile('html/index.html')
  win.setMenu(null)
  //win.webContents.openDevTools()
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