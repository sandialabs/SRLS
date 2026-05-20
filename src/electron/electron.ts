import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { fileURLToPath } from 'url';
import path, { dirname, join } from 'path';
import fs from 'fs';
import os from 'os';
import { readFile, writeFile } from 'fs/promises';
import { ConnectionStats, Network, NetworkConfig } from './network';

// make a directory for replay data if one doesn't exist
// if (window.electronAPI && !window.electronAPI.existsSync("Replay")) {
//     window.electronAPI.mkdir("Replay", (err: any) => {
//         if (err)
//             console.error(String(err));
//         return;
//     });
// }


// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const __windowStatePath = path.join(app.getPath('userData'), 'window-state.json');

interface IWindowState extends Electron.Rectangle
{
    isMaximized?: boolean;
}

let vitePort: number = 5173;
const devServer: string = `http://localhost:${vitePort}`;
const _network: Network = new Network();

function createWindow() {
    console.log("__dirname:", __dirname);

    const state: IWindowState = loadWindowState();

    const win = new BrowserWindow({
        width: state?.width ?? 1800,
        height: state?.height ?? 1200,
        x: state?.x,
        y: state?.y,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            contextIsolation: true,
        }
    });

    // Debounce so it only saves after moving/resizing has paused for a time
    let t: NodeJS.Timeout | undefined;
    let scheduleSave = () => {
        if(t)
            clearTimeout(t);
        t = setTimeout(() => saveWindowState(win), 300);
    }

    win.on('resize', scheduleSave);
    win.on('move', scheduleSave);
    win.on('close', () => saveWindowState(win));

    attachNetworkToWindow(win);

    if(state?.isMaximized)
        win.maximize();

    // Apparently this isn't always set properly. Let's use a
    // different way to identify if we're in dev or prod.
    const isDev = !app.isPackaged;

    if (isDev) {
        console.log(`DEVELOPMENT -- Loading URL: ${devServer}`);
        win.loadURL(devServer);
        win.webContents.openDevTools();
    } else {
        const filePath = join(__dirname, '../renderer/index.html');
        console.log(`PRODUCTION -- Loading file ${filePath}`);
        win.loadFile(filePath);
    }
}

function loadWindowState(): IWindowState {
    try {
        return JSON.parse(fs.readFileSync(__windowStatePath, 'utf-8'))
    } catch {
        return {
            height: 1200,
            width: 1800,
            x: 0,
            y: 0,
            isMaximized: false
        };
    }
}

function saveWindowState(window: BrowserWindow) {
    const bounds = window.getBounds();
    const state: IWindowState = {
        ...bounds,
        isMaximized: window.isMaximized()
    };
    fs.writeFileSync(__windowStatePath, JSON.stringify(state), 'utf-8');
}

function attachNetworkToWindow(window: BrowserWindow) {
    _network.on('connections-changed', (stats: ConnectionStats) => {
        window.webContents.send('network-connections-changed', stats);
    })
}

app.whenReady().then(() => {
    console.log("whenReady");

    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    console.log("activate");
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle('file-exists', async (event: Electron.IpcMainInvokeEvent, filepath: string) => {
    const userPath = path.join(app.getPath('userData'), filepath);
    console.log(`Inside file-exists, looking for ${userPath}`);
    const exists: boolean = fs.existsSync(userPath);
    console.log(`file-exists -- file ${userPath} ${exists ? 'exists' : 'does not exist'}`);
    return exists;
});

ipcMain.handle('read-file', async (event: Electron.IpcMainInvokeEvent, filepath: string, encoding: BufferEncoding) => {
    const userPath = path.join(app.getPath('userData'), filepath);
    console.log(`Inside read-file, looking for ${userPath}`);
    try {
        return await readFile(userPath, encoding);
    }
    catch (error) {
        console.error("Error in 'read-file'", error);
        throw error;
    }
});

ipcMain.handle('write-file', async (event: Electron.IpcMainInvokeEvent, filepath: string, data: string) => {
    const userPath = path.join(app.getPath('userData'), filepath);
    console.log(`Inside write-file, looking for ${userPath}`);
    try {
        await writeFile(userPath, data, 'utf-8');
        return { success: true };
    } catch (error) {
        console.error("Error in write-file", error)
        throw error;
    }
});

ipcMain.handle('network-listen', async (event: Electron.IpcMainInvokeEvent, port: number, ipaddr: string): Promise<boolean> => {
    let config = new NetworkConfig(ipaddr, port);
    console.log(`electron.ts network-listen on ${config}`, _network);
    return _network.listen(config);
});

ipcMain.handle('network-stop-listening', async (event: Electron.IpcMainInvokeEvent, port: number, ipaddr: string): Promise<boolean> => {
    let config = new NetworkConfig(ipaddr, port);
    return _network.stopListening(config);
});

ipcMain.handle("network-send-data", async (event: Electron.IpcMainInvokeEvent, port: number, ipaddr: string, data: string): Promise<boolean> => {
    let config = new NetworkConfig(ipaddr, port);

    // Append "\r\n" to everything sent through the socket
    return _network.sendData(config, data + "\r\n");
});

// ipcMain.handle("open-asset", async (event: Electron.IpcMainInvokeEvent, asset: string) => {
//     // The __dirname variable will be either
//     //      "D:\Projects\Development\RPMSimulator\dist_electron"
//     // or
//     //      "C:\Users\wrhumph\AppData\Local\Programs\srls\resources\app.asar"
//     console.log("ipc.on('open-asset'): ", asset);
//     console.log('__dirname is "' + __dirname + '"');
//     let assets_dir = find_assets(__dirname);
//     let filepath = path.join(assets_dir, asset);
//     console.log('filepath is "' + filepath + '"');
//     console.log("Opening " + filepath);
//     shell.openPath(filepath);
// });

ipcMain.handle('open-asset', async (_event, assetName: string) => {
    // Where the asset is bundled (adjust to your build layout)
    const bundledPath = app.isPackaged
        ? path.join(process.resourcesPath, 'assets', assetName) // if you ship assets as extraResources
        : path.join(process.cwd(), 'assets', assetName);

    console.log(`open-asset: ${bundledPath}`);

    if (!fs.existsSync(bundledPath)) {
        throw new Error(`Asset not found at: ${bundledPath}`);
    }

    // Copy to a real filesystem location
    const outPath = path.join(os.tmpdir(), assetName);

    console.log(`copyFileSync: ${bundledPath} -> ${outPath}`);

    fs.copyFileSync(bundledPath, outPath);

    const err = await shell.openPath(outPath);
    if (err) {
        console.error(err);
        throw new Error(err);
    }

    return true;
})

// function find_assets(dir_name: string): string {
//     console.log('Looking for Assets in "' + dir_name + '"');
//     let dir = dir_name;
//     for (let i = 0; i < 4; i++) {
//         let tpath = path.join(dir, "Assets");
//         console.log('    checking for "' + tpath + '"');
//         if (existsSync(tpath)) {
//             console.log('   Found in "' + dir + '"');
//             return tpath;
//         }
//         dir = path.dirname(dir);
//     }
//     return dir_name; // I give up
// }
