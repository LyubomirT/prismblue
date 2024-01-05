// main.js
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

// Create a global reference to the main window
let mainWindow;

// Create a function to create the main window
function createWindow() {
  // Create a new browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // This is a security risk, but required for CodeMirror to work
    },
  });

  // Load the index.html file
  mainWindow.loadFile("index.html");

  // Open the dev tools
  mainWindow.webContents.openDevTools();

  // Handle the window closed event
  mainWindow.on("closed", () => {
    // Dereference the main window
    mainWindow = null;
  });
}

// Handle the ready event
app.on("ready", createWindow);

// Handle the window all closed event
app.on("window-all-closed", () => {
  // Quit the app if not on macOS
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle the activate event
app.on("activate", () => {
  // Create the main window if not exists
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle the save-as message from the renderer process
ipcMain.on("save-as", (event, arg) => {
  // Show the save dialog
  dialog
    .showSaveDialog(mainWindow, {
      title: "Save File",
      filters: [{ name: "All Files", extensions: ["*"] }],
    })
    .then((result) => {
      // If the result is not canceled, write the content to the file path
      if (!result.canceled) {
        const filePath = result.filePath;
        const content = arg;
        fs.writeFile(filePath, content, (err) => {
          if (err) {
            console.error(err);
          } else {
            // Send the save-reply message with the file path to the renderer process
            event.reply("save-reply", filePath);
          }
        });
      }
    })
    .catch((err) => {
      console.error(err);
    });
});

// Handle the open message from the renderer process
ipcMain.on("open", (event) => {
  // Show the open dialog
  dialog
    .showOpenDialog(mainWindow, {
      title: "Open File",
      filters: [{ name: "All Files", extensions: ["*"] }],
      properties: ["openFile"],
    })
    .then((result) => {
      // If the result is not canceled, read the content from the file path
      if (!result.canceled) {
        const filePath = result.filePaths[0];
        fs.readFile(filePath, "utf8", (err, data) => {
          if (err) {
            console.error(err);
          } else {
            // Send the open-reply message with the file path and content to the renderer process
            event.reply("open-reply", { filePath, content: data });
          }
        });
      }
    })
    .catch((err) => {
      console.error(err);
    });
});
