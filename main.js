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

//TODO ip to external environment variables
ipcMain.on('get-data', (event, arg) => {
    if(process.platform === 'win32') {
        //? Check on windows machine
        exec(`FOR /L %ip IN (46,1,50) DO ping -n 1 -w 10 192.168.8.%ip`); 

        // for(let i = 1; i < 250; i += 5) {
        //     exec(`FOR /L %ip IN (1,1,254) DO ping -n 1 -w 10 192.168.8.%ip`);
        // }

        
    }
    
    if(process.platform === 'darwin' || process.platform === 'linux') {  
        for(let i = 1; i < 250; i += 5) {
            exec(`for ip in $(seq ${i} ${i+4}); do ping -c 1 -W 10 192.168.8.$ip; done`);
        }

        execute('for ip in $(seq 250 254); do ping -c 1 -W 10 192.168.8.$ip; done', (output) => {
            execute('arp -a', (result) => {
                const splitResult = result.split('\n');
                let record = '';
                for(let iterator of splitResult) {
                    if(iterator.includes('cc:50:e3:2c:76:a8')) {
                        record = iterator;
                        break;
                    }
                }

                const openBracket = record.indexOf('(');
                const closeBracket = record.indexOf(')');
                const ip = record.slice(openBracket+1, closeBracket);

                event.reply('reply-data', ip);
            });
        });
    }
});
