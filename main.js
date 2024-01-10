// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    minHeight: 600,
    minWidth: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false // This is the default value anyway
    },
    icon: path.join(__dirname, 'brand/PBC_LOGO.ico'),
    // No Menu
    autoHideMenuBar: true,
    // No Header
    frame: false
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// Handle IPC messages from renderer process
ipcMain.on('message', (event, arg) => {
  switch (arg) {
    case 'open':
      openFile()
      break
    case 'save':
      saveFile()
      break
    case 'save-as':
      saveFileAs()
      break
    case 'exit':
      app.quit()
      break
    case 'minimize':
      mainWindow.minimize()
      break
    case 'maximize':
      mainWindow.maximize()
      break
    case 'unmaximize':
      mainWindow.unmaximize()
      break
    default:
      console.log('Unknown message: ' + arg)
  }
})

// Open a file and send its content to the renderer process
function openFile() {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }).then(result => {
    if (!result.canceled) {
      let filePath = result.filePaths[0]
      let fileName = path.basename(filePath)
      let fileContent = fs.readFileSync(filePath, 'utf8')
      mainWindow.webContents.send('file-opened', fileName, fileContent)
    }
  }).catch(err => {
    console.log(err)
  })
}

// Save the current file
function saveFile() {
  mainWindow.webContents.send('file-save')
}

// Save the current file as a new file
function saveFileAs() {
  dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  }).then(result => {
    if (!result.canceled) {
      let filePath = result.filePath
      mainWindow.webContents.send('file-save-as', filePath)
    }
  }).catch(err => {
    console.log(err)
  })
}

// Receive the file content from the renderer process and write it to the file
ipcMain.on('file-content', (event, filePath, fileContent) => {
  fs.writeFile(filePath, fileContent, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log('File saved: ' + filePath)
    }
  })
})
