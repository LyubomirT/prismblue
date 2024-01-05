// renderer.js
const { ipcRenderer } = require("electron");
const fs = require("fs");
const path = require("path");

// Get the DOM elements
const toolbar = document.getElementById("toolbar");
const menu = document.getElementById("menu");
const fileMenu = document.getElementById("file-menu");
const editMenu = document.getElementById("edit-menu");
const viewMenu = document.getElementById("view-menu");
const saveBtn = document.getElementById("save");
const saveAsBtn = document.getElementById("save-as");
const openBtn = document.getElementById("open");
const undoBtn = document.getElementById("undo");
const redoBtn = document.getElementById("redo");
// renderer.js (continued)
const cutBtn = document.getElementById("cut");
const copyBtn = document.getElementById("copy");
const pasteBtn = document.getElementById("paste");
const findBtn = document.getElementById("find");
const themeBtn = document.getElementById("theme");
const editorDiv = document.getElementById("editor");
const fileStatus = document.getElementById("file-status");
const fileLang = document.getElementById("file-lang");

// Initialize the CodeMirror editor
const editor = CodeMirror(editorDiv, {
  lineNumbers: true,
  foldGutter: true,
  gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
  extraKeys: {
    "Ctrl-Space": "autocomplete",
    "Ctrl-F": "find",
    "Ctrl-G": "jumpToLine",
  },
});

// Set the default theme
let theme = "default";
editor.setOption("theme", theme);

// Set the default mode
let mode = "Plain Text";
editor.setOption("mode", mode);

// Set the default file path
let filePath = null;

// Set the default file status
let status = "Unsaved Changes";
fileStatus.textContent = status;

// Set the default file language
fileLang.textContent = mode;

// Handle the toolbar click events
toolbar.addEventListener("click", (e) => {
  // Hide all the menus
  fileMenu.classList.add("hidden");
  editMenu.classList.add("hidden");
  viewMenu.classList.add("hidden");

  // Show the corresponding menu
  if (e.target.id === "file") {
    fileMenu.classList.remove("hidden");
  } else if (e.target.id === "edit") {
    editMenu.classList.remove("hidden");
  } else if (e.target.id === "view") {
    viewMenu.classList.remove("hidden");
  }
});

// Handle the save button click event
saveBtn.addEventListener("click", () => {
  // Get the editor content
  const content = editor.getValue();

  // If the file path is not set, use the save as dialog
  if (!filePath) {
    ipcRenderer.send("save-as", content);
  } else {
    // Otherwise, save the content to the file path
    fs.writeFile(filePath, content, (err) => {
      if (err) {
        console.error(err);
      } else {
        // Update the file status
        status = "Changes Saved";
        fileStatus.textContent = status;
      }
    });
  }
});

// Handle the save as button click event
saveAsBtn.addEventListener("click", () => {
  // Get the editor content
  const content = editor.getValue();

  // Send the save as message to the main process
  ipcRenderer.send("save-as", content);
});

// Handle the open button click event
openBtn.addEventListener("click", () => {
  // Send the open message to the main process
  ipcRenderer.send("open");
});

// Handle the undo button click event
undoBtn.addEventListener("click", () => {
  // Undo the last editor action
  editor.undo();
});

// Handle the redo button click event
redoBtn.addEventListener("click", () => {
  // Redo the last editor action
  editor.redo();
});

// Handle the cut button click event
cutBtn.addEventListener("click", () => {
  // Cut the selected editor text
  editor.execCommand("cut");
});

// Handle the copy button click event
copyBtn.addEventListener("click", () => {
  // Copy the selected editor text
  editor.execCommand("copy");
});

// Handle the paste button click event
pasteBtn.addEventListener("click", () => {
  // Paste the clipboard text to the editor
  editor.execCommand("paste");
});

// Handle the find button click event
findBtn.addEventListener("click", () => {
  // Open the find dialog in the editor
  editor.execCommand("find");
});

// Handle the theme button click event
themeBtn.addEventListener("click", () => {
  // Toggle the theme between default and dark
  if (theme === "default") {
    theme = "dark";
  } else {
    theme = "default";
  }
  editor.setOption("theme", theme);
});

// Handle the file status click event
fileStatus.addEventListener("click", () => {
  // Toggle the file status between Unsaved Changes and Changes Saved
  if (status === "Unsaved Changes") {
    status = "Changes Saved";
  } else {
    status = "Unsaved Changes";
  }
  fileStatus.textContent = status;
});

// Handle the file language click event
fileLang.addEventListener("click", () => {
  // Get the list of available modes from CodeMirror
  const modes = CodeMirror.modeInfo;

  // Create a select element with the modes as options
  const select = document.createElement("select");
  modes.forEach((m) => {
    const option = document.createElement("option");
    option.value = m.name;
    option.textContent = m.name;
    if (m.name === mode) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  // Replace the file language span with the select element
  fileLang.replaceWith(select);

  // Focus on the select element
  select.focus();

  // Handle the change event of the select element
  select.addEventListener("change", () => {
    // Get the selected mode name
    mode = select.value;

    // Get the corresponding mode mime or mode name
    const info = CodeMirror.findModeByName(mode);
    const mime = info.mime || info.mode;

    // Set the editor mode option
    editor.setOption("mode", mime);

    // Load the mode script if needed
    if (info.mode && info.mode !== mime) {
      CodeMirror.requireMode(info.mode, () => {
        editor.setOption("mode", mime);
      });
    }

    // Create a new file language span with the mode name
    const span = document.createElement("span");
    span.id = "file-lang";
    span.textContent = mode;

    // Replace the select element with the file language span
    select.replaceWith(span);
  });
});

// Handle the editor change event
editor.on("change", () => {
  // Update the file status to Unsaved Changes
  status = "Unsaved Changes";
  fileStatus.textContent = status;
});

// Handle the editor cursor activity event
editor.on("cursorActivity", () => {
  // Get the current cursor position
  const cursor = editor.getCursor();

  // Get the token at the cursor position
  const token = editor.getTokenAt(cursor);

  // Get the mode name of the token
  const modeName = token.state.modeName;

  // If the mode name is different from the file language, update it
  if (modeName !== mode) {
    mode = modeName;
    fileLang.textContent = mode;
  }
});

// Handle the save-reply message from the main process
ipcRenderer.on("save-reply", (event, arg) => {
  // If the argument is a file path, set it as the file path
  if (typeof arg === "string") {
    filePath = arg;

    // Get the file name from the file path
    const fileName = path.basename(filePath);

    // Set the document title to the file name
    document.title = fileName;
  }
});

// Handle the open-reply message from the main process
ipcRenderer.on("open-reply", (event, arg) => {
  // If the argument is an object with file path and content, set them
  if (typeof arg === "object") {
    filePath = arg.filePath;
    const content = arg.content;

    // Get the file name from the file path
    const fileName = path.basename(filePath);

    // Set the document title to the file name
    document.title = fileName;

    // Set the editor value to the content
    editor.setValue(content);

    // Get the file extension from the file name
    const ext = fileName.split(".").pop();

    // Get the corresponding mode info from CodeMirror
    const info = CodeMirror.findModeByExtension(ext);

    // If the mode info exists, set the mode option and the file language
    if (info) {
      mode = info.name;
      const mime = info.mime || info.mode;
      editor.setOption("mode", mime);
      fileLang.textContent = mode;

      // Load the mode script if needed
      if (info.mode && info.mode !== mime) {
        CodeMirror.requireMode(info.mode, () => {
          editor.setOption("mode", mime);
        });
      }
    }
  }
});
