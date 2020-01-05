const { app, BrowserWindow, ipcMain } = require('electron')
const exec = require('child_process').exec;
const process = require('process');
const Store = require('electron-store');

let window;
const store = new Store();

function createWindow() {
    // window = new BrowserWindow({
    //     fullscreen: true
    // })

    window = new BrowserWindow({ 
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true,
            backgroundThrottling: false
        }
    });

    window.loadURL(`file://${__dirname}/dist/index.html`)

    // window.webContents.openDevTools()

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
    const localIp = store.get('localIp');
    console.log('localIp');
    console.log(localIp);

    if(process.platform === 'win32') {
        for(let i = 1; i < 250; i += 5) {
            exec(`FOR /L %i IN (${i},1,${i+4}) DO ping -n 1 -w 10 ${localIp}%i`);
        }

        execute(`FOR /L %i IN (250,1,254) DO ping -n 1 -w 10 ${localIp}%i`, (output) => {
            execute('arp -a', (result) => {
                const splitResult = result.split('\r');
                let record = '';
                for(let iterator of splitResult) {
                    if(iterator.includes('cc-50-e3-2c-76-a8')) {
                        record = iterator;
                        break;
                    }
                }

                const trimedRecord = record.replace(/\s/g, '');
                const endIndex = trimedRecord.indexOf('c');
                const ip = trimedRecord.slice(0, endIndex);

                store.set('ip', ip);
                storeLocalIp(ip);
                event.reply('reply-data', ip);
            });
        });
        
    }
    
    if(process.platform === 'darwin' || process.platform === 'linux') {  
        for(let i = 1; i < 250; i += 5) {
            exec(`for ip in $(seq ${i} ${i+4}); do ping -c 1 -W 10 ${localIp}$ip; done`);
        }

        execute(`for ip in $(seq 250 254); do ping -c 1 -W 10 ${localIp}$ip; done`, (output) => {
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
                const ip = record.slice(openBracket + 1, closeBracket);

                store.set('ip', ip);
                storeLocalIp(ip);
                event.reply('reply-data', ip);
            });
        });
    }
});

ipcMain.on('get-stored-ip', (event, arg) => {
    const ip = store.get('ip');
    event.reply('reply-stored-ip', ip);
});

ipcMain.on('send-input-ip', (event, arg) => {
    console.log('arg');
    console.log(arg);

    store.set('ip', arg);
    storeLocalIp(arg);
});

function storeLocalIp(ip) {
    const lastDot = ip.lastIndexOf('.');
    const localIp = ip.slice(0, lastDot + 1);
    store.set('localIp', localIp);
}