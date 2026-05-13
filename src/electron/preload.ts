import { contextBridge, ipcRenderer } from 'electron';

console.log("In preload.ts");

// Expose a method to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    existsAsync: (filepath: string): Promise<boolean> => ipcRenderer.invoke('file-exists', filepath),
    readFileAsync: (filepath: string, encoding: BufferEncoding): Promise<string> => ipcRenderer.invoke('read-file', filepath, encoding),
    writeFileAsync: (filepath: string, data: string): Promise<void> => ipcRenderer.invoke('write-file', filepath, data),

    listen: (port: number, ipaddr: string): Promise<boolean> => ipcRenderer.invoke('network-listen', port, ipaddr),
    stopListen: (port: number, ipaddr: string) => ipcRenderer.invoke('network-stop-listening', port, ipaddr),
    sendData: (port: number, ipaddr: string, data: string) => ipcRenderer.invoke('network-send-data', port, ipaddr, data),

    openAsset: (asset: string) => ipcRenderer.invoke('open-asset', asset),
});
