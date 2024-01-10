// Modules to communicate with main process
const { ipcRenderer, remote } = require('electron')

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

// Variables to store the current state
let currentFilePath = null // The path of the current file
let currentFileContent = '' // The content of the current file
let currentTheme = 'light' // The current theme
let currentFont = 'Courier New' // The current font
let currentFontSize = 16 // The current font size
let currentStatusBar = true // The current status bar visibility
let currentSearchIndex = -1 // The current index of the search result
let currentSearchResults = [] // The current array of the search results

// Add event listeners to the menu buttons
fileButton.addEventListener('click', () => {
  togglePanel(filePanel)
})

editButton.addEventListener('click', () => {
  togglePanel(editPanel)
})

viewButton.addEventListener('click', () => {
  togglePanel(viewPanel)
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

// Add event listeners to the modals
findModal.addEventListener('click', (event) => {
  if (event.target.className === 'modal') {
    closeModal(findModal)
  }
})

fontModal.addEventListener('click', (event) => {
  if (event.target.className === 'modal') {
    closeModal(fontModal)
  }
})

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

// Handle the file-opened event from the main process
ipcRenderer.on('file-opened', (event, fileName, fileContent) => {
  currentFilePath = fileName
  currentFileContent = fileContent
  editorTextarea.value = fileContent
  filename.textContent = fileName
  changes.textContent = 'Saved'
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
    changes.textContent = 'Saved'
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
  changes.textContent = 'Saved'
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
    changes.textContent = 'Saved'
  } else {
    changes.textContent = 'Unsaved'
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
    document.body.style.backgroundColor = '#333'
    document.body.style.color = '#eee'
    editorTextarea.style.backgroundColor = '#222'
    editorTextarea.style.color = '#eee'
    toggleThemeButton.innerHTML = '<i class="fas fa-adjust"></i> Toggle Theme (Dark)'
  } else {
    currentTheme = 'light'
    document.body.style.backgroundColor = '#fff'
    document.body.style.color = '#333'
    editorTextarea.style.backgroundColor = '#fff'
    editorTextarea.style.color = '#333'
    toggleThemeButton.innerHTML = '<i class="fas fa-adjust"></i> Toggle Theme (Light)'
  }
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
  if (input && replaceText) {
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
function replaceAll() {
  let input = findInput.value;
  let replaceText = replaceInput.value;
  if (input && replaceText) {
    if (currentSearchResults.length > 0) {
      // Get the file content
      let fileContent = editorTextarea.value;
      // Replace all the input text with the replace text
      fileContent = fileContent.split(input).join(replaceText); // Use split and join for global replacement
      editorTextarea.value = fileContent;
      // Update the current file content and the changes status
      currentFileContent = fileContent;
      updateChanges();
      // Reset the search results and the search index
      resetSearch();
    }
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
