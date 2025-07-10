import { join } from 'path';
import {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
    IpcMainEvent
} from 'electron';
//const electron = require("electron");
import * as remoteMain from '@electron/remote/main';


import * as net from "net";

remoteMain.initialize();

const isDev = process.env.npm_lifecycle_event === "app:dev" ? true : false;


async function handleFileOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog({ title: "Open File" })
    if (!canceled) {
        return filePaths[0]
    }
}

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: join(__dirname, '../preload/preload.js'),
            nodeIntegration: true, // This is required for @electron/remote
            contextIsolation: true,    // Disables context isolation
        },
    });

    remoteMain.enable(mainWindow.webContents);


// import { Server } from 'node:net';

let server: net.Server | null = null;

ipcMain.on('start-server', (event: IpcMainEvent, port: number, ipaddr: string): any => {
    // server = net.createServer((socket) => {
    //     console.log(socket);
        
    //     event.sender.send('start-server-response', 'Server started successfully');
    // });
      if (server) {
        event.sender.send('start-server-response', 'Server is already running');
        return;
    }
    server = net.createServer((c) => {
  // 'connection' listener.
  console.log('client connected');
  c.on('end', () => {
    console.log('client disconnected');
  });
  c.write('hello\r\n');
  c.pipe(c);
});
    server.listen(port, ipaddr);
    console.log('Server started on ${ipaddr}:${port}');
    event.sender.send('start-server-response', 'Server started successfully');
});

ipcMain.on('stop-server', () => {
  if (server) {
    server.close();
  }
});



    // and load the index.html of the app.
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');// Open the DevTools.
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(join(__dirname, '../../index.html'));
    }
    // mainWindow.loadURL( //this doesn't work on macOS in build and preview mode
    //     isDev ?
    //     'http://localhost:3000' :
    //     join(__dirname, '../../index.html')
    // );
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    ipcMain.handle('dialog:openFile', handleFileOpen)
    createWindow()
    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});