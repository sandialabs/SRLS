"use strict";
const electron = require("electron");
console.log("In preload.ts");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Example method to send a message to the main process
  sendMessage: (message) => {
    electron.ipcRenderer.send("message-channel", message);
  },
  // Example method to receive a message from the main process
  onMessage: (callback) => {
    electron.ipcRenderer.on("message-channel", (_event, message) => {
      callback(message);
    });
  },
  // Example method to get the current version of the app
  getVersion: () => electron.ipcRenderer.invoke("get-version"),
  existsSync: (filepath) => electron.ipcRenderer.invoke("file-exists", filepath),
  readFileSync: (filepath, encoding) => electron.ipcRenderer.invoke("read-file", filepath, encoding),
  writeFileSync: (filepath, data) => electron.ipcRenderer.invoke("write-file", filepath, data)
});
