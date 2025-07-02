import { IpcMainEvent } from 'electron';

// global.d.ts
export {};

declare global {
  interface Window {
    electronAPI: {
      // Endpoints for Node's fs file functions
      existsSync: (filepath: string) => boolean;
      readFileSync: (filePath: string, encoding: BufferEncoding) => string;
      writeFileSync: (file: fs.PathOrFileDescriptor, data: string) => void;
      mkdir: (path: fs.PathLike, callback: fs.NoParamCallback) => void;
      // Add other methods as needed. For example:
      // readFile: (path: string) => Promise<string>;
      // writeFile: (path: string, data: string) => Promise<void>;

      // Endpoints for ipcRenderer
      send: (channel: string, port: number, ipaddr: string) => void;
      receive: (channel: string, func: any) => void;

      // createServer: (connectionListener?: (socket: Socket) => void) => Server;
      // listen: (port?: number, hostname?: string, listeningListener?: () => void) => Server;
      // net: typeof import('net');
      net: typeof import('node:net');
    };
  }
}
