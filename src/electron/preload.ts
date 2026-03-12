import { contextBridge, ipcRenderer } from 'electron';

console.log("In preload.ts");

// Expose a method to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {

    // Example method to send a message to the main process
    sendMessage: (message: string) => {
        // console.log(`sendMessage: ${message}`);
        ipcRenderer.send('message-channel', message);
    },

    // Example method to receive a message from the main process
    onMessage: (callback: (message: string) => void) => {
        ipcRenderer.on('message-channel', (_event: Electron.IpcRendererEvent, message: any) => {
            // console.log(`onMessage: event ${event}, message ${message}`);
            callback(message);
        });
    },

    // Example method to get the current version of the app
    getVersion: () => ipcRenderer.invoke('get-version'),

    existsSync: (filepath: string): Promise<boolean> => ipcRenderer.invoke('file-exists', filepath),
    readFileSync: (filepath: string, encoding: BufferEncoding): Promise<string> => ipcRenderer.invoke('read-file', filepath, encoding),
    writeFileSync: (filepath: string, data: string): Promise<void> => ipcRenderer.invoke('write-file', filepath, data),

    listen: (port: number, ipaddr: string): Promise<boolean> => ipcRenderer.invoke('network-listen', port, ipaddr),
    stopListen: (port: number, ipaddr: string) => ipcRenderer.invoke('network-stop-listening', port, ipaddr),
    sendData: (port: number, ipaddr: string, data: string) => ipcRenderer.invoke('network-send-data', port, ipaddr, data),
});


// // All of the Node.js APIs are available in the preload process.
// // It has the same sandbox as a Chrome extension.
// import { contextBridge, ipcRenderer } from 'electron'
// import EventEmitter from 'events';
// import * as fs from 'fs';
// const path = require('path');

// // import * as net from "net";

// window.addEventListener('DOMContentLoaded', () => {
//   const replaceText = (selector: any, text: any) => {
//     const element = document.getElementById(selector)
//     if (element) element.innerText = text
//   }

//   for (const dependency of ['chrome', 'node', 'electron']) {
//     replaceText(`${dependency}-version`, process.versions[dependency])
//   }
// })

// contextBridge.exposeInMainWorld('electronAPI', {

//   // Endpoints for Node's fs file functions
//   openFile: () => ipcRenderer.invoke('dialog:openFile'),
//   existsSync: (filepath: string) => fs.existsSync(filepath),
//   readFile: (path: fs.PathOrFileDescriptor, options: ({
//     encoding: BufferEncoding;
//     flag?: string | undefined;
// } & EventEmitter.Abortable) | BufferEncoding, callback: (err: NodeJS.ErrnoException | null, data: string) => void) => fs.readFile(path, options, callback),
//   readFileSync: (filePath: string, encoding: BufferEncoding) => fs.readFileSync(filePath, encoding),
//   writeFileSync: (file: fs.PathOrFileDescriptor, data: string) => fs.writeFileSync(file, data),
//   mkdir: (path: fs.PathLike, callback: fs.NoParamCallback) => fs.mkdir(path, callback),

//   // createServer: (connectionListener?: (socket: net.Socket) => void) => net.createServer(connectionListener),
//   // listen: (port?: number, hostname?: string, listeningListener?: () => void) => net.Server.l .listen(port, hostname, listeningListener),

//   // Endpoints for ipcRenderer: https://stackoverflow.com/questions/63615355/how-to-import-ipcrenderer-in-vue-js-dirname-is-not-defined
//   send: async (channel: string, port: number, ipaddr: string): Promise<any> => {
//     // if (validChannels.includes(channel)) {
//     //   ipcRenderer.send(channel, data)
//     // }
//     // return new Promise<any>((resolveCallback) => {
//     //   ipcRenderer.send(channel, port, ipaddr);
//     //   // ipcRenderer.once(`${channel}-response`, (event, response) => {
//     //   ipcRenderer.once('start-server-response', (event, response) => {
//     //     console.log("Returned response", response);
//     //     resolveCallback(response);
//     //   });
//     // });

// let response: any = await ipcRenderer.invoke(channel, port, ipaddr);
// console.log("Returned response", JSON.stringify(response));
    
//     return response;
//       // ipcRenderer.once(`${channel}-response`, (event, response) => {
//       // return "Return something";

//   },
//   receive: (channel: string, func: any) => {
//   //   let validChannels = ['nameOfElectronChannel'] // <-- Array of all ipcMain Channels used in the electron
//   //   if (validChannels.includes(channel)) {
//   //     // Deliberately strip event as it includes `sender`
//   //     ipcRenderer.on(channel, (event, ...args) => func(...args))
//   //   }
//     ipcRenderer.on(channel, (event, ...args) => func(...args))
//   }
// });

// contextBridge.exposeInMainWorld('net', require('net'));