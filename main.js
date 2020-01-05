const { app, BrowserWindow, ipcMain } = require('electron')
const exec = require('child_process').exec;
const process = require('process');
const Store = require('electron-store');

let window;
const store = new Store();

function createWindow() {
    window = new BrowserWindow({ 
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true,
            backgroundThrottling: false
        }
    });

    window.loadURL(`file://${__dirname}/dist/index.html`);
    window.on('closed', function () {
        window = null;
    });

    // Uncomment for devTools
    // window.webContents.openDevTools()
}

app.on('ready', function () {
    createWindow();
});

app.on('window-all-closed', function () {
    app.quit();
});

app.on('activate', function () {
    createWindow();
});

ipcMain.on('get-data', (event, arg) => {
    const localIp = store.get('localIp');

    if(process.platform === 'win32') {
        pingWindows(localIp, event);
    }
    
    if(process.platform === 'darwin' || process.platform === 'linux') {  
        pingDarwinLinux(localIp, event);
    }
});

ipcMain.on('get-stored-ip', (event, arg) => {
    const ip = store.get('ip');
    event.reply('reply-stored-ip', ip);
});

ipcMain.on('send-input-ip', (event, arg) => {
    store.set('ip', arg);
    storeLocalIp(arg);
});

function pingDarwinLinux(localIp, event) {
    for(let i = 1; i < 250; i += 5) {
        exec(`for ip in $(seq ${i} ${i+4}); do ping -c 1 -W 10 ${localIp}$ip; done`);
    }

    execute(`for ip in $(seq 250 254); do ping -c 1 -W 10 ${localIp}$ip; done`, (output) => {
        execute('arp -a', (result) => {
            const record = findRecord(result, 'cc:50:e3:2c:76:a8', '\n');
            const openBracket = record.indexOf('(');
            const closeBracket = record.indexOf(')');
            const ip = record.slice(openBracket + 1, closeBracket);

            storeIp(event, ip);
        });
    });
}

function pingWindows(localIp, event) {
    for(let i = 1; i < 250; i += 5) {
        exec(`FOR /L %i IN (${i},1,${i+4}) DO ping -n 1 -w 10 ${localIp}%i`);
    }

    execute(`FOR /L %i IN (250,1,254) DO ping -n 1 -w 10 ${localIp}%i`, (output) => {
        execute('arp -a', (result) => {
            const record = findRecord(result, 'cc-50-e3-2c-76-a8', '\r');
            const trimedRecord = record.replace(/\s/g, '');
            const endIndex = trimedRecord.indexOf('c');
            const ip = trimedRecord.slice(0, endIndex);

            storeIp(event, ip);
        });
    });
}

function execute(command, callback) {
    exec(command, (error, stdout, stderr) => { 
        callback(stdout); 
    });
};

function storeIp(event, ip) {
    store.set('ip', ip);
    storeLocalIp(ip);
    event.reply('reply-data', ip);
}

function storeLocalIp(ip) {
    const lastDot = ip.lastIndexOf('.');
    const localIp = ip.slice(0, lastDot + 1);
    store.set('localIp', localIp);
};

function findRecord(result, mac, separator) {
    const splitResult = result.split(separator);
    let record = '';
    for(let iterator of splitResult) {
        if(iterator.includes(mac)) {
            record = iterator;
            break;
        }
    }
    return record;
}
