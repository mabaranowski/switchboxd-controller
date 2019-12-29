const { app, BrowserWindow } = require('electron')
// const exec = require('child_process').exec;

let window;

function createWindow() {
    // window = new BrowserWindow({
    //     fullscreen: true
    // })

    window = new BrowserWindow({ 
        width: 1200, height: 800,
        webPreferences: {
            nodeIntegration: true,
            backgroundThrottling: false
        }
    });

    window.loadURL(`file://${__dirname}/dist/index.html`)

    window.webContents.openDevTools()

    window.webContents.send('hello', 'HelloWorld!')

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

// function execute(command, callback) {
//     exec(command, (error, stdout, stderr) => { 
//         callback(stdout); 
//     });
// };

// execute('arp -a', (output) => {
//     console.log(output);
// });
