function toggleFullScreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }