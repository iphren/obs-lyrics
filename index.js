const { app, BrowserWindow } = require('electron')
const { ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

const appData = path.join(app.getPath('appData'), 'obs-lyrics')
app.lyrics = path.join(appData, 'lyrics.txt')
app.html = path.join(appData, 'line.html')
app.settings = path.join(appData, 'settings.json')
fs.mkdirSync(appData, { recursive: true })

try {
  app.set = JSON.parse(fs.readFileSync(app.settings))
  if (app.set.maximize) throw 'maximized'
} catch (e) {
  app.set = {rec: {width: 800, height: 600}, showleft: true}
}

if (typeof app.set.client == 'string') {
  app.line = app.set.client
} else {
  app.line = uuidv4()
  app.set.client = app.line
  save(app.set, app.settings)
}


fs.writeFileSync(app.html,`
<html>
  <head>
    <meta charset="utf-8">
    <style>
      #lyrics {
        position: fixed;
        bottom: 3.5vw;
        font-size: 3.5vw;
        font-family: "Source Han Sans CN", sans-serif;
        width: 100vw;
        text-align: center;
        color: white;
        text-shadow: 0px 0px 8px black, 0px 0px 8px black;
        font-weight: 700;
        transition: all 0.2s ease-in-out; 
      }
    </style>
  </head>
  <body>
    <div id='lyrics'></div>
    <script>
      const url = 'https://elimfgcc.org/lyrics/line?client=${app.line}';
      const method = 'GET';
      var xhr;
      var line = '';

      setInterval(getLyrics, 100);

      function getLyrics() {
        xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.responseType = 'json';
        xhr.onreadystatechange = function () {
          if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
            let data = xhr.response.line.join('<br>');
            if (data == line) return;
            line = data;
            document.getElementById('lyrics').style.opacity = 0;
            setTimeout(()=>{
              document.getElementById('lyrics').innerHTML = line;
              document.getElementById('lyrics').style.opacity = 1;
            },200);
          };
        };
        xhr.send();
      };
    </script>
  </body>
</html>
`);

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