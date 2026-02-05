"use strict";
const electron = require("electron");
const url = require("url");
const path = require("path");
const fs = require("fs");
const promises = require("fs/promises");
const __filename$1 = url.fileURLToPath(require("url").pathToFileURL(__filename).href);
const __dirname$1 = path.dirname(__filename$1);
let vitePort = 5173;
const devServer = `http://localhost:${vitePort}`;
function createWindow() {
  console.log("__dirname:", __dirname$1);
  console.log("VITE_DEV_SERVER_URL:", process.env.VITE_DEV_SERVER_URL);
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("All env vars:", Object.keys(process.env).filter((k) => k.includes("VITE")));
  const win = new electron.BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname$1, "../preload/index.js"),
      contextIsolation: true
    }
  });
  process.env.VITE_DEV_SERVER_URL;
  const isDev = !electron.app.isPackaged;
  if (isDev) {
    console.log(`DEVELOPMENT -- Loading URL: ${devServer}`);
    win.loadURL(devServer);
    win.webContents.openDevTools();
  } else {
    const filePath = path.join(__dirname$1, "../renderer/index.html");
    console.log(`PRODUCTION -- Loading file ${filePath}`);
    win.loadFile(filePath);
  }
}
electron.app.whenReady().then(() => {
  console.log("whenReady");
  createWindow();
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    electron.app.quit();
  }
});
electron.app.on("activate", () => {
  console.log("activate");
  if (electron.BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
electron.ipcMain.handle("file-exists", async (event, filepath) => {
  console.log("Inside file-exists");
  const exists = fs.existsSync(filepath);
  console.log(`file-exists -- file ${filepath} ${exists ? "exists" : "does not exist"}`);
  return exists;
});
electron.ipcMain.handle("read-file", async (event, filepath, encoding) => {
  console.log("Inside read-file");
  try {
    return await promises.readFile(filepath, encoding);
  } catch (error) {
    cosole.error("Error in 'read-file'", error);
    throw error;
  }
});
electron.ipcMain.handle("write-file", async (event, filepath, data) => {
  console.log("Inside write-file");
  try {
    await writeFile(filepath, data, "utf-8");
    return { success: true };
  } catch (error) {
    console.error("Error in write-file", error);
    throw error;
  }
});
