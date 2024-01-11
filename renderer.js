// Modules to communicate with main process
const { ipcRenderer } = require('electron')
const fs = require('fs')

// Get the DOM elements
const fileButton = document.getElementById('file-button')
const editButton = document.getElementById('edit-button')
const viewButton = document.getElementById('view-button')
const filePanel = document.getElementById('file-panel')
const editPanel = document.getElementById('edit-panel')
const viewPanel = document.getElementById('view-panel')
const openButton = document.getElementById('open-button')
const saveButton = document.getElementById('save-button')
const saveAsButton = document.getElementById('save-as-button')
const exitButton = document.getElementById('exit-button')
const copyButton = document.getElementById('copy-button')
const pasteButton = document.getElementById('paste-button')
const cutButton = document.getElementById('cut-button')
const selectAllButton = document.getElementById('select-all-button')
const findButton = document.getElementById('find-button')
const toggleThemeButton = document.getElementById('toggle-theme-button')
const fontSettingsButton = document.getElementById('font-settings-button')
const toggleStatusBarButton = document.getElementById('toggle-status-bar-button')
const editorTextarea = document.getElementById('editor-textarea')
const statusBar = document.getElementById('status-bar')
const changes = document.getElementById('changes')
const filename = document.getElementById('filename')
const rowCol = document.getElementById('row-col')
const totalSize = document.getElementById('total-size')
const findModal = document.getElementById('find-modal')
const findInput = document.getElementById('find-input')
const findNextButton = document.getElementById('find-next-button')
const findPrevButton = document.getElementById('find-prev-button')
const replaceButton = document.getElementById('replace-button')
const replaceAllButton = document.getElementById('replace-all-button')
const replaceInput = document.getElementById('replace-input')
const fontModal = document.getElementById('font-modal')
const fontSelect = document.getElementById('font-select')
const fontSizeInput = document.getElementById('font-size-input')
const applyFontButton = document.getElementById('apply-font-button')
const newButton = document.getElementById('new-button')
const historyButton = document.getElementById('history-button')
const historyPanel = document.getElementById('history-panel')
const undoButton = document.getElementById('undo-button')
const redoButton = document.getElementById('redo-button')
const restoreButton = document.getElementById('restore-button')
const restoreModal = document.getElementById('restore-modal')
const restoreAlreadyThere = document.getElementById('restore-already-there')
const failedRestore = document.getElementById('failed-restore')
const close_Button = document.getElementById('close_-button')
const minimizeButton = document.getElementById('mini-button')
const maximizeButton = document.getElementById('maxi-button')
const title = document.getElementById('title')
const runMenuButton = document.getElementById('run-menu-button')
const runMenu = document.getElementById('run-panel')
const runButton = document.getElementById('run-button')
const unsavedFile = document.getElementById('file-not-saved')
const unsupportedLanguage = document.getElementById('unsupported-language')

let maximized = false

close_Button.addEventListener('click', () => {
  ipcRenderer.send('message', 'exit')
})

minimizeButton.addEventListener('click', () => {
  ipcRenderer.send('message', 'minimize')
})

maximizeButton.addEventListener('click', () => {
  if (maximized) {
    ipcRenderer.send('message', 'unmaximize')
    maximized = false
  } else {
    ipcRenderer.send('message', 'maximize')
    maximized = true
  }
})

// Initialize the action history and redo stack
let lastSession = {}

let preferences = {
  theme: 'light',
  font: 'Courier New',
  fontSize: 16,
  statusBar: true
}

function savePreferences() {
  fs.writeFileSync('preferences.json', JSON.stringify(preferences))
}

// Variables to store the current state
let currentFilePath = null // The path of the current file
let currentFileContent = '' // The content of the current file
let currentTheme = 'light' // The current theme
let currentFont = 'Courier New' // The current font
let currentFontSize = 16 // The current font size
let currentStatusBar = true // The current status bar visibility
let currentSearchIndex = -1 // The current index of the search result
let currentSearchResults = [] // The current array of the search results

function loadPreferences() {
  try {
    preferences = JSON.parse(fs.readFileSync('preferences.json', 'utf8'))
    if (preferences.theme === 'dark') {
      toggleTheme()
    }
    currentFont = preferences.font
    currentFontSize = preferences.fontSize
    fontSelect.value = currentFont
    fontSizeInput.value = currentFontSize
    applyFont()
    if (!preferences.statusBar) {
      toggleStatusBar()
    }
  } catch (err) {
    console.log(err)
  }
}

loadPreferences()

// Add event listeners to the menu buttons
fileButton.addEventListener('click', () => {
  togglePanel(filePanel)
  // Set a custom "state" (="active") attribute on the button
  // so that we can style it differently using CSS
  fileButton.setAttribute('state', 'active')
  editButton.removeAttribute('state')
  viewButton.removeAttribute('state')
  historyButton.removeAttribute('state')
  runMenuButton.removeAttribute('state')
})

editButton.addEventListener('click', () => {
  togglePanel(editPanel)
  fileButton.removeAttribute('state')
  editButton.setAttribute('state', 'active')
  viewButton.removeAttribute('state')
  historyButton.removeAttribute('state')
  runMenuButton.removeAttribute('state')
})

viewButton.addEventListener('click', () => {
  togglePanel(viewPanel)
  fileButton.removeAttribute('state')
  editButton.removeAttribute('state')
  viewButton.setAttribute('state', 'active')
  historyButton.removeAttribute('state')
  runMenuButton.removeAttribute('state')
})

historyButton.addEventListener('click', () => {
  togglePanel(historyPanel)
  fileButton.removeAttribute('state')
  editButton.removeAttribute('state')
  viewButton.removeAttribute('state')
  historyButton.setAttribute('state', 'active')
  runMenuButton.removeAttribute('state')
})

runMenuButton.addEventListener('click', () => {
  togglePanel(runMenu)
  fileButton.removeAttribute('state')
  editButton.removeAttribute('state')
  viewButton.removeAttribute('state')
  historyButton.removeAttribute('state')
  runMenuButton.setAttribute('state', 'active')
})

// Add event listeners to the sub buttons
openButton.addEventListener('click', () => {
  ipcRenderer.send('message', 'open')
})

saveButton.addEventListener('click', () => {
  ipcRenderer.send('message', 'save')
})

saveAsButton.addEventListener('click', () => {
  ipcRenderer.send('message', 'save-as')
})

exitButton.addEventListener('click', () => {
  ipcRenderer.send('message', 'exit')
})

copyButton.addEventListener('click', () => {
  editorTextarea.focus()
  document.execCommand('copy')
})

pasteButton.addEventListener('click', () => {
  editorTextarea.focus()
  document.execCommand('paste')
})

cutButton.addEventListener('click', () => {
  editorTextarea.focus()
  document.execCommand('cut')
})

selectAllButton.addEventListener('click', () => {
  editorTextarea.focus()
  document.execCommand('selectAll')
})

findButton.addEventListener('click', () => {
  openModal(findModal)
})

toggleThemeButton.addEventListener('click', () => {
  toggleTheme()
})

fontSettingsButton.addEventListener('click', () => {
  openModal(fontModal)
})

toggleStatusBarButton.addEventListener('click', () => {
  toggleStatusBar()
})

// Add event listeners to the editor textarea
editorTextarea.addEventListener('input', () => {
  updateChanges()
  updateTotalSize()
})

editorTextarea.addEventListener('scroll', () => {
  highlightSearchResults()
})

editorTextarea.addEventListener('click', () => {
  updateRowCol()
})

editorTextarea.addEventListener('keyup', () => {
  updateRowCol()
})

newButton.addEventListener('click', () => {
  startBlank()
})

restoreButton.addEventListener('click', () => {
  openModal(restoreModal)
})

fileButton.click()

// Add event listeners to the modals
findModal.addEventListener('mousedown', (event) => {
  if (event.target.classList.contains('modal')) {
    // Record the initial position of the click
    findModal.initialClickX = event.clientX;
    findModal.initialClickY = event.clientY;
  }
});

findModal.addEventListener('mouseup', (event) => {
  if (
    event.target.classList.contains('modal') &&
    findModal.initialClickX === event.clientX &&
    findModal.initialClickY === event.clientY
  ) {
    closeModal(findModal);
  }
});

fontModal.addEventListener('mousedown', (event) => {
  if (event.target.classList.contains('modal')) {
    // Record the initial position of the click
    fontModal.initialClickX = event.clientX;
    fontModal.initialClickY = event.clientY;
  }
});

fontModal.addEventListener('mouseup', (event) => {
  if (
    event.target.classList.contains('modal') &&
    fontModal.initialClickX === event.clientX &&
    fontModal.initialClickY === event.clientY
  ) {
    closeModal(fontModal);
  }
});

restoreModal.addEventListener('mousedown', (event) => {
  if (event.target.classList.contains('modal')) {
    // Record the initial position of the click
    restoreModal.initialClickX = event.clientX;
    restoreModal.initialClickY = event.clientY;
  }
});

restoreModal.addEventListener('mouseup', (event) => {
  if (
    event.target.classList.contains('modal') &&
    restoreModal.initialClickX === event.clientX &&
    restoreModal.initialClickY === event.clientY
  ) {
    closeModal(restoreModal);
  }
});

restoreAlreadyThere.addEventListener('mousedown', (event) => {
  if (event.target.classList.contains('modal')) {
    // Record the initial position of the click
    restoreAlreadyThere.initialClickX = event.clientX;
    restoreAlreadyThere.initialClickY = event.clientY;
  }
}
);

restoreAlreadyThere.addEventListener('mouseup', (event) => {
  if (
    event.target.classList.contains('modal') &&
    restoreAlreadyThere.initialClickX === event.clientX &&
    restoreAlreadyThere.initialClickY === event.clientY
  ) {
    closeModal(restoreAlreadyThere);
  }
}
);

failedRestore.addEventListener('mousedown', (event) => {
  if (event.target.classList.contains('modal')) {
    // Record the initial position of the click
    failedRestore.initialClickX = event.clientX;
    failedRestore.initialClickY = event.clientY;
  }
}
);

failedRestore.addEventListener('mouseup', (event) => {
  if (
    event.target.classList.contains('modal') &&
    failedRestore.initialClickX === event.clientX &&
    failedRestore.initialClickY === event.clientY
  ) {
    closeModal(failedRestore);
  }
}
);

unsavedFile.addEventListener('mousedown', (event) => {
  if (event.target.classList.contains('modal')) {
    // Record the initial position of the click
    unsavedFile.initialClickX = event.clientX;
    unsavedFile.initialClickY = event.clientY;
  }
}
);

unsavedFile.addEventListener('mouseup', (event) => {
  if (
    event.target.classList.contains('modal') &&
    unsavedFile.initialClickX === event.clientX &&
    unsavedFile.initialClickY === event.clientY
  ) {
    closeModal(unsavedFile);
  }
}
);

unsupportedLanguage.addEventListener('mousedown', (event) => {
  if (event.target.classList.contains('modal')) {
    // Record the initial position of the click
    unsupportedLanguage.initialClickX = event.clientX;
    unsupportedLanguage.initialClickY = event.clientY;
  }
}
);

unsupportedLanguage.addEventListener('mouseup', (event) => {
  if (
    event.target.classList.contains('modal') &&
    unsupportedLanguage.initialClickX === event.clientX &&
    unsupportedLanguage.initialClickY === event.clientY
  ) {
    closeModal(unsupportedLanguage);
  }
});


// Add event listeners to the modal buttons
findModal.querySelector('.close-button').addEventListener('click', () => {
  closeModal(findModal)
})

findNextButton.addEventListener('click', () => {
  findNext()
})

findPrevButton.addEventListener('click', () => {
  findPrev()
})

replaceButton.addEventListener('click', () => {
  replace()
})

replaceAllButton.addEventListener('click', () => {
  replaceAll()
})

fontModal.querySelector('.close-button').addEventListener('click', () => {
  closeModal(fontModal)
})

applyFontButton.addEventListener('click', () => {
  applyFont()
})

restoreModal.querySelector('.close-button').addEventListener('click', () => {
  closeModal(restoreModal)
})

restoreModal.querySelector('#yes-restore-button').addEventListener('click', () => {
  loadHistory()
  closeModal(restoreModal)
})

restoreModal.querySelector('#no-restore-button').addEventListener('click', () => {
  closeModal(restoreModal)
})

restoreAlreadyThere.querySelector('.close-button').addEventListener('click', () => {
  closeModal(restoreAlreadyThere)
})

restoreAlreadyThere.querySelector('#ok-restore-button').addEventListener('click', () => {
  closeModal(restoreAlreadyThere)
})

failedRestore.querySelector('.close-button').addEventListener('click', () => {
  closeModal(failedRestore)
})

failedRestore.querySelector('#ok-failed-restore-button').addEventListener('click', () => {
  closeModal(failedRestore)
})

unsavedFile.querySelector('.close-button').addEventListener('click', () => {
  closeModal(unsavedFile)
})

unsavedFile.querySelector('#ok-unsaved-file-button').addEventListener('click', () => {
  closeModal(unsavedFile)
})

// Handle the file-opened event from the main process
ipcRenderer.on('file-opened', (event, fileName, fileContent) => {
  currentFilePath = fileName
  currentFileContent = fileContent
  editorTextarea.value = fileContent
  filename.textContent = fileName
  changes.textContent = 'File Opened'
  document.title = fileName + ' - Prismblue'
  title.textContent = fileName + ' - Prismblue'
  updateTotalSize()
  updateRowCol()
  resetSearch()
})

// Handle the file-save event from the main process
ipcRenderer.on('file-save', (event) => {
  if (currentFilePath) {
    let fileContent = editorTextarea.value
    ipcRenderer.send('file-content', currentFilePath, fileContent)
    currentFileContent = fileContent
    changes.textContent = 'File Saved'
    resetSearch()
  } else {
    ipcRenderer.send('message', 'save-as')
  }
})

// Handle the file-save-as event from the main process
ipcRenderer.on('file-save-as', (event, filePath) => {
  currentFilePath = filePath
  let fileContent = editorTextarea.value
  ipcRenderer.send('file-content', filePath, fileContent)
  currentFileContent = fileContent
  filename.textContent = filePath
  changes.textContent = 'File Ready'
  document.title = filePath + ' - Prismblue'
  title.textContent = filePath + ' - Prismblue'
  resetSearch()
})

// Toggle the visibility of a sub panel
function togglePanel(panel) {
  let panels = document.getElementsByClassName('sub-panel')
  for (let p of panels) {
    if (p === panel) {
      p.style.display = p.style.display === 'flex' ? 'none' : 'flex'
    } else {
      p.style.display = 'none'
    }
  }
}

// Update the changes status
function updateChanges() {
  let fileContent = editorTextarea.value
  if (fileContent === currentFileContent) {
    changes.textContent = 'Saved Changes'
  } else {
    changes.textContent = 'Unsaved Changes'
  }
}

// Update the total size
function updateTotalSize() {
  let fileContent = editorTextarea.value
  let fileSize = Buffer.byteLength(fileContent, 'utf8')
  totalSize.textContent = formatBytes(fileSize)
}

// Update the row and column
function updateRowCol() {
  let cursorPosition = editorTextarea.selectionStart
  let fileContent = editorTextarea.value
  let row = fileContent.substr(0, cursorPosition).split('\n').length
  let col = cursorPosition - fileContent.lastIndexOf('\n', cursorPosition - 1)
  rowCol.textContent = row + ':' + col
}

// Format bytes to human readable units
function formatBytes(bytes) {
  if (bytes === 0) return '0 bytes'
  const k = 1024
  const dm = 2
  const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// Open a modal
function openModal(modal) {
  modal.style.display = 'block'
}

// Close a modal
function closeModal(modal) {
  modal.style.display = 'none'
}

// Toggle the theme
function toggleTheme() {
  if (currentTheme === 'light') {
    currentTheme = 'dark'
    // For every single element in the DOM, change the theme attribute
    // to "dark" and change the toggle theme button text
    for (let element of document.querySelectorAll('*')) {
      element.setAttribute('theme', 'dark')
    }
    toggleThemeButton.innerHTML = '<i class="fas fa-adjust"></i> Toggle Theme (Dark)'
  } else {
    for (let element of document.querySelectorAll('*')) {
      element.setAttribute('theme', 'light')
    }
    toggleThemeButton.innerHTML = '<i class="fas fa-adjust"></i> Toggle Theme (Light)'
    currentTheme = 'light'
  }
  preferences.theme = currentTheme
  savePreferences()
}

// Toggle the status bar
function toggleStatusBar() {
  if (currentStatusBar) {
    currentStatusBar = false
    statusBar.style.display = 'none'
    editor.style.height = 'calc(100vh - 41px)'
    toggleStatusBarButton.innerHTML = '<i class="fas fa-info-circle"></i> Toggle Status Bar (Off)'
  } else {
    currentStatusBar = true
    statusBar.style.display = 'flex'
    editor.style.height = 'calc(100vh - 71px)'
    toggleStatusBarButton.innerHTML = '<i class="fas fa-info-circle"></i> Toggle Status Bar (On)'
  }
  preferences.statusBar = currentStatusBar
  savePreferences()
}

// Apply the font settings
function applyFont() {
  let font = fontSelect.value
  let fontSize = fontSizeInput.value
  currentFont = font
  currentFontSize = fontSize
  editorTextarea.style.fontFamily = font
  editorTextarea.style.fontSize = fontSize + 'px'
  closeModal(fontModal)
  preferences.font = currentFont
  preferences.fontSize = currentFontSize
  savePreferences()
}

// Find the next occurrence of the input text
function findNext() {
  let input = findInput.value;
  if (input) {
    if (currentSearchResults.length === 0) {
      // First time search
      let fileContent = editorTextarea.value;
      let regex = new RegExp(input, 'gi');
      let match;
      while ((match = regex.exec(fileContent)) !== null) {
        currentSearchResults.push(match.index);
      }
      currentSearchResults.sort((a, b) => a - b);
    }
    if (currentSearchResults.length > 0) {
      // Move to the next index
      currentSearchIndex = (currentSearchIndex + 1) % currentSearchResults.length;
      let index = currentSearchResults[currentSearchIndex];
      // Select the text and scroll to it
      editorTextarea.setSelectionRange(index, index + input.length);
      editorTextarea.focus(); // Added focus to ensure highlighting works
      editorTextarea.scrollTop = editorTextarea.scrollHeight * (index / editorTextarea.value.length);
      // Highlight the search results
      highlightSearchResults();
    }
  }
}

// Find the previous occurrence of the input text
function findPrev() {
  let input = findInput.value;
  if (input) {
    if (currentSearchResults.length === 0) {
      // First time search
      let fileContent = editorTextarea.value;
      let regex = new RegExp(input, 'gi');
      let match;
      while ((match = regex.exec(fileContent)) !== null) {
        currentSearchResults.push(match.index);
      }
      currentSearchResults.sort((a, b) => a - b);
    }
    if (currentSearchResults.length > 0) {
      // Move to the previous index
      currentSearchIndex = (currentSearchIndex - 1 + currentSearchResults.length) % currentSearchResults.length;
      let index = currentSearchResults[currentSearchIndex];
      // Select the text and scroll to it
      editorTextarea.setSelectionRange(index, index + input.length);
      editorTextarea.focus(); // Added focus to ensure highlighting works
      editorTextarea.scrollTop = editorTextarea.scrollHeight * (index / editorTextarea.value.length);
      // Highlight the search results
      highlightSearchResults();
    }
  }
}

// Replace the current occurrence of the input text with the replace text
function replace() {
  let input = findInput.value;
  let replaceText = replaceInput.value;
  if (input) {
    if (currentSearchResults.length > 0 && currentSearchIndex >= 0) {
      // Get the current index and the file content
      let index = currentSearchResults[currentSearchIndex];
      let fileContent = editorTextarea.value;
      // Replace the input text with the replace text
      fileContent = fileContent.slice(0, index) + replaceText + fileContent.slice(index + input.length);
      editorTextarea.value = fileContent;
      // Update the current file content and the changes status
      currentFileContent = fileContent;
      updateChanges();
      // Reset the search results and the search index
      resetSearch();
    }
  }
}

// Replace all the occurrences of the input text with the replace text
// HOLY **** ALL THIS TIME THERE WAS A REPLACEALL IN JS?!!
function replaceAll() {
  let input = findInput.value;
  let replaceText = replaceInput.value;
  if (input) {
    // Get the file content
    let fileContent = editorTextarea.value;
    // Replace all the input text with the replace text
    fileContent = fileContent.replaceAll(input, replaceText); // Use replaceAll method
    editorTextarea.value = fileContent;
    // Update the current file content and the changes status
    currentFileContent = fileContent;
    updateChanges();
    // Reset the search results and the search index
    resetSearch();
  }
}


// Reset the search results and the search index
function resetSearch() {
  currentSearchResults = []
  currentSearchIndex = -1
  highlightSearchResults()
}

// Highlight the search results in the editor textarea
function highlightSearchResults() {
  let input = findInput.value
  if (input) {
    // Create a canvas element to draw the highlights
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')
    // Get the editor textarea dimensions and styles
    let width = editorTextarea.clientWidth
    let height = editorTextarea.clientHeight
    let lineHeight = parseInt(getComputedStyle(editorTextarea).lineHeight)
    let fontSize = parseInt(getComputedStyle(editorTextarea).fontSize)
    let fontFamily = getComputedStyle(editorTextarea).fontFamily
    let padding = parseInt(getComputedStyle(editorTextarea).padding)
    // Set the canvas dimensions and styles
    canvas.width = width
    canvas.height = height
    ctx.fillStyle = 'rgba(255, 255, 0, 0.5)'
    ctx.font = fontSize + 'px ' + fontFamily
    // Get the editor textarea content and scroll position
    let fileContent = editorTextarea.value
    let scrollTop = editorTextarea.scrollTop
    // Loop through the search results and draw a rectangle for each one
    for (let index of currentSearchResults) {
      // Get the row and column of the index
      let row = fileContent.substr(0, index).split('\n').length
      let col = index - fileContent.lastIndexOf('\n', index - 1)
      // Get the x and y coordinates of the rectangle
      let x = ctx.measureText(fileContent.split('\n')[row - 1].slice(0, col)).width + padding
      let y = (row - 1) * lineHeight + padding - scrollTop
      // Get the width and height of the rectangle
      let w = ctx.measureText(input).width
      let h = lineHeight
      // Draw the rectangle
      ctx.fillRect(x, y, w, h)
    }
    // Set the background image of the editor textarea to the canvas
    editorTextarea.style.backgroundImage = 'url(' + canvas.toDataURL() + ')'
  } else {
    // Clear the background image of the editor textarea
    editorTextarea.style.backgroundImage = 'none'
  }
}

document.addEventListener('keydown', (event) => {

  if (event.ctrlKey && event.code === 'KeyS') {
    if (event.shiftKey) {
      console.log('Save As');
      ipcRenderer.send('message', 'save-as');
    } else {
      console.log('Save');
      ipcRenderer.send('message', 'save');
    }
    event.preventDefault();
  }
});


function startBlank() {
  currentFilePath = null
  currentFileContent = ''
  editorTextarea.value = ''
  filename.textContent = 'Untitled'
  changes.textContent = 'New File'
  updateTotalSize()
  updateRowCol()
  resetSearch()
  document.title = 'Untitled - Prismblue'
  title.textContent = 'Untitled - Prismblue'
}

// Function to add the current state to the action history
function addToHistory() {
  // If the current state is the same as the last state, then don't add it to the history
  lastSession = {
    content: editorTextarea.value,
    selectionStart: editorTextarea.selectionStart,
    selectionEnd: editorTextarea.selectionEnd,
    filePath: currentFilePath
  }

  if (lastSession.content === currentFileContent) {
    return
  }

  if (lastSession.filePath === null || lastSession.filePath === undefined || lastSession.filePath === '') {
    lastSession.filePath = 'Untitled'
  }

  // Save that to "session.json"
  fs.writeFileSync('session.json', JSON.stringify(lastSession))
}

function loadHistory(){
  let lastSession = {}
  try {
    // Load the last session from "session.json"
    lastSession = JSON.parse(fs.readFileSync('session.json', 'utf8'))
  } catch (err) {
    console.log(err)
    openModal(failedRestore)
    return;
  }

  // If the last session is the same as the current session, then don't load it
  if (lastSession.content === editorTextarea.value) {
    openModal(restoreAlreadyThere)
    return
  }

  try {
      // If the last session is not null, then load it
      if (lastSession) {
        currentFilePath = lastSession.filePath
        currentFileContent = lastSession.content
        editorTextarea.value = lastSession.content
        filename.textContent = lastSession.filePath
        changes.textContent = 'File Opened'
        updateTotalSize()
        updateRowCol()
        resetSearch()
      } else {
        console.log('No last session found')
      }
  } catch (err) {
    console.log(err)
    openModal(failedRestore)
    return;
  }
}

// Whenever the value of the editor textarea changes, add the current state to the action history
editorTextarea.addEventListener('keyup', addToHistory);

function undo() {
  document.execCommand('undo');
}

function redo() {
  document.execCommand('redo');
}

// Handle the undo button click event
undoButton.addEventListener('click', undo);

// Handle the redo button click event
redoButton.addEventListener('click', redo);

runButton.addEventListener('click', () => {
  // For now we only support python
  // Check if the file is saved
  if (currentFilePath === null) {
    openModal(unsavedFile)
    return
  }
  if (currentFilePath.split('.').pop() !== 'py') {
    openModal(unsupportedLanguage)
    return
  }
  if (changes.textContent === 'Unsaved Changes') {
    openModal(unsavedFile)
    return
  }
  // Run the python script
  ipcRenderer.send('message', 'run-py|||' + currentFilePath)
}
);
