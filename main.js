// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, dialog, Menu, MenuItem} = require('electron')
const path = require('path')
const fs = require('fs')
const {platform} = require('os')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let isChangesSaved = true; // Default to true when the app starts


function createWindow() {
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

    // Comment out this area to enable DevTools
    /////////////DEVTOOLS//////////////////////
    //mainWindow.setMenu(null)
    ///////////////////////////////////////////

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })

    // is JSON, like this {"width": 800, "height": 600}
    ipcMain.on('window-dimensions', (event, dimensions) => {
        mainWindow.setSize(dimensions.width, dimensions.height)
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
        case 'save-as-and-exit':
            saveFileAsAndExit()
            break
        case 'exit':
            if (isChangesSaved) {
                app.quit()
            } else {
                exitApp()
            }
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
            console.log(arg)
            // If contains "run-py|||path/to/file.py", run the python script
            if (arg.includes('run-py|||')) {
                let command = arg.split('|||')[1]
                command = "python " + command
                openPowerShellAndRunCommand(command)
            } else if (arg.includes('run-node|||')) {
                let command = arg.split('|||')[1]
                command = "node " + command
                openPowerShellAndRunCommand(command)
            } else if (arg.includes('run-ruby|||')) {
                let command = arg.split('|||')[1]
                command = "ruby " + command
                openPowerShellAndRunCommand(command)
            } else if (arg.includes('run-java|||')) {
                let command = arg.split('|||')[1]
                command = "javac " + command + " && java " + command.split('.')[0]
            } else {
                console.log('Unknown message: ' + arg)
            }
    }
})

// Open a file and send its content to the renderer process
function openFile() {
    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [
            {name: 'Text Files', extensions: ['txt']},
            {name: 'All Files', extensions: ['*']}
        ]
    }).then(result => {
        if (!result.canceled) {
            let filePath = result.filePaths[0]
            let fileName = path.basename(filePath)
            let fileContent = fs.readFileSync(filePath, 'utf8')
            mainWindow.webContents.send('file-opened', fileName, fileContent, filePath)
        }
    }).catch(err => {
        console.log(err)
    })
}

// exit application after user approves the options  are either Save or Discard or cancel
function exitApp() {
    const confirmSave = dialog.showMessageBoxSync(mainWindow, {
        type: 'question',
        buttons: ['Save', 'Discard', 'Cancel'],
        defaultId: 0,
        title: 'Save Changes',
        message: 'Do you want to save changes before exiting?',
    });

    if (confirmSave === 0) {
        // User clicked "Save", trigger the save process
        saveFileAndExit()


    } else if (confirmSave === 1) {
        app.quit()
    } else {
        // User clicked "Cancel", do nothing or handle accordingly
        console.log('Cancelled save');
    }

}

// Save the current file
function saveFile() {
    mainWindow.webContents.send('file-save')
}

function saveFileAndExit() {
    mainWindow.webContents.send('file-save-and-exit')
}

// Save the current file as a new file
function saveFileAs() {
    dialog.showSaveDialog(mainWindow, {
        filters: [
            {name: 'Text Files', extensions: ['txt']},
            {name: 'All Files', extensions: ['*']}
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

function saveFileAsAndExit() {
    dialog.showSaveDialog(mainWindow, {
        filters: [
            {name: 'Text Files', extensions: ['txt']},
            {name: 'All Files', extensions: ['*']}
        ]
    }).then(result => {
        if (!result.canceled) {
            let filePath = result.filePath
            mainWindow.webContents.send('file-save-as-and-exit', filePath)
        }
    }).catch(err => {
        console.log(err)
    })
}

// Receive the file content from the renderer process and write it to the file
ipcMain.on('file-content', (event, filePath, fileContent,saved) => {
    fs.writeFile(filePath, fileContent, (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log(saved);
            isChangesSaved=saved;
            console.log('File saved: ' + filePath)
            console.log(isChangesSaved);
        }
    })
})
// Receive the file content from the renderer process and write it to the file then exit
ipcMain.on('file-content-and-exit', (event, filePath, fileContent) => {
    fs.writeFile(filePath, fileContent, (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log('File saved: ' + filePath)
            app.quit()
        }
    })
})
ipcMain.on('editor-content-changed', (event, changedSaved) => {
    // Editor content changed, set saved state to false
    isChangesSaved = changedSaved;
    console.log(changedSaved);
});

function openPowerShellAndRunCommand(command) {
    const {exec} = require('child_process');
    if (platform() === 'darwin') {
        command = `osascript -e 'tell application "Terminal" to do script "${command}"'`;
    } else if (platform() === 'win32') {
        command = `start powershell.exe -NoExit -Command "${command}"`;
    } else if (platform() === 'linux') {
        command = `gnome-terminal -- bash -c "${command}; exec bash"`;
    } else {
        console.log('Unknown platform: ' + platform());
        return;
    }

    const powershellProcess = exec(powershellCommand);

    powershellProcess.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    powershellProcess.stderr.on('data', (data) => {
        console.error(data.toString());
    });

    powershellProcess.on('exit', (code) => {
        console.log(`PowerShell process exited with code ${code}`);
    });
}

async function tempWindow(htmlstring) {
    let tempWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false // This is the default value anyway
        },
        icon: path.join(__dirname, 'brand/PBC_LOGO.ico')

    })

    var template = [
        {
            label: "Tools",
            submenu: [
                {
                    label: "Reload",
                    accelerator: "CmdOrCtrl+R",
                    click: function (item, focusedWindow) {
                        if (focusedWindow) {
                            // on reload, start fresh and close any old
                            // open secondary windows
                            if (focusedWindow.id === 1) {
                                BrowserWindow.getAllWindows().forEach(function (win) {
                                    if (win.id > 1) {
                                        win.close()
                                    }
                                })
                            }
                            focusedWindow.reload()
                        }
                    }
                },
                {
                    label: "Toggle Full Screen",
                    accelerator: (function () {
                        if (process.platform === "darwin") {
                            return "Ctrl+Command+F"
                        } else {
                            return "F11"
                        }
                    })(),
                    click: function (item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
                        }
                    }
                },
                {
                    label: "Toggle Developer Tools",
                    accelerator: (function () {
                        if (process.platform === "darwin") {
                            return "Alt+Command+I"
                        } else {
                            return "Ctrl+Shift+I"
                        }
                    })(),
                    click: function (item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.toggleDevTools()
                        }
                    }
                },
                {
                    label: "Quit",
                    accelerator: "CmdOrCtrl+Q",
                    click: function () {
                        // Only close the temp window
                        tempWindow.close()
                    }
                }
            ]
        }
    ]
    // function notifyEditorContentChanged() {
    //   ipcRenderer.send('editor-content-changed');
    // }
    // editor.on('change', () => {
    //   // Notify the main process about the content change
    //   notifyEditorContentChanged();
    // });
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))

    // Save the htmlstring to a temp file
    fs.writeFileSync('temp.html', htmlstring)

    // Load the temp file
    tempWindow.loadFile('temp.html')

    tempWindow.on('closed', function () {
        tempWindow = null
    })
}

// previewinwindow event, must run in async mode
ipcMain.on('previewinwindow', async (event, htmlstring) => {
    tempWindow(htmlstring)
})


ipcMain.on('clear-preferences', (event) => {
    // Delete preferences.json from the local directory
    fs.unlink('preferences.json', (err) => {
        if (err) {
            console.log(err)
        } else {
            console.log('Deleted preferences.json')
        }
    })
    // Relaunch the app
    app.relaunch()
    app.quit()
})