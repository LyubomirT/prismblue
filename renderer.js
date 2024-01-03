// This is the renderer.js file for the renderer process
const { ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')

// Get the DOM elements
const projectName = document.getElementById('project-name')
const fileList = document.getElementById('file-list')
const fileName = document.getElementById('file-name')
const runButton = document.getElementById('run-button')
const codeArea = document.getElementById('code-area')
const outputData = document.getElementById('output-data')
const status = document.getElementById('status')

// Initialize the CodeMirror editor
const editor = CodeMirror.fromTextArea(codeArea, {
  lineNumbers: true,
  theme: 'monokai'
})

editor.setSize('100%', '100%')

// Set the initial values
let projectPath = null
let currentFile = null
let unsavedChanges = false

// This function updates the file list based on the project path
function updateFileList () {
  // Clear the file list
  fileList.innerHTML = ''

  // Read the files in the project folder
  fs.readdir(projectPath, (err, files) => {
    if (err) {
      console.log(err)
    } else {
      // Loop through the files
      for (const file of files) {
        // Create a list item for each file
        const li = document.createElement('li')
        li.textContent = file
                // Add a click listener to the list item
                li.addEventListener('click', () => {
                    // Open the file
                    openFile(path.join(projectPath, file))
                  })
                  // Append the list item to the file list
                  fileList.appendChild(li)
                }
              }
            })
          }
          
// This function opens a file and displays its content in the editor
function openFile (file) {
// Check if there are unsaved changes
if (unsavedChanges) {
    // Ask the user if they want to save the changes
    if (confirm('Do you want to save the changes?')) {
    // Save the changes
    saveFile()
    }
}
// Read the file content
fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
    console.log(err)
    } else {
    // Set the current file
    currentFile = file
    // Set the file name
    fileName.textContent = path.basename(file)
    // Set the editor value
    editor.setValue(data)
    // Set the unsaved changes flag to false
    unsavedChanges = false
    // Set the status
    status.textContent = 'File opened'
    // Check if the file is a python file
    if (file.endsWith('.py')) {
        // Enable the run button
        runButton.disabled = false
        // Set the editor mode to python
        editor.setOption('mode', 'python')
    } else {
        // Disable the run button
        runButton.disabled = true
        // Set the editor mode to null
        editor.setOption('mode', null)
    }
    }
})
}

// This function saves the current file with the editor content
function saveFile () {
// Check if there is a current file
if (currentFile) {
    // Get the editor content
    const data = editor.getValue()
    // Write the content to the file
    fs.writeFile(currentFile, data, (err) => {
    if (err) {
        console.log(err)
    } else {
        // Set the unsaved changes flag to false
        unsavedChanges = false
        // Set the status
        status.textContent = 'File saved'
    }
    })
}
}

// Listen for the project-selected event from the main process
ipcRenderer.on('project-selected', (event, path) => {
    console.log(path)
    // Set the project path
    projectPath = path
    // Set the project name
    projectName.textContent = path.split('\\').pop()
    // Update the file list
    updateFileList()
    // Clear the editor
    editor.setValue('')
    // Clear the output
    outputData.textContent = ''
    // Set the file name
    fileName.textContent = 'Untitled'
    // Disable the run button
    runButton.disabled = true
    // Set the status
    status.textContent = 'Project opened'
})

// Listen for the output-data event from the main process
ipcRenderer.on('output-data', (event, data) => {
// Append the data to the output
outputData.textContent += data
})

// Listen for the change event on the editor
editor.on('change', () => {
// Set the unsaved changes flag to true
unsavedChanges = true
// Set the status
status.textContent = 'Unsaved changes'
})

// Listen for the click event on the run button
runButton.addEventListener('click', () => {
// Check if there are unsaved changes
if (unsavedChanges) {
    // Save the file
    saveFile()
}
// Clear the output
outputData.textContent = ''
// Send the run-python event to the main process
ipcRenderer.send('run-python', currentFile)
})

