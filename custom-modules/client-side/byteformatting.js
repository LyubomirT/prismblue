// Format bytes to human readable units
function formatBytes(bytes) {
    if (bytes === 0) return '0 bytes'
    const k = 1024
    const dm = 2
    const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }