import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { Network, NetworkConfig } from './network';

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

let vitePort: number = 5173;
const devServer: string = `http://localhost:${vitePort}`;
const _network: Network = new Network();

function createWindow() {
    console.log("__dirname:", __dirname);
    console.log("VITE_DEV_SERVER_URL:", process.env.VITE_DEV_SERVER_URL);
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("All env vars:", Object.keys(process.env).filter(k => k.includes('VITE')));

    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            contextIsolation: true,
        }
    });

    // Apparently this isn't always set properly. Let's use a
    // different way to identify if we're in dev or prod.
    const devServerUrl = process.env.VITE_DEV_SERVER_URL;
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
    console.log("Inside file-exists");
    const exists: boolean = existsSync(filepath);
    console.log(`file-exists -- file ${filepath} ${exists ? 'exists' : 'does not exist'}`);
    return exists;
});

ipcMain.handle('read-file', async (event: Electron.IpcMainInvokeEvent, filepath: string, encoding: BufferEncoding) => {
    console.log("Inside read-file");
    try {
        return await readFile(filepath, encoding);
    }
    catch(error) {
        console.error("Error in 'read-file'", error);
        throw error;
    }
});

ipcMain.handle('write-file', async (event: Electron.IpcMainInvokeEvent, filepath: string, data: string) => {
    console.log("Inside write-file");
    try {
        await writeFile(filepath, data, 'utf-8');
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

ipcMain.handle('network-stop-listening', async (event: Electron.IpcMainInvokeEvent, port: number, ipaddr: string): boolean => {
    let config = new NetworkConfig(ipaddr, port);
    return _network.stopListening(config);
});

ipcMain.handle("network-send-data", async (event: Electron.IpcMainInvokeEvent, port: number, ipaddr: string, data: string): boolean => {
    let config = new NetworkConfig(ipaddr, port);
    return _network.sendData(config, data);
});
