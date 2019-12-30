const { app, BrowserWindow, ipcMain } = require('electron')
const exec = require('child_process').exec;
const process = require('process');

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

function execute(command, callback) {
    exec(command, (error, stdout, stderr) => { 
        callback(stdout); 
    });
};


ipcMain.on('get-data', (event, arg) => {
    if(process.platform === "win32") {
        execute('arp -a', (output) => {
            event.reply('reply-data', output);
        });
    }
    //TODO ip to external environment variables
    if(process.platform === "darwin") {  
        execute('for ip in $(seq 45 55); do ping -c 1 -W 10 192.168.8.$ip; done', (output) => {
           event.reply('reply-data', output);
        });
    }
});

// execute('arp -a', (output) => {
//     console.log(output);
//     ipcMain.on('get-data', (event, arg) => {
//         event.reply('reply-data', output);
//     });
// });
