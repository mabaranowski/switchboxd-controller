const { app, BrowserWindow } = require('electron')

let window;

function createWindow() {
    window = new BrowserWindow({
        fullscreen: true
    })

    window.loadURL(`file://${__dirname}/dist/index.html`)

    window.webContents.openDevTools()

    window.on('closed', function () {
        window = null
    })
}

app.on('ready', function () {
    createWindow()
})

app.on('window-all-closed', function () {
    app.quit()
})

app.on('activate', function () {
    createWindow()
})
