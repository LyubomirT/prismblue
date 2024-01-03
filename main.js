// This is the main process file for electron
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
const { spawn } = require('child_process')

// Keep a global reference of the window object
let mainWindow

function createWindow () {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })  

  // Load the index.html of the app
  mainWindow.loadFile('index.html')

  // Open the DevTools
  mainWindow.webContents.openDevTools()

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    // Dereference the window object
    mainWindow = null
  })

  // Create the menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Project',
          click () {
            openProject()
          }
        },
        {
          label: 'Quit',
          click () {
            app.quit()
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          role: 'undo'
        },
        {
          label: 'Redo',
          role: 'redo'
        },
        {
          label: 'Cut',
          role: 'cut'
        },
        {
          label: 'Copy',
          role: 'copy'
        },
        {
          label: 'Paste',
          role: 'paste'
        },
        {
          label: 'Select All',
          role: 'selectall'
        }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)

  // Initialize the project path with an empty string
  projectPath = ''
}


// This function opens a dialog to select a project folder
function openProject () {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  }).then(result => {
    if (!result.canceled) {
      // Check if the selected folder is different from the current project path
      if (result.filePaths[0] !== projectPath) {
        // Send the project path to the renderer process
        mainWindow.webContents.send('project-selected', result.filePaths[0])
      }
    }
  }).catch(err => {
    console.log(err)
  })
}


// This function runs a python file and sends the output to the renderer process
function runPython (file) {
  // Spawn a child process to run the python file
  const pyProcess = spawn('python', [file])

  // Listen for the output data
  pyProcess.stdout.on('data', (data) => {
    // Send the output data to the renderer process
    mainWindow.webContents.send('output-data', data.toString())
  })

  // Listen for the error data
  pyProcess.stderr.on('data', (data) => {
    // Send the error data to the renderer process
    mainWindow.webContents.send('output-data', data.toString())
  })

  // Listen for the close event
  pyProcess.on('close', (code) => {
    // Send the exit code to the renderer process
    mainWindow.webContents.send('output-data', `Process exited with code ${code}`)
  })
}

// Listen for the ready event
app.on('ready', createWindow)

// Quit when all windows are closed
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open
  if (mainWindow === null) {
    createWindow()
  }
})

// Listen for the run-python event from the renderer process
ipcMain.on('run-python', (event, file) => {
  runPython(file)
})
