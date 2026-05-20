import { contextBridge, ipcRenderer } from 'electron';
import { ConnectionStats } from './network';

console.log("In preload.ts");

// Expose a method to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    existsAsync: (filepath: string): Promise<boolean> => ipcRenderer.invoke('file-exists', filepath),
    readFileAsync: (filepath: string, encoding: BufferEncoding): Promise<string> => ipcRenderer.invoke('read-file', filepath, encoding),
    writeFileAsync: (filepath: string, data: string): Promise<void> => ipcRenderer.invoke('write-file', filepath, data),

    listen: (port: number, ipaddr: string): Promise<boolean> => ipcRenderer.invoke('network-listen', port, ipaddr),
    stopListen: (port: number, ipaddr: string) => ipcRenderer.invoke('network-stop-listening', port, ipaddr),
    sendData: (port: number, ipaddr: string, data: string) => ipcRenderer.invoke('network-send-data', port, ipaddr, data),

    // Provide a callback function that takes a ConnectionStats so you can be
    // notified when someone connects/disconnects from one of the listen ports.
    // It returns a callback function that should be called when you no longer
    // wish to be notifed when connection stats change.
    onConnectionsChanged: (cb: (stats: ConnectionStats) => void): (() => void) => {
        let listener = (_e: unknown, stats: ConnectionStats) => cb(stats);
        ipcRenderer.on('network-connections-changed', listener);
        return () => ipcRenderer.removeListener('network-connections-changed', listener);
    },

    openAsset: (asset: string) => ipcRenderer.invoke('open-asset', asset),
});
