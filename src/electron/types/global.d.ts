import { IpcMainEvent } from 'electron';

// global.d.ts
export { };

declare global {
    interface Window {
        electronAPI: {
            // Endpoints for Node's fs file functions
            existsAsync: (filepath: string) => Promise<boolean>;
            readFileAsync: (filePath: string, encoding: BufferEncoding) => Promise<string>;
            writeFileAsync: (file: fs.PathOrFileDescriptor, data: string) => Promise<void>;

            // RPM sockets data sending
            listen: (port: number, ipaddr: string) => Promise<boolean>;
            stopListen: (port: number, ipaddr: string) => void;
            sendData: (port: number, ipaddr: string, data: string) => void;

            openAsset: (asset: string) => void;
        };
    }
}
