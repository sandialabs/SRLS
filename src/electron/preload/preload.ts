// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
import { contextBridge, ipcRenderer } from 'electron'
import EventEmitter from 'events';
import * as fs from 'fs';
const path = require('path');

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector: any, text: any) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  existsSync: (filepath: string) => fs.existsSync(filepath),
  readFile: (path: fs.PathOrFileDescriptor, options: ({
    encoding: BufferEncoding;
    flag?: string | undefined;
} & EventEmitter.Abortable) | BufferEncoding, callback: (err: NodeJS.ErrnoException | null, data: string) => void) => fs.readFile(path, options, callback),
  readFileSync: (filePath: string, encoding: BufferEncoding) => fs.readFileSync(filePath, encoding),
  writeFileSync: (file: fs.PathOrFileDescriptor, data: string) => fs.writeFileSync(file, data),
  mkdir: (path: fs.PathLike, callback: fs.NoParamCallback) => fs.mkdir(path, callback)
})