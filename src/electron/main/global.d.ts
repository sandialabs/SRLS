// global.d.ts
export {};

declare global {
  interface Window {
    electronAPI: {
      existsSync: (filepath: string) => boolean;
      readFileSync: (filePath: string, encoding: BufferEncoding) => string;
      writeFileSync: (file: fs.PathOrFileDescriptor, data: string) => void;
      mkdir: (path: fs.PathLike, callback: fs.NoParamCallback) => void;
      // Add other methods as needed. For example:
      // readFile: (path: string) => Promise<string>;
      // writeFile: (path: string, data: string) => Promise<void>;
    };
  }
}