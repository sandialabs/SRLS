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
// let sockets: { [id: string]: net.Socket } = {};
let sockets: net.Socket[] = [];

ipcMain.handle('start-server', (event: Electron.IpcMainInvokeEvent, port: number, ipaddr: string): Promise<any> => {
    let id: string = 'undefined';
    let idNum: number = 0;

    server = net.createServer((socket) => {
  // 'connection' listener.
  console.log('client connected');
          // When creating a new socket
        
        id = ipaddr + ':' + port.toString();
        sockets[idNum] = socket;


  socket.on('end', () => {
    console.log('client disconnected');
    delete sockets[idNum]; // Remove the socket object when the connection is closed
  });
  socket.write('hello\r\n');

//   setTimeout(() => {
//     c.write('hello\r\n');
//   }, 5000); // 5000 milliseconds = 5 seconds

  socket.pipe(socket);
  
});
    let response = "Old Response";

    // server.listen(port, ipaddr, () => {
    //     console.log(`Also listening on ${JSON.stringify(server?.address())}`);
    //     response = JSON.stringify(server?.address());
    // });
    return new Promise((resolve, reject) => {
        server?.listen(port, ipaddr, () => {
            const addressInfo = server?.address() as net.AddressInfo;
            const response = JSON.stringify(addressInfo);
            const id: string = addressInfo?.address + ':' + (addressInfo?.port).toString(); // Use optional chaining to access the port property
            let firstSocket = Object.values(sockets)[0] || null;
            console.log("Socket: ", JSON.stringify(firstSocket));
            console.log("Sockets 2: ", JSON.stringify(sockets));
            console.log("Internal ID:" + id);
            
            
            resolve(id);
        });
    });

    // console.log(`Server started on ${ipaddr}:${port}`);
    // event.sender.send('start-server-response', 'Server started successfully');
    // // return "Response from main process";
    // console.log("Address:", server.address()?.toString());
    // console.log("Address 2:", response);
    // console.log("ID:", id);
    // console.log("Sockets:", JSON.stringify(sockets));
    // return id;
});

ipcMain.handle('stop-server', (event: Electron.IpcMainInvokeEvent, port: number, ipaddr: string): Promise<any> => {
    console.log("Sockets b: ", JSON.stringify(sockets));
  // Stop the server here
  if (server) {
    server.close();
  }
  return Promise.resolve(); // Return a resolved promise
});

ipcMain.handle("get-server", (event: Electron.IpcMainInvokeEvent, port: number, ipaddr: string): Promise<any> => {
    console.log("Get server called with: ", ipaddr);
    let idNum: number = 0;
    
    if (sockets && ipaddr) {
      // Use the find method to locate the socket
      if (sockets[idNum] !== undefined && sockets[idNum] !== null) {
        console.log("Socket found: " + sockets[idNum]);
      }
    }
    console.log("Socketa: ", JSON.stringify(sockets));
    console.log("1 Socket: ", JSON.stringify(sockets[idNum]));
    
    return Promise.resolve("test test test"); // Return a resolved promise
  }
);




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

